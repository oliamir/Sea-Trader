import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { decideBotAction } from "../services/bot.ts";
import { generateGlobalPrices, getNextTime, getTravelDuration, generateTravelEvent } from "../services/gameEngine.ts";
import { saveGameResult } from "../services/firebaseService.ts";
import { INITIAL_CASH, INITIAL_CAPACITY, MAX_DAYS, LOAN_INTEREST_RATE, TIME_ORDER } from "../constants.ts";
// types.ts is a type-only file, but if it has enums we might need .js extension if we use enums as values. 
// However, we are importing types mostly. 
// Note: In Node ESM, we need .js extensions for local imports.

// Mock navigator for firebaseService
// (global as any).navigator = { userAgent: 'HeadlessBot/1.0' }; // Node 24 has native navigator

// Configuration for the simulation
const GAMES_TO_PLAY = 5;

// ---- Simplified Game Loop Implementation ----
// This mirrors the logic in App.tsx but stripped of UI concerns

const runGame = async (gameId: number) => {
    console.log(`\n=== Starting Game ${gameId} ===`);

    // Initial State
    let state = {
        cash: INITIAL_CASH,
        bankBalance: 0,
        loan: 0,
        inventory: { copper: 0, olives: 0, wheat: 0 } as Record<string, number>,
        maxCapacity: INITIAL_CAPACITY,
        location: 'israel',
        day: 1,
        timeOfDay: 'Morning' as const,
        isGameOver: false,
    };

    let allPrices = generateGlobalPrices();
    let currentEvent: any = null;
    let turnCount = 0;

    while (!state.isGameOver) {
        turnCount++;
        // 1. Get Bot Decision
        const decision = decideBotAction(state, allPrices[state.location] || {}, currentEvent);

        // console.log(`[Day ${state.day} ${state.timeOfDay}] Loc: ${state.location} Cash: ${state.cash} | Action: ${decision?.action} ${JSON.stringify(decision?.payload || '')}`);

        if (!decision) {
            // Should not happen if bot covers all cases, but fallback to wait
            console.log("No decision from bot, waiting...");
            break;
        }

        // 2. Process Action
        switch (decision.action) {
            case 'TRADE':
                const { goodId, amount, isBuy } = decision.payload;
                const price = allPrices[state.location][goodId];
                const cost = price * amount;

                if (isBuy) {
                    if (state.cash >= cost) {
                        state.cash -= cost;
                        state.inventory[goodId] = (state.inventory[goodId] || 0) + amount;
                    }
                } else {
                    if ((state.inventory[goodId] || 0) >= amount) {
                        state.cash += cost;
                        state.inventory[goodId] -= amount;
                    }
                }
                break;

            case 'TRAVEL':
                const destination = decision.payload;
                const currentLoad = Object.values(state.inventory).reduce((a, b) => a + b, 0);

                // Travel Logic
                const turns = getTravelDuration(state.location, destination);
                const travelEvent = generateTravelEvent(currentLoad, state.maxCapacity);

                // If event is not smooth sailing, we technically "stop" to handle it in the UI.
                // For the bot, we can Auto-Handle it if it's just a notification, 
                // OR we set currentEvent and let the loop handle it next tick (Bot says 'EVENT' -> IGNORE/handle).
                // The current bot implementation handles 'EVENT' by returning 'IGNORE'.

                if (travelEvent.type !== 'SMOOTH_SAILING') {
                    // In UI: Setup event, wait for user.
                    // Here: We set currentEvent. The NEXT iteration, the bot sees currentEvent.
                    // Bot logic: if (currentEvent) return { action: 'EVENT', payload: 'IGNORE' };
                    currentEvent = travelEvent;

                    // Note: In generic logic, the travel isn't "done" until event is handled.
                    // But we need to store the "pending" destination to complete travel after event.
                    // For simplicity in this headless script, we'll apply the event *outcome* immediately 
                    // AND perform the travel, effectively skipping the "Event View" step.
                    // OR we can strictly follow the loop: 
                    // 1. Set Event. 2. Bot sees Event. 3. Bot ignores. 4. We clear event. 5. We execute travel.

                    // Let's go with immediate application for speed, assuming bot always ignores events to proceed.
                    // Apply Effect
                    if (travelEvent.outcome.cashChange) state.cash += travelEvent.outcome.cashChange;
                    if (travelEvent.outcome.inventoryLoss) {
                        Object.keys(state.inventory).forEach(k => {
                            state.inventory[k] = Math.floor(state.inventory[k] * 0.8);
                        });
                    }
                    console.log(`  > Event: ${travelEvent.type} on way to ${destination}`);
                }

                // Execute Travel Movement (Time passing)
                // Logic from finalizeTravel
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
                // Bot wants to handle/ignore event
                currentEvent = null;
                break;

            case 'RESTART':
                // Game over acknowledged
                break;
        }

        // Check Hard Game Over condition (Time)
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
    console.log("Starting Headless Bot Simulation...");
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
