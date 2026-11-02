const buildingData = require('./src/models/buildingData.js');
const bData = (typeof buildingData === 'object' && buildingData.floors) ? buildingData : global.buildingData;
const M4Pathfinder = require('./src/ai/pathfinding.js');
const pf = new M4Pathfinder(bData);

function linesIntersect(p1, p2, p3, p4) {
  function ccw(A, B, C) {
    return (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
  }
  return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}

// Distance from point to line segment
function distPointToSegment(p, a, b) {
  const l2 = (b.x - a.x) ** 2 + (b.z - a.z) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.z - a.z);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.z - a.z) * (b.z - a.z)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.z - (a.z + t * (b.z - a.z)));
}

(async () => {
  // Test multiple rooms on different floors
  const testNodes = ['F6_TERRACE', 'G_WORKSHOP', 'G_ADMIN', 'F3_CLASS_301', 'F1_CLASS_101'];
  for (const startId of testNodes) {
    if (!pf.nodes.has(startId)) continue;
    const result = await pf.findSafestPathM9(startId, 'G_ENTRANCE', null);
    const path = result.path;
    console.log(`\n=== Testing path from ${startId} (${path.length} nodes) ===`);
    for (let i = 0; i < path.length - 1; i++) {
      const idA = path[i];
      const idB = path[i+1];
      const nA = pf.nodes.get(idA);
      const nB = pf.nodes.get(idB);
      if (nA.floorIndex !== nB.floorIndex) continue;
      const floor = bData.floors[nA.floorIndex];
      if (!floor.geometry || !floor.geometry.walls) continue;

      floor.geometry.walls.forEach(w => {
        // Exclude walls with doors where the path passes through the door
        const p3 = { x: w.x1, z: w.z1 };
        const p4 = { x: w.x2, z: w.z2 };
        if (linesIntersect(nA, nB, p3, p4)) {
          // Check if there is an actual door opening near the intersection
          let nearDoor = false;
          if (floor.geometry.doors) {
            floor.geometry.doors.forEach(d => {
              if (distPointToSegment(d, nA, nB) < (d.width || 3.0)) {
                nearDoor = true;
              }
            });
          }
          console.log(`COLLISION! Floor ${nA.floorIndex}: [${idA}] -> [${idB}] intersects ${w.id} (door nearby: ${nearDoor})`);
        }
      });
    }
  }
})();
