const fs = require('fs');
let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');
let buildingData;
try {
    const script = data.replace('if (typeof module !== "undefined" && module.exports) {', 'module.exports = buildingData; /*')
                       .replace('module.exports = buildingData;', '')
                       .replace('} else if (typeof window !== "undefined") {', '*/');
    buildingData = eval(data + '\nbuildingData;');
} catch (e) {
    console.error('Error', e);
    process.exit(1);
}
console.log("Ground doors:");
buildingData.floors[0].geometry.doors.forEach(d => console.log(d.id));
