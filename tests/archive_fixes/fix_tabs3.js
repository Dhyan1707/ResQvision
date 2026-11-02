const fs = require('fs');
let content = fs.readFileSync('./src/renderer/js/renderer.js', 'utf8');

const t2D = `        nav2DTab?.addEventListener("click", () => {
            mainDashboard.setAttribute("style", "display: grid !important;");
            page3DView.setAttribute("style", "display: none !important;");`;

const r2D = `        nav2DTab?.addEventListener("click", () => {
            document.getElementById("mainDashboard")?.setAttribute("style", "display: grid !important;");
            document.getElementById("page3DView")?.setAttribute("style", "display: none !important;");
            document.querySelectorAll(".dashboard").forEach(el => el.setAttribute("style", "display: grid !important;"));`;

content = content.replace(t2D, r2D);

const t3D = `        nav3DTab?.addEventListener("click", () => {
            mainDashboard.setAttribute("style", "display: none !important;");
            page3DView.setAttribute("style", "display: flex !important;");`;

const r3D = `        nav3DTab?.addEventListener("click", () => {
            document.getElementById("mainDashboard")?.setAttribute("style", "display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; left: -9999px !important; z-index: -9999 !important;");
            document.getElementById("page3DView")?.setAttribute("style", "display: flex !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 9999 !important;");
            document.querySelectorAll(".dashboard").forEach(el => el.setAttribute("style", "display: none !important; visibility: hidden !important;"));`;

content = content.replace(t3D, r3D);

fs.writeFileSync('./src/renderer/js/renderer.js', content, 'utf8');
console.log('Fixed explicitly');
