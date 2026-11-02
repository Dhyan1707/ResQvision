

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

        // Wait 1 second for resize and render
        await new Promise(r => setTimeout(r, 1000));

        const screenshotDir = path.join(__dirname, 'test_screenshots');
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

        for (let lvl = 0; lvl <= 7; lvl++) {
            console.log('Selecting Floor ' + lvl + '...');

            await win.webContents.executeJavaScript(`
                selectFloor(${lvl});
            `);

            // Wait 600ms for Three.js render frame
            await new Promise(r => setTimeout(r, 600));

            const image = await win.webContents.capturePage();
            const filePath = path.join(screenshotDir, `floor_${lvl}.png`);
            fs.writeFileSync(filePath, image.toPNG());
            const stat = fs.statSync(filePath);
            console.log(`Saved ${filePath} (size: ${stat.size} bytes)`);
        }

        console.log('All screenshots captured!');
        app.quit();
    });
});
