const fs = require('fs'); 
let f = fs.readFileSync('src/renderer/js/renderer.js', 'utf8'); 
f = f.replace(/if \(\s*Array\.isArray\(\s*floor\.rooms\s*\)\s*\) \{[\s\S]*?totalExits \+=\s*floor\.exits\.length;\s*\}/g, "if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter(n => n && n.type === 'room').length; totalExits += floor.nodes.filter(n => n && (n.type === 'exit' || n.isExit)).length; }\n$&"); 
fs.writeFileSync('src/renderer/js/renderer.js', f);
