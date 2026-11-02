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

    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        console.log('Page loaded, switching to 3D tab...');
        
        await win.webContents.executeJavaScript(`
            document.getElementById('nav3DTab').click();
        `);

        // Wait 1.5 seconds for Three.js initialization and resize
        await new Promise(r => setTimeout(r, 1500));

        const screenshotDir = path.join(__dirname, 'test_screenshots');
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

        // Debug diagnostic check
        const diag = await win.webContents.executeJavaScript(`
            ({
                hasThreeDViewer: typeof threeDViewer !== 'undefined',
                hasSelectFloor: typeof selectFloor === 'function',
                hasBuildingData: typeof buildingData !== 'undefined',
                floorsInBuildingData: (typeof buildingData !== 'undefined' && buildingData.floors) ? buildingData.floors.length : 0,
                currentFloorLevel: window.currentFloorLevel
            });
        `);
        console.log('Diagnostic:', JSON.stringify(diag));

        // Sequence: Ground (0) -> First (1) -> Ground (0) -> First (1)
        const testSequence = [
            { level: 0, tag: 'step1_ground' },
            { level: 1, tag: 'step2_first' },
            { level: 0, tag: 'step3_ground' },
            { level: 1, tag: 'step4_first' }
        ];

        for (const step of testSequence) {
            console.log(`\n=== Selecting Floor Level ${step.level} (${step.tag}) ===`);
            
            const info = await win.webContents.executeJavaScript(`
                const btn = document.getElementById('btnFloor' + ${step.level});
                if (btn) {
                    btn.click();
                } else {
                    selectFloor(${step.level});
                }
                
                ({
                    currentFloorLevel: window.currentFloorLevel,
                    activeBtnText: document.querySelector('.floor-btn.active') ? document.querySelector('.floor-btn.active').textContent : null,
                    floorLabelText: document.getElementById('floorNumber') ? document.getElementById('floorNumber').textContent : null
                });
            `);

            console.log(`Clicked floor ${step.level}:`, JSON.stringify(info));

            // Wait 1200ms for Three.js render frame
            await new Promise(r => setTimeout(r, 1200));

            const image = await win.webContents.capturePage();
            const filePath = path.join(screenshotDir, `verify_${step.tag}.png`);
            fs.writeFileSync(filePath, image.toPNG());
            const stat = fs.statSync(filePath);
            console.log(`Saved ${filePath} (size: ${stat.size} bytes)`);
        }

        console.log('\nVerification sequence completed!');
        app.quit();
    });
});
