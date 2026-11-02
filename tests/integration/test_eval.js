const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.webContents.on('console-message', (event, level, message) => {
        console.log(`[RENDERER CONSOLE]: ${message}`);
    });

    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        const res = await win.webContents.executeJavaScript(`
            ({
                hasBuildingData: !!window.buildingData,
                hasBuildingDataVar: typeof buildingData !== 'undefined',
                buildingDataFloors: (window.buildingData && window.buildingData.floors) ? window.buildingData.floors.length : 0,
                currentFloorLevel: window.currentFloorLevel,
                btnFloor0_active: document.getElementById('btnFloor0')?.classList.contains('active'),
                btnFloor1_active: document.getElementById('btnFloor1')?.classList.contains('active')
            })
        `);
        console.log('EVAL RESULT:', res);

        // Test clicking each button
        for (let i = 0; i <= 5; i++) {
            const clickRes = await win.webContents.executeJavaScript(`
                (function() {
                    const btn = document.getElementById('btnFloor${i}');
                    if (btn) btn.click();
                    return {
                        clicked: !!btn,
                        currentFloorLevel: window.currentFloorLevel,
                        threeDViewerChildren: window.threeDViewer ? window.threeDViewer.buildingGroup.children.length : -1,
                        activeBtn: document.querySelector('.floor-btn.active')?.dataset.floor
                    };
                })()
            `);
            console.log(`After click btnFloor${i}:`, clickRes);
        }

        app.quit();
    });
});
