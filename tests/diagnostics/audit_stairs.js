const path = require('path');
const fs = require('fs');
let bDataPath = path.resolve(__dirname, '../../desktop-app/src/models/buildingData.js');
if (!fs.existsSync(bDataPath)) bDataPath = path.resolve(__dirname, '../src/models/buildingData.js');
const buildingData = require(bDataPath);

// 1. Show all m3InterFloorConnections
console.log('=== m3InterFloorConnections ===');
buildingData.m3InterFloorConnections.forEach(c => {
    console.log(c.from, '->', c.to, '(' + c.type + ')');
});

// 2. Show stair nodes on each floor
console.log('\n=== Stair Nodes per Floor ===');
buildingData.floors.forEach((floor, idx) => {
    if (!floor.nodes) return;
    const stairNodes = floor.nodes.filter(n => n && n.id.includes('STAIR'));
    if (stairNodes.length > 0) {
        console.log('Floor ' + idx + ' (' + floor.name + '):');
        stairNodes.forEach(n => console.log('  ' + n.id + ' x=' + n.x + ' z=' + n.z));
    }
});

// 3. Check: from Floor 1 stair, can we reach Ground floor?
console.log('\n=== Floor 1 -> Ground Floor path via inter-floor ===');
const f1Stairs = [];
const gStairs = [];
buildingData.m3InterFloorConnections.forEach(c => {
    if (c.from.startsWith('F1_') && c.to.startsWith('G_')) {
        console.log('F1->G:', c.from, '->', c.to);
        f1Stairs.push(c.from);
        gStairs.push(c.to);
    }
    if (c.from.startsWith('G_') && c.to.startsWith('F1_')) {
        console.log('G->F1:', c.from, '->', c.to);
    }
});

// 4. Check if A* can find path within Floor 1 from any node to a Floor 1 stair node
const floor1 = buildingData.floors[1]; // Floor index 1
if (floor1 && floor1.nodes) {
    const f1StairNodes = floor1.nodes.filter(n => n && n.id.includes('STAIR'));
    console.log('\nFloor 1 stair nodes:', f1StairNodes.map(n => n.id));
    
    // Check connections from Floor 1 stair nodes
    if (floor1.m3Connections) {
        f1StairNodes.forEach(sn => {
            const conns = floor1.m3Connections.filter(c => c.from === sn.id || c.to === sn.id);
            console.log(sn.id + ' connections on F1:', conns.map(c => c.from === sn.id ? c.to : c.from));
        });
    }
}
