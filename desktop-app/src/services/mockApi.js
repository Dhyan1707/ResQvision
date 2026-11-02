// ==========================================
// MOCK API SERVICE
// AI FIRE EVACUATION SYSTEM
// ==========================================
//
// IMPORTANT:
// This is temporary simulation data.
//
// It does NOT create fake room IDs.
// The building/room information comes from
// the uploaded blueprint through buildingData.
//
// ==========================================

const buildingData =
    require("../models/buildingData");


let simulationStep = 0;


// ==========================================
// GET ALERTS
// ==========================================

async function getAlerts() {

    simulationStep++;


    // 6-step repeating simulation
    const cycleStep =
        ((simulationStep - 1) % 6) + 1;


    // --------------------------------------
    // CHECK FOR AVAILABLE ROOMS
    // --------------------------------------

    const floor =
        buildingData.floors &&
        buildingData.floors[0];


    const rooms =
        floor &&
        Array.isArray(floor.rooms)
            ? floor.rooms
            : [];


    // --------------------------------------
    // NO BUILDING / NO ROOMS
    // --------------------------------------

    if (rooms.length === 0) {

        return {

            success: true,

            alerts: []

        };

    }


    // --------------------------------------
    // USE A REAL DETECTED ROOM
    // --------------------------------------

    const fireRoom =
        rooms[0];


    // --------------------------------------
    // NORMAL FIRE CONDITION
    // Steps 1, 2, 3
    // --------------------------------------

    if (cycleStep <= 3) {

        return {

            success: true,

            alerts: [

                {

                    id:
                        "ALERT-001",

                    type:
                        "FIRE",

                    severity:
                        "HIGH",

                    message:
                        `Fire detected near ${fireRoom.name}`,

                    locationId:
                        fireRoom.id,

                    floor:
                        floor.floorNumber

                }

            ]

        };

    }


    // --------------------------------------
    // CRITICAL FIRE CONDITION
    // Steps 4, 5, 6
    // --------------------------------------

    return {

        success: true,

        alerts: [

            {

                id:
                    "ALERT-002",

                type:
                    "FIRE",

                severity:
                    "CRITICAL",

                message:
                    `Fire spreading near ${fireRoom.name}`,

                locationId:
                    fireRoom.id,

                floor:
                    floor.floorNumber

            }

        ]

    };

}


// ==========================================
// GET EVACUATION ROUTE
// ==========================================

async function getEvacuationRoute(
    locationId
) {

    // --------------------------------------
    // CHECK WHETHER BUILDING EXISTS
    // --------------------------------------

    const floor =
        buildingData.floors &&
        buildingData.floors[0];


    if (!floor) {

        return {

            success: false,

            error:
                "No building data available."

        };

    }


    // --------------------------------------
    // FIND THE ROOM
    // --------------------------------------

    const room =
        Array.isArray(floor.rooms)
            ? floor.rooms.find(
                item =>
                    item.id ===
                    locationId
            )
            : null;


    if (!room) {

        return {

            success: false,

            error:
                "Location not found in current building."

        };

    }


    // --------------------------------------
    // CHECK EXITS
    // --------------------------------------

    const exits =
        Array.isArray(floor.exits)
            ? floor.exits
            : [];


    if (exits.length === 0) {

        return {

            success: false,

            error:
                "No exits are available in the current building."

        };

    }


    // --------------------------------------
    // SELECT EXIT
    // --------------------------------------

    const selectedExit =
        simulationStep <= 3
            ? exits[0]
            : exits[1] || exits[0];


    // --------------------------------------
    // SAFE CONDITION
    // --------------------------------------

    if (simulationStep <= 3) {

        return {

            success: true,

            route: {

                status:
                    "SAFE",

                locationId:
                    locationId,

                exitName:
                    selectedExit.name,

                distance:
                    "Calculating...",

                estimatedTime:
                    "Calculating..."

            }

        };

    }


    // --------------------------------------
    // REROUTED CONDITION
    // --------------------------------------

    return {

        success: true,

        route: {

            status:
                "REROUTED",

            locationId:
                locationId,

            exitName:
                selectedExit.name,

            distance:
                "Calculating...",

            estimatedTime:
                "Calculating..."

        }

    };

}


// ==========================================
// GET MAP DATA
// ==========================================

async function getMapData() {

    return {

        success: true,

        map:
            buildingData

    };

}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {

    getAlerts,

    getEvacuationRoute,

    getMapData

};