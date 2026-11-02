// ==========================================
// ORBIT CONTROLS ADAPTER
// ==========================================
class OrbitControlsAdapter {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Configuration
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        this.moveSpeed = 2.0;
        
        // State
        this.target = new THREE.Vector3(0, 0, 0);
        this.spherical = new THREE.Spherical();
        this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
        
        // Mouse State
        this.isDragging = false;
        this.isPanning = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        // Keyboard State
        this.keys = {
            w: false, a: false, s: false, d: false, 
            q: false, e: false, 
            '+': false, '=': false, '-': false, '_': false
        };
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.domElement.addEventListener('contextmenu', e => e.preventDefault());
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
        
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    
    onMouseDown(e) {
        if (e.button === 0) this.isDragging = true;
        if (e.button === 2) this.isPanning = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
    
    onMouseMove(e) {
        if (!this.isDragging && !this.isPanning) return;
        
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        
        if (this.isDragging) {
            // Orbit
            this.spherical.theta -= deltaX * 0.01;
            this.spherical.phi -= deltaY * 0.01;
            // Constrain phi to avoid flipping
            this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
        } else if (this.isPanning) {
            // Pan
            const offset = new THREE.Vector3();
            
            // Pan local X (Right)
            const right = new THREE.Vector3().crossVectors(this.camera.up, this.camera.getWorldDirection(new THREE.Vector3()).negate()).normalize();
            offset.add(right.multiplyScalar(-deltaX * 0.5));
            
            // Pan local Z (Up/Down translated to XZ plane if desired, or real Y)
            const up = this.camera.up.clone();
            offset.add(up.multiplyScalar(deltaY * 0.5));
            
            this.target.add(offset);
            this.camera.position.add(offset);
        }
        
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
    
    onMouseUp(e) {
        if (e.button === 0) this.isDragging = false;
        if (e.button === 2) this.isPanning = false;
    }
    
    onMouseWheel(e) {
        this.spherical.radius += e.deltaY * 0.1;
        this.spherical.radius = Math.max(1, this.spherical.radius);
    }
    
    onKeyDown(e) {
        const key = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) this.keys[key] = true;
        if (key === 'r') this.reset();
    }
    
    onKeyUp(e) {
        const key = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) this.keys[key] = false;
    }
    
    reset() {
        this.target.set(0, 0, 0);
        this.camera.position.set(0, 150, 100);
        this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
    }
    
    update() {
        // Keyboard movement
        const forward = this.camera.getWorldDirection(new THREE.Vector3());
        forward.y = 0; 
        forward.normalize();
        
        const right = new THREE.Vector3().crossVectors(this.camera.up, forward).normalize();
        
        const move = new THREE.Vector3();
        
        if (this.keys.w) move.add(forward.clone().multiplyScalar(this.moveSpeed));
        if (this.keys.s) move.add(forward.clone().multiplyScalar(-this.moveSpeed));
        if (this.keys.a) move.add(right.clone().multiplyScalar(this.moveSpeed));
        if (this.keys.d) move.add(right.clone().multiplyScalar(-this.moveSpeed));
        
        // Q/E for vertical
        if (this.keys.q) move.y -= this.moveSpeed;
        if (this.keys.e) move.y += this.moveSpeed;
        
        if (move.lengthSq() > 0) {
            this.target.add(move);
            this.camera.position.add(move);
        }
        
        // Zooming with +/-
        if (this.keys['+'] || this.keys['=']) this.spherical.radius -= this.moveSpeed * 2;
        if (this.keys['-'] || this.keys['_']) this.spherical.radius += this.moveSpeed * 2;
        this.spherical.radius = Math.max(1, this.spherical.radius);
        
        // Apply spherical coordinates
        const offset = new THREE.Vector3().setFromSpherical(this.spherical);
        
        // Ensure camera position matches spherical distance from target
        const desiredPos = this.target.clone().add(offset);
        
        if (this.enableDamping) {
            this.camera.position.lerp(desiredPos, this.dampingFactor);
            // Recompute spherical based on damped position
            this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
        } else {
            this.camera.position.copy(desiredPos);
        }
        
        this.camera.lookAt(this.target);
    }
}

// Export for use in renderer
if (typeof module !== "undefined" && module.exports) {
    module.exports = OrbitControlsAdapter;
} else if (typeof window !== "undefined") {
    window.OrbitControlsAdapter = OrbitControlsAdapter;
    window.OrbitControls = OrbitControlsAdapter;
}
