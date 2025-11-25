
export enum TulipColor {
  COMMON = 'Common', // Green
  VICEROY = 'Viceroy', // Blue
  AUGUSTUS = 'Augustus', // Red
}

export enum GamePhase {
  SETUP = 'SETUP',
  EVENT_DRAW = 'EVENT_DRAW',
  PLAYER_ACTIONS = 'PLAYER_ACTIONS',
  ROUND_END = 'ROUND_END',
  GAME_OVER = 'GAME_OVER',
}

export enum ActionType {
  BUY = 'BUY',
  SELL = 'SELL',
  LOAN = 'LOAN',
  REPAY = 'REPAY',
  SHORT = 'SHORT',
  PASS = 'PASS',
}

export enum BotPersonality {
  CONSERVATIVE = 'Conservative', // 稳健
  BALANCED = 'Balanced',         // 平衡
  AGGRESSIVE = 'Aggressive',     // 激进
}

export interface Player {
  id: number;
  name: string;
  isAI: boolean;
  personality?: BotPersonality; // AI Only
  cash: number;
  inventory: {
    [TulipColor.COMMON]: number;
    [TulipColor.VICEROY]: number;
    [TulipColor.AUGUSTUS]: number;
  };
  shorts: {
    [TulipColor.COMMON]: number;
    [TulipColor.VICEROY]: number;
    [TulipColor.AUGUSTUS]: number;
  };
  loans: number; // Number of red loan cards
  isBankrupt: boolean;
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  type: 'MANIA' | 'PANIC' | 'POLICY' | 'CRASH';
  heatEffect?: number; // Change in heat level
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  marketHeat: number; // 1-10
  supply: {
    [TulipColor.COMMON]: number;
    [TulipColor.VICEROY]: number;
    [TulipColor.AUGUSTUS]: number;
  };
  maxSupply: {
    [TulipColor.COMMON]: number;
    [TulipColor.VICEROY]: number;
    [TulipColor.AUGUSTUS]: number;
  };
  eventDeck: EventCard[];
  discardPile: EventCard[];
  currentEvent: EventCard | null;
  phase: GamePhase;
  log: string[];
  remainingActions: number; // 2 AP per turn
  roundCount: number;
  gavelHolderIndex: number;
  winner: number | null;
  sellingForbidden: boolean; // For Black Death event
}

export const INITIAL_CASH = 100;
export const AP_PER_TURN = 2;
