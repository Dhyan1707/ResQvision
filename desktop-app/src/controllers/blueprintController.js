// ==========================================
// BLUEPRINT CONTROLLER
// AI FIRE EVACUATION SYSTEM
// ==========================================
//
// Responsible for:
// 1. Receiving blueprint path
// 2. Calling blueprintProcessor
// 3. Storing the generated building model
// 4. Providing building data to the application
//
// The controller coordinates the workflow.
// OCR, room detection and route generation remain
// inside their respective modules.
// ==========================================


const {
    processBlueprint
} = require("../blueprint/blueprintProcessor");


// ==========================================
// CURRENT BUILDING
// ==========================================

let currentBuilding = null;


// ==========================================
// PROCESS BLUEPRINT
// ==========================================

async function processUploadedBlueprint(filePath) {

    console.log("----------------------------------");
    console.log("BLUEPRINT CONTROLLER (OVERRIDES)");
    console.log("----------------------------------");

    console.log("Received blueprint:", filePath);
    console.log("Bypassing OCR legacy pipeline.");
    console.log("Loading explicit college architectural model instead.");

    try {
        const buildingData = require("../models/buildingData.js");

        if (!buildingData || !Array.isArray(buildingData.floors)) {
            throw new Error("Invalid explicit building model.");
        }

        currentBuilding = buildingData;
        console.log("Building model stored successfully.");
        console.log("Building ID:", currentBuilding.collegeName);
        console.log("Floors:", currentBuilding.floors.length);

        return currentBuilding;
    } catch (error) {
        console.error("Blueprint controller error:", error);
        throw new Error("Blueprint processing failed: " + error.message);
    }
}


// ==========================================
// GET CURRENT BUILDING
// ==========================================

function getCurrentBuilding() {

    return currentBuilding;

}


// ==========================================
// CHECK BUILDING
// ==========================================

function hasBuilding() {

    return (
        currentBuilding !== null
    );

}


// ==========================================
// GET CURRENT FLOOR
// ==========================================

function getCurrentFloor(floorLevel = 0) {

    if (
        !currentBuilding ||
        !Array.isArray(
            currentBuilding.floors
        ) ||
        currentBuilding.floors.length === 0
    ) {

        return null;

    }

    const levelNum = Number(floorLevel);
    const found = currentBuilding.floors.find(
        f => Number(f.level) === levelNum
    );

    return found || currentBuilding.floors[0];

}


// ==========================================
// GET ROOMS
// ==========================================

function getRooms() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return [];

    }


    // New college format: filter nodes by type
    if (Array.isArray(floor.nodes)) {
        return floor.nodes.filter(
            n => n.type === "room"
        );
    }


    return Array.isArray(
        floor.rooms
    )
        ? floor.rooms
        : [];

}


// ==========================================
// GET DOORS
// ==========================================

function getDoors() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return [];

    }


    // New college format: doors are attributes on nodes
    if (Array.isArray(floor.nodes)) {
        return floor.nodes.filter(
            n => n.doors && n.doors > 0
        );
    }


    return Array.isArray(
        floor.doors
    )
        ? floor.doors
        : [];

}


// ==========================================
// GET EXITS
// ==========================================

function getExits() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return [];

    }


    // New college format: filter nodes by type
    if (Array.isArray(floor.nodes)) {
        return floor.nodes.filter(
            n => n.type === "exit"
        );
    }


    return Array.isArray(
        floor.exits
    )
        ? floor.exits
        : [];

}


// ==========================================
// GET FIRES
// ==========================================

function getFires() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return [];

    }


    return Array.isArray(
        floor.fires
    )
        ? floor.fires
        : [];

}


// ==========================================
// GET ROUTES
// ==========================================

function getRoutes() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return [];

    }


    return Array.isArray(
        floor.paths
    )
        ? floor.paths
        : [];

}


// ==========================================
// CLEAR BUILDING
// ==========================================

function clearBuilding() {

    currentBuilding =
        null;


    console.log(
        "Current building cleared."
    );

}


// ==========================================
// BUILDING SUMMARY
// ==========================================

function getBuildingSummary() {

    const floor =
        getCurrentFloor();


    if (!floor) {

        return {

            success: false,

            message:
                "No building has been loaded."

        };

    }


    // Support both old and new formats
    const nodes = floor.nodes || [];
    const roomCount = nodes.length > 0
        ? nodes.filter(n => n.type === "room").length
        : (floor.rooms?.length || 0);
    const exitCount = nodes.length > 0
        ? nodes.filter(n => n.type === "exit").length
        : (floor.exits?.length || 0);
    const stairCount = nodes.length > 0
        ? nodes.filter(n => n.type === "staircase").length
        : (floor.stairs?.length || 0);
    const corridorCount = nodes.length > 0
        ? nodes.filter(n => n.type === "corridor").length
        : (floor.corridors?.length || 0);


    return {

        success: true,

        buildingId:
            currentBuilding.buildingId,

        buildingName:
            currentBuilding.collegeName ||
            currentBuilding.buildingName,

        floors:
            currentBuilding.floors.length,

        rooms:
            roomCount,

        corridors:
            corridorCount,

        exits:
            exitCount,

        stairs:
            stairCount,

        fires:
            floor.fires?.length || 0,

        routes:
            floor.paths?.length || 0

    };

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    processUploadedBlueprint,

    getCurrentBuilding,

    hasBuilding,

    getCurrentFloor,

    getRooms,

    getDoors,

    getExits,

    getFires,

    getRoutes,

    getBuildingSummary,

    clearBuilding

};