const fs = require('fs');
const html = fs.readFileSync('./src/renderer/index.html', 'utf8');
const countMD = html.split('id="mainDashboard"').length - 1;
const countP3D = html.split('id="page3DView"').length - 1;
const countMC = html.split('id="mapContainer"').length - 1;

console.log('mainDashboard count:', countMD);
console.log('page3DView count:', countP3D);
console.log('mapContainer count:', countMC);
