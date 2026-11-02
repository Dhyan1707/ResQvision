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
let floor = buildingData.floors[0];

// The connections to remove
let badPairs = [
    ['G_CORRIDOR', 'G_STAIRS_NODE_N'],
    ['G_CORRIDOR', 'G_STAIRS_NODE_S'],
    ['G_CORRIDOR', 'G_DOOR_STAIR_N_NODE'],
    ['G_CORRIDOR', 'G_DOOR_STAIR_S_NODE'],
    ['G_DOOR_STAIR_N_CORR_NODE', 'G_HANDICAP_TOILET'],
    ['G_DOOR_STAIR_N_CORR_NODE', 'G_STAIRS_NODE_N'],
    ['G_DOOR_STAIR_N_CORR_NODE', 'G_STAIRS_NODE_S'],
    ['G_DOOR_STAIR_N_CORR_NODE', 'G_DOOR_HANDICAP_NODE'],
    ['G_DOOR_STAIR_N_CORR_NODE', 'G_DOOR_STAIR_S_NODE'],
    ['G_DOOR_STAIR_S_CORR_NODE', 'G_HANDICAP_TOILET'],
    ['G_DOOR_STAIR_S_CORR_NODE', 'G_STAIRS_NODE_N'],
    ['G_DOOR_STAIR_S_CORR_NODE', 'G_STAIRS_NODE_S'],
    ['G_DOOR_STAIR_S_CORR_NODE', 'G_DOOR_STAIR_N_NODE']
];

floor.m3Connections = floor.m3Connections.filter(c => {
    return !badPairs.some(pair => (c.from === pair[0] && c.to === pair[1]) || (c.from === pair[1] && c.to === pair[0]));
});

// Now they are disconnected. Let's find ONE node they can connect to without crossing walls.
// We will explicitly check hasLineOfSight as defined in final_audit_m3.js
function ccw(A, B, C) {
    return (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
}
function intersect(A, B, C, D) {
    return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
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
        if (intersect(p1, p2, w1, w2)) return false;
    }
    return true;
}

let toFix = ['G_DOOR_STAIR_N_CORR_NODE', 'G_DOOR_STAIR_S_CORR_NODE', 'G_CORRIDOR'];
toFix.forEach(t => {
    let hasEdges = floor.m3Connections.some(c => c.from === t || c.to === t);
    if (!hasEdges) {
        let n1 = floor.nodes.find(n => n && n.id === t);
        let valid = floor.nodes.find(n => n && n.id !== t && hasLineOfSight(n1, n, floor.geometry.walls));
        if (valid) {
            floor.m3Connections.push({ from: t, to: valid.id });
        } else {
            console.log("STILL NO VALID PATH FOR " + t);
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
console.log("Filtered and fixed properly.");
