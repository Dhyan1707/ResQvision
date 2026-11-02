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

    win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    win.webContents.on('did-finish-load', async () => {
        await win.webContents.executeJavaScript('document.getElementById("nav3DTab").click();');
        await new Promise(r => setTimeout(r, 1000));

        // Adjust camera to look down with top-down or high angle view and capture Floor 0
        await win.webContents.executeJavaScript(`
            selectFloor(0);
            if (threeDViewer) {
                threeDViewer.camera.position.set(0, 140, 20);
                threeDViewer.camera.lookAt(0, 0, 0);
                if (threeDViewer.controls) {
                    threeDViewer.controls.target.set(0, 0, 0);
                    threeDViewer.controls.update();
                }
            }
        `);
        await new Promise(r => setTimeout(r, 800));
        let img0 = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/topdown_floor_0.png', img0.toPNG());
        console.log('Saved topdown_floor_0.png');

        // Adjust camera and capture Floor 1
        await win.webContents.executeJavaScript(`
            selectFloor(1);
            if (threeDViewer) {
                threeDViewer.camera.position.set(0, 140, 20);
                threeDViewer.camera.lookAt(0, 0, 0);
                if (threeDViewer.controls) {
                    threeDViewer.controls.target.set(0, 0, 0);
                    threeDViewer.controls.update();
                }
            }
        `);
        await new Promise(r => setTimeout(r, 800));
        let img1 = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/topdown_floor_1.png', img1.toPNG());
        console.log('Saved topdown_floor_1.png');

        // Step 3: Back to Floor 0
        await win.webContents.executeJavaScript(`
            selectFloor(0);
            if (threeDViewer) {
                threeDViewer.camera.position.set(0, 140, 20);
                threeDViewer.camera.lookAt(0, 0, 0);
                if (threeDViewer.controls) {
                    threeDViewer.controls.target.set(0, 0, 0);
                    threeDViewer.controls.update();
                }
            }
        `);
        await new Promise(r => setTimeout(r, 800));
        let img0_again = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/topdown_floor_0_again.png', img0_again.toPNG());
        console.log('Saved topdown_floor_0_again.png');

        // Step 4: Back to Floor 1
        await win.webContents.executeJavaScript(`
            selectFloor(1);
            if (threeDViewer) {
                threeDViewer.camera.position.set(0, 140, 20);
                threeDViewer.camera.lookAt(0, 0, 0);
                if (threeDViewer.controls) {
                    threeDViewer.controls.target.set(0, 0, 0);
                    threeDViewer.controls.update();
                }
            }
        `);
        await new Promise(r => setTimeout(r, 800));
        let img1_again = await win.webContents.capturePage();
        fs.writeFileSync('test_screenshots/topdown_floor_1_again.png', img1_again.toPNG());
        console.log('Saved topdown_floor_1_again.png');

        app.quit();
    });
});
