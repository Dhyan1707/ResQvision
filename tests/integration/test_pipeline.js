// ============================================================
// PIPELINE TEST SCRIPT
// Run with: node test_pipeline.js
// ============================================================

const path = require("path");

const { analyzeBlueprint } = require("./src/ai/blueprintAnalyzer");
const { generateEvacuationRoutes } = require("./src/ai/routeGenerator");

const BLUEPRINT = path.join(
    "C:\\Users\\Prachi\\OneDrive\\Pictures",
    "page_1.png"
);

async function runTest() {

    console.log("=".repeat(60));
    console.log("PIPELINE TEST STARTED");
    console.log("=".repeat(60));
    console.log("Blueprint:", BLUEPRINT);
    console.log("");

    try {

        console.log("Running analyzeBlueprint()...");
        const building = await analyzeBlueprint(BLUEPRINT);

        const floor = building.floors[0];

        console.log("");
        console.log("=".repeat(60));
        console.log("ANALYSIS RESULT SUMMARY");
        console.log("=".repeat(60));
        console.log("Rooms:       ", floor.rooms.length);
        console.log("Corridors:   ", floor.corridors.length);
        console.log("Doors:       ", floor.doors.length);
        console.log("Exits:       ", floor.exits.length);
        console.log("Stairs:      ", floor.stairs.length);

        if (floor.exits.length > 0) {
            console.log("");
            console.log("EXIT DETAILS:");
            floor.exits.forEach((exit, i) => {
                console.log(
                    `  EXIT ${i+1}: ${exit.name} ` +
                    `pos=(${Math.round(exit.position.x)},${Math.round(exit.position.y)}) ` +
                    `method=${exit.detectionMethod} ` +
                    `confidence=${Math.round(exit.confidence)}`
                );
            });
        }

        console.log("");
        console.log("Running generateEvacuationRoutes()...");

        generateEvacuationRoutes(building);

        const updatedFloor = building.floors[0];

        console.log("");
        console.log("=".repeat(60));
        console.log("ROUTE GENERATION RESULT");
        console.log("=".repeat(60));

        if (updatedFloor.routeSummary) {
            console.log("Total rooms:       ", updatedFloor.routeSummary.totalRooms);
            console.log("Safe routes:       ", updatedFloor.routeSummary.safeRoutes);
            console.log("Blocked routes:    ", updatedFloor.routeSummary.blockedRoutes);
            console.log("No safe route:     ", updatedFloor.routeSummary.unavailableRoutes);
        }

        console.log("");

        if (
            floor.exits.length > 0 &&
            updatedFloor.routeSummary &&
            updatedFloor.routeSummary.safeRoutes > 0
        ) {
            console.log("✅ SUCCESS: Exits detected AND safe routes found!");
        }
        else if (floor.exits.length > 0) {
            console.log("⚠️  PARTIAL: Exits detected but no safe routes yet.");
        }
        else {
            console.log("❌ FAIL: Still 0 exits detected.");
        }

        console.log("=".repeat(60));

    }
    catch (error) {
        console.error("TEST FAILED:", error.message);
        console.error(error.stack);
    }

    process.exit(0);
}

runTest();
