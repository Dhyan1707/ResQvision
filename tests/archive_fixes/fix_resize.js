const fs = require('fs');
let content = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');

const t1 = 'window.dispatchEvent(new Event("resize"));';
const t2 = 'setTimeout(() => { window.dispatchEvent(new Event("resize")); }, 100);';

content = content.replace(t1, t2);

fs.writeFileSync('./src/renderer/js/renderer.js', content, 'utf8');
console.log('Fixed renderer.js resize timeout');
