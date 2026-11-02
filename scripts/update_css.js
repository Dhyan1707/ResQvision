const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../desktop-app/src/renderer/css/style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. vr-viewport-wrapper
css = css.replace(
  /\.vr-viewport-wrapper\s*\{[\s\S]*?\}/,
  `.vr-viewport-wrapper {
    position: relative;
    cursor: default;
    overflow: hidden;
}`
);

// 2. vr-stereo-crosshairs & children
const oldCrosshairs = /\.vr-stereo-crosshairs\s*\{[\s\S]*?\}/;
css = css.replace(
  oldCrosshairs,
  `.vr-stereo-crosshairs {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 12;
    display: flex;
    overflow: hidden;
}

.vr-stereo-crosshair-half {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.vr-crosshair-eye {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(16, 185, 129, 0.85);
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.vr-crosshair-eye::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 2px;
    height: 2px;
    background: #10b981;
    border-radius: 50%;
}`
);

// 3. vr-headset-mask, vr-lens, vr-nose-bridge
const oldMaskBlock = /\.vr-headset-mask\s*\{[\s\S]*?\.vr-nose-bridge\s*\{[\s\S]*?\}/;
css = css.replace(
  oldMaskBlock,
  `.vr-headset-mask {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 15;
    display: flex;
    overflow: hidden;
    background: transparent !important;
}

.vr-eye-half {
    width: 50%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.vr-lens {
    position: relative;
    width: 88%;
    height: 92%;
    border-radius: 48%;
    box-shadow: 0 0 0 1000px #050b14, inset 0 0 50px rgba(0, 0, 0, 0.95);
    border: 3px solid rgba(56, 189, 248, 0.45);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent !important;
}

.vr-nose-bridge {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 12px;
    transform: translateX(-50%);
    background: #020617;
    border-left: 1px solid rgba(56, 189, 248, 0.3);
    border-right: 1px solid rgba(56, 189, 248, 0.3);
    z-index: 16;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated style.css mask rules!');

