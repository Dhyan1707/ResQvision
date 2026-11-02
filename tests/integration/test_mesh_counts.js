const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
    });
    win.webContents.on('console-message', (e, lvl, msg) => console.log('RENDERER:', msg));
    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));
    win.webContents.on('did-finish-load', async () => {
        await win.webContents.executeJavaScript('document.getElementById("nav3DTab").click();');
        await new Promise(r => setTimeout(r, 1000));
        
        const res = await win.webContents.executeJavaScript(`
            selectFloor(0);
            const m0 = threeDViewer.buildingGroup.children.length;
            selectFloor(1);
            const m1 = threeDViewer.buildingGroup.children.length;
            const b1Active = document.getElementById('btnFloor1').classList.contains('active');
            const b0Active = document.getElementById('btnFloor0').classList.contains('active');
            const b1Text = document.getElementById('btnFloor1').textContent;
            ({ m0, m1, b1Active, b0Active, b1Text });
        `);
        console.log('Result:', JSON.stringify(res));

        // Let's render and capture Floor 1
        await new Promise(r => setTimeout(r, 1000));
        const img1 = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/verified_floor_1.png', img1.toPNG());

        // Now select Floor 0
        await win.webContents.executeJavaScript('selectFloor(0);');
        await new Promise(r => setTimeout(r, 1000));
        const img0 = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/verified_floor_0.png', img0.toPNG());

        app.quit();
    });
});
