const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        show: false,
        webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
    });
    win.webContents.on('console-message', (e, lvl, msg) => console.log('RENDERER:', msg));
    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));
    win.webContents.on('did-finish-load', async () => {
        const res = await win.webContents.executeJavaScript(`
            console.log('Testing selectFloor from page');
            selectFloor(1);
            ({
                level: window.currentFloorLevel,
                btn1Active: document.getElementById('btnFloor1').classList.contains('active'),
                btn0Active: document.getElementById('btnFloor0').classList.contains('active')
            });
        `);
        console.log('Result:', JSON.stringify(res));
        app.quit();
    });
});
