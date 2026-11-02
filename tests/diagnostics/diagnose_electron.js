const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
    const desktopDir = path.resolve(__dirname, '../../desktop-app');
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        webPreferences: {
            preload: path.join(desktopDir, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(desktopDir, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        console.log('Renderer loaded successfully in Electron window!');

        // Run inspection inside the renderer context
        const results = await win.webContents.executeJavaScript(`
            (async function() {
                const logs = [];
                function log(msg) { logs.push(msg); }

                log("Checking initial state...");
                log("window.currentFloorLevel = " + window.currentFloorLevel);
                log("threeDViewer exists: " + (typeof threeDViewer !== 'undefined' && threeDViewer !== null));
                
                if (!threeDViewer) {
                    return { logs, error: "threeDViewer is null!" };
                }

                // Switch to 3D tab
                document.getElementById('nav3DTab')?.click();
                log("Switched to 3D tab");

                // Test clicking each floor button from btnFloor0 to btnFloor5
                const floorChecks = [];
                for (let lvl = 0; lvl <= 5; lvl++) {
                    const btn = document.getElementById('btnFloor' + lvl);
                    if (!btn) {
                        log("ERROR: btnFloor" + lvl + " not found!");
                        continue;
                    }
                    
                    // Click the button
                    btn.click();
                    
                    // Wait a moment for any DOM or rendering updates
                    await new Promise(r => setTimeout(r, 50));
                    
                    const group = threeDViewer.buildingGroup;
                    const childrenCount = group ? group.children.length : 0;
                    
                    // Collect first few wall coordinates to verify they are distinct
                    const wallCoords = [];
                    if (group) {
                        group.children.forEach(c => {
                            if (c.geometry && c.geometry.type === 'BoxGeometry' && c.position.y > 0.4) {
                                wallCoords.push({
                                    x: Math.round(c.position.x * 10) / 10,
                                    y: Math.round(c.position.y * 10) / 10,
                                    z: Math.round(c.position.z * 10) / 10
                                });
                            }
                        });
                    }
                    
                    floorChecks.push({
                        level: lvl,
                        currentFloorLevel: window.currentFloorLevel,
                        floorLabel: document.getElementById('floorNumber')?.textContent,
                        childrenCount: childrenCount,
                        wallMeshesCount: wallCoords.length,
                        sampleWalls: wallCoords.slice(0, 5)
                    });
                }

                return { logs, floorChecks };
            })()
        `);

        console.log('--- RENDERER EXECUTION LOGS ---');
        console.log(results.logs.join('\n'));
        console.log('\n--- FLOOR CHECKS ---');
        console.log(JSON.stringify(results.floorChecks, null, 2));

        app.quit();
    });
});
