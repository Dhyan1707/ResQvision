const fs = require('fs');
const html = fs.readFileSync('./src/renderer/index.html', 'utf8');
const mainEnd = html.indexOf('</main>');
const p2d = html.indexOf('id="page2DView"');
console.log('</main> at:', mainEnd, 'page2DView at:', p2d);
