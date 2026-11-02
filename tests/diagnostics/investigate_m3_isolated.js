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

buildingData.floors.forEach((floor, index) => {
    if (!floor.m3Connections) return;
    
    const connectedIds = new Set();
    floor.m3Connections.forEach(c => {
        connectedIds.add(c.from);
        connectedIds.add(c.to);
    });
    
    floor.nodes.forEach(n => {
        if (!connectedIds.has(n.id)) {
            // Check if there is a door on this floor that corresponds to this node (e.g. by name)
            const closestDoor = floor.nodes.filter(dn => dn.type === 'door').sort((a,b) => 
                (Math.pow(a.x-n.x,2)+Math.pow(a.z-n.z,2)) - (Math.pow(b.x-n.x,2)+Math.pow(b.z-n.z,2))
            )[0];
            let dist = closestDoor ? Math.sqrt(Math.pow(closestDoor.x-n.x,2)+Math.pow(closestDoor.z-n.z,2)).toFixed(2) : 'N/A';
            
            console.log("FLOOR: " + index + " | ID: " + n.id + " | TYPE: " + n.type + " | NAME: " + n.name + " | Closest Door: " + (closestDoor ? closestDoor.id : 'None') + " (Dist: " + dist + ")");
        }
    });
});
