const fs = require('fs');
let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

const l7Start = data.indexOf('level: 7');
const endOfFile = data.length;
let l7Block = data.substring(l7Start, endOfFile);

const doorsStr = `        doors: [
          // LEFT WING NORTH
          { id: "F7_D_C6", wallId: "F7_CORR_N_LW", x: -75, z: -5, width: 3 },
          { id: "F7_D_C10", wallId: "F7_CORR_N_LW", x: -47.5, z: -5, width: 3 },
          // LEFT WING SOUTH
          { id: "F7_D_C7", wallId: "F7_CORR_S_LW", x: -77.5, z: 5, width: 3 },
          { id: "F7_D_C9", wallId: "F7_CORR_S_LW", x: -55, z: 5, width: 3 },
          { id: "F7_D_C8", wallId: "F7_LW_P3", x: -77.5, z: 20, width: 2 }, // C8 to C7
          { id: "F7_D_STAIRS_WEST", wallId: "F7_CORR_S_LW", x: -40, z: 5, width: 4 }, // West Stairs to Corridor
          // CENTER CORE
          { id: "F7_D_TOILET", wallId: "F7_CORR_N_NC", x: -2.5, z: -5, width: 4 },
          { id: "F7_D_LIFT_LOBBY", wallId: "F7_CORR_S_SC", x: -6.5, z: 5, width: 4 },
          { id: "F7_D_STAIRS", wallId: "F7_SCORE_H1", x: -1.5, z: 20, width: 3 },
          // EAST WING NORTH
          { id: "F7_D_C11", wallId: "F7_CORR_N_NC", x: 22.5, z: -5, width: 3 },
          { id: "F7_D_C12", wallId: "F7_CORR_N_NC", x: 47.5, z: -5, width: 3 },
          { id: "F7_D_C13", wallId: "F7_CORR_N_NC", x: 72.5, z: -5, width: 3 },
          { id: "F7_D_C14", wallId: "F7_CORR_N_NC", x: 97.5, z: -5, width: 3 },
          // EAST WING SOUTH
          { id: "F7_D_C17", wallId: "F7_CORR_S_SC", x: 23.5, z: 5, width: 3 },
          { id: "F7_D_C16", wallId: "F7_CORR_S_SC", x: 72.5, z: 5, width: 3 },
          { id: "F7_D_C15", wallId: "F7_CORR_S_SC", x: 97.5, z: 5, width: 3 },
          // CORRIDOR BLOCKER
          { id: "F7_D_CONF", wallId: "F7_MB_P5", x: 85, z: 0, width: 4, isHorizontal: false }
        ],
        windows: [],`;

const nodesStr = `        columns: []
      },
      nodes: [
          // BLUE MARKERS - Rooms
          { id: "F7_C6", type: "room", name: "Classroom 6", x: -75, z: -20 },
          { id: "F7_C10", type: "room", name: "Classroom 10", x: -47.5, z: -20 },
          { id: "F7_C7", type: "room", name: "Classroom 7", x: -77.5, z: 12.5 },
          { id: "F7_C8", type: "room", name: "Classroom 8", x: -77.5, z: 27.5 },
          { id: "F7_C9", type: "room", name: "Classroom 9", x: -55, z: 20 },
          { id: "F7_TOILET_CORE", type: "room", name: "Toilet Core", x: -2.5, z: -16.5 },
          { id: "F7_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 12.5 },
          { id: "F7_C11", type: "room", name: "Classroom 11", x: 22.5, z: -16.5 },
          { id: "F7_C12", type: "room", name: "Classroom 12", x: 47.5, z: -16.5 },
          { id: "F7_C13", type: "room", name: "Classroom 13", x: 72.5, z: -16.5 },
          { id: "F7_C14", type: "room", name: "Classroom 14 (Conf)", x: 97.5, z: -16.5 },
          { id: "F7_C17", type: "room", name: "Classroom 17", x: 23.5, z: 17.5 },
          { id: "F7_C16", type: "room", name: "Classroom 16", x: 72.5, z: 17.5 },
          { id: "F7_C15", type: "room", name: "Classroom 15 (Conf)", x: 97.5, z: 17.5 },
          
          // PURPLE MARKERS - Corridors
          { id: "F7_CORR_W", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F7_CORR_C", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          { id: "F7_CORR_E1", type: "corridor", name: "East Corridor", x: 40, z: 0 },
          { id: "F7_CORR_E2", type: "corridor", name: "Far East Corridor", x: 75, z: 0 },
          { id: "F7_CORR_CONF", type: "corridor", name: "Conference Lobby", x: 95, z: 0 },
          
          // YELLOW MARKERS - Stairs
          { id: "F7_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F7_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          
          // GREEN MARKERS - Exits
          { id: "F7_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F7_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 }
      ]
    }`;

l7Block = l7Block.replace(/doors:\s*\[[\s\S]*?\],\s*windows:\s*\[\s*\],?/, doorsStr);
l7Block = l7Block.replace(/columns:\s*\[[\s\S]*?\]\s*\},[\s\S]*nodes:\s*\[[\s\S]*?\]\s*\n\s*\}/, nodesStr);

data = data.substring(0, l7Start) + l7Block;
fs.writeFileSync('./src/models/buildingData.js', data);
console.log('Injected 7th floor gaps and markers.');
