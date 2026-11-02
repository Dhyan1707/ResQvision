const fs = require('fs');

let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

// The nodes array for Floor 2 starts near "id": 2. We can just parse and stringify if we are careful, or we can just append to the nodes array using eval and then stringify. But eval removes the formatting.
// Let's just find the exact index where we want to insert.
// We will look for `{ id: 'F2_D_STAIR_NODE'` or `{ "id": "F2_D_STAIR_NODE"`.
// Actually, let's just use eval to parse the whole thing, modify it, and write it back, OR we can do a precise string injection.

let bd;
try {
    eval(data.replace('if (typeof module', 'bd = buildingData; /*') + '\n*/');
} catch (e) {
    console.error('Error parsing', e);
    process.exit(1);
}

// Add to bd.floors[2].nodes
if (!bd.floors[2].nodes.find(n => n && n.id === 'F2_STAIRS_MAIN_NODE')) {
    bd.floors[2].nodes.push({
        id: "F2_STAIRS_MAIN_NODE",
        type: "staircase",
        name: "F2 Main Stairs",
        x: -6.5,
        z: 18
    });
}

// Write back with string replacement to preserve formatting, or just use JSON.stringify for the whole floors array? 
// stringify ruins functions if any, but buildingData doesn't have functions.
// Let's replace just the nodes array of floor 2 in the string.
const f2NodesStr = JSON.stringify(bd.floors[2].nodes, null, 12).replace(/\n/g, '\n');

// We need to replace the original nodes array string.
let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
// Find where floor 2 nodes array is
let floor2Index = modifiedData.indexOf('level: 2');
let nodesIndex = modifiedData.indexOf('nodes:', floor2Index);
let endNodesIndex = modifiedData.indexOf(']', nodesIndex) + 1;

modifiedData = modifiedData.slice(0, nodesIndex) + 'nodes: ' + f2NodesStr + modifiedData.slice(endNodesIndex);

fs.writeFileSync('./src/models/buildingData.js', modifiedData);
console.log('Successfully inserted F2_STAIRS_MAIN_NODE into nodes array.');
