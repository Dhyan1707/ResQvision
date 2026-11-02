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
buildingData.m3InterFloorConnections.forEach(c => console.log(c.from, '->', c.to));
