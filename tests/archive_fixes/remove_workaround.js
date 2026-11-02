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

let interFloor = buildingData.m3InterFloorConnections || [];

// Remove F1_MAIN <-> F3_MAIN
interFloor = interFloor.filter(c => 
    !(c.from === 'F1_STAIRS_MAIN_NODE' && c.to === 'F3_STAIRS_MAIN_NODE') &&
    !(c.from === 'F3_STAIRS_MAIN_NODE' && c.to === 'F1_STAIRS_MAIN_NODE')
);

let m3InterStrings = JSON.stringify(interFloor, null, 12).replace(/\n/g, '\n');
let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
modifiedData = modifiedData.replace(/m3InterFloorConnections:\s*\[[\s\S]*?\]/, 'm3InterFloorConnections: ' + m3InterStrings);
fs.writeFileSync('./src/models/buildingData.js', modifiedData);

console.log('Removed F1_MAIN <-> F3_MAIN connections.');
