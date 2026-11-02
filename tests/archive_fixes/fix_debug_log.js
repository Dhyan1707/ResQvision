const fs = require('fs');
let content = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');

const idx = content.indexOf('M9 START DEBUG');
if (idx !== -1) {
    // Find the start of the console.log line (go back to find the console.log)
    const logStart = content.lastIndexOf('console.log', idx);
    // Find the end - look for ');' after the backtick close
    const afterIdx = idx;
    let end = content.indexOf(');', afterIdx);
    end = end + 2; // include ');\n'

    const oldPart = content.substring(logStart, end);
    console.log('OLD PART (first 100):', oldPart.substring(0, 100));

    const newPart = `if (victimAgent && victimAgent.victimMesh) {\n                console.log('M9 START: victim at x=' + victimAgent.victimMesh.position.x.toFixed(2) + ' z=' + victimAgent.victimMesh.position.z.toFixed(2) + ' startNode=' + startNodeId);\n            }`;

    content = content.substring(0, logStart) + newPart + content.substring(end);
    fs.writeFileSync('./src/renderer/js/renderer.js', content, 'utf8');
    console.log('Done - replaced debug log with null-safe version');
} else {
    console.log('Not found');
}
