const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const buildingData = require('./src/models/buildingData.js');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1000,
    height: 500,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const level3 = buildingData.floors.find(f => f.level === 3);

  const html = `
    <html>
      <body style="margin: 0; background: white; display: flex; justify-content: center; align-items: center; height: 100vh;">
        <canvas id="canvas" width="900" height="400"></canvas>
        <script>
          const { ipcRenderer } = require('electron');
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          
          const walls = ${JSON.stringify(level3.geometry.walls)};
          const stairs = ${JSON.stringify(level3.geometry.stairs)};
          const lifts = ${JSON.stringify(level3.geometry.lifts)};
          
          const scale = 4.5;
          const cx = 450;
          const cz = 200;
          
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 900, 400);
          
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'black';
          
          walls.forEach(w => {
             ctx.beginPath();
             ctx.moveTo(cx + w.x1 * scale, cz + w.z1 * scale);
             ctx.lineTo(cx + w.x2 * scale, cz + w.z2 * scale);
             ctx.stroke();
          });
          
          ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
          ctx.strokeStyle = 'blue';
          stairs.forEach(s => {
             const x = cx + (s.x - s.width/2) * scale;
             const z = cz + (s.z - s.depth/2) * scale;
             ctx.fillRect(x, z, s.width * scale, s.depth * scale);
             ctx.strokeRect(x, z, s.width * scale, s.depth * scale);
          });
          
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.strokeStyle = 'red';
          lifts.forEach(l => {
             const x = cx + (l.x - l.width/2) * scale;
             const z = cz + (l.z - l.depth/2) * scale;
             ctx.fillRect(x, z, l.width * scale, l.depth * scale);
             ctx.strokeRect(x, z, l.width * scale, l.depth * scale);
          });
          
          setTimeout(() => {
            ipcRenderer.send('capture-ready');
          }, 500);
        </script>
      </body>
    </html>
  `;

  const htmlPath = path.join(__dirname, 'temp_capture.html');
  fs.writeFileSync(htmlPath, html);

  win.loadFile(htmlPath);

  ipcMain.on('capture-ready', async () => {
    const image = await win.webContents.capturePage();
    const outPath = path.join(__dirname, 'level3_verification.png');
    fs.writeFileSync(outPath, image.toPNG());
    console.log('Saved ' + outPath);
    app.quit();
  });
});
