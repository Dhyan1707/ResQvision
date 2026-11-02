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
        await new Promise(r => setTimeout(r, 1500));
        const img = await win.webContents.capturePage();
        if (!fs.existsSync('test_screenshots')) fs.mkdirSync('test_screenshots');
        fs.writeFileSync('test_screenshots/initial_load.png', img.toPNG());
        console.log('Saved initial_load.png');
        app.quit();
    });
});
