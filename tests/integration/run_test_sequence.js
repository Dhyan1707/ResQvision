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
        await win.webContents.executeJavaScript('document.getElementById("nav3DTab").click();');
        await new Promise(r => setTimeout(r, 1000));

        // Step 1: select Floor 0
        await win.webContents.executeJavaScript('selectFloor(0);');
        await new Promise(r => setTimeout(r, 1200));
        let img0 = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/fresh_floor_0.png', img0.toPNG());
        console.log('Saved fresh_floor_0.png');

        // Step 2: select Floor 1
        await win.webContents.executeJavaScript('selectFloor(1);');
        await new Promise(r => setTimeout(r, 1200));
        let img1 = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/fresh_floor_1.png', img1.toPNG());
        console.log('Saved fresh_floor_1.png');

        // Step 3: back to Floor 0
        await win.webContents.executeJavaScript('selectFloor(0);');
        await new Promise(r => setTimeout(r, 1200));
        let img0_again = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/fresh_floor_0_again.png', img0_again.toPNG());
        console.log('Saved fresh_floor_0_again.png');

        // Step 4: back to Floor 1
        await win.webContents.executeJavaScript('selectFloor(1);');
        await new Promise(r => setTimeout(r, 1200));
        let img1_again = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/fresh_floor_1_again.png', img1_again.toPNG());
        console.log('Saved fresh_floor_1_again.png');

        app.quit();
    });
});
