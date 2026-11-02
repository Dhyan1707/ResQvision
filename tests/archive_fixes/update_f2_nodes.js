const fs = require('fs');

let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

// 1. ADD F2_STAIRS_MAIN_NODE to Floor 2 nodes
const stairNodeStr = `
          {
            "id": "F2_STAIRS_MAIN_NODE",
            "type": "staircase",
            "name": "F2 Main Stairs",
            "x": -6.5,
            "z": 18
          },`;

data = data.replace(/"id":\s*"F2_D_STAIR_NODE",[\s\S]*?},/, (match) => match + stairNodeStr);

// 2. ADD same-floor connection in Floor 2 m3Connections
const sameFloorConnStr = `
          {
            "from": "F2_STAIRS_MAIN_NODE",
            "to": "F2_D_STAIR_NODE"
          },
          {
            "from": "F2_D_STAIR_NODE",
            "to": "F2_STAIRS_MAIN_NODE"
          },`;

let f2ConnectionsIndex = data.indexOf('"id": 2,');
let f2m3ConnectionsIndex = data.indexOf('m3Connections:', f2ConnectionsIndex);
let insertPos = data.indexOf('[', f2m3ConnectionsIndex) + 1;

data = data.slice(0, insertPos) + sameFloorConnStr + data.slice(insertPos);

fs.writeFileSync('./src/models/buildingData.js', data);
console.log('Added F2_STAIRS_MAIN_NODE and same-floor connection.');
