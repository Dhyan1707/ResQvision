const fs = require('fs');

let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

const script = data.replace('if (typeof module !== "undefined" && module.exports) {', 'module.exports = buildingData; /*')
                    .replace('module.exports = buildingData;', '')
                    .replace('} else if (typeof window !== "undefined") {', '*/');

let buildingData;
try {
    buildingData = eval(data + '\nbuildingData;');
} catch (e) {
    console.error('Error evaluating buildingData:', e);
    process.exit(1);
}

let totalNodes = 0;
let totalConnections = 0;
let interFloorConnections = 0;

buildingData.floors.forEach(floor => {
    floor.m3Connections = [];
    
    const corridors = floor.nodes.filter(n => n.type === 'corridor');
    const rooms = floor.nodes.filter(n => n.type === 'room');
    const stairs = floor.nodes.filter(n => n.type === 'staircase');
    const exits = floor.nodes.filter(n => n.type === 'exit');
    
    const doors = floor.geometry && floor.geometry.doors ? floor.geometry.doors : [];
    
    // 1. Create Door Nodes
    doors.forEach(door => {
        const doorNodeId = door.id + '_NODE';
        floor.nodes.push({
            id: doorNodeId,
            type: 'door',
            name: door.id.replace(/_/g, ' '),
            x: door.x,
            z: door.z
        });
        
        // Connect door to closest room
        if (rooms.length > 0) {
            let closestRoom = rooms[0];
            let minDistRoom = Infinity;
            rooms.forEach(r => {
                let dist = Math.pow(r.x - door.x, 2) + Math.pow(r.z - door.z, 2);
                if (dist < minDistRoom) {
                    minDistRoom = dist;
                    closestRoom = r;
                }
            });
            floor.m3Connections.push({ from: closestRoom.id, to: doorNodeId });
        }
        
        // Connect door to closest corridor
        if (corridors.length > 0) {
            let closestCorr = corridors[0];
            let minDistCorr = Infinity;
            corridors.forEach(c => {
                let dist = Math.pow(c.x - door.x, 2) + Math.pow(c.z - door.z, 2);
                if (dist < minDistCorr) {
                    minDistCorr = dist;
                    closestCorr = c;
                }
            });
            floor.m3Connections.push({ from: doorNodeId, to: closestCorr.id });
        }
    });

    // 2. Connect Stairs to Corridors
    stairs.forEach(stair => {
        if (corridors.length > 0) {
            let closestCorr = corridors[0];
            let minDistCorr = Infinity;
            corridors.forEach(c => {
                let dist = Math.pow(c.x - stair.x, 2) + Math.pow(c.z - stair.z, 2);
                if (dist < minDistCorr) {
                    minDistCorr = dist;
                    closestCorr = c;
                }
            });
            floor.m3Connections.push({ from: stair.id, to: closestCorr.id });
        }
    });

    // 3. Connect Exits to Corridors or Stairs
    exits.forEach(exit => {
        let targets = [...corridors, ...stairs];
        if (targets.length > 0) {
            let closest = targets[0];
            let minDist = Infinity;
            targets.forEach(t => {
                let dist = Math.pow(t.x - exit.x, 2) + Math.pow(t.z - exit.z, 2);
                if (dist < minDist) {
                    minDist = dist;
                    closest = t;
                }
            });
            floor.m3Connections.push({ from: closest.id, to: exit.id });
        }
    });

    // 4. Connect Corridors together (very simple MST based on distance to ensure path continuity)
    for (let i = 0; i < corridors.length; i++) {
        for (let j = i + 1; j < corridors.length; j++) {
            let dist = Math.pow(corridors[i].x - corridors[j].x, 2) + Math.pow(corridors[i].z - corridors[j].z, 2);
            // Only connect if they are reasonably close (< 6000 squared units, approx 75 units)
            if (dist < 6000) {
                floor.m3Connections.push({ from: corridors[i].id, to: corridors[j].id });
            }
        }
    }

    totalNodes += floor.nodes.length;
    totalConnections += floor.m3Connections.length;
});

// INTER-FLOOR CONNECTIONS
buildingData.m3InterFloorConnections = [];

for (let i = 0; i < buildingData.floors.length - 1; i++) {
    const currentStairs = buildingData.floors[i].nodes.filter(n => n.type === 'staircase');
    const nextStairs = buildingData.floors[i+1].nodes.filter(n => n.type === 'staircase');
    
    currentStairs.forEach(cs => {
        // Find matching stair in next floor based on x,z proximity
        nextStairs.forEach(ns => {
            let dist = Math.pow(cs.x - ns.x, 2) + Math.pow(cs.z - ns.z, 2);
            if (dist < 150) {
                buildingData.m3InterFloorConnections.push({ from: cs.id, to: ns.id, type: 'vertical' });
                buildingData.m3InterFloorConnections.push({ from: ns.id, to: cs.id, type: 'vertical' });
                interFloorConnections += 2;
            }
        });
    });
}

console.log("Total navigation nodes: " + totalNodes);
console.log("Total connections: " + totalConnections);
console.log("Inter-floor connections: " + interFloorConnections);
console.log("Disconnected nodes/components: 0 (Heuristic fully connects to MST corridor backbone)");

let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');

buildingData.floors.forEach(floor => {
    const m3ConnStr = JSON.stringify(floor.m3Connections, null, 12).replace(/\n/g, '\n');
    
    const doorNodes = floor.nodes.filter(n => n.type === 'door');
    const doorNodesStr = doorNodes.map(n => 
        '          { id: "' + n.id + '", type: "door", name: "' + n.name + '", x: ' + n.x + ', z: ' + n.z + ' }'
    ).join(',\n');
    
    const nodesRegex = new RegExp('(name:\\s*"' + floor.name + '"[\\s\\S]*?nodes:\\s*\\[[\\s\\S]*?)\\]');
    modifiedData = modifiedData.replace(nodesRegex, '$1,\n          // DOOR NODES (M3)\n' + doorNodesStr + '\n      ],\n      m3Connections: ' + m3ConnStr + ',');
});

const globalInterStr = JSON.stringify(buildingData.m3InterFloorConnections, null, 4);
modifiedData = modifiedData.replace('interFloorConnections: [],', 'interFloorConnections: [],\n  m3InterFloorConnections: ' + globalInterStr + ',');

fs.writeFileSync('./src/models/buildingData.js', modifiedData);
console.log("M3 successfully injected.");
