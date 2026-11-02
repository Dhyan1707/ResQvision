const fs = require('fs');

let data = fs.readFileSync('./src/models/buildingData.js', 'utf8');
let bd;
try {
    eval(data.replace('if (typeof module', 'bd = buildingData; /*') + '\n*/');
} catch (e) {
    console.error('Error', e);
    process.exit(1);
}

const getStairs = (idx) => bd.floors[idx].nodes ? bd.floors[idx].nodes.filter(n => n && n.type === 'staircase') : [];

let f0Stairs = getStairs(0);
let f1Stairs = getStairs(1);
let f3Stairs = getStairs(3);

console.log("F0 STAIRS:");
f0Stairs.forEach(s => console.log(`${s.id}: (${s.x.toFixed(2)}, ${s.z.toFixed(2)})`));

console.log("\nF1 STAIRS:");
f1Stairs.forEach(s => console.log(`${s.id}: (${s.x.toFixed(2)}, ${s.z.toFixed(2)})`));

console.log("\nF3 STAIRS:");
f3Stairs.forEach(s => console.log(`${s.id}: (${s.x.toFixed(2)}, ${s.z.toFixed(2)})`));
