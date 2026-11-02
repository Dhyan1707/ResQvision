const fs = require('fs');
const js = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');
const lines = js.split('\n');
lines.forEach((line, i) => {
    if (line.includes('display: grid') || line.includes('display = "grid"')) {
        console.log(i + 1 + ':', line.trim());
    }
});
