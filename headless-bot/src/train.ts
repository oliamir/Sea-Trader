import { SeaTraderEnv } from './rl/SeaTraderEnv.js';
import { DQNAgent } from './rl/DQNAgent.js';
import * as tf from '@tensorflow/tfjs';

const EPISODES = 2000;
const MAX_STEPS = 300; // Shouldn't take more than 300 turns to finish (Max 30 days)

const runTraining = async () => {
    const env = new SeaTraderEnv();
    const agent = new DQNAgent();

    console.log("=== Starting DQN Training ===");
    console.log(`Episodes: ${EPISODES}, Batch Size: ${agent.batchSize}, Epsilon Decay: ${agent.epsilonDecay}`);

    for (let e = 1; e <= EPISODES; e++) {
        let state = env.reset();
        let totalReward = 0;
        let done = false;

        for (let step = 0; step < MAX_STEPS; step++) {
            // 1. Act
            const action = agent.act(state);

            // 2. Step
            const { nextState, reward, done: isDone, info } = env.step(action);

            // 3. Remember
            agent.remember(state, action, reward, nextState, isDone);

            state.dispose(); // Cleanup old tensor
            state = nextState;
            totalReward += reward;
            done = isDone;

            if (done) {
                console.log(`Episode: ${e}/${EPISODES} | Reward: ${totalReward.toFixed(2)} | NetWorth: ${info.val.toFixed(0)} | Epsilon: ${agent.epsilon.toFixed(2)}`);
                // Dispose final state
                state.dispose();
                break;
            }

            // 4. Replay (Train)
            if (agent.memory.length > agent.batchSize) {
                await agent.replay();
            }
        }

        // Apply Target Model Update periodically
        if (e % 10 === 0) {
            agent.updateTargetModel();
        }

        // Save Model periodically
        if (e % 100 === 0) {
            // Fix: Use relative path string, no file:// prefix
            await agent.save(`./models/dqn-${e}`);
            console.log("Creating Model Snapshot...");
        }
    }

    // Final Save
    await agent.save(`./models/dqn-final`);
    console.log("Training Complete.");
};

runTraining().catch(console.error);
