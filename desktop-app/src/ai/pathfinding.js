// src/ai/pathfinding.js

// A* Pathfinding over existing M3 Navigation Graph

class M4Pathfinder {
    constructor(buildingData) {
        this.buildingData = buildingData;
        this.graph = new Map(); // node_id -> array of connected node_ids
        this.nodes = new Map(); // node_id -> node object (for positions)

        this._initializeGraph();
    }

    _initializeGraph() {
        // Collect all nodes from all floors
        this.buildingData.floors.forEach((floor, fIdx) => {
            if (floor.nodes) {
                floor.nodes.forEach(node => {
                    if (node) {
                        this.nodes.set(node.id, {
                            ...node,
                            floorIndex: fIdx,
                            globalY: floor.elevation
                        });
                        this.graph.set(node.id, new Set());
                    }
                });
            }
        });

        // Add same-floor M3 connections
        this.buildingData.floors.forEach(floor => {
            if (floor.m3Connections) {
                floor.m3Connections.forEach(conn => {
                    if (this.graph.has(conn.from) && this.graph.has(conn.to)) {
                        this.graph.get(conn.from).add(conn.to);
                        this.graph.get(conn.to).add(conn.from); // undirected
                    }
                });
            }
        });

        // Add inter-floor M3 connections
        if (this.buildingData.m3InterFloorConnections) {
            this.buildingData.m3InterFloorConnections.forEach(conn => {
                if (this.graph.has(conn.from) && this.graph.has(conn.to)) {
                    this.graph.get(conn.from).add(conn.to);
                    this.graph.get(conn.to).add(conn.from); // undirected
                }
            });
        }
    }

    _getDistance(nodeA, nodeB) {
        // 3D Euclidean distance
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.globalY - nodeB.globalY;
        const dz = nodeA.z - nodeB.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    findPath(startId, endId) {
        if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
            return { success: false, path: [], cost: 0, error: 'Invalid start or end node ID.' };
        }

        const openSet = new Set([startId]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(startId, 0);

        const fScore = new Map();
        fScore.set(startId, this._getDistance(this.nodes.get(startId), this.nodes.get(endId)));

        while (openSet.size > 0) {
            let current = null;
            let lowestF = Infinity;
            openSet.forEach(nodeId => {
                const score = fScore.has(nodeId) ? fScore.get(nodeId) : Infinity;
                if (score < lowestF) {
                    lowestF = score;
                    current = nodeId;
                }
            });

            if (current === endId) {
                return this._reconstructPath(cameFrom, current, gScore.get(endId));
            }

            openSet.delete(current);

            const neighbors = this.graph.get(current) || new Set();
            neighbors.forEach(neighbor => {
                const tentativeG = gScore.get(current) + this._getDistance(this.nodes.get(current), this.nodes.get(neighbor));
                const currentNeighborG = gScore.has(neighbor) ? gScore.get(neighbor) : Infinity;
                
                if (tentativeG < currentNeighborG) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeG);
                    fScore.set(neighbor, tentativeG + this._getDistance(this.nodes.get(neighbor), this.nodes.get(endId)));
                    if (!openSet.has(neighbor)) openSet.add(neighbor);
                }
            });
        }
        return { success: false, path: [], cost: 0, error: 'No valid route found.' };
    }

    // M9: Strict Graph-Based Pathfinding (Rule 1 Only)
    async findSafestPathM9(startId, endId, threeDViewer) {
        if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
            return { success: false, path: [], cost: 0, error: 'Invalid start or end node ID.' };
        }
        
        console.log(`\nA* DEBUG\nStart: ${startId}\nGoal: ${endId}`);

        const openSet = new Set([startId]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(startId, 0);

        const fScore = new Map();
        fScore.set(startId, this._getDistance(this.nodes.get(startId), this.nodes.get(endId)));

        let closedSetSize = 0;

        while (openSet.size > 0) {
            let current = null;
            let lowestF = Infinity;
            openSet.forEach(nodeId => {
                const score = fScore.has(nodeId) ? fScore.get(nodeId) : Infinity;
                if (score < lowestF) {
                    lowestF = score;
                    current = nodeId;
                }
            });

            if (current === endId) {
                console.log(`Goal reached:\ntrue`);
                const result = this._reconstructPath(cameFrom, current, gScore.get(endId));
                console.log(result.path.join(' → ')); // Required for Rule 1 Verification
                return result;
            }

            openSet.delete(current);
            closedSetSize++;
            
            const neighbors = this.graph.get(current) || new Set();
            for (const neighbor of neighbors) {
                const neighborNode = this.nodes.get(neighbor);
                
                let hazardPenalty = 0;
                let isBlocked = false;
                // RULE 3 & 5: CHECK THE CURRENT HAZARD STATE ACROSS THE ENTIRE EDGE
                if (threeDViewer) {
                    const currentNode = this.nodes.get(current);
                    const dist = this._getDistance(currentNode, neighborNode);
                    const steps = Math.max(2, Math.ceil(dist / 2.0));
                    
                    let maxM6Level = 'SAFE';
                    let maxM8Level = 'SAFE';
                    const hazardLevels = ['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'];
                    
                    for (let step = 1; step <= steps; step++) {
                        const t = step / steps;
                        const pos = { 
                            x: currentNode.x + (neighborNode.x - currentNode.x) * t, 
                            y: currentNode.globalY !== undefined && neighborNode.globalY !== undefined ? currentNode.globalY + (neighborNode.globalY - currentNode.globalY) * t : neighborNode.globalY, 
                            z: currentNode.z + (neighborNode.z - currentNode.z) * t 
                        };
                        
                        // 1. Current fire locations & smoke/hazard levels (M6 Deterministic)
                        const m6Hazard = typeof threeDViewer.getHazardStatus === 'function' 
                            ? threeDViewer.getHazardStatus(pos, neighborNode.floorIndex)
                            : null;
                        
                        // 2. M7/M8 ML hazard information
                        let m8Hazard = null;
                        if (typeof threeDViewer.predictHazardStatusML === 'function') {
                            m8Hazard = await threeDViewer.predictHazardStatusML(pos, neighborNode.floorIndex);
                        }
                        
                        const m6Level = m6Hazard ? m6Hazard.hazardLevel : 'SAFE';
                        const m8Level = m8Hazard && m8Hazard.hazardLevel ? m8Hazard.hazardLevel : 'SAFE';
                        
                        if (hazardLevels.indexOf(m6Level) > hazardLevels.indexOf(maxM6Level)) {
                            maxM6Level = m6Level;
                        }
                        if (hazardLevels.indexOf(m8Level) > hazardLevels.indexOf(maxM8Level)) {
                            maxM8Level = m8Level;
                        }
                        
                        if (maxM6Level === 'CRITICAL' || maxM8Level === 'CRITICAL') {
                            isBlocked = true;
                            break;
                        }
                    }
                    
                    if (isBlocked) continue;
                    
                    // RULE 4: Hazard penalties - heavily prefer clear routes, but allow emergency egress through smoke if no alternate exists
                    if (maxM6Level === 'HIGH' || maxM8Level === 'HIGH') hazardPenalty += 150;
                    if (maxM6Level === 'MODERATE' || maxM8Level === 'MODERATE') hazardPenalty += 25;
                }
                
                const tentativeG = gScore.get(current) + this._getDistance(this.nodes.get(current), neighborNode) + hazardPenalty;
                const currentNeighborG = gScore.has(neighbor) ? gScore.get(neighbor) : Infinity;
                
                if (tentativeG < currentNeighborG) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeG);
                    fScore.set(neighbor, tentativeG + this._getDistance(neighborNode, this.nodes.get(endId)));
                    if (!openSet.has(neighbor)) openSet.add(neighbor);
                }
            }
        }
        
        console.log(`Goal reached:\nfalse`);
        return { success: false, path: [], cost: 0, error: 'No valid safe route found.' };
    }

    _reconstructPath(cameFrom, current, cost) {
        const path = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }
        return { success: true, path, cost };
    }
    
    // Helper for UI controls
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = M4Pathfinder;
}
