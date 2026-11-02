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

    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[RENDERER CONSOLE]: ${message} (line ${line}, ${sourceId})`);
    });

    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        console.log('Page loaded, switching to 3D tab...');
        
        await win.webContents.executeJavaScript(`
            document.getElementById('nav3DTab').click();
        `);

        await new Promise(r => setTimeout(r, 1500));

        console.log('Calling selectFloor(1) with try/catch...');
        const testRes = await win.webContents.executeJavaScript(`
            try {
                selectFloor(1);
                "SUCCESS_FLOOR_1";
            } catch(err) {
                "ERROR: " + err.message + "\\n" + err.stack;
            }
        `);
        console.log('Result of selectFloor(1):', testRes);

        const screenshotDir = path.join(__dirname, 'test_screenshots');
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

        const image = await win.webContents.capturePage();
        const filePath = path.join(screenshotDir, `test_select_1.png`);
        fs.writeFileSync(filePath, image.toPNG());
        console.log(`Saved ${filePath}`);

        app.quit();
    });
});
