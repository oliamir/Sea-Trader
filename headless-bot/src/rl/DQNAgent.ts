import * as tf from '@tensorflow/tfjs';
import { ACTION_SIZE, STATE_SIZE } from './SeaTraderEnv.js';

export class DQNAgent {
    model: tf.Sequential;
    targetModel: tf.Sequential;
    memory: any[];
    gamma: number; // Discount factor
    epsilon: number; // Exploration rate
    epsilonMin: number;
    epsilonDecay: number;
    learningRate: number;
    batchSize: number;
    trainStart: number;

    constructor() {
        this.gamma = 0.95;
        this.epsilon = 1.0;
        this.epsilonMin = 0.01;
        this.epsilonDecay = 0.999; // Slower decay for more exploration (Risk Taking)
        this.learningRate = 0.001;
        this.memory = [];
        this.batchSize = 32;
        this.trainStart = 1000; // Start training after 1000 memories

        this.model = this.createModel();
        this.targetModel = this.createModel();
        this.updateTargetModel();
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [STATE_SIZE], units: 24, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 24, activation: 'relu' }));
        model.add(tf.layers.dense({ units: ACTION_SIZE, activation: 'linear' })); // Q-Values for each action
        model.compile({ loss: 'meanSquaredError', optimizer: tf.train.adam(this.learningRate) });
        return model;
    }

    updateTargetModel() {
        this.targetModel.setWeights(this.model.getWeights());
    }

    remember(state: tf.Tensor2D, action: number, reward: number, nextState: tf.Tensor2D, done: boolean) {
        // Store as simple array, we'll tensorify in batch
        // We store arrays/numbers to save memory compared to Tensors in RAM
        this.memory.push({
            state: state.arraySync()[0],
            action,
            reward,
            nextState: nextState.arraySync()[0],
            done
        });
        if (this.memory.length > 20000) this.memory.shift(); // Limit max memory
    }

    act(state: tf.Tensor2D): number {
        if (Math.random() <= this.epsilon) {
            return Math.floor(Math.random() * ACTION_SIZE);
        }
        const qs = this.model.predict(state) as tf.Tensor;
        const action = qs.argMax(1).dataSync()[0];
        qs.dispose();
        return action;
    }

    async replay() {
        if (this.memory.length < this.trainStart) return;

        // Sample Batch
        const batch = [];
        for (let i = 0; i < this.batchSize; i++) {
            const idx = Math.floor(Math.random() * this.memory.length);
            batch.push(this.memory[idx]);
        }

        // Prepare Batch Tensors
        const states = tf.tensor2d(batch.map(m => m.state));
        const nextStates = tf.tensor2d(batch.map(m => m.nextState));

        // Current Q Values (for target)
        // We predict Q(s, a) and Q'(s', a')
        const currentQs = this.model.predict(states) as tf.Tensor;
        const nextQs = this.targetModel.predict(nextStates) as tf.Tensor;

        const currentQsData = await currentQs.array() as number[][];
        const nextQsData = await nextQs.array() as number[][];

        // Update Targets
        for (let i = 0; i < this.batchSize; i++) {
            const { action, reward, done } = batch[i];
            let target = reward;
            if (!done) {
                target = reward + this.gamma * Math.max(...nextQsData[i]);
            }
            // Update the Q value for the executed action ONLY
            currentQsData[i][action] = target;
        }

        // Train
        const targetTensors = tf.tensor2d(currentQsData);

        await this.model.fit(states, targetTensors, { epochs: 1, verbose: 0 });

        // Cleanup
        states.dispose();
        nextStates.dispose();
        targetTensors.dispose();
        currentQs.dispose();
        nextQs.dispose();

        // Decay Epsilon
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    async save(path: string) {
        console.log(`Saving model to ${path}...`);
        try {
            await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
                const fs = await import('fs');
                // Save model.json
                fs.writeFileSync(`${path}.json`, JSON.stringify(artifacts, null, 2));
                // We are not saving binary weights file for simplicity in this hack, 
                // we are embedding weights in JSON if possible or handling it.
                // Wait, artifacts.weightData is an ArrayBuffer. We need to save it.
                if (artifacts.weightData) {
                    fs.writeFileSync(`${path}.weights.bin`, Buffer.from(new Uint8Array(artifacts.weightData)));
                }
                return {
                    modelArtifactsInfo: {
                        dateSaved: new Date(),
                        modelTopologyType: 'JSON',
                    }
                };
            }));
            console.log("Model saved successfully.");
        } catch (e) {
            console.error("Failed to save model:", e);
        }
    }
}
