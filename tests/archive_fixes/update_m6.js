const fs = require('fs');
let content = fs.readFileSync('src/renderer/js/ThreeDViewer.js', 'utf8');

// 1. Add smoke mesh in spawnFireAtPosition
const spawnFireCode = `        // Create an orange fire effect
        const geo = new THREE.SphereGeometry(2.0, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0xff5500, 
            emissive: 0xaa2200, 
            transparent: true, 
            opacity: 0.8 
        });
        const fireMesh = new THREE.Mesh(geo, mat);
        
        // Elevate slightly above floor slab
        fireMesh.position.copy(position).add(new THREE.Vector3(0, 2, 0));
        
        this.scene.add(fireMesh);

        // M6: Create Smoke Effect
        const smokeGeo = new THREE.SphereGeometry(3.0, 16, 16);
        const smokeMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.5
        });
        const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
        smokeMesh.position.copy(position).add(new THREE.Vector3(0, 5, 0)); // Smoke rises above fire
        this.scene.add(smokeMesh);
`;

content = content.replace(/        \/\/ Create an orange fire effect[\s\S]*?this\.scene\.add\(fireMesh\);/, spawnFireCode);

// 2. Add smokeMesh to activeFires
content = content.replace(/this\.activeFires\.push\(\{ mesh: fireMesh, floorIndex, maxScale \}\);/, `this.activeFires.push({ mesh: fireMesh, smokeMesh: smokeMesh, floorIndex, maxScale, origin: position.clone() });`);

// 3. Animate smokeMesh
const animateCode = `        // Basic Fire Spread logic
        this.activeFires.forEach(fireObj => {
            // Constrain spread dynamically based on floor bounds
            if (fireObj.mesh.scale.x < fireObj.maxScale) {
                fireObj.mesh.scale.addScalar(0.008);
                // Smoke spreads slightly faster and wider
                fireObj.smokeMesh.scale.addScalar(0.010);
                // Smoke rises slightly as it grows
                fireObj.smokeMesh.position.y += 0.01;
            }
        });`;

content = content.replace(/        \/\/ Basic Fire Spread logic[\s\S]*?\}\);/, animateCode);

// 4. Add getHazardStatus method
const hazardMethod = `

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

            // Calculate dynamic radius based on scale
            const fireRadius = 2.0 * fireObj.mesh.scale.x;
            const smokeRadius = 3.0 * fireObj.smokeMesh.scale.x;

            let currentLevel = 'SAFE';
            let isAffected = false;
            let currentSmokeLevel = 0.0;

            if (dist <= fireRadius) {
                currentLevel = 'CRITICAL';
                isAffected = true;
                currentSmokeLevel = 1.0;
            } else if (dist <= smokeRadius) {
                currentLevel = 'HIGH';
                isAffected = true;
                currentSmokeLevel = 0.75;
            } else if (dist <= smokeRadius + 20.0) {
                currentLevel = 'MODERATE';
                isAffected = true;
                currentSmokeLevel = 0.3;
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

    drawRoute(nodeIds) {`;

content = content.replace(/    drawRoute\(nodeIds\) \{/, hazardMethod);

fs.writeFileSync('src/renderer/js/ThreeDViewer.js', content);
console.log("Updated ThreeDViewer.js for M6 Smoke & Hazard");
