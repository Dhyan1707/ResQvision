const fs = require('fs');
const js = fs.readFileSync('./src/models/buildingData.js', 'utf8');
const lines = js.split('\n');
console.log('Total lines:', lines.length);
// Check first 20 lines
for (let i = 0; i < 20; i++) {
    console.log(i + 1 + ':', lines[i]?.trim());
}
// Check if it exports or sets a variable
const exportIdx = js.indexOf('module.exports');
const windowIdx = js.indexOf('window.buildingData');
const constIdx = js.indexOf('const buildingData');
const varIdx = js.indexOf('var buildingData');
const letIdx = js.indexOf('let buildingData');
console.log('\nexportIdx:', exportIdx);
console.log('windowIdx:', windowIdx);
console.log('constIdx:', constIdx);
console.log('varIdx:', varIdx);
console.log('letIdx:', letIdx);
