import { produce } from 'immer'; // Optional, but good for state. We'll use simple spread for now.
import * as tf from '@tensorflow/tfjs';
import { PlayerState, GameEvent, TimeOfDay } from '../types.js';
import { GOODS, LOCATIONS, MAX_DAYS, INITIAL_CASH, INITIAL_CAPACITY } from '../constants.js';
import { generateGlobalPrices, getNextTime, getTravelDuration, generateTravelEvent } from '../gameEngine.js';

// Define Action Types
// 0-4: TRAVEL to Location (Israel, Egypt, Turkey, Lebanon, Italy)
// 5-7: BUY_MAX Good (Copper, Olives, Wheat)
// 8-10: SELL_ALL Good (Copper, Olives, Wheat)
// 11: SIT_STILL (Travel nowhere, just pass time/wait - simplified to simple 'Wait' or 'Stay')

export const ACTION_SIZE = 12;
export const STATE_SIZE =
    LOCATIONS.length + // Location One-Hot
    1 + // Day (Normalized)
    1 + // Cash (Normalized)
    3 + // Inventory Counts (Normalized)
    (LOCATIONS.length * 3); // Prices of all goods at all locations (or just current? Let's give FULL knowledge: God Mode for Bot)

// Actually, "God Mode" (knowing prices everywhere) makes it easier. 
// A realistic bot might only know current location prices. 
// Let's stick to REALISM: The bot only knows prices at CURRENT location + Last known prices?
// For simplicity V1: God Mode (All Prices Known) helps it learn "Buy Low Sell High" across map faster.

export class SeaTraderEnv {
    state: PlayerState;
    allPrices: Record<string, Record<string, number>>;
    currentEvent: GameEvent | null;

    // Normalization Constants
    MAX_CASH_NORM = 50000;
    MAX_INV_NORM = 100;
    MAX_PRICE_NORM = 200;

    constructor() {
        this.reset();
    }

    reset() {
        this.state = {
            cash: INITIAL_CASH,
            bankBalance: 0,
            loan: 0,
            inventory: { copper: 0, olives: 0, wheat: 0 },
            maxCapacity: INITIAL_CAPACITY,
            location: 'israel',
            day: 1,
            timeOfDay: 'Morning',
            isGameOver: false,
        };
        this.allPrices = generateGlobalPrices();
        this.currentEvent = null;
        return this.getNormalizedState();
    }

    // RETURNS: { nextState, reward, done, info }
    step(actionIndex: number) {
        let reward = 0;
        const startNetWorth = this.calculateNetWorth();
        let invalidMove = false;

        // --- EXECUTE ACTION ---
        const locationIdx = actionIndex; // 0-4

        if (actionIndex < LOCATIONS.length) {
            // === TRAVEL ===
            const destLoc = LOCATIONS[actionIndex];
            if (destLoc.id === this.state.location) {
                // Traveling to same location = WAIT/Visit Market
                // Tiny penalty for wasting time? - No, maybe waiting is good for bad prices.
                invalidMove = true; // Let's discourage "Travelling to here". Use a separate WAIT action?
                // Actually, let's treat "Travel to Self" as "Stay/Wait 1 turn".
                this.passTime(1);
            } else {
                // Actual Travel
                const turns = getTravelDuration(this.state.location, destLoc.id);
                // Handle Events (Synced with headless)
                const currentLoad = this.getLoad();
                const event = generateTravelEvent(currentLoad, this.state.maxCapacity);

                if (event.type !== 'SMOOTH_SAILING') {
                    // Apply Impact IMMEDIATELY
                    if (event.outcome.cashChange) this.state.cash += event.outcome.cashChange;
                    if (event.outcome.inventoryLoss) {
                        Object.keys(this.state.inventory).forEach(k => {
                            this.state.inventory[k] = Math.floor(this.state.inventory[k] * 0.8);
                        });
                    }
                }

                // Move
                this.passTime(turns); // This updates day/time/interest
                this.state.location = destLoc.id; // Update Location
                // Prices update *if* day changed (handled in passTime/check)
                // Actually `generateGlobalPrices` usually happens daily.
            }
        }
        else if (actionIndex >= 5 && actionIndex <= 7) {
            // === BUY MAX ===
            const goods = ['copper', 'olives', 'wheat'];
            const goodId = goods[actionIndex - 5];
            const price = this.allPrices[this.state.location][goodId];

            // Calculate Max Affordable & Capacity
            const maxAffordable = Math.floor(this.state.cash / price);
            const spaceAvailable = this.state.maxCapacity - this.getLoad();
            const amountToBuy = Math.min(maxAffordable, spaceAvailable);

            if (amountToBuy > 0) {
                this.state.cash -= amountToBuy * price;
                this.state.inventory[goodId] = (this.state.inventory[goodId] || 0) + amountToBuy;
            } else {
                invalidMove = true; // Tried to buy with no money/space
            }
        }
        else if (actionIndex >= 8 && actionIndex <= 10) {
            // === SELL ALL ===
            const goods = ['copper', 'olives', 'wheat'];
            const goodId = goods[actionIndex - 8];
            const price = this.allPrices[this.state.location][goodId];
            const amount = this.state.inventory[goodId] || 0;

            if (amount > 0) {
                this.state.cash += amount * price;
                this.state.inventory[goodId] = 0;
            } else {
                invalidMove = true; // Tried to sell nothing
            }
        } else {
            // === WAIT (11) ===
            this.passTime(1);
        }

        // --- CALCULATE REWARD ---
        const endNetWorth = this.calculateNetWorth();

        // 1. Basic Profit Reward
        reward += (endNetWorth - startNetWorth) / 100; // Scaled down

        // 2. Invalid Move Penalty (Small slap to teach rules)
        if (invalidMove) reward -= 5;

        // 3. Game Over / Winning
        let done = this.state.isGameOver;
        if (this.state.cash < 0) {
            reward -= 100; // Bankruptcy Bad
            done = true; // End early? Or let him suffer?
        }

        // Optional: Big Bonus for surviving with high score
        if (done && this.state.cash > 0) {
            reward += (endNetWorth / 1000);
        }

        return {
            nextState: this.getNormalizedState(),
            reward,
            done,
            info: { val: endNetWorth }
        };
    }

    // Helper: Logic to advance time
    passTime(turns: number) {
        const startDay = this.state.day;
        for (let i = 0; i < turns; i++) {
            if (this.state.isGameOver) break;
            const next = getNextTime(this.state.day, this.state.timeOfDay);

            // Interest
            this.state.bankBalance = Math.floor(this.state.bankBalance * 1.01);
            if (next.day > this.state.day) {
                this.state.loan = Math.floor(this.state.loan * 1.1); // 10% interest daily for simplicity or import const
            }

            this.state.day = next.day;
            this.state.timeOfDay = next.time;
            this.state.isGameOver = next.isGameOver;
        }
        // Rotate Prices if New Day
        if (this.state.day > startDay) {
            this.allPrices = generateGlobalPrices();
        }
    }

    getLoad() {
        return Object.values(this.state.inventory).reduce((a, b) => a + b, 0);
    }

    calculateNetWorth() {
        // Cash + Bank - Loan + Inventory Value (at current location prices)
        let invVal = 0;
        const prices = this.allPrices[this.state.location];
        for (const [g, count] of Object.entries(this.state.inventory)) {
            invVal += count * (prices[g] || 0);
        }
        return this.state.cash + this.state.bankBalance - this.state.loan + invVal;
    }

    getNormalizedState() {
        // Vector: [
        //   LocIsIsrael, LocIsEgypt, ..., (5)
        //   Day/30, 
        //   Cash/Max, 
        //   InvCopper/Max, InvOlive/Max, InvWheat/Max,
        //   PriceIsraelCopper/200, PriceIsraelOlive/200... (All Prices? Or just current?)
        // ]

        // Let's do Just Current Location Prices + Current Location Inventory Value?
        // No, FULL OBSERVABILITY is best for DQN to learn "If prices in Egypt are better, go there".

        const input = [];

        // 1. Locations One-Hot
        LOCATIONS.forEach(l => {
            input.push(l.id === this.state.location ? 1 : 0);
        });

        // 2. Time
        input.push(this.state.day / MAX_DAYS);

        // 3. Player
        input.push(Math.max(-1, Math.min(1, this.state.cash / this.MAX_CASH_NORM))); // Clipped -1 to 1

        // 4. Inventory
        ['copper', 'olives', 'wheat'].forEach(g => {
            input.push(Math.min(1, (this.state.inventory[g] || 0) / this.MAX_INV_NORM));
        });

        // 5. Market Prices (All Locations)
        LOCATIONS.forEach(l => {
            const p = this.allPrices[l.id];
            ['copper', 'olives', 'wheat'].forEach(g => {
                input.push(p[g] / this.MAX_PRICE_NORM);
            });
        });

        return tf.tensor2d([input]);
    }
}
