const fs = require('fs');
let lines = fs.readFileSync('src/renderer/js/renderer.js', 'utf8').split('\n');

// Find the loop for exits counting
const startIdx = lines.findIndex(l => l.includes("totalFloors ="));
if (startIdx !== -1) {
    const loopIdx = lines.findIndex((l, i) => i > startIdx && l.includes("floor => {"));
    if (loopIdx !== -1) {
        lines.splice(loopIdx + 1, 0, "                if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter(n => n && n.type === 'room').length; totalExits += floor.nodes.filter(n => n && (n.type === 'exit' || n.isExit)).length; }");
    }
}

// Ensure line 4200 is gone completely if it refers to totalRooms before definition
const idx4200 = lines.findIndex(l => l.includes("if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter"));
if (idx4200 !== -1 && idx4200 < startIdx) {
    lines.splice(idx4200, 1);
}

fs.writeFileSync('src/renderer/js/renderer.js', lines.join('\n'));
