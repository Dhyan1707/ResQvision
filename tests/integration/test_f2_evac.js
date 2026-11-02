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
        console.log(`Path: ${result.path.join(' -> ')}`);
    } else {
        console.log(`FAILED! ${result.error}`);
    }
}

let f3Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 3 && n.type === 'room');
let f4Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 4 && n.type === 'room');
let f5Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 5 && n.type === 'room' && n.id !== 'F5_LAB2');
let f6Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 6 && n.type === 'room');
let f7Rooms = pathfinder.getAllNodes().filter(n => n.floorIndex === 7 && n.type === 'room');

runTest('Floor 2 -> Floor 1 exit', 'F2_D_U3_NODE', 'F1_EXIT_MAIN');
runTest('Floor 3 -> Floor 1 exit', f3Rooms[0].id, 'F1_EXIT_MAIN');
runTest('Floor 4 -> Floor 1 exit', f4Rooms[0].id, 'F1_EXIT_MAIN');
runTest('Floor 5 -> Floor 1 exit', f5Rooms[0].id, 'F1_EXIT_MAIN');
runTest('Floor 6 -> Floor 1 exit', f6Rooms[0].id, 'F1_EXIT_MAIN');
runTest('Floor 7 -> Floor 1 exit', f7Rooms[0].id, 'F1_EXIT_MAIN');
