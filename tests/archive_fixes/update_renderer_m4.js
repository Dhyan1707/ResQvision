const fs = require('fs');

let f = fs.readFileSync('src/renderer/js/renderer.js', 'utf8');

// 1. Define let victimAgent = null;
if (!f.includes('let victimAgent = null;')) {
    f = f.replace('let threeDViewer = null;', 'let threeDViewer = null;\nlet victimAgent = null;\nlet pathfinder = null;');
}

// 2. Instantiate VictimAgent and M4Pathfinder when threeDViewer is created
if (!f.includes('victimAgent = new VictimAgent(threeDViewer);')) {
    f = f.replace("threeDViewer = new ThreeDViewer('threeDContainer');", 
                  "threeDViewer = new ThreeDViewer('threeDContainer');\n        victimAgent = new VictimAgent(threeDViewer);\n        pathfinder = new M4Pathfinder(window.buildingData);\n");
}

// 3. Setup threeDViewer.onFloorClicked
if (!f.includes('threeDViewer.onFloorClicked = ')) {
    f = f.replace('victimAgent = new VictimAgent(threeDViewer);',
                  "victimAgent = new VictimAgent(threeDViewer);\n        threeDViewer.onFloorClicked = (position, nearestNodeId) => {\n            victimAgent.spawnAtPosition(position, nearestNodeId);\n            document.getElementById('routeStatus').textContent = 'Victim Placed. Ready for Evacuation.';\n            document.getElementById('currentLocation').textContent = nearestNodeId;\n        };");
}

// 4. Update btnSpawnVictim listener
let spawnRegex = /document\.getElementById\("btnSpawnVictim"\)\?\.addEventListener\("click", \(\) => \{[\s\S]*?\}\);/;
f = f.replace(spawnRegex, `document.getElementById("btnSpawnVictim")?.addEventListener("click", () => {
            if (threeDViewer) {
                threeDViewer.victimPlacementMode = true;
                threeDViewer.renderer.domElement.style.cursor = 'crosshair';
                document.getElementById('routeStatus').textContent = 'Click on a floor to place victim.';
                document.getElementById('routeMessage').textContent = 'Awaiting placement...';
            }
        });`);

// 5. Update btnRunEvacuation listener
let evacRegex = /document\.getElementById\("btnRunEvacuation"\)\?\.addEventListener\("click", \(\) => \{[\s\S]*?\}\);/;
f = f.replace(evacRegex, `document.getElementById("btnRunEvacuation")?.addEventListener("click", () => {
            if (!victimAgent || victimAgent.status !== 'IDLE') {
                document.getElementById('routeMessage').textContent = 'Spawn a victim first.';
                alert('Please spawn a victim first.');
                return;
            }
            
            const startNodeId = victimAgent.currentNodeId;
            if (!startNodeId) {
                alert('Victim is not properly placed on a valid node.');
                return;
            }
            
            document.getElementById('routeStatus').textContent = 'Calculating Route...';
            
            // Re-instantiate pathfinder to ensure fresh graph state
            pathfinder = new M4Pathfinder(window.buildingData);
            
            // Find valid exit
            const allNodes = pathfinder.getAllNodes();
            const exitNodes = allNodes.filter(n => n.type === 'exit');
            let bestResult = null;
            
            exitNodes.forEach(exit => {
                const result = pathfinder.findPath(startNodeId, exit.id);
                if (result.success && (!bestResult || result.cost < bestResult.cost)) {
                    bestResult = result;
                }
            });
            
            if (bestResult && bestResult.success) {
                // Draw route
                threeDViewer.drawRoute(bestResult.path);
                
                // Move victim
                victimAgent.setPath(bestResult.path);
                victimAgent.status = 'EVACUATING';
                
                document.getElementById('routeStatus').textContent = 'Evacuating...';
                document.getElementById('nearestExit').textContent = bestResult.path[bestResult.path.length-1];
                document.getElementById('routeDistance').textContent = bestResult.cost.toFixed(2) + 'm';
                document.getElementById('routeMessage').textContent = 'Evacuation route successfully calculated and followed.';
                
            } else {
                victimAgent.status = 'NO_ROUTE';
                document.getElementById('routeStatus').textContent = 'NO ROUTE';
                document.getElementById('routeMessage').textContent = 'No evacuation route available. Victim is trapped.';
                alert('No evacuation route available.');
            }
        });`);

// 6. Update victimAgent in render loop
let renderRegex = /if \(typeof threeDViewer !== 'undefined' && threeDViewer\) \{\n\s*threeDViewer\.animate\(\);\n\s*\}/;
f = f.replace('// We can use requestAnimationFrame here if needed, but ThreeDViewer has its own render loop.', 
              `if (victimAgent) victimAgent.update();\n        // We can use requestAnimationFrame here if needed...`);
// Let's find a better place to call victimAgent.update(). ThreeDViewer has animate loop!
fs.writeFileSync('src/renderer/js/renderer.js', f);
console.log("Replaced event listeners in renderer.js");
