const fs = require('fs');
let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');
data = data.replace(/\\"/g, '"');
fs.writeFileSync('./src/models/buildingData.js', data);
console.log('Fixed escaped quotes.');
