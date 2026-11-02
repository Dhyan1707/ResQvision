const fs = require('fs');
let content = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');

// Find by searching for the line where currentMapData = response.data
const lines = content.split('\n');
let foundLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('currentMapData =') && lines[i+1] && lines[i+1].includes('response.data')) {
        foundLine = i;
        console.log('Found at line', i+1, ':', lines[i].trim());
        console.log('Next line', i+2, ':', lines[i+1].trim());
        // Insert window.buildingData and window.currentMapData after this block
        // Find the closing } of this if block
        let j = i + 2;
        while (j < lines.length && !lines[j].includes('}')) j++;
        console.log('Closing brace at line', j+1, ':', lines[j].trim());
        // Insert after response.data; line
        lines.splice(i + 2, 0,
            '',
            '    // Make building data available globally for ThreeDViewer click handlers',
            '    window.buildingData = currentMapData;',
            '    window.currentMapData = currentMapData;'
        );
        content = lines.join('\n');
        fs.writeFileSync('./src/renderer/js/renderer.js', content, 'utf8');
        console.log('Done');
        break;
    }
}
if (foundLine === -1) {
    // Search for response.data assignments directly
    lines.forEach((l, i) => {
        if (l.includes('response.data')) console.log(i+1, ':', l.trim());
    });
}
