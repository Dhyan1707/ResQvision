const fs = require('fs'); 
let f = fs.readFileSync('src/renderer/js/renderer.js', 'utf8'); 
let lines = f.split('\n');

// clear duplicate lines inserted earlier
lines[4200] = "if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter(n => n && n.type === 'room').length; totalExits += floor.nodes.filter(n => n && (n.type === 'exit' || n.isExit)).length; }";
lines[4201] = "";

// add correctly to the second place
lines.splice(4529, 0, "                if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter(n => n && n.type === 'room').length; totalExits += floor.nodes.filter(n => n && (n.type === 'exit' || n.isExit)).length; }");

fs.writeFileSync('src/renderer/js/renderer.js', lines.join('\n'));
