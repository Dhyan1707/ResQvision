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
buildingData.floors[2].nodes.filter(n => n.type !== 'door').forEach(n => console.log(n.id, n.name, n.type));
