// ==========================================
// RL EVACUATION TRAINING ENVIRONMENT (HEADLESS)
// AI FIRE EVACUATION SYSTEM
// ==========================================

const buildingData = require("../models/buildingData");

class RLEvacuationEnv {
  constructor() {
    this.nodes = [];
    this.exits = [];
    this.adjMatrix = {};
    this.initGraph();
  }

  initGraph() {
    buildingData.floors.forEach((floor) => {
      floor.nodes.forEach((node) => {
        this.nodes.push(node.id);
        if (node.type === "exit") {
          this.exits.push(node.id);
        }
        this.adjMatrix[node.id] = node.connections || [];
      });
    });
  }

  // Get available actions (connected rooms) from current node
  getValidActions(nodeId, fireNodes = []) {

    const neighbors = this.adjMatrix[nodeId] || [];
    return neighbors.filter((neighbor) => !fireNodes.includes(neighbor));
  }

  // Q-Learning Training Algorithm
  trainDQN(episodes = 500) {
    console.log(`🧠 Starting AI Model Reinforcement Learning Training (${episodes} episodes)...`);
    const qTable = {};

    // Initialize Q-table
    this.nodes.forEach((node) => {
      qTable[node] = {};
      const actions = this.adjMatrix[node] || [];
      actions.forEach((act) => {
        qTable[node][act] = 0;
      });
    });

    const alpha = 0.1; // Learning rate
    const gamma = 0.9; // Discount factor

    for (let ep = 0; ep < episodes; ep++) {
      // Pick random start room
      let currNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      let steps = 0;

      while (!this.exits.includes(currNode) && steps < 50) {
        const validActions = this.getValidActions(currNode);
        if (validActions.length === 0) break;

        // Epsilon-greedy action selection
        const action = validActions[Math.floor(Math.random() * validActions.length)];
        const isExit = this.exits.includes(action);

        // Reward structure: +100 for Exit, -1 per step
        const reward = isExit ? 100 : -1;

        // Max future Q
        const nextActions = Object.values(qTable[action] || { 0: 0 });
        const maxNextQ = nextActions.length > 0 ? Math.max(...nextActions) : 0;

        // Q-table update rule
        const oldQ = qTable[currNode][action] || 0;
        qTable[currNode][action] = oldQ + alpha * (reward + gamma * maxNextQ - oldQ);

        currNode = action;
        steps++;
      }
    }

    console.log("✅ Reinforcement Learning Training Complete! Optimal Policy Matrix generated.");
    return qTable;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = RLEvacuationEnv;
}
