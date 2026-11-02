const fs = require('fs');
let f = fs.readFileSync('src/renderer/js/renderer.js', 'utf8');

// Find the line that selects exits
f = f.replace(
  "const exitNodes = allNodes.filter(n => n && (n.type === 'exit' || n.isExit));",
  "const exitNodes = allNodes.filter(n => n && ((n.type === 'exit' || n.isExit) && n.type !== 'staircase'));"
);

fs.writeFileSync('src/renderer/js/renderer.js', f);
