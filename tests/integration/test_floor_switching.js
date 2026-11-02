// ============================================================
// COMPREHENSIVE PROGRAMMATIC VERIFICATION: FLOOR SWITCHING
// Tests every floor Level 0 through Level 5
// ============================================================

const fs = require('fs');
const path = require('path');
const THREE = require('three');

// 1. Load buildingData
const buildingData = require('./src/models/buildingData.js');

console.log("=".repeat(70));
console.log("TEST SUITE: FLOOR SWITCHING VERIFICATION (LEVEL 0 - LEVEL 5)");
console.log("=".repeat(70));

let allTestsPassed = true;
function assert(condition, message) {
    if (!condition) {
        console.error(`  ❌ FAILED: ${message}`);
        allTestsPassed = false;
    } else {
        console.log(`  ✅ PASSED: ${message}`);
    }
}

// ------------------------------------------------------------
// TEST 1: Verify Levels 0-5 remain intact in buildingData
// ------------------------------------------------------------
console.log("\n[TEST 1] Verifying buildingData Levels 0-5 integrity...");
assert(Array.isArray(buildingData.floors), "buildingData.floors is an array");
assert(buildingData.floors.length === 6, `buildingData.floors has 6 floors (found: ${buildingData.floors.length})`);

const expectedFloors = [
    { level: 0, name: "Ground Floor", walls: 45, stairs: 3, lifts: 2, nodes: 16 },
    { level: 1, name: "First Floor", walls: 17, stairs: 3, lifts: 4, nodes: 30 },
    { level: 2, name: "Second Floor", walls: 41, stairs: 3, lifts: 4, nodes: 0 },
    { level: 3, name: "Third Floor", walls: 43, stairs: 3, lifts: 4, nodes: 27 },
    { level: 4, name: "Fourth Floor", walls: 44, stairs: 3, lifts: 4, nodes: 0 },
    { level: 5, name: "Fifth Floor", walls: 50, stairs: 3, lifts: 4, nodes: 0 }
];

expectedFloors.forEach((exp, idx) => {
    const floor = buildingData.floors[idx];
    assert(floor && floor.level === exp.level, `Floor [${idx}] has level === ${exp.level}`);
    assert(floor && floor.name === exp.name, `Floor [${idx}] has name === "${exp.name}"`);
    assert(floor && floor.geometry && floor.geometry.walls.length === exp.walls, `Floor [${idx}] geometry.walls count === ${exp.walls}`);
    assert(floor && floor.geometry && floor.geometry.stairs.length === exp.stairs, `Floor [${idx}] geometry.stairs count === ${exp.stairs}`);
    assert(floor && floor.geometry && floor.geometry.lifts.length === exp.lifts, `Floor [${idx}] geometry.lifts count === ${exp.lifts}`);
    assert(floor && (!exp.nodes || (floor.nodes && floor.nodes.length === exp.nodes)), `Floor [${idx}] nodes count matches expectation`);
});

// ------------------------------------------------------------
// TEST 2: Verify ThreeDViewer class buildFromData logic
// ------------------------------------------------------------
console.log("\n[TEST 2] Verifying ThreeDViewer.buildFromData geometry rendering & removal...");

// Extract and evaluate ThreeDViewer implementation
const viewerCode = fs.readFileSync(path.join(__dirname, 'src/renderer/js/ThreeDViewer.js'), 'utf8');

// Create a testable ThreeDViewer instance without DOM dependency
class HeadlessThreeDViewer {
    constructor() {
        this.scene = new THREE.Scene();
        this.buildingGroup = new THREE.Group();
        this.scene.add(this.buildingGroup);
        this.nodeMeshMap = new Map();
        this.fireMeshMap = new Map();
        this.routeLine = null;
        this.controls = {
            target: new THREE.Vector3(),
            update: () => {}
        };
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    }
}

// Bind buildFromData method to HeadlessThreeDViewer prototype
const buildFromDataMatch = viewerCode.match(/buildFromData\s*\([^)]*\)\s*\{[\s\S]*?\n    \}/);
if (!buildFromDataMatch) {
    console.error("Could not find buildFromData method in ThreeDViewer.js");
    process.exit(1);
}
// Evaluate the buildFromData method onto our class
const methodFn = new Function('THREE', `
    return function ${buildFromDataMatch[0]}
`)(THREE);
HeadlessThreeDViewer.prototype.buildFromData = methodFn;

const viewer = new HeadlessThreeDViewer();

// Test switching each floor 0 through 5
for (let targetLevel = 0; targetLevel <= 5; targetLevel++) {
    console.log(`\n  --- Testing buildFromData for Floor Level ${targetLevel} ---`);

    viewer.buildFromData(buildingData, targetLevel);

    const children = viewer.buildingGroup.children;
    assert(children.length > 0, `Floor ${targetLevel}: buildingGroup has rendered children (${children.length} meshes)`);

    // Verify slab exists as child[0]
    const slab = children[0];
    assert(slab && slab.geometry instanceof THREE.BoxGeometry, `Floor ${targetLevel}: Base slab mesh is rendered`);

    // Count meshes created
    const wallMeshes = children.filter(c => c !== slab && c.geometry instanceof THREE.BoxGeometry && c.position.y > 0.4);
    assert(wallMeshes.length > 0, `Floor ${targetLevel}: Wall/feature meshes rendered: ${wallMeshes.length}`);

    // Verify node markers match floor
    const expectedFloor = buildingData.floors.find(f => f.level === targetLevel);
    const expectedNodes = (expectedFloor.nodes || []).length;
    assert(viewer.nodeMeshMap.size === expectedNodes, `Floor ${targetLevel}: Node mesh count (${viewer.nodeMeshMap.size}) matches floor.nodes (${expectedNodes})`);
}

// ------------------------------------------------------------
// TEST 3: Verify previous geometry is removed on floor switch
// ------------------------------------------------------------
console.log("\n[TEST 3] Verifying previous floor geometry is removed on switch...");

for (let lvl = 0; lvl <= 5; lvl++) {
    // 1. Fresh render
    const freshViewer = new HeadlessThreeDViewer();
    freshViewer.buildFromData(buildingData, lvl);
    const freshCount = freshViewer.buildingGroup.children.length;

    // 2. Render previous floor (lvl - 1 or 5), then switch to lvl
    const switchViewer = new HeadlessThreeDViewer();
    const otherLvl = lvl === 0 ? 5 : lvl - 1;
    switchViewer.buildFromData(buildingData, otherLvl);
    switchViewer.buildFromData(buildingData, lvl);
    const switchedCount = switchViewer.buildingGroup.children.length;

    assert(
        freshCount === switchedCount,
        `Floor ${lvl}: Switched count (${switchedCount}) matches fresh render count (${freshCount}) exactly (switched from Level ${otherLvl})`
    );
}

// ------------------------------------------------------------
// TEST 4: Verify selectFloor() logic in renderer.js
// ------------------------------------------------------------
console.log("\n[TEST 4] Verifying selectFloor() logic and state management...");

// Mock the DOM environment for renderer.js
global.window = {
    buildingData: buildingData,
    currentFloorLevel: 0
};
global.document = {
    buttons: {},
    labels: {},
    getElementById: function(id) {
        if (!this.labels[id]) {
            this.labels[id] = { textContent: "", style: {}, classList: new Set() };
        }
        return this.labels[id];
    },
    querySelectorAll: function(sel) {
        if (sel === ".floor-btn") {
            return Object.values(this.buttons);
        }
        return [];
    }
};

// Create mock buttons for floors 0 to 5
for (let i = 0; i <= 5; i++) {
    document.buttons[`btnFloor${i}`] = {
        dataset: { floor: String(i) },
        style: {},
        classList: {
            classes: new Set(),
            add: function(c) { this.classes.add(c); },
            remove: function(c) { this.classes.delete(c); },
            contains: function(c) { return this.classes.has(c); }
        }
    };
}

let lastRenderedLevel = null;
global.threeDViewer = {
    buildFromData: function(data, level) {
        lastRenderedLevel = level;
    }
};
global.currentMapData = null;

// Load selectFloor from renderer.js
const rendererCode = fs.readFileSync(path.join(__dirname, 'src/renderer/js/renderer.js'), 'utf8');
const selectFloorMatch = rendererCode.match(/function selectFloor\s*\([^)]*\)\s*\{[\s\S]*?\n\}/);
if (!selectFloorMatch) {
    console.error("Could not find selectFloor function in renderer.js");
    process.exit(1);
}
const selectFloorFn = new Function(`
    ${selectFloorMatch[0]}
    return selectFloor;
`)();

// Test calling selectFloor for every floor from 0 to 5
const floorNames = [
    "Ground Floor",
    "First Floor",
    "Second Floor",
    "Third Floor",
    "Fourth Floor",
    "Fifth Floor"
];

for (let lvl = 0; lvl <= 5; lvl++) {
    selectFloorFn(lvl);

    assert(window.currentFloorLevel === lvl, `selectFloor(${lvl}): window.currentFloorLevel === ${lvl} (type: ${typeof window.currentFloorLevel})`);
    assert(lastRenderedLevel === lvl, `selectFloor(${lvl}): threeDViewer.buildFromData called with level ${lvl}`);
    assert(document.labels["floorNumber"].textContent === floorNames[lvl], `selectFloor(${lvl}): #floorNumber textContent is "${floorNames[lvl]}"`);

    // Verify active button
    const activeBtn = document.buttons[`btnFloor${lvl}`];
    assert(activeBtn.classList.contains("active"), `selectFloor(${lvl}): btnFloor${lvl} has class 'active'`);

    // Verify other buttons are not active
    for (let other = 0; other <= 5; other++) {
        if (other !== lvl) {
            const inactiveBtn = document.buttons[`btnFloor${other}`];
            assert(!inactiveBtn.classList.contains("active"), `selectFloor(${lvl}): btnFloor${other} does NOT have class 'active'`);
        }
    }
}

// Test passing string floor level (e.g., from data attribute "2")
selectFloorFn("2");
assert(window.currentFloorLevel === 2, "selectFloor('2') string converts to number 2");
assert(lastRenderedLevel === 2, "threeDViewer received number 2");

console.log("\n" + "=".repeat(70));
if (allTestsPassed) {
    console.log("🎉 ALL TESTS PASSED: FLOOR SWITCHING FLOW VERIFIED PROGRAMMATICALLY!");
} else {
    console.error("❌ SOME TESTS FAILED!");
    process.exit(1);
}
console.log("=".repeat(70));
