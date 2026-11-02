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

// Stats
let totalNodes = 0;
let doors = 0, rooms = 0, corridors = 0, stairs = 0, exits = 0;
let sameFloorConnections = 0;
let disconnectedNodes = 0;
let invalidConnections = 0;
let questionableConnections = 0;
let interFloorConnections = buildingData.m3InterFloorConnections ? buildingData.m3InterFloorConnections.length : 0;

function ccw(A, B, C) {
    return (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
}
function doSegmentsIntersect(p1, p2, p3, p4) {
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}
function distToSegmentSquared(p, v, w) {
    let l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.z - w.z, 2);
    if (l2 === 0) return Math.pow(p.x - v.x, 2) + Math.pow(p.z - v.z, 2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.z - v.z) * (w.z - v.z)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.z - (v.z + t * (w.z - v.z)), 2);
}
function hasLineOfSight(p1, p2, walls) {
    for (let wall of walls) {
        const w1 = { x: wall.x1, z: wall.z1 };
        const w2 = { x: wall.x2, z: wall.z2 };
        const dist1 = distToSegmentSquared(p1, w1, w2);
        const dist2 = distToSegmentSquared(p2, w1, w2);
        if (dist1 < 0.1 || dist2 < 0.1) continue;
        if (doSegmentsIntersect(p1, p2, w1, w2)) return false;
    }
    return true;
}

const issues = [];

buildingData.floors.forEach((floor, index) => {
    floor.nodes.forEach(n => {
        totalNodes++;
        if (n.type === 'door') doors++;
        else if (n.type === 'room') rooms++;
        else if (n.type === 'corridor') corridors++;
        else if (n.type === 'staircase') stairs++;
        else if (n.type === 'exit') exits++;
    });

    if (!floor.m3Connections) return;
    sameFloorConnections += floor.m3Connections.length;
    
    // Check disconnected
    const connectedIds = new Set();
    floor.m3Connections.forEach(c => {
        connectedIds.add(c.from);
        connectedIds.add(c.to);
    });
    floor.nodes.forEach(n => {
        if (!connectedIds.has(n.id)) {
            disconnectedNodes++;
            // Don't flag exits/rooms as physically invalid just disconnected
        }
    });

    // Check validity
    floor.m3Connections.forEach(c => {
        let n1 = floor.nodes.find(n => n && n.id === c.from);
        let n2 = floor.nodes.find(n => n && n.id === c.to);
        if (!n1 || !n2) {
            invalidConnections++;
            issues.push("FLOOR: " + index + "\\nNODE/CONNECTION: " + c.from + " -> " + c.to + "\\nPROBLEM: Node missing\\nEXPECTED PHYSICAL RELATIONSHIP: Both nodes exist.");
            return;
        }
        
        if (!hasLineOfSight(n1, n2, floor.geometry.walls)) {
            invalidConnections++;
            issues.push("FLOOR: " + index + "\\nNODE/CONNECTION: " + c.from + " -> " + c.to + "\\nPROBLEM: Path crosses wall.\\nEXPECTED PHYSICAL RELATIONSHIP: Unobstructed line of sight.");
        }

        // Semantic check
        const types = [n1.type, n2.type].sort().join('-');
        if (types === 'room-room' || types === 'corridor-room') {
            questionableConnections++;
            issues.push("FLOOR: " + index + "\\nNODE/CONNECTION: " + c.from + " -> " + c.to + "\\nPROBLEM: Semantic structure violation (" + types + ")\\nEXPECTED PHYSICAL RELATIONSHIP: ROOM -> DOOR -> CORRIDOR.");
        }
        if (types === 'door-staircase' || types === 'staircase-staircase') {
            // Door to stair is fine.
        }
        
    });
});

console.log('Total navigation nodes:', totalNodes);
console.log('Door nodes:', doors);
console.log('Room nodes:', rooms);
console.log('Corridor nodes:', corridors);
console.log('Stair nodes:', stairs);
console.log('Exit nodes:', exits);
console.log('Same-floor M3 connections:', sameFloorConnections);
console.log('Inter-floor M3 connections:', interFloorConnections);
console.log('Disconnected nodes:', disconnectedNodes);
console.log('Physically invalid connections:', invalidConnections);
console.log('Semantically questionable connections:', questionableConnections);

if (invalidConnections === 0 && questionableConnections === 0) {
    console.log('\\nM3 FINAL VALIDATION: PASS');
} else {
    console.log('\\nM3 FINAL VALIDATION: ISSUES FOUND');
    issues.forEach(i => console.log(i + '\\n'));
}
