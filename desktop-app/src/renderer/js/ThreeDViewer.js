// ==========================================
// 3D VIEWER (THREE.JS)
// AI FIRE EVACUATION SYSTEM
// ==========================================

// THREE and OrbitControls are loaded globally via index.html scripts

class ThreeDViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a1128); // Deeper, more cinematic dark blue theme

        this.camera = new THREE.PerspectiveCamera(
            55,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 65, 120);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        const ControlsClass = (typeof THREE !== "undefined" && THREE.OrbitControls) || (typeof OrbitControls !== "undefined" && OrbitControls);
        if (ControlsClass) {
            this.controls = new ControlsClass(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }

        // Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Cool soft ambient
        this.scene.add(ambientLight);
        
        const hemiLight = new THREE.HemisphereLight(0xe0e7ff, 0x0f172a, 0.5); // Sky and ground color
        this.scene.add(hemiLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(100, 200, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.bias = -0.0005;
        this.scene.add(directionalLight);

        // Resize handler
        window.addEventListener("resize", this.onWindowResize.bind(this));

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.victimPlacementMode = false;
        this.firePlacementMode = false;
        this.onFloorClicked = null;
        this.onFireClicked = null;
        this.activeFires = []; // Stores objects with { mesh, spreadTimer }

        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));

        this.buildingGroup = new THREE.Group();
        this.scene.add(this.buildingGroup);

        // Store mesh references
        this.nodeMeshMap = new Map();
        this.fireMeshMap = new Map();
        this.stairFloorMap = new Map();
        this.routeLine = null;

        // Emergency Alarm Strobe Beacon
        this.alarmStrobeLight = new THREE.PointLight(0xff0000, 0, 250);
        this.alarmStrobeLight.position.set(0, 50, 0);
        this.scene.add(this.alarmStrobeLight);
        this.alarmStrobeActive = false;
        this.alarmStrobePhase = 0;

        this.animate();
    }

    onWindowResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    setAlarmStrobe(active) {
        this.alarmStrobeActive = !!active;
        if (!active && this.alarmStrobeLight) {
            this.alarmStrobeLight.intensity = 0;
        }
    }

    onPointerDown(event) {
        if ((!this.victimPlacementMode && !this.firePlacementMode)) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.buildingGroup.children, true);
        
        if (intersects.length > 0) {
            // Find the closest floor slab or wall
            let hit = intersects[0];
            // Identify floor index from user data
            let obj = hit.object;
            let floorIndex = -1;
            while (obj && obj !== this.buildingGroup) {
                if (obj.userData && obj.userData.floorIndex !== undefined) {
                    floorIndex = obj.userData.floorIndex;
                    break;
                }
                obj = obj.parent;
            }

            // Fallback: If clicked mesh wasn't tagged, infer floor index from hit Y elevation
            const bData = (typeof window !== 'undefined' && window.buildingData) || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (floorIndex === -1 && bData && bData.floors) {
                let closestDist = Infinity;
                bData.floors.forEach((fl, idx) => {
                    const elev = fl.elevation !== undefined ? fl.elevation : (idx * 12);
                    const dist = Math.abs(hit.point.y - (elev + 2.5));
                    if (dist < closestDist) {
                        closestDist = dist;
                        floorIndex = idx;
                    }
                });
            }

            if (floorIndex !== -1 && bData) {
                if (this.firePlacementMode && this.onFireClicked) {
                    this.onFireClicked(hit.point, floorIndex);
                    this.firePlacementMode = false;
                    this.renderer.domElement.style.cursor = 'default';
                    return;
                }

                if (this.victimPlacementMode && this.onFloorClicked) {
                    let closestNode = null;
                    let minDist = Infinity;
                    const floor = window.buildingData.floors[floorIndex];
                    
                    if (floor && floor.nodes) {
                        floor.nodes.forEach(n => {
                            if(!n) return;
                            const dx = hit.point.x - n.x;
                            const dz = hit.point.z - n.z;
                            const dist = Math.sqrt(dx*dx + dz*dz);
                            if (dist < minDist) {
                                minDist = dist;
                                closestNode = n;
                            }
                        });
                    }
                    
                    if (closestNode) {
                        this.onFloorClicked(hit.point, closestNode.id);
                        this.victimPlacementMode = false;
                        this.renderer.domElement.style.cursor = 'default';
                    } else {
                        console.warn("No valid node found on floor " + floorIndex);
                    }
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if (this.controls) this.controls.update();
        if (typeof window !== 'undefined' && window.victimAgent) window.victimAgent.update();
        
        // Emergency Alarm Strobe Beacon Animation
        if (this.alarmStrobeActive && this.alarmStrobeLight) {
            this.alarmStrobePhase += 0.2;
            this.alarmStrobeLight.intensity = (Math.sin(this.alarmStrobePhase) > 0) ? 4.5 : 0.0;
        } else if (this.alarmStrobeLight && this.alarmStrobeLight.intensity > 0) {
            this.alarmStrobeLight.intensity = 0;
        }

        // Horizontal Fire & Smoke Spread logic (X and Z expand along floor plan)
        this.activeFires.forEach(fireObj => {
            // Horizontal spread across the floor surface (along X and Z)
            if (fireObj.mesh.scale.x < fireObj.maxScale) {
                const spreadRate = 0.010;
                fireObj.mesh.scale.x += spreadRate;
                fireObj.mesh.scale.z += spreadRate;
                // Height (Y) stays realistic to room height (~2.2) so flames don't clip through upper floor slabs
                fireObj.mesh.scale.y = Math.min(2.4, 1.0 + fireObj.mesh.scale.x * 0.05);

                // Smoke spreads horizontally along the floor ceiling
                const smokeRate = 0.016;
                fireObj.smokeMesh.scale.x += smokeRate;
                fireObj.smokeMesh.scale.z += smokeRate;
                // Smoke vertical thickness capped so it blankets the room without leaking to higher floors
                fireObj.smokeMesh.scale.y = Math.min(3.5, 1.0 + fireObj.smokeMesh.scale.x * 0.04);
            }

            // Visual Fire Animation
            if (fireObj.mesh.userData && fireObj.mesh.userData.flames) {
                const data = fireObj.mesh.userData;
                data.time += 0.05;
                if (data.core) {
                    data.core.scale.setScalar(1.0 + Math.sin(data.time * 2.0) * 0.15);
                    data.core.material.opacity = 0.6 + Math.sin(data.time * 5.0) * 0.2;
                }
                if (data.fireLight) data.fireLight.intensity = 2.5 + Math.random() * 1.5;
                if (data.flames) {
                    data.flames.forEach((f, i) => {
                        f.position.y += 0.15;
                        f.scale.setScalar(f.scale.x * 0.96);
                        f.material.opacity -= 0.03;
                        if (f.position.y > 4.0 || f.material.opacity <= 0.01) {
                            f.position.set((Math.random()-0.5)*2.0, Math.random()*1.0, (Math.random()-0.5)*2.0);
                            f.scale.setScalar(Math.random() * 0.5 + 0.5);
                            f.material.opacity = 0.8;
                        }
                    });
                }
            }

            // Visual Smoke Animation
            if (fireObj.smokeMesh.userData && fireObj.smokeMesh.userData.particles) {
                const data = fireObj.smokeMesh.userData;
                data.time += 0.015;
                if (data.particles) {
                    data.particles.forEach((p, i) => {
                        p.rotation.y += 0.005;
                        p.rotation.x += 0.005;
                        p.position.y += 0.03; // Volumetric rise
                        p.position.x += Math.sin(data.time * 2.0 + i) * 0.01;
                        p.position.z += Math.cos(data.time * 1.5 + i) * 0.01;
                        p.scale.setScalar(p.scale.x * 1.002); // Billow outwards
                        
                        if (p.material.opacity > 0.0) p.material.opacity -= 0.003;
                        
                        if (p.position.y > 18.0 || p.material.opacity <= 0.01) {
                             p.position.set((Math.random()-0.5)*6, Math.random()*3, (Math.random()-0.5)*6);
                             p.scale.setScalar(Math.random() * 0.4 + 0.8);
                             p.material.opacity = 0.12;
                        }
                    });
                }
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    spawnFireAtPosition(position, floorIndex) {
        // Create invisible base mesh to preserve exact logic/scale/radius for M6 calculations
        const geo = new THREE.SphereGeometry(2.0, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ visible: false });
        const fireMesh = new THREE.Mesh(geo, mat);
        fireMesh.position.copy(position).add(new THREE.Vector3(0, 2, 0));
        
        // --- Realistic Visual Fire ---
        const visualFireGroup = new THREE.Group();
        
        // Fire Core
        const coreGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        visualFireGroup.add(core);
        
        // Flames (Particle system)
        const flameGeo = new THREE.SphereGeometry(1.2, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const flames = [];
        for(let i=0; i<15; i++) {
            const f = new THREE.Mesh(flameGeo, flameMat.clone());
            f.position.set((Math.random()-0.5)*2.0, Math.random()*2.0, (Math.random()-0.5)*2.0);
            f.scale.setScalar(Math.random() * 0.5 + 0.5);
            visualFireGroup.add(f);
            flames.push(f);
        }
        
        // Warm lighting cast onto nearby walls/floor
        const fireLight = new THREE.PointLight(0xff7700, 4.0, 150);
        fireLight.position.set(0, 3, 0);
        visualFireGroup.add(fireLight);

        // Ground Horizontal Fire Ring (visualizes horizontal floor spread)
        const groundFireGeo = new THREE.RingGeometry(1.0, 2.4, 32);
        groundFireGeo.rotateX(-Math.PI / 2);
        const groundFireMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });
        const groundFire = new THREE.Mesh(groundFireGeo, groundFireMat);
        groundFire.position.set(0, -1.8, 0);
        visualFireGroup.add(groundFire);

        fireMesh.add(visualFireGroup);
        fireMesh.userData = { flames, core, fireLight, groundFire, time: Math.random() * 100 };
        this.scene.add(fireMesh);

        // M6: Create Smoke Effect (Invisible base mesh for radius logic)
        const smokeGeo = new THREE.SphereGeometry(3.0, 16, 16);
        const smokeBaseMat = new THREE.MeshBasicMaterial({ visible: false });
        const smokeMesh = new THREE.Mesh(smokeGeo, smokeBaseMat);
        smokeMesh.position.copy(position).add(new THREE.Vector3(0, 5, 0));
        
        // --- Realistic Visual Smoke ---
        const visualSmokeGroup = new THREE.Group();
        const smokePGeo = new THREE.SphereGeometry(4.5, 16, 16);
        const smokePMat = new THREE.MeshLambertMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.10,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        const smokeParticles = [];
        for(let i=0; i<12; i++) {
            const sp = new THREE.Mesh(smokePGeo, smokePMat.clone());
            sp.position.set((Math.random()-0.5)*5.0, Math.random()*4.0, (Math.random()-0.5)*5.0);
            sp.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
            visualSmokeGroup.add(sp);
            smokeParticles.push(sp);
        }
        smokeMesh.add(visualSmokeGroup);
        smokeMesh.userData = { particles: smokeParticles, time: Math.random() * 100 };
        this.scene.add(smokeMesh);

        
        let maxScale = 50.0; // fallback safe limit
        if (typeof window !== 'undefined' && window.buildingData && window.buildingData.floors[floorIndex]) {
            const floor = window.buildingData.floors[floorIndex];
            if (floor.geometry && floor.geometry.walls && floor.geometry.walls.length > 0) {
                let minX = Infinity; let maxX = -Infinity; let minZ = Infinity; let maxZ = -Infinity;
                floor.geometry.walls.forEach(w => {
                    minX = Math.min(minX, w.x1, w.x2);
                    maxX = Math.max(maxX, w.x1, w.x2);
                    minZ = Math.min(minZ, w.z1, w.z2);
                    maxZ = Math.max(maxZ, w.z1, w.z2);
                });
                
                // Calculate max distance from clicked position to the floor's bounding box corners
                const corners = [
                    {x: minX, z: minZ}, {x: maxX, z: minZ},
                    {x: minX, z: maxZ}, {x: maxX, z: maxZ}
                ];
                
                let maxDist = 0;
                corners.forEach(c => {
                    const dx = c.x - position.x;
                    const dz = c.z - position.z;
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    if (dist > maxDist) maxDist = dist;
                });
                
                // Fire base radius is 2.0. To cover max distance, scale = maxDist / 2.0. Added +2 for padding.
                maxScale = (maxDist / 2.0) + 2.0; 
            }
        }
        
        this.activeFires.push({ mesh: fireMesh, smokeMesh: smokeMesh, floorIndex, maxScale, origin: position.clone() });
        
        console.log(`🔥 Fire ignited at floor ${floorIndex} [X: ${position.x.toFixed(1)}, Z: ${position.z.toFixed(1)}], MaxScale computed: ${maxScale.toFixed(2)}`);
    }

    // Extinguish and reset all active fires across 3D, VR, and AR
    clearFires() {
        if (this.activeFires && this.activeFires.length > 0) {
            this.activeFires.forEach(fireObj => {
                if (fireObj.mesh) {
                    this.scene.remove(fireObj.mesh);
                    if (fireObj.mesh.geometry) fireObj.mesh.geometry.dispose();
                    if (fireObj.mesh.material) {
                        if (Array.isArray(fireObj.mesh.material)) fireObj.mesh.material.forEach(m => m.dispose());
                        else fireObj.mesh.material.dispose();
                    }
                    while (fireObj.mesh.children.length > 0) {
                        const c = fireObj.mesh.children[0];
                        fireObj.mesh.remove(c);
                        if (c.geometry) c.geometry.dispose();
                        if (c.material) {
                            if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
                            else c.material.dispose();
                        }
                    }
                }
                if (fireObj.smokeMesh) {
                    this.scene.remove(fireObj.smokeMesh);
                    if (fireObj.smokeMesh.geometry) fireObj.smokeMesh.geometry.dispose();
                    if (fireObj.smokeMesh.material) {
                        if (Array.isArray(fireObj.smokeMesh.material)) fireObj.smokeMesh.material.forEach(m => m.dispose());
                        else fireObj.smokeMesh.material.dispose();
                    }
                    while (fireObj.smokeMesh.children.length > 0) {
                        const sc = fireObj.smokeMesh.children[0];
                        fireObj.smokeMesh.remove(sc);
                        if (sc.geometry) sc.geometry.dispose();
                        if (sc.material) {
                            if (Array.isArray(sc.material)) sc.material.forEach(m => m.dispose());
                            else sc.material.dispose();
                        }
                    }
                }
            });
            this.activeFires = [];
        }

        if (this.fireMeshMap) {
            this.fireMeshMap.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
                    else mesh.material.dispose();
                }
                this.scene.remove(mesh);
            });
            this.fireMeshMap.clear();
        }

        this.setAlarmStrobe(false);

        // Synchronize with VR and AR viewers
        if (typeof vrViewer !== 'undefined' && vrViewer && typeof vrViewer.syncFires === 'function') {
            vrViewer.syncFires([]);
        }
        if (typeof arViewer !== 'undefined' && arViewer && typeof arViewer.syncFires === 'function') {
            arViewer.syncFires([]);
        }

        // Silence audio fire alarms
        if (typeof window !== 'undefined' && window.fireAlarmSystem) {
            window.fireAlarmSystem.silenceAlarm();
        }

        console.log("🔥 All fires extinguished and reset.");
    }

    // Clear drawn 3D evacuation route lines
    clearRoute() {
        if (this.routeLine) {
            if (this.routeLine.geometry) this.routeLine.geometry.dispose();
            if (this.routeLine.material) {
                if (Array.isArray(this.routeLine.material)) this.routeLine.material.forEach(m => m.dispose());
                else this.routeLine.material.dispose();
            }
            this.scene.remove(this.routeLine);
            this.routeLine = null;
        }

        window.lastCalculatedRoutePoints = null;

        if (typeof vrViewer !== 'undefined' && vrViewer && typeof vrViewer.updateEvacuationRoute === 'function') {
            vrViewer.updateEvacuationRoute([]);
        }
        if (typeof arViewer !== 'undefined' && arViewer && typeof arViewer.updateEvacuationRoute === 'function') {
            arViewer.updateEvacuationRoute([]);
        }
    }



    // M6: Queryable Hazard Data
    getHazardStatus(position, floorIndex) {
        let bestHazard = {
            isAffected: false,
            hazardLevel: 'SAFE', // 'SAFE', 'MODERATE', 'HIGH', 'CRITICAL'
            smokeLevel: 0.0,
            fireDistance: Infinity,
            floorIndex: floorIndex
        };

        if (!this.activeFires || this.activeFires.length === 0) {
            return bestHazard;
        }

        this.activeFires.forEach(fireObj => {
            if (fireObj.floorIndex !== floorIndex) return; // Constrain to same floor

            const dx = position.x - fireObj.origin.x;
            const dz = position.z - fireObj.origin.z;
            const dist = Math.sqrt(dx*dx + dz*dz);

            // Calculate dynamic radius based on horizontal scale
            const fireRadius = 2.0 * fireObj.mesh.scale.x;
            const smokeRadius = 3.0 * fireObj.smokeMesh.scale.x;

            const isStairNode = position.type === 'staircase' || 
                                (position.id && position.id.toUpperCase().includes('STAIR'));

            // Staircases are enclosed vertical shafts protected by fire doors.
            // Room smoke across the floor does NOT compromise the staircase shaft.
            // Only direct flames or fire immediately outside the stair door threatens it.
            const effectiveFireRadius = fireRadius;
            const effectiveSmokeRadius = isStairNode ? Math.min(fireRadius + 4.0, smokeRadius * 0.3) : smokeRadius;

            let currentLevel = 'SAFE';
            let isAffected = false;
            let currentSmokeLevel = 0.0;

            if (dist <= effectiveFireRadius) {
                currentLevel = 'CRITICAL';
                isAffected = true;
                currentSmokeLevel = 1.0;
            } else if (dist <= effectiveSmokeRadius) {
                currentLevel = isStairNode ? 'MODERATE' : 'HIGH';
                isAffected = true;
                currentSmokeLevel = 0.6;
            } else if (dist <= effectiveSmokeRadius + 15.0) {
                currentLevel = 'MODERATE';
                isAffected = true;
                currentSmokeLevel = 0.25;
            }

            // Update bestHazard if this fire poses a greater threat
            if (currentLevel === 'CRITICAL' || 
               (currentLevel === 'HIGH' && bestHazard.hazardLevel !== 'CRITICAL') ||
               (currentLevel === 'MODERATE' && bestHazard.hazardLevel === 'SAFE')) {
                bestHazard.hazardLevel = currentLevel;
                bestHazard.isAffected = isAffected;
            }
            
            bestHazard.smokeLevel = Math.max(bestHazard.smokeLevel, currentSmokeLevel);
            bestHazard.fireDistance = Math.min(bestHazard.fireDistance, dist);
        });

        return bestHazard;
    }

    // M8: Real ML Integration
    async predictHazardStatusML(position, floorIndex) {
        if (typeof window === 'undefined' || typeof window.predictHazardWithML !== 'function') {
            return { error: "ML Bridge not available" };
        }

        let bestFeatures = {
            fire_distance: 100.0,
            smoke_distance: 100.0,
            fire_radius: 0.0,
            smoke_radius: 0.0,
            smoke_level: 0.0,
            fire_age: 0.0,
            floor_index: floorIndex,
            active_fires_count: this.activeFires ? this.activeFires.length : 0,
            local_fire_density: 0.0,
            is_inside_affected_region: 0
        };

        if (this.activeFires && this.activeFires.length > 0) {
            let minFireDist = Infinity;
            let minSmokeDist = Infinity;
            let maxFireRadius = 0;
            let maxSmokeRadius = 0;
            let maxSmokeLevel = 0;
            let isAffected = 0;
            let localDensity = 0.0;

            this.activeFires.forEach(fireObj => {
                if (fireObj.floorIndex !== floorIndex) return;
                
                const dx = position.x - fireObj.origin.x;
                const dz = position.z - fireObj.origin.z;
                const dist = Math.sqrt(dx*dx + dz*dz);
                
                const fireRad = 2.0 * fireObj.mesh.scale.x;
                const smokeRad = 3.0 * fireObj.smokeMesh.scale.x;
                
                let currentSmokeLevel = 0.0;
                if (dist <= fireRad) {
                    currentSmokeLevel = 1.0;
                    isAffected = 1;
                } else if (dist <= smokeRad) {
                    currentSmokeLevel = 0.75;
                    isAffected = 1;
                } else if (dist <= smokeRad + 20.0) {
                    currentSmokeLevel = 0.3;
                    isAffected = 1;
                }

                if (dist < minFireDist) {
                    minFireDist = dist;
                    maxFireRadius = fireRad;
                    maxSmokeRadius = smokeRad;
                    minSmokeDist = Math.max(0, dist - fireRad);
                }
                if (currentSmokeLevel > maxSmokeLevel) {
                    maxSmokeLevel = currentSmokeLevel;
                }
                
                if (dist < 50.0) localDensity += 1.0;
            });

            if (minFireDist !== Infinity) {
                bestFeatures.fire_distance = minFireDist;
                bestFeatures.smoke_distance = minSmokeDist;
                bestFeatures.fire_radius = maxFireRadius;
                bestFeatures.smoke_radius = maxSmokeRadius;
                bestFeatures.smoke_level = maxSmokeLevel;
                bestFeatures.is_inside_affected_region = isAffected;
                bestFeatures.local_fire_density = localDensity;
                bestFeatures.fire_age = maxFireRadius * 10;
            }
        }

        try {
            const result = await window.predictHazardWithML(bestFeatures);
            console.log("M8 Electron -> Python ML Output:", JSON.stringify(result));
            return result;
        } catch (e) {
            console.error("ML Prediction Error:", e);
            return { error: e.message };
        }
    }

    drawRoute(nodeIds) {
        if (this.routeLine) {
            if (this.routeLine.geometry) this.routeLine.geometry.dispose();
            if (this.routeLine.material) this.routeLine.material.dispose();
            this.scene.remove(this.routeLine);
            this.routeLine = null;
        }

        if (!nodeIds || nodeIds.length === 0) return;

        const bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        const isDescent = (typeof this.targetFloorLevel === 'string' && this.targetFloorLevel.startsWith('descent'));
        const isSingleFloor = (this.targetFloorLevel !== null && this.targetFloorLevel !== undefined && !isDescent);
        const targetLevelNum = isSingleFloor ? Number(this.targetFloorLevel) : null;

        const rawPoints = [];
        nodeIds.forEach(id => {
            let pt = null;
            let nodeFloorLevel = null;

            if (bData && bData.floors) {
                for (let f = 0; f < bData.floors.length; f++) {
                    const fl = bData.floors[f];
                    if (fl.nodes) {
                        const n = fl.nodes.find(item => item && item.id === id);
                        if (n) {
                            nodeFloorLevel = Number(fl.level);
                            const y = isSingleFloor ? 2.0 : ((fl.elevation !== undefined ? fl.elevation : (f * 12)) + 2.0);
                            pt = new THREE.Vector3(n.x, y, n.z);
                            break;
                        }
                    }
                }
            }

            if (!pt && this.nodeMeshMap.has(id)) {
                const mesh = this.nodeMeshMap.get(id);
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                pt = worldPos.add(new THREE.Vector3(0, 1.8, 0));
            }

            if (pt) {
                // In single-floor mode, only plot nodes for this floor (or adjacent stair connectors)
                if (isSingleFloor) {
                    if (nodeFloorLevel === targetLevelNum) {
                        rawPoints.push(pt);
                    }
                } else {
                    rawPoints.push(pt);
                }
            }
        });

        if (rawPoints.length < 2) return;

        // Smoothly interpolate stair flights between floors in multi-floor building view
        const points = [];
        for (let i = 0; i < rawPoints.length; i++) {
            const p1 = rawPoints[i];
            points.push(p1.clone());

            if (!isSingleFloor && i < rawPoints.length - 1) {
                const p2 = rawPoints[i + 1];
                const dy = p2.y - p1.y;
                if (Math.abs(dy) > 1.5) {
                    const steps = Math.max(4, Math.ceil(Math.abs(dy) * 1.5));
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

        if (points.length < 2) return;

        // Use TubeGeometry to create a thick, neon-glowing 3D route tube
        const path = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0); // tension 0 for straight physical paths
        const geometry = new THREE.TubeGeometry(path, Math.max(30, points.length * 6), 0.8, 8, false);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff88, 
            emissive: 0x00ff88,
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.95,
            roughness: 0.1,
            metalness: 0.2,
            depthTest: false // Ensures route remains visible through slabs and partitions
        });

        this.lastRouteNodeIds = nodeIds;
        this.routeLine = new THREE.Mesh(geometry, material);
        this.routeLine.renderOrder = 999;
        this.scene.add(this.routeLine);
    }

    // Procedurally generate realistic 3D architectural building models from blueprint data
    buildFromData(buildingData, targetFloorLevel = null) {
        this.targetFloorLevel = (targetFloorLevel === 'all' || targetFloorLevel === '' || targetFloorLevel === undefined) ? null : targetFloorLevel;
        if (!this.buildingGroup) return;

        // Clear existing building geometry and dispose resources
        while (this.buildingGroup.children.length > 0) {
            const child = this.buildingGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
            this.buildingGroup.remove(child);
        }
        this.nodeMeshMap.clear();
        this.stairFloorMap.clear();

        // Clear active fire meshes if any
        if (this.fireMeshMap) {
            this.fireMeshMap.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                this.scene.remove(mesh);
            });
            this.fireMeshMap.clear();
        }

        // Clear route line if any
        if (this.routeLine) {
            if (this.routeLine.geometry) this.routeLine.geometry.dispose();
            if (this.routeLine.material) this.routeLine.material.dispose();
            this.scene.remove(this.routeLine);
            this.routeLine = null;
        }

        if (!buildingData || !buildingData.floors) return;

        const isDescentMode = (typeof this.targetFloorLevel === 'string' && this.targetFloorLevel.startsWith('descent'));
        let descentMaxLevel = null;
        if (isDescentMode) {
            const parts = this.targetFloorLevel.split('-');
            descentMaxLevel = parts.length > 1 ? parseInt(parts[1], 10) : 5;
        }

        const isAll = (this.targetFloorLevel === null || this.targetFloorLevel === undefined || this.targetFloorLevel === 'all');
        const targetLevelNum = (!isAll && !isDescentMode) ? Number(this.targetFloorLevel) : null;

        buildingData.floors.forEach((floor, floorIndex) => {
            console.log(`[ThreeDViewer] Processing floorIndex: ${floorIndex}, level: ${floor.level}`);
            console.log(`[ThreeDViewer] targetFloorLevel is: ${this.targetFloorLevel} (targetLevelNum: ${targetLevelNum}, isDescentMode: ${isDescentMode})`);

            // Mode 1: Individual Floor View (Only render the selected target floor)
            if (targetLevelNum !== null && Number(floor.level) !== targetLevelNum) {
                console.log(`[ThreeDViewer] Skipping floor level ${floor.level} because target is ${targetLevelNum}`);
                return;
            }

            // Mode 2: Descent Mode (Render floors from descentMaxLevel down to Ground floor; omit upper floors that obstruct view)
            if (isDescentMode && Number(floor.level) > descentMaxLevel) {
                console.log(`[ThreeDViewer] Skipping floor level ${floor.level} above descent starting floor ${descentMaxLevel}`);
                return;
            }

            console.log(`[ThreeDViewer] Rendering floor level ${floor.level} (${floor.name})`);

            const floorHeight = floor.wallHeight || 5.0;
            // Center individual floor at ground level, otherwise stack them at true elevations
            const yOffset = targetLevelNum !== null ? 0 : (floor.elevation !== undefined ? floor.elevation : (floorIndex * 12));
            console.log(`[ThreeDViewer] Set yOffset to ${yOffset}`);

            // Compute bounding box of this floor to size slab appropriately
            let minX = -80, maxX = 80, minZ = -35, maxZ = 35;
            if (floor.geometry && floor.geometry.walls && floor.geometry.walls.length > 0) {
                minX = Infinity; maxX = -Infinity; minZ = Infinity; maxZ = -Infinity;
                floor.geometry.walls.forEach(w => {
                    minX = Math.min(minX, w.x1, w.x2);
                    maxX = Math.max(maxX, w.x1, w.x2);
                    minZ = Math.min(minZ, w.z1, w.z2);
                    maxZ = Math.max(maxZ, w.z1, w.z2);
                });
            }
            const slabWidth = Math.max(160, (maxX - minX) + 10);
            const slabDepth = Math.max(70, (maxZ - minZ) + 10);
            const slabCenterX = (minX + maxX) / 2;
            const slabCenterZ = (minZ + maxZ) / 2;

            // 1. Create Base Floor Slab with translucent architectural glass in multi-floor descent mode
            const slabGeo = new THREE.BoxGeometry(slabWidth, 0.4, slabDepth);
            const slabMat = new THREE.MeshStandardMaterial({
                color: Number(floor.level) === 0 ? 0x1f2937 : 0x334155,
                roughness: 0.4,
                metalness: 0.1,
                transparent: (targetLevelNum === null || isDescentMode),
                opacity: isDescentMode ? 0.35 : (targetLevelNum === null ? 0.35 : 1.0)
            });
            const slabMesh = new THREE.Mesh(slabGeo, slabMat);
            slabMesh.position.set(slabCenterX, yOffset, slabCenterZ);
            slabMesh.receiveShadow = true;
            slabMesh.userData = { floorIndex };
            this.buildingGroup.add(slabMesh);

            if (!floor.geometry) return;

            const isTransparent = (targetLevelNum === null || isDescentMode);
            const wallMatExterior = new THREE.MeshStandardMaterial({ 
                color: 0x94a3b8, 
                roughness: 0.5,
                metalness: 0.2,
                transparent: isTransparent,
                opacity: isDescentMode ? 0.40 : (targetLevelNum === null ? 0.6 : 1.0)
            });
            const wallMatInterior = new THREE.MeshStandardMaterial({ 
                color: 0xe2e8f0, 
                roughness: 0.8,
                metalness: 0.05,
                transparent: isTransparent,
                opacity: isDescentMode ? 0.45 : (targetLevelNum === null ? 0.6 : 1.0)
            });

            // 2. Generate Walls and mathematically slice Doors/Windows
            if (floor.geometry.walls) {
                floor.geometry.walls.forEach(wall => {
                    const material = wall.type === 'exterior' ? wallMatExterior : wallMatInterior;
                    const wThickness = wall.thickness || 0.5;
                    const wHeight = floorHeight;

                    const dx = wall.x2 - wall.x1;
                    const dz = wall.z2 - wall.z1;
                    const wallLength = Math.hypot(dx, dz);
                    const angle = Math.atan2(dz, dx);

                    // Find doors and windows for this specific wall
                    const doors = (floor.geometry.doors || []).filter(d => d.wallId === wall.id);
                    const windows = (floor.geometry.windows || []).filter(w => w.wallId === wall.id);

                    // Convert doors/windows to 1D cut segments along the wall length
                    let cuts = [];
                    doors.forEach(d => {
                        const dist = Math.hypot(d.x - wall.x1, d.z - wall.z1);
                        cuts.push({ start: dist - d.width / 2, end: dist + d.width / 2, type: 'door' });
                    });
                    windows.forEach(w => {
                        const dist = Math.hypot(w.x - wall.x1, w.z - wall.z1);
                        cuts.push({ start: dist - w.width / 2, end: dist + w.width / 2, type: 'window', sill: w.sillHeight || 1.0, height: w.height || 1.5 });
                    });

                    // Sort cuts left-to-right along the wall
                    cuts.sort((a, b) => a.start - b.start);

                    let currentPos = 0;

                    // Helper to build a solid block of wall
                    const buildSolid = (start, end) => {
                        if (end <= start) return;
                        const segLength = end - start;
                        const centerX = wall.x1 + (dx / wallLength) * (start + segLength / 2);
                        const centerZ = wall.z1 + (dz / wallLength) * (start + segLength / 2);

                        const geo = new THREE.BoxGeometry(segLength, wHeight, wThickness);
                        const mesh = new THREE.Mesh(geo, material);
                        mesh.position.set(centerX, yOffset + 0.4 + wHeight / 2, centerZ);
                        mesh.rotation.y = -angle; // ThreeJS rotation is counter-clockwise
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        mesh.userData = { floorIndex };
                        this.buildingGroup.add(mesh);
                    };

                    // Build wall segments interlaced with cuts
                    cuts.forEach(cut => {
                        if (cut.start > currentPos) {
                            buildSolid(currentPos, cut.start);
                        }

                        const segLength = cut.end - cut.start;
                        const centerX = wall.x1 + (dx / wallLength) * (cut.start + segLength / 2);
                        const centerZ = wall.z1 + (dz / wallLength) * (cut.start + segLength / 2);

                        if (cut.type === 'window') {
                            // Bottom piece (sill)
                            const sillGeo = new THREE.BoxGeometry(segLength, cut.sill, wThickness);
                            const sillMesh = new THREE.Mesh(sillGeo, material);
                            sillMesh.position.set(centerX, yOffset + 0.4 + cut.sill / 2, centerZ);
                            sillMesh.rotation.y = -angle;
                            sillMesh.castShadow = true;
                            sillMesh.receiveShadow = true;
                            sillMesh.userData = { floorIndex };
                            this.buildingGroup.add(sillMesh);

                            // Top piece (above window)
                            const topHeight = wHeight - (cut.sill + cut.height);
                            if (topHeight > 0) {
                                const topGeo = new THREE.BoxGeometry(segLength, topHeight, wThickness);
                                const topMesh = new THREE.Mesh(topGeo, material);
                                topMesh.position.set(centerX, yOffset + 0.4 + cut.sill + cut.height + topHeight / 2, centerZ);
                                topMesh.rotation.y = -angle;
                                topMesh.castShadow = true;
                                topMesh.receiveShadow = true;
                                topMesh.userData = { floorIndex };
                                this.buildingGroup.add(topMesh);
                            }
                            
                            // Glass Pane
                            const glassGeo = new THREE.BoxGeometry(segLength, cut.height, wThickness * 0.2);
                            const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.9 });
                            const glassMesh = new THREE.Mesh(glassGeo, glassMat);
                            glassMesh.position.set(centerX, yOffset + 0.4 + cut.sill + cut.height / 2, centerZ);
                            glassMesh.rotation.y = -angle;
                            glassMesh.userData = { floorIndex };
                            this.buildingGroup.add(glassMesh);

                        } else if (cut.type === 'door') {
                            // Door Frame and Top Piece
                            const doorHeight = 4.0; // standard door height
                            const topHeight = wHeight - doorHeight;
                            
                            if (topHeight > 0) {
                                const topGeo = new THREE.BoxGeometry(segLength, topHeight, wThickness);
                                const topMesh = new THREE.Mesh(topGeo, material);
                                topMesh.position.set(centerX, yOffset + 0.4 + doorHeight + topHeight / 2, centerZ);
                                topMesh.rotation.y = -angle;
                                topMesh.castShadow = true;
                                topMesh.receiveShadow = true;
                                topMesh.userData = { floorIndex };
                                this.buildingGroup.add(topMesh);
                            }
                            
                            // Subtle Door Frame / Header
                            const frameGeo = new THREE.BoxGeometry(segLength, 0.2, wThickness * 1.2);
                            const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
                            const frameMesh = new THREE.Mesh(frameGeo, frameMat);
                            frameMesh.position.set(centerX, yOffset + 0.4 + doorHeight - 0.1, centerZ);
                            frameMesh.rotation.y = -angle;
                            frameMesh.castShadow = true;
                            frameMesh.userData = { floorIndex };
                            this.buildingGroup.add(frameMesh);
                            
                            // Simple Exit Sign Glow above Door
                            const signGeo = new THREE.BoxGeometry(1.0, 0.4, wThickness * 1.3);
                            const signMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00cc00, emissiveIntensity: 1.5 });
                            const signMesh = new THREE.Mesh(signGeo, signMat);
                            signMesh.position.set(centerX, yOffset + 0.4 + doorHeight + 0.4, centerZ);
                            signMesh.rotation.y = -angle;
                            signMesh.userData = { floorIndex };
                            this.buildingGroup.add(signMesh);
                        }

                        currentPos = Math.max(currentPos, cut.end);
                    });

                    // Build final solid segment to the end of the wall
                    if (currentPos < wallLength) {
                        buildSolid(currentPos, wallLength);
                    }
                });
            }

            // Render Realistic & Illuminated Staircases for Multi-Floor Evacuation
            if (floor.geometry.stairs) {
                floor.geometry.stairs.forEach(stair => {
                    const stepsCount = 12;
                    const stepHeight = 0.42;
                    const stepDepth = stair.depth / stepsCount;
                    
                    const stairGroup = new THREE.Group();
                    stairGroup.userData = { floorIndex, floorLevel: Number(floor.level) };
                    const stepMeshes = [];
                    const glowMeshes = [];

                    // Base stair tread material
                    const stepBaseMat = new THREE.MeshStandardMaterial({ 
                        color: 0x1e293b, 
                        roughness: 0.6,
                        metalness: 0.2
                    });

                    // Illuminated neon step edge strip for safe evacuation visibility
                    const treadGlowMat = new THREE.MeshStandardMaterial({
                        color: 0x06b6d4,
                        emissive: 0x0284c7,
                        emissiveIntensity: 1.2,
                        roughness: 0.2
                    });

                    for(let i=0; i<stepsCount; i++) {
                        // Main step riser/body
                        const stepGeo = new THREE.BoxGeometry(stair.width, stepHeight * (i+1), stepDepth);
                        const stepMesh = new THREE.Mesh(stepGeo, stepBaseMat);
                        stepMesh.position.set(0, (stepHeight * (i+1)) / 2, -stair.depth/2 + (i * stepDepth) + stepDepth/2);
                        stepMesh.castShadow = true;
                        stepMesh.receiveShadow = true;
                        stepMesh.userData = { floorIndex };
                        stairGroup.add(stepMesh);
                        stepMeshes.push(stepMesh);

                        // Illuminated neon nosing / edge strip on each tread
                        const edgeGeo = new THREE.BoxGeometry(stair.width, 0.08, 0.35);
                        const edgeMesh = new THREE.Mesh(edgeGeo, treadGlowMat.clone());
                        edgeMesh.position.set(0, stepHeight * (i+1) + 0.04, -stair.depth/2 + (i * stepDepth) + stepDepth - 0.18);
                        stairGroup.add(edgeMesh);
                        glowMeshes.push(edgeMesh);
                    }
                    stairGroup.position.set(stair.x, yOffset + 0.4, stair.z);
                    
                    // Glowing Neon Handrails
                    const railGeo = new THREE.BoxGeometry(0.12, 1.5, stair.depth);
                    const railMat = new THREE.MeshStandardMaterial({ 
                        color: 0x38bdf8, 
                        emissive: 0x0284c7,
                        emissiveIntensity: 1.5,
                        metalness: 0.8 
                    });
                    const railL = new THREE.Mesh(railGeo, railMat.clone());
                    railL.position.set(-stair.width/2 + 0.2, 1.5, 0);
                    railL.userData = { floorIndex };
                    const railR = new THREE.Mesh(railGeo, railMat.clone());
                    railR.position.set(stair.width/2 - 0.2, 1.5, 0);
                    railR.userData = { floorIndex };
                    stairGroup.add(railL);
                    stairGroup.add(railR);

                    // Vertical Stairwell Shaft Framing Pillars (connecting to floor below)
                    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8);
                    const pillarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
                    const pCorners = [
                        [-stair.width/2, -stair.depth/2],
                        [stair.width/2, -stair.depth/2],
                        [-stair.width/2, stair.depth/2],
                        [stair.width/2, stair.depth/2]
                    ];
                    pCorners.forEach(([cx, cz]) => {
                        const pil = new THREE.Mesh(pillarGeo, pillarMat);
                        pil.position.set(cx, 2.5, cz);
                        stairGroup.add(pil);
                    });

                    // 3D Floating Floor Landing Text Badge above stairs
                    let badgeSprite = null;
                    let badgeCanvas = null;
                    let badgeCtx = null;
                    let badgeTex = null;
                    if (typeof document !== 'undefined') {
                        badgeCanvas = document.createElement('canvas');
                        badgeCanvas.width = 256;
                        badgeCanvas.height = 64;
                        badgeCtx = badgeCanvas.getContext('2d');
                        badgeCtx.fillStyle = 'rgba(15, 23, 42, 0.90)';
                        if (typeof badgeCtx.roundRect === 'function') {
                            badgeCtx.roundRect(4, 4, 248, 56, 12);
                            badgeCtx.fill();
                            badgeCtx.strokeStyle = '#06b6d4';
                            badgeCtx.lineWidth = 3;
                            badgeCtx.roundRect(4, 4, 248, 56, 12);
                            badgeCtx.stroke();
                        } else {
                            badgeCtx.fillRect(4, 4, 248, 56);
                            badgeCtx.strokeStyle = '#06b6d4';
                            badgeCtx.lineWidth = 3;
                            badgeCtx.strokeRect(4, 4, 248, 56);
                        }
                        badgeCtx.fillStyle = '#38bdf8';
                        badgeCtx.font = 'bold 22px sans-serif';
                        badgeCtx.textAlign = 'center';
                        badgeCtx.textBaseline = 'middle';
                        const flLabel = Number(floor.level) === 0 ? 'GROUND EXIT' : `LEVEL ${floor.level} STAIRS`;
                        badgeCtx.fillText(flLabel, 128, 32);

                        badgeTex = new THREE.CanvasTexture(badgeCanvas);
                        const badgeMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true, opacity: 0.95 });
                        badgeSprite = new THREE.Sprite(badgeMat);
                        badgeSprite.scale.set(6.0, 1.5, 1.0);
                        badgeSprite.position.set(0, 6.2, 0);
                        stairGroup.add(badgeSprite);
                    }

                    this.buildingGroup.add(stairGroup);
                    this.stairFloorMap.set(Number(floor.level), {
                        group: stairGroup,
                        stepMeshes: stepMeshes,
                        glowMeshes: glowMeshes,
                        rails: [railL, railR],
                        badgeSprite: badgeSprite,
                        canvas: badgeCanvas,
                        ctx: badgeCtx,
                        texture: badgeTex,
                        floorLevel: Number(floor.level)
                    });
                });
            }

            // Render Lift Footprints
            if (floor.geometry.lifts) {
                const liftMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
                floor.geometry.lifts.forEach(lift => {
                    const liftGeo = new THREE.BoxGeometry(lift.width, floorHeight, lift.depth);
                    const liftMesh = new THREE.Mesh(liftGeo, liftMat);
                    liftMesh.position.set(lift.x, yOffset + 0.4 + floorHeight / 2, lift.z);
                    liftMesh.castShadow = true;
                    liftMesh.receiveShadow = true;
                    liftMesh.userData = { floorIndex };
                    this.buildingGroup.add(liftMesh);
                });
            }

            // 3. Place Semantic Nodes (Navigation/Labels only)
            if (floor.nodes) {
                floor.nodes.forEach(node => {
                    if (!node) return; // Defensive handling for invalid/null data
                    
                    const nodeGroup = new THREE.Group();
                    nodeGroup.position.set(node.x, yOffset + 0.5, node.z);
                    nodeGroup.userData = { id: node.id, name: node.name, type: node.type, floorIndex };

                    // Differentiate color by type
                    let color = 0x3b82f6; // default blue (room)
                    if (node.type === 'exit') color = 0x22c55e; // green
                    else if (node.type === 'staircase') color = 0xeab308; // yellow
                    else if (node.type === 'corridor') color = 0xa855f7; // purple

                    // Simple minimal marker for semantic node
                    const markerGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
                    const markerMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
                    const marker = new THREE.Mesh(markerGeo, markerMat);
                    marker.userData = { floorIndex };
                    nodeGroup.add(marker);

                    this.buildingGroup.add(nodeGroup);
                    this.nodeMeshMap.set(node.id, marker);
                });
            }

            // 4. Place Door/Opening Markers (M2 Visualization)
            if (floor.geometry && floor.geometry.doors) {
                floor.geometry.doors.forEach(door => {
                    const doorMarkerGeo = new THREE.BoxGeometry(door.width, 0.2, 0.5);
                    const doorMarkerMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.6 }); // orange
                    const doorMarker = new THREE.Mesh(doorMarkerGeo, doorMarkerMat);
                    doorMarker.position.set(door.x, yOffset + 0.3, door.z);
                    doorMarker.userData = { floorIndex };
                    this.buildingGroup.add(doorMarker);
                });
            }
        });

        // 4. Update visibility & position of active fires for this floor view
        if (this.activeFires && this.activeFires.length > 0) {
            this.activeFires.forEach(f => {
                const isAll = (targetLevelNum === null);
                const isThisFloor = isAll || (Number(f.floorIndex) === targetLevelNum);

                if (f.mesh) {
                    f.mesh.visible = isThisFloor;
                    if (!isAll) {
                        f.mesh.position.set(f.origin.x, 2, f.origin.z);
                    } else {
                        const elev = (buildingData.floors[f.floorIndex] && buildingData.floors[f.floorIndex].elevation !== undefined)
                            ? buildingData.floors[f.floorIndex].elevation : (f.floorIndex * 12);
                        f.mesh.position.set(f.origin.x, elev + 2, f.origin.z);
                    }
                }
                if (f.smokeMesh) {
                    f.smokeMesh.visible = isThisFloor;
                    if (!isAll) {
                        f.smokeMesh.position.set(f.origin.x, 5, f.origin.z);
                    } else {
                        const elev = (buildingData.floors[f.floorIndex] && buildingData.floors[f.floorIndex].elevation !== undefined)
                            ? buildingData.floors[f.floorIndex].elevation : (f.floorIndex * 12);
                        f.smokeMesh.position.set(f.origin.x, elev + 5, f.origin.z);
                    }
                }
            });
        }

        // 5. Position Camera
        this.frameBuilding(targetLevelNum);

        // 6. Restore Route if available
        if (this.lastRouteNodeIds && this.lastRouteNodeIds.length > 0) {
            this.drawRoute(this.lastRouteNodeIds);
        }
    }

    // Frame the building or a specific floor cleanly in the viewport
    frameBuilding(targetFloorLevel = null) {
        if (!this.controls || !this.camera) return;

        const isDescent = (typeof targetFloorLevel === 'string' && targetFloorLevel.startsWith('descent')) ||
                          (typeof this.targetFloorLevel === 'string' && this.targetFloorLevel.startsWith('descent'));
        if (isDescent) {
            const lvlStr = (typeof targetFloorLevel === 'string' && targetFloorLevel.startsWith('descent'))
                ? targetFloorLevel : this.targetFloorLevel;
            const maxF = parseInt(lvlStr.split('-')[1], 10) || 5;
            this.frameStairDescent(maxF, 0);
            return;
        }

        const targetLevelNum = (targetFloorLevel !== null && targetFloorLevel !== undefined && targetFloorLevel !== 'all')
            ? Number(targetFloorLevel)
            : null;

        if (targetLevelNum !== null) {
            // Frame a single floor footprint
            this.controls.target.set(0, 0, 0);
            this.camera.position.set(0, 95, 65);
            this.camera.lookAt(0, 0, 0);
            this.controls.update();
            return;
        }

        // Full 8-floor building view
        // Dimensions: Width ~160 (X: -80 to 80), Height ~45 (Y: 0 to 45), Depth ~70 (Z: -35 to 35)
        // Center: (0, 18, 0)
        const center = new THREE.Vector3(0, 18, 0);
        this.controls.target.copy(center);
        
        // Position camera to view the complete building, large and filling ~75% of viewport
        this.camera.position.set(0, 65, 120);
        this.camera.lookAt(center);
        this.controls.update();
    }

    // Frame the multi-level vertical stairwell cascade from upper floor down to Ground floor exit
    frameStairDescent(fromFloor = 5, toFloor = 0) {
        if (!this.controls || !this.camera) return;
        const bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        let topElev = 30;
        if (bData && bData.floors && bData.floors[fromFloor]) {
            topElev = bData.floors[fromFloor].elevation !== undefined ? bData.floors[fromFloor].elevation : (fromFloor * 12);
        }
        const midY = (topElev + 0) / 2;
        // Stairwell column is centered around (-6.5, midY, 18)
        this.controls.target.set(-6.5, midY, 18);
        // Position camera high and offset for clean diagonal perspective showing all flights descending
        this.camera.position.set(-42, topElev + 18, 58);
        this.camera.lookAt(-6.5, midY, 18);
        this.controls.update();
    }

    // Reveal 4th, 3rd, 2nd, 1st, and Ground floor stairs and structure when evacuating from upper floor
    revealDescendingFloors(fromFloor = 5, toFloor = 0) {
        const bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (!bData) return;
        const targetStr = `descent-${fromFloor}`;
        this.targetFloorLevel = targetStr;
        this.buildFromData(bData, targetStr);
        this.frameStairDescent(fromFloor, toFloor);

        // Update badge
        const badge = document.getElementById("threeDViewBadge");
        if (badge) {
            const fromName = fromFloor === 0 ? "GROUND" : `${fromFloor}TH`;
            badge.textContent = `STAIRWAY EVACUATION • FLOORS ${fromName} ➔ GROUND EXIT VISIBLE`;
        }
        console.log(`🪜 Revealed descending stairs from Floor ${fromFloor} down to Ground floor.`);
    }

    // Real-time highlight for stair descent: active flight pulses cyan/gold, cleared flights turn emerald green
    updateStairDescentHighlight(activeFloor, clearedFloors = []) {
        if (!this.stairFloorMap) return;

        this.stairFloorMap.forEach((stairData, flLevel) => {
            const isCleared = clearedFloors && clearedFloors.includes(flLevel);
            const isActive = (flLevel === activeFloor);

            let treadColor = 0x0ea5e9;
            let emissiveColor = 0x0284c7;
            let emissiveIntensity = 1.0;
            let badgeText = flLevel === 0 ? "GROUND EXIT" : `LEVEL ${flLevel} STAIRS`;
            let badgeBg = "rgba(15, 23, 42, 0.90)";
            let badgeBorder = "#06b6d4";
            let badgeTextColor = "#38bdf8";

            if (isCleared) {
                treadColor = 0x10b981;
                emissiveColor = 0x059669;
                emissiveIntensity = 2.0;
                badgeText = flLevel === 0 ? "🎉 SAFELY EVACUATED" : `✓ LEVEL ${flLevel} CLEARED`;
                badgeBorder = "#10b981";
                badgeTextColor = "#4ade80";
            } else if (isActive) {
                treadColor = 0xfacc15;
                emissiveColor = 0xeab308;
                emissiveIntensity = 2.8;
                badgeText = flLevel === 0 ? "🛡️ EXIT REACHED" : `🏃 LEVEL ${flLevel} DESCENDING`;
                badgeBorder = "#facc15";
                badgeTextColor = "#fef08a";
            }

            // Update glowing nosing strips
            if (stairData.glowMeshes) {
                stairData.glowMeshes.forEach(mesh => {
                    if (mesh.material) {
                        mesh.material.color.setHex(treadColor);
                        mesh.material.emissive.setHex(emissiveColor);
                        mesh.material.emissiveIntensity = emissiveIntensity;
                    }
                });
            }

            // Update handrails
            if (stairData.rails) {
                stairData.rails.forEach(rail => {
                    if (rail.material) {
                        rail.material.color.setHex(isActive ? 0xfacc15 : (isCleared ? 0x10b981 : 0x38bdf8));
                        rail.material.emissive.setHex(emissiveColor);
                        rail.material.emissiveIntensity = emissiveIntensity;
                    }
                });
            }

            // Update floating 3D landing badge canvas & texture
            if (stairData.ctx && stairData.canvas && stairData.texture) {
                const ctx = stairData.ctx;
                ctx.clearRect(0, 0, 256, 64);
                ctx.fillStyle = badgeBg;
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(4, 4, 248, 56, 12);
                    ctx.fill();
                    ctx.strokeStyle = badgeBorder;
                    ctx.lineWidth = 3;
                    ctx.roundRect(4, 4, 248, 56, 12);
                    ctx.stroke();
                } else {
                    ctx.fillRect(4, 4, 248, 56);
                    ctx.strokeStyle = badgeBorder;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(4, 4, 248, 56);
                }
                ctx.fillStyle = badgeTextColor;
                ctx.font = "bold 20px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(badgeText, 128, 32);
                stairData.texture.needsUpdate = true;
            }
        });
    }

    renderFire(nodeId) {
        const targetMesh = this.nodeMeshMap.get(nodeId);
        if (!targetMesh) return;

        if (!this.fireMeshMap.has(nodeId)) {
            const fireGeo = new THREE.SphereGeometry(4.5, 16, 16);
            const fireMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true });
            const fireMesh = new THREE.Mesh(fireGeo, fireMat);

            // Get world position of node marker
            const worldPos = new THREE.Vector3();
            targetMesh.getWorldPosition(worldPos);
            fireMesh.position.copy(worldPos).add(new THREE.Vector3(0, 3, 0));

            this.scene.add(fireMesh);
            this.fireMeshMap.set(nodeId, fireMesh);
        }
    }


}

// Global class to be instantiated in renderer.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = ThreeDViewer;
}

// M8 Test Helper
window.runM8Tests = async () => {
    const viewer = typeof threeDViewer !== 'undefined' ? threeDViewer : window.threeDViewer;
    if (!viewer) return console.error("threeDViewer not found");
    const oldFires = viewer.activeFires ? [...viewer.activeFires] : [];
    
    console.log("=== RUNNING M8 TESTS ===");
    
    // Test A: No Fire
    viewer.activeFires = [];
    console.log("Test A: No fire / no smoke");
    await viewer.predictHazardStatusML({x: 0, y: 0, z: 0}, 0);

    // Test B: Far Fire
    viewer.activeFires = [{floorIndex: 0, origin: {x:100, y:0, z:100}, mesh: {scale: {x: 2}}, smokeMesh: {scale: {x: 2}}}];
    console.log("Test B: Far from fire/smoke");
    await viewer.predictHazardStatusML({x: 0, y: 0, z: 0}, 0);

    // Test C: Moderate Smoke
    viewer.activeFires = [{floorIndex: 0, origin: {x:15, y:0, z:15}, mesh: {scale: {x: 3}}, smokeMesh: {scale: {x: 5}}}];
    console.log("Test C: Moderate smoke exposure");
    await viewer.predictHazardStatusML({x: 0, y: 0, z: 0}, 0);

    // Test D: Close Fire
    viewer.activeFires = [{floorIndex: 0, origin: {x:2, y:0, z:2}, mesh: {scale: {x: 4}}, smokeMesh: {scale: {x: 6}}}];
    console.log("Test D: Close to active fire");
    await viewer.predictHazardStatusML({x: 0, y: 0, z: 0}, 0);

    // Test E: Multiple Fires
    viewer.activeFires = [
        {floorIndex: 0, origin: {x:5, y:0, z:5}, mesh: {scale: {x: 4}}, smokeMesh: {scale: {x: 6}}},
        {floorIndex: 0, origin: {x:10, y:0, z:10}, mesh: {scale: {x: 3}}, smokeMesh: {scale: {x: 5}}}
    ];
    console.log("Test E: Multiple nearby fires");
    await viewer.predictHazardStatusML({x: 0, y: 0, z: 0}, 0);
    
    viewer.activeFires = oldFires; // reset
    console.log("=== M8 TESTS COMPLETE ===");
};
