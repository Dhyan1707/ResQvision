const fs = require('fs');
let b = fs.readFileSync('src/models/buildingData.js', 'utf8');

b = b.replace(/id:\s*['"]G_STAIRS_NODE_N['"],\s*type:\s*['"]staircase['"]/g, "id: 'G_STAIRS_NODE_N',\n          type: 'staircase',\n          isExit: true");
b = b.replace(/id:\s*['"]G_STAIRS_NODE_S['"],\s*type:\s*['"]staircase['"]/g, "id: 'G_STAIRS_NODE_S',\n          type: 'staircase',\n          isExit: true");
b = b.replace(/id:\s*['"]G_EAST_EXIT['"],\s*type:\s*['"]exit['"]/g, "id: 'G_EAST_EXIT',\n          type: 'staircase',\n          isExit: true");

fs.writeFileSync('src/models/buildingData.js', b);
