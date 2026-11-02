const fs = require('fs');
const html = fs.readFileSync('./src/renderer/index.html', 'utf8');
const mainDashboard = html.indexOf('id="mainDashboard"');
const page2DView = html.indexOf('id="page2DView"');
const mapContainer = html.indexOf('id="mapContainer"');
const mainEnd = html.indexOf('</main>');

console.log('mainDashboard starts at:', mainDashboard);
console.log('page2DView starts at:', page2DView);
console.log('mapContainer starts at:', mapContainer);
console.log('mainDashboard ends at:', mainEnd);
