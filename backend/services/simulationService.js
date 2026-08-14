/**
 * Simulation Service
 * Handles core algorithms for Fire Evacuation: A* Pathfinding and Cellular Automaton for Fire Spread.
 */

// Helper: Node class for A* Algorithm
class Node {
  constructor(x, y, g = 0, h = 0, parent = null) {
    this.x = x;
    this.y = y;
    this.g = g; // Cost from start
    this.h = h; // Heuristic to end
    this.f = g + h; // Total cost
    this.parent = parent;
  }
}

export const simulationService = {
  /**
   * Helper: Builds a 2D grid based on blueprint dimensions.
   * 0 = Walkable (Rooms/Corridors)
   * 1 = Obstacle (Walls/Outside)
   */
  buildGrid(blueprintJson, floorNumber = 1) {
    const width = blueprintJson.dimensions?.width || 100;
    const height = blueprintJson.dimensions?.height || 100;
    
    // Initialize everything as obstacle (1)
    const grid = Array(height).fill(null).map(() => Array(width).fill(1));
    
    const floor = blueprintJson.floors?.find(f => f.floor_number === floorNumber);
    if (!floor) return grid;

    // Carve out walkable areas (Rooms)
    floor.rooms?.forEach(room => {
      const rx = Math.floor(room.x);
      const ry = Math.floor(room.y);
      const rw = Math.floor(room.width);
      const rh = Math.floor(room.height);

      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          // Inside bounds check
          if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[y][x] = 0; // Make walkable
          }
        }
      }
    });

    // Make exits walkable
    floor.emergency_exits?.forEach(exit => {
      const ex = Math.floor(exit.x);
      const ey = Math.floor(exit.y);
      if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
        grid[ey][ex] = 0;
      }
    });

    return grid;
  },

  /**
   * Simulates fire spread using a BFS/Cellular Automaton approach
   * @param {Object} blueprintJson 
   * @param {Object} fireOrigin - { x, y }
   * @param {number} steps - Number of time steps to simulate
   * @returns {Array} List of nodes on fire per step
   */
  simulateFireSpread(blueprintJson, fireOrigin, steps = 10) {
    const width = blueprintJson.dimensions?.width || 100;
    const height = blueprintJson.dimensions?.height || 100;
    const grid = this.buildGrid(blueprintJson);

    let currentFire = [{ x: Math.floor(fireOrigin.x), y: Math.floor(fireOrigin.y) }];
    const fireHistory = [[...currentFire]]; // Step 0 is just origin
    const fireSet = new Set([`${currentFire[0].x},${currentFire[0].y}`]);

    const directions = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      // Diagonals for faster spread
      { dx: -1, dy: -1 }, { dx: 1, dy: 1 },
      { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
    ];

    for (let step = 1; step <= steps; step++) {
      const newFire = [];
      const previousFire = fireHistory[step - 1];

      previousFire.forEach(node => {
        directions.forEach(dir => {
          const nx = node.x + dir.dx;
          const ny = node.y + dir.dy;
          const key = `${nx},${ny}`;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            // If it's walkable or near walkable and not already on fire
            if (grid[ny][nx] === 0 && !fireSet.has(key)) {
              newFire.push({ x: nx, y: ny });
              fireSet.add(key);
            }
          }
        });
      });

      // Accumulate fire state
      fireHistory.push([...previousFire, ...newFire]);
    }

    return fireHistory;
  },

  /**
   * Calculates the shortest and safest escape route using A* Algorithm
   * @param {Object} blueprintJson 
   * @param {Object} start - { x, y }
   * @param {Array} fireNodes - Nodes currently on fire to avoid [{x, y}]
   */
  calculateEscapeRoute(blueprintJson, start, fireNodes = []) {
    const width = blueprintJson.dimensions?.width || 100;
    const height = blueprintJson.dimensions?.height || 100;
    const grid = this.buildGrid(blueprintJson);

    // Apply fire obstacles (treat fire as walls)
    fireNodes.forEach(f => {
      if (f.x >= 0 && f.x < width && f.y >= 0 && f.y < height) {
        grid[f.y][f.x] = 1; 
      }
    });

    const floor = blueprintJson.floors?.[0];
    if (!floor || !floor.emergency_exits || floor.emergency_exits.length === 0) {
      throw new Error("No emergency exits found in blueprint.");
    }

    // Heuristic: Manhattan distance
    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    let bestPath = null;
    let shortestCost = Infinity;

    // Run A* for each exit, find the absolute shortest path overall
    floor.emergency_exits.forEach(exit => {
      const path = this.runAStar(grid, start, exit, width, height, heuristic);
      if (path && path.length < shortestCost) {
        shortestCost = path.length;
        bestPath = path;
      }
    });

    if (!bestPath) {
      throw new Error("No safe path to any exit found. The fire has blocked all routes.");
    }

    return bestPath;
  },

  /**
   * Internal A* Implementation
   */
  runAStar(grid, start, end, width, height, heuristic) {
    let openList = [];
    let closedSet = new Set();

    const startNode = new Node(Math.floor(start.x), Math.floor(start.y));
    const endNode = new Node(Math.floor(end.x), Math.floor(end.y));

    startNode.h = heuristic(startNode, endNode);
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const directions = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    while (openList.length > 0) {
      // Get node with lowest f cost
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();
      const currentKey = `${current.x},${current.y}`;

      if (current.x === endNode.x && current.y === endNode.y) {
        // Path found, backtrack
        const path = [];
        let curr = current;
        while (curr) {
          path.push({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path.reverse();
      }

      closedSet.add(currentKey);

      directions.forEach(dir => {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        const neighborKey = `${nx},${ny}`;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          // If walkable and not in closed set
          if (grid[ny][nx] === 0 && !closedSet.has(neighborKey)) {
            const tentativeG = current.g + 1; // Cost is 1 per step
            let neighbor = openList.find(n => n.x === nx && n.y === ny);

            if (!neighbor) {
              neighbor = new Node(nx, ny);
              openList.push(neighbor);
            } else if (tentativeG >= neighbor.g) {
              return; // Not a better path
            }

            neighbor.parent = current;
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, endNode);
            neighbor.f = neighbor.g + neighbor.h;
          }
        }
      });
    }

    return null; // No path
  }
};
