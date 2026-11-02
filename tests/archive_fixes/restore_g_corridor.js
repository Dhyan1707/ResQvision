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

function ccw(A, B, C) {
    return (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
}
function intersect(A, B, C, D) {
    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}
function distToSegmentSquared(p, v, w) {
    let l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.z - w.z, 2);
    if (l2 === 0) return Math.pow(p.x - v.x, 2) + Math.pow(p.z - v.z, 2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.z - v.z) * (w.z - v.z)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.z - (v.z + t * (w.z - v.z)), 2);
}
function hasLineOfSight(n1, n2, walls) {
    for (let w of walls) {
        if (!w.x1) continue;
        let p1 = {x: w.x1, z: w.z1};
        let p2 = {x: w.x2, z: w.z2};
        
        let d1 = distToSegmentSquared(n1, p1, p2);
        let d2 = distToSegmentSquared(n2, p1, p2);
        if (d1 < 0.1 || d2 < 0.1) continue;

        if (intersect(n1, n2, p1, p2)) return false;
    }
    return true;
}

let floor = buildingData.floors[0];
let targets = ['G_CORRIDOR', 'G_DOOR_STAIR_N_CORR_NODE', 'G_DOOR_STAIR_S_CORR_NODE'];

targets.forEach(t => {
    let startNode = floor.nodes.find(n => n && n.id === t);
    if (!startNode) return;
    
    floor.nodes.forEach(candidate => {
        if (!candidate || candidate.id === t) return;
        if (hasLineOfSight(startNode, candidate, floor.geometry.walls)) {
            // Check if edge exists
            let exists = floor.m3Connections.some(c => (c.from === t && c.to === candidate.id) || (c.to === t && c.from === candidate.id));
            if (!exists) {
                floor.m3Connections.push({ from: t, to: candidate.id });
            }
        }
    });
    // In case no line of sight, just connect to nearest node
    let hasEdges = floor.m3Connections.some(c => c.from === t || c.to === t);
    if (!hasEdges) {
        let nearest = floor.nodes.filter(n => n && n.id !== t).sort((a,b) => (Math.pow(a.x-startNode.x,2)+Math.pow(a.z-startNode.z,2)) - (Math.pow(b.x-startNode.x,2)+Math.pow(b.z-startNode.z,2)))[0];
        if (nearest) {
            floor.m3Connections.push({ from: t, to: nearest.id });
        }
    }
});

let m3ConnStrings = [];
buildingData.floors.forEach(f => {
    m3ConnStrings.push(JSON.stringify(f.m3Connections, null, 12).replace(/\n/g, '\n'));
});

let modifiedData = fs.readFileSync('./src/models/buildingData.js', 'utf8');
let matchIdx = 0;
modifiedData = modifiedData.replace(/m3Connections:\s*\[[\s\S]*?\]/g, (match) => {
    let rep = 'm3Connections: ' + m3ConnStrings[matchIdx];
    matchIdx++;
    return rep;
});
fs.writeFileSync('./src/models/buildingData.js', modifiedData);
console.log("Restored G_CORRIDOR connections.");
