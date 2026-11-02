const fs = require('fs');
let b = fs.readFileSync('src/models/buildingData.js', 'utf8');

// Change type of F1_STAIRS_EAST_NODE
b = b.replace(/id:\s*['"]F1_STAIRS_EAST_NODE['"],\s*type:\s*['"]staircase['"]/g, "id: 'F1_STAIRS_EAST_NODE',\n          type: 'corridor'");

// Remove F1_STAIRS_EAST_NODE from m3InterFloorConnections (both directions)
b = b.replace(/\{\s*from:\s*['"]F1_STAIRS_EAST_NODE['"],\s*to:\s*['"]F3_STAIRS_EAST_NODE['"][^\}]*\},?/g, '');
b = b.replace(/\{\s*from:\s*['"]F3_STAIRS_EAST_NODE['"],\s*to:\s*['"]F1_STAIRS_EAST_NODE['"][^\}]*\},?/g, '');

// The replacement might leave trailing commas or empty spots in arrays, let's clean up double commas if they exist
b = b.replace(/,\s*,/g, ',');

fs.writeFileSync('src/models/buildingData.js', b);
