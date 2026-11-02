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

// 1. Remove F1_MAIN <-> F3_MAIN
// 2. Add F1_MAIN <-> F2_MAIN
// 3. Add F2_MAIN <-> F3_MAIN
let interFloor = buildingData.m3InterFloorConnections || [];
let initialCount = interFloor.length;

// Remove
interFloor = interFloor.filter(c => 
    !(c.from === 'F1_STAIRS_MAIN_NODE' && c.to === 'F3_STAIRS_MAIN_NODE') &&
    !(c.from === 'F3_STAIRS_MAIN_NODE' && c.to === 'F1_STAIRS_MAIN_NODE')
);

// Add
interFloor.push({ from: 'F1_STAIRS_MAIN_NODE', to: 'F2_STAIRS_MAIN_NODE', type: 'vertical' });
interFloor.push({ from: 'F2_STAIRS_MAIN_NODE', to: 'F1_STAIRS_MAIN_NODE', type: 'vertical' });
interFloor.push({ from: 'F2_STAIRS_MAIN_NODE', to: 'F3_STAIRS_MAIN_NODE', type: 'vertical' });
interFloor.push({ from: 'F3_STAIRS_MAIN_NODE', to: 'F2_STAIRS_MAIN_NODE', type: 'vertical' });

let finalCount = interFloor.length;

let m3InterStrings = JSON.stringify(interFloor, null, 12).replace(/\n/g, '\n');
let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
modifiedData = modifiedData.replace(/m3InterFloorConnections:\s*\[[\s\S]*?\]/, 'm3InterFloorConnections: ' + m3InterStrings);
fs.writeFileSync('./src/models/buildingData.js', modifiedData);

console.log(`Initial inter-floor connections: ${initialCount}`);
console.log(`Final inter-floor connections: ${finalCount}`);
console.log(`Removed F1<->F3 MAIN workarounds and added F1<->F2<->F3 MAIN connections.`);
