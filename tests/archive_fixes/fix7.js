const fs = require('fs');
let b = fs.readFileSync('src/models/buildingData.js', 'utf8');

const replacement = `m3InterFloorConnections: [
  {
    from: 'G_STAIRS_NODE_N',
    to: 'F1_STAIRS_MAIN_NODE',
    type: 'vertical'
  },
  {
    from: 'F1_STAIRS_MAIN_NODE',
    to: 'G_STAIRS_NODE_N',
    type: 'vertical'
  },`;

b = b.replace(/m3InterFloorConnections\:\s*\[/, replacement);

fs.writeFileSync('src/models/buildingData.js', b);
