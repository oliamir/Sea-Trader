
export type TimeOfDay = 'Morning' | 'Noon' | 'Evening';

export interface Location {
  id: string;
  name: string;
  imageEmoji: string;
  color: string;
}

export interface Good {
  id: 'copper' | 'wheat' | 'olives';
  name: string;
  icon: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  increment: number;
}

export interface PlayerState {
  cash: number;
  bankBalance: number;
  inventory: Record<string, number>;
  location: string;
  day: number; // 1 to 7
  timeOfDay: TimeOfDay;
  isGameOver: boolean;
}

export interface GameEvent {
  type: 'PIRATES' | 'STORM' | 'TREASURE' | 'SMOOTH_SAILING';
  title: string;
  message: string;
  outcome: {
    cashChange?: number;
    inventoryLoss?: boolean; // Lose percentage of goods
    turnDelay?: boolean;
  };
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export enum GameView {
  Market = 'MARKET',
  Travel = 'TRAVEL',
  Event = 'EVENT',
  GameOver = 'GAMEOVER',
  Bank = 'BANK',
  Sailing = 'SAILING'
}