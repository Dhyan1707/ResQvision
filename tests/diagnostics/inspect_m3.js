const fs = require('fs');
const data = fs.readFileSync('./src/models/buildingData.js', 'utf8');

const doorNodeMatches = data.match(/type:\s*["']door["']/g);
const m3DoorNodes = doorNodeMatches ? doorNodeMatches.length : 0;

const allNodeMatches = data.match(/type:\s*["'](room|corridor|staircase|exit|door)["']/g);
const totalNodes = allNodeMatches ? allNodeMatches.length : 0;

const m3ConnMatches = data.match(/m3Connections:\s*\[([\s\S]*?)\]/g);
let m3ConnCount = 0;
if (m3ConnMatches) {
    m3ConnMatches.forEach(block => {
        const conns = block.match(/from:/g);
        if (conns) m3ConnCount += conns.length;
    });
}

const interMatches = data.match(/m3InterFloorConnections:\s*\[([\s\S]*?)\]/);
let interCount = 0;
if (interMatches && interMatches[1]) {
    const conns = interMatches[1].match(/from:/g);
    if (conns) interCount = conns.length;
}

console.log('Total Nodes:', totalNodes);
console.log('M3 Door Nodes added:', m3DoorNodes);
console.log('M3 Connections:', m3ConnCount);
console.log('InterFloor Connections:', interCount);
