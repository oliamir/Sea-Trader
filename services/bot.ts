import { PlayerState, GameEvent, Good } from '../types';
import { GOODS, LOCATIONS } from '../constants';

export const decideBotAction = (
    state: PlayerState,
    prices: Record<string, number>,
    currentEvent: GameEvent | null
): { action: string, payload?: any } | null => {

    // 1. Handle Events
    if (currentEvent) {
        // Always continue/ignore events to proceed
        if (currentEvent.type === 'SHIPYARD') return { action: 'EVENT', payload: 'IGNORE' };
        return { action: 'EVENT' };
    }

    // 2. Handle Game Over
    if (state.isGameOver) {
        return { action: 'RESTART' };
    }

    // 3. Trading Logic
    // Sell Strategy: If price is good (> 10% above base), sell everything
    for (const good of GOODS) {
        const owned = state.inventory[good.id] || 0;
        const price = prices[good.id];

        if (owned > 0 && price > good.basePrice * 1.05) {
            return { action: 'TRADE', payload: { goodId: good.id, amount: owned, isBuy: false } };
        }
    }

    // Buy Strategy: If price is low (< 10% below base) and we have space, buy max
    const currentLoad = Object.values(state.inventory).reduce((a, b) => a + b, 0);
    const space = state.maxCapacity - currentLoad;

    if (space > 5) { // Leave some buffer
        // Find best deal
        let bestGood: Good | null = null;
        let minRatio = 0.9; // Must be at least 10% discount

        for (const good of GOODS) {
            const price = prices[good.id];
            const ratio = price / good.basePrice;
            if (ratio < minRatio) {
                minRatio = ratio;
                bestGood = good;
            }
        }

        if (bestGood) {
            const price = prices[bestGood.id];
            const maxCanBuy = Math.floor(state.cash / price);
            const amount = Math.min(space, maxCanBuy);

            if (amount > 0) {
                return { action: 'TRADE', payload: { goodId: bestGood.id, amount, isBuy: true } };
            }
        }
    }

    // 4. Travel Strategy
    // Filter out current location
    const targets = LOCATIONS.filter(l => l.id !== state.location);
    const randomTarget = targets[Math.floor(Math.random() * targets.length)];

    return { action: 'TRAVEL', payload: randomTarget.id };
};
