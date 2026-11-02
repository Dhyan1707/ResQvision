// ==========================================
// EVACUATION CONTROLLER
// AI FIRE EVACUATION SYSTEM
// ==========================================
//
// Responsible for coordinating:
// 1. Blueprint processing
// 2. Building state
// 3. Fire/alert information
// 4. Evacuation route generation
//
// The controller does NOT perform OCR or route
// calculations itself. Those responsibilities stay
// inside the existing AI/service modules.
// ==========================================

const {
    processBlueprint
} = require("../blueprint/blueprintProcessor");

const {
    generateEvacuationRoutes
} = require("../ai/routeGenerator");


// ==========================================
// CURRENT BUILDING STATE
// ==========================================

let currentBuilding = null;


// ==========================================
// PROCESS UPLOADED BLUEPRINT
// ==========================================

async function processUploadedBlueprint(filePath) {

    console.log("----------------------------------");
    console.log("EVACUATION CONTROLLER");
    console.log("PROCESSING BLUEPRINT");
    console.log("----------------------------------");

    if (!filePath) {
        throw new Error(
            "No blueprint file selected."
        );
    }


    // --------------------------------------
    // Send blueprint to processor
    // --------------------------------------

    const building =
        await processBlueprint(
            filePath
        );


    if (!building) {

        throw new Error(
            "Blueprint processing returned no building."
        );

    }


    // --------------------------------------
    // Store current building
    // --------------------------------------

    currentBuilding =
        building;


    console.log(
        "Building state updated."
    );


    // --------------------------------------
    // Generate evacuation routes
    // --------------------------------------

    try {

        const routeResult =
            await generateEvacuationRoutes(
                currentBuilding
            );


        if (
            routeResult &&
            routeResult.floors
        ) {

            currentBuilding =
                routeResult;

        }

    }
    catch (error) {

        console.warn(
            "Route generation skipped:",
            error.message
        );

    }


    console.log("----------------------------------");
    console.log("BLUEPRINT PROCESSING COMPLETE");
    console.log("----------------------------------");


    return currentBuilding;
}


// ==========================================
// GET CURRENT BUILDING
// ==========================================

function getCurrentBuilding() {

    return currentBuilding;
}


// ==========================================
// CHECK WHETHER BUILDING EXISTS
// ==========================================

function hasBuilding() {

    return (
        currentBuilding !== null
    );

}


// ==========================================
// GET CURRENT FLOOR
// ==========================================

function getCurrentFloor() {

    if (
        !currentBuilding ||
        !Array.isArray(
            currentBuilding.floors
        ) ||
        currentBuilding.floors.length === 0
    ) {

        return null;

    }


    return currentBuilding.floors[0];
}


// ==========================================
// GET CURRENT ALERTS
// ==========================================

function getCurrentAlerts() {

    const floor =
        getCurrentFloor();


    if (!floor) {
        return [];
    }


    const fires =
        Array.isArray(floor.fires)
            ? floor.fires
            : [];


    return fires.map(
        fire => ({

            id:
                fire.id,

            type:
                fire.type,

            severity:
                fire.severity,

            message:
                fire.message,

            locationId:
                fire.locationId,

            roomId:
                fire.roomId,

            floor:
                fire.floor,

            active:
                fire.active,

            position:
                fire.position

        })
    );
}


// ==========================================
// GET EVACUATION ROUTE
// ==========================================

function getEvacuationRoute(
    locationId
) {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return {

            success: false,

            error:
                "No building data available."

        };

    }


    // --------------------------------------
    // Find generated route
    // --------------------------------------

    const paths =
        Array.isArray(floor.paths)
            ? floor.paths
            : [];


    const route =
        paths.find(
            path => {

                return (
                    path.startRoomId ===
                    locationId
                );

            }
        );


    if (!route) {

        return {

            success: false,

            error:
                "No evacuation route found."

        };

    }


    return {

        success: true,

        route

    };
}


// ==========================================
// GET BUILDING SUMMARY
// ==========================================

function getBuildingSummary() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return {

            success: false,

            error:
                "No building loaded."

        };

    }


    return {

        success: true,

        buildingId:
            currentBuilding.buildingId,

        buildingName:
            currentBuilding.buildingName,

        floorNumber:
            floor.floorNumber,

        rooms:
            floor.rooms?.length || 0,

        doors:
            floor.doors?.length || 0,

        exits:
            floor.exits?.length || 0,

        stairs:
            floor.stairs?.length || 0,

        fires:
            floor.fires?.length || 0,

        routes:
            floor.paths?.length || 0

    };
}


// ==========================================
// CLEAR BUILDING
// ==========================================

function clearBuilding() {

    currentBuilding =
        null;

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    processUploadedBlueprint,

    getCurrentBuilding,

    hasBuilding,

    getCurrentFloor,

    getCurrentAlerts,

    getEvacuationRoute,

    getBuildingSummary,

    clearBuilding

};