const fs = require('fs');
let b = fs.readFileSync('src/models/buildingData.js', 'utf8');

// Replace the multiline block
b = b.replace(/\{\s*"from":\s*"F1_STAIRS_EAST_NODE",\s*"to":\s*"F3_STAIRS_EAST_NODE",\s*"type":\s*"vertical"\s*\},?/g, '');
b = b.replace(/\{\s*"from":\s*"F3_STAIRS_EAST_NODE",\s*"to":\s*"F1_STAIRS_EAST_NODE",\s*"type":\s*"vertical"\s*\},?/g, '');

fs.writeFileSync('src/models/buildingData.js', b);
