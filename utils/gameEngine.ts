
import { GameState, GamePhase, Player, ActionType, TulipColor, AP_PER_TURN, INITIAL_CASH, EventCard, BotPersonality } from '../types';
import { BASE_PRICES, PREMIUM_TABLE, getZoneIndex, CRASH_PRICES, CARD_DEFINITIONS, DECK_COMPOSITION, TULIP_NAMES_CN } from '../constants';

// --- Helpers ---

const createDeck = (): EventCard[] => {
    // 1. Create the pool of 15 Normal cards
    let normalCards: EventCard[] = [];
    
    // Helper to push copies
    const addCards = (id: string, count: number) => {
        const cardDef = CARD_DEFINITIONS.find(c => c.id === id);
        if (cardDef) {
            for (let i = 0; i < count; i++) normalCards.push({ ...cardDef, id: `${id}-${i}` });
        }
    };

    addCards('rumor', DECK_COMPOSITION.rumor);
    addCards('variety', DECK_COMPOSITION.variety);
    addCards('french', DECK_COMPOSITION.french);
    addCards('rational', DECK_COMPOSITION.rational);
    addCards('rot', DECK_COMPOSITION.rot);
    addCards('plague', DECK_COMPOSITION.plague);
    addCards('injection', DECK_COMPOSITION.injection);
    addCards('margin', DECK_COMPOSITION.margin);

    // Shuffle Normal Cards
    normalCards = normalCards.sort(() => Math.random() - 0.5);

    // 2. Split into Top (8) and Bottom (7)
    const topStack = normalCards.slice(0, 8);
    const bottomStack = normalCards.slice(8);

    // 3. Add 3 Unique Crash cards to Bottom Stack
    const auctionDef = CARD_DEFINITIONS.find(c => c.id === 'crash_auction')!;
    const haarlemDef = CARD_DEFINITIONS.find(c => c.id === 'crash_haarlem')!;
    const courtDef = CARD_DEFINITIONS.find(c => c.id === 'crash_court')!;

    const crashCards = [
        { ...auctionDef, id: 'crash_auction' },
        { ...haarlemDef, id: 'crash_haarlem' },
        { ...courtDef, id: 'crash_court' }
    ];
    
    // Shuffle Bottom (7 normal + 3 crash)
    const finalBottom = [...bottomStack, ...crashCards].sort(() => Math.random() - 0.5);

    // 4. Combine: Top on Bottom
    return [...topStack, ...finalBottom];
};

// Returns Base Price Only (For Selling/Shorting)
export const calculateBasePrice = (state: GameState, color: TulipColor): number => {
    if (state.marketHeat > 10) return 99999;
    const heat = Math.min(Math.max(state.marketHeat, 1), 10);
    return BASE_PRICES[heat][color];
};

// Returns Base + Premium (For Buying)
export const calculateBuyPrice = (state: GameState, color: TulipColor): number => {
    const base = calculateBasePrice(state, color);
    const currentSupply = state.supply[color];
    const maxSupply = state.maxSupply[color];
    const zone = getZoneIndex(currentSupply, maxSupply);
    const premium = PREMIUM_TABLE(color, zone);
    return base + premium;
};

// --- Initial State ---

export const getInitialState = (playerCount: number): GameState => {
    // Helper to assign personality cyclically
    const getPersonality = (idx: number): BotPersonality => {
        const types = [BotPersonality.CONSERVATIVE, BotPersonality.BALANCED, BotPersonality.AGGRESSIVE];
        return types[(idx - 1) % types.length];
    };

    const getPersonalityName = (p: BotPersonality) => {
        switch(p) {
            case BotPersonality.CONSERVATIVE: return '稳健';
            case BotPersonality.BALANCED: return '平衡';
            case BotPersonality.AGGRESSIVE: return '激进';
        }
    };

    const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
        const isAI = i > 0;
        const personality = isAI ? getPersonality(i) : undefined;
        const name = isAI 
            ? `机器人 ${i} [${getPersonalityName(personality!)}]` 
            : "我 (交易员)";

        return {
            id: i,
            name,
            isAI,
            personality,
            cash: INITIAL_CASH,
            inventory: {
                [TulipColor.COMMON]: 0,
                [TulipColor.VICEROY]: 0,
                [TulipColor.AUGUSTUS]: 0,
            },
            shorts: {
                [TulipColor.COMMON]: 0,
                [TulipColor.VICEROY]: 0,
                [TulipColor.AUGUSTUS]: 0,
            },
            loans: 0,
            isBankrupt: false,
        };
    });

    const viceroyCount = playerCount > 0 ? playerCount * 5 : 20;
    
    return {
        players,
        currentPlayerIndex: 0,
        gavelHolderIndex: 0,
        marketHeat: 1,
        supply: {
            [TulipColor.COMMON]: 30,
            [TulipColor.VICEROY]: viceroyCount,
            [TulipColor.AUGUSTUS]: 5,
        },
        maxSupply: {
            [TulipColor.COMMON]: 30,
            [TulipColor.VICEROY]: viceroyCount,
            [TulipColor.AUGUSTUS]: 5,
        },
        eventDeck: createDeck(),
        discardPile: [],
        currentEvent: null,
        phase: GamePhase.SETUP,
        log: ['游戏设置完成，市场开市。'],
        remainingActions: 0,
        roundCount: 1,
        winner: null,
        sellingForbidden: false,
    };
};

// --- Actions ---

export type GameAction = 
  | { type: 'START_GAME'; playerCount: number }
  | { type: 'DRAW_EVENT' }
  | { type: 'PERFORM_ACTION'; action: ActionType; color?: TulipColor }
  | { type: 'END_TURN' }
  | { type: 'PASS_GAVEL'; betMore: boolean };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'START_GAME':
            const startState = getInitialState(action.playerCount);
            
            // If resetting to setup (playerCount 0), return state as is (SETUP phase)
            if (action.playerCount === 0) {
                return startState;
            }

            // Modified: Skip EVENT_DRAW for the first round.
            // Go directly to PLAYER_ACTIONS.
            return {
                ...startState,
                phase: GamePhase.PLAYER_ACTIONS,
                remainingActions: AP_PER_TURN,
                log: [...startState.log, "第一轮：无事件，直接开始交易。"]
            };

        case 'DRAW_EVENT': {
            const [card, ...rest] = state.eventDeck;
            if (!card) return state;

            const newLog = [...state.log, `事件: ${card.title} (${card.description})`];
            let newHeat = state.marketHeat;
            let newPlayers = [...state.players];
            let newSupply = { ...state.supply };
            let sellingForbidden = false;

            // Process Crash Cards
            // 1. Failed Auction (False Crash)
            if (card.id === 'crash_auction') {
                newHeat = Math.max(1, newHeat - 3);
                newLog.push("流拍导致市场热度暴跌！(热度 -3)。但交易仍在继续...");
                
                // Continue game normally
                return {
                    ...state,
                    eventDeck: rest,
                    currentEvent: card,
                    discardPile: [card, ...state.discardPile],
                    marketHeat: newHeat,
                    phase: GamePhase.PLAYER_ACTIONS,
                    currentPlayerIndex: state.gavelHolderIndex,
                    remainingActions: AP_PER_TURN,
                    log: newLog,
                    roundCount: state.roundCount + 1,
                    sellingForbidden: false
                };
            }

            // 2. Haarlem Panic (Standard Crash)
            if (card.id === 'crash_haarlem') {
                return calculateEndGame(state, "哈勒姆大恐慌！泡沫破裂，标准清算。", false);
            }

            // 3. Court Annuls Contracts (Loans Forgiven)
            if (card.id === 'crash_court') {
                return calculateEndGame(state, "最高法院宣布合约无效！债务被免除。", true);
            }

            // --- Specific Card Logic for Normal Cards ---
            
            // 1. Basic Heat Effects (Applied before logic that depends on Price)
            if (card.heatEffect) {
                // Special Case: Rational Voice (id: rational) only works if Heat > 7
                if (card.id.startsWith('rational')) {
                    if (newHeat > 7) {
                        newHeat -= 2;
                        newLog.push("理性的声音为市场降温。");
                    } else {
                         newLog.push("理性的声音被忽视 (热度未超过 L7)。");
                    }
                } else {
                    newHeat += card.heatEffect;
                }
            }

            // Clamp Heat immediately so prices are accurate for Bulb Rot
            if (newHeat > 10) newHeat = 10;
            if (newHeat < 1) newHeat = 1;

            // 2. Bulb Rot (Strict Maintenance Fee)
            if (card.id.startsWith('rot')) {
                // Determine Fees based on NEW heat
                const commonBase = BASE_PRICES[newHeat][TulipColor.COMMON];
                const viceroyBase = BASE_PRICES[newHeat][TulipColor.VICEROY];

                newPlayers = newPlayers.map(p => {
                    let logParts: string[] = [];
                    let pCash = p.cash;
                    let pInventory = { ...p.inventory };

                    // Function to process maintenance for a specific flower type
                    const processMaintenance = (color: TulipColor, fee: number) => {
                        const count = pInventory[color];
                        if (count <= 0) return;

                        const totalCost = count * fee;
                        if (pCash >= totalCost) {
                            pCash -= totalCost;
                            logParts.push(`支付${count}张${TULIP_NAMES_CN[color]}维护费(${totalCost})`);
                        } else {
                            // Can't afford all. Pay what you can, discard the rest.
                            const affordableCount = Math.floor(pCash / fee);
                            const discardCount = count - affordableCount;
                            const paidCost = affordableCount * fee;

                            pCash -= paidCost;
                            pInventory[color] -= discardCount;
                            // Add discarded flowers back to supply
                            newSupply[color] += discardCount;
                            
                            logParts.push(`支付${affordableCount}张, 弃置${discardCount}张${TULIP_NAMES_CN[color]}抵债`);
                        }
                    };

                    processMaintenance(TulipColor.COMMON, commonBase);
                    processMaintenance(TulipColor.VICEROY, commonBase); // Common/Viceroy pay Common Price
                    processMaintenance(TulipColor.AUGUSTUS, viceroyBase); // Augustus pays Viceroy Price

                    if (logParts.length > 0) {
                        newLog.push(`${p.name}: ${logParts.join(', ')}。`);
                    }

                    return { ...p, cash: pCash, inventory: pInventory };
                });
            }

            // 3. New Variety: Upgrade 1 Common -> 1 Viceroy
            if (card.id.startsWith('variety')) {
                newPlayers = newPlayers.map(p => {
                    if (p.inventory[TulipColor.COMMON] > 0) {
                        return {
                            ...p,
                            inventory: {
                                ...p.inventory,
                                [TulipColor.COMMON]: p.inventory[TulipColor.COMMON] - 1,
                                [TulipColor.VICEROY]: p.inventory[TulipColor.VICEROY] + 1
                            }
                        };
                    }
                    return p;
                });
                newLog.push("所有玩家免费升级了一株杂色郁金香。");
            }

            // 4. French Noble Orders: Augustus Holders +500, Shorters -500
            if (card.id.startsWith('french')) {
                newPlayers = newPlayers.map(p => {
                    let cashChange = 0;
                    if (p.inventory[TulipColor.AUGUSTUS] > 0) cashChange += 500;
                    if (p.shorts[TulipColor.AUGUSTUS] > 0) cashChange -= 500;
                    
                    if (cashChange !== 0) {
                        newLog.push(`${p.name} 资金变动 ${cashChange} (法国订单)。`);
                    }
                    return { ...p, cash: p.cash + cashChange };
                });
            }

            // 5. Central Bank Injection: +200 everyone
            if (card.id.startsWith('injection')) {
                newPlayers = newPlayers.map(p => ({ ...p, cash: p.cash + 200 }));
                newLog.push("央行注入流动性。");
            }

            // 6. Margin Call: Pay 200 per Loan, 500 per Short
            if (card.id.startsWith('margin')) {
                newPlayers = newPlayers.map(p => {
                    const loanFine = p.loans * 200;
                    const shortCount = p.shorts[TulipColor.COMMON] + p.shorts[TulipColor.VICEROY] + p.shorts[TulipColor.AUGUSTUS];
                    const shortFine = shortCount * 500;
                    const totalFine = loanFine + shortFine;
                    
                    if (totalFine > 0) {
                        newLog.push(`${p.name} 支付了 ${totalFine} 保证金。`);
                    }
                    return { ...p, cash: p.cash - totalFine };
                });
            }

            // 7. Black Death: No selling
            if (card.id.startsWith('plague')) {
                sellingForbidden = true;
                newLog.push("受黑死病影响，本轮禁止卖出。");
            }

            // Check L10 Meltdown
            if (newHeat >= 10) {
                 newLog.push("市场熔断！热度达到 L10。所有空头被强制平仓。");
                 newPlayers = newPlayers.map(p => {
                     let cost = 0;
                     const totalShorts = p.shorts[TulipColor.COMMON] + p.shorts[TulipColor.VICEROY] + p.shorts[TulipColor.AUGUSTUS];
                     if (totalShorts > 0) {
                         cost = totalShorts * 5000;
                         newLog.push(`${p.name} 被强制平仓 (损失 ${cost})。`);
                     }
                     return {
                         ...p,
                         shorts: { [TulipColor.COMMON]: 0, [TulipColor.VICEROY]: 0, [TulipColor.AUGUSTUS]: 0 },
                         cash: p.cash - cost
                     };
                 });
            }

            return {
                ...state,
                eventDeck: rest,
                currentEvent: card,
                discardPile: [card, ...state.discardPile],
                marketHeat: newHeat,
                players: newPlayers,
                supply: newSupply,
                phase: GamePhase.PLAYER_ACTIONS,
                currentPlayerIndex: state.gavelHolderIndex, // Gavel holder starts the turn after event
                remainingActions: AP_PER_TURN,
                log: newLog,
                roundCount: state.roundCount + 1, // INCREMENT ROUND ON EVENT DRAW
                sellingForbidden
            };
        }

        case 'PERFORM_ACTION': {
            const player = state.players[state.currentPlayerIndex];
            if (state.remainingActions <= 0) return state;

            let newPlayers = [...state.players];
            let newSupply = { ...state.supply };
            let newHeat = state.marketHeat;
            let logMsg = '';
            
            const tulipName = action.color ? TULIP_NAMES_CN[action.color] : '';

            if (action.action === ActionType.BUY && action.color) {
                const price = calculateBuyPrice(state, action.color);
                
                if (state.supply[action.color] <= 0) return state; 
                if (player.cash < price) return state; 

                // L8+ Augustus Buy Rule: Heat +1
                if (action.color === TulipColor.AUGUSTUS && state.marketHeat >= 8) {
                    newHeat = Math.min(10, newHeat + 1);
                    logMsg = " (热度 +1!)";
                }

                newPlayers[state.currentPlayerIndex] = {
                    ...player,
                    cash: player.cash - price,
                    inventory: {
                        ...player.inventory,
                        [action.color]: player.inventory[action.color] + 1
                    }
                };
                newSupply[action.color]--;
                logMsg = `${player.name} 花费 ${price} 购入 ${tulipName}${logMsg}。`;
            }

            if (action.action === ActionType.SELL && action.color) {
                const price = calculateBasePrice(state, action.color); // SELL AT BASE PRICE
                
                if (state.sellingForbidden) return state; // Block if Black Death
                if (player.inventory[action.color] <= 0) return state;

                // L8+ Augustus Sell Rule: Heat -1
                if (action.color === TulipColor.AUGUSTUS && state.marketHeat >= 8) {
                     newHeat = Math.max(1, newHeat - 1);
                     logMsg = " (热度 -1)";
                }

                newPlayers[state.currentPlayerIndex] = {
                    ...player,
                    cash: player.cash + price, 
                    inventory: {
                        ...player.inventory,
                        [action.color]: player.inventory[action.color] - 1
                    }
                };
                newSupply[action.color]++;
                logMsg = `${player.name} 以 ${price} 卖出 ${tulipName}${logMsg}。`;
            }

            if (action.action === ActionType.LOAN) {
                if (state.marketHeat < 3) return state; // L3 Lock
                if (player.loans >= 2) return state; 
                newPlayers[state.currentPlayerIndex] = {
                    ...player,
                    cash: player.cash + 1000,
                    loans: player.loans + 1
                };
                logMsg = `${player.name} 申请了贷款 (+1000)。`;
            }

            if (action.action === ActionType.REPAY) {
                if (player.loans <= 0 || player.cash < 1100) return state;
                newPlayers[state.currentPlayerIndex] = {
                    ...player,
                    cash: player.cash - 1100,
                    loans: player.loans - 1
                };
                logMsg = `${player.name} 偿还了贷款 (-1100)。`;
            }

             if (action.action === ActionType.SHORT && action.color) {
                 const price = calculateBasePrice(state, action.color); // SHORT AT BASE PRICE
                 
                 if (state.marketHeat < 5) return state; // L5 Lock
                 if (state.supply[action.color] <= 0) return state;
                 if (player.cash < price) return state; // Collateral check (Must have cash equal to base price)

                 newPlayers[state.currentPlayerIndex] = {
                     ...player,
                     cash: player.cash + price,
                     shorts: {
                         ...player.shorts,
                         [action.color]: player.shorts[action.color] + 1
                     }
                 };
                 logMsg = `${player.name} 做空了 ${tulipName}。`;
             }

            // Meltdown check again if heat changed during action
            if (newHeat >= 10 && state.marketHeat < 10) {
                // Trigger Meltdown Logic (Simplified duplication of above)
                 newPlayers = newPlayers.map(p => {
                     const totalShorts = p.shorts[TulipColor.COMMON] + p.shorts[TulipColor.VICEROY] + p.shorts[TulipColor.AUGUSTUS];
                     if (totalShorts > 0) {
                         return {
                             ...p,
                             shorts: { [TulipColor.COMMON]: 0, [TulipColor.VICEROY]: 0, [TulipColor.AUGUSTUS]: 0 },
                             cash: p.cash - (totalShorts * 5000)
                         };
                     }
                     return p;
                 });
                 logMsg += " 市场熔断！";
            }

            return {
                ...state,
                players: newPlayers,
                supply: newSupply,
                marketHeat: newHeat,
                remainingActions: state.remainingActions - 1,
                log: [...state.log, logMsg]
            };
        }

        case 'END_TURN': {
            const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
            
            // If we loop back to the Gavel Holder, the round (or betting cycle) is done for now
            if (nextIndex === state.gavelHolderIndex) {
                 return {
                     ...state,
                     phase: GamePhase.ROUND_END,
                     log: [...state.log, "所有玩家行动结束。执锤人进行决断。"]
                 };
            }

            return {
                ...state,
                currentPlayerIndex: nextIndex,
                remainingActions: AP_PER_TURN,
                log: [...state.log, `轮到: ${state.players[nextIndex].name}`]
            };
        }

        case 'PASS_GAVEL': {
            // Updated Logic: Gavel ALWAYS rotates, regardless of decision.
            // This ensures the first player token moves every round.
            const nextGavel = (state.gavelHolderIndex + 1) % state.players.length;
            
            const actionMsg = action.betMore 
                ? `${state.players[state.gavelHolderIndex].name} 选择加注！新事件即将发生...`
                : `${state.players[state.gavelHolderIndex].name} 选择休市。`;

            return {
                ...state,
                phase: GamePhase.EVENT_DRAW,
                gavelHolderIndex: nextGavel,
                // roundCount is handled in DRAW_EVENT
                log: [...state.log, actionMsg, `执锤人变更为 ${state.players[nextGavel].name}。`]
            };
        }

        default:
            return state;
    }
};

const calculateEndGame = (state: GameState, reason: string, forgiveLoans: boolean): GameState => {
    const finalPlayers = state.players.map(p => {
        let netWorth = p.cash;
        
        // 1. Sell Inventory at Crash Prices
        netWorth += p.inventory[TulipColor.COMMON] * CRASH_PRICES[TulipColor.COMMON];
        netWorth += p.inventory[TulipColor.VICEROY] * CRASH_PRICES[TulipColor.VICEROY];
        netWorth += p.inventory[TulipColor.AUGUSTUS] * CRASH_PRICES[TulipColor.AUGUSTUS];

        // 2. Cover Shorts at Crash Prices (Winner!)
        // In a crash, you buy back at crash price. You already got the High Price cash earlier.
        // So we SUBTRACT the cost to close the position.
        netWorth -= p.shorts[TulipColor.COMMON] * CRASH_PRICES[TulipColor.COMMON];
        netWorth -= p.shorts[TulipColor.VICEROY] * CRASH_PRICES[TulipColor.VICEROY];
        netWorth -= p.shorts[TulipColor.AUGUSTUS] * CRASH_PRICES[TulipColor.AUGUSTUS];

        // 3. Repay Loans (Unless Forgiven)
        if (!forgiveLoans) {
            netWorth -= (p.loans * 1100);
        }

        return { ...p, cash: netWorth };
    });

    const winner = finalPlayers.reduce((prev, current) => (prev.cash > current.cash) ? prev : current);

    return {
        ...state,
        players: finalPlayers,
        phase: GamePhase.GAME_OVER,
        winner: winner.id,
        log: [...state.log, reason, `胜者是 ${winner.name} ，最终净资产: ${winner.cash} 盾！`]
    };
};
