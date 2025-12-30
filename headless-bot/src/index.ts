import { decideBotAction } from './bot.js';
import { generateGlobalPrices, getNextTime, getTravelDuration, generateTravelEvent } from './gameEngine.js';
import { saveGameResult } from './firebaseService.js';
import { INITIAL_CASH, INITIAL_CAPACITY, MAX_DAYS, LOAN_INTEREST_RATE } from './constants.js';
import { PlayerState } from './types.js';

// Configuration
const GAMES_TO_PLAY = 5;

// Mock navigator for firebase service if needed
// (global as any).navigator = { userAgent: 'HeadlessBot/Standalone/1.0' }; // Node 20+ has navigator

const runGame = async (gameId: number) => {
    console.log(`\n=== Starting Game ${gameId} ===`);

    // Initial State
    let state: PlayerState = {
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

    let allPrices = generateGlobalPrices();
    let currentEvent: any = null;

    while (!state.isGameOver) {
        // 1. Get Bot Decision
        const decision = decideBotAction(state, allPrices[state.location] || {}, currentEvent);

        if (!decision) {
            console.log("No decision from bot, waiting...");
            break;
        }

        // 2. Process Action
        switch (decision.action) {
            case 'TRADE':
                const tradePayload = decision.payload;
                const price = allPrices[state.location][tradePayload.goodId];
                const cost = price * tradePayload.amount;

                if (tradePayload.isBuy) {
                    if (state.cash >= cost) {
                        state.cash -= cost;
                        state.inventory[tradePayload.goodId] = (state.inventory[tradePayload.goodId] || 0) + tradePayload.amount;
                    }
                } else {
                    if ((state.inventory[tradePayload.goodId] || 0) >= tradePayload.amount) {
                        state.cash += cost;
                        state.inventory[tradePayload.goodId] -= tradePayload.amount;
                    }
                }
                break;

            case 'TRAVEL':
                const destination = decision.payload;
                const currentLoad = Object.values(state.inventory).reduce((a, b) => a + b, 0);

                // Travel Logic
                const turns = getTravelDuration(state.location, destination);
                const travelEvent = generateTravelEvent(currentLoad, state.maxCapacity);

                if (travelEvent.type !== 'SMOOTH_SAILING') {
                    // Immediate resolution for headless bot
                    currentEvent = travelEvent;

                    if (travelEvent.outcome.cashChange) state.cash += travelEvent.outcome.cashChange;
                    if (travelEvent.outcome.inventoryLoss) {
                        Object.keys(state.inventory).forEach(k => {
                            state.inventory[k] = Math.floor(state.inventory[k] * 0.8);
                        });
                    }
                    console.log(`  > Event: ${travelEvent.type} on way to ${destination}`);
                }

                // Execute Travel Movement (Time passing)
                const startDay = state.day;
                for (let i = 0; i < turns; i++) {
                    if (state.isGameOver) break;
                    const next = getNextTime(state.day, state.timeOfDay);

                    // Bank Interest
                    state.bankBalance = Math.floor(state.bankBalance * 1.01);
                    // Loan Interest
                    if (next.day > state.day) {
                        state.loan = Math.floor(state.loan * (1 + LOAN_INTEREST_RATE));
                    }

                    state.day = next.day;
                    state.timeOfDay = next.time;
                    state.isGameOver = next.isGameOver;
                }
                state.location = destination;

                // Update Prices if day changed
                if (state.day > startDay) {
                    allPrices = generateGlobalPrices();
                }
                break;

            case 'EVENT':
                currentEvent = null;
                break;

            case 'RESTART':
                break;
        }

        if (state.isGameOver) {
            break;
        }
    }

    // Save Result
    console.log(`Game Over! Cash: ${state.cash}, Net Worth: ${state.cash + state.bankBalance - state.loan}`);
    const docId = await saveGameResult(state);
    if (docId) {
        console.log(`✅ Result saved to Firestore. Doc ID: ${docId}`);
    } else {
        console.error(`❌ Failed to save result.`);
    }
};

const runSimulation = async () => {
    console.log("Starting HEADLESS Bot App...");
    try {
        for (let i = 0; i < GAMES_TO_PLAY; i++) {
            await runGame(i + 1);
        }
        console.log("\nSimulation Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Simulation Error:", error);
        process.exit(1);
    }
};

runSimulation();
