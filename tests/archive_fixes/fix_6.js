const fs = require('fs');
let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

const l6Start = data.indexOf('level: 6');
const l7Start = data.indexOf('level: 7');
let l6Block = data.substring(l6Start, l7Start);

const doorsStr = `        doors: [
          // LEFT WING NORTH
          { id: "F6_D_C1", wallId: "F6_CORR_N_LW", x: -75, z: -5, width: 3 },
          { id: "F6_D_C5", wallId: "F6_CORR_N_LW", x: -47.5, z: -5, width: 3 },
          // LEFT WING SOUTH
          { id: "F6_D_C2", wallId: "F6_CORR_S_LW", x: -77.5, z: 5, width: 3 },
          { id: "F6_D_C4", wallId: "F6_CORR_S_LW", x: -55, z: 5, width: 3 },
          { id: "F6_D_C3", wallId: "F6_LW_P3", x: -77.5, z: 20, width: 2 }, // C3 to C2
          // CENTER CORE
          { id: "F6_D_TOILET", wallId: "F6_CORR_N_NC", x: -2.5, z: -5, width: 4 },
          { id: "F6_D_LIFT_LOBBY", wallId: "F6_CORR_S_SC", x: -6.5, z: 5, width: 4 },
          { id: "F6_D_STAIRS", wallId: "F6_SCORE_H1", x: -1.5, z: 20, width: 3 },
          // TERRACE ACCESS
          { id: "F6_D_TERRACE_N", wallId: "F6_NCORE_V4", x: 10, z: -15, width: 3 },
          { id: "F6_D_TERRACE_S", wallId: "F6_SCORE_V1", x: 12, z: 15, width: 3 }
        ],
        windows: [],`;

const nodesStr = `        columns: [
          // Adding a few placeholder structural columns on the right terrace to match the 3x3 grid
          { id: "F6_COL_1", x: 40, z: -20, radius: 0.8 },
          { id: "F6_COL_2", x: 75, z: -20, radius: 0.8 },
          { id: "F6_COL_3", x: 105, z: -20, radius: 0.8 },
          { id: "F6_COL_4", x: 40, z: 0, radius: 0.8 },
          { id: "F6_COL_5", x: 75, z: 0, radius: 0.8 },
          { id: "F6_COL_6", x: 105, z: 0, radius: 0.8 },
          { id: "F6_COL_7", x: 40, z: 20, radius: 0.8 },
          { id: "F6_COL_8", x: 75, z: 20, radius: 0.8 },
          { id: "F6_COL_9", x: 105, z: 20, radius: 0.8 }
        ]
      },
      nodes: [
          // BLUE MARKERS - Rooms
          { id: "F6_C1", type: "room", name: "Classroom C1", x: -75, z: -20 },
          { id: "F6_C5", type: "room", name: "Classroom C5", x: -47.5, z: -20 },
          { id: "F6_C2", type: "room", name: "Classroom C2", x: -77.5, z: 12.5 },
          { id: "F6_C3", type: "room", name: "Classroom C3", x: -77.5, z: 27.5 },
          { id: "F6_C4", type: "room", name: "Classroom C4", x: -55, z: 20 },
          { id: "F6_TOILET_CORE", type: "room", name: "Toilet/AHU Core", x: -2.5, z: -16.5 },
          { id: "F6_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 12.5 },
          { id: "F6_TERRACE", type: "room", name: "Open Terrace", x: 60, z: 0 },
          // PURPLE MARKERS - Corridors
          { id: "F6_CORR_W", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F6_CORR_C", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          // YELLOW MARKERS - Stairs
          { id: "F6_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F6_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          // GREEN MARKERS - Exits
          { id: "F6_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F6_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 }
      ]
    },`;

l6Block = l6Block.replace(/doors:\s*\[[\s\S]*?\],\s*windows:\s*\[\s*\],?/, doorsStr);
l6Block = l6Block.replace(/columns:\s*\[[\s\S]*?\]\s*\},[\s\S]*nodes:\s*\[[\s\S]*?\]\s*\n\s*\},/, nodesStr);

data = data.substring(0, l6Start) + l6Block + data.substring(l7Start);
fs.writeFileSync('./src/models/buildingData.js', data);
console.log('Fixed syntax by completely replacing the corrupted lines.');
