// ==========================================
// FIRE SIMULATION ENGINE (3D)
// AI FIRE EVACUATION SYSTEM
// ==========================================

const buildingData = require("../models/buildingData");

class FireSimulationEngine {
    constructor() {
        this.activeFires = []; // Stores node IDs currently on fire
        this.fireSpreadRateMs = 5000; // Time in ms before fire spreads to adjacent nodes
        this.simulationInterval = null;
    }

    // Start a fire at a specific node
    igniteNode(nodeId) {
        if (!this.activeFires.includes(nodeId)) {
            this.activeFires.push(nodeId);
            console.log(`🔥 Fire started at node: ${nodeId}`);
        }
    }

    // Clear all fires
    extinguishAll() {
        this.activeFires = [];
        this.stopSimulation();
        console.log("💧 All fires extinguished.");
    }

    // Start the simulation loop to spread fire
    startSimulation() {
        if (this.simulationInterval) return;

        console.log("⚠️ Fire simulation started.");
        this.simulationInterval = setInterval(() => {
            this.spreadFire();
        }, this.fireSpreadRateMs);
    }

    // Stop fire spread
    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
            console.log("⏸️ Fire simulation paused.");
        }
    }

    // Logic to spread fire to connected nodes
    spreadFire() {
        if (this.activeFires.length === 0) return;

        const newFires = [];

        // Check all nodes in buildingData
        buildingData.floors.forEach(floor => {
            floor.nodes.forEach(node => {
                if (this.activeFires.includes(node.id)) {
                    // Node is on fire, spread to its connections
                    if (node.connections) {
                        node.connections.forEach(connId => {
                            if (!this.activeFires.includes(connId) && !newFires.includes(connId)) {
                                newFires.push(connId);
                            }
                        });
                    }
                }
            });
        });

        if (newFires.length > 0) {
            this.activeFires.push(...newFires);
            console.log(`🔥 Fire spread to: ${newFires.join(", ")}`);
            
            // Dispatch an event so the 3D viewer can update particles
            if (typeof window !== "undefined") {
                const event = new CustomEvent("fireSpread", { detail: this.activeFires });
                window.dispatchEvent(event);
            }
        }
    }

    // Get current fire locations
    getActiveFires() {
        return this.activeFires;
    }
}

module.exports = new FireSimulationEngine();
