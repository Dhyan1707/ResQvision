const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.webContents.on('console-message', (e, level, msg) => {
        console.log(`[BROWSER]: ${msg}`);
    });

    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        // Wait 1.5 seconds for all initial scripts to run
        await new Promise(r => setTimeout(r, 1500));

        console.log('\n--- Switching to 3D Viewport ---');
        await win.webContents.executeJavaScript(`document.getElementById('nav3DTab').click();`);
        await new Promise(r => setTimeout(r, 500));

        for (let lvl = 0; lvl <= 5; lvl++) {
            console.log(`\n================ STEP: CLICK FLOOR ${lvl} ================`);
            
            const beforeState = await win.webContents.executeJavaScript(`
                ({
                    currentFloorLevel: window.currentFloorLevel,
                    childrenCount: window.threeDViewer ? window.threeDViewer.buildingGroup.children.length : -1
                })
            `);
            console.log(`Before clicking btnFloor${lvl}:`, beforeState);

            // Actually click the button in DOM
            await win.webContents.executeJavaScript(`
                const btn = document.getElementById('btnFloor${lvl}');
                if (btn) {
                    btn.click();
                } else {
                    console.error('Button btnFloor${lvl} not found!');
                }
            `);

            await new Promise(r => setTimeout(r, 800));

            const afterState = await win.webContents.executeJavaScript(`
                (function() {
                    const group = window.threeDViewer ? window.threeDViewer.buildingGroup : null;
                    const wallBoxes = [];
                    if (group) {
                        group.children.forEach(c => {
                            if (c.geometry && c.geometry.type === 'BoxGeometry' && c.position.y > 0.4) {
                                wallBoxes.push({
                                    pos: [Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z)],
                                    size: [Math.round(c.geometry.parameters.width), Math.round(c.geometry.parameters.height), Math.round(c.geometry.parameters.depth)]
                                });
                            }
                        });
                    }
                    return {
                        currentFloorLevel: window.currentFloorLevel,
                        floorLabelText: document.getElementById('floorNumber')?.textContent,
                        activeBtn: document.querySelector('.floor-btn.active')?.dataset.floor,
                        totalChildren: group ? group.children.length : 0,
                        wallCount: wallBoxes.length,
                        sampleWalls: wallBoxes.slice(0, 3)
                    };
                })()
            `);
            console.log(`After clicking btnFloor${lvl}:`, afterState);

            // Capture screenshot
            const img = await win.webContents.capturePage();
            fs.writeFileSync(`test_screenshots/real_click_floor_${lvl}.png`, img.toPNG());
            console.log(`Captured test_screenshots/real_click_floor_${lvl}.png`);
        }

        app.quit();
    });
});
