const fs = require('fs');
const data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

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

// Helper: Line intersection
function doLineSegmentsIntersect(p1, p2, p3, p4) {
    const ccw = (A, B, C) => (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}

let totalCheckedNodes = 0;
let totalCheckedConnections = 0;
const issues = [];
const questionable = [];
const wallIntersections = [];

buildingData.floors.forEach((floor, index) => {
    totalCheckedNodes += floor.nodes.length;
    
    if (!floor.m3Connections) return;
    totalCheckedConnections += floor.m3Connections.length;

    const walls = floor.geometry.walls;

    floor.m3Connections.forEach(conn => {
        const fromNode = floor.nodes.find(n => n.id === conn.from);
        const toNode = floor.nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) {
            issues.push({ floor: index, node: conn.from, connection: conn, reason: 'Missing node' });
            return;
        }

        // Check wall intersection
        const p1 = { x: fromNode.x, z: fromNode.z };
        const p2 = { x: toNode.x, z: toNode.z };
        
        let intersectsWall = false;
        let wallName = '';
        
        for (let wall of walls) {
            // Ignore small thickness, just check main segment
            const w1 = { x: wall.x1, z: wall.z1 };
            const w2 = { x: wall.x2, z: wall.z2 };
            
            // If one of the nodes IS the door, and the door is ON this wall, it might technically intersect.
            // We should add a small tolerance or exclude the wall the door is on, but doors don't have wallId in nodes.
            // Actually, if it's a collinear door, intersection might trigger if we're not careful.
            
            if (doLineSegmentsIntersect(p1, p2, w1, w2)) {
                // If it's a door on this wall, the distance to the wall segment is 0.
                // We'll just flag it to review.
                intersectsWall = true;
                wallName = wall.id;
                break;
            }
        }
        
        if (intersectsWall) {
            wallIntersections.push({
                floor: index,
                node: conn.from,
                connection: conn.to,
                expected: 'No intersection',
                reason: 'Path crosses wall ' + wallName,
                evidence: 'Path from (' + p1.x + ', ' + p1.z + ') to (' + p2.x + ', ' + p2.z + ') intersects ' + wallName
            });
        }
        
        // Logical checks
        const types = [fromNode.type, toNode.type].sort().join('-');
        if (types === 'door-door') {
            questionable.push({ floor: index, node: conn.from, connection: conn.to, reason: 'Door connected directly to door' });
        }
        if (types === 'room-room') {
            questionable.push({ floor: index, node: conn.from, connection: conn.to, reason: 'Room connected directly to room without door' });
        }
        if (types === 'corridor-room') {
            questionable.push({ floor: index, node: conn.from, connection: conn.to, reason: 'Room connected directly to corridor without door' });
        }
    });
});

console.log('A. Total M3 nodes checked:', totalCheckedNodes);
console.log('B. Total same-floor connections checked:', totalCheckedConnections);
console.log('C. Total inter-floor connections checked:', buildingData.m3InterFloorConnections ? buildingData.m3InterFloorConnections.length : 0);
console.log('D. Physically verified connections (no intersection):', totalCheckedConnections - wallIntersections.length);
console.log('E. Mathematically connected but physically questionable:', questionable.length);
console.log('F. Connections passing through walls:', wallIntersections.length);

if (wallIntersections.length > 0 || questionable.length > 0) {
    console.log("M3 PHYSICAL VALIDATION FOUND ISSUES — NO CHANGES APPLIED.\\n");
    console.log("=== WALL INTERSECTIONS ===");
    wallIntersections.forEach(w => {
        console.log("FLOOR: " + w.floor + "\\nNODE: " + w.node + "\\nCONNECTION: " + w.connection + "\\nEXPECTED CONNECTION: " + w.expected + "\\nREASON: " + w.reason + "\\nBLUEPRINT/GEOMETRY EVIDENCE: " + w.evidence + "\\n");
    });
    console.log("=== QUESTIONABLE ===");
    questionable.forEach(q => {
        console.log("FLOOR: " + q.floor + "\\nNODE: " + q.node + "\\nCONNECTION: " + q.connection + "\\nREASON: " + q.reason + "\\n");
    });
} else {
    console.log("M3 PHYSICAL VALIDATION PASSED — NO CHANGES REQUIRED.");
}
