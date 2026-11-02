const fs = require('fs'); 
let f = fs.readFileSync('src/renderer/js/renderer.js', 'utf8'); 
f = f.replace(/if \(\s*Array\.isArray\(\s*floor\.rooms\s*\)\s*\) \{[\s\S]*?totalExits \+=\s*floor\.exits\.length;\s*\}/, "if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter(n => n && n.type === 'room').length; totalExits += floor.nodes.filter(n => n && (n.type === 'exit' || n.isExit)).length; }\n$&"); 
f = f.replace("pathfinder = new M4Pathfinder(window.buildingData);", "const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);\n            pathfinder = new M4Pathfinder(bData);");
f = f.replace("const exitNodes = allNodes.filter(n => n.type === 'exit');", "const exitNodes = allNodes.filter(n => n && (n.type === 'exit' || n.isExit));");
fs.writeFileSync('src/renderer/js/renderer.js', f);
