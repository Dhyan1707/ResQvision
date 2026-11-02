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

    win.webContents.on('console-message', (e, lvl, msg) => console.log('RENDERER:', msg));
    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        await win.webContents.executeJavaScript('document.getElementById("nav3DTab").click();');
        await new Promise(r => setTimeout(r, 1000));

        // Click First Floor button directly
        const clickRes = await win.webContents.executeJavaScript(`
            const btn = document.getElementById('btnFloor1');
            btn.click();
            ({
                btn1Classes: btn.className,
                btn0Classes: document.getElementById('btnFloor0').className,
                currentLevel: window.currentFloorLevel
            });
        `);
        console.log('After clicking btnFloor1:', clickRes);

        await new Promise(r => setTimeout(r, 1500));

        const img = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/clicked_btn_floor_1.png', img.toPNG());
        console.log('Saved clicked_btn_floor_1.png');
        app.quit();
    });
});
