const fs = require('fs');

let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');
const script = data.replace('if (typeof module !== "undefined" && module.exports) {', 'module.exports = buildingData; /*')
                   .replace('module.exports = buildingData;', '')
                   .replace('} else if (typeof window !== "undefined") {', '*/');
let buildingData;
try {
    buildingData = eval(data + '\nbuildingData;');
} catch (e) {
    console.error('Error', e);
    process.exit(1);
}

// 1. Fix Ground Floor Node Missings
let floor0 = buildingData.floors[0];
floor0.m3Connections = floor0.m3Connections.filter(c => 
    c.from !== 'G_CORRIDOR' && c.to !== 'G_CORRIDOR'
);

// Add the raycast-verified correct edges for Ground
floor0.m3Connections.push({ from: 'G_DOOR_ENTRANCE_CORR_NODE', to: 'G_ENTRANCE' });
floor0.m3Connections.push({ from: 'G_DOOR_EXT_W_NODE', to: 'G_DOOR_ENTRANCE_CORR_NODE' });
floor0.m3Connections.push({ from: 'G_DOOR_EAST_EXIT_NODE', to: 'G_DOOR_LATHE_NODE' });
floor0.m3Connections.push({ from: 'G_EAST_EXIT', to: 'G_DOOR_EAST_EXIT_NODE' });

// Remove duplicates from Ground Floor just in case
let unique0 = [];
let seen0 = new Set();
floor0.m3Connections.forEach(c => {
    let key1 = c.from + '-' + c.to;
    let key2 = c.to + '-' + c.from;
    if (!seen0.has(key1) && !seen0.has(key2)) {
        seen0.add(key1);
        unique0.push(c);
    }
});
floor0.m3Connections = unique0;

// 2. Fix F3 and F4 Wall Crossings
[3, 4].forEach(idx => {
    let floor = buildingData.floors[idx];
    
    let badEdge1 = "F" + idx + "_D_N_H6_NODE";
    let badEdge2 = "F" + idx + "_CORRIDOR_CENTER";
    
    floor.m3Connections = floor.m3Connections.filter(c => !(c.from === badEdge1 && c.to === badEdge2) && !(c.from === badEdge2 && c.to === badEdge1));
    
    // Connect to the verified line of sight target
    floor.m3Connections.push({ from: badEdge1, to: "F" + idx + "_D_ASSESSMENT_NODE" });
});

let m3ConnStrings = [];
buildingData.floors.forEach(floor => {
    m3ConnStrings.push(JSON.stringify(floor.m3Connections, null, 12).replace(/\n/g, '\n'));
});

let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
let matchIdx = 0;
modifiedData = modifiedData.replace(/m3Connections:\s*\[[\s\S]*?\]/g, (match) => {
    let rep = 'm3Connections: ' + m3ConnStrings[matchIdx];
    matchIdx++;
    return rep;
});
fs.writeFileSync('./src/models/buildingData.js', modifiedData);
console.log("Final 5 issues fixed.");
