// ============================================================
// AR VIEWER (THREE.JS + WEBCAM / TACTICAL HUD)
// AI FIRE EVACUATION SYSTEM - AUGMENTED REALITY SYSTEM
// SIMULATING ACTUAL AR TABLETOP DIGITAL TWIN & RESCUE SMART VISOR
// ============================================================

class ARViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`[ARViewer] Container #${containerId} not found`);
            return;
        }

        // Sub-mode: 'tabletop' (Digital Twin Hologram) or 'visor' (First-Person Rescue Visor)
        this.currentMode = 'tabletop';

        // Setup Video Background & Fallback Canvas
        this.isUsingRealCamera = false;
        this.cameraSourceMode = 'synthetic';
        this.setupCameraFeed();

        // Setup Three.js Scene with Alpha for AR Overlay
        this.scene = new THREE.Scene();

        const aspect = (this.container.clientWidth || window.innerWidth) / (this.container.clientHeight || window.innerHeight);
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 48, 70);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.container.clientWidth || window.innerWidth, this.container.clientHeight || window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;
        this.renderer.domElement.className = "ar-webgl-canvas";
        if (this.renderer.xr) {
            this.renderer.xr.enabled = true;
        }
        this.container.appendChild(this.renderer.domElement);

        // Orbit controls for Tabletop Hologram Mode
        const ControlsClass = (typeof THREE !== "undefined" && THREE.OrbitControls) || (typeof OrbitControls !== "undefined" && OrbitControls) || (typeof OrbitControlsAdapter !== "undefined" && OrbitControlsAdapter);
        if (ControlsClass) {
            this.controls = new ControlsClass(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.target.set(0, 8, 0);
        }

        // Scene Groups
        this.tabletopGroup = new THREE.Group();
        this.scene.add(this.tabletopGroup);

        this.visorGroup = new THREE.Group();
        this.scene.add(this.visorGroup);
        this.visorGroup.visible = false;

        this.fireHoloGroup = new THREE.Group();
        this.tabletopGroup.add(this.fireHoloGroup);

        this.routeHoloGroup = new THREE.Group();
        this.tabletopGroup.add(this.routeHoloGroup);

        this.gridGroup = new THREE.Group();
        this.tabletopGroup.add(this.gridGroup);

        this.pinsGroup = new THREE.Group();
        this.tabletopGroup.add(this.pinsGroup);

        // Lighting
        this.setupLighting();

        // Holographic Grid Base & Laser Scanline
        this.setupHologramBase();
        this.setupScanlineBeam();

        // State
        this.scale = 0.28;
        this.rotationY = 0;
        this.thermalFilterOn = false;
        this.isAutoRotating = true;
        this.activeFires = [];
        this.currentRoute = null;
        this.buildingData = null;
        this.lastTime = performance.now();
        this.animTime = 0;
        this.scanlineY = 0;
        this.scanlineDir = 1;

        // Visor first-person controls
        this.visorYaw = 0;
        this.visorPitch = 0;
        this.visorPos = new THREE.Vector3(0, 1.7, 0);
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Bind events
        this.bindEvents();

        // Start render loop
        this.animate = this.animate.bind(this);
        this.renderer.setAnimationLoop(this.animate);
    }

    // ============================================================
    // CAMERA / VIDEO STREAM SETUP
    // ============================================================
    setupCameraFeed() {
        this.video = document.createElement("video");
        this.video.setAttribute("autoplay", "");
        this.video.setAttribute("playsinline", "");
        this.video.setAttribute("muted", "");
        this.video.className = "ar-video-background";
        this.video.style.display = "none";
        this.container.appendChild(this.video);

        this.fallbackCanvas = document.createElement("canvas");
        this.fallbackCanvas.className = "ar-synthetic-background";
        this.container.appendChild(this.fallbackCanvas);
        this.fallbackCtx = this.fallbackCanvas.getContext("2d");

        this.activateSyntheticFeed();
    }

    async toggleCameraSource() {
        if (this.cameraSourceMode === 'synthetic') {
            await this.startCamera();
        } else {
            this.activateSyntheticFeed();
        }
    }

    async startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });
                this.video.srcObject = stream;
                await this.video.play();
                this.isUsingRealCamera = true;
                this.cameraSourceMode = 'real';
                this.fallbackCanvas.style.display = "none";
                this.video.style.display = "block";
                const camBadge = document.getElementById("arCameraStatus");
                if (camBadge) camBadge.textContent = "LIVE CAMERA FEED ACTIVE";
                const btnSource = document.getElementById("btnARCameraSource");
                if (btnSource) btnSource.innerHTML = `<span>📷</span> Source: Live Webcam`;
                return;
            } catch (err) {
                console.warn("[ARViewer] Webcam access denied or camera not found:", err);
            }
        }
        this.activateSyntheticFeed();
    }

    activateSyntheticFeed() {
        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
        this.isUsingRealCamera = false;
        this.cameraSourceMode = 'synthetic';
        this.video.style.display = "none";
        this.fallbackCanvas.style.display = "block";
        const camBadge = document.getElementById("arCameraStatus");
        if (camBadge) camBadge.textContent = "SIMULATED COMMAND DESK (AR SLAM ACTIVE)";
        const btnSource = document.getElementById("btnARCameraSource");
        if (btnSource) btnSource.innerHTML = `<span>💻</span> Source: Simulated Desk`;
    }

    drawSyntheticBackground() {
        if (this.isUsingRealCamera) return;
        const w = (this.fallbackCanvas.width = this.container.clientWidth || 800);
        const h = (this.fallbackCanvas.height = this.container.clientHeight || 600);
        const ctx = this.fallbackCtx;
        if (!ctx) return;

        const t = performance.now() * 0.001;

        // 1. Sleek Modern Office / Command Table Surface Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#070e1b");
        grad.addColorStop(0.42, "#0b1526");
        grad.addColorStop(0.55, "#101d33");
        grad.addColorStop(1, "#091120");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const horizon = h * 0.44;

        // 2. Realistic Tabletop Surface Plane (Dark Slate with subtle sheen)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(w * 0.08, horizon);
        ctx.lineTo(w * 0.92, horizon);
        ctx.lineTo(w * 1.05, h);
        ctx.lineTo(-w * 0.05, h);
        ctx.closePath();
        const deskGrad = ctx.createLinearGradient(0, horizon, 0, h);
        deskGrad.addColorStop(0, "rgba(20, 32, 54, 0.9)");
        deskGrad.addColorStop(0.3, "rgba(25, 42, 70, 0.85)");
        deskGrad.addColorStop(1, "rgba(12, 22, 38, 0.95)");
        ctx.fillStyle = deskGrad;
        ctx.fill();

        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // 3. ARKit / ARCore Surface Plane Tracking Grid (Perspective Mesh)
        ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
        ctx.lineWidth = 1;
        const numRays = 18;
        for (let i = 0; i <= numRays; i++) {
            const frac = i / numRays;
            const startX = w * 0.15 + (w * 0.7) * frac;
            const endX = -w * 0.1 + (w * 1.2) * frac;
            ctx.beginPath();
            ctx.moveTo(startX, horizon);
            ctx.lineTo(endX, h);
            ctx.stroke();
        }

        const numHoriz = 10;
        for (let j = 1; j <= numHoriz; j++) {
            const frac = Math.pow(j / numHoriz, 1.8);
            const y = horizon + (h - horizon) * frac;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // 4. AR SLAM Tracking Feature Points (Yellow [+] Crosshairs)
        const featurePoints = [
            { x: 0.25, y: 0.52 }, { x: 0.38, y: 0.48 }, { x: 0.62, y: 0.49 },
            { x: 0.75, y: 0.55 }, { x: 0.30, y: 0.68 }, { x: 0.70, y: 0.72 },
            { x: 0.45, y: 0.78 }, { x: 0.55, y: 0.82 }, { x: 0.20, y: 0.85 },
            { x: 0.82, y: 0.88 }, { x: 0.50, y: 0.60 }
        ];

        featurePoints.forEach((pt, idx) => {
            const px = pt.x * w + Math.sin(t * 1.5 + idx) * 1.5;
            const py = pt.y * h + Math.cos(t * 1.5 + idx) * 1.0;
            const arm = 4;
            const alpha = 0.4 + Math.sin(t * 2 + idx * 0.8) * 0.35;
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(px - arm, py);
            ctx.lineTo(px + arm, py);
            ctx.moveTo(px, py - arm);
            ctx.lineTo(px, py + arm);
            ctx.stroke();
        });

        // 5. Detected Table Plane Bracket Box
        const planeY1 = horizon + 20;
        const planeY2 = h - 40;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.7)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(w * 0.22, planeY1, w * 0.56, planeY2 - planeY1);
        ctx.setLineDash([]);

        // Corner Brackets
        const bSize = 14;
        const drawBracket = (x, y, dx, dy) => {
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + dx * bSize, y);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + dy * bSize);
            ctx.stroke();
        };
        drawBracket(w * 0.22, planeY1, 1, 1);
        drawBracket(w * 0.78, planeY1, -1, 1);
        drawBracket(w * 0.22, planeY2, 1, -1);
        drawBracket(w * 0.78, planeY2, -1, -1);

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("✔ COMMAND DESK SURFACE DETECTED — 3D TABLETOP HOLOGRAM READY", w * 0.22 + 8, planeY1 + 16);

        // 6. Hologram Emitter Pad Shadow & Glow on Table
        const cx = w / 2;
        const cy = h * 0.68;
        const emitterGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
        emitterGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        emitterGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.15)");
        emitterGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = emitterGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 150, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.4);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(t * 0.8);
        ctx.strokeStyle = "rgba(0, 255, 255, 0.9)";
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 15]);
        ctx.beginPath();
        ctx.arc(0, 0, 115, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 7. Clear User-Friendly Controls Guidance
        ctx.fillStyle = "rgba(56, 189, 248, 0.95)";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("💡 HOW TO USE: Drag mouse to rotate building 360° • Scroll wheel to zoom in/out", 24, h - 40);
        ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
        ctx.font = "12px sans-serif";
        ctx.fillText("🟢 GREEN = Primary Safe Exit   |   🔴 RED = Fire Hazard   |   👤 BLUE = Victim Locator", 24, h - 20);
    }

    setupLighting() {
        const ambLight = new THREE.AmbientLight(0x0284c7, 1.2);
        this.scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
        dirLight.position.set(50, 100, 50);
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0x00ffff, 2.5, 120);
        pointLight.position.set(0, 35, 0);
        this.scene.add(pointLight);
    }

    setupHologramBase() {
        const gridHelper = new THREE.GridHelper(90, 30, 0x00ffff, 0x0284c7);
        gridHelper.position.y = -0.1;
        this.gridGroup.add(gridHelper);

        const ringGeo = new THREE.RingGeometry(44, 46, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0;
        this.gridGroup.add(ringMesh);
    }

    setupScanlineBeam() {
        const scanGeo = new THREE.PlaneGeometry(240, 240);
        const scanMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide
        });
        this.scanlineMesh = new THREE.Mesh(scanGeo, scanMat);
        this.scanlineMesh.rotation.x = -Math.PI / 2;
        this.scanlineMesh.position.y = 5;
        this.tabletopGroup.add(this.scanlineMesh);
    }

    bindEvents() {
        window.addEventListener("resize", this.onWindowResize.bind(this));

        // Drag to look around in Visor Mode
        this.container.addEventListener("mousedown", (e) => {
            if (this.currentMode === 'visor') {
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener("mouseup", () => {
            this.isDragging = false;
        });

        document.addEventListener("mousemove", (e) => {
            if (this.currentMode === 'visor' && this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;

                this.visorYaw -= dx * 0.003;
                this.visorPitch -= dy * 0.003;
                this.visorPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.visorPitch));

                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y = this.visorYaw;
                this.camera.rotation.x = this.visorPitch;
            }
        });
    }

    // ============================================================
    // BUILD AR HOLOGRAPHIC BUILDING FROM BUILDING DATA
    // ============================================================
    buildFromData(bData, targetFloorLevel = null) {
        if (!bData || !bData.floors) return;
        this.buildingData = bData;

        // 1. Build Tabletop Hologram Model
        this.buildTabletopModel(bData, targetFloorLevel);

        // 2. Build Visor Corridor Model
        this.buildVisorCorridors(bData, targetFloorLevel);

        // Check if sample route needed
        if (!this.currentRoute) {
            const defaultRoute = [
                { x: 30, y: 0, z: 0 },
                { x: 10, y: 0, z: 0 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 0, z: -15 },
                { x: 0, y: 0, z: -35 }
            ];
            this.updateEvacuationRoute(defaultRoute);
        }
    }

    buildTabletopModel(bData, targetFloorLevel) {
        // Clear old tabletop children (except sub-groups)
        const keepGroups = [this.fireHoloGroup, this.routeHoloGroup, this.gridGroup, this.pinsGroup];
        for (let i = this.tabletopGroup.children.length - 1; i >= 0; i--) {
            const child = this.tabletopGroup.children[i];
            if (!keepGroups.includes(child)) {
                this.tabletopGroup.remove(child);
                if (child.geometry) child.geometry.dispose();
            }
        }

        const wallHeight = 7.0;
        const wallThickness = 0.8;

        const holoFloorMat = new THREE.MeshStandardMaterial({
            color: 0x0369a1,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.65
        });

        const holoWallMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.45,
            wireframe: false,
            transparent: true,
            opacity: 0.8
        });

        const wireframeOverlayMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });

        const targetFloor = (targetFloorLevel !== null && targetFloorLevel !== undefined && targetFloorLevel !== 'all') 
            ? parseInt(targetFloorLevel, 10) 
            : null;

        bData.floors.forEach((floor, idx) => {
            const fLevel = (floor.level !== undefined) ? floor.level : idx;
            if (targetFloor !== null && fLevel !== targetFloor) return;

            const yOffset = (targetFloor === null) ? idx * (wallHeight + 1.5) : 0;

            // Floor Slab
            const floorGeo = new THREE.BoxGeometry(200, 0.4, 90);
            const floorMesh = new THREE.Mesh(floorGeo, holoFloorMat);
            floorMesh.position.set(0, yOffset, 0);
            this.tabletopGroup.add(floorMesh);

            // Walls
            if (floor.geometry && floor.geometry.walls) {
                floor.geometry.walls.forEach(wall => {
                    const dx = wall.x2 - wall.x1;
                    const dz = wall.z2 - wall.z1;
                    const wallLength = Math.hypot(dx, dz);
                    if (wallLength < 0.1) return;

                    const angle = Math.atan2(dz, dx);
                    const centerX = (wall.x1 + wall.x2) / 2;
                    const centerZ = (wall.z1 + wall.z2) / 2;

                    const wallGeo = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
                    const wallMesh = new THREE.Mesh(wallGeo, holoWallMat);
                    wallMesh.position.set(centerX, yOffset + wallHeight / 2, centerZ);
                    wallMesh.rotation.y = -angle;
                    this.tabletopGroup.add(wallMesh);

                    const wireMesh = new THREE.Mesh(wallGeo, wireframeOverlayMat);
                    wireMesh.position.set(centerX, yOffset + wallHeight / 2, centerZ);
                    wireMesh.rotation.y = -angle;
                    this.tabletopGroup.add(wireMesh);
                });
            }

            // Doors / Exits with Neon Green Hologram
            if (floor.geometry && floor.geometry.doors) {
                floor.geometry.doors.forEach(door => {
                    const doorGeo = new THREE.BoxGeometry(door.width || 3.0, wallHeight * 0.9, 0.3);
                    const doorMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
                    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
                    doorMesh.position.set(door.x, yOffset + wallHeight * 0.45, door.z);
                    this.tabletopGroup.add(doorMesh);
                });
            }
        });

        this.buildARPins(bData);
        this.updateHologramTransform();
    }

    buildVisorCorridors(bData, targetFloorLevel) {
        while (this.visorGroup.children.length > 0) {
            const child = this.visorGroup.children[0];
            this.visorGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        const floor = bData.floors[0];
        const wallHeight = 7.5;

        const visorFloorMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.4,
            transparent: true,
            opacity: 0.8
        });

        const visorWallMat = new THREE.MeshBasicMaterial({
            color: 0x0284c7,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });

        // Floor
        const floorGeo = new THREE.BoxGeometry(200, 0.4, 90);
        const floorMesh = new THREE.Mesh(floorGeo, visorFloorMat);
        floorMesh.position.set(0, -0.2, 0);
        this.visorGroup.add(floorMesh);

        // Corridor AR HUD Walls
        if (floor && floor.geometry && floor.geometry.walls) {
            floor.geometry.walls.forEach(wall => {
                const dx = wall.x2 - wall.x1;
                const dz = wall.z2 - wall.z1;
                const wallLength = Math.hypot(dx, dz);
                if (wallLength < 0.1) return;

                const angle = Math.atan2(dz, dx);
                const centerX = (wall.x1 + wall.x2) / 2;
                const centerZ = (wall.z1 + wall.z2) / 2;

                const wallGeo = new THREE.BoxGeometry(wallLength, wallHeight, 0.5);
                const wallMesh = new THREE.Mesh(wallGeo, visorWallMat);
                wallMesh.position.set(centerX, wallHeight / 2, centerZ);
                wallMesh.rotation.y = -angle;
                this.visorGroup.add(wallMesh);
            });
        }
    }

    create3DBadge(text, textColor = "#ffffff", bgColor = "rgba(15, 23, 42, 0.9)") {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 80;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = bgColor;
        if (ctx.roundRect) {
            ctx.roundRect(4, 4, 292, 72, 14);
        } else {
            ctx.fillRect(4, 4, 292, 72);
        }
        ctx.fill();

        ctx.strokeStyle = textColor;
        ctx.lineWidth = 4;
        if (ctx.roundRect) {
            ctx.roundRect(4, 4, 292, 72, 14);
        } else {
            ctx.strokeRect(4, 4, 292, 72);
        }
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 150, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(16, 4.5, 1);
        return sprite;
    }

    buildARPins(bData) {
        while (this.pinsGroup.children.length > 0) {
            const child = this.pinsGroup.children[0];
            this.pinsGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        // Primary Exit Pin
        const exitPinGeo = new THREE.ConeGeometry(3, 8, 4);
        exitPinGeo.rotateX(Math.PI);
        const exitPinMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const exitPin = new THREE.Mesh(exitPinGeo, exitPinMat);
        exitPin.position.set(0, 16, -35);
        this.pinsGroup.add(exitPin);

        const ringGeo = new THREE.RingGeometry(4, 5.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 2, -35);
        this.pinsGroup.add(ring);

        // Clear 3D Exit Floating Badge
        const exitBadge = this.create3DBadge("🟢 SAFE EXIT GATE", "#10b981", "rgba(6, 78, 59, 0.9)");
        exitBadge.position.set(0, 24, -35);
        this.pinsGroup.add(exitBadge);
    }

    syncVictim(victimMesh) {
        if (!this.victimSprite) {
            this.victimSprite = this.create3DBadge("👤 VICTIM HERE", "#38bdf8", "rgba(12, 74, 110, 0.9)");
            this.pinsGroup.add(this.victimSprite);
        }
        if (victimMesh) {
            this.victimSprite.visible = true;
            this.victimSprite.position.set(
                victimMesh.position.x,
                (victimMesh.position.y || 0) + 8,
                victimMesh.position.z
            );
        } else {
            this.victimSprite.visible = false;
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        const isTabletop = (mode === 'tabletop');

        this.tabletopGroup.visible = isTabletop;
        this.visorGroup.visible = !isTabletop;

        if (this.controls) {
            this.controls.enabled = isTabletop;
        }

        if (isTabletop) {
            this.camera.position.set(0, 48, 70);
            if (this.controls) this.controls.target.set(0, 8, 0);
        } else {
            // First person visor view inside central corridor
            this.camera.position.set(0, 1.7, 0);
            this.camera.rotation.set(0, 0, 0);
            this.visorYaw = 0;
            this.visorPitch = 0;
        }

        const btnTabletop = document.getElementById("btnARModeTabletop");
        const btnVisor = document.getElementById("btnARModeVisor");
        const tabletopControls = document.getElementById("arTabletopControls");
        const visorHUD = document.getElementById("arVisorHUD");

        if (btnTabletop) btnTabletop.classList.toggle("active", isTabletop);
        if (btnVisor) btnVisor.classList.toggle("active", !isTabletop);
        if (tabletopControls) tabletopControls.style.display = isTabletop ? "flex" : "none";
        if (visorHUD) visorHUD.style.display = isTabletop ? "none" : "block";

        this.onWindowResize();
    }

    setScale(newScale) {
        this.scale = Math.max(0.08, Math.min(1.2, parseFloat(newScale)));
        this.updateHologramTransform();
    }

    setRotation(deg) {
        this.rotationY = (parseFloat(deg) * Math.PI) / 180;
        this.updateHologramTransform();
    }

    toggleAutoRotate() {
        this.isAutoRotating = !this.isAutoRotating;
        const btn = document.getElementById("btnARAutoRotate");
        if (btn) {
            btn.classList.toggle("active", this.isAutoRotating);
            btn.innerHTML = this.isAutoRotating ? `<span>🔄</span> Auto Orbit: ON` : `<span>🔄</span> Auto Orbit: OFF`;
        }
    }

    toggleThermalVision() {
        this.thermalFilterOn = !this.thermalFilterOn;
        this.container.classList.toggle("thermal-vision-active", this.thermalFilterOn);
        const btn = document.getElementById("btnARThermal");
        if (btn) {
            btn.classList.toggle("active", this.thermalFilterOn);
            btn.innerHTML = this.thermalFilterOn ? `<span>🌡️</span> FLIR Thermal: ON` : `<span>🌡️</span> FLIR Thermal: OFF`;
        }
    }

    updateHologramTransform() {
        this.tabletopGroup.scale.set(this.scale, this.scale, this.scale);
        this.tabletopGroup.rotation.y = this.rotationY;
    }

    syncFires(firesList) {
        this.activeFires = firesList || [];
        while (this.fireHoloGroup.children.length > 0) {
            const child = this.fireHoloGroup.children[0];
            this.fireHoloGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        this.activeFires.forEach(f => {
            const origin = f.origin || (f.mesh ? f.mesh.position : { x: 0, y: 0, z: 0 });
            
            const sphereGeo = new THREE.SphereGeometry(3.5, 12, 12);
            const sphereMat = new THREE.MeshBasicMaterial({
                color: 0xff3b00,
                wireframe: true,
                transparent: true,
                opacity: 0.85
            });
            const fireMesh = new THREE.Mesh(sphereGeo, sphereMat);
            fireMesh.position.set(origin.x, origin.y !== undefined ? origin.y + 2 : 2, origin.z);
            this.fireHoloGroup.add(fireMesh);

            const fireCore = new THREE.Mesh(
                new THREE.SphereGeometry(2.0, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffdd00 })
            );
            fireCore.position.set(origin.x, origin.y !== undefined ? origin.y + 2 : 2, origin.z);
            this.fireHoloGroup.add(fireCore);

            // Floating Red Fire Hazard 3D Badge
            const fireBadge = this.create3DBadge("🔥 FIRE HAZARD", "#ef4444", "rgba(127, 29, 29, 0.9)");
            fireBadge.position.set(origin.x, (origin.y !== undefined ? origin.y : 0) + 7.5, origin.z);
            this.fireHoloGroup.add(fireBadge);
        });
    }

    updateEvacuationRoute(routePoints) {
        this.currentRoute = routePoints;
        while (this.routeHoloGroup.children.length > 0) {
            const child = this.routeHoloGroup.children[0];
            this.routeHoloGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }
        if (!routePoints || routePoints.length < 2) return;

        const pts = routePoints.map(p => new THREE.Vector3(p.x, (p.y !== undefined ? p.y : 0) + 1.5, p.z));
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, pts.length * 3, 1.0, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.95
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        this.routeHoloGroup.add(tubeMesh);
    }

    onWindowResize() {
        if (!this.container) return;
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        const now = performance.now();
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        this.animTime += delta;

        if (!this.isUsingRealCamera) {
            this.drawSyntheticBackground();
        }

        if (this.currentMode === 'tabletop' && this.isAutoRotating) {
            this.rotationY += delta * 0.25;
            this.tabletopGroup.rotation.y = this.rotationY;
        }

        if (this.scanlineMesh) {
            this.scanlineY += delta * 16 * this.scanlineDir;
            if (this.scanlineY > 60) {
                this.scanlineY = 60;
                this.scanlineDir = -1;
            } else if (this.scanlineY < 0) {
                this.scanlineY = 0;
                this.scanlineDir = 1;
            }
            this.scanlineMesh.position.y = this.scanlineY;
        }

        if (this.controls && this.currentMode === 'tabletop') {
            this.controls.update();
        }

        if (this.fireHoloGroup && this.fireHoloGroup.children.length > 0) {
            const pulse = 1.0 + Math.sin(this.animTime * 6.0) * 0.15;
            this.fireHoloGroup.children.forEach(c => {
                c.scale.setScalar(pulse);
            });
        }

        if (this.pinsGroup && this.pinsGroup.children.length > 0) {
            this.pinsGroup.children.forEach((p, idx) => {
                if (p.geometry instanceof THREE.ConeGeometry) {
                    p.position.y = 16 + Math.sin(this.animTime * 3 + idx) * 1.5;
                    p.rotation.y += delta * 2;
                }
            });
        }

        this.updateVisorTelemetry();
        this.renderer.render(this.scene, this.camera);
    }

    updateVisorTelemetry() {
        if (this.currentMode !== 'visor') return;

        const ppm = Math.floor(410 + Math.sin(this.animTime * 1.5) * 45);
        const temp = (27.2 + Math.cos(this.animTime) * 1.8).toFixed(1);

        const ppmElem = document.getElementById("arPPM");
        const tempElem = document.getElementById("arTemp");
        const confElem = document.getElementById("arConfidence");

        if (ppmElem) ppmElem.textContent = `${ppm} PPM`;
        if (tempElem) tempElem.textContent = `${temp} °C`;
        if (confElem) confElem.textContent = "98.7% SAFE";

        // Update compass ribbon based on camera yaw
        const deg = Math.round(((-this.visorYaw * 180 / Math.PI) % 360 + 360) % 360);
        const compassTicker = document.querySelector(".ar-compass-ticker");
        if (compassTicker) {
            compassTicker.textContent = `◀ [ HEADING: ${deg}° ] • • • NE • • • E 090° • • • S 180° • • • W 270° ▶`;
        }
    }

    async enterWebXRAR() {
        if (!navigator.xr) {
            alert("WebXR AR is not supported on this browser or hardware.\n\nEnjoy our real-time AR Tabletop Hologram & Smart Rescue Visor modes directly on your desktop or mobile webcam!");
            return;
        }

        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!isSupported) {
            alert("No AR Glasses or WebXR-compatible AR hardware detected.\n\nContinuing in high-performance Tabletop AR & Smart Visor mode!");
            return;
        }

        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test']
            });
            this.renderer.xr.setSession(session);
        } catch (err) {
            console.error("[ARViewer] WebXR AR session failed:", err);
            alert("Failed to start WebXR AR: " + err.message);
        }
    }
}

// Global class export
if (typeof module !== "undefined" && module.exports) {
    module.exports = ARViewer;
}
