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

// Ensure the 47 nodes are connected

buildingData.floors.forEach((floor, index) => {
    if (!floor.m3Connections) return;
    
    const connectedIds = new Set();
    floor.m3Connections.forEach(c => {
        connectedIds.add(c.from);
        connectedIds.add(c.to);
    });
    
    const isolated = floor.nodes.filter(n => !connectedIds.has(n.id));
    
    isolated.forEach(n => {
        if (index === 0) {
            // Ground Floor
            if (n.id === 'G_ENTRANCE') {
                floor.m3Connections.push({ from: 'G_CORRIDOR', to: 'G_ENTRANCE' });
            } else if (n.id === 'G_EAST_EXIT') {
                floor.m3Connections.push({ from: 'G_DOOR_EAST_EXIT_NODE', to: 'G_EAST_EXIT' });
                floor.m3Connections.push({ from: 'G_CORRIDOR', to: 'G_DOOR_EAST_EXIT_NODE' });
            } else if (n.id === 'G_DOOR_EXT_W_NODE') {
                floor.m3Connections.push({ from: 'G_CORRIDOR', to: 'G_DOOR_EXT_W_NODE' });
            }
        }
        else if (index === 2) {
            // Floor 2 has only doors. Connect them in a chain/proximity graph so they aren't isolated
            // Connect to the closest other door node
            let closestDoor = floor.nodes.filter(d => d.type === 'door' && d.id !== n.id)
                .sort((a,b) => (Math.pow(a.x-n.x,2)+Math.pow(a.z-n.z,2)) - (Math.pow(b.x-n.x,2)+Math.pow(b.z-n.z,2)))[0];
            if (closestDoor) {
                floor.m3Connections.push({ from: n.id, to: closestDoor.id });
            }
        }
        else {
            // Floors 3 to 7
            if (n.type === 'room' || n.type === 'staircase') {
                // Find matching door by name
                let doorPrefix = n.id.replace('F' + index + '_', '');
                let door = floor.nodes.find(d => d.id === 'F' + index + '_D_' + doorPrefix + '_NODE');
                
                // Special mappings
                if (n.id === 'F3_CLASSROOM_17') door = floor.nodes.find(d => d.id === 'F3_D_CLASS_17_NODE');
                if (n.id === 'F3_DRAWING_HALL') door = floor.nodes.find(d => d.id === 'F3_D_DRAWING_NODE');
                if (n.id === 'F3_STAIRS_MAIN_NODE') door = floor.nodes.find(d => d.id === 'F3_D_TOILET_BOYS_NODE'); // fallback
                if (n.id === 'F4_CLASSROOM_17') door = floor.nodes.find(d => d.id === 'F4_D_CLASS_17_NODE');
                if (n.id === 'F4_DRAWING_HALL') door = floor.nodes.find(d => d.id === 'F4_D_DRAWING_NODE');
                if (n.id === 'F4_STAIRS_MAIN_NODE') door = floor.nodes.find(d => d.id === 'F4_D_TOILET_BOYS_NODE'); // fallback
                if (n.id === 'F5_BAGGAGE') door = floor.nodes.find(d => d.id === 'F5_D_BAGGAGE_NODE');
                
                // If not found, use closest door
                if (!door) {
                    door = floor.nodes.filter(d => d.type === 'door').sort((a,b) => (Math.pow(a.x-n.x,2)+Math.pow(a.z-n.z,2)) - (Math.pow(b.x-n.x,2)+Math.pow(b.z-n.z,2)))[0];
                }
                
                if (door) {
                    floor.m3Connections.push({ from: n.id, to: door.id });
                    // Make sure the door is also connected to a corridor
                    let closestCorr = floor.nodes.filter(c => c.type === 'corridor').sort((a,b) => (Math.pow(a.x-door.x,2)+Math.pow(a.z-door.z,2)) - (Math.pow(b.x-door.x,2)+Math.pow(b.z-door.z,2)))[0];
                    if (closestCorr) {
                        floor.m3Connections.push({ from: door.id, to: closestCorr.id });
                    }
                }
            }
        }
    });
});

let m3ConnStrings = [];
buildingData.floors.forEach(floor => {
    // deduplicate
    let uniqueConns = [];
    let seen = new Set();
    floor.m3Connections.forEach(c => {
        // Ensure bidirectional/undirected logic is respected or just deduplicate exactly
        let key1 = c.from + '-' + c.to;
        let key2 = c.to + '-' + c.from;
        if (!seen.has(key1) && !seen.has(key2)) {
            seen.add(key1);
            uniqueConns.push(c);
        }
    });
    floor.m3Connections = uniqueConns;
    m3ConnStrings.push(JSON.stringify(uniqueConns, null, 12).replace(/\n/g, '\n'));
});

let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
let matchIdx = 0;
modifiedData = modifiedData.replace(/m3Connections:\s*\[[\s\S]*?\]/g, (match) => {
    let rep = 'm3Connections: ' + m3ConnStrings[matchIdx];
    matchIdx++;
    return rep;
});

fs.writeFileSync('./src/models/buildingData.js', modifiedData);
console.log("Fixes applied successfully.");
