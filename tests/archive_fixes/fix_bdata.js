const fs = require('fs');
let content = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');

const regex = /const bData = window\.currentMapData \|\| window\.buildingData \|\| \(typeof buildingData !== 'undefined' \? buildingData : null\);/g;
const replacement = "const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);";

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('./src/renderer/js/renderer.js', content, 'utf8');
    console.log('Fixed setupViewCompleteBuilding bData!');
} else {
    console.log('Target regex not found in renderer.js');
}
