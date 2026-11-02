const fs = require('fs');
let content = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');

const target2D = 'mainDashboard.style.display = "grid";';
const rep2D = 'mainDashboard.setAttribute("style", "display: grid !important;");';
content = content.replace(target2D, rep2D);

const target3DHide2D = 'page3DView.style.display = "none";';
const rep3DHide2D = 'page3DView.setAttribute("style", "display: none !important;");';
content = content.replace(target3DHide2D, rep3DHide2D);

const target3DHideMain = 'mainDashboard.style.display = "none";';
const rep3DHideMain = 'mainDashboard.setAttribute("style", "display: none !important;");';
content = content.replace(target3DHideMain, rep3DHideMain);

const target3DShow3D = 'page3DView.style.display = "block";';
const rep3DShow3D = 'page3DView.setAttribute("style", "display: flex !important;");';
content = content.replace(target3DShow3D, rep3DShow3D);

fs.writeFileSync('./src/renderer/js/renderer.js', content, 'utf8');
console.log('Fixed tab switching logic with !important setAttribute.');
