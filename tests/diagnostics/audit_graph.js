// Audit: check if G_DOOR_SOM_NODE exists in buildingData and is connected to G_STAIRS_NODE_S / G_EAST_EXIT
const path = require('path');
const fs = require('fs');
let bDataPath = path.resolve(__dirname, '../../desktop-app/src/models/buildingData.js');
if (!fs.existsSync(bDataPath)) bDataPath = path.resolve(__dirname, '../src/models/buildingData.js');
const buildingData = require(bDataPath);

// 1. Find G_DOOR_SOM_NODE
let somNode = null;
let somFloor = null;
buildingData.floors.forEach((floor, fIdx) => {
    if (floor.nodes) {
        const n = floor.nodes.find(n => n && n.id === 'G_DOOR_SOM_NODE');
        if (n) { somNode = n; somFloor = fIdx; }
    }
});
console.log('G_DOOR_SOM_NODE found:', !!somNode, 'on floor index:', somFloor);
if (somNode) console.log('  position: x='+somNode.x+', z='+somNode.z);

// 2. Find G_STAIRS_NODE_S and G_EAST_EXIT
['G_STAIRS_NODE_S', 'G_EAST_EXIT', 'G_ENTRANCE', 'G_STAIRS_NODE_N'].forEach(id => {
    let found = false;
    buildingData.floors.forEach((floor, fIdx) => {
        if (floor.nodes) {
            const n = floor.nodes.find(n => n && n.id === id);
            if (n) { found = true; console.log(id + ' found on floor ' + fIdx + ' x=' + n.x + ' z=' + n.z); }
        }
    });
    if (!found) console.log(id + ' NOT FOUND in any floor');
});

// 3. Check m3Connections on ground floor (fIdx 0) for G_DOOR_SOM_NODE
const groundFloor = buildingData.floors[0];
console.log('\nGround floor m3Connections involving G_DOOR_SOM_NODE:');
if (groundFloor && groundFloor.m3Connections) {
    const conns = groundFloor.m3Connections.filter(c => c.from === 'G_DOOR_SOM_NODE' || c.to === 'G_DOOR_SOM_NODE');
    if (conns.length === 0) console.log('  NONE - G_DOOR_SOM_NODE has NO connections!');
    conns.forEach(c => console.log('  ', c.from, '->', c.to));
} else {
    console.log('  No m3Connections on ground floor');
}

// 4. Build the full graph and do BFS from G_DOOR_SOM_NODE
const graph = new Map();
buildingData.floors.forEach(floor => {
    if (floor.nodes) {
        floor.nodes.forEach(n => { if(n) graph.set(n.id, new Set()); });
    }
});
buildingData.floors.forEach(floor => {
    if (floor.m3Connections) {
        floor.m3Connections.forEach(c => {
            if (graph.has(c.from) && graph.has(c.to)) {
                graph.get(c.from).add(c.to);
                graph.get(c.to).add(c.from);
            }
        });
    }
});
if (buildingData.m3InterFloorConnections) {
    buildingData.m3InterFloorConnections.forEach(c => {
        if (graph.has(c.from) && graph.has(c.to)) {
            graph.get(c.from).add(c.to);
            graph.get(c.to).add(c.from);
        }
    });
}

// BFS from G_DOOR_SOM_NODE
const targets = ['G_STAIRS_NODE_S', 'G_EAST_EXIT', 'G_ENTRANCE', 'G_STAIRS_NODE_N'];
const visited = new Set();
const queue = ['G_DOOR_SOM_NODE'];
const parent = { 'G_DOOR_SOM_NODE': null };
visited.add('G_DOOR_SOM_NODE');

while (queue.length > 0) {
    const cur = queue.shift();
    const neighbors = graph.get(cur) || new Set();
    for (const nb of neighbors) {
        if (!visited.has(nb)) {
            visited.add(nb);
            parent[nb] = cur;
            queue.push(nb);
        }
    }
}

console.log('\nBFS from G_DOOR_SOM_NODE:');
console.log('Total nodes reachable:', visited.size);
targets.forEach(t => {
    if (visited.has(t)) {
        // Reconstruct path
        const path = [];
        let cur = t;
        while (cur !== null) { path.unshift(cur); cur = parent[cur]; }
        console.log(t + ': REACHABLE via ' + path.length + ' hops: ' + path.slice(0, 5).join(' -> ') + (path.length > 5 ? '...' : ''));
    } else {
        console.log(t + ': NOT REACHABLE');
        // Check direct neighbors of G_DOOR_SOM_NODE
        console.log('  G_DOOR_SOM_NODE neighbors:', [...(graph.get('G_DOOR_SOM_NODE') || [])].join(', ') || 'NONE');
    }
});
