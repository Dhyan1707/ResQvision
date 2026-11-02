// ==========================================
// AI FIRE EVACUATION SYSTEM
// DESKTOP APPLICATION
// RENDERER PROCESS
// ==========================================


// ==========================================
// GLOBAL STATE
// ==========================================

let currentMapData = null;
let threeDViewer = null;
let vrViewer = null;
let arViewer = null;
let victimAgent = null;
let pathfinder = null;

let currentAlertData = [];

let currentRouteData = null;

let blueprintProcessing = false;

let blueprintActive = false;

let currentBlueprintImage = null;

let lastMissingRoomWarning = null;

let lastMissingExitWarning = null;


// ==========================================
// FLOOR SELECTION & SWITCHING
// ==========================================

function selectFloor(floorLevel) {
    const level = Number(floorLevel);
    if (isNaN(level) || level < 0 || level > 7) {
        console.warn(`[FloorSwitch] Invalid floor level requested: ${floorLevel}`);
        return;
    }

    window.currentFloorLevel = level;
    console.log(`[FloorSwitch] Switching to floor level: ${level}`);

    const floorNames = [
        "Ground Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
        "Fifth Floor",
        "Sixth Floor",
        "Seventh Floor"
    ];
    const currentName = floorNames[level] || `Floor ${level}`;

    // Update 2D floor number label
    const floorLabel = document.getElementById("floorNumber");
    if (floorLabel) {
        floorLabel.textContent = currentName;
    }

    // Update active class / styling on all floor selector buttons
    document.querySelectorAll(".floor-btn").forEach(btn => {
        const btnLevel = Number(btn.dataset.floor);
        if (btnLevel === level) {
            btn.classList.add("active");
            btn.style.background = "#2563eb";
            btn.style.color = "#ffffff";
            btn.style.borderColor = "#60a5fa";
        } else {
            btn.classList.remove("active");
            btn.style.background = "#17243a";
            btn.style.color = "#94a3b8";
            btn.style.borderColor = "#334155";
        }
    });

    // Lookup matching floor from buildingData
    const bData = currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
    if (!bData || !Array.isArray(bData.floors)) {
        console.error("[FloorSwitch] No building data available with floors array");
        return;
    }

    const matchingFloor = bData.floors.find(f => Number(f.level) === level);
    if (!matchingFloor) {
        console.error(`[FloorSwitch] Floor level ${level} not found in buildingData.floors`);
        return;
    }

    console.log(`[FloorSwitch] Retrieved matching floor: ${matchingFloor.name} (level: ${matchingFloor.level})`);

    // Render floor in ThreeDViewer
    if (threeDViewer) {
        threeDViewer.buildFromData(bData, level);
    }

    // Sync 3D Dropdown & Stack Buttons if available
    const selectEl = document.getElementById("threeDFloorSelect");
    if (selectEl) selectEl.value = String(level);
    document.querySelectorAll(".stack-btn").forEach(btn => {
        if (Number(btn.dataset.floor) === level) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    const badge = document.getElementById("threeDViewBadge");
    if (badge) badge.textContent = `LIVE SIMULATION • ${currentName.toUpperCase()}`;
}
window.selectFloor = selectFloor;


function setupViewCompleteBuilding() {
    const btn = document.getElementById("viewCompleteBuildingButton");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (typeof window.switch3DFloor === 'function') {
            window.switch3DFloor('all');
        } else {
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (bData && typeof threeDViewer !== 'undefined' && threeDViewer) {
                threeDViewer.buildFromData(bData, null);
            }
        }
        
        // Switch to 3D Viewport Tab
        const nav3DTab = document.getElementById("nav3DTab");
        if (nav3DTab) nav3DTab.click();
    });
}

// ==========================================
// APP START
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Desktop application loaded."
        );

        updateLastUpdateTime();

        setupBlueprintUpload();
        setupViewCompleteBuilding();

        // Initial backend connection verification
        if (window.electronAPI && typeof window.electronAPI.checkBackendHealth === 'function') {
            window.electronAPI.checkBackendHealth().then(health => {
                const apiEl = document.getElementById("apiStatus");
                if (apiEl && health && health.connected) {
                    apiEl.textContent = "CONNECTED (PORT 5000)";
                    apiEl.style.color = "#10b981";
                }
            }).catch(() => {});
        }

        // Initialize 3D Viewer
        threeDViewer = new ThreeDViewer('threeDContainer');
        victimAgent = new VictimAgent(threeDViewer);
        window.victimAgent = victimAgent;

        // Initialize VR & AR Viewers
        try {
            if (typeof VRViewer !== "undefined") {
                vrViewer = new VRViewer('vrContainer');
                window.vrViewer = vrViewer;
            }
            if (typeof ARViewer !== "undefined") {
                arViewer = new ARViewer('arContainer');
                window.arViewer = arViewer;
            }
        } catch (err) {
            console.error('[Init] Error initializing VR/AR Viewers:', err);
        }

        threeDViewer.onFireClicked = (pos, floorIdx) => {
            threeDViewer.spawnFireAtPosition(pos, floorIdx);
            if (vrViewer) vrViewer.syncFires(threeDViewer.activeFires);
            if (arViewer) arViewer.syncFires(threeDViewer.activeFires);
            document.getElementById('routeMessage').textContent = 'Fire ignited and spreading.';

            // Trigger emergency fire alarm (siren, voice announcement & visual strobe)
            if (window.fireAlarmSystem) {
                window.fireAlarmSystem.triggerAlarm(floorIdx);
            }
        };
        threeDViewer.onFloorClicked = (position, nearestNodeId) => {
            victimAgent.spawnAtPosition(position, nearestNodeId);
            if (arViewer && victimAgent && victimAgent.victimMesh) {
                arViewer.syncVictim(victimAgent.victimMesh);
            }
            if (vrViewer && victimAgent && victimAgent.victimMesh) {
                vrViewer.syncVictim(victimAgent.victimMesh);
            }
            document.getElementById('routeStatus').textContent = 'Victim Placed. Ready for Evacuation.';
            document.getElementById('currentLocation').textContent = nearestNodeId;
        };
        const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (bData) {
            pathfinder = new M4Pathfinder(bData);
            window.pathfinder = pathfinder;
            // Pre-populate 3D Viewer with complete building model so it is ready immediately
            threeDViewer.buildFromData(bData, null);
        } else {
            console.warn('[Init] buildingData not available yet; pathfinder will be initialized after blueprint upload.');
        }

        window.currentFloorLevel = 0;

        // Wire floor selection buttons
        document.querySelectorAll(".floor-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const floorLevel = Number(e.currentTarget.dataset.floor);
                selectFloor(floorLevel);
            });
        });

        // Wire floor up / down controls
        document.getElementById("floorDown")?.addEventListener("click", () => {
            const current = typeof window.currentFloorLevel === "number" ? window.currentFloorLevel : 0;
            const target = Math.max(0, current - 1);
            selectFloor(target);
        });

        document.getElementById("floorUp")?.addEventListener("click", () => {
            const current = typeof window.currentFloorLevel === "number" ? window.currentFloorLevel : 0;
            const target = Math.min(7, current + 1);
            selectFloor(target);
        });

        // Initial floor render removed to wait for blueprint upload
        // selectFloor(window.currentFloorLevel);

        // Tab Navigation Switcher (2D Blueprint View vs Fullscreen 3D vs VR Walkthrough vs AR Tactical)
        const nav2DTab = document.getElementById("nav2DTab");
        const nav3DTab = document.getElementById("nav3DTab");
        const navVRTab = document.getElementById("navVRTab");
        const navARTab = document.getElementById("navARTab");
        const navHistoryTab = document.getElementById("navHistoryTab");
        const mainDashboard = document.getElementById("mainDashboard");
        const page3DView = document.getElementById("page3DView");
        const pageVRView = document.getElementById("pageVRView");
        const pageARView = document.getElementById("pageARView");
        const pageHistoryView = document.getElementById("pageHistoryView");

        const switchTab = (activeTab, activePage, isFlex = false) => {
            [mainDashboard, page3DView, pageVRView, pageARView, pageHistoryView].forEach(p => {
                if (p) p.setAttribute("style", "display: none !important;");
            });
            [nav2DTab, nav3DTab, navVRTab, navARTab, navHistoryTab].forEach(t => {
                if (t) {
                    t.classList.remove("active");
                    t.style.background = "#0f172a";
                    t.style.color = "#94a3b8";
                    t.style.borderColor = "#334155";
                }
            });

            if (activePage) {
                activePage.setAttribute("style", `display: ${isFlex ? "flex" : "grid"} !important;`);
            }
            if (activeTab) {
                activeTab.classList.add("active");
                activeTab.style.background = "#1e293b";
                activeTab.style.color = "#38bdf8";
                activeTab.style.borderColor = "#38bdf8";
                // Update mode label and description in footer status bar
                const modeLabel = document.getElementById('modeLabel');
                const systemStatusText = document.getElementById('systemStatusText');
                let modeText = '2D';
                let statusDesc = '2D Blueprint Ready';

                if (activeTab === nav3DTab) {
                    modeText = '3D';
                    statusDesc = '3D Simulation Ready';
                } else if (activeTab === navVRTab) {
                    modeText = 'VR';
                    statusDesc = 'VR Walkthrough Ready';
                } else if (activeTab === navARTab) {
                    modeText = 'AR';
                    statusDesc = 'AR Tactical Mode Ready';
                } else if (activeTab === navHistoryTab) {
                    modeText = 'History';
                    statusDesc = 'Drill History Ready';
                }

                if (modeLabel) modeLabel.textContent = modeText;
                if (systemStatusText) systemStatusText.textContent = statusDesc;
            }

            // Sync building data and hazards whenever switching to 3D, VR or AR
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (bData) {
                if (activePage === page3DView && threeDViewer) {
                    if (!threeDViewer.buildingGroup || threeDViewer.buildingGroup.children.length === 0) {
                        threeDViewer.buildFromData(bData, null);
                    }
                    setTimeout(() => {
                        threeDViewer.onWindowResize();
                        threeDViewer.frameBuilding();
                    }, 60);
                } else if (activePage === pageVRView && vrViewer) {
                    let targetFloor = typeof window.currentFloorLevel === 'number' ? window.currentFloorLevel : 0;
                    if (victimAgent && victimAgent.currentNodeId && pathfinder && pathfinder.nodes.has(victimAgent.currentNodeId)) {
                        targetFloor = pathfinder.nodes.get(victimAgent.currentNodeId).floorIndex;
                    }

                    const vrSelect = document.getElementById("vrFloorSelect");
                    if (vrSelect) vrSelect.value = String(targetFloor);

                    vrViewer.buildFromData(bData, targetFloor);
                    if (threeDViewer && threeDViewer.activeFires) {
                        vrViewer.syncFires(threeDViewer.activeFires);
                    }
                    
                    const activeRoute = window.lastCalculatedRoutePoints || (victimAgent && victimAgent.targetWaypoints && victimAgent.targetWaypoints.length >= 2 ? victimAgent.targetWaypoints : null);
                    if (typeof vrViewer.updateEvacuationRoute === 'function') {
                        vrViewer.updateEvacuationRoute(activeRoute);
                    }
                    if (victimAgent && victimAgent.victimMesh && typeof vrViewer.syncVictim === 'function') {
                        vrViewer.syncVictim(victimAgent.victimMesh);
                        vrViewer.teleportToVictim(victimAgent.victimMesh);
                    } else if (vrViewer.evacRoutePoints && vrViewer.evacRoutePoints.length >= 2) {
                        const startPt = vrViewer.evacRoutePoints[0];
                        const nextPt = vrViewer.evacRoutePoints[1];
                        vrViewer.cameraRig.position.set(startPt.x, (startPt.y || 0) + vrViewer.playerHeight, startPt.z);
                        const dx = nextPt.x - startPt.x;
                        const dz = nextPt.z - startPt.z;
                        vrViewer.yaw = Math.atan2(-dx, -dz);
                        vrViewer.cameraYaw.rotation.y = vrViewer.yaw;
                    }
                    setTimeout(() => { if (vrViewer) vrViewer.onWindowResize(); }, 60);
                } else if (activePage === pageARView && arViewer) {
                    arViewer.buildFromData(bData, null);
                    if (threeDViewer && threeDViewer.activeFires) {
                        arViewer.syncFires(threeDViewer.activeFires);
                    }
                    const activeRoute = window.lastCalculatedRoutePoints || (victimAgent && victimAgent.targetWaypoints && victimAgent.targetWaypoints.length >= 2 ? victimAgent.targetWaypoints : null);
                    if (activeRoute && typeof arViewer.updateEvacuationRoute === 'function') {
                        arViewer.updateEvacuationRoute(activeRoute);
                    }
                    if (victimAgent && victimAgent.victimMesh) {
                        arViewer.syncVictim(victimAgent.victimMesh);
                    }
                    setTimeout(() => { if (arViewer) arViewer.onWindowResize(); }, 60);
                }
            }

            setTimeout(() => { window.dispatchEvent(new Event("resize")); }, 100);
        };

        nav2DTab?.addEventListener("click", () => switchTab(nav2DTab, mainDashboard, false));
        nav3DTab?.addEventListener("click", () => switchTab(nav3DTab, page3DView, true));
        navVRTab?.addEventListener("click", () => switchTab(navVRTab, pageVRView, true));
        navARTab?.addEventListener("click", () => switchTab(navARTab, pageARView, true));
        navHistoryTab?.addEventListener("click", () => {
            switchTab(navHistoryTab, pageHistoryView, true);
            if (typeof window.renderHistoryUI === "function") window.renderHistoryUI();
        });

        // Wire VR controls
        document.getElementById("vrFloorSelect")?.addEventListener("change", (e) => {
            const floor = parseInt(e.target.value, 10);
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (vrViewer && bData) {
                vrViewer.buildFromData(bData, floor);
                if (threeDViewer && threeDViewer.activeFires) {
                    vrViewer.syncFires(threeDViewer.activeFires);
                }
                const activeRoute = window.lastCalculatedRoutePoints || (victimAgent && victimAgent.targetWaypoints && victimAgent.targetWaypoints.length >= 2 ? victimAgent.targetWaypoints : null);
                if (activeRoute && typeof vrViewer.updateEvacuationRoute === 'function') {
                    vrViewer.updateEvacuationRoute(activeRoute);
                }
                if (victimAgent && victimAgent.victimMesh && typeof vrViewer.syncVictim === 'function') {
                    vrViewer.syncVictim(victimAgent.victimMesh);
                }
            }
        });

        // Direct VR Mode Simulation Action Controls
        document.getElementById("btnVRToolbarStairUp")?.addEventListener("click", () => {
            if (window.vrViewer) window.vrViewer.transitionFloorViaStairs(1);
        });
        document.getElementById("btnVRToolbarStairDown")?.addEventListener("click", () => {
            if (window.vrViewer) window.vrViewer.transitionFloorViaStairs(-1);
        });

        document.getElementById("btnVRRunEvacuation")?.addEventListener("click", () => {
            if (typeof window.runR1Evacuation === 'function') {
                window.runR1Evacuation();
            }
        });

        document.getElementById("btnVRIgniteFire")?.addEventListener("click", () => {
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (!bData || !threeDViewer) return;
            const targetFloor = vrViewer ? vrViewer.currentFloorLevel : 0;
            let firePos = new THREE.Vector3(0, 0, 0);
            if (vrViewer) {
                const forward = new THREE.Vector3(0, 0, -6).applyAxisAngle(new THREE.Vector3(0, 1, 0), vrViewer.yaw);
                firePos.copy(vrViewer.cameraRig.position).add(forward);
            }
            threeDViewer.spawnFireAtPosition(firePos, targetFloor);
            if (vrViewer) vrViewer.syncFires(threeDViewer.activeFires);
            if (window.fireAlarmSystem) window.fireAlarmSystem.triggerAlarm(targetFloor);
        });

        document.getElementById("btnVRSpawnVictim")?.addEventListener("click", () => {
            if (!victimAgent || !threeDViewer) return;
            const targetFloor = vrViewer ? vrViewer.currentFloorLevel : 0;
            let spawnPos = new THREE.Vector3(0, 0, 0);
            let closestNodeId = null;
            let minDist = Infinity;
            
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (bData && bData.floors && bData.floors[targetFloor] && bData.floors[targetFloor].nodes) {
                const pPos = vrViewer ? vrViewer.cameraRig.position : new THREE.Vector3(0, 0, 0);
                bData.floors[targetFloor].nodes.forEach(n => {
                    const d = Math.hypot(n.x - pPos.x, n.z - pPos.z);
                    if (d < minDist) {
                        minDist = d;
                        closestNodeId = n.id;
                        spawnPos.set(n.x, 0, n.z);
                    }
                });
            }
            if (closestNodeId) {
                victimAgent.spawnAtPosition(spawnPos, closestNodeId);
                if (vrViewer && victimAgent.victimMesh) {
                    vrViewer.syncVictim(victimAgent.victimMesh);
                }
            }
        });

        document.getElementById("btnVRWalkRoute")?.addEventListener("click", () => {
            if (vrViewer) vrViewer.toggleRouteWalkthrough();
        });

        document.getElementById("btnVRTeleportVictim")?.addEventListener("click", () => {
            if (vrViewer && victimAgent && victimAgent.victimMesh) {
                vrViewer.teleportToVictim(victimAgent.victimMesh);
            } else {
                alert("Victim not spawned yet. Please spawn a victim first by clicking 'Spawn Victim' in 3D Simulation Viewport!");
            }
        });

        document.getElementById("btnVRTeleportExit")?.addEventListener("click", () => {
            if (vrViewer) vrViewer.teleportToExit();
        });

        document.getElementById("btnVRFlashlight")?.addEventListener("click", () => {
            if (vrViewer) vrViewer.toggleFlashlight();
        });

        document.getElementById("btnVRStereo")?.addEventListener("click", () => {
            const v = window.vrViewer || vrViewer;
            if (v && typeof v.toggleStereoMode === "function") v.toggleStereoMode();
        });

        document.getElementById("btnEnterWebXR")?.addEventListener("click", () => {
            if (vrViewer) vrViewer.enterWebXR();
        });

        // Wire AR controls
        document.getElementById("btnARModeTabletop")?.addEventListener("click", () => {
            if (arViewer) arViewer.setMode("tabletop");
        });

        document.getElementById("btnARModeVisor")?.addEventListener("click", () => {
            if (arViewer) arViewer.setMode("visor");
        });

        document.getElementById("btnARCameraSource")?.addEventListener("click", () => {
            if (arViewer) arViewer.toggleCameraSource();
        });

        document.getElementById("arFloorSelect")?.addEventListener("change", (e) => {
            const val = e.target.value;
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (arViewer && bData) {
                const targetFloor = (val === 'all') ? null : parseInt(val, 10);
                arViewer.buildFromData(bData, targetFloor);
                if (threeDViewer && threeDViewer.activeFires) {
                    arViewer.syncFires(threeDViewer.activeFires);
                }
                if (window.lastCalculatedRoutePoints) {
                    arViewer.updateEvacuationRoute(window.lastCalculatedRoutePoints);
                }
            }
        });

        document.getElementById("arScaleSlider")?.addEventListener("input", (e) => {
            if (arViewer) arViewer.setScale(e.target.value);
        });

        document.getElementById("btnARAutoRotate")?.addEventListener("click", () => {
            if (arViewer) arViewer.toggleAutoRotate();
        });

        document.getElementById("btnARThermal")?.addEventListener("click", () => {
            if (arViewer) arViewer.toggleThermalVision();
        });

        document.getElementById("btnEnterWebXRAR")?.addEventListener("click", () => {
            if (arViewer) arViewer.enterWebXRAR();
        });

        // Global simulation agent
        let victimInstance = null;

        // Button Listeners (Legacy 5th Floor Demo Paused)
        document.getElementById("btnIgniteFire")?.addEventListener("click", () => {
            if (window.fireAlarmSystem) {
                window.fireAlarmSystem.initAudio();
            }
            if (threeDViewer) {
                threeDViewer.firePlacementMode = true;
                threeDViewer.victimPlacementMode = false;
                threeDViewer.renderer.domElement.style.cursor = 'crosshair';
                document.getElementById('routeStatus').textContent = 'Click on a floor to ignite fire.';
                document.getElementById('routeMessage').textContent = 'Awaiting fire placement...';
            }
        });

        document.getElementById("btnSpawnVictim")?.addEventListener("click", () => {
            if (threeDViewer) {
                threeDViewer.victimPlacementMode = true;
                threeDViewer.firePlacementMode = false;
                threeDViewer.renderer.domElement.style.cursor = 'crosshair';
                document.getElementById('routeStatus').textContent = 'Click on a floor to place victim.';
                document.getElementById('routeMessage').textContent = 'Awaiting placement...';
            }
        });

        function switch3DFloor(floorValue) {
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (!bData) return;

            const isDescent = (typeof floorValue === 'string' && floorValue.startsWith('descent'));
            const isAll = (floorValue === 'all' || floorValue === null || floorValue === undefined || floorValue === '');
            const targetFloor = isDescent ? floorValue : (isAll ? null : Number(floorValue));
            
            // Build in ThreeDViewer
            if (threeDViewer) {
                threeDViewer.buildFromData(bData, targetFloor);
            }

            // Sync Dropdown
            const selectEl = document.getElementById("threeDFloorSelect");
            if (selectEl) {
                selectEl.value = isDescent ? 'all' : (isAll ? 'all' : String(targetFloor));
            }

            // Sync Floating Stack Elevator Buttons
            document.querySelectorAll(".stack-btn").forEach(btn => {
                const btnVal = btn.dataset.floor;
                if ((isAll && btnVal === 'all') || (!isAll && !isDescent && Number(btnVal) === targetFloor)) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });

            // Update Badge
            const badge = document.getElementById("threeDViewBadge");
            if (badge) {
                if (isDescent) {
                    const fromF = floorValue.split('-')[1] || '5';
                    badge.textContent = `STAIRWAY EVACUATION • FLOORS ${fromF} ➔ GROUND EXIT VISIBLE`;
                } else if (isAll) {
                    badge.textContent = "LIVE SIMULATION • ALL FLOORS (FULL BUILDING)";
                } else {
                    const floorNames = [
                        "GROUND FLOOR", "1ST FLOOR", "2ND FLOOR", "3RD FLOOR",
                        "4TH FLOOR", "5TH FLOOR", "6TH FLOOR", "7TH FLOOR"
                    ];
                    badge.textContent = `LIVE SIMULATION • ${floorNames[targetFloor] || ('FLOOR ' + targetFloor)}`;
                }
            }

            if (!isAll && !isDescent) {
                window.currentFloorLevel = targetFloor;
            }
        }
        window.switch3DFloor = switch3DFloor;

        // Wire 3D floor dropdown
        document.getElementById("threeDFloorSelect")?.addEventListener("change", (e) => {
            switch3DFloor(e.target.value);
        });

        // Wire floating stack buttons
        document.querySelectorAll(".stack-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const fVal = e.currentTarget.dataset.floor;
                switch3DFloor(fVal);
            });
        });

        document.getElementById("btnFocusBuilding")?.addEventListener("click", () => {
            if (threeDViewer) {
                threeDViewer.frameBuilding(threeDViewer.targetFloorLevel);
                threeDViewer.onWindowResize();
            }
        });

        window.runR1Evacuation = async () => {
            if (!victimAgent || !victimAgent.victimMesh || victimAgent.status !== 'IDLE') {
                document.getElementById('routeMessage').textContent = 'Spawn a victim first, then start evacuation.';
                alert('Please spawn a victim first by clicking \"Spawn Victim\" then clicking on the 3D building.');
                return;
            }
            // Re-instantiate pathfinder to ensure fresh graph state
            const bData = currentMapData || window.currentMapData || window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (!bData) {
                alert('No building data available. Please upload a blueprint first.');
                return;
            }
            pathfinder = new M4Pathfinder(bData);
            window.pathfinder = pathfinder;


            // Map actual current position to closest accessible graph node before starting
            let resolvedStartNodeId = victimAgent ? victimAgent.currentNodeId : null;
            if (victimAgent && victimAgent.victimMesh && pathfinder) {
                let startFloorIdx = pathfinder.nodes.has(victimAgent.currentNodeId) ? 
                                    pathfinder.nodes.get(victimAgent.currentNodeId).floorIndex : 0;
                let minDist = Infinity;
                
                pathfinder.nodes.forEach(node => {
                    if (node.floorIndex === startFloorIdx) {
                        const dx = node.x - victimAgent.victimMesh.position.x;
                        const dz = node.z - victimAgent.victimMesh.position.z;
                        const dist = Math.sqrt(dx*dx + dz*dz);
                        
                        let accessible = true;
                        const checkSteps = Math.max(2, Math.ceil(dist / 2.0));
                        // Start checking from s=1 to avoid failing if the victim's exact physical position is inside a hazard
                        for (let s = 1; s <= checkSteps; s++) {
                            const t = s / checkSteps;
                            const samplePos = {
                                x: victimAgent.victimMesh.position.x + dx * t,
                                z: victimAgent.victimMesh.position.z + dz * t,
                                floorIndex: startFloorIdx
                            };
                            if (typeof threeDViewer !== 'undefined' && threeDViewer) {
                                const hazard = threeDViewer.getHazardStatus(samplePos, startFloorIdx);
                                if (hazard.hazardLevel === 'CRITICAL' || hazard.hazardLevel === 'HIGH') {
                                    accessible = false;
                                    break;
                                }
                            }
                        }

                        if (accessible && dist < minDist) {
                            minDist = dist;
                            resolvedStartNodeId = node.id;
                        }
                    }
                });
                
                if (victimAgent.currentNodeId !== resolvedStartNodeId) {
                    victimAgent.currentNodeId = resolvedStartNodeId;
                }
            }

            const startNodeId = victimAgent ? victimAgent.currentNodeId : null;
            
            if (victimAgent && victimAgent.victimMesh) {
                console.log('M9 START: victim at x=' + victimAgent.victimMesh.position.x.toFixed(2) + ' z=' + victimAgent.victimMesh.position.z.toFixed(2) + ' startNode=' + startNodeId);
            }

            if (!startNodeId) {
                alert('Victim is not properly placed on a valid node.');
                return;
            }
            
            document.getElementById('routeStatus').textContent = 'Calculating Safest Route...';
            document.getElementById('routeMessage').textContent = 'M9: Evaluating hazard safety...';
            
            const allNodes = pathfinder.getAllNodes();
            const startNode = pathfinder.nodes.get(startNodeId);
            
            // Primary evacuation destinations are the Ground Floor exterior exits.
            // When starting on any floor (including Floor 7), the victim safely evacuates all the way down to Ground Floor.
            let globalExits = [
                'G_ENTRANCE',
                'G_EAST_EXIT',
                'G_STAIRS_NODE_S',
                'G_STAIRS_NODE_N'
            ];
            
            // Also include any other nodes on Ground Floor explicitly typed as exit
            if (pathfinder) {
                pathfinder.nodes.forEach(n => {
                    if (n.floorIndex === 0 && (n.type === 'exit' || (n.id && n.id.includes('EXIT')))) {
                        if (!globalExits.includes(n.id)) globalExits.push(n.id);
                    }
                });
            }
            
            const exitNodes = allNodes.filter(n => globalExits.includes(n.id));
            let bestResult = null;
            
            const hazardPenalties = {
                'SAFE': 0,
                'MODERATE': 25,
                'HIGH': 500,
                'CRITICAL': 10000
            };
            
            // M9: Evaluate candidate safe routes to reachable exits
            let candidateResults = [];
            const hazardLevels = ['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'];

            for (let exit of exitNodes) {
                console.log(`\nDestination:\n${exit.id}\nexists: ${pathfinder.nodes.has(exit.id)}\nposition: x=${exit.x}, z=${exit.z}`);
                const result = await pathfinder.findSafestPathM9(startNodeId, exit.id, threeDViewer);
                
                let isReachable = result.success;
                let mlHazardCost = 0;
                let detHazardCost = 0;
                let physicalDistance = 0;
                let maxHazardEncountered = 'SAFE';
                let isUnsafe = false;
                let totalSafetyCost = 0;
                
                if (isReachable) {
                    for (let i = 0; i < result.path.length; i++) {
                        const nodeId = result.path[i];
                        const node = pathfinder.nodes.get(nodeId);
                        if (!node) continue;
                        
                        // Deterministic Hazard (M6)
                        const m6Hazard = threeDViewer.getHazardStatus(node, node.floorIndex);
                        const m6Level = m6Hazard.hazardLevel;
                        detHazardCost += hazardPenalties[m6Level] || 0;
                        
                        if (hazardLevels.indexOf(m6Level) > hazardLevels.indexOf(maxHazardEncountered)) {
                            maxHazardEncountered = m6Level;
                        }
                        // Skip blocking if it's the start node to allow escaping
                        if (i > 0 && (m6Level === 'CRITICAL')) {
                            isUnsafe = true;
                        }
                        
                        // ML Hazard Prediction (M8)
                        if (threeDViewer.activeFires && threeDViewer.activeFires.length > 0) {
                            try {
                                const mlRes = await threeDViewer.predictHazardStatusML(node, node.floorIndex);
                                if (mlRes && mlRes.hazardLevel) {
                                    const mlLevel = mlRes.hazardLevel;
                                    mlHazardCost += hazardPenalties[mlLevel] || 0;
                                    
                                    if (hazardLevels.indexOf(mlLevel) > hazardLevels.indexOf(maxHazardEncountered)) {
                                        maxHazardEncountered = mlLevel;
                                    }
                                    if (i > 0 && (mlLevel === 'CRITICAL')) {
                                        isUnsafe = true;
                                    }
                                }
                            } catch (e) {
                                console.warn("ML Prediction failed for node", nodeId, e);
                            }
                        }

                        // Physical distance calculation and segment hazard check
                        if (i < result.path.length - 1) {
                            const nextNode = pathfinder.nodes.get(result.path[i+1]);
                            if (nextNode) {
                                const dist = pathfinder._getDistance(node, nextNode);
                                physicalDistance += dist;
                                
                                // Sample segment points
                                const steps = Math.max(2, Math.ceil(dist / 2.0));
                                let maxSegLevel = 'SAFE';
                                
                                // Start from step=1 to allow escaping if the exact start node is inside a hazard
                                for (let step = 1; step <= steps; step++) {
                                    const t = step / steps;
                                    const samplePos = {
                                        x: node.x + (nextNode.x - node.x) * t,
                                        z: node.z + (nextNode.z - node.z) * t,
                                        floorIndex: node.floorIndex
                                    };
                                    const segHazard = threeDViewer.getHazardStatus(samplePos, samplePos.floorIndex);
                                    const segLevel = segHazard.hazardLevel;
                                    
                                    if (hazardLevels.indexOf(segLevel) > hazardLevels.indexOf(maxSegLevel)) {
                                        maxSegLevel = segLevel;
                                    }
                                }
                                
                                detHazardCost += hazardPenalties[maxSegLevel] || 0;
                                
                                if (hazardLevels.indexOf(maxSegLevel) > hazardLevels.indexOf(maxHazardEncountered)) {
                                    maxHazardEncountered = maxSegLevel;
                                }
                                if (maxSegLevel === 'CRITICAL') {
                                    isUnsafe = true;
                                }
                            }
                        }
                    }
                    
                    totalSafetyCost = physicalDistance + detHazardCost + mlHazardCost;
                }
                
                console.log(`Candidate Route to ${exit.id}\n- reachable: ${isReachable}\n- distance: ${physicalDistance.toFixed(2)}\n- deterministic hazard cost: ${detHazardCost}\n- ML hazard cost: ${mlHazardCost}\n- max hazard: ${maxHazardEncountered}\n- unsafe/blocked: ${isUnsafe}\n- A* route:\n  ${result.path ? result.path.join(' -> ') : 'None'}\n- final M9 decision cost: ${totalSafetyCost.toFixed(2)}`);

                if (isReachable) {
                    if (isUnsafe) {
                        console.log(`M9 Candidate Rejected: ${exit.id}\nReason: Route enters critical/blocked hazard region.`);
                    }
                    candidateResults.push({
                        ...result,
                        cost: physicalDistance,
                        totalCost: totalSafetyCost,
                        detHazardCost,
                        mlHazardCost,
                        targetExit: exit.id,
                        isUnsafe,
                        maxHazardEncountered
                    });
                }
            }
            
            bestResult = null;
            const safeCandidates = candidateResults.filter(c => !c.isUnsafe);
            
            if (safeCandidates.length > 0) {
                bestResult = safeCandidates.reduce((prev, curr) => {
                    const prevHazard = prev.detHazardCost + prev.mlHazardCost;
                    const currHazard = curr.detHazardCost + curr.mlHazardCost;
                    
                    if (prevHazard !== currHazard) {
                        return (prevHazard < currHazard) ? prev : curr;
                    }
                    // Tie-breaker: physical distance
                    return (prev.cost < curr.cost) ? prev : curr;
                });
            } else if (candidateResults.length > 0) {
                // Emergency fallback: If all candidates have some hazard, pick the least hazardous viable route
                bestResult = candidateResults.reduce((prev, curr) => {
                    return (prev.totalCost < curr.totalCost) ? prev : curr;
                });
                console.warn("⚠️ Selected least hazardous emergency evacuation route.");
            }
            
            if (bestResult) {
                console.log(`M9 Safest Route Selected
Destination: ${bestResult.targetExit}
Distance: ${bestResult.cost.toFixed(2)}
Hazard Cost: ${bestResult.detHazardCost + bestResult.mlHazardCost}
Route:
${bestResult.path.join('\n-> ')}
`);

                // Generate movement plan for logs
                let movementStr = "Victim Movement:\n";
                for (let i = 0; i < bestResult.path.length - 1; i++) {
                    movementStr += `${bestResult.path[i]} -> ${bestResult.path[i+1]}\n`;
                }
                console.log(movementStr);
                
                // Draw route in 3D viewport
                threeDViewer.drawRoute(bestResult.path);
                window.lastCalculatedRouteNodeIds = [...bestResult.path];

                // Extract 3D points for VR/AR synchronization
                const routePoints3D = [];
                bestResult.path.forEach(id => {
                    const mesh = threeDViewer.nodeMeshMap.get(id);
                    if (mesh) {
                        const wp = new THREE.Vector3();
                        mesh.getWorldPosition(wp);
                        routePoints3D.push(wp.clone());
                    } else if (pathfinder && pathfinder.nodes.has(id)) {
                        const n = pathfinder.nodes.get(id);
                        const y = (n.globalY !== undefined ? n.globalY : 0) + 1.0;
                        routePoints3D.push(new THREE.Vector3(n.x, y, n.z));
                    }
                });
                window.lastCalculatedRoutePoints = routePoints3D;
                if (vrViewer && typeof vrViewer.updateEvacuationRoute === 'function') {
                    vrViewer.updateEvacuationRoute(routePoints3D);
                }
                if (arViewer && typeof arViewer.updateEvacuationRoute === 'function') {
                    arViewer.updateEvacuationRoute(routePoints3D);
                }
                
                // Move victim
                victimAgent.setPath(bestResult.path);
                victimAgent.status = 'EVACUATING';
                
                document.getElementById('routeStatus').textContent = 'Evacuating to Ground Exit...';
                document.getElementById('nearestExit').textContent = bestResult.targetExit;
                document.getElementById('routeDistance').textContent = bestResult.totalCost.toFixed(2) + ' cost (Safest)';
                document.getElementById('routeMessage').textContent = `Evacuating via safest route to ${bestResult.targetExit}.`;

                // Persist simulation run report to Node.js / Supabase Backend
                if (window.electronAPI && typeof window.electronAPI.saveSimulationReport === 'function') {
                    window.electronAPI.saveSimulationReport({
                        blueprint_id: window.currentBlueprintId || '00000000-0000-0000-0000-000000000001',
                        algorithm_used: 'M4-A*-SafestPath',
                        evacuation_time: parseFloat((bestResult.totalCost * 0.45).toFixed(2)) || 25.0,
                        total_distance: parseFloat(bestResult.totalCost.toFixed(2)) || 50.0,
                        visited_nodes: (bestResult.path && bestResult.path.length) || 1,
                        benchmark_json: {
                            targetExit: bestResult.targetExit,
                            totalCost: bestResult.totalCost,
                            floorLevel: window.currentFloorLevel || 0,
                            timestamp: new Date().toISOString()
                        }
                    }).then(res => {
                        console.log('[Backend Sync] Simulation report recorded to backend:', res);
                    }).catch(err => {
                        console.warn('[Backend Sync] Could not record report to backend:', err);
                    });
                }
                
            } else {
                victimAgent.status = 'NO_ROUTE';
                document.getElementById('routeStatus').textContent = 'NO ROUTE';
                document.getElementById('routeMessage').textContent = 'No safe evacuation route available. Victim is trapped.';
                alert('No evacuation route available.');
            }
        };

        document.getElementById("btnRunEvacuation")?.addEventListener("click", window.runR1Evacuation);

        window.resetSimulation = () => {
            if (threeDViewer && typeof threeDViewer.clearFires === 'function') {
                threeDViewer.clearFires();
            }
            if (threeDViewer && typeof threeDViewer.clearRoute === 'function') {
                threeDViewer.clearRoute();
            }
            if (victimAgent && typeof victimAgent.reset === 'function') {
                victimAgent.reset();
            }
            if (vrViewer && typeof vrViewer.stopRouteWalkthrough === 'function') {
                vrViewer.stopRouteWalkthrough();
            }

            // Reset UI Status Cards
            const routeStatusEl = document.getElementById('routeStatus');
            if (routeStatusEl) routeStatusEl.textContent = 'Simulation Reset • Ready';
            const routeMessageEl = document.getElementById('routeMessage');
            if (routeMessageEl) routeMessageEl.textContent = 'All fires extinguished and victim reset. Click Ignite Fire or Spawn Victim to begin.';
            const locEl = document.getElementById('currentLocation');
            if (locEl) locEl.textContent = '--';
            const distEl = document.getElementById('routeDistance');
            if (distEl) distEl.textContent = '--';
            const timeEl = document.getElementById('routeTime');
            if (timeEl) timeEl.textContent = '--';
            const nearestExitEl = document.getElementById('nearestExit');
            if (nearestExitEl) nearestExitEl.textContent = '--';

            if (threeDViewer) {
                threeDViewer.firePlacementMode = false;
                threeDViewer.victimPlacementMode = false;
                threeDViewer.renderer.domElement.style.cursor = 'default';
            }
        };

        document.getElementById("btnResetSimulation")?.addEventListener("click", window.resetSimulation);

        const simSpeedSelect = document.getElementById("simSpeedSelect");
        if (simSpeedSelect) {
            simSpeedSelect.addEventListener("change", (e) => {
                const val = parseFloat(e.target.value) || 1.0;
                if (victimAgent) {
                    victimAgent.speedMultiplier = val;
                    victimAgent.lastUiUpdate = 0;
                }
                if (window.victimAgent) {
                    window.victimAgent.speedMultiplier = val;
                    window.victimAgent.lastUiUpdate = 0;
                }
                if (vrViewer) {
                    vrViewer.routeWalkSpeed = 14.0 * val;
                }
                console.log('⏱ [Pace Multiplier] Updated evacuation pace to:', val + 'x');
            });
        }

        startPolling();

    }
);


// ==========================================
// RESET DASHBOARD
// ==========================================

function resetDashboardToEmptyState() {

    currentMapData = null;

    currentAlertData = [];

    currentRouteData = null;

    blueprintActive = false;

    blueprintProcessing = false;

    currentBlueprintImage = null;

    lastMissingRoomWarning = null;

    lastMissingExitWarning = null;


    // ------------------------------
    // MAP
    // ------------------------------

    const mapContainer =
        document.getElementById(
            "mapContainer"
        );


    if (mapContainer) {

        mapContainer.innerHTML = `

            <div class="map-placeholder">

                <div class="map-icon">
                    🗺
                </div>

                <h3>
                    BUILDING MAP
                </h3>

                <p>
                    Upload a blueprint to begin
                </p>

                <p class="map-info">
                    Fire location • Exits •
                    Evacuation route
                </p>

            </div>

        `;

    }
    
    // Keep 3D viewer visible as default section
    const threeDContainer = document.getElementById("threeDContainer");
    if (threeDContainer) {
        threeDContainer.style.display = 'block';
    }
    if (mapContainer) {
        mapContainer.style.display = 'none';
    }


    // ------------------------------
    // FLOOR NUMBER
    // ------------------------------

    const floorNumber =
        document.getElementById(
            "floorNumber"
        );


    if (floorNumber) {

        floorNumber.textContent =
            "No Floor";

    }


    // ------------------------------
    // ALERTS
    // ------------------------------

    displayAlerts([]);


    // ------------------------------
    // ROUTE
    // ------------------------------

    displayWaitingForRoute(
        "Upload a blueprint to begin evacuation analysis."
    );


    // ------------------------------
    // STATUS
    // ------------------------------

    setSystemStatus(
        "SYSTEM ONLINE"
    );

    setApiStatus(
        "Waiting for blueprint"
    );

    updateAlertCount(0);

}


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboardData() {

    // IMPORTANT:
    // Do not request or display default map data
    // when no blueprint has been uploaded.

    if (!blueprintActive) {

        resetDashboardToEmptyState();

        return;

    }


    try {

        console.log(
            "Loading dashboard data for uploaded blueprint..."
        );


        // ======================================
        // ALERTS
        // ======================================

        const alertResponse =
            await window.electronAPI.getAlerts();


        console.log(
            "Alerts received:",
            alertResponse
        );


        if (
            alertResponse &&
            alertResponse.success
        ) {

            currentAlertData =
                alertResponse.alerts || [];


            displayAlerts(
                currentAlertData
            );


            updateAlertCount(
                currentAlertData.length
            );

        }


        // ======================================
        // ROUTE
        // ======================================

        const routeLocation =
            getValidRouteLocation();


        if (routeLocation) {

            const routeResponse =
                await window.electronAPI
                    .getEvacuationRoute(
                        routeLocation
                    );


            console.log(
                "Route received:",
                routeResponse
            );


            if (
                routeResponse &&
                routeResponse.success
            ) {

                currentRouteData =
                    routeResponse.route;


                if (
                    routeMatchesCurrentBuilding(
                        currentRouteData
                    )
                ) {

                    displayRoute(
                        currentRouteData
                    );

                } else {

                    displayWaitingForRoute();

                }

            }

        } else {

            displayWaitingForRoute();

        }


        setSystemStatus(
            "SYSTEM ONLINE"
        );


        setApiStatus(
            blueprintProcessing
                ? "Blueprint processor running..."
                : "Blueprint Active"
        );


    } catch (error) {

        console.error(
            "Failed to load dashboard data:",
            error
        );


        setSystemStatus(
            "SYSTEM OFFLINE"
        );


        setApiStatus(
            "Connection Failed"
        );

    }

}


// ==========================================
// GET VALID ROUTE LOCATION
// ==========================================

function getValidRouteLocation() {

    // NEVER use ROOM-101 as a fallback.

    if (!blueprintActive) {

        return null;

    }


    return getFirstBuildingRoomId();

}


// ==========================================
// GET FIRST ROOM FROM BUILDING
// ==========================================

function getFirstBuildingRoomId() {

    if (
        !currentMapData ||
        !Array.isArray(
            currentMapData.floors
        )
    ) {

        return null;

    }


    for (
        const floor of currentMapData.floors
    ) {

        if (
            floor &&
            Array.isArray(floor.rooms) &&
            floor.rooms.length > 0
        ) {

            const room =
                floor.rooms.find(
                    item =>
                        item &&
                        item.id
                );


            if (room) {

                return room.id;

            }

        }

    }


    return null;

}


// ==========================================
// CHECK ROUTE AGAINST CURRENT BUILDING
// ==========================================

function routeMatchesCurrentBuilding(route) {

    if (!route) {

        return false;

    }


    if (!currentMapData) {

        return false;

    }


    if (!route.locationId) {

        return false;

    }


    const room =
        findRoomById(
            route.locationId
        );


    return !!room;

}


// ==========================================
// FIND ROOM
// ==========================================

function findRoomById(roomId) {

    if (
        !currentMapData ||
        !Array.isArray(
            currentMapData.floors
        )
    ) {

        return null;

    }


    for (
        const floor of currentMapData.floors
    ) {

        if (
            !floor ||
            !Array.isArray(
                floor.rooms
            )
        ) {

            continue;

        }


        const room =
            floor.rooms.find(
                item =>
                    item &&
                    String(item.id)
                        .toLowerCase() ===
                    String(roomId)
                        .toLowerCase()
            );


        if (room) {

            return room;

        }

    }


    return null;

}


// ==========================================
// DISPLAY ALERTS
// ==========================================

function displayAlerts(alerts) {

    const container =
        document.getElementById(
            "alertsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !alerts ||
        alerts.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    No active alerts
                </p>

                <span>
                    Waiting for hazard information...
                </span>

            </div>

        `;

        return;

    }


    alerts.forEach(
        alert => {

            if (!alert) {

                return;

            }


            const alertElement =
                document.createElement(
                    "div"
                );


            alertElement.className =
                "alert-card";


            alertElement.innerHTML = `

                <div class="alert-card-header">

                    <strong>
                        🚨 ${alert.type || "HAZARD"}
                    </strong>

                    <span class="alert-severity">
                        ${alert.severity || "UNKNOWN"}
                    </span>

                </div>

                <div class="alert-message">
                    ${alert.message || "Hazard detected."}
                </div>

                <div class="alert-location">
                    Location:
                    ${alert.locationId || "Unknown"}
                </div>

                <div class="alert-floor">
                    Floor:
                    ${alert.floor || "Unknown"}
                </div>

            `;


            container.appendChild(
                alertElement
            );

        }
    );

}


// ==========================================
// DISPLAY MAP DATA
// ==========================================

function displayMapData(map) {

    const mapContainer =
        document.getElementById(
            "mapContainer"
        );


    if (!mapContainer) {

        return;

    }


    // ======================================
    // NO BUILDING
    // ======================================

    if (
        !map ||
        !Array.isArray(map.floors) ||
        map.floors.length === 0
    ) {

        displayNoBuildingMap();

        return;

    }


    // ======================================
    // BLUEPRINT ACTIVE
    // ======================================

    if (
        blueprintActive &&
        currentBlueprintImage
    ) {

        displayBlueprintWithBuilding(
            currentBlueprintImage,
            map
        );

        return;

    }


    // ======================================
    // NORMAL MAP
    // ======================================

    renderFloorMap(
        mapContainer,
        map
    );

}


// ==========================================
// DISPLAY NO BUILDING
// ==========================================

function displayNoBuildingMap() {

    const mapContainer =
        document.getElementById(
            "mapContainer"
        );


    if (!mapContainer) {

        return;

    }


    mapContainer.innerHTML = `

        <div class="map-placeholder">

            <div class="map-icon">
                🗺
            </div>

            <h3>
                BUILDING MAP
            </h3>

            <p>
                Upload a blueprint to begin
            </p>

            <p class="map-info">
                Fire location • Exits •
                Evacuation route
            </p>

        </div>

    `;


    const floorNumber =
        document.getElementById(
            "floorNumber"
        );


    if (floorNumber) {

        floorNumber.textContent =
            "No Floor";

    }

}


// ==========================================
// RENDER NORMAL FLOOR MAP
// ==========================================

function renderFloorMap(
    mapContainer,
    map
) {

    if (
        !map ||
        !Array.isArray(map.floors) ||
        map.floors.length === 0
    ) {

        displayNoBuildingMap();

        return;

    }


    mapContainer.innerHTML = "";

    mapContainer.style.position =
        "relative";


    const currentLevel = typeof window.currentFloorLevel === "number" ? window.currentFloorLevel : 0;
    const floor =
        (map.floors || []).find(f => Number(f.level) === currentLevel) || map.floors[0];


    if (!floor) {

        displayNoBuildingMap();

        return;

    }


    const floorNumber =
        document.getElementById(
            "floorNumber"
        );


    if (floorNumber) {

        floorNumber.textContent =
            floor.name || (floor.level === 0 ? "Ground Floor" : `Floor ${floor.level !== undefined ? floor.level : 1}`);

    }


    const floorMap =
        createFloorMapElement(
            map,
            floor
        );


    mapContainer.appendChild(
        floorMap
    );


    applyFireAlertToMap(
        currentAlertData
    );


    if (
        currentRouteData &&
        routeMatchesCurrentBuilding(
            currentRouteData
        )
    ) {

        updateMapRoute(
            currentRouteData
        );

    }

}


// ==========================================
// CREATE FLOOR MAP ELEMENT
// ==========================================

function createFloorMapElement(
    map,
    floor
) {

    const floorMap =
        document.createElement(
            "div"
        );


    floorMap.className =
        "floor-map";


    floorMap.style.position =
        "relative";


    floorMap.style.width =
        "100%";


    floorMap.style.height =
        "100%";


    // ======================================
    // TITLE
    // ======================================

    const title =
        document.createElement(
            "div"
        );


    title.className =
        "map-floor-title";


    title.textContent =
        `${map.buildingName || "Building"} — Floor ${floor.floorNumber || 1}`;


    floorMap.appendChild(
        title
    );


    // ======================================
    // ROOMS
    // ======================================

    const rooms =
        Array.isArray(floor.rooms)
            ? floor.rooms
            : [];


    rooms.forEach(
        room => {

            if (
                !room ||
                !room.id
            ) {

                return;

            }


            const roomElement =
                createRoomElement(
                    room
                );


            floorMap.appendChild(
                roomElement
            );

        }
    );


    // ======================================
    // CORRIDORS
    // ======================================

    const corridors =
        Array.isArray(
            floor.corridors
        )
            ? floor.corridors
            : [];


    corridors.forEach(
        corridor => {

            if (
                !corridor ||
                !corridor.id
            ) {

                return;

            }


            const corridorElement =
                document.createElement(
                    "div"
                );


            corridorElement.className =
                "map-corridor";


            corridorElement.dataset.corridorId =
                corridor.id;


            corridorElement.textContent =
                corridor.name ||
                corridor.id;


            if (corridor.position) {

                corridorElement.style.left =
                    `${corridor.position.x}%`;

                corridorElement.style.top =
                    `${corridor.position.y}%`;

            }


            if (corridor.size) {

                corridorElement.style.width =
                    `${corridor.size.width}%`;

                corridorElement.style.height =
                    `${corridor.size.height}%`;

            }


            floorMap.appendChild(
                corridorElement
            );

        }
    );


    // ======================================
    // EXITS
    // ======================================

    const exits =
        Array.isArray(floor.exits)
            ? floor.exits
            : [];


    exits.forEach(
        exit => {

            if (
                !exit ||
                !exit.id
            ) {

                return;

            }


            const exitElement =
                createExitElement(
                    exit
                );


            floorMap.appendChild(
                exitElement
            );

        }
    );


    // ======================================
    // STATIC FIRES
    // ======================================

    const fireLocations =
        Array.isArray(floor.fires)
            ? floor.fires
            : [];


    fireLocations.forEach(
        fire => {

            createFireIndicator(
                floorMap,
                fire
            );

        }
    );


    // ======================================
    // ROUTE
    // ======================================

    const routeElement =
        document.createElement(
            "div"
        );


    routeElement.id =
        "evacuationRoute";


    routeElement.className =
        "evacuation-route";


    floorMap.appendChild(
        routeElement
    );


    return floorMap;

}


// ==========================================
// CREATE ROOM
// ==========================================

function createRoomElement(room) {

    const roomElement =
        document.createElement(
            "div"
        );


    roomElement.className =
        "map-room";


    roomElement.dataset.roomId =
        room.id;


    roomElement.style.position =
        "absolute";


    roomElement.style.boxSizing =
        "border-box";


    roomElement.style.border =
        "2px solid rgba(148,163,184,0.7)";


    roomElement.style.background =
        "rgba(15,23,42,0.72)";


    roomElement.style.display =
        "flex";


    roomElement.style.alignItems =
        "center";


    roomElement.style.justifyContent =
        "center";


    roomElement.style.color =
        "#ffffff";


    roomElement.style.fontWeight =
        "600";


    roomElement.style.zIndex =
        "5";


    if (room.position) {

        roomElement.style.left =
            `${room.position.x}%`;

        roomElement.style.top =
            `${room.position.y}%`;

    }


    if (room.size) {

        roomElement.style.width =
            `${room.size.width}%`;

        roomElement.style.height =
            `${room.size.height}%`;

    }


    const roomName =
        document.createElement(
            "span"
        );


    roomName.textContent =
        room.name ||
        room.id;


    roomElement.appendChild(
        roomName
    );


    return roomElement;

}


// ==========================================
// CREATE EXIT
// ==========================================

function createExitElement(exit) {

    const exitElement =
        document.createElement(
            "div"
        );


    exitElement.className =
        "map-exit";


    exitElement.dataset.exitId =
        exit.id;


    exitElement.dataset.exitType =
        exit.type || "";


    exitElement.style.position =
        "absolute";


    exitElement.style.boxSizing =
        "border-box";


    exitElement.style.display =
        "flex";


    exitElement.style.flexDirection =
        "column";


    exitElement.style.alignItems =
        "center";


    exitElement.style.justifyContent =
        "center";


    exitElement.style.background =
        "#064e3b";


    exitElement.style.border =
        "2px solid #22c55e";


    exitElement.style.color =
        "#ffffff";


    exitElement.style.fontWeight =
        "600";


    exitElement.style.zIndex =
        "8";


    if (
        exit.type === "MAIN"
    ) {

        exitElement.classList.add(
            "main-exit"
        );

    }


    if (
        exit.type === "EMERGENCY"
    ) {

        exitElement.classList.add(
            "emergency-exit"
        );

    }


    if (exit.position) {

        exitElement.style.left =
            `${exit.position.x}%`;

        exitElement.style.top =
            `${exit.position.y}%`;

    }


    if (exit.size) {

        exitElement.style.width =
            `${exit.size.width}%`;

        exitElement.style.height =
            `${exit.size.height}%`;

    }


    exitElement.innerHTML = `

        <div>
            🚪
        </div>

        <span>
            ${exit.name || exit.id}
        </span>

    `;


    return exitElement;

}


// ==========================================
// CREATE FIRE INDICATOR
// ==========================================

function createFireIndicator(
    floorMap,
    fire
) {

    if (!fire) {

        return;

    }


    const fireElement =
        document.createElement(
            "div"
        );


    fireElement.className =
        "map-fire-indicator";


    fireElement.dataset.locationId =
        fire.locationId ||
        fire.roomId ||
        "";


    fireElement.textContent =
        "🔥 FIRE";


    fireElement.style.position =
        "absolute";


    fireElement.style.zIndex =
        "20";


    if (fire.position) {

        fireElement.style.left =
            `${fire.position.x}%`;

        fireElement.style.top =
            `${fire.position.y}%`;

    }


    const roomId =
        fire.locationId ||
        fire.roomId;


    if (roomId) {

        const room =
            floorMap.querySelector(
                `[data-room-id="${roomId}"]`
            );


        if (room) {

            fireElement.style.left =
                "50%";

            fireElement.style.top =
                "50%";

            fireElement.style.transform =
                "translate(-50%, -50%)";


            room.appendChild(
                fireElement
            );


            return;

        }

    }


    floorMap.appendChild(
        fireElement
    );

}


// ==========================================
// DISPLAY BLUEPRINT + BUILDING
// ==========================================

function displayBlueprintWithBuilding(
    imageData,
    building
) {

    const mapContainer =
        document.getElementById(
            "mapContainer"
        );


    if (
        !mapContainer ||
        !imageData
    ) {

        return;

    }


    mapContainer.innerHTML = "";

    mapContainer.style.position =
        "relative";

    mapContainer.style.overflow =
        "hidden";


    const viewer =
        document.createElement(
            "div"
        );


    viewer.className =
        "blueprint-viewer";


    viewer.style.position =
        "relative";


    viewer.style.width =
        "100%";


    viewer.style.height =
        "100%";


    viewer.style.display =
        "flex";


    viewer.style.alignItems =
        "center";


    viewer.style.justifyContent =
        "center";


    viewer.style.overflow =
        "auto";


    viewer.style.background =
        "#080f1c";


    const stage =
        document.createElement(
            "div"
        );


    stage.className =
        "blueprint-stage";


    stage.style.position =
        "relative";


    stage.style.display =
        "inline-block";


    stage.style.lineHeight =
        "0";


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "blueprint-image";


    image.src =
        imageData;


    image.alt =
        "Uploaded Building Blueprint";


    image.style.display =
        "block";


    image.style.maxWidth =
        "100%";


    image.style.maxHeight =
        "100%";


    image.style.width =
        "auto";


    image.style.height =
        "auto";


    image.style.objectFit =
        "contain";


    image.style.userSelect =
        "none";


    stage.appendChild(
        image
    );


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "blueprintOverlay";


    overlay.style.position =
        "absolute";


    overlay.style.left =
        "0";


    overlay.style.top =
        "0";


    overlay.style.right =
        "0";


    overlay.style.bottom =
        "0";


    overlay.style.zIndex =
        "5";


    overlay.style.pointerEvents =
        "none";


    stage.appendChild(
        overlay
    );


    viewer.appendChild(
        stage
    );


    mapContainer.appendChild(
        viewer
    );


    const renderOverlay =
        () => {

            if (building) {

                renderBuildingOverlay(
                    overlay,
                    building
                );

            }

        };


    if (image.complete) {

        renderOverlay();

    } else {

        image.onload =
            renderOverlay;

    }


    // ======================================
    // STATUS BADGE
    // ======================================

    const statusBadge =
        document.createElement(
            "div"
        );


    statusBadge.id =
        "blueprintStatusBadge";


    statusBadge.textContent =
        building
            ? "✓ Blueprint processed successfully"
            : "✓ Blueprint uploaded";


    statusBadge.style.position =
        "absolute";


    statusBadge.style.top =
        "12px";


    statusBadge.style.left =
        "12px";


    statusBadge.style.zIndex =
        "50";


    statusBadge.style.padding =
        "8px 12px";


    statusBadge.style.borderRadius =
        "6px";


    statusBadge.style.background =
        "rgba(21,128,61,0.95)";


    statusBadge.style.color =
        "#ffffff";


    statusBadge.style.fontSize =
        "13px";


    statusBadge.style.fontWeight =
        "600";


    mapContainer.appendChild(
        statusBadge
    );


    console.log(
        "Blueprint displayed:",
        building
            ? "with building overlay"
            : "preview only"
    );

}


// ==========================================
// RENDER BUILDING OVER BLUEPRINT
// ==========================================

function renderBuildingOverlay(
    overlay,
    building
) {

    if (
        !overlay ||
        !building ||
        !Array.isArray(
            building.floors
        ) ||
        building.floors.length === 0
    ) {

        console.warn(
            "No building data available for overlay."
        );

        return;

    }


    overlay.innerHTML = "";


    const currentLevel = typeof window.currentFloorLevel === "number" ? window.currentFloorLevel : 0;
    const floor =
        (building.floors || []).find(f => Number(f.level) === currentLevel) || building.floors[0];


    if (!floor) {

        return;

    }


    const floorNumber =
        document.getElementById(
            "floorNumber"
        );


    if (floorNumber) {

        floorNumber.textContent =
            floor.name || (floor.level === 0 ? "Ground Floor" : `Floor ${floor.level !== undefined ? floor.level : 1}`);

    }


    const floorLayer =
        document.createElement(
            "div"
        );


    floorLayer.className =
        "blueprint-floor-overlay";


    floorLayer.style.position =
        "absolute";


    floorLayer.style.left =
        "0";


    floorLayer.style.top =
        "0";


    floorLayer.style.width =
        "100%";


    floorLayer.style.height =
        "100%";


    floorLayer.style.pointerEvents =
        "none";


    overlay.appendChild(
        floorLayer
    );


    // ======================================
    // BUILDING TITLE
    // ======================================

    const title =
        document.createElement(
            "div"
        );


    title.textContent =
        `${building.buildingName || "Uploaded Building"} — Floor ${floor.floorNumber || 1}`;


    title.style.position =
        "absolute";


    title.style.top =
        "10px";


    title.style.left =
        "50%";


    title.style.transform =
        "translateX(-50%)";


    title.style.padding =
        "6px 12px";


    title.style.background =
        "rgba(15,23,42,0.88)";


    title.style.color =
        "#ffffff";


    title.style.borderRadius =
        "6px";


    title.style.fontWeight =
        "600";


    title.style.fontSize =
        "14px";


    title.style.zIndex =
        "10";


    floorLayer.appendChild(
        title
    );


    // ======================================
    // ROOMS
    // ======================================

    const rooms =
        Array.isArray(floor.rooms)
            ? floor.rooms
            : [];


    console.log(
        "Rendering rooms:",
        rooms.length
    );


    rooms.forEach(
        room => {

            if (
                !room ||
                !room.id
            ) {

                return;

            }


            const roomElement =
                createOverlayRoom(
                    room
                );


            floorLayer.appendChild(
                roomElement
            );

        }
    );


    // ======================================
    // CORRIDORS
    // ======================================

    const corridors =
        Array.isArray(
            floor.corridors
        )
            ? floor.corridors
            : [];


    corridors.forEach(
        corridor => {

            if (
                !corridor ||
                !corridor.id
            ) {

                return;

            }


            const corridorElement =
                createOverlayCorridor(
                    corridor
                );


            floorLayer.appendChild(
                corridorElement
            );

        }
    );


    // ======================================
    // EXITS
    // ======================================

    const exits =
        Array.isArray(floor.exits)
            ? floor.exits
            : [];


    exits.forEach(
        exit => {

            if (
                !exit ||
                !exit.id
            ) {

                return;

            }


            const exitElement =
                createOverlayExit(
                    exit
                );


            floorLayer.appendChild(
                exitElement
            );

        }
    );


    // ======================================
    // FIRE
    // ======================================

    const fires =
        Array.isArray(floor.fires)
            ? floor.fires
            : [];


    fires.forEach(
        fire => {

            createOverlayFire(
                floorLayer,
                fire
            );

        }
    );


    // ======================================
    // ROUTE LAYER
    // ======================================

    const routeLayer =
        document.createElement(
            "div"
        );


    routeLayer.id =
        "evacuationRoute";


    routeLayer.style.position =
        "absolute";


    routeLayer.style.left =
        "0";


    routeLayer.style.top =
        "0";


    routeLayer.style.width =
        "100%";


    routeLayer.style.height =
        "100%";


    routeLayer.style.pointerEvents =
        "none";


    routeLayer.style.zIndex =
        "40";


    floorLayer.appendChild(
        routeLayer
    );


    applyFireAlertToMap(
        currentAlertData
    );


    if (
        currentRouteData &&
        routeMatchesCurrentBuilding(
            currentRouteData
        )
    ) {

        updateMapRoute(
            currentRouteData
        );

    }

}


// ==========================================
// OVERLAY ROOM
// ==========================================

function createOverlayRoom(room) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "map-room blueprint-room";


    element.dataset.roomId =
        room.id;


    element.style.position =
        "absolute";


    element.style.left =
        `${room.position?.x ?? 0}%`;


    element.style.top =
        `${room.position?.y ?? 0}%`;


    element.style.width =
        `${room.size?.width ?? 10}%`;


    element.style.height =
        `${room.size?.height ?? 10}%`;


    element.style.boxSizing =
        "border-box";


    element.style.border =
        "2px solid rgba(59,130,246,0.9)";


    element.style.background =
        "rgba(15,23,42,0.55)";


    element.style.display =
        "flex";


    element.style.alignItems =
        "center";


    element.style.justifyContent =
        "center";


    element.style.color =
        "#ffffff";


    element.style.fontWeight =
        "700";


    element.style.fontSize =
        "13px";


    element.style.textShadow =
        "0 1px 3px #000";


    element.style.zIndex =
        "10";


    element.innerHTML = `

        <span>
            ${room.name || room.id}
        </span>

    `;


    return element;

}


// ==========================================
// OVERLAY CORRIDOR
// ==========================================

function createOverlayCorridor(
    corridor
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "map-corridor blueprint-corridor";


    element.style.position =
        "absolute";


    element.style.left =
        `${corridor.position?.x ?? 0}%`;


    element.style.top =
        `${corridor.position?.y ?? 0}%`;


    element.style.width =
        `${corridor.size?.width ?? 10}%`;


    element.style.height =
        `${corridor.size?.height ?? 5}%`;


    element.style.boxSizing =
        "border-box";


    element.style.background =
        "rgba(100,116,139,0.5)";


    element.style.border =
        "1px solid rgba(203,213,225,0.7)";


    element.style.display =
        "flex";


    element.style.alignItems =
        "center";


    element.style.justifyContent =
        "center";


    element.style.color =
        "#ffffff";


    element.style.fontSize =
        "11px";


    element.style.fontWeight =
        "600";


    element.style.zIndex =
        "5";


    element.textContent =
        corridor.name ||
        corridor.id;


    return element;

}


// ==========================================
// OVERLAY EXIT
// ==========================================

function createOverlayExit(exit) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "map-exit blueprint-exit";


    element.dataset.exitId =
        exit.id;


    element.dataset.exitType =
        exit.type || "";


    element.style.position =
        "absolute";


    element.style.left =
        `${exit.position?.x ?? 0}%`;


    element.style.top =
        `${exit.position?.y ?? 0}%`;


    element.style.width =
        `${exit.size?.width ?? 8}%`;


    element.style.height =
        `${exit.size?.height ?? 6}%`;


    element.style.boxSizing =
        "border-box";


    element.style.background =
        "rgba(6,78,59,0.88)";


    element.style.border =
        "2px solid #22c55e";


    element.style.color =
        "#ffffff";


    element.style.display =
        "flex";


    element.style.flexDirection =
        "column";


    element.style.alignItems =
        "center";


    element.style.justifyContent =
        "center";


    element.style.fontWeight =
        "700";


    element.style.fontSize =
        "11px";


    element.style.zIndex =
        "15";


    element.innerHTML = `

        <div>
            🚪
        </div>

        <span>
            ${exit.name || exit.id}
        </span>

    `;


    return element;

}


// ==========================================
// OVERLAY FIRE
// ==========================================

function createOverlayFire(
    floorLayer,
    fire
) {

    if (!fire) {

        return;

    }


    const fireElement =
        document.createElement(
            "div"
        );


    fireElement.className =
        "map-fire-indicator";


    fireElement.dataset.locationId =
        fire.locationId ||
        fire.roomId ||
        "";


    fireElement.textContent =
        "🔥 FIRE";


    fireElement.style.position =
        "absolute";


    fireElement.style.zIndex =
        "30";


    if (fire.position) {

        fireElement.style.left =
            `${fire.position.x}%`;

        fireElement.style.top =
            `${fire.position.y}%`;

    }


    const roomId =
        fire.locationId ||
        fire.roomId;


    if (roomId) {

        const room =
            floorLayer.querySelector(
                `[data-room-id="${roomId}"]`
            );


        if (room) {

            fireElement.style.left =
                "50%";

            fireElement.style.top =
                "50%";

            fireElement.style.transform =
                "translate(-50%, -50%)";


            room.appendChild(
                fireElement
            );


            return;

        }

    }


    floorLayer.appendChild(
        fireElement
    );

}


// ==========================================
// APPLY FIRE ALERT
// ==========================================

function applyFireAlertToMap(
    alerts
) {

    if (
        !blueprintActive ||
        !currentMapData
    ) {

        return;

    }


    document
        .querySelectorAll(
            ".dynamic-fire-indicator"
        )
        .forEach(
            element => {

                element.remove();

            }
        );


    if (
        !alerts ||
        alerts.length === 0
    ) {

        return;

    }


    alerts.forEach(
        alert => {

            if (
                !alert ||
                !alert.locationId
            ) {

                return;

            }


            const room =
                document.querySelector(
                    `[data-room-id="${alert.locationId}"]`
                );


            if (!room) {

                if (
                    lastMissingRoomWarning !==
                    alert.locationId
                ) {

                    console.warn(
                        "Current uploaded building does not contain alert room:",
                        alert.locationId
                    );


                    lastMissingRoomWarning =
                        alert.locationId;

                }


                return;

            }


            lastMissingRoomWarning =
                null;


            const fireElement =
                document.createElement(
                    "div"
                );


            fireElement.className =
                "map-fire-indicator dynamic-fire-indicator";


            fireElement.textContent =
                "🔥 FIRE";


            fireElement.style.position =
                "absolute";


            fireElement.style.left =
                "50%";


            fireElement.style.top =
                "65%";


            fireElement.style.transform =
                "translate(-50%, -50%)";


            fireElement.style.zIndex =
                "30";


            fireElement.style.fontSize =
                "14px";


            fireElement.style.fontWeight =
                "700";


            room.appendChild(
                fireElement
            );

        }
    );

}


// ==========================================
// DISPLAY ROUTE
// ==========================================

function displayRoute(route) {

    if (!route) {

        displayWaitingForRoute();

        return;

    }


    if (
        !blueprintActive ||
        !routeMatchesCurrentBuilding(
            route
        )
    ) {

        displayWaitingForRoute();

        return;

    }


    const statusElement =
        document.getElementById(
            "routeStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            route.status || "UNKNOWN";

    }


    const locationElement =
        document.getElementById(
            "currentLocation"
        );


    if (locationElement) {

        locationElement.textContent =
            route.locationId || "Unknown";

    }


    const exitElement =
        document.getElementById(
            "nearestExit"
        );


    if (exitElement) {

        exitElement.textContent =
            route.exitName || "Unknown";

    }


    const distanceElement =
        document.getElementById(
            "routeDistance"
        );


    if (distanceElement) {

        distanceElement.textContent =
            route.distance || "-";

    }


    const timeElement =
        document.getElementById(
            "routeTime"
        );


    if (timeElement) {

        timeElement.textContent =
            route.estimatedTime || "-";

    }


    const messageElement =
        document.getElementById(
            "routeMessage"
        );


    if (messageElement) {

        if (
            route.status === "REROUTED"
        ) {

            messageElement.textContent =
                "Main Exit unsafe. Emergency Exit recommended.";

        } else {

            messageElement.textContent =
                "Recommended safe evacuation route available.";

        }

    }


    const indicator =
        document.querySelector(
            ".route-indicator"
        );


    if (indicator) {

        indicator.style.background =
            route.status === "REROUTED"
                ? "#f59e0b"
                : "#22c55e";

    }


    updateMapRoute(
        route
    );

}


// ==========================================
// WAITING FOR ROUTE
// ==========================================

function displayWaitingForRoute(
    message = "No evacuation route available yet."
) {

    const statusElement =
        document.getElementById(
            "routeStatus"
        );


    const locationElement =
        document.getElementById(
            "currentLocation"
        );


    const exitElement =
        document.getElementById(
            "nearestExit"
        );


    const distanceElement =
        document.getElementById(
            "routeDistance"
        );


    const timeElement =
        document.getElementById(
            "routeTime"
        );


    const messageElement =
        document.getElementById(
            "routeMessage"
        );


    if (statusElement) {

        statusElement.textContent =
            "WAITING";

    }


    if (locationElement) {

        locationElement.textContent =
            "--";

    }


    if (exitElement) {

        exitElement.textContent =
            "--";

    }


    if (distanceElement) {

        distanceElement.textContent =
            "--";

    }


    if (timeElement) {

        timeElement.textContent =
            "--";

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    const indicator =
        document.querySelector(
            ".route-indicator"
        );


    if (indicator) {

        indicator.style.background =
            "#f59e0b";

    }


    const routeElement =
        document.getElementById(
            "evacuationRoute"
        );


    if (routeElement) {

        routeElement.innerHTML =
            "";

    }

}


// ==========================================
// UPDATE MAP ROUTE
// ==========================================

function updateMapRoute(route) {

    if (
        !route ||
        !blueprintActive
    ) {

        return;

    }


    const routeElement =
        document.getElementById(
            "evacuationRoute"
        );


    if (!routeElement) {

        return;

    }


    routeElement.innerHTML =
        "";


    const currentRoom =
        document.querySelector(
            `[data-room-id="${route.locationId}"]`
        );


    if (!currentRoom) {

        return;

    }


    const exits =
        Array.from(
            document.querySelectorAll(
                ".map-exit"
            )
        );


    const targetExit =
        exits.find(
            exit => {

                const name =
                    exit
                        .querySelector("span")
                        ?.textContent
                        ?.trim();


                return (
                    name ===
                    route.exitName
                );

            }
        );


    if (!targetExit) {

        if (
            lastMissingExitWarning !==
            route.exitName
        ) {

            console.warn(
                "Target exit not found:",
                route.exitName
            );


            lastMissingExitWarning =
                route.exitName;

        }


        return;

    }


    lastMissingExitWarning =
        null;


    const floorMap =
        currentRoom.closest(
            ".floor-map"
        ) ||
        currentRoom.closest(
            ".blueprint-floor-overlay"
        );


    if (!floorMap) {

        return;

    }


    const mapRect =
        floorMap.getBoundingClientRect();


    const roomRect =
        currentRoom.getBoundingClientRect();


    const exitRect =
        targetExit.getBoundingClientRect();


    const startX =
        roomRect.left +
        roomRect.width / 2 -
        mapRect.left;


    const startY =
        roomRect.top +
        roomRect.height / 2 -
        mapRect.top;


    const endX =
        exitRect.left +
        exitRect.width / 2 -
        mapRect.left;


    const endY =
        exitRect.top +
        exitRect.height / 2 -
        mapRect.top;


    const dx =
        endX -
        startX;


    const dy =
        endY -
        startY;


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const angle =
        Math.atan2(
            dy,
            dx
        ) *
        180 /
        Math.PI;


    routeElement.style.position =
        "absolute";


    routeElement.style.left =
        `${startX}px`;


    routeElement.style.top =
        `${startY}px`;


    routeElement.style.width =
        `${length}px`;


    routeElement.style.height =
        "5px";


    routeElement.style.background =
        route.status === "REROUTED"
            ? "#f59e0b"
            : "#22c55e";


    routeElement.style.transform =
        `rotate(${angle}deg)`;


    routeElement.style.transformOrigin =
        "0 50%";


    routeElement.style.borderRadius =
        "5px";


    routeElement.style.zIndex =
        "40";


    routeElement.style.boxShadow =
        route.status === "REROUTED"
            ? "0 0 10px #f59e0b"
            : "0 0 10px #22c55e";


    const arrow =
        document.createElement(
            "span"
        );


    arrow.textContent =
        "➜";


    arrow.style.position =
        "absolute";


    arrow.style.right =
        "-5px";


    arrow.style.top =
        "-12px";


    arrow.style.fontSize =
        "22px";


    arrow.style.color =
        route.status === "REROUTED"
            ? "#f59e0b"
            : "#22c55e";


    routeElement.appendChild(
        arrow
    );


    console.log(
        "Evacuation route:",
        route.locationId,
        "→",
        route.exitName
    );

}


// ==========================================
// UPDATE TIME
// ==========================================

function updateLastUpdateTime() {

    const element =
        document.getElementById(
            "lastUpdate"
        );


    if (!element) {

        return;

    }


    element.textContent =
        new Date().toLocaleTimeString();

}


// ==========================================
// SYSTEM STATUS
// ==========================================

function setSystemStatus(status) {

    const element =
        document.getElementById(
            "connectionStatus"
        );


    if (!element) {

        return;

    }


    element.textContent =
        status;

}


// ==========================================
// API STATUS
// ==========================================

function setApiStatus(status) {

    const element =
        document.getElementById(
            "apiStatus"
        );


    if (!element) {

        return;

    }


    element.textContent =
        status;

}


// ==========================================
// ALERT COUNT
// ==========================================

function updateAlertCount(count) {

    const element =
        document.getElementById(
            "activeAlertCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        count;

}


// ==========================================
// REAL-TIME POLLING
// ==========================================

const POLLING_INTERVAL =
    5000;


function startPolling() {

    console.log(
        "Real-time polling started."
    );


    setInterval(
        async () => {

            try {

                // Backend Health Check
                if (window.electronAPI && typeof window.electronAPI.checkBackendHealth === 'function') {
                    window.electronAPI.checkBackendHealth().then(health => {
                        const apiEl = document.getElementById("apiStatus");
                        if (apiEl) {
                            if (health && health.connected) {
                                apiEl.textContent = "CONNECTED (PORT 5000)";
                                apiEl.style.color = "#10b981";
                            } else {
                                apiEl.textContent = blueprintActive ? "STANDALONE ENGINE" : "Waiting for blueprint";
                                apiEl.style.color = "#94a3b8";
                            }
                        }
                    }).catch(() => {});
                }

                // ==================================
                // IMPORTANT:
                // NOTHING IS POLLED BEFORE UPLOAD
                // ==================================

                if (!blueprintActive) {

                    updateLastUpdateTime();

                    setSystemStatus(
                        "SYSTEM ONLINE"
                    );

                    return;

                }


                // ==================================
                // ALERTS
                // ==================================

                const alertResponse =
                    await window.electronAPI
                        .getAlerts();


                if (
                    alertResponse &&
                    alertResponse.success
                ) {

                    currentAlertData =
                        alertResponse.alerts || [];


                    displayAlerts(
                        currentAlertData
                    );


                    updateAlertCount(
                        currentAlertData.length
                    );


                    if (currentMapData) {

                        applyFireAlertToMap(
                            currentAlertData
                        );

                    }

                }


                // ==================================
                // ROUTE
                // ==================================

                const routeLocation =
                    getValidRouteLocation();


                if (routeLocation) {

                    const routeResponse =
                        await window.electronAPI
                            .getEvacuationRoute(
                                routeLocation
                            );


                    if (
                        routeResponse &&
                        routeResponse.success
                    ) {

                        currentRouteData =
                            routeResponse.route;


                        if (
                            routeMatchesCurrentBuilding(
                                currentRouteData
                            )
                        ) {

                            displayRoute(
                                currentRouteData
                            );

                        } else {

                            displayWaitingForRoute();

                        }

                    }

                } else {

                    displayWaitingForRoute();

                }


                updateLastUpdateTime();


                setSystemStatus(
                    blueprintProcessing
                        ? "PROCESSING BLUEPRINT"
                        : "SYSTEM ONLINE"
                );


                setApiStatus(
                    blueprintProcessing
                        ? "Blueprint processor running..."
                        : "Blueprint Active"
                );


            } catch (error) {

                console.error(
                    "Polling failed:",
                    error
                );


                setSystemStatus(
                    "SYSTEM OFFLINE"
                );


                setApiStatus(
                    "Connection Failed"
                );

            }

        },
        POLLING_INTERVAL
    );

}


// ==========================================
// BLUEPRINT UPLOAD
// ==========================================

function setupBlueprintUpload() {

    const uploadButton =
        document.getElementById(
            "uploadBlueprintButton"
        );


    const blueprintInput =
        document.getElementById(
            "blueprintInput"
        );


    const selectedFileName =
        document.getElementById(
            "selectedFileName"
        );


    if (
        !uploadButton ||
        !blueprintInput
    ) {

        console.warn(
            "Blueprint upload elements not found."
        );

        return;

    }


    uploadButton.addEventListener(
        "click",
        () => {

            blueprintInput.click();

        }
    );


    blueprintInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }

            console.log("Blueprint selected:", file.name);

            // Dynamically set currentFloorLevel based on filename for Mode 1
            const lowerName = file.name.toLowerCase();
            if (lowerName.includes("_0") || lowerName.includes("ground") || lowerName.includes("page_0")) {
                window.currentFloorLevel = 0;
            } else if (lowerName.includes("_1") || lowerName.includes("first") || lowerName.includes("page_1")) {
                window.currentFloorLevel = 1;
            } else if (lowerName.includes("_2") || lowerName.includes("second") || lowerName.includes("page_2")) {
                window.currentFloorLevel = 2;
            } else if (lowerName.includes("_3") || lowerName.includes("third") || lowerName.includes("page_3")) {
                window.currentFloorLevel = 3;
            } else if (lowerName.includes("_4") || lowerName.includes("fourth") || lowerName.includes("page_4")) {
                window.currentFloorLevel = 4;
            } else if (lowerName.includes("_5") || lowerName.includes("fifth") || lowerName.includes("page_5")) {
                window.currentFloorLevel = 5;
            } else if (lowerName.includes("_6") || lowerName.includes("sixth") || lowerName.includes("page_6")) {
                window.currentFloorLevel = 6;
            } else if (lowerName.includes("_7") || lowerName.includes("seventh") || lowerName.includes("page_7")) {
                window.currentFloorLevel = 7;
            } else {
                window.currentFloorLevel = 0; // Default fallback
            }

            console.log("Set window.currentFloorLevel to:", window.currentFloorLevel);
            selectFloor(window.currentFloorLevel);


            if (selectedFileName) {

                selectedFileName.textContent =
                    file.name;

            }


            const allowedTypes = [

                "image/png",

                "image/jpeg",

                "image/jpg"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a PNG or JPG blueprint image."
                );


                blueprintInput.value =
                    "";


                if (selectedFileName) {

                    selectedFileName.textContent =
                        "No blueprint selected";

                }


                return;

            }


            // ==================================
            // ACTIVATE BLUEPRINT
            // ==================================

            blueprintActive =
                true;


            currentMapData =
                null;


            currentAlertData =
                [];


            currentRouteData =
                null;


            lastMissingRoomWarning =
                null;


            lastMissingExitWarning =
                null;


            updateAlertCount(0);


            displayAlerts([]);


            displayWaitingForRoute(
                "Processing uploaded blueprint..."
            );


            showBlueprintProcessing(
                file.name
            );


            // ==================================
            // LOAD IMAGE
            // ==================================

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    currentBlueprintImage =
                        reader.result;


                    displayBlueprintPreview(
                        reader.result,
                        "✓ Blueprint uploaded successfully"
                    );

                };


            reader.readAsDataURL(
                file
            );


            // ==================================
            // PROCESS
            // ==================================

            await processSelectedBlueprint(
                file
            );

        }
    );

}


// ==========================================
// SHOW PROCESSING
// ==========================================

function showBlueprintProcessing(
    fileName
) {

    setSystemStatus(
        "PROCESSING BLUEPRINT"
    );


    setApiStatus(
        "Blueprint processor running..."
    );


    const mapContainer =
        document.getElementById(
            "mapContainer"
        );


    if (!mapContainer) {

        return;

    }


    const existingStatus =
        document.getElementById(
            "blueprintProcessingStatus"
        );


    if (existingStatus) {

        existingStatus.remove();

    }


    const status =
        document.createElement(
            "div"
        );


    status.id =
        "blueprintProcessingStatus";


    status.innerHTML = `

        <div
            style="
                position:absolute;
                top:15px;
                left:15px;
                right:15px;
                z-index:100;
                padding:12px 16px;
                background:rgba(15,23,42,0.94);
                border:1px solid #3b82f6;
                border-radius:8px;
                color:#e5e7eb;
                font-size:14px;
                box-shadow:0 4px 20px rgba(0,0,0,0.3);
            "
        >

            <strong>
                🔄 PROCESSING BLUEPRINT
            </strong>

            <span
                style="
                    margin-left:10px;
                    opacity:0.8;
                "
            >
                ${fileName}
            </span>

        </div>

    `;


    mapContainer.style.position =
        "relative";


    mapContainer.appendChild(
        status
    );

}


// ==========================================
// PROCESS BLUEPRINT
// ==========================================

async function processSelectedBlueprint(
    file
) {

    if (blueprintProcessing) {

        console.log(
            "Blueprint processing already running."
        );

        return;

    }


    blueprintProcessing =
        true;


    try {

        console.log(
            "Starting blueprint processing..."
        );


        setSystemStatus(
            "PROCESSING BLUEPRINT"
        );


        setApiStatus(
            "Blueprint processor running..."
        );


       // ======================================
// GET FILE PATH
// ======================================

if (
    !window.electronAPI ||
    typeof window.electronAPI.getFilePath !== "function"
) {

    throw new Error(
        "Electron file-path API is unavailable. " +
        "Please restart the Electron application."
    );

}

const filePath =
    window.electronAPI.getFilePath(
        file
    );

console.log(
    "Blueprint file path:",
    filePath
);

if (!filePath) {

    throw new Error(
        "Unable to access selected blueprint file."
    );

}
        // ======================================
        // PROCESS
        // ======================================

        const response =
            await window.electronAPI
                .processBlueprint(
                    filePath
                );


        console.log(
            "Blueprint processing response:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            throw new Error(
                response?.error ||
                response?.message ||
                "Blueprint processing failed."
            );

        }


       // ======================================
// GET BUILDING MODEL
// ======================================
// main.js returns:
// {
//     success: true,
//     data: building
// }

if (
    response.data
) {

    currentMapData =
        response.data;

    // Make building data available globally for ThreeDViewer click handlers
    window.buildingData = currentMapData;
    window.currentMapData = currentMapData;

}

else {

    throw new Error(
        "Blueprint processed, but no building data was returned."
    );

}
        // ======================================
        // VALIDATE BUILDING
        // ======================================

        if (
            !currentMapData ||
            !Array.isArray(
                currentMapData.floors
            ) ||
            currentMapData.floors.length === 0
        ) {

            throw new Error(
                "Blueprint processor returned an invalid building model."
            );

        }


        console.log(
            "Building model received:",
            currentMapData
        );


        // ======================================
        // LOG DETECTED ROOMS
        // ======================================

        let detectedRooms = 0;


        currentMapData.floors.forEach(
            floor => {



if (
                    Array.isArray(
                        floor.rooms
                    )
                ) {

                    detectedRooms +=
                        floor.rooms.length;

                }

            }
        );


        console.log(
            "Rooms detected in renderer:",
            detectedRooms
        );


        // ======================================
        // SUCCESS STATUS
        // ======================================

        setSystemStatus(
            "SYSTEM ONLINE"
        );


        setApiStatus(
            "Blueprint processed successfully"
        );


        // ======================================
        // DISPLAY 2D BLUEPRINT & BUILD 3D MODEL
        // ======================================

        displayBlueprintWithBuilding(
            currentBlueprintImage,
            currentMapData
        );

        if (threeDViewer) {
            selectFloor(window.currentFloorLevel);
        }

        showBlueprintProcessedInfo(
            currentMapData
        );


        console.log(
            "Blueprint processing completed."
        );


    } catch (error) {

        console.error(
            "Blueprint processing failed:",
            error
        );


        setSystemStatus(
            "SYSTEM ONLINE"
        );


        setApiStatus(
            "Blueprint processing failed"
        );


        if (currentBlueprintImage) {

            displayBlueprintPreview(
                currentBlueprintImage,
                "⚠ Blueprint processing failed"
            );

        }


        alert(
            "Blueprint processing failed.\n\n" +
            error.message
        );


    } finally {

        blueprintProcessing =
            false;


        const status =
            document.getElementById(
                "blueprintProcessingStatus"
            );


        if (status) {

            status.remove();

        }

    }

}


// ==========================================
// BLUEPRINT PREVIEW
// ==========================================

function displayBlueprintPreview(
    imageData,
    statusText = "Blueprint uploaded"
) {

    const mapContainer =
        document.getElementById(
            "mapContainer"
        );


    if (
        !mapContainer ||
        !imageData
    ) {

        return;

    }


    mapContainer.innerHTML = "";

    mapContainer.style.position =
        "relative";


    const viewer =
        document.createElement(
            "div"
        );


    viewer.style.width =
        "100%";


    viewer.style.height =
        "100%";


    viewer.style.display =
        "flex";


    viewer.style.alignItems =
        "center";


    viewer.style.justifyContent =
        "center";


    viewer.style.overflow =
        "auto";


    viewer.style.background =
        "#080f1c";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        imageData;


    image.alt =
        "Uploaded Building Blueprint";


    image.style.display =
        "block";


    image.style.maxWidth =
        "100%";


    image.style.maxHeight =
        "100%";


    image.style.width =
        "auto";


    image.style.height =
        "auto";


    image.style.objectFit =
        "contain";


    viewer.appendChild(
        image
    );


    mapContainer.appendChild(
        viewer
    );


    const statusBadge =
        document.createElement(
            "div"
        );


    statusBadge.textContent =
        statusText;


    statusBadge.style.position =
        "absolute";


    statusBadge.style.top =
        "12px";


    statusBadge.style.left =
        "12px";


    statusBadge.style.zIndex =
        "50";


    statusBadge.style.padding =
        "8px 12px";


    statusBadge.style.borderRadius =
        "6px";


    statusBadge.style.background =
        statusText.includes(
            "failed"
        )

            ? "rgba(127,29,29,0.95)"

            : "rgba(30,64,175,0.95)";


    statusBadge.style.color =
        "#ffffff";


    statusBadge.style.fontSize =
        "13px";


    statusBadge.style.fontWeight =
        "600";


    mapContainer.appendChild(
        statusBadge
    );

}


// ==========================================
// SHOW PROCESSED BUILDING INFORMATION
// ==========================================

function showBlueprintProcessedInfo(
    building
) {

    if (!building) {

        return;

    }


    let totalRooms =
        0;


    let totalExits =
        0;


    let totalFloors =
        0;


    if (
        Array.isArray(
            building.floors
        )
    ) {

        totalFloors =
            building.floors.length;


        building.floors.forEach(
            floor => {
                if (Array.isArray(floor.nodes)) { totalRooms += floor.nodes.filter(n => n && n.type === 'room').length; totalExits += floor.nodes.filter(n => n && (n.type === 'exit' || n.isExit)).length; }

                if (
                    Array.isArray(
                        floor.rooms
                    )
                ) {

                    totalRooms +=
                        floor.rooms.length;

                }


                if (
                    Array.isArray(
                        floor.exits
                    )
                ) {

                    totalExits +=
                        floor.exits.length;

                }

            }
        );

    }


    console.log(
        "Blueprint processed successfully:",
        {
            buildingName:
                building.buildingName ||
                "Uploaded Building",

            floors:
                totalFloors,

            rooms:
                totalRooms,

            exits:
                totalExits
        }
    );

}

// ==========================================
// M4 PATHFINDING UI INTEGRATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Wait slightly for buildingData to be available globally
    setTimeout(() => {
        if (typeof buildingData !== 'undefined' && typeof M4Pathfinder !== 'undefined') {
            window.m4Pathfinder = new M4Pathfinder(buildingData);
            
            const startSelect = document.getElementById("m4StartNode");
            const endSelect = document.getElementById("m4EndNode");
            const btnCalculate = document.getElementById("btnCalculateM4");
            
            if (startSelect && endSelect && btnCalculate) {
                // Populate dropdowns
                const nodes = window.m4Pathfinder.getAllNodes();
                const exits = nodes.filter(n => n.type === 'exit');
                
                nodes.forEach(n => {
                    const opt = document.createElement("option");
                    opt.value = n.id;
                    opt.textContent = `${n.id} (${n.type})`;
                    startSelect.appendChild(opt);
                });
                
                exits.forEach(n => {
                    const opt = document.createElement("option");
                    opt.value = n.id;
                    opt.textContent = `${n.id} (Exit)`;
                    endSelect.appendChild(opt);
                });
                
                // Add event listener
                btnCalculate.addEventListener("click", () => {
                    const startId = startSelect.value;
                    const endId = endSelect.value;
                    
                    console.log(`Calculating M4 route from ${startId} to ${endId}...`);
                    const result = window.m4Pathfinder.findPath(startId, endId);
                    
                    if (result.success) {
                        console.log(`Route found! Cost: ${result.cost.toFixed(2)}. Path:`, result.path);
                        if (typeof threeDViewer !== 'undefined' && threeDViewer) {
                            threeDViewer.drawEvacuationPath(result.path);
                        }
                        
                        document.getElementById('routeStatus').textContent = "Route Active";
                        document.getElementById('routeMessage').innerHTML = `<span style="color: #22c55e;">Evacuation route successfully calculated. Follow the glowing green path.</span>`;
                        document.getElementById('currentLocation').textContent = startId;
                        document.getElementById('nearestExit').textContent = endId;
                        document.getElementById('routeDistance').textContent = `${result.cost.toFixed(1)}m`;
                        
                        alert(`M4 Route found!\nCost: ${result.cost.toFixed(1)}m\nPath nodes: ${result.path.length}`);
                    } else {
                        console.error(`M4 Pathfinding Failed: ${result.error}`);
                        if (typeof threeDViewer !== 'undefined' && threeDViewer && threeDViewer.routeLine) {
                            threeDViewer.scene.remove(threeDViewer.routeLine);
                            threeDViewer.routeLine = null;
                        }
                        
                        document.getElementById('routeStatus').textContent = "No Route Available";
                        document.getElementById('routeMessage').innerHTML = `<span style="color: #ef4444;">No valid path found to the selected exit.</span>`;
                        
                        alert(`M4 Pathfinding Failed: ${result.error}`);
                    }
                });
            }
        }
    }, 1000);
});


// ==========================================
// USER AUTHENTICATION & SESSION MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("userAuthBtn");
    const logoutBtn = document.getElementById("userLogoutBtn");
    const authStatusText = document.getElementById("authStatusText");
    const authModal = document.getElementById("authModal");
    const closeAuthModal = document.getElementById("closeAuthModal");

    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginError = document.getElementById("loginError");
    const btnLoginSubmit = document.getElementById("btnLoginSubmit");

    const regName = document.getElementById("regName");
    const regEmail = document.getElementById("regEmail");
    const regPassword = document.getElementById("regPassword");
    const regRole = document.getElementById("regRole");
    const regError = document.getElementById("regError");
    const btnRegisterSubmit = document.getElementById("btnRegisterSubmit");

    // 1. Restore persistent session
    function restoreSession() {
        try {
            const storedUser = localStorage.getItem("sim_auth_user");
            const storedToken = localStorage.getItem("sim_auth_token");

            if (storedUser && storedToken) {
                const user = JSON.parse(storedUser);
                applyUserUI(user);
                return;
            }
        } catch (e) {
            console.warn("[Auth] Failed to parse stored session:", e);
        }
        applyGuestUI();
    }

    function applyUserUI(user) {
        if (!authStatusText || !authBtn) return;
        const displayName = user.name || user.email || "Operator";
        const roleBadge = user.role === "admin" ? "Admin" : "Operator";
        authStatusText.textContent = `🟢 ${displayName} (${roleBadge})`;
        authBtn.classList.add("logged-in");
        if (logoutBtn) logoutBtn.style.display = "inline-flex";

        const token = localStorage.getItem("sim_auth_token");
        if (window.electronAPI && typeof window.electronAPI.setAuthToken === "function") {
            window.electronAPI.setAuthToken(token);
        }
        if (typeof window.renderHistoryUI === "function") {
            window.renderHistoryUI();
        }
    }

    function applyGuestUI() {
        if (!authStatusText || !authBtn) return;
        authStatusText.textContent = "Sign In / Register";
        authBtn.classList.remove("logged-in");
        if (logoutBtn) logoutBtn.style.display = "none";

        if (window.electronAPI && typeof window.electronAPI.setAuthToken === "function") {
            window.electronAPI.setAuthToken(null);
        }
        if (typeof window.renderHistoryUI === "function") {
            window.renderHistoryUI();
        }
    }

    // 2. Open / Close Modal Handlers
    function openModal(tab = "login") {
        if (!authModal) return;
        authModal.style.display = "flex";
        if (tab === "register") {
            showRegisterTab();
        } else {
            showLoginTab();
        }
    }

    function closeModal() {
        if (!authModal) return;
        authModal.style.display = "none";
        if (loginError) loginError.style.display = "none";
        if (regError) regError.style.display = "none";
    }

    function showLoginTab() {
        if (tabLogin) tabLogin.classList.add("active");
        if (tabRegister) tabRegister.classList.remove("active");
        if (loginForm) loginForm.style.display = "flex";
        if (registerForm) registerForm.style.display = "none";
        if (loginError) loginError.style.display = "none";
    }

    function showRegisterTab() {
        if (tabRegister) tabRegister.classList.add("active");
        if (tabLogin) tabLogin.classList.remove("active");
        if (registerForm) registerForm.style.display = "flex";
        if (loginForm) loginForm.style.display = "none";
        if (regError) regError.style.display = "none";
    }

    if (authBtn) {
        authBtn.addEventListener("click", () => {
            const token = localStorage.getItem("sim_auth_token");
            if (token) {
                // If already logged in, show user info or ask to switch
                const user = JSON.parse(localStorage.getItem("sim_auth_user") || "{}");
                alert(`Logged In as: ${user.name || user.email || 'Operator'}\nRole: ${user.role || 'Operator'}\nID: ${user.id || 'N/A'}`);
            } else {
                openModal("login");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out from the system?")) {
                localStorage.removeItem("sim_auth_token");
                localStorage.removeItem("sim_auth_user");
                applyGuestUI();
                alert("You have logged out successfully.");
            }
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener("click", closeModal);
    }

    if (authModal) {
        authModal.addEventListener("click", (e) => {
            if (e.target === authModal) {
                closeModal();
            }
        });
    }

    if (tabLogin) tabLogin.addEventListener("click", showLoginTab);
    if (tabRegister) tabRegister.addEventListener("click", showRegisterTab);

    // 3. Login Submit Handler
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loginError) loginError.style.display = "none";

            const email = loginEmail ? loginEmail.value.trim() : "";
            const password = loginPassword ? loginPassword.value : "";

            if (!email || !password) {
                if (loginError) {
                    loginError.textContent = "Please enter both email and password.";
                    loginError.style.display = "block";
                }
                return;
            }

            if (btnLoginSubmit) {
                btnLoginSubmit.disabled = true;
                btnLoginSubmit.textContent = "Verifying...";
            }

            try {
                let response = null;
                if (window.electronAPI && typeof window.electronAPI.login === "function") {
                    response = await window.electronAPI.login(email, password);
                } else {
                    // Direct fetch fallback
                    const res = await fetch("http://localhost:5000/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                    });
                    response = await res.json();
                }

                if (response && (response.success || response.token || (response.data && response.data.token))) {
                    const token = response.token || (response.data && response.data.token);
                    const user = response.user || (response.data && response.data.user) || { email, name: email.split('@')[0], role: "user" };

                    localStorage.setItem("sim_auth_token", token);
                    localStorage.setItem("sim_auth_user", JSON.stringify(user));

                    applyUserUI(user);
                    closeModal();
                    alert(`Welcome, ${user.name || user.email}! Authentication verified.`);
                } else {
                    const msg = (response && (response.error || response.message)) || "Invalid credentials or user not found.";
                    if (loginError) {
                        loginError.textContent = msg;
                        loginError.style.display = "block";
                    }
                }
            } catch (err) {
                console.error("[Auth] Login error:", err);
                if (loginError) {
                    loginError.textContent = "Connection failed. Please ensure the backend is running.";
                    loginError.style.display = "block";
                }
            } finally {
                if (btnLoginSubmit) {
                    btnLoginSubmit.disabled = false;
                    btnLoginSubmit.textContent = "Sign In to System";
                }
            }
        });
    }

    // 4. Register Submit Handler
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (regError) regError.style.display = "none";

            const name = regName ? regName.value.trim() : "";
            const email = regEmail ? regEmail.value.trim() : "";
            const password = regPassword ? regPassword.value : "";
            const role = regRole ? regRole.value : "user";

            if (!name || !email || !password) {
                if (regError) {
                    regError.textContent = "Please fill in all required fields.";
                    regError.style.display = "block";
                }
                return;
            }

            if (password.length < 6) {
                if (regError) {
                    regError.textContent = "Password must be at least 6 characters.";
                    regError.style.display = "block";
                }
                return;
            }

            if (btnRegisterSubmit) {
                btnRegisterSubmit.disabled = true;
                btnRegisterSubmit.textContent = "Creating Account...";
            }

            try {
                let response = null;
                if (window.electronAPI && typeof window.electronAPI.register === "function") {
                    response = await window.electronAPI.register(name, email, password, role);
                } else {
                    const res = await fetch("http://localhost:5000/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, email, password, role })
                    });
                    response = await res.json();
                }

                if (response && (response.success || response.token || (response.data && response.data.token))) {
                    const token = response.token || (response.data && response.data.token);
                    const user = response.user || (response.data && response.data.user) || { name, email, role };

                    localStorage.setItem("sim_auth_token", token);
                    localStorage.setItem("sim_auth_user", JSON.stringify(user));

                    applyUserUI(user);
                    closeModal();
                    alert(`Account created successfully! Welcome, ${name}.`);
                } else {
                    const msg = (response && (response.error || response.message)) || "Registration failed. Email might already exist.";
                    if (regError) {
                        regError.textContent = msg;
                        regError.style.display = "block";
                    }
                }
            } catch (err) {
                console.error("[Auth] Register error:", err);
                if (regError) {
                    regError.textContent = "Connection error while registering. Ensure backend is running.";
                    regError.style.display = "block";
                }
            } finally {
                if (btnRegisterSubmit) {
                    btnRegisterSubmit.disabled = false;
                    btnRegisterSubmit.textContent = "Create & Sign In";
                }
            }
        });
    }

    // Initialize session check
    restoreSession();
});


// ==========================================
// USER SIMULATION & EVACUATION HISTORY ENGINE
// ==========================================

(function initUserHistoryEngine() {
    function getActiveUser() {
        try {
            const stored = localStorage.getItem("sim_auth_user");
            if (stored) {
                const u = JSON.parse(stored);
                if (u && (u.email || u.id || u.name)) return u;
            }
        } catch (e) {}
        return null;
    }

    function getUserStorageKey(user) {
        if (!user) return null;
        const identifier = user.id || user.email || user.name || "guest";
        return "sim_evac_hist_" + identifier.replace(/[^a-zA-Z0-9_-]/g, "_");
    }

    // Get current user's locally cached drills (strictly filtered to active user)
    window.getEvacuationHistory = function() {
        const activeUser = getActiveUser();
        if (!activeUser) {
            return [];
        }
        const key = getUserStorageKey(activeUser);
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(d => {
                if (activeUser.id && d.userId && d.userId === activeUser.id) return true;
                if (activeUser.email && d.email && d.email.toLowerCase() === activeUser.email.toLowerCase()) return true;
                if (activeUser.name && d.operator && d.operator.toLowerCase() === activeUser.name.toLowerCase()) return true;
                return false;
            });
        } catch (e) {
            console.warn("[History] Failed to read user history storage:", e);
            return [];
        }
    };

    // Record an evacuation drill to both PostgreSQL database and user-specific local storage
    window.recordEvacuationHistory = async function(details) {
        try {
            const activeUser = getActiveUser();
            if (!activeUser) {
                console.warn("[History] Guest mode: drill not saved because no user is logged in.");
                return null;
            }

            const key = getUserStorageKey(activeUser);
            const history = window.getEvacuationHistory();

            const newDrill = {
                id: "DRILL-" + Date.now().toString(36).toUpperCase().slice(-5),
                userId: activeUser.id || null,
                operator: activeUser.name || activeUser.email || "Operator",
                email: activeUser.email || "",
                role: activeUser.role || "user",
                timestamp: new Date().toLocaleString("en-GB", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                isoTime: new Date().toISOString(),
                floor: details.floor || "Ground Floor",
                algorithm: details.algorithm || "A* Multi-Floor",
                durationSec: Number(details.durationSec || 35.0),
                distanceMeters: Number(details.distanceMeters || 75.0),
                victimsSaved: Number(details.victimsSaved !== undefined ? details.victimsSaved : 1),
                casualties: Number(details.casualties || 0),
                status: details.status || "SUCCESS",
                waypoints: details.waypoints || ["START-NODE", "CORRIDOR-A", "STAIRS", "GROUND-EXIT"]
            };

            // Prepend to user-specific list
            history.unshift(newDrill);
            if (key) {
                localStorage.setItem(key, JSON.stringify(history));
            }
            console.log("[History] Saved drill " + newDrill.id + " for user " + newDrill.email);

            // Persist to Express / Supabase PostgreSQL database via Electron API
            const token = localStorage.getItem("sim_auth_token");
            if (window.electronAPI && typeof window.electronAPI.saveSimulationReport === "function") {
                try {
                    const reportPayload = {
                        blueprint_id: window.currentBlueprintId || '00000000-0000-0000-0000-000000000001',
                        algorithm_used: newDrill.algorithm,
                        evacuation_time: newDrill.durationSec,
                        total_distance: newDrill.distanceMeters,
                        visited_nodes: newDrill.waypoints ? newDrill.waypoints.length : 12,
                        benchmark_json: {
                            drillId: newDrill.id,
                            userId: activeUser.id,
                            operator: newDrill.operator,
                            email: newDrill.email,
                            role: newDrill.role,
                            floor: newDrill.floor,
                            victimsSaved: newDrill.victimsSaved,
                            casualties: newDrill.casualties,
                            status: newDrill.status,
                            waypoints: newDrill.waypoints,
                            timestamp: newDrill.timestamp,
                            isoTime: newDrill.isoTime
                        }
                    };

                    const saveResult = await window.electronAPI.saveSimulationReport(reportPayload, token);
                    if (saveResult && saveResult.success && saveResult.report) {
                        newDrill.dbId = saveResult.report.id;
                        if (key) localStorage.setItem(key, JSON.stringify(history));
                        console.log("[History] Successfully stored drill in Supabase PostgreSQL database:", saveResult.report.id);
                    }
                } catch (dbErr) {
                    console.warn("[History] Database sync error (cached locally):", dbErr);
                }
            }

            // Update UI
            if (typeof window.renderHistoryUI === "function") {
                window.renderHistoryUI();
            }
            return newDrill;
        } catch (err) {
            console.error("[History] Error recording drill:", err);
            return null;
        }
    };

    // Render User History Table & Synchronize with Database
    window.renderHistoryUI = async function(filterText = "", floorFilter = "all") {
        const tbody = document.getElementById("historyTableBody");
        const emptyState = document.getElementById("historyEmptyState");
        const totalEl = document.getElementById("histStatTotal");
        const avgTimeEl = document.getElementById("histStatAvgTime");
        const savedEl = document.getElementById("histStatSaved");
        const successEl = document.getElementById("histStatSuccess");
        const subtitleEl = document.querySelector(".history-subtitle");

        if (!tbody) return;

        const activeUser = getActiveUser();

        // 1. If not logged in, enforce strict privacy: show Guest Mode & Auth Prompt
        if (!activeUser) {
            if (subtitleEl) {
                subtitleEl.innerHTML = '<span style="color: #f59e0b;">🔒 Guest Mode — Sign in to view and save personal drill history in the database.</span>';
            }
            if (totalEl) totalEl.textContent = "0";
            if (avgTimeEl) avgTimeEl.textContent = "0.0s";
            if (savedEl) savedEl.textContent = "0";
            if (successEl) successEl.textContent = "100%";
            tbody.innerHTML = "";
            if (emptyState) {
                emptyState.style.display = "flex";
                emptyState.innerHTML = `
                    <span class="empty-icon">🔒</span>
                    <h4>Please Sign In to View Your History</h4>
                    <p>Evacuation history is strictly private and stored per user in the database. Sign in or register to record and inspect your personal drill runs.</p>
                    <button type="button" class="hist-btn btn-refresh" style="margin-top: 12px; cursor: pointer;" onclick="document.getElementById('userAuthBtn').click()">
                        <span>👤</span> Sign In / Register
                    </button>
                `;
            }
            return;
        }

        // 2. Display logged-in user header badge
        if (subtitleEl) {
            const roleLabel = activeUser.role === 'admin' ? 'Admin' : 'Operator';
            subtitleEl.innerHTML = `Showing Drill History for: <strong style="color: #38bdf8;">${activeUser.name || activeUser.email}</strong> (${roleLabel}) &bull; <span style="color: #10b981;">☁ Database Connected</span>`;
        }

        // 3. Sync from PostgreSQL database via Backend API
        const token = localStorage.getItem("sim_auth_token");
        if (window.electronAPI && typeof window.electronAPI.getSimulationReports === "function") {
            try {
                const dbRes = await window.electronAPI.getSimulationReports(token);
                if (dbRes && dbRes.success && Array.isArray(dbRes.reports) && dbRes.reports.length > 0) {
                    const userDbDrills = [];
                    dbRes.reports.forEach(r => {
                        const bJson = r.benchmark_json || {};
                        // Strict validation: must belong to active user
                        const isMatch = (activeUser.id && r.user_id === activeUser.id) ||
                                        (activeUser.email && bJson.email && bJson.email.toLowerCase() === activeUser.email.toLowerCase()) ||
                                        (activeUser.name && bJson.operator && bJson.operator.toLowerCase() === activeUser.name.toLowerCase());
                        if (isMatch) {
                            userDbDrills.push({
                                id: bJson.drillId || ("DRILL-" + r.id.substring(0, 5).toUpperCase()),
                                userId: r.user_id,
                                operator: r.users?.name || bJson.operator || activeUser.name,
                                email: r.users?.email || bJson.email || activeUser.email,
                                role: r.users?.role || bJson.role || activeUser.role || "user",
                                timestamp: bJson.timestamp || new Date(r.created_at).toLocaleString("en-GB", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                isoTime: r.created_at,
                                floor: bJson.floor || "Ground Floor",
                                algorithm: r.algorithm_used || "A* Multi-Floor",
                                durationSec: Number(r.evacuation_time),
                                distanceMeters: Number(r.total_distance),
                                victimsSaved: Number(bJson.victimsSaved !== undefined ? bJson.victimsSaved : 1),
                                casualties: Number(bJson.casualties || 0),
                                status: bJson.status || "SUCCESS",
                                waypoints: bJson.waypoints || ["START-NODE", "CORRIDOR-A", "STAIRS", "GROUND-EXIT"],
                                dbId: r.id
                            });
                        }
                    });

                    // Merge with user's local cache
                    const key = getUserStorageKey(activeUser);
                    if (key) {
                        const localDrills = window.getEvacuationHistory();
                        const mergedMap = new Map();
                        userDbDrills.forEach(d => mergedMap.set(d.id, d));
                        localDrills.forEach(d => {
                            if (!mergedMap.has(d.id)) mergedMap.set(d.id, d);
                        });
                        const finalDrills = Array.from(mergedMap.values()).sort((a, b) => new Date(b.isoTime || 0) - new Date(a.isoTime || 0));
                        localStorage.setItem(key, JSON.stringify(finalDrills));
                    }
                }
            } catch (syncErr) {
                console.warn("[History] Database fetch sync error, falling back to user cache:", syncErr);
            }
        }

        // 4. Load the user's verified drills
        let drills = window.getEvacuationHistory();

        // 5. Compute Analytics KPIs across this user's records only
        if (totalEl) totalEl.textContent = drills.length;
        if (drills.length > 0) {
            const sumTime = drills.reduce((acc, d) => acc + (Number(d.durationSec) || 0), 0);
            const sumSaved = drills.reduce((acc, d) => acc + (Number(d.victimsSaved) || 0), 0);
            const successCount = drills.filter(d => d.status === "SUCCESS").length;

            if (avgTimeEl) avgTimeEl.textContent = (sumTime / drills.length).toFixed(1) + "s";
            if (savedEl) savedEl.textContent = sumSaved;
            if (successEl) successEl.textContent = ((successCount / drills.length) * 100).toFixed(0) + "%";
        } else {
            if (avgTimeEl) avgTimeEl.textContent = "0.0s";
            if (savedEl) savedEl.textContent = "0";
            if (successEl) successEl.textContent = "100%";
        }

        // 6. Filter by search text and floor
        const query = (filterText || "").trim().toLowerCase();
        if (query) {
            drills = drills.filter(d => 
                (d.id && d.id.toLowerCase().includes(query)) ||
                (d.operator && d.operator.toLowerCase().includes(query)) ||
                (d.email && d.email.toLowerCase().includes(query)) ||
                (d.floor && d.floor.toLowerCase().includes(query)) ||
                (d.algorithm && d.algorithm.toLowerCase().includes(query)) ||
                (d.status && d.status.toLowerCase().includes(query))
            );
        }

        if (floorFilter && floorFilter !== "all") {
            drills = drills.filter(d => d.floor && d.floor.toLowerCase() === floorFilter.toLowerCase());
        }

        tbody.innerHTML = "";

        if (drills.length === 0) {
            if (emptyState) {
                emptyState.style.display = "flex";
                emptyState.innerHTML = `
                    <span class="empty-icon">📂</span>
                    <h4>No Simulation Drills Recorded for ${activeUser.name || activeUser.email}</h4>
                    <p>Switch to the <strong>3D Simulation</strong> tab, spawn a victim, and click <strong>Start Evacuation</strong> to record your first run to the database!</p>
                `;
            }
            return;
        } else {
            if (emptyState) emptyState.style.display = "none";
        }

        // 7. Render Table Rows
        drills.forEach(drill => {
            const tr = document.createElement("tr");

            const opRole = drill.role === "admin" ? "Admin" : "Operator";
            const roleClass = drill.role === "admin" ? "admin" : "user";
            const statusClass = drill.status === "SUCCESS" ? "success" : (drill.status === "MODERATE" ? "moderate" : "casualty");
            const statusIcon = drill.status === "SUCCESS" ? "🟢" : (drill.status === "MODERATE" ? "🟡" : "🔴");

            tr.innerHTML = `
                <td><strong style="color: #38bdf8; font-family: monospace;">${drill.id}</strong></td>
                <td>
                    <span class="hist-op-badge ${roleClass}">
                        <span>👤</span> <strong>${drill.operator}</strong> <small style="opacity: 0.7;">(${opRole})</small>
                    </span>
                </td>
                <td style="color: #94a3b8;">${drill.timestamp}</td>
                <td><strong>${drill.floor}</strong></td>
                <td><span style="background: rgba(56, 189, 248, 0.1); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${drill.algorithm}</span></td>
                <td><strong>${Number(drill.durationSec).toFixed(1)}s</strong></td>
                <td>${Number(drill.distanceMeters).toFixed(1)}m</td>
                <td><span style="color: #4ade80; font-weight: 700;">${drill.victimsSaved} Saved</span> <small style="color: #94a3b8;">(${drill.casualties} Casualties)</small></td>
                <td>
                    <span class="hist-status-badge ${statusClass}">
                        ${statusIcon} ${drill.status}
                    </span>
                </td>
                <td>
                    <button class="hist-view-btn" data-id="${drill.id}">🔍 Details</button>
                </td>
            `;

            const detailBtn = tr.querySelector(".hist-view-btn");
            if (detailBtn) {
                detailBtn.addEventListener("click", () => openDrillDetailModal(drill));
            }

            tbody.appendChild(tr);
        });
    };

    function openDrillDetailModal(drill) {
        const modal = document.getElementById("historyRunModal");
        const title = document.getElementById("histDetailTitle");
        const subtitle = document.getElementById("histDetailSubtitle");
        const content = document.getElementById("histDetailContent");

        if (!modal || !content) return;

        if (title) title.textContent = "DRILL AUDIT: " + drill.id;
        if (subtitle) subtitle.textContent = "Conducted by " + drill.operator + " (" + drill.role + ") • " + drill.timestamp;

        const waypointsList = Array.isArray(drill.waypoints) ? drill.waypoints.join(" ➔ ") : "Standard Escape Corridor ➔ Ground Floor Exit";

        content.innerHTML = `
            <div class="hist-detail-grid">
                <div class="hist-detail-item">
                    <span class="item-label">Operator Name</span>
                    <span class="item-value">👤 ${drill.operator}</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Account / Email</span>
                    <span class="item-value">✉️ ${drill.email || 'N/A'}</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Evacuated Floor</span>
                    <span class="item-value">🏢 ${drill.floor}</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Pathfinding Engine</span>
                    <span class="item-value">🧭 ${drill.algorithm}</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Evacuation Time</span>
                    <span class="item-value">⏱️ ${Number(drill.durationSec).toFixed(1)} Seconds</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Total Distance</span>
                    <span class="item-value">📏 ${Number(drill.distanceMeters).toFixed(1)} Meters</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Victims Rescued</span>
                    <span class="item-value" style="color: #4ade80;">🛡️ ${drill.victimsSaved} Safe (0 Casualties)</span>
                </div>
                <div class="hist-detail-item">
                    <span class="item-label">Audit Outcome</span>
                    <span class="item-value" style="color: #38bdf8;">✅ ${drill.status}</span>
                </div>
            </div>

            <div style="margin-bottom: 8px; font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">
                Navigation Waypoints Traversed:
            </div>
            <div class="hist-waypoints-box">
                ${waypointsList}
            </div>
        `;

        modal.style.display = "flex";
    }

    function exportToCSV() {
        const drills = window.getEvacuationHistory();
        if (drills.length === 0) {
            alert("No simulation drills to export.");
            return;
        }

        const headers = ["Drill_ID", "Operator_Name", "Email", "Role", "Timestamp_Recorded", "Floor_Zone", "Algorithm_Used", "Duration_Seconds", "Distance_Meters", "Victims_Saved", "Casualties", "Status_Outcome"];
        const rows = drills.map(d => [
            d.id,
            `"${d.operator}"`,
            `"${d.email || ''}"`,
            `"${d.role || 'user'}"`,
            `"${d.timestamp}"`,
            `"${d.floor}"`,
            `"${d.algorithm}"`,
            d.durationSec,
            d.distanceMeters,
            d.victimsSaved,
            d.casualties,
            `"${d.status}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AI_Fire_Evacuation_Drill_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("[History] Successfully generated & downloaded CSV export.");
    }

    // Attach Event Listeners on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        const searchInput = document.getElementById("histSearchInput");
        const floorFilter = document.getElementById("histFloorFilter");
        const btnExport = document.getElementById("btnHistExportCSV");
        const btnRefresh = document.getElementById("btnHistRefresh");
        const btnClear = document.getElementById("btnHistClear");
        const closeDetailModal = document.getElementById("closeHistDetailModal");
        const historyRunModal = document.getElementById("historyRunModal");

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                window.renderHistoryUI(searchInput.value, floorFilter ? floorFilter.value : "all");
            });
        }

        if (floorFilter) {
            floorFilter.addEventListener("change", () => {
                window.renderHistoryUI(searchInput ? searchInput.value : "", floorFilter.value);
            });
        }

        if (btnExport) btnExport.addEventListener("click", exportToCSV);
        if (btnRefresh) {
            btnRefresh.addEventListener("click", () => {
                window.renderHistoryUI(searchInput ? searchInput.value : "", floorFilter ? floorFilter.value : "all");
                alert("History refreshed from database!");
            });
        }

        if (btnClear) {
            btnClear.addEventListener("click", () => {
                const activeUser = getActiveUser();
                if (!activeUser) {
                    alert("Please sign in first.");
                    return;
                }
                if (confirm("Are you sure you want to clear your local simulation drill records?")) {
                    const key = getUserStorageKey(activeUser);
                    if (key) localStorage.removeItem(key);
                    window.renderHistoryUI();
                    alert("Your local drill records have been cleared.");
                }
            });
        }

        if (closeDetailModal) {
            closeDetailModal.addEventListener("click", () => {
                if (historyRunModal) historyRunModal.style.display = "none";
            });
        }

        if (historyRunModal) {
            historyRunModal.addEventListener("click", (e) => {
                if (e.target === historyRunModal) {
                    historyRunModal.style.display = "none";
                }
            });
        }

        // Initial render
        window.renderHistoryUI();
    });
})();
