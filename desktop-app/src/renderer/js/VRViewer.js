// ============================================================
// VR VIEWER (THREE.JS)
// AI FIRE EVACUATION SYSTEM - FIRST PERSON & IMMERSIVE VR MODE
// SIMULATING ACTUAL VR HEADSET (6DoF, DUAL LENSES, CONTROLLERS & HUD)
// ============================================================

class VRViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`[VRViewer] Container #${containerId} not found`);
            return;
        }

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a1122);
        this.scene.fog = new THREE.FogExp2(0x0a1122, 0.005);

        // Camera setup
        const aspect = (this.container.clientWidth || window.innerWidth) / (this.container.clientHeight || window.innerHeight);
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

        // First Person Camera Rig (6DoF)
        this.cameraRig = new THREE.Group();
        this.cameraYaw = new THREE.Group();
        this.cameraPitch = new THREE.Group();
        this.cameraPitch.add(this.camera);
        this.cameraYaw.add(this.cameraPitch);
        this.cameraRig.add(this.cameraYaw);
        this.scene.add(this.cameraRig);

        // Renderer with WebXR capabilities
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(this.container.clientWidth || window.innerWidth, this.container.clientHeight || window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        if (this.renderer.xr) {
            this.renderer.xr.enabled = true;
        }
        this.container.appendChild(this.renderer.domElement);

        // Stereoscopic Split-Screen Cameras (Simulating VR Headset Lenses)
        this.isStereoMode = false;
        this.ipd = 0.064; // standard 64mm interpupillary distance
        this.stereoCamera = new THREE.StereoCamera();
        this.stereoCamera.aspect = 0.5;
        this.stereoCamera.eyeSep = this.ipd;
        this.leftCamera = this.stereoCamera.cameraL;
        this.rightCamera = this.stereoCamera.cameraR;

        // Scene Groups
        this.buildingGroup = new THREE.Group();
        this.scene.add(this.buildingGroup);

        this.fireGroup = new THREE.Group();
        this.scene.add(this.fireGroup);

        this.routeGroup = new THREE.Group();
        this.scene.add(this.routeGroup);

        this.victimGroup = new THREE.Group();
        this.scene.add(this.victimGroup);
        this.vrVictimAvatar = null;

        this.lightsGroup = new THREE.Group();
        this.scene.add(this.lightsGroup);

        // State & Controls (Initialized first to prevent null reference in setup methods)
        this.currentFloorLevel = 0;
        this.moveSpeed = 16.0;
        this.sprintMultiplier = 1.8;
        this.playerHeight = 1.7; // 1.7 meters eye height
        this.velocity = new THREE.Vector3();
        this.keys = { forward: false, backward: false, left: false, right: false, sprint: false };
        this.isPointerLocked = false;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.pitch = 0;
        this.yaw = 0;
        this.lastTime = performance.now();
        this.walkPhase = 0;

        // Nearest exit tracker
        this.nearestExitPos = new THREE.Vector3(0, 0, -35);
        this.nearestExitName = "Main Ground Exit";

        // Auto-tour / Route Walkthrough Mode
        this.isWalkingRoute = false;
        this.routeWalkIndex = 0;
        this.routeWalkSpeed = 14.0;
        this.evacRoutePoints = null;

        // Route chevrons animation
        this.chevrons = [];
        this.chevronTime = 0;

        // Active fires copy
        this.activeFires = [];

        // Tactical Evacuation Minimap Radar
        this.minimapCanvas = null;
        this.minimapCtx = null;
        this.minimapZoom = 1.0;
        this.minimapMode = "follow"; // "follow" or "overview"
        this.minimapPulsePhase = 0;
        this.dynamicRemainingPoints = null;

        // Stair Navigation & Solid Wall Collision System
        this.isNearStairs = false;
        this.isTransitioningFloor = false;
        this.currentStairInfo = null;
        this.floorBoundsCache = new Map();

        // Biometrics audio synthesizer
        this.initAudio();

        // Virtual VR Motion Controllers (attached to view)
        this.setupVRControllers();

        // Lighting
        this.setupLighting();

        // Flashlight (parented to camera)
        this.setupFlashlight();

        // Alarm strobe beacon
        this.setupAlarmLights();

        // Bind events
        this.bindEvents();

        // Pre-build building if global buildingData is available
        const bData = (typeof window !== 'undefined' && window.buildingData) || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (bData && bData.floors) {
            this.buildFromData(bData, 0);
        } else {
            this.teleportToStartPosition();
        }

        // Start render loop
        this.animate = this.animate.bind(this);
        this.renderer.setAnimationLoop(this.animate);
    }

    // ============================================================
    // VIRTUAL VR CONTROLLERS & HANDS SIMULATION
    // ============================================================
    setupVRControllers() {
        this.controllersGroup = new THREE.Group();
        this.cameraPitch.add(this.controllersGroup);

        const controllerMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.35,
            metalness: 0.7
        });
        const accentMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8
        });

        // 1. LEFT CONTROLLER (Equipped with Emergency Wrist Telemetry)
        this.leftController = new THREE.Group();
        
        const handleGeo = new THREE.CylinderGeometry(0.022, 0.026, 0.16, 16);
        const leftHandle = new THREE.Mesh(handleGeo, controllerMat);
        leftHandle.rotation.x = -Math.PI / 6;
        this.leftController.add(leftHandle);

        const ringGeo = new THREE.TorusGeometry(0.055, 0.007, 12, 32);
        const leftRing = new THREE.Mesh(ringGeo, controllerMat);
        leftRing.position.set(0, 0.08, -0.04);
        leftRing.rotation.x = Math.PI / 4;
        this.leftController.add(leftRing);

        const stickGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.015, 12);
        const leftStick = new THREE.Mesh(stickGeo, accentMat);
        leftStick.position.set(0.01, 0.07, -0.02);
        this.leftController.add(leftStick);

        // Wrist Holographic Telemetry Screen
        const wristGeo = new THREE.BoxGeometry(0.07, 0.045, 0.008);
        const wristCanvas = document.createElement("canvas");
        wristCanvas.width = 256;
        wristCanvas.height = 128;
        this.wristCtx = wristCanvas.getContext("2d");
        this.wristTexture = new THREE.CanvasTexture(wristCanvas);
        const wristScreenMat = new THREE.MeshBasicMaterial({ map: this.wristTexture, transparent: true });
        const wristScreen = new THREE.Mesh(wristGeo, wristScreenMat);
        wristScreen.position.set(0, 0.02, 0.04);
        wristScreen.rotation.x = Math.PI / 3;
        this.leftController.add(wristScreen);

        this.leftController.position.set(-0.28, -0.22, -0.52);
        this.controllersGroup.add(this.leftController);

        // 2. RIGHT CONTROLLER (Equipped with Interactive Laser Pointer)
        this.rightController = new THREE.Group();

        const rightHandle = new THREE.Mesh(handleGeo, controllerMat);
        rightHandle.rotation.x = -Math.PI / 6;
        this.rightController.add(rightHandle);

        const rightRing = new THREE.Mesh(ringGeo, controllerMat);
        rightRing.position.set(0, 0.08, -0.04);
        rightRing.rotation.x = Math.PI / 4;
        this.rightController.add(rightRing);

        const rightStick = new THREE.Mesh(stickGeo, accentMat);
        rightStick.position.set(-0.01, 0.07, -0.02);
        this.rightController.add(rightStick);

        // Laser pointer beam
        const beamGeo = new THREE.CylinderGeometry(0.002, 0.002, 14.0, 8);
        beamGeo.translate(0, 7.0, 0);
        beamGeo.rotateX(Math.PI / 2);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.65
        });
        this.laserBeam = new THREE.Mesh(beamGeo, beamMat);
        this.laserBeam.position.set(0, 0.08, -0.04);
        this.laserBeam.rotation.x = -Math.PI / 6;
        this.rightController.add(this.laserBeam);

        this.rightController.position.set(0.28, -0.22, -0.52);
        this.controllersGroup.add(this.rightController);

        this.updateWristHUD("FLOOR: GF", "PATH: CLEAR", 72);
    }

    updateWristHUD(floorText, statusText, bpm) {
        if (!this.wristCtx) return;
        const ctx = this.wristCtx;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(0, 0, 256, 128);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 252, 124);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 15px monospace";
        ctx.fillText("EVAC RADAR", 14, 26);

        ctx.fillStyle = "#10b981";
        ctx.font = "13px monospace";
        ctx.fillText(floorText, 14, 52);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "12px monospace";
        ctx.fillText(statusText, 14, 76);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 13px monospace";
        ctx.fillText(`♥ ${bpm} BPM`, 14, 102);

        // Mini radar compass on the right side of the smartwatch
        const rcx = 196;
        const rcy = 64;
        const rad = 36;

        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rcx, rcy, rad, 0, Math.PI * 2);
        ctx.stroke();

        // Direction arrow towards nearest exit
        const playerPos = (this.cameraRig && this.cameraRig.position) ? this.cameraRig.position : { x: 0, y: 0, z: 0 };
        const exitPos = this.nearestExitPos || { x: 0, y: 0, z: -35 };
        const exitDx = exitPos.x - playerPos.x;
        const exitDz = exitPos.z - playerPos.z;
        const exitAngle = Math.atan2(exitDx, -exitDz) - (this.yaw || 0);

        const ax = rcx + Math.sin(exitAngle) * (rad - 6);
        const ay = rcy - Math.cos(exitAngle) * (rad - 6);

        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rcx, rcy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Center player blip
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(rcx, rcy, 3, 0, Math.PI * 2);
        ctx.fill();

        this.wristTexture.needsUpdate = true;
    }

    updateDynamicRemainingRoute(victimPos, remainingWaypoints) {
        if (!victimPos) return;
        const pts = [new THREE.Vector3(victimPos.x, victimPos.y !== undefined ? victimPos.y : 0, victimPos.z)];
        if (remainingWaypoints && remainingWaypoints.length > 0) {
            remainingWaypoints.forEach(w => {
                pts.push(new THREE.Vector3(w.x, w.y !== undefined ? w.y : 0, w.z));
            });
        }
        this.dynamicRemainingPoints = pts;
        this.evacRoutePoints = pts;

        // Live calculation of remaining distance along the route
        let remDist = 0;
        for (let i = 0; i < pts.length - 1; i++) {
            remDist += pts[i].distanceTo(pts[i + 1]);
        }
        const distEl = document.getElementById("vrMinimapDistVal");
        if (distEl) distEl.textContent = `${remDist.toFixed(0)}m to Exit`;
        const exitElem = document.getElementById("vrExitDist");
        if (exitElem) exitElem.textContent = `${remDist.toFixed(1)} m`;
    }

    renderMinimap() {
        if (!this.minimapCanvas) {
            this.minimapCanvas = document.getElementById("vrMinimapCanvas");
            if (this.minimapCanvas) {
                this.minimapCtx = this.minimapCanvas.getContext("2d");
            }
        }
        if (!this.minimapCtx) return;

        const ctx = this.minimapCtx;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // Blueprint background
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, w, h);

        // Subtle tactical grid
        ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
        ctx.lineWidth = 1;
        const gridSize = 22;
        for (let x = 0; x <= w; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        const bData = this.buildingData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (!bData || !bData.floors) return;

        // Determine active floor based on camera position elevation
        const playerPos = this.cameraRig.position;
        let currentFloorIdx = this.currentFloorLevel || 0;
        if (bData.floors) {
            for (let f = bData.floors.length - 1; f >= 0; f--) {
                const elev = bData.floors[f].elevation !== undefined ? bData.floors[f].elevation : (f * 12);
                if (playerPos.y >= (elev - 1.0)) {
                    currentFloorIdx = f;
                    break;
                }
            }
        }

        const floor = bData.floors[currentFloorIdx];
        if (!floor) return;

        // Update floor badge in UI
        const floorBadge = document.getElementById("vrMinimapFloorBadge");
        if (floorBadge) {
            floorBadge.textContent = currentFloorIdx === 0 ? "GF" : `L${currentFloorIdx}`;
        }

        // Camera / World coordinates conversion
        let centerX = 0;
        let centerZ = 0;
        let scale = 1.35 * (this.minimapZoom || 1.0);

        if (this.minimapMode === "follow") {
            centerX = playerPos.x;
            centerZ = playerPos.z;
            scale = 3.6 * (this.minimapZoom || 1.0);
        } else {
            centerX = 0;
            centerZ = 0;
            scale = 1.35 * (this.minimapZoom || 1.0);
        }

        const toCanvas = (wx, wz) => {
            const cx = w / 2 + (wx - centerX) * scale;
            const cy = h / 2 + (wz - centerZ) * scale;
            return { x: cx, y: cy };
        };

        // 1. Draw Architectural Walls
        if (floor.geometry && floor.geometry.walls) {
            floor.geometry.walls.forEach(wall => {
                const p1 = toCanvas(wall.x1, wall.z1);
                const p2 = toCanvas(wall.x2, wall.z2);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                if (wall.type === "exterior") {
                    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
                    ctx.lineWidth = 2.8;
                } else {
                    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
                    ctx.lineWidth = 1.6;
                }
                ctx.stroke();
            });
        }

        // 2. Draw Doors / Openings
        if (floor.geometry && floor.geometry.doors) {
            floor.geometry.doors.forEach(d => {
                const pt = toCanvas(d.x, d.z);
                ctx.fillStyle = "#f97316";
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // 3. Draw Exits & Stairs
        if (floor.nodes) {
            floor.nodes.forEach(n => {
                if (!n) return;
                const pt = toCanvas(n.x, n.z);
                if (n.type === "exit" || (n.id && n.id.includes("EXIT"))) {
                    ctx.fillStyle = "#10b981";
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#f8fafc";
                    ctx.font = "bold 9px monospace";
                    ctx.fillText("EXIT", pt.x + 6, pt.y + 3);
                } else if (n.type === "staircase" || (n.id && n.id.includes("STAIR"))) {
                    ctx.fillStyle = "#eab308";
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#fde047";
                    ctx.font = "8px monospace";
                    ctx.fillText("STAIRS", pt.x + 5, pt.y + 3);
                }
            });
        }

        // 4. Draw Active Fires & Hazard Heat Zones
        this.activeFires.forEach(f => {
            if (f.floorIndex === currentFloorIdx) {
                const origin = f.origin || (f.mesh ? f.mesh.position : { x: 0, y: 0, z: 0 });
                const pt = toCanvas(origin.x, origin.z);
                const pulse = (Math.sin(performance.now() * 0.007) + 1) * 0.5;

                // Pulsing hazard danger aura
                ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + pulse * 0.15})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 16 + pulse * 6, 0, Math.PI * 2);
                ctx.fill();

                // Fire Core
                ctx.fillStyle = "#ef4444";
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffedd5";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });

        // 5. Draw Evacuation Route (Dynamic real-time path & floor-filtered)
        const pts = (this.dynamicRemainingPoints && this.dynamicRemainingPoints.length >= 2)
            ? this.dynamicRemainingPoints
            : (this.evacRoutePoints || window.lastCalculatedRoutePoints);

        if (pts && pts.length >= 2) {
            const currentElev = floor.elevation !== undefined ? floor.elevation : (currentFloorIdx * 12);
            const nextFloorElev = (currentFloorIdx + 1 < bData.floors.length)
                ? (bData.floors[currentFloorIdx + 1].elevation !== undefined ? bData.floors[currentFloorIdx + 1].elevation : (currentFloorIdx + 1) * 12)
                : (currentElev + 12);

            ctx.save();
            ctx.shadowColor = "#00ff88";
            ctx.shadowBlur = 8;
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Draw segments that belong to current floor or transition through stairs
            for (let i = 0; i < pts.length - 1; i++) {
                const pA = pts[i];
                const pB = pts[i + 1];
                const yA = pA.y !== undefined ? pA.y : 0;
                const yB = pB.y !== undefined ? pB.y : 0;

                const onFloorA = (yA >= currentElev - 1.5 && yA < nextFloorElev + 1.0);
                const onFloorB = (yB >= currentElev - 1.5 && yB < nextFloorElev + 1.0);

                if (onFloorA || onFloorB || this.minimapMode === "overview") {
                    const cA = toCanvas(pA.x, pA.z);
                    const cB = toCanvas(pB.x, pB.z);

                    ctx.beginPath();
                    ctx.moveTo(cA.x, cA.y);
                    ctx.lineTo(cB.x, cB.y);
                    ctx.stroke();

                    // If leaving current floor via stairs, draw prominent stairwell indicator
                    if (onFloorA && !onFloorB) {
                        ctx.fillStyle = "#eab308";
                        ctx.beginPath();
                        ctx.arc(cB.x, cB.y, 4.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#fef08a";
                        ctx.font = "bold 8px monospace";
                        ctx.fillText("STAIRS ➔", cB.x + 6, cB.y + 3);
                    }
                }
            }

            // Animated directional pulse along the active floor route
            this.minimapPulsePhase = (this.minimapPulsePhase || 0) + 0.03;
            const pulseNorm = this.minimapPulsePhase % 1.0;
            const totalSegs = Math.max(1, pts.length - 1);
            const segFloat = pulseNorm * totalSegs;
            const segIdx = Math.floor(segFloat);
            const segT = segFloat - segIdx;
            if (segIdx < pts.length - 1) {
                const pA = pts[segIdx];
                const pB = pts[segIdx + 1];
                const interX = pA.x + (pB.x - pA.x) * segT;
                const interZ = pA.z + (pB.z - pA.z) * segT;
                const interY = (pA.y || 0) + ((pB.y || 0) - (pA.y || 0)) * segT;

                if (interY >= currentElev - 1.5 && interY < nextFloorElev + 1.0 || this.minimapMode === "overview") {
                    const pulsePt = toCanvas(interX, interZ);
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(pulsePt.x, pulsePt.y, 4.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // 6. Draw Victim Marker (if active)
        if (window.victimAgent && window.victimAgent.victimMesh && window.victimAgent.victimMesh.visible) {
            const vPos = window.victimAgent.victimMesh.position;
            const vPt = toCanvas(vPos.x, vPos.z);
            ctx.fillStyle = "#0284c7";
            ctx.beginPath();
            ctx.arc(vPt.x, vPt.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 8px monospace";
            ctx.fillText("VICTIM", vPt.x + 5, vPt.y + 3);
        }

        // 7. Draw Player Avatar with Directional Vision Cone
        const pPt = toCanvas(playerPos.x, playerPos.z);

        // Directional Vision Cone
        const forwardAngle = -this.yaw - Math.PI / 2;
        const coneDist = 24 * (this.minimapMode === "follow" ? 1.2 : 0.85);
        const fovSpread = Math.PI / 4.5;

        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.beginPath();
        ctx.moveTo(pPt.x, pPt.y);
        ctx.arc(pPt.x, pPt.y, coneDist, forwardAngle - fovSpread, forwardAngle + fovSpread);
        ctx.closePath();
        ctx.fill();

        // Direction Arrow
        const arrowX = pPt.x + Math.cos(forwardAngle) * 10;
        const arrowY = pPt.y + Math.sin(forwardAngle) * 10;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pPt.x, pPt.y);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Player Center Blip
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(pPt.x, pPt.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 8. Dynamic Distance Badge Update
        const distEl = document.getElementById("vrMinimapDistVal");
        if (distEl) {
            let remainingMeters = 0;
            if (pts && pts.length >= 2) {
                for (let i = 0; i < pts.length - 1; i++) {
                    const d = Math.hypot(pts[i + 1].x - pts[i].x, (pts[i + 1].y || 0) - (pts[i].y || 0), pts[i + 1].z - pts[i].z);
                    remainingMeters += d;
                }
            } else {
                remainingMeters = Math.hypot(playerPos.x - this.nearestExitPos.x, playerPos.z - this.nearestExitPos.z);
            }
            distEl.textContent = `${remainingMeters.toFixed(0)}m to Exit`;
            const exitHud = document.getElementById("vrExitDist");
            if (exitHud) exitHud.textContent = `${remainingMeters.toFixed(1)} m`;
        }
    }

    setupLighting() {
        // Bright ambient light so walls and floors are clearly visible
        this.ambientLight = new THREE.AmbientLight(0x64748b, 1.2);
        this.scene.add(this.ambientLight);

        // Directional overhead
        this.overheadLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.overheadLight.position.set(0, 50, 0);
        this.scene.add(this.overheadLight);

        // Corridor Overhead Emergency Strip Lights
        while (this.lightsGroup.children.length > 0) {
            this.lightsGroup.remove(this.lightsGroup.children[0]);
        }
        const lightPositions = [-50, -25, 0, 25, 50];
        lightPositions.forEach(x => {
            const pLight = new THREE.PointLight(0xe2e8f0, 1.5, 35);
            pLight.position.set(x, 6.8, 0);
            this.lightsGroup.add(pLight);

            // Fixture visual mesh
            const fixGeo = new THREE.BoxGeometry(2.5, 0.2, 0.6);
            const fixMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const fix = new THREE.Mesh(fixGeo, fixMat);
            fix.position.set(x, 7.2, 0);
            this.lightsGroup.add(fix);
        });
    }

    setupFlashlight() {
        this.flashlightOn = true;
        this.flashlight = new THREE.SpotLight(0xfffaed, 3.8, 65, Math.PI / 4.8, 0.45, 1.2);
        this.flashlight.position.set(0, 0, 0);
        this.flashlightTarget = new THREE.Object3D();
        this.flashlightTarget.position.set(0, 0, -10);
        this.camera.add(this.flashlightTarget);
        this.flashlight.target = this.flashlightTarget;
        this.camera.add(this.flashlight);
    }

    setupAlarmLights() {
        this.alarmLight = new THREE.PointLight(0xef4444, 2.0, 35);
        this.alarmLight.position.set(0, 6.5, 0);
        this.scene.add(this.alarmLight);
        this.alarmPhase = 0;
    }

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {
            console.warn("[VRViewer] Web Audio not available", e);
        }
    }

    playHeartbeatSound() {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(65, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            // Ignore audio interruption
        }
    }

    playFootstepSound() {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(25, now + 0.08);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            // Ignore
        }
    }

    bindEvents() {
        window.addEventListener("resize", this.onWindowResize.bind(this));

        // Click and drag to look around smoothly (works immediately without pointer lock!)
        this.container.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener("mouseup", () => {
            this.isDragging = false;
        });

        this.container.addEventListener("mouseleave", () => {
            this.isDragging = false;
        });

        // Double-click to request optional pointer lock
        this.container.addEventListener("dblclick", () => {
            if (!this.isPointerLocked) {
                const req = this.container.requestPointerLock || this.container.mozRequestPointerLock;
                if (req) req.call(this.container);
            }
        });

        document.addEventListener("pointerlockchange", () => {
            this.isPointerLocked = (document.pointerLockElement === this.container);
        });

        // Mouse Move for Pitch & Yaw (Supports both click-and-drag and pointer lock!)
        document.addEventListener("mousemove", (e) => {
            let dx = 0;
            let dy = 0;

            if (this.isPointerLocked) {
                dx = e.movementX;
                dy = e.movementY;
            } else if (this.isDragging) {
                dx = e.clientX - this.lastMouseX;
                dy = e.clientY - this.lastMouseY;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            } else {
                return;
            }

            const sensitivity = 0.0028;
            this.yaw -= dx * sensitivity;
            this.pitch -= dy * sensitivity;

            const maxPitch = Math.PI / 2 - 0.05;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

            this.cameraYaw.rotation.y = this.yaw;
            this.cameraPitch.rotation.x = this.pitch;
        });

        // Keyboard Movement (WASD + Arrow Keys) & Staircase Navigation
        window.addEventListener("keydown", (e) => {
            if (this.container.offsetParent === null) return;
            const key = e.key.toLowerCase();

            // Staircase Floor Traversal when near stairs
            if (this.isNearStairs) {
                if (key === "pageup" || key === "e") {
                    e.preventDefault();
                    this.transitionFloorViaStairs(1);
                    return;
                }
                if (key === "pagedown" || key === "q") {
                    e.preventDefault();
                    this.transitionFloorViaStairs(-1);
                    return;
                }
                if (key === "arrowup" && (e.altKey || e.ctrlKey || e.shiftKey)) {
                    e.preventDefault();
                    this.transitionFloorViaStairs(1);
                    return;
                }
                if (key === "arrowdown" && (e.altKey || e.ctrlKey || e.shiftKey)) {
                    e.preventDefault();
                    this.transitionFloorViaStairs(-1);
                    return;
                }
            }

            if (key === "w" || key === "arrowup") { this.keys.forward = true; this.stopRouteWalkthrough(); }
            if (key === "s" || key === "arrowdown") { this.keys.backward = true; this.stopRouteWalkthrough(); }
            if (key === "a" || key === "arrowleft") { this.keys.left = true; this.stopRouteWalkthrough(); }
            if (key === "d" || key === "arrowright") { this.keys.right = true; this.stopRouteWalkthrough(); }
            if (e.shiftKey) this.keys.sprint = true;
            if (key === "f") this.toggleFlashlight();
            if (key === "v") this.toggleStereoMode();
        });

        window.addEventListener("keyup", (e) => {
            const key = e.key.toLowerCase();
            if (key === "w" || key === "arrowup") this.keys.forward = false;
            if (key === "s" || key === "arrowdown") this.keys.backward = false;
            if (key === "a" || key === "arrowleft") this.keys.left = false;
            if (key === "d" || key === "arrowright") this.keys.right = false;
            if (!e.shiftKey) this.keys.sprint = false;
        });

        // In-Viewport Stair Navigation Prompt Actions
        document.getElementById("btnVRStairUp")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.transitionFloorViaStairs(1);
        });
        document.getElementById("btnVRStairDown")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.transitionFloorViaStairs(-1);
        });

        // Minimap Controls
        document.getElementById("btnVRMinimapZoomIn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.minimapZoom = Math.min(2.5, (this.minimapZoom || 1.0) + 0.25);
        });
        document.getElementById("btnVRMinimapZoomOut")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.minimapZoom = Math.max(0.6, (this.minimapZoom || 1.0) - 0.25);
        });
        document.getElementById("btnVRMinimapToggleMode")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.minimapMode = (this.minimapMode === "follow") ? "overview" : "follow";
            const btn = document.getElementById("btnVRMinimapToggleMode");
            if (btn) btn.textContent = (this.minimapMode === "follow") ? "🎯" : "🗺️";
        });
    }

    toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;
        this.flashlight.visible = this.flashlightOn;
        const btn = document.getElementById("btnVRFlashlight");
        if (btn) {
            btn.classList.toggle("active", this.flashlightOn);
            btn.innerHTML = this.flashlightOn ? `<span>🔦</span> Flashlight: ON` : `<span>🔦</span> Flashlight: OFF`;
        }
    }

    toggleStereoMode() {
        this.isStereoMode = !this.isStereoMode;
        const btn = document.getElementById("btnVRStereo");
        const crosshair = document.getElementById("vrCrosshair");
        const stereoCrosshair = document.getElementById("vrStereoCrosshairs");
        const headsetGoggles = document.getElementById("vrHeadsetGogglesMask");

        if (btn) {
            btn.classList.toggle("active", this.isStereoMode);
            btn.innerHTML = `<span class="btn-icon">👓</span> Headset Lenses: ${this.isStereoMode ? 'ON' : 'OFF'}`;
        }
        if (crosshair) crosshair.style.display = this.isStereoMode ? "none" : "block";
        if (stereoCrosshair) stereoCrosshair.style.display = this.isStereoMode ? "flex" : "none";
        if (headsetGoggles) headsetGoggles.style.display = this.isStereoMode ? "flex" : "none";

        this.onWindowResize();
    }

    // ============================================================
    // CINEMATIC AUTO-TOUR / EVACUATION ROUTE WALKTHROUGH
    // ============================================================
    toggleRouteWalkthrough() {
        if (this.isWalkingRoute) {
            this.stopRouteWalkthrough();
        } else {
            this.startRouteWalkthrough();
        }
    }

    startRouteWalkthrough() {
        let pts = this.evacRoutePoints || window.lastCalculatedRoutePoints;
        if (!pts || pts.length < 2) {
            // Generate standard central corridor egress route to exit
            pts = [
                { x: 45, y: 0, z: 0 },
                { x: 20, y: 0, z: 0 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 0, z: -15 },
                { x: 0, y: 0, z: -35 }
            ];
            this.updateEvacuationRoute(pts);
        }

        this.evacRoutePoints = pts;
        this.isWalkingRoute = true;
        this.routeWalkIndex = 0;

        const startPt = pts[0];
        const startY = (startPt.y !== undefined ? startPt.y : 0) + this.playerHeight;
        this.cameraRig.position.set(startPt.x, startY, startPt.z);

        const btn = document.getElementById("btnVRWalkRoute");
        if (btn) {
            btn.classList.add("active");
            btn.innerHTML = `<span>⏹️</span> Stop Tour`;
        }
    }

    stopRouteWalkthrough() {
        if (!this.isWalkingRoute) return;
        this.isWalkingRoute = false;
        const btn = document.getElementById("btnVRWalkRoute");
        if (btn) {
            btn.classList.remove("active");
            btn.innerHTML = `<span>🚶</span> Walk Route POV`;
        }
    }

    updateRouteWalkthrough(delta) {
        if (!this.isWalkingRoute || !this.evacRoutePoints) return;
        if (this.routeWalkIndex >= this.evacRoutePoints.length - 1) {
            this.stopRouteWalkthrough();
            return;
        }

        const targetPt = this.evacRoutePoints[this.routeWalkIndex + 1];
        const curPos = this.cameraRig.position;
        const targetY = (targetPt.y !== undefined ? targetPt.y : 0) + this.playerHeight;

        const dx = targetPt.x - curPos.x;
        const dy = targetY - curPos.y;
        const dz = targetPt.z - curPos.z;
        const dist = Math.hypot(dx, dy, dz);
        const dist2D = Math.hypot(dx, dz);

        // Turn smoothly towards next waypoint
        if (dist2D > 0.05) {
            const targetYaw = Math.atan2(-dx, -dz);
            let diffYaw = targetYaw - this.yaw;
            while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
            while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
            this.yaw += diffYaw * Math.min(1.0, delta * 5.0);
            this.cameraYaw.rotation.y = this.yaw;
        }

        // Slight natural downward gaze when walking down flight of stairs
        const isDescendingStairs = dy < -0.3;
        const targetPitch = isDescendingStairs ? -0.25 : 0;
        this.pitch += (targetPitch - this.pitch) * Math.min(1.0, delta * 3.0);
        this.cameraPitch.rotation.x = this.pitch;

        const paceMult = (typeof window !== 'undefined' && window.victimAgent && window.victimAgent.speedMultiplier) ? window.victimAgent.speedMultiplier : 1.0;
        const walkSpeed = (isDescendingStairs ? (this.routeWalkSpeed * 0.65) : this.routeWalkSpeed) * paceMult;
        const step = walkSpeed * delta;

        if (dist <= step) {
            curPos.x = targetPt.x;
            curPos.y = targetY;
            curPos.z = targetPt.z;
            this.routeWalkIndex++;
            if (this.routeWalkIndex >= this.evacRoutePoints.length - 1) {
                this.stopRouteWalkthrough();
            }
        } else {
            curPos.x += (dx / dist) * step;
            curPos.y += (dy / dist) * step;
            curPos.z += (dz / dist) * step;
        }

        this.walkPhase += delta * (isDescendingStairs ? 7.0 : 10.0);
        if (Math.sin(this.walkPhase) > 0.95 && Math.random() < 0.25) {
            this.playFootstepSound();
        }
    }

    onWindowResize() {
        if (!this.container || !this.renderer) return;
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        if (this.stereoCamera) {
            this.stereoCamera.aspect = 0.5;
            this.stereoCamera.update(this.camera);
        }

        this.renderer.setSize(width, height);
    }

    // ============================================================
    // BUILD SCENE GEOMETRY (FROM BUILDING DATA)
    // ============================================================
    buildFromData(bData, targetFloorLevel = null) {
        if (!bData || !bData.floors) return;
        this.buildingData = bData;

        while (this.buildingGroup.children.length > 0) {
            const child = this.buildingGroup.children[0];
            this.buildingGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        }

        const wallHeight = 5.0;
        const targetFloor = (targetFloorLevel !== null && targetFloorLevel !== undefined && targetFloorLevel !== 'all') 
            ? parseInt(targetFloorLevel, 10) 
            : 0;
        this.currentFloorLevel = targetFloor;

        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.5,
            metalness: 0.15
        });
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.8,
            metalness: 0.1,
            transparent: true,
            opacity: 0.85
        });
        const wallMatExterior = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.6,
            metalness: 0.1
        });
        const wallMatInterior = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.7,
            metalness: 0.05
        });
        const exitSignMat = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x22c55e,
            emissiveIntensity: 2.2
        });
        const stairMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.8
        });

        // BUILD ALL FLOORS so stairs and multi-floor descent function seamlessly!
        bData.floors.forEach((floor, idx) => {
            const floorLevel = (floor.level !== undefined) ? floor.level : idx;
            const yOffset = floor.elevation !== undefined ? floor.elevation : (idx * 12);

            // 1. Floor Slab
            const floorGeo = new THREE.BoxGeometry(200, 0.4, 90);
            const floorMesh = new THREE.Mesh(floorGeo, floorMat);
            floorMesh.position.set(0, yOffset - 0.2, 0);
            floorMesh.receiveShadow = true;
            this.buildingGroup.add(floorMesh);

            // 2. Ceiling Slab
            const ceilingGeo = new THREE.BoxGeometry(200, 0.4, 90);
            const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
            ceilingMesh.position.set(0, yOffset + wallHeight + 0.2, 0);
            this.buildingGroup.add(ceilingMesh);

            // 3. Walls
            if (floor.geometry && floor.geometry.walls) {
                floor.geometry.walls.forEach(wall => {
                    const dx = wall.x2 - wall.x1;
                    const dz = wall.z2 - wall.z1;
                    const wallLength = Math.hypot(dx, dz);
                    if (wallLength < 0.1) return;

                    const angle = Math.atan2(dz, dx);
                    const centerX = (wall.x1 + wall.x2) / 2;
                    const centerZ = (wall.z1 + wall.z2) / 2;
                    const wThickness = wall.thickness || 0.6;
                    const material = wall.type === 'exterior' ? wallMatExterior : wallMatInterior;

                    const wallGeo = new THREE.BoxGeometry(wallLength, wallHeight, wThickness);
                    const wallMesh = new THREE.Mesh(wallGeo, material);
                    wallMesh.position.set(centerX, yOffset + wallHeight / 2, centerZ);
                    wallMesh.rotation.y = -angle;
                    wallMesh.castShadow = true;
                    wallMesh.receiveShadow = true;
                    this.buildingGroup.add(wallMesh);
                });
            }

            // 4. Doors & Exit Signs
            if (floor.geometry && floor.geometry.doors) {
                floor.geometry.doors.forEach((door, dIdx) => {
                    const doorFrameGeo = new THREE.BoxGeometry(door.width || 3.0, wallHeight * 0.85, 0.4);
                    const doorFrameMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
                    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
                    doorFrame.position.set(door.x, yOffset + wallHeight * 0.42, door.z);
                    this.buildingGroup.add(doorFrame);

                    const signGeo = new THREE.BoxGeometry(2.0, 0.5, 0.3);
                    const signMesh = new THREE.Mesh(signGeo, exitSignMat);
                    signMesh.position.set(door.x, yOffset + wallHeight * 0.9, door.z);
                    this.buildingGroup.add(signMesh);

                    if (floorLevel === 0 && dIdx === 0) {
                        this.nearestExitPos.set(door.x, 0, door.z);
                    }
                });
            }

            // 5. Realistic & Illuminated Staircases connecting floors
            if (floor.geometry && floor.geometry.stairs) {
                const stairGlowMat = new THREE.MeshStandardMaterial({
                    color: 0x06b6d4,
                    emissive: 0x0284c7,
                    emissiveIntensity: 1.2
                });
                floor.geometry.stairs.forEach(stair => {
                    const stepsCount = 12;
                    const stepHeight = 1.0;
                    const stepDepth = stair.depth / stepsCount;

                    for (let s = 0; s < stepsCount; s++) {
                        const sGeo = new THREE.BoxGeometry(stair.width, stepHeight * (s + 1), stepDepth);
                        const sMesh = new THREE.Mesh(sGeo, stairMat);
                        sMesh.position.set(
                            stair.x,
                            yOffset + (stepHeight * (s + 1)) / 2,
                            stair.z - stair.depth / 2 + (s * stepDepth) + stepDepth / 2
                        );
                        this.buildingGroup.add(sMesh);

                        // Illuminated tread edge in VR
                        const edgeGeo = new THREE.BoxGeometry(stair.width, 0.08, 0.35);
                        const edgeMesh = new THREE.Mesh(edgeGeo, stairGlowMat);
                        edgeMesh.position.set(
                            stair.x,
                            yOffset + stepHeight * (s + 1) + 0.04,
                            stair.z - stair.depth / 2 + (s * stepDepth) + stepDepth - 0.18
                        );
                        this.buildingGroup.add(edgeMesh);
                    }

                    // Handrails with safety glow
                    const railGeo = new THREE.BoxGeometry(0.12, 1.5, stair.depth);
                    const railMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 });
                    const railL = new THREE.Mesh(railGeo, railMat);
                    railL.position.set(stair.x - stair.width/2 + 0.2, yOffset + 1.5, stair.z);
                    const railR = new THREE.Mesh(railGeo, railMat);
                    railR.position.set(stair.x + stair.width/2 - 0.2, yOffset + 1.5, stair.z);
                    this.buildingGroup.add(railL);
                    this.buildingGroup.add(railR);
                });
            }
        });

        this.teleportToStartPosition(targetFloor);

        // Maintain the victim's active evacuation route in VR mode
        if (window.lastCalculatedRouteNodeIds && window.lastCalculatedRouteNodeIds.length >= 2) {
            this.updateEvacuationRoute(this.buildRouteFromNodeIds(window.lastCalculatedRouteNodeIds));
        } else if (window.lastCalculatedRoutePoints && window.lastCalculatedRoutePoints.length >= 2) {
            this.updateEvacuationRoute(window.lastCalculatedRoutePoints);
        } else if (window.victimAgent && window.victimAgent.targetWaypoints && window.victimAgent.targetWaypoints.length >= 2) {
            this.updateEvacuationRoute(window.victimAgent.targetWaypoints);
        } else if (!this.evacRoutePoints) {
            const defaultRoute = [
                { x: 30, y: 0, z: 0 },
                { x: 10, y: 0, z: 0 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 0, z: -15 },
                { x: 0, y: 0, z: -35 }
            ];
            this.updateEvacuationRoute(defaultRoute);
        }

        // Synchronize victim avatar in VR mode if victim exists
        if (window.victimAgent && window.victimAgent.victimMesh) {
            this.syncVictim(window.victimAgent.victimMesh);
        }
    }

    teleportToStartPosition(floorLevel = 0) {
        let yOffset = 0;
        if (this.buildingData && this.buildingData.floors) {
            const fl = this.buildingData.floors.find(f => Number(f.level) === floorLevel);
            if (fl && fl.elevation !== undefined) {
                yOffset = fl.elevation;
            } else if (floorLevel > 0) {
                yOffset = floorLevel * 12;
            }
        }
        this.cameraRig.position.set(0, yOffset + this.playerHeight, 0);
        this.yaw = 0;
        this.pitch = 0;
        this.cameraYaw.rotation.y = 0;
        this.cameraPitch.rotation.x = 0;
    }

    teleportToVictim(victimMesh) {
        if (!victimMesh) return;
        const vPos = victimMesh.position;
        const targetY = (vPos.y !== undefined ? vPos.y : 0) + this.playerHeight;
        
        // Find direction towards next route waypoint or victim forward direction
        let lookYaw = victimMesh.rotation.y || 0;
        if (this.evacRoutePoints && this.evacRoutePoints.length >= 2) {
            const nextPt = this.evacRoutePoints[Math.min(1, this.evacRoutePoints.length - 1)];
            const dx = nextPt.x - vPos.x;
            const dz = nextPt.z - vPos.z;
            if (Math.hypot(dx, dz) > 0.5) {
                lookYaw = Math.atan2(-dx, -dz);
            }
        }
        
        // Offset camera 2.5 meters behind victim so victim is visible directly in front of the user
        const backX = Math.sin(lookYaw) * 2.5;
        const backZ = Math.cos(lookYaw) * 2.5;
        
        this.cameraRig.position.set(vPos.x + backX, targetY, vPos.z + backZ);
        this.yaw = lookYaw;
        this.pitch = -0.05;
        this.cameraYaw.rotation.y = this.yaw;
        this.cameraPitch.rotation.x = this.pitch;
        this.stopRouteWalkthrough();
    }

    teleportToExit() {
        this.cameraRig.position.set(
            this.nearestExitPos.x,
            (this.nearestExitPos.y || 0) + this.playerHeight,
            this.nearestExitPos.z + 4
        );
        this.yaw = Math.PI;
        this.cameraYaw.rotation.y = this.yaw;
        this.stopRouteWalkthrough();
    }

    teleportToFire() {
        if (this.activeFires.length > 0) {
            const fire = this.activeFires[0];
            const origin = fire.origin || (fire.mesh ? fire.mesh.position : { x: 0, y: 0, z: 0 });
            const targetY = (origin.y !== undefined ? origin.y : 0) + this.playerHeight;
            this.cameraRig.position.set(origin.x + 6, targetY, origin.z + 6);
            const dx = origin.x - this.cameraRig.position.x;
            const dz = origin.z - this.cameraRig.position.z;
            this.yaw = Math.atan2(dx, dz);
            this.cameraYaw.rotation.y = this.yaw;
            this.stopRouteWalkthrough();
        }
    }

    syncFires(firesList) {
        while (this.fireGroup.children.length > 0) {
            const child = this.fireGroup.children[0];
            this.fireGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }
        this.activeFires = firesList || [];

        this.activeFires.forEach(f => {
            const origin = f.origin || (f.mesh ? f.mesh.position : { x: 0, y: 0, z: 0 });
            
            const fireGeo = new THREE.ConeGeometry(2.0, 4.5, 8);
            const fireMat = new THREE.MeshBasicMaterial({
                color: 0xff3b00,
                transparent: true,
                opacity: 0.9
            });
            const fireMesh = new THREE.Mesh(fireGeo, fireMat);
            fireMesh.position.set(origin.x, 2.2, origin.z);
            this.fireGroup.add(fireMesh);

            const fireLight = new THREE.PointLight(0xff5500, 3.5, 30);
            fireLight.position.set(origin.x, 3.0, origin.z);
            this.fireGroup.add(fireLight);

            for (let i = 0; i < 4; i++) {
                const smokeGeo = new THREE.SphereGeometry(1.6 + i * 0.4, 8, 8);
                const smokeMat = new THREE.MeshBasicMaterial({
                    color: 0x1e293b,
                    transparent: true,
                    opacity: 0.4 - i * 0.08
                });
                const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
                smokeMesh.position.set(origin.x + (Math.random() - 0.5), 3.5 + i * 1.5, origin.z + (Math.random() - 0.5));
                this.fireGroup.add(smokeMesh);
            }
        });
    }

    createVRBillboardBadge(text, textColor = "#ffffff", bgColor = "rgba(15, 23, 42, 0.9)") {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 80;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = bgColor;
        if (ctx.roundRect) ctx.roundRect(4, 4, 312, 72, 14);
        else ctx.fillRect(4, 4, 312, 72);
        ctx.fill();

        ctx.strokeStyle = textColor;
        ctx.lineWidth = 4;
        if (ctx.roundRect) ctx.roundRect(4, 4, 312, 72, 14);
        else ctx.strokeRect(4, 4, 312, 72);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 160, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(6.5, 1.6, 1.0);
        return sprite;
    }

    syncVictim(victimMesh) {
        if (!victimMesh || !victimMesh.visible) {
            if (this.vrVictimAvatar) this.vrVictimAvatar.visible = false;
            return;
        }

        if (!this.vrVictimAvatar) {
            const group = new THREE.Group();
            
            // Body
            const bodyGeo = new THREE.CylinderGeometry(0.5, 0.45, 2.2, 12);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1.9;
            group.add(body);

            // Head
            const headGeo = new THREE.SphereGeometry(0.55, 12, 12);
            const headMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.y = 3.3;
            group.add(head);

            // Locator Tag Badge
            const badge = this.createVRBillboardBadge("👤 EVACUATING VICTIM", "#38bdf8", "rgba(15, 23, 42, 0.95)");
            badge.position.y = 4.5;
            group.add(badge);

            // Glowing base aura ring
            const ringGeo = new THREE.RingGeometry(1.2, 1.8, 24);
            ringGeo.rotateX(-Math.PI / 2);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.y = 0.15;
            group.add(ring);

            this.vrVictimAvatar = group;
            this.victimGroup.add(this.vrVictimAvatar);
        }

        this.vrVictimAvatar.visible = true;
        this.vrVictimAvatar.position.copy(victimMesh.position);
        this.vrVictimAvatar.rotation.y = victimMesh.rotation.y;
    }

    getNodeWorldPosition(nodeId) {
        const bData = this.buildingData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (!bData || !bData.floors) return null;
        for (let f = 0; f < bData.floors.length; f++) {
            const floor = bData.floors[f];
            if (floor.nodes) {
                const n = floor.nodes.find(item => item && item.id === nodeId);
                if (n) {
                    const yOffset = floor.elevation !== undefined ? floor.elevation : (f * 12);
                    return new THREE.Vector3(n.x, yOffset, n.z);
                }
            }
        }
        return null;
    }

    buildRouteFromNodeIds(nodeIds) {
        if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length === 0) return [];
        const rawPoints = [];
        nodeIds.forEach(id => {
            const pt = this.getNodeWorldPosition(id);
            if (pt) {
                rawPoints.push(pt);
            }
        });
        if (rawPoints.length < 2) return rawPoints;

        const points = [];
        for (let i = 0; i < rawPoints.length; i++) {
            const p1 = rawPoints[i];
            points.push(p1.clone());

            if (i < rawPoints.length - 1) {
                const p2 = rawPoints[i + 1];
                const dy = p2.y - p1.y;
                if (Math.abs(dy) > 1.5) {
                    const steps = 4;
                    for (let s = 1; s <= steps; s++) {
                        const t = s / (steps + 1);
                        points.push(new THREE.Vector3(
                            p1.x + (p2.x - p1.x) * t,
                            p1.y + dy * t,
                            p1.z + (p2.z - p1.z) * t
                        ));
                    }
                }
            }
        }
        return points;
    }

    updateEvacuationRoute(routePoints) {
        // Clear previous route objects
        while (this.routeGroup.children.length > 0) {
            const child = this.routeGroup.children[0];
            this.routeGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        }
        this.chevrons = [];

        // 1. Resolve points prioritizing passed routePoints for real-time dynamic route updates
        let pts = [];
        if (routePoints && Array.isArray(routePoints) && routePoints.length >= 2) {
            pts = routePoints.map(p => new THREE.Vector3(p.x, p.y !== undefined ? p.y : 0, p.z));
        } else if (window.lastCalculatedRoutePoints && window.lastCalculatedRoutePoints.length >= 2) {
            pts = window.lastCalculatedRoutePoints.map(p => new THREE.Vector3(p.x, p.y !== undefined ? p.y : 0, p.z));
        } else if (window.lastCalculatedRouteNodeIds && window.lastCalculatedRouteNodeIds.length >= 2) {
            pts = this.buildRouteFromNodeIds(window.lastCalculatedRouteNodeIds);
        }

        // Filter and deduplicate consecutive identical points
        const cleanPoints = [];
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            if (cleanPoints.length === 0 || cleanPoints[cleanPoints.length - 1].distanceTo(p) > 0.08) {
                cleanPoints.push(p.clone());
            }
        }

        if (cleanPoints.length < 2) return;
        this.evacRoutePoints = cleanPoints;

        // 2. Guaranteed 3D Segmented Laser Beams at eye/chest level (+1.4m)
        // Segment-by-segment cylinders guarantee 100% visibility from anywhere without curve/tangent failure
        const laserMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.95,
            depthTest: false,
            depthWrite: false
        });
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0x34d399,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
        });

        for (let i = 0; i < cleanPoints.length - 1; i++) {
            const p1 = cleanPoints[i];
            const p2 = cleanPoints[i + 1];
            const v1 = new THREE.Vector3(p1.x, p1.y + 1.4, p1.z);
            const v2 = new THREE.Vector3(p2.x, p2.y + 1.4, p2.z);
            const segDist = v1.distanceTo(v2);
            if (segDist < 0.1) continue;

            const beamGeo = new THREE.CylinderGeometry(0.22, 0.22, segDist, 8);
            beamGeo.translate(0, segDist / 2, 0);
            beamGeo.rotateX(Math.PI / 2);
            const beam = new THREE.Mesh(beamGeo, laserMat);
            beam.position.copy(v1);
            beam.lookAt(v2);
            beam.renderOrder = 9999;
            this.routeGroup.add(beam);

            // Aura cylinder
            const auraGeo = new THREE.CylinderGeometry(0.55, 0.55, segDist, 8);
            auraGeo.translate(0, segDist / 2, 0);
            auraGeo.rotateX(Math.PI / 2);
            const auraBeam = new THREE.Mesh(auraGeo, auraMat);
            auraBeam.position.copy(v1);
            auraBeam.lookAt(v2);
            auraBeam.renderOrder = 9998;
            this.routeGroup.add(auraBeam);

            // Radiant Joint Sphere at vertex
            const jointGeo = new THREE.SphereGeometry(0.32, 8, 8);
            const joint = new THREE.Mesh(jointGeo, laserMat);
            joint.position.copy(v1);
            joint.renderOrder = 9999;
            this.routeGroup.add(joint);
        }

        // Optional smooth CatmullRom tube for continuous lighting
        try {
            const tubePoints = cleanPoints.map(p => new THREE.Vector3(p.x, p.y + 1.4, p.z));
            const curve = new THREE.CatmullRomCurve3(tubePoints, false, 'catmullrom', 0);
            const tubeSegments = Math.max(30, tubePoints.length * 6);
            const coreGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.28, 10, false);
            const coreMesh = new THREE.Mesh(coreGeo, laserMat);
            coreMesh.renderOrder = 9999;
            this.routeGroup.add(coreMesh);
        } catch (err) {
            // Segmented cylinders above provide full guaranteed fallback
        }

        // 3. Ground-Level Directional Chevrons & Luminous Floor Guidance Runner (+0.18m)
        for (let i = 0; i < cleanPoints.length - 1; i++) {
            const p1 = cleanPoints[i];
            const p2 = cleanPoints[i + 1];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dz = p2.z - p1.z;
            const dist = Math.hypot(dx, dz);
            if (dist < 0.2) continue;

            const angle = Math.atan2(dx, dz);

            // Emergency floor stripe ribbon along this segment
            const stripeGeo = new THREE.PlaneGeometry(1.0, dist);
            const stripeMat = new THREE.MeshBasicMaterial({
                color: 0x065f46,
                transparent: true,
                opacity: 0.65,
                side: THREE.DoubleSide,
                depthTest: false,
                depthWrite: false
            });
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.set(p1.x + dx * 0.5, p1.y + dy * 0.5 + 0.12, p1.z + dz * 0.5);
            stripe.rotation.x = -Math.PI / 2;
            stripe.rotation.z = Math.PI - angle;
            stripe.renderOrder = 9996;
            this.routeGroup.add(stripe);

            // Directional pulsing chevrons pointing along the route towards the exit
            const steps = Math.max(1, Math.floor(dist / 2.8));
            for (let s = 0; s < steps; s++) {
                const frac = (s + 0.5) / steps;
                const cx = p1.x + dx * frac;
                const cy = p1.y + dy * frac + 0.18;
                const cz = p1.z + dz * frac;

                const chevronShape = new THREE.Shape();
                chevronShape.moveTo(0, 1.2);
                chevronShape.lineTo(1.1, -0.8);
                chevronShape.lineTo(0.6, -0.8);
                chevronShape.lineTo(0, 0.3);
                chevronShape.lineTo(-0.6, -0.8);
                chevronShape.lineTo(-1.1, -0.8);
                chevronShape.closePath();

                const chevGeo = new THREE.ShapeGeometry(chevronShape);
                const chevMat = new THREE.MeshBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.95,
                    side: THREE.DoubleSide,
                    depthTest: false,
                    depthWrite: false
                });

                const chevMesh = new THREE.Mesh(chevGeo, chevMat);
                chevMesh.position.set(cx, cy, cz);
                chevMesh.rotation.x = -Math.PI / 2;
                chevMesh.rotation.z = Math.PI - angle; // Pointing forward along route
                chevMesh.renderOrder = 9997;

                this.routeGroup.add(chevMesh);
                this.chevrons.push({ mesh: chevMesh, phase: (i * steps + s) * 0.4 });
            }
        }

        // 4. Glowing Waypoint Turn Beacons (vertical light column + floor ring)
        cleanPoints.forEach((pt) => {
            // Vertical holographic beacon column
            const colGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.6, 16);
            const colMat = new THREE.MeshBasicMaterial({
                color: 0x10b981,
                transparent: true,
                opacity: 0.55,
                depthTest: false,
                depthWrite: false
            });
            const colMesh = new THREE.Mesh(colGeo, colMat);
            colMesh.position.set(pt.x, pt.y + 1.3, pt.z);
            colMesh.renderOrder = 9995;
            this.routeGroup.add(colMesh);

            // Ground beacon ring
            const beaconGeo = new THREE.RingGeometry(0.8, 1.3, 24);
            beaconGeo.rotateX(-Math.PI / 2);
            const beaconMat = new THREE.MeshBasicMaterial({
                color: 0x10b981,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
                depthTest: false,
                depthWrite: false
            });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(pt.x, pt.y + 0.16, pt.z);
            beacon.renderOrder = 9998;
            this.routeGroup.add(beacon);
        });

        // 5. Floating Exit Billboard Banner at final waypoint
        const lastPt = cleanPoints[cleanPoints.length - 1];
        this.nearestExitPos.set(lastPt.x, lastPt.y, lastPt.z);

        const exitBanner = this.createVRBillboardBadge("🟢 EMERGENCY EXIT GATE", "#10b981", "rgba(6, 78, 59, 0.95)");
        exitBanner.position.set(lastPt.x, lastPt.y + 3.8, lastPt.z);
        exitBanner.renderOrder = 10000;
        this.routeGroup.add(exitBanner);

        // Emergency exit light beacon
        const exitLight = new THREE.PointLight(0x10b981, 2.5, 25);
        exitLight.position.set(lastPt.x, lastPt.y + 3.0, lastPt.z);
        this.routeGroup.add(exitLight);
    }

    animate() {
        const now = performance.now();
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        if (this.isWalkingRoute) {
            this.updateRouteWalkthrough(delta);
        } else {
            this.updateMovement(delta);
        }

        // Ensure victim continues evacuating smoothly when on VR tab
        if (window.victimAgent && window.victimAgent.status === 'EVACUATING') {
            window.victimAgent.update();
        }

        this.animateControllers(delta);

        this.alarmPhase += delta * 5;
        if (this.alarmLight) {
            this.alarmLight.intensity = Math.sin(this.alarmPhase) > 0 ? 3.0 : 0.2;
        }

        if (this.fireGroup && this.fireGroup.children.length > 0) {
            const time = now * 0.005;
            this.fireGroup.children.forEach((child, idx) => {
                if (child.isPointLight) {
                    child.intensity = 2.5 + Math.sin(time * 3 + idx) * 1.0;
                } else if (child.geometry instanceof THREE.ConeGeometry) {
                    child.scale.set(1 + Math.sin(time * 4) * 0.15, 1 + Math.cos(time * 5) * 0.2, 1 + Math.sin(time * 4) * 0.15);
                } else if (child.geometry instanceof THREE.SphereGeometry) {
                    child.position.y += 0.02;
                    child.rotation.y += 0.01;
                    if (child.position.y > 10.0) {
                        child.position.y = 3.5;
                    }
                }
            });
        }

        this.chevronTime += delta * 4;
        this.chevrons.forEach(ch => {
            const pulse = (Math.sin(this.chevronTime + ch.phase) + 1) / 2;
            ch.mesh.material.opacity = 0.3 + pulse * 0.7;
            ch.mesh.scale.setScalar(0.9 + pulse * 0.2);
        });

        this.checkStairProximity();
        this.updateHUDTelemetry();
        this.renderMinimap();

        if (this.isStereoMode) {
            this.renderStereoscopic();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    animateControllers(delta) {
        if (!this.controllersGroup) return;

        const isMoving = this.isWalkingRoute || (this.velocity.lengthSq() > 0.1);
        const bobAmount = isMoving ? 0.03 : 0.006;
        const bobFreq = isMoving ? 9 : 2.5;
        const t = performance.now() * 0.001;

        const leftBob = Math.sin(t * bobFreq) * bobAmount;
        const rightBob = Math.cos(t * bobFreq) * bobAmount;

        this.leftController.position.y = -0.22 + leftBob;
        this.leftController.position.x = -0.28 + Math.sin(t * 1.2) * 0.005;

        this.rightController.position.y = -0.22 + rightBob;
        this.rightController.position.x = 0.28 + Math.cos(t * 1.2) * 0.005;

        if (isMoving) {
            this.camera.position.y = Math.sin(this.walkPhase * 2) * 0.04;
            this.camera.rotation.z = Math.sin(this.walkPhase) * 0.005;
        } else {
            this.camera.position.y = 0;
            this.camera.rotation.z = 0;
        }
    }

    // ============================================================
    // SOLID WALL COLLISION & PASSAGE-ONLY MOVEMENT LOGIC
    // Prevents phasing through walls or exiting building in VR mode
    // ============================================================
    distSqToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.z - w.z) ** 2;
        if (l2 === 0) return (p.x - v.x) ** 2 + (p.z - v.z) ** 2;
        let t = ((p.x - v.x) * (w.x - v.x) + (p.z - v.z) * (w.z - v.z)) / l2;
        t = Math.max(0, Math.min(1, t));
        return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.z - (v.z + t * (w.z - v.z))) ** 2;
    }

    segmentsIntersect(a1, a2, b1, b2) {
        function ccw(p1, p2, p3) {
            return (p3.z - p1.z) * (p2.x - p1.x) > (p2.z - p1.z) * (p3.x - p1.x);
        }
        return (ccw(a1, b1, b2) !== ccw(a2, b1, b2)) && (ccw(a1, a2, b1) !== ccw(a1, a2, b2));
    }

    getFloorEnvelope(floorLevel) {
        if (this.floorBoundsCache && this.floorBoundsCache.has(floorLevel)) {
            return this.floorBoundsCache.get(floorLevel);
        }
        const bData = this.buildingData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        const floor = bData?.floors?.find(f => Number(f.level) === floorLevel) || bData?.floors?.[floorLevel];
        let minX = -80, maxX = 80, minZ = -35, maxZ = 35;
        if (floor && floor.geometry && floor.geometry.walls && floor.geometry.walls.length > 0) {
            minX = Infinity; maxX = -Infinity; minZ = Infinity; maxZ = -Infinity;
            floor.geometry.walls.forEach(w => {
                minX = Math.min(minX, w.x1, w.x2);
                maxX = Math.max(maxX, w.x1, w.x2);
                minZ = Math.min(minZ, w.z1, w.z2);
                maxZ = Math.max(maxZ, w.z1, w.z2);
            });
        }
        const bounds = { minX, maxX, minZ, maxZ };
        if (this.floorBoundsCache) this.floorBoundsCache.set(floorLevel, bounds);
        return bounds;
    }

    canMoveTo(p1, p2, floorLevel) {
        const bData = this.buildingData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (!bData || !bData.floors) return true;
        const floor = bData.floors.find(f => Number(f.level) === floorLevel) || bData.floors[floorLevel];
        if (!floor || !floor.geometry) return true;

        const walls = floor.geometry.walls || [];
        const doors = floor.geometry.doors || [];

        // 1. Exterior boundary envelope check (prevents walking outside building into void)
        const bounds = this.getFloorEnvelope(floorLevel);
        if (p2.x < bounds.minX + 0.4 || p2.x > bounds.maxX - 0.4 || p2.z < bounds.minZ + 0.4 || p2.z > bounds.maxZ - 0.4) {
            // Allow Ground floor main exit passages
            let isAtExteriorExit = false;
            if (floorLevel === 0) {
                for (let i = 0; i < doors.length; i++) {
                    const d = doors[i];
                    if (Math.hypot(p2.x - d.x, p2.z - d.z) < ((d.width || 3.0) + 1.2)) {
                        isAtExteriorExit = true;
                        break;
                    }
                }
            }
            if (!isAtExteriorExit) return false;
        }

        // 2. Strict Wall collision: walls are 100% solid, passage permitted ONLY through open doorways
        const playerRadius = 0.55;
        for (let i = 0; i < walls.length; i++) {
            const w = walls[i];
            const v = { x: w.x1, z: w.z1 };
            const wEnd = { x: w.x2, z: w.z2 };

            const intersects = this.segmentsIntersect(p1, p2, v, wEnd);
            const wallDist = Math.sqrt(this.distSqToSegment(p2, v, wEnd));
            const threshold = ((w.thickness || 0.6) / 2) + playerRadius;

            if (intersects || wallDist < threshold) {
                // Check if passing through an open doorway/passage on this wall
                let throughDoor = false;
                for (let j = 0; j < doors.length; j++) {
                    const d = doors[j];
                    if (d.wallId === w.id || Math.sqrt(this.distSqToSegment({ x: d.x, z: d.z }, v, wEnd)) < 1.5) {
                        const halfDw = ((d.width || 3.0) / 2) + 0.35;
                        const dDist = Math.hypot(p2.x - d.x, p2.z - d.z);
                        if (dDist <= halfDw + 0.6) {
                            throughDoor = true;
                            break;
                        }
                    }
                }
                if (!throughDoor) {
                    return false; // Solid wall blocks passage!
                }
            }
        }
        return true;
    }

    updateMovement(delta) {
        if (this.isTransitioningFloor) return;

        const moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.z -= 1;
        if (this.keys.backward) moveDir.z += 1;
        if (this.keys.left) moveDir.x -= 1;
        if (this.keys.right) moveDir.x += 1;

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            const currentSpeed = this.moveSpeed * (this.keys.sprint ? this.sprintMultiplier : 1.0);
            
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            this.velocity.x = moveDir.x * currentSpeed;
            this.velocity.z = moveDir.z * currentSpeed;

            this.walkPhase += delta * currentSpeed * 0.7;
            if (Math.sin(this.walkPhase * 2) > 0.96 && Math.random() < 0.2) {
                this.playFootstepSound();
            }
        } else {
            this.velocity.x *= 0.75;
            this.velocity.z *= 0.75;
        }

        const deltaX = this.velocity.x * delta;
        const deltaZ = this.velocity.z * delta;

        if (Math.abs(deltaX) > 0.0001 || Math.abs(deltaZ) > 0.0001) {
            const p1 = { x: this.cameraRig.position.x, z: this.cameraRig.position.z };
            const p2Full = { x: p1.x + deltaX, z: p1.z + deltaZ };

            // 1. Direct diagonal move
            if (this.canMoveTo(p1, p2Full, this.currentFloorLevel)) {
                this.cameraRig.position.x = p2Full.x;
                this.cameraRig.position.z = p2Full.z;
            } else {
                // 2. Smooth sliding along X wall surface
                const p2X = { x: p1.x + deltaX, z: p1.z };
                if (this.canMoveTo(p1, p2X, this.currentFloorLevel)) {
                    this.cameraRig.position.x = p2X.x;
                }
                // 3. Smooth sliding along Z wall surface
                const p2Z = { x: this.cameraRig.position.x, z: p1.z + deltaZ };
                if (this.canMoveTo({ x: this.cameraRig.position.x, z: p1.z }, p2Z, this.currentFloorLevel)) {
                    this.cameraRig.position.z = p2Z.z;
                }
            }

            // Safe envelope clamping
            const bounds = this.getFloorEnvelope(this.currentFloorLevel);
            this.cameraRig.position.x = Math.max(bounds.minX + 0.5, Math.min(bounds.maxX - 0.5, this.cameraRig.position.x));
            this.cameraRig.position.z = Math.max(bounds.minZ + 0.5, Math.min(bounds.maxZ - 0.5, this.cameraRig.position.z));

            // Sync victim mesh if present and not in autonomous evacuation mode
            if (this.vrVictimAvatar && window.victimAgent && window.victimAgent.status !== 'EVACUATING' && window.victimAgent.victimMesh) {
                const targetY = (this.buildingData?.floors?.[this.currentFloorLevel]?.elevation !== undefined) ? this.buildingData.floors[this.currentFloorLevel].elevation : (this.currentFloorLevel * 12);
                window.victimAgent.victimMesh.position.set(this.cameraRig.position.x, targetY, this.cameraRig.position.z);
                this.vrVictimAvatar.position.copy(window.victimAgent.victimMesh.position);
            }
        }
    }

    // ============================================================
    // STAIRCASE DETECTION & INTER-FLOOR TRAVERSAL
    // Allows ascending/descending floors via stairs with UP/DOWN buttons
    // ============================================================
    getStairsForFloor(floorLevel) {
        const stairs = [];
        const bData = this.buildingData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (!bData || !bData.floors) return stairs;
        const floor = bData.floors.find(f => Number(f.level) === floorLevel) || bData.floors[floorLevel];
        if (floor && floor.geometry && floor.geometry.stairs) {
            floor.geometry.stairs.forEach(s => {
                stairs.push({ id: s.id, x: s.x, z: s.z, width: s.width || 12, depth: s.depth || 16 });
            });
        }
        // Ground floor central column connector
        if (floorLevel === 0 && !stairs.some(s => Math.hypot(s.x - (-6.5), s.z - 18) < 5)) {
            stairs.push({ id: "G_CORE_STAIRS", x: -6.5, z: 18, width: 12, depth: 18 });
        }
        return stairs;
    }

    checkStairProximity() {
        const playerPos = this.cameraRig.position;
        const stairs = this.getStairsForFloor(this.currentFloorLevel);
        let nearStair = null;
        let minDist = Infinity;

        stairs.forEach(s => {
            const d = Math.hypot(playerPos.x - s.x, playerPos.z - s.z);
            if (d < minDist) {
                minDist = d;
                nearStair = s;
            }
        });

        const stairRadius = 9.0;
        if (minDist <= stairRadius) {
            this.isNearStairs = true;
            this.currentStairInfo = { stair: nearStair, dist: minDist };
        } else if (minDist > stairRadius + 1.2) {
            this.isNearStairs = false;
            this.currentStairInfo = null;
        }

        // Update In-Viewport Stair Navigation HUD Prompt UI
        const prompt = document.getElementById("vrStairPrompt");
        if (prompt) {
            if (this.isNearStairs) {
                prompt.style.display = "flex";
                const curFloorText = document.getElementById("vrStairCurrentFloorText");
                if (curFloorText) {
                    curFloorText.textContent = `Current: ${this.currentFloorLevel === 0 ? "Ground Floor" : `Floor ${this.currentFloorLevel}`}`;
                }

                const btnUp = document.getElementById("btnVRStairUp");
                const labelUp = document.getElementById("vrStairUpFloorLabel");
                if (btnUp && labelUp) {
                    if (this.currentFloorLevel < 7) {
                        btnUp.disabled = false;
                        btnUp.style.display = "flex";
                        labelUp.textContent = `Floor ${this.currentFloorLevel + 1}`;
                    } else {
                        btnUp.disabled = true;
                        btnUp.style.display = "none";
                    }
                }

                const btnDown = document.getElementById("btnVRStairDown");
                const labelDown = document.getElementById("vrStairDownFloorLabel");
                if (btnDown && labelDown) {
                    if (this.currentFloorLevel > 0) {
                        btnDown.disabled = false;
                        btnDown.style.display = "flex";
                        labelDown.textContent = this.currentFloorLevel === 1 ? "Ground Floor" : `Floor ${this.currentFloorLevel - 1}`;
                    } else {
                        btnDown.disabled = true;
                        btnDown.style.display = "none";
                    }
                }
            } else {
                prompt.style.display = "none";
            }
        }
    }

    transitionFloorViaStairs(direction) {
        if (this.isTransitioningFloor) return;
        const bData = this.buildingData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        const maxFloor = (bData && bData.floors) ? (bData.floors.length - 1) : 7;
        const targetFloor = this.currentFloorLevel + direction;
        if (targetFloor < 0 || targetFloor > maxFloor) {
            return;
        }

        this.isTransitioningFloor = true;
        this.stopRouteWalkthrough();

        // Target floor elevation
        let targetElev = targetFloor * 12;
        if (bData && bData.floors && bData.floors[targetFloor] && bData.floors[targetFloor].elevation !== undefined) {
            targetElev = bData.floors[targetFloor].elevation;
        }

        // Target stair landing coordinates on the destination floor
        let targetX = -6.5;
        let targetZ = 18;
        if (targetFloor === 0) {
            // If descending to Ground floor, land at South Main stairs landing
            targetX = 6;
            targetZ = 26.5;
        } else if (targetFloor === 2) {
            targetX = -6.5;
            targetZ = 20;
        }

        const startX = this.cameraRig.position.x;
        const startY = this.cameraRig.position.y;
        const startZ = this.cameraRig.position.z;
        const targetCameraY = targetElev + this.playerHeight;

        const startTime = performance.now();
        const duration = 900; // 0.9s realistic vertical stair descent/ascent
        let footstepCounter = 0;

        const animateTransition = (now) => {
            const elapsed = now - startTime;
            const p = Math.min(1.0, elapsed / duration);
            // Smooth easeInOut cubic
            const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

            this.cameraRig.position.x = startX + (targetX - startX) * ease;
            this.cameraRig.position.y = startY + (targetCameraY - startY) * ease;
            this.cameraRig.position.z = startZ + (targetZ - startZ) * ease;

            // Pitch camera slightly along stair flight (up for ascent, down for descent)
            const stairPitch = direction > 0 ? 0.12 : -0.15;
            this.cameraPitch.rotation.x = this.pitch + stairPitch * Math.sin(p * Math.PI);

            // Synchronize victim avatar
            if (this.vrVictimAvatar) {
                this.vrVictimAvatar.position.set(this.cameraRig.position.x, this.cameraRig.position.y - this.playerHeight, this.cameraRig.position.z);
            }

            // Rhythm of footsteps on stairs
            const stepIndex = Math.floor(p * 5);
            if (stepIndex > footstepCounter) {
                footstepCounter = stepIndex;
                this.playFootstepSound();
            }

            if (p < 1.0) {
                requestAnimationFrame(animateTransition);
            } else {
                // Finalize floor transition
                this.currentFloorLevel = targetFloor;
                this.isTransitioningFloor = false;
                this.cameraPitch.rotation.x = this.pitch;

                // Update floor selector dropdown
                const vrSelect = document.getElementById("vrFloorSelect");
                if (vrSelect) vrSelect.value = String(targetFloor);

                // Update victim agent position and node ID
                if (window.victimAgent && window.victimAgent.victimMesh) {
                    window.victimAgent.victimMesh.position.set(targetX, targetElev, targetZ);
                    this.syncVictim(window.victimAgent.victimMesh);
                    if (bData && bData.floors[targetFloor] && bData.floors[targetFloor].nodes) {
                        const stairNode = bData.floors[targetFloor].nodes.find(n => n && (n.type === 'staircase' || (n.id && n.id.includes('STAIR'))));
                        if (stairNode) {
                            window.victimAgent.currentNodeId = stairNode.id;
                        }
                    }
                }

                // Refresh HUD, radar and proximity
                this.updateHUDTelemetry();
                this.renderMinimap();
                this.checkStairProximity();

                // Sync 3D viewer if present
                if (window.threeDViewer && typeof window.threeDViewer.selectFloor === 'function') {
                    window.threeDViewer.selectFloor(targetFloor);
                }
            }
        };

        requestAnimationFrame(animateTransition);
    }

    updateHUDTelemetry() {
        const playerPos = this.cameraRig.position;

        const distToExit = Math.hypot(playerPos.x - this.nearestExitPos.x, playerPos.z - this.nearestExitPos.z);
        const exitElem = document.getElementById("vrExitDist");
        if (exitElem) {
            exitElem.textContent = `${distToExit.toFixed(1)} m`;
        }

        let minDistFire = Infinity;
        this.activeFires.forEach(f => {
            const origin = f.origin || (f.mesh ? f.mesh.position : { x: 0, y: 0, z: 0 });
            const d = Math.hypot(playerPos.x - origin.x, playerPos.z - origin.z);
            if (d < minDistFire) minDistFire = d;
        });

        let temp = 24.5;
        let bpm = 72;
        let hazardStatus = "NORMAL (PATH CLEAR)";
        let hazardColor = "#10b981";

        if (minDistFire < 10) {
            temp = Math.min(190, 85 + (10 - minDistFire) * 10);
            bpm = Math.min(160, 110 + (10 - minDistFire) * 5);
            hazardStatus = "CRITICAL: EXTREME HEAT PROXIMITY!";
            hazardColor = "#ef4444";
            if (Math.random() < 0.05) this.playHeartbeatSound();
        } else if (minDistFire < 25) {
            temp = 38 + (25 - minDistFire) * 2;
            bpm = 85 + (25 - minDistFire) * 1.5;
            hazardStatus = "WARNING: HIGH TEMPERATURE";
            hazardColor = "#f59e0b";
        }

        const tempElem = document.getElementById("vrTemp");
        const bpmElem = document.getElementById("vrBpm");
        const hazardElem = document.getElementById("vrHazardStatus");
        const hazardAlert = document.getElementById("vrHazardAlert");

        if (tempElem) tempElem.textContent = `${temp.toFixed(1)} °C`;
        if (bpmElem) bpmElem.textContent = `${Math.round(bpm)} BPM`;
        if (hazardElem) {
            hazardElem.textContent = hazardStatus;
            hazardElem.style.color = hazardColor;
        }
        if (hazardAlert) {
            hazardAlert.style.opacity = minDistFire < 12 ? (1 - minDistFire / 12) * 0.7 : 0;
        }

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        let deg = Math.round((Math.atan2(forward.x, forward.z) * 180 / Math.PI + 360) % 360);
        const compassDirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const cardinal = compassDirs[Math.round(deg / 45) % 8];
        const compassElem = document.getElementById("vrCompass");
        if (compassElem) {
            compassElem.textContent = `${cardinal} ${deg}°`;
        }

        let currentFloorTag = "GF";
        if (this.buildingData && this.buildingData.floors) {
            for (let f = this.buildingData.floors.length - 1; f >= 0; f--) {
                const elev = this.buildingData.floors[f].elevation !== undefined ? this.buildingData.floors[f].elevation : (f * 12);
                if (playerPos.y >= (elev - 1.0)) {
                    currentFloorTag = f === 0 ? "GF (Ground)" : `${f}F`;
                    break;
                }
            }
        }
        this.updateWristHUD(`FLOOR: ${currentFloorTag}`, hazardStatus.substring(0, 14), Math.round(bpm));
    }

    renderStereoscopic() {
        if (!this.container || !this.renderer) return;
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        if (width === 0 || height === 0) return;
        const halfWidth = Math.floor(width / 2);

        // Ensure first-person rig matrix is completely calculated for this frame
        this.cameraRig.updateMatrixWorld(true);

        if (!this.stereoCamera) {
            this.stereoCamera = new THREE.StereoCamera();
        }
        this.stereoCamera.aspect = 0.5;
        this.stereoCamera.eyeSep = this.ipd || 0.064;
        this.stereoCamera.update(this.camera);

        // Enable scissor test to draw two viewports side-by-side
        this.renderer.setScissorTest(true);

        // 1. Left Eye (Left 50% of the screen)
        this.renderer.setViewport(0, 0, halfWidth, height);
        this.renderer.setScissor(0, 0, halfWidth, height);
        this.renderer.render(this.scene, this.stereoCamera.cameraL);

        // 2. Right Eye (Right 50% of the screen)
        this.renderer.setViewport(halfWidth, 0, halfWidth, height);
        this.renderer.setScissor(halfWidth, 0, halfWidth, height);
        this.renderer.render(this.scene, this.stereoCamera.cameraR);

        // Restore normal viewport and disable scissor
        this.renderer.setScissorTest(false);
        this.renderer.setViewport(0, 0, width, height);
    }

    async enterWebXR() {
        if (!navigator.xr) {
            alert("WebXR is not supported on this browser or hardware.\n\nYou are viewing the full First-Person 6DoF simulation with VR motion controllers and Headset Dual-Lens view right now!");
            return;
        }

        const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!isSupported) {
            alert("No physical VR Headset detected via WebXR.\n\nYou can continue exploring using our desktop 6DoF First-Person and Dual-Lens Headset Simulator!");
            return;
        }

        try {
            const session = await navigator.xr.requestSession('immersive-vr');
            this.renderer.xr.setSession(session);
        } catch (err) {
            console.error("[VRViewer] WebXR session request failed:", err);
            alert("Failed to start WebXR session: " + err.message);
        }
    }
}

// Global class export
if (typeof module !== "undefined" && module.exports) {
    module.exports = VRViewer;
}
