import { GameState, ActionType, TulipColor, BotPersonality } from '../types';
import { calculateBuyPrice, calculateBasePrice } from './gameEngine';

interface PersonalityProfile {
    sellHeatThreshold: number; // At what heat level do I start panic selling?
    buyHeatLimit: number;      // I won't buy if heat is above this.
    loanAppetite: number;      // Max loans I'm willing to take.
    shortThreshold: number;    // Heat level required to consider shorting.
    cashReserve: number;       // Try to keep this much cash unless desperate.
}

const PROFILES: Record<BotPersonality, PersonalityProfile> = {
    [BotPersonality.CONSERVATIVE]: {
        sellHeatThreshold: 6, // Sells early to lock in profits
        buyHeatLimit: 3,      // Only buys when market is stable
        loanAppetite: 0,      // Never takes loans
        shortThreshold: 99,   // Never shorts (virtually)
        cashReserve: 100,     // Keeps cash safe
    },
    [BotPersonality.BALANCED]: {
        sellHeatThreshold: 8,
        buyHeatLimit: 6,
        loanAppetite: 1,      // Emergency loan only
        shortThreshold: 9,    // Shorts only at peak
        cashReserve: 50,
    },
    [BotPersonality.AGGRESSIVE]: {
        sellHeatThreshold: 10, // Rides the bubble til the end
        buyHeatLimit: 8,       // Buys even in mania
        loanAppetite: 2,       // Max leverage
        shortThreshold: 6,     // Shorts aggressively early
        cashReserve: 0,        // All in
    }
};

// Returns a GameAction or END_TURN for passing
export const getBotAction = (state: GameState): { type: 'PERFORM_ACTION'; action: ActionType; color?: TulipColor } | { type: 'END_TURN' } => {
    const player = state.players[state.currentPlayerIndex];
    const isSellingForbidden = state.sellingForbidden;
    
    // Safety check
    if (state.remainingActions <= 0) return { type: 'END_TURN' };

    // Get Profile (Default to Balanced if undefined for some reason)
    const profile = PROFILES[player.personality || BotPersonality.BALANCED];
    const heat = state.marketHeat;
    
    // --- 1. SURVIVAL MODE (Broke Check) ---
    // If we are effectively broke (Cash < Cheapest Flower Cost approx 40), we need liquidity.
    // Logic: Sell Inventory > Loan (if allowed/wanted) > Pass
    if (player.cash < 40) {
        
        // A. TRY SELL
        if (!isSellingForbidden) {
            // Sell expensive first to get max cash
            const sellOrder = [TulipColor.AUGUSTUS, TulipColor.VICEROY, TulipColor.COMMON];
            for (const color of sellOrder) {
                if (player.inventory[color] > 0) {
                    return { type: 'PERFORM_ACTION', action: ActionType.SELL, color };
                }
            }
        }

        // B. TRY LOAN (If within appetite and rules allow)
        if (state.marketHeat >= 3 && player.loans < profile.loanAppetite && player.loans < 2) {
             return { type: 'PERFORM_ACTION', action: ActionType.LOAN };
        }

        // C. FORCED PASS (Cannot act)
        return { type: 'END_TURN' };
    }

    // --- 2. PROFIT TAKING (High Heat) ---
    // If Heat > My Threshold, I want to sell my inventory.
    if (heat >= profile.sellHeatThreshold) {
        if (!isSellingForbidden) {
            // Dump inventory
            for (const color of [TulipColor.AUGUSTUS, TulipColor.VICEROY, TulipColor.COMMON]) {
                if (player.inventory[color] > 0) {
                     return { type: 'PERFORM_ACTION', action: ActionType.SELL, color };
                }
            }
        }
    }

    // --- 3. SHORT SELLING (Aggressive Tactics) ---
    // If Heat is high enough for my profile, I have cash for collateral, and I haven't shorted too much.
    if (heat >= profile.shortThreshold && heat >= 5) {
        // Aggressive bots prefer shorting Augustus/Viceroy for max profit
        const shortPrefs = [TulipColor.AUGUSTUS, TulipColor.VICEROY, TulipColor.COMMON];
        for (const color of shortPrefs) {
             const shortPrice = calculateBasePrice(state, color); // Short gains Base Price only
             const myShorts = player.shorts[color];
             const supplyAvailable = state.supply[color] > 0;
             
             // Simple heuristic: Don't short if I already have a position in this color (spread risk) unless Aggressive
             const positionLimit = player.personality === BotPersonality.AGGRESSIVE ? 3 : 1;

             if (player.cash >= shortPrice && supplyAvailable && myShorts < positionLimit) {
                 return { type: 'PERFORM_ACTION', action: ActionType.SHORT, color };
             }
        }
    }

    // --- 4. ACCUMULATION (Buying) ---
    // If Heat is within my buy limit.
    if (heat <= profile.buyHeatLimit) {
        
        // Buy Logic: Check supply and affordability.
        // Preference: Augustus > Viceroy > Common (Classic strategy)
        const buyPreferences = [TulipColor.AUGUSTUS, TulipColor.VICEROY, TulipColor.COMMON];
        
        for (const color of buyPreferences) {
            const buyPrice = calculateBuyPrice(state, color); // Buying costs Base + Premium
            const canAfford = player.cash >= (buyPrice + 10); // Keep a tiny buffer
            const available = state.supply[color] > 0;
            
            if (canAfford && available) {
                // Determine probability to buy based on AP and Personality
                // Aggressive bots buy almost always. Conservative bots hesitate.
                let buyChance = 0.5;
                if (player.personality === BotPersonality.AGGRESSIVE) buyChance = 0.9;
                if (player.personality === BotPersonality.CONSERVATIVE) buyChance = 0.3;

                // Ensure we use AP if we have full actions
                if (state.remainingActions === 2) buyChance += 0.2;

                if (Math.random() < buyChance) {
                    return { type: 'PERFORM_ACTION', action: ActionType.BUY, color };
                }
            }
        }
    }
    
    // --- 5. DEBT MANAGEMENT ---
    // If we have excess cash and loans, pay them off.
    // Conservative bots pay off immediately. Aggressive bots keep cash for plays.
    const loanRepayThreshold = player.personality === BotPersonality.CONSERVATIVE ? 1200 : 2500;
    
    if (player.cash > loanRepayThreshold && player.loans > 0) {
        return { type: 'PERFORM_ACTION', action: ActionType.REPAY };
    }

    // --- 6. IDLE / FALLBACK ---
    // If I'm Aggressive/Balanced and broke but couldn't sell (Black Death) and couldn't loan (Maxed)...
    // Or if I just decided not to buy anything.
    return { type: 'END_TURN' };
};

export const getBotGavelDecision = (state: GameState): boolean => {
    // True = Bet More (Draw Event), False = Rest (End Round)
    const player = state.players[state.gavelHolderIndex];
    const heat = state.marketHeat;
    const profile = PROFILES[player.personality || BotPersonality.BALANCED];

    // 1. If I am broke, I might want to end round to hope for 'Rest' logic or just chaos,
    // actually usually broke players want chaos (Bet More) unless they think crash is imminent.
    
    // 2. Heat Logic
    // If Heat is significantly above my sell threshold, I want the game to end or stabilize, I am scared.
    if (heat >= profile.sellHeatThreshold) return false; // Stop!

    // If Heat is low, I want to pump it.
    if (heat < profile.buyHeatLimit) return true; // Pump it!

    // Mid range: Aggressive players pump, Conservative players stop.
    if (player.personality === BotPersonality.AGGRESSIVE) return true;
    if (player.personality === BotPersonality.CONSERVATIVE) return false;

    return Math.random() > 0.5; // Balanced coin flip
};