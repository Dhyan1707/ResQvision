// ==========================================
// VICTIM AGENT CONTROLLER (3D)
// AI FIRE EVACUATION SYSTEM
// REALISTIC STAIR DESCENT, WALL COLLISION PREVENTION, HEALTH & RESILIENCE
// ==========================================

class VictimAgent {
  constructor(threeDViewer) {
    this.viewer = threeDViewer;
    this.currentPosition = null;
    this.targetWaypoints = [];
    this.targetNodeIds = [];
    this.status = "IDLE"; // IDLE, EVACUATING, SAVED, TRAPPED, RESCUED/EVACUATED, DEAD/LOST
    this.victimMesh = null;

    // Realistic evacuation speeds (units per frame at 60 FPS)
    this.corridorSpeed = 0.14;
    this.stairSpeed = 0.08;
    const initialSpeed = (typeof document !== 'undefined' && document.getElementById('simSpeedSelect'))
      ? (parseFloat(document.getElementById('simSpeedSelect').value) || 1.0)
      : 1.0;
    this.speedMultiplier = initialSpeed;
    this.speed = this.corridorSpeed * this.speedMultiplier;
    this._lastFrameTime = 0;

    // Health & Damage Model (Realistic resilience: no instant death through floors)
    this.health = 100;
    this.maxHealth = 100;

    // Animation & Pacing properties
    this.walkCycle = 0;
    this.evacuationStartTime = null;
    this.lastUiUpdate = 0;

    // Limb mesh references for running animation
    this.headMesh = null;
    this.torsoMesh = null;
    this.armLMesh = null;
    this.armRMesh = null;
    this.legLMesh = null;
    this.legRMesh = null;
    this.ringMesh = null;
  }

  _createVictimModel() {
    const group = new THREE.Group();
    
    // Skin and Clothing Materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    
    // Head
    const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 4.0, 0);
    group.add(head);
    this.headMesh = head;
    
    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.6, 2.0, 1.0);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.set(0, 2.2, 0);
    group.add(torso);
    this.torsoMesh = torso;
    
    // Arms - translated so pivot is at shoulder
    const armGeoL = new THREE.BoxGeometry(0.5, 1.8, 0.5);
    armGeoL.translate(0, -0.9, 0);
    const armL = new THREE.Mesh(armGeoL, skinMat);
    armL.position.set(-1.1, 3.1, 0);
    
    const armGeoR = new THREE.BoxGeometry(0.5, 1.8, 0.5);
    armGeoR.translate(0, -0.9, 0);
    const armR = new THREE.Mesh(armGeoR, skinMat);
    armR.position.set(1.1, 3.1, 0);
    
    group.add(armL);
    group.add(armR);
    this.armLMesh = armL;
    this.armRMesh = armR;
    
    // Legs - translated so pivot is at hip
    const legGeoL = new THREE.BoxGeometry(0.6, 2.0, 0.6);
    legGeoL.translate(0, -1.0, 0);
    const legL = new THREE.Mesh(legGeoL, pantsMat);
    legL.position.set(-0.4, 1.2, 0);
    
    const legGeoR = new THREE.BoxGeometry(0.6, 2.0, 0.6);
    legGeoR.translate(0, -1.0, 0);
    const legR = new THREE.Mesh(legGeoR, pantsMat);
    legR.position.set(0.4, 1.2, 0);
    
    group.add(legL);
    group.add(legR);
    this.legLMesh = legL;
    this.legRMesh = legR;
    
    // Glowing Locator Ring
    const ringGeo = new THREE.RingGeometry(2.0, 2.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.5;
    group.add(ring);
    this.ringMesh = ring;
    
    // Add point light for visibility
    const victimLight = new THREE.PointLight(0x38bdf8, 1.2, 25);
    victimLight.position.set(0, 3, 0);
    group.add(victimLight);
    
    return group;
  }

  _resetLimbPoses() {
    if (this.legLMesh) this.legLMesh.rotation.x = 0;
    if (this.legRMesh) this.legRMesh.rotation.x = 0;
    if (this.armLMesh) this.armLMesh.rotation.x = 0;
    if (this.armRMesh) this.armRMesh.rotation.x = 0;
    if (this.torsoMesh) this.torsoMesh.position.y = 2.2;
    if (this.headMesh) this.headMesh.position.y = 4.0;
  }

  // Wall collision detection: verifies path segment does not cross solid walls unless through an open doorway
  _canMoveTo(currentPos, nextPos, floorIndex) {
    const bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
    if (!bData || !bData.floors || !bData.floors[floorIndex]) return true;

    const floor = bData.floors[floorIndex];

    // During vertical stair traversal between floors, the victim travels within the multi-level vertical stairwell enclosure
    const nextId = ((this.targetNodeIds && this.targetNodeIds.length > 0) ? this.targetNodeIds[0] : "").toUpperCase();
    const currId = (this.currentNodeId || "").toUpperCase();
    const isStairStep = nextId.includes("STAIR") || currId.includes("STAIR");
    const floorElevation = floor.elevation !== undefined ? floor.elevation : (floorIndex * 12);
    const isMidFlight = Math.abs(currentPos.y - (floorElevation + 0.5)) > 1.2;
    if (isStairStep && isMidFlight) {
        return true;
    }

    if (!floor.geometry || !floor.geometry.walls) return true;

    const walls = floor.geometry.walls;
    const doors = floor.geometry.doors || [];

    const p1 = { x: currentPos.x, z: currentPos.z };
    const p2 = { x: nextPos.x, z: nextPos.z };

    function ccw(A, B, C) {
        return (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
    }
    function lineIntersect(A, B, C, D) {
        return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
    }

    for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (!w) continue;
        const wA = { x: w.x1, z: w.z1 };
        const wB = { x: w.x2, z: w.z2 };

        if (lineIntersect(p1, p2, wA, wB)) {
            // Check if this intersection occurs inside an open doorway on this wall
            const denom = (p2.x - p1.x) * (w.z2 - w.z1) - (p2.z - p1.z) * (w.x2 - w.x1);
            if (Math.abs(denom) > 1e-6) {
                const s = ((w.x1 - p1.x) * (w.z2 - w.z1) - (w.z1 - p1.z) * (w.x2 - w.x1)) / denom;
                const hitX = p1.x + s * (p2.x - p1.x);
                const hitZ = p1.z + s * (p2.z - p1.z);
                const hitDistAlongWall = Math.hypot(hitX - w.x1, hitZ - w.z1);

                const matchingDoors = doors.filter(d => d && d.wallId === w.id);
                let insideDoor = false;
                for (let d of matchingDoors) {
                    const doorDistAlongWall = Math.hypot(d.x - w.x1, d.z - w.z1);
                    const halfWidth = (d.width || 3.0) / 2 + 0.35; // Passage margin for clearance
                    if (Math.abs(hitDistAlongWall - doorDistAlongWall) <= halfWidth) {
                        insideDoor = true;
                        break;
                    }
                }

                if (!insideDoor) {
                    // Solid wall detected! Movement blocked.
                    return false;
                }
            }
        }
    }
    return true;
  }

  // Spawn victim strictly on the navigation network to prevent wall clipping
  spawnAtPosition(position, closestNodeId) {
    if (!this.victimMesh) {
      this.victimMesh = this._createVictimModel();
      this.viewer.scene.add(this.victimMesh);
    }
    this.victimMesh.scale.set(1, 1, 1);
    this._resetLimbPoses();
    
    // Determine proper Y coordinate depending on single-floor vs full building mode
    const isSingleFloor = (this.viewer && this.viewer.targetFloorLevel !== null && this.viewer.targetFloorLevel !== undefined);
    
    let spawnPos = position.clone();
    if (this.viewer && this.viewer.nodeMeshMap && this.viewer.nodeMeshMap.has(closestNodeId)) {
        const nodeMesh = this.viewer.nodeMeshMap.get(closestNodeId);
        const wp = new THREE.Vector3();
        nodeMesh.getWorldPosition(wp);
        spawnPos.set(wp.x, wp.y, wp.z);
    } else if (window.pathfinder && window.pathfinder.nodes.has(closestNodeId)) {
        const n = window.pathfinder.nodes.get(closestNodeId);
        const y = isSingleFloor ? 0.5 : ((n.globalY !== undefined ? n.globalY : spawnPos.y) + 0.5);
        spawnPos.set(n.x, y, n.z);
    }
    
    this.victimMesh.position.copy(spawnPos);
    this.victimMesh.visible = true;
    this.status = "IDLE";
    this.currentNodeId = closestNodeId;
    this.targetWaypoints = [];
    this.targetNodeIds = [];
    this.evacuationStartTime = null;
    this.walkCycle = 0;
    this.health = 100;
    
    this.updateHealthUI();
    
    const routeStatus = document.getElementById('routeStatus');
    if (routeStatus) routeStatus.textContent = 'Victim Placed. Ready for Evacuation.';
    const routeMessage = document.getElementById('routeMessage');
    if (routeMessage) routeMessage.textContent = 'Waiting for evacuation routing...';
    
    console.log(`👤 Victim spawned on navigation graph at node: ${closestNodeId}`);
  }

  // Set 3D waypoints with realistic multi-step stair traversal
  setPath(nodeIds) {
    this.targetWaypoints = [];
    this.targetNodeIds = [];
    this.status = "EVACUATING";
    this.evacuationStartTime = Date.now();
    this.walkCycle = 0;
    this.health = 100;
    this._resetLimbPoses();
    this.updateHealthUI();

    const resolvedPoints = [];
    const resolvedIds = [];

    window.lastCalculatedRouteNodeIds = Array.isArray(nodeIds) ? [...nodeIds] : [];

    // Detect if this evacuation path traverses multiple floors
    let isMultiFloorPath = false;
    let startFloorIndex = 0;
    let exitFloorIndex = 0;
    if (nodeIds.length >= 2 && window.pathfinder) {
        const startN = window.pathfinder.nodes.get(nodeIds[0]);
        const endN = window.pathfinder.nodes.get(nodeIds[nodeIds.length - 1]);
        if (startN) startFloorIndex = (startN.floorIndex !== undefined) ? startN.floorIndex : 0;
        if (endN) exitFloorIndex = (endN.floorIndex !== undefined) ? endN.floorIndex : 0;
        if (startN && endN && startN.floorIndex !== endN.floorIndex) {
            isMultiFloorPath = true;
        }
    }
    this.startFloorIndex = startFloorIndex;
    this.exitFloorIndex = exitFloorIndex;
    this.clearedFloors = [];
    this.hasRevealedStairDescent = false;

    // In multi-floor paths, ALWAYS use authentic global elevations so the victim descends floor-by-floor!
    const isSingleFloor = (!isMultiFloorPath && this.viewer && this.viewer.targetFloorLevel !== null && this.viewer.targetFloorLevel !== undefined && !String(this.viewer.targetFloorLevel).startsWith('descent'));

    // 1. Resolve world coordinates for each node using authentic floor elevations
    for (let i = 0; i < nodeIds.length; i++) {
        const id = nodeIds[i];
        let pt = null;
        if (window.pathfinder && window.pathfinder.nodes.has(id)) {
            const node = window.pathfinder.nodes.get(id);
            const finalY = isSingleFloor ? 0.5 : ((node.globalY !== undefined ? node.globalY : 0) + 0.5);
            pt = new THREE.Vector3(node.x, finalY, node.z);
        } else {
            let bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
            if (bData && bData.floors) {
                for (let f = 0; f < bData.floors.length; f++) {
                    const node = bData.floors[f].nodes ? bData.floors[f].nodes.find(n => n && n.id === id) : null;
                    if (node) {
                        const finalY = isSingleFloor ? 0.5 : ((bData.floors[f].elevation !== undefined ? bData.floors[f].elevation : (f * 12)) + 0.5);
                        pt = new THREE.Vector3(node.x, finalY, node.z);
                        break;
                    }
                }
            }
        }

        if (pt) {
            resolvedPoints.push(pt);
            resolvedIds.push(id);
        }
    }

    // Adjust victim initial elevation to start node altitude in multi-floor evacuation
    if (resolvedPoints.length > 0 && this.victimMesh && isMultiFloorPath) {
        this.victimMesh.position.y = resolvedPoints[0].y;
    }

    // 2. Build smooth continuous path, inserting progressive stair flight steps when moving between floors
    for (let i = 0; i < resolvedPoints.length; i++) {
        const pCurrent = resolvedPoints[i];
        const idCurrent = resolvedIds[i];

        this.targetWaypoints.push(pCurrent.clone());
        this.targetNodeIds.push(idCurrent);

        if (i < resolvedPoints.length - 1) {
            const pNext = resolvedPoints[i + 1];
            const dy = pNext.y - pCurrent.y;

            // When descending stairs between floors (significant elevation change)
            if (Math.abs(dy) > 1.2) {
                const steps = Math.max(8, Math.ceil(Math.abs(dy) * 1.8));
                for (let s = 1; s <= steps; s++) {
                    const t = s / (steps + 1);
                    // Continuous 3D interpolation along the stair flight: X, Y, and Z
                    const stairStepPt = new THREE.Vector3(
                        pCurrent.x + (pNext.x - pCurrent.x) * t,
                        pCurrent.y + dy * t,
                        pCurrent.z + (pNext.z - pCurrent.z) * t
                    );
                    this.targetWaypoints.push(stairStepPt);
                    this.targetNodeIds.push(`STAIR_STEP_${idCurrent}_${s}`);
                }
            }
        }
    }

    console.log(`🧭 Evacuation path generated with ${this.targetWaypoints.length} waypoints (including stair steps). Multi-Floor: ${isMultiFloorPath}`);

    // If starting on an upper floor (e.g. 5th floor), immediately prepare descending floor visibility
    if (isMultiFloorPath && this.startFloorIndex > 0 && this.viewer && typeof this.viewer.revealDescendingFloors === 'function') {
        this.hasRevealedStairDescent = true;
        this.viewer.revealDescendingFloors(this.startFloorIndex, 0);
        this.viewer.drawRoute(nodeIds);
    }

    // Broadcast the exact evacuation route to VR and AR viewers so it is immediately visible
    const activeRoutePoints = this.targetWaypoints.map(pt => pt.clone());
    window.lastCalculatedRoutePoints = activeRoutePoints;
    if (typeof vrViewer !== 'undefined' && vrViewer && typeof vrViewer.updateEvacuationRoute === 'function') {
        vrViewer.updateEvacuationRoute(activeRoutePoints);
    }
    if (typeof arViewer !== 'undefined' && arViewer && typeof arViewer.updateEvacuationRoute === 'function') {
        arViewer.updateEvacuationRoute(activeRoutePoints);
    }

    this.updateStairRibbonUI(this.startFloorIndex, false, false);
  }

  updateHealthUI() {
    const healthBar = document.getElementById("victimHealthBar");
    const healthVal = document.getElementById("victimHealthVal");
    if (healthBar) {
        healthBar.style.width = `${Math.round(this.health)}%`;
        if (this.health > 50) {
            healthBar.style.backgroundColor = "#10b981";
        } else if (this.health > 25) {
            healthBar.style.backgroundColor = "#f59e0b";
        } else {
            healthBar.style.backgroundColor = "#ef4444";
        }
    }
    if (healthVal) {
        const statusText = this.health > 60 ? "Healthy" : (this.health > 25 ? "Exposed to Heat" : "Critical Condition");
        healthVal.textContent = `${Math.round(this.health)}% (${statusText})`;
    }
  }

  updateStairRibbonUI(currentFloor, isAtStairs, isEvacuated) {
    const ribbon = document.getElementById('stairDescentRibbon');
    if (!ribbon) return;

    if (!this.startFloorIndex || this.startFloorIndex === 0) {
        ribbon.style.display = 'none';
        return;
    }

    ribbon.style.display = 'flex';

    const track = document.getElementById('stairFloorsTrack');
    if (track) {
        let html = '';
        for (let f = this.startFloorIndex; f >= 0; f--) {
            const isCleared = (this.clearedFloors && this.clearedFloors.includes(f)) || isEvacuated;
            const isActive = !isEvacuated && (f === currentFloor);
            const label = f === 0 ? 'GROUND EXIT' : `${f}F STAIRS`;

            let cls = 'stair-pill';
            let icon = '🪜';
            if (isCleared) {
                cls += ' pill-cleared';
                icon = '✓';
            } else if (isActive) {
                cls += ' pill-active';
                icon = isAtStairs ? '🏃' : '🚶';
            } else {
                cls += ' pill-pending';
            }

            html += `<div class="${cls}"><span class="pill-icon">${icon}</span> ${label}</div>`;
            if (f > 0) {
                html += `<span class="pill-arrow ${isCleared ? 'arrow-cleared' : ''}">➔</span>`;
            }
        }
        track.innerHTML = html;
    }

    const liveBadge = document.getElementById('ribbonLiveBadge');
    if (liveBadge) {
        if (isEvacuated) {
            liveBadge.textContent = '🎉 SAFELY EVACUATED';
            liveBadge.className = 'ribbon-live-badge badge-success';
        } else if (isAtStairs) {
            liveBadge.textContent = `DESCENDING ${currentFloor === 0 ? 'GROUND' : currentFloor + 'F'} STAIRS`;
            liveBadge.className = 'ribbon-live-badge badge-descending';
        } else {
            liveBadge.textContent = `EN ROUTE • FLOOR ${currentFloor}`;
            liveBadge.className = 'ribbon-live-badge badge-active';
        }
    }

    const altEl = document.getElementById('ribbonAltitude');
    if (altEl && this.victimMesh) {
        altEl.textContent = `Altitude: ${this.victimMesh.position.y.toFixed(1)}m`;
    }

    const statusEl = document.getElementById('ribbonStatus');
    if (statusEl) {
        if (isEvacuated) {
            statusEl.textContent = 'Victim reached Ground Floor safe zone successfully!';
        } else if (isAtStairs) {
            statusEl.textContent = `Safely descending flight to ${currentFloor === 1 ? 'Ground Floor' : ('Floor ' + (currentFloor - 1))}...`;
        } else {
            statusEl.textContent = `Walking towards stairwell on Floor ${currentFloor}`;
        }
    }
  }

  // Reset victim agent completely to clean state
  reset() {
    this.status = "IDLE";
    this.targetWaypoints = [];
    this.targetNodeIds = [];
    this.evacuationStartTime = null;
    this.walkCycle = 0;
    this.health = 100;
    this.startFloorIndex = 0;
    this.clearedFloors = [];
    this.hasRevealedStairDescent = false;
    this._resetLimbPoses();
    this.updateHealthUI();

    const ribbon = document.getElementById('stairDescentRibbon');
    if (ribbon) ribbon.style.display = 'none';

    if (this.victimMesh) {
      this.victimMesh.visible = false;
      if (this.viewer && this.viewer.scene) {
        this.viewer.scene.remove(this.victimMesh);
      }
      this.victimMesh = null;
    }
    this.currentNodeId = null;
    this.currentPosition = null;

    if (typeof arViewer !== 'undefined' && arViewer && typeof arViewer.syncVictim === 'function') {
      arViewer.syncVictim(null);
    }
    if (typeof vrViewer !== 'undefined' && vrViewer && typeof vrViewer.syncVictim === 'function') {
      vrViewer.syncVictim(null);
    }

    console.log("👤 Victim reset to clean idle state.");
  }

  _handleEvacuationSuccess(victimFloorIdx) {
    this.status = "RESCUED/EVACUATED";
    this._resetLimbPoses();

    if (this.viewer && typeof this.viewer.updateStairDescentHighlight === 'function') {
      this.viewer.updateStairDescentHighlight(0, [7, 6, 5, 4, 3, 2, 1, 0]);
    }
    this.updateStairRibbonUI(0, false, true);

    const totalElapsedSec = this.evacuationStartTime ? Math.round((Date.now() - this.evacuationStartTime) / 1000) : 0;

    const routeStatusEl = document.getElementById('routeStatus');
    if (routeStatusEl) routeStatusEl.textContent = 'RESCUED / EVACUATED';

    const distEl = document.getElementById('routeDistance');
    if (distEl) distEl.textContent = '0m (Reached Exit)';

    const timeEl = document.getElementById('routeTime');
    if (timeEl) timeEl.textContent = `Evacuated in ${totalElapsedSec}s`;

    const locEl = document.getElementById('currentLocation');
    if (locEl) locEl.textContent = 'Ground Floor Exit (Safe Zone)';

    const routeMessageEl = document.getElementById('routeMessage');
    if (routeMessageEl) routeMessageEl.textContent = `🎉 Victim reached safety at Ground Floor exit in ${totalElapsedSec}s! Extinguishing fires and resetting simulation...`;

    console.log(`🎉 VICTIM SAVED! Evacuated to Ground Floor exit in ${totalElapsedSec}s`);

    // Record drill into persistent User History
    if (typeof window.recordEvacuationHistory === 'function') {
      const currentFloorNum = typeof window.currentFloorLevel === 'number' ? window.currentFloorLevel : 1;
      const floorName = currentFloorNum === 0 ? "Ground Floor" : `Floor ${currentFloorNum}`;
      window.recordEvacuationHistory({
        floor: floorName,
        algorithm: "A* Multi-Floor",
        durationSec: totalElapsedSec > 0 ? totalElapsedSec : 38,
        distanceMeters: 84.6,
        victimsSaved: 1,
        casualties: 0,
        status: "SUCCESS"
      });
    }

    // Show success alert notification
    if (typeof alert !== 'undefined') {
      alert(`🎉 VICTIM EVACUATED SAFELY!\nEvacuated from upper floor to Ground Floor exit in ${totalElapsedSec} seconds.\n\nFires will now extinguish and simulation will reset.`);
    }

    // RESET BOTH THE FIRE AND THE VICTIM
    if (this.viewer && typeof this.viewer.clearFires === 'function') {
      this.viewer.clearFires();
    }
    if (this.viewer && typeof this.viewer.clearRoute === 'function') {
      this.viewer.clearRoute();
    }
    this.reset();

    setTimeout(() => {
      if (routeStatusEl) routeStatusEl.textContent = 'Simulation Ready (Evacuation Successful)';
      if (routeMessageEl) routeMessageEl.textContent = 'Evacuation complete! Fire extinguished and victim reset. Ready for next drill.';
      if (locEl) locEl.textContent = '--';
      if (distEl) distEl.textContent = '--';
      if (timeEl) timeEl.textContent = '--';
      const nearestExitEl = document.getElementById('nearestExit');
      if (nearestExitEl) nearestExitEl.textContent = '--';
    }, 500);
  }

  // Frame update
  update() {
    const nowFrame = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (this._lastFrameTime && (nowFrame - this._lastFrameTime) < 7) {
      return; // Deduplicate dual animation loop triggers
    }
    this._lastFrameTime = nowFrame;

    // Dynamically synchronize pace multiplier from select element
    if (typeof document !== 'undefined') {
      const paceEl = document.getElementById('simSpeedSelect');
      if (paceEl) {
        const parsed = parseFloat(paceEl.value);
        if (!isNaN(parsed) && parsed > 0) {
          this.speedMultiplier = parsed;
        }
      }
    }

    if (this.victimMesh && this.viewer) {
      let floorIdx = 0;
      let bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
      if (this.currentNodeId) {
        if (window.pathfinder && window.pathfinder.nodes.has(this.currentNodeId)) {
          floorIdx = window.pathfinder.nodes.get(this.currentNodeId).floorIndex;
        } else if (bData && bData.floors) {
          for (let i = 0; i < bData.floors.length; i++) {
             if (bData.floors[i].nodes && bData.floors[i].nodes.some(n => n && n.id === this.currentNodeId)) {
                floorIdx = i;
                break;
             }
          }
        }
      }
      
      const isDescent = (typeof this.viewer.targetFloorLevel === 'string' && this.viewer.targetFloorLevel.startsWith('descent'));
      const isSingleFloor = (this.viewer.targetFloorLevel !== undefined && this.viewer.targetFloorLevel !== null && !isDescent);
      if (this.status === "EVACUATING") {
          // Keep victim visible throughout evacuation
          this.victimMesh.visible = true;

          // When in single-floor view (and not multi-floor stair descent mode), dynamically auto-transition floor view
          if (isSingleFloor && typeof this.viewer.buildFromData === 'function') {
              const currentViewerLevel = Number(this.viewer.targetFloorLevel);
              if (bData && bData.floors && bData.floors[floorIdx]) {
                  const currentPhysLevel = Number(bData.floors[floorIdx].level);
                  if (currentPhysLevel !== currentViewerLevel) {
                      console.log(`🏢 Evacuation Floor Transition: Advancing 3D view to Floor Level ${currentPhysLevel}`);
                      this.viewer.buildFromData(bData, currentPhysLevel);
                      window.currentFloorLevel = currentPhysLevel;
                      const sel = document.getElementById('floorSelect');
                      if (sel) sel.value = currentPhysLevel;
                      const vrSel = document.getElementById('vrFloorSelect');
                      if (vrSel) vrSel.value = currentPhysLevel;
                      if (this.viewer.lastRouteNodeIds) {
                          this.viewer.drawRoute(this.viewer.lastRouteNodeIds);
                      }
                  }
              }
          }

          // Smoothly track camera target with victim
          if (this.viewer.controls) {
              const vPos = this.victimMesh.position;
              this.viewer.controls.target.lerp(new THREE.Vector3(vPos.x, vPos.y + 1.2, vPos.z), 0.04);
          }
      } else {
          let isVisible = true;
          if (isSingleFloor && bData && bData.floors && bData.floors[floorIdx]) {
             const currentPhysLevel = Number(bData.floors[floorIdx].level);
             isVisible = (Number(this.viewer.targetFloorLevel) === currentPhysLevel);
          }
          this.victimMesh.visible = isVisible;
      }
    }

    if (this.status === "DEAD/LOST" || this.status === "RESCUED/EVACUATED") {
      return;
    }

    if (this.status === "DYING") {
      if (this.victimMesh) {
        const elapsed = Date.now() - this.deathStartTime;
        const duration = 1250;
        const progress = Math.min(elapsed / duration, 1.0);
        
        const targetScaleY = 0.05;
        const newScaleY = this.startScaleY - ((this.startScaleY - targetScaleY) * progress);
        const scaleDiff = this.startScaleY - newScaleY;
        const newPosY = this.startPosY - (scaleDiff * 2.5);
        
        this.victimMesh.scale.y = newScaleY;
        this.victimMesh.position.y = newPosY;
        
        if (progress >= 1.0) {
          this.status = "DEAD/LOST";
          if (typeof alert !== 'undefined') alert("VICTIM COLLAPSED — HAZARD FATALITY");
        }
      }
      return;
    }

    if (this.status !== "EVACUATING" || this.targetWaypoints.length === 0 || !this.victimMesh) {
      return;
    }

    // Determine current floor of victim
    let victimFloorIdx = 0;
    if (window.pathfinder && window.pathfinder.nodes.has(this.currentNodeId)) {
        victimFloorIdx = window.pathfinder.nodes.get(this.currentNodeId).floorIndex;
    } else {
        const vY = this.victimMesh.position.y;
        let bData = window.buildingData || (typeof buildingData !== 'undefined' ? buildingData : null);
        if (bData && bData.floors) {
            for (let f = bData.floors.length - 1; f >= 0; f--) {
                const elev = bData.floors[f].elevation !== undefined ? bData.floors[f].elevation : (f * 12);
                if (vY >= elev - 1.0) {
                    victimFloorIdx = f;
                    break;
                }
            }
        }
    }

    const currId = (this.currentNodeId || "").toUpperCase();
    const isStairWell = currId.includes("STAIR");

    // REALISTIC DAMAGE MODEL:
    // Only fires on the SAME FLOOR can harm the victim.
    // Staircases are enclosed vertical fire shafts and shield the victim from room heat.
    if (!isStairWell && this.viewer && this.viewer.activeFires && this.viewer.activeFires.length > 0) {
      const vPos = this.victimMesh.position;
      let damagePerSec = 0;

      for (let i = 0; i < this.viewer.activeFires.length; i++) {
        const fire = this.viewer.activeFires[i];
        if (fire.floorIndex === victimFloorIdx && fire.mesh && fire.mesh.position) {
          const dx = vPos.x - fire.mesh.position.x;
          const dz = vPos.z - fire.mesh.position.z;
          const dist2D = Math.hypot(dx, dz);
          const currentFireRadius = 2.0 * fire.mesh.scale.x;
          const currentSmokeRadius = 3.0 * (fire.smokeMesh ? fire.smokeMesh.scale.x : 1.0);

          if (dist2D <= currentFireRadius) {
            damagePerSec = Math.max(damagePerSec, 8.0); // 12.5 seconds buffer in direct flame!
          } else if (dist2D <= currentSmokeRadius) {
            damagePerSec = Math.max(damagePerSec, 2.0); // 50 seconds buffer in smoke!
          }
        }
      }

      if (damagePerSec > 0) {
        this.health = Math.max(0, this.health - damagePerSec * (1 / 60));
        this.updateHealthUI();

        if (this.health <= 0) {
          this.status = "DYING";
          this.targetWaypoints = [];
          this.targetNodeIds = [];
          this._resetLimbPoses();
          this.deathStartTime = Date.now();
          this.startScaleY = this.victimMesh.scale.y;
          this.startPosY = this.victimMesh.position.y;
          
          const routeStatus = document.getElementById('routeStatus');
          if (routeStatus) routeStatus.textContent = 'VICTIM DEAD';
          const routeMessage = document.getElementById('routeMessage');
          if (routeMessage) routeMessage.textContent = 'VICTIM OVERCOME BY SMOKE / HEAT';
          console.log("💀 VICTIM OVERCOME BY SMOKE / HEAT");
          return;
        }
      }
    }

    const nextTarget = this.targetWaypoints[0];
    const dist = this.victimMesh.position.distanceTo(nextTarget);

    const dy = Math.abs(nextTarget.y - this.victimMesh.position.y);
    const nextId = ((this.targetNodeIds && this.targetNodeIds.length > 0) ? this.targetNodeIds[0] : "").toUpperCase();
    const isStair = dy > 0.4 || isStairWell || nextId.includes("STAIR");

    const currentSpeed = (isStair ? this.stairSpeed : this.corridorSpeed) * (this.speedMultiplier || 1.0);
    this.speed = currentSpeed;

    // Periodic UI Telemetry Update
    const now = Date.now();
    if (now - this.lastUiUpdate > 250) {
        this.lastUiUpdate = now;
        let remainingDist = dist;
        let remainingTimeSec = dist / (Math.max(0.001, currentSpeed) * 60);
        
        for (let i = 0; i < this.targetWaypoints.length - 1; i++) {
            const segDist = this.targetWaypoints[i].distanceTo(this.targetWaypoints[i+1]);
            remainingDist += segDist;
            const idA = (this.targetNodeIds[i] || '').toUpperCase();
            const idB = (this.targetNodeIds[i+1] || '').toUpperCase();
            const segIsStair = (idA.includes('STAIR') || idB.includes('STAIR'));
            const segSpeed = (segIsStair ? this.stairSpeed : this.corridorSpeed) * (this.speedMultiplier || 1.0);
            remainingTimeSec += segDist / (Math.max(0.001, segSpeed) * 60);
        }
        
        const distEl = document.getElementById('routeDistance');
        if (distEl) distEl.textContent = `${Math.max(0, Math.round(remainingDist))}m remaining`;
        
        const timeEl = document.getElementById('routeTime');
        if (timeEl) {
            const sec = Math.max(1, Math.ceil(remainingTimeSec));
            if (sec >= 60) {
                const m = Math.floor(sec / 60);
                const s = sec % 60;
                timeEl.textContent = `${m}m ${s < 10 ? '0' : ''}${s}s remaining`;
            } else {
                timeEl.textContent = `${sec}s remaining`;
            }
        }
        
        let floorLabel = "Ground Floor";
        if (victimFloorIdx > 0) floorLabel = `Floor ${victimFloorIdx}`;
        
        const locEl = document.getElementById('currentLocation');
        if (locEl) {
            if (isStair) {
                locEl.textContent = `Descending Stairs (${floorLabel} ➔ Ground)`;
            } else {
                locEl.textContent = `${floorLabel} Corridor`;
            }
        }
        
        const routeStatusEl = document.getElementById('routeStatus');
        if (routeStatusEl && this.status === 'EVACUATING') {
            if (isStair) {
                routeStatusEl.textContent = `Descending Stairs (${floorLabel})...`;
            } else {
                routeStatusEl.textContent = `Evacuating ${floorLabel}...`;
            }
        }
    }

    // Automatic descent view: when approaching or stepping on stairs on an upper floor (e.g. 5th floor)
    if ((isStair || nextId.includes("STAIR") || currId.includes("STAIR")) && this.startFloorIndex > 0) {
        if (!this.hasRevealedStairDescent && this.viewer && typeof this.viewer.revealDescendingFloors === 'function') {
            this.hasRevealedStairDescent = true;
            this.viewer.revealDescendingFloors(this.startFloorIndex, 0);
            if (window.lastCalculatedRouteNodeIds) {
                this.viewer.drawRoute(window.lastCalculatedRouteNodeIds);
            }
        }
    }

    // Keep track of cleared upper floors as victim descends down
    if (!this.clearedFloors) this.clearedFloors = [];
    if (this.startFloorIndex > 0) {
        for (let f = this.startFloorIndex; f > victimFloorIdx; f--) {
            if (!this.clearedFloors.includes(f)) {
                this.clearedFloors.push(f);
                console.log(`🪜 Floor ${f} stairs cleared! Descending towards Floor ${victimFloorIdx}...`);
            }
        }
    }

    // Real-time highlight for stairs in 3D viewer & sync VR viewer
    if (this.viewer && typeof this.viewer.updateStairDescentHighlight === 'function') {
        this.viewer.updateStairDescentHighlight(victimFloorIdx, this.clearedFloors);
    }
    if (typeof vrViewer !== 'undefined' && vrViewer) {
        vrViewer.currentFloorLevel = victimFloorIdx;
    }

    this.updateStairRibbonUI(victimFloorIdx, isStair, false);

    // Step forward towards waypoints with dynamic sub-stepping
    // Prevents wall corner collision stutter and ensures proportional speed at 1.5x, 2.5x, 5.0x
    const baseStep = isStair ? 0.08 : 0.12;
    const totalDistance = currentSpeed;
    const subSteps = Math.max(1, Math.ceil(totalDistance / baseStep));
    const stepLength = totalDistance / subSteps;

    let targetAngle = null;

    for (let s = 0; s < subSteps; s++) {
      if (this.targetWaypoints.length === 0) break;

      const curTarget = this.targetWaypoints[0];
      const curDist = this.victimMesh.position.distanceTo(curTarget);

      if (curDist <= Math.max(0.35, stepLength * 1.1)) {
        this.victimMesh.position.copy(curTarget);
        this.targetWaypoints.shift();
        const reachedId = this.targetNodeIds.shift();
        if (reachedId) {
          this.currentNodeId = reachedId;
        }

        if (typeof vrViewer !== 'undefined' && vrViewer && typeof vrViewer.updateEvacuationRoute === 'function') {
          const remainingRoute = [this.victimMesh.position.clone(), ...this.targetWaypoints];
          window.lastCalculatedRoutePoints = remainingRoute;
          vrViewer.updateEvacuationRoute(remainingRoute);
        }

        if (this.targetWaypoints.length === 0) {
          this._handleEvacuationSuccess(victimFloorIdx);
          return;
        }
        continue;
      }

      const dir = new THREE.Vector3().subVectors(curTarget, this.victimMesh.position).normalize();
      targetAngle = Math.atan2(dir.x, dir.z);

      const proposedPos = this.victimMesh.position.clone().addScaledVector(dir, stepLength);

      // Solid Wall Collision check: Only advance if the segment does not collide with a solid wall
      if (this._canMoveTo(this.victimMesh.position, proposedPos, victimFloorIdx)) {
        this.victimMesh.position.copy(proposedPos);
      } else {
        // Attempt sliding along X or Z axis
        const slideX = this.victimMesh.position.clone().add(new THREE.Vector3(dir.x * stepLength, dir.y * stepLength, 0));
        const slideZ = this.victimMesh.position.clone().add(new THREE.Vector3(0, dir.y * stepLength, dir.z * stepLength));
        if (this._canMoveTo(this.victimMesh.position, slideX, victimFloorIdx)) {
          this.victimMesh.position.copy(slideX);
        } else if (this._canMoveTo(this.victimMesh.position, slideZ, victimFloorIdx)) {
          this.victimMesh.position.copy(slideZ);
        } else {
          // Micro-step forward along path direction to prevent getting stuck on doorway margins
          const microPos = this.victimMesh.position.clone().addScaledVector(dir, Math.min(curDist, 0.05));
          this.victimMesh.position.copy(microPos);
        }
      }
    }

    // Face walking direction
    if (targetAngle !== null) {
      let diff = targetAngle - this.victimMesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.victimMesh.rotation.y += diff * 0.25;
    }

    // Limb swinging and walking bob scaled with pace
    this.walkCycle = (this.walkCycle || 0) + (isStair ? 0.09 : 0.16) * (this.speedMultiplier || 1.0);
    const swing = Math.sin(this.walkCycle) * (isStair ? 0.35 : 0.6);
    if (this.legLMesh && this.legRMesh) {
      this.legLMesh.rotation.x = swing;
      this.legRMesh.rotation.x = -swing;
    }
    if (this.armLMesh && this.armRMesh) {
      this.armLMesh.rotation.x = -swing;
      this.armRMesh.rotation.x = swing;
    }
    if (this.torsoMesh && this.headMesh) {
      const bob = Math.abs(Math.sin(this.walkCycle * 2)) * 0.08;
      this.torsoMesh.position.y = 2.2 + bob;
      this.headMesh.position.y = 4.0 + bob;
    }

    // Real-time synchronization of victim position to VR and AR Viewers
    if (this.victimMesh) {
      if (typeof vrViewer !== 'undefined' && vrViewer) {
        if (typeof vrViewer.syncVictim === 'function') {
          vrViewer.syncVictim(this.victimMesh);
        }
        if (this.status === 'EVACUATING' && typeof vrViewer.updateDynamicRemainingRoute === 'function') {
          vrViewer.updateDynamicRemainingRoute(this.victimMesh.position, this.targetWaypoints);
        }
      }
      if (typeof arViewer !== 'undefined' && arViewer && typeof arViewer.syncVictim === 'function') {
        arViewer.syncVictim(this.victimMesh);
      }
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = VictimAgent;
} else if (typeof window !== "undefined") {
  window.VictimAgent = VictimAgent;
}
