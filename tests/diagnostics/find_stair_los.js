const fs = require('fs');
let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');
const script = data.replace('if (typeof module !== "undefined" && module.exports) {', 'module.exports = buildingData; /*')
                   .replace('module.exports = buildingData;', '')
                   .replace('} else if (typeof window !== "undefined") {', '*/');
let buildingData;
try {
    buildingData = eval(data + '\nbuildingData;');
} catch (e) {
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
let t = 'G_DOOR_STAIR_N_CORR_NODE';
let startNode = floor.nodes.find(n => n && n.id === t);
console.log("Checking line of sight for " + t);
floor.nodes.forEach(candidate => {
    if (!candidate || candidate.id === t) return;
    if (hasLineOfSight(startNode, candidate, floor.geometry.walls)) {
        console.log("-> " + candidate.id);
    }
});
