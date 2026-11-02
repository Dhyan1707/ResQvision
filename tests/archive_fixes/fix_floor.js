const fs = require('fs');
let lines = fs.readFileSync('src/renderer/js/renderer.js', 'utf8').split('\n');

// Find the erroneous line that is outside the loop
const badIndex = lines.findIndex(l => l.includes("if (Array.isArray(floor.nodes)) { totalRooms +="));

if (badIndex !== -1) {
    const code = lines.splice(badIndex, 1)[0]; // Remove it
    
    // Find building.floors.forEach(floor => { ...
    const loopIndex = lines.findIndex(l => l.includes("floor => {"));
    if (loopIndex !== -1) {
        lines.splice(loopIndex + 1, 0, code); // Insert inside the loop
    }
}

fs.writeFileSync('src/renderer/js/renderer.js', lines.join('\n'));
