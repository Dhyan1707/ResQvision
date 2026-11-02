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

// 1. Audit and Correct the F1 <-> F3 stair connections
let interFloor = buildingData.m3InterFloorConnections || [];
let initialCount = interFloor.length;

let missing = [
    { from: 'F1_STAIRS_MAIN_NODE', to: 'F3_STAIRS_MAIN_NODE', type: 'vertical' },
    { from: 'F3_STAIRS_MAIN_NODE', to: 'F1_STAIRS_MAIN_NODE', type: 'vertical' },
    { from: 'F1_STAIRS_WEST_NODE', to: 'F3_STAIRS_WEST_NODE', type: 'vertical' },
    { from: 'F3_STAIRS_WEST_NODE', to: 'F1_STAIRS_WEST_NODE', type: 'vertical' },
    { from: 'F1_STAIRS_EAST_NODE', to: 'F3_STAIRS_EAST_NODE', type: 'vertical' },
    { from: 'F3_STAIRS_EAST_NODE', to: 'F1_STAIRS_EAST_NODE', type: 'vertical' }
];

missing.forEach(m => {
    let exists = interFloor.some(c => c.from === m.from && c.to === m.to);
    if (!exists) {
        interFloor.push(m);
    }
});

let finalCount = interFloor.length;

let m3InterStrings = JSON.stringify(interFloor, null, 12).replace(/\n/g, '\n');
let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
modifiedData = modifiedData.replace(/m3InterFloorConnections:\s*\[[\s\S]*?\]/, 'm3InterFloorConnections: ' + m3InterStrings);
fs.writeFileSync('./src/models/buildingData.js', modifiedData);

console.log(`Initial inter-floor connections: ${initialCount}`);
console.log(`Final inter-floor connections: ${finalCount}`);
console.log(`Added missing connections between F1 and F3.`);

// Test
const M4Pathfinder = require('./src/ai/pathfinding.js');
const pathfinder = new M4Pathfinder(buildingData);

function runTest(name, startId, endId) {
    console.log(`\n============================`);
    console.log(`TEST: ${name}`);
    console.log(`From: ${startId}  To: ${endId}`);
    const result = pathfinder.findPath(startId, endId);
    
    if (result.success) {
        console.log(`SUCCESS! Route cost: ${result.cost.toFixed(2)}`);
        
        let usesStairs = false;
        result.path.forEach(nodeId => {
            if (nodeId.includes('STAIR')) usesStairs = true;
        });
        
        console.log(`Uses Stairs: ${usesStairs ? 'YES' : 'NO'}`);
    } else {
        console.log(`FAILED! ${result.error}`);
    }
}

let f1Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 1 && n.type === 'room');
let f2Doors = pathfinder.getAllNodes().filter(n => n.floorIndex === 2 && n.type === 'door');
let f3Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 3 && n.type === 'room');
let f4Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 4 && n.type === 'room');
let f5Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 5 && n.type === 'room' && n.id !== 'F5_LAB2');
let f6Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 6 && n.type === 'room');
let f7Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 7 && n.type === 'room');

runTest('F1 -> Ground (Main Exit)', f1Rooms[0].id, 'F1_EXIT_MAIN');
runTest('F2 -> Ground (Main Exit)', 'F2_D_U3_NODE', 'F1_EXIT_MAIN');
runTest('F3 -> Ground (Main Exit)', f3Rooms[0].id, 'F1_EXIT_MAIN');
runTest('F4 -> Ground (Main Exit)', f4Rooms[0].id, 'F1_EXIT_MAIN');
runTest('F5 -> Ground (Main Exit)', f5Rooms[0].id, 'F1_EXIT_MAIN');
runTest('F6 -> Ground (Main Exit)', f6Rooms[0].id, 'F1_EXIT_MAIN');
runTest('F7 -> Ground (Main Exit)', f7Rooms[0].id, 'F1_EXIT_MAIN');

