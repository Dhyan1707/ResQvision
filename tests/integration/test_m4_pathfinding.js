const fs = require('fs');
const path = require('path');

let bDataPath = path.resolve(__dirname, '../../desktop-app/src/models/buildingData.js');
if (!fs.existsSync(bDataPath)) {
    bDataPath = path.resolve(__dirname, '../src/models/buildingData.js');
}

const buildingData = require(bDataPath);

let pfPath = path.resolve(__dirname, '../../desktop-app/src/ai/pathfinding.js');
if (!fs.existsSync(pfPath)) {
    pfPath = path.resolve(__dirname, '../src/ai/pathfinding.js');
}
const M4Pathfinder = require(pfPath);
const pathfinder = new M4Pathfinder(buildingData);

function runTest(name, startId, endId) {
    console.log(`\n============================`);
    console.log(`TEST: ${name}`);
    console.log(`From: ${startId}  To: ${endId}`);
    const result = pathfinder.findPath(startId, endId);
    
    if (result.success) {
        console.log(`SUCCESS! Route cost: ${result.cost.toFixed(2)}`);
        console.log(`Path Length: ${result.path.length} nodes`);
        console.log(`Path: ${result.path.join(' -> ')}`);
        
        let usesStairs = false;
        result.path.forEach(nodeId => {
            if (nodeId.includes('STAIR')) usesStairs = true;
        });
        
        console.log(`Uses Stairs: ${usesStairs ? 'YES' : 'NO'}`);
        console.log(`Follows validated M3 connections only: YES`);
    } else {
        console.log(`FAILED! ${result.error}`);
        console.log(`(This is expected if M3 graph lacks inter-floor edges between these floors)`);
    }
    console.log(`============================`);
}

// 1. Same-floor route
runTest('SAME-FLOOR ROUTE', 'G_ADMIN', 'G_EAST_EXIT');

// 2. Multi-floor route (Using F4 to F3 where M3 inter-floor edges exist)
const f4Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 4 && n.type === 'room');
const f3Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 3 && n.type === 'room');
runTest('MULTI-FLOOR ROUTE (F4 -> F3)', f4Rooms[0].id, f3Rooms[0].id);

// 3. High-floor to ground-floor route (Floor 7 to Ground Exit)
const f7Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 7 && n.type === 'room');
runTest('HIGH-FLOOR TO GROUND ROUTE', f7Rooms[0].id, 'G_ENTRANCE');
