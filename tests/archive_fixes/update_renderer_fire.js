const fs = require('fs');
let f = fs.readFileSync('src/renderer/js/renderer.js', 'utf8');

// Hook up onFireClicked
if (!f.includes('threeDViewer.onFireClicked = ')) {
    f = f.replace("threeDViewer.onFloorClicked =", "threeDViewer.onFireClicked = (pos, floorIdx) => {\n            threeDViewer.spawnFireAtPosition(pos, floorIdx);\n            document.getElementById('routeMessage').textContent = 'Fire ignited and spreading.';\n        };\n        threeDViewer.onFloorClicked =");
}

// Update btnSpawnVictim listener
let spawnRegex = /document\.getElementById\("btnSpawnVictim"\)\?\.addEventListener\("click", \(\) => \{[\s\S]*?\}\);/;
f = f.replace(spawnRegex, `document.getElementById("btnSpawnVictim")?.addEventListener("click", () => {
            if (threeDViewer) {
                threeDViewer.victimPlacementMode = true;
                threeDViewer.firePlacementMode = false;
                threeDViewer.renderer.domElement.style.cursor = 'crosshair';
                document.getElementById('routeStatus').textContent = 'Click on a floor to place victim.';
                document.getElementById('routeMessage').textContent = 'Awaiting placement...';
            }
        });`);

// Update btnIgniteFire listener
let igniteRegex = /document\.getElementById\("btnIgniteFire"\)\?\.addEventListener\("click", \(\) => \{[\s\S]*?\}\);/;
f = f.replace(igniteRegex, `document.getElementById("btnIgniteFire")?.addEventListener("click", () => {
            if (threeDViewer) {
                threeDViewer.firePlacementMode = true;
                threeDViewer.victimPlacementMode = false;
                threeDViewer.renderer.domElement.style.cursor = 'crosshair';
                document.getElementById('routeStatus').textContent = 'Click on a floor to ignite fire.';
                document.getElementById('routeMessage').textContent = 'Awaiting fire placement...';
            }
        });`);

fs.writeFileSync('src/renderer/js/renderer.js', f);
console.log("Updated renderer.js for fire placement");
