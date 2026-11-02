// ============================================================
// EVACUATION ROUTE GENERATOR
// AI FIRE EVACUATION SYSTEM
// ============================================================
//
// STEP 6
//
// DYNAMIC ROUTE GENERATION
//
// IMPORTANT:
// ------------------------------------------------------------
// This file NEVER assumes:
//   - a fixed building
//   - a fixed floor
//   - a fixed room
//   - a fixed exit
//   - a fixed fire location
//
// The uploaded/analyzed building model is the ONLY source
// of rooms, doors, exits and floors.
//
// The route generator:
//
//   1. Reads ALL floors dynamically
//   2. Reads detected rooms/spaces
//   3. Reads detected doors/passages
//   4. Reads detected exits
//   5. Reads CURRENT active fires
//   6. Blocks fire-affected rooms
//   7. Builds a navigation graph
//   8. Finds the shortest SAFE route
//   9. Recalculates routes whenever fire state changes
//
// ============================================================


// ============================================================
// SETTINGS
// ============================================================

// Maximum pixel distance (original image coords) between a door and a
// room center for the door to be considered a connection to that room.
const DOOR_CONNECTION_DISTANCE = 800;

// Maximum pixel distance between a room center and an exit position
// for a direct room→exit edge to be added.
const EXIT_CONNECTION_DISTANCE = 1200;

const ROOM_FALLBACK_CONNECTION_DISTANCE = 0;


// ============================================================
// MAIN ROUTE GENERATOR
// ============================================================

function generateEvacuationRoutes(building) {

    console.log("----------------------------------");
    console.log("STEP 6: DYNAMIC EVACUATION ROUTE GENERATION");
    console.log("----------------------------------");


    // ========================================================
    // VALIDATION
    // ========================================================

    if (
        !building ||
        !Array.isArray(building.floors) ||
        building.floors.length === 0
    ) {

        throw new Error(
            "Invalid building model. A dynamically analyzed building with floors is required."
        );

    }


    console.log(
        "Total floors:",
        building.floors.length
    );


    // ========================================================
    // PROCESS EVERY DETECTED FLOOR
    // ========================================================

    for (
        const floor of building.floors
    ) {

        if (!floor) {
            continue;
        }


        generateRoutesForFloor(
            building,
            floor
        );

    }


    // ========================================================
    // STORE GLOBAL ROUTE INFORMATION
    // ========================================================

    building.routeGeneration = {

        generatedAt:
            new Date().toISOString(),

        floorCount:
            building.floors.length,

        dynamic:
            true

    };


    console.log("----------------------------------");
    console.log(
        "DYNAMIC EVACUATION ROUTE GENERATION COMPLETE"
    );
    console.log("----------------------------------");


    return building;

}


// ============================================================
// GENERATE ROUTES FOR ONE FLOOR
// ============================================================

function generateRoutesForFloor(
    building,
    floor
) {

    const rooms =
        getFloorRooms(floor);

    const doors =
        getFloorDoors(floor);

    const exits =
        getFloorExits(floor);

    const fires =
        getFloorFires(floor);


    console.log(
        `Floor ${getFloorNumber(floor)}`
    );

    console.log(
        "  Rooms:",
        rooms.length
    );

    console.log(
        "  Doors:",
        doors.length
    );

    console.log(
        "  Exits:",
        exits.length
    );

    console.log(
        "  Active fires:",
        fires.filter(
            fire =>
                fire &&
                fire.active
        ).length
    );


    // ========================================================
    // IDENTIFY FIRE-BLOCKED ROOMS
    // ========================================================

    const blockedRooms =
        getBlockedRoomIds(
            floor
        );


    console.log(
        "  Blocked rooms:",
        [...blockedRooms]
    );


    // ========================================================
    // BUILD DYNAMIC NAVIGATION GRAPH
    // ========================================================

    const graph =
        buildNavigationGraph(
            rooms,
            doors,
            exits,
            blockedRooms
        );


    // ========================================================
    // GENERATE ROUTE FOR EVERY DETECTED ROOM
    // ========================================================

    const routes = [];


    for (
        const room of rooms
    ) {

        if (
            !room ||
            !room.id
        ) {

            continue;

        }


        // ----------------------------------------------------
        // FIRE-BLOCKED ROOM
        // ----------------------------------------------------

        if (
            blockedRooms.has(
                room.id
            )
        ) {

            routes.push({

                roomId:
                    room.id,

                roomName:
                    room.name ||
                    room.id,

                floor:
                    getFloorNumber(floor),

                status:
                    "BLOCKED",

                reason:
                    "Room contains an active fire.",

                exitId:
                    null,

                distance:
                    null,

                route:
                    []

            });

            continue;

        }


        // ----------------------------------------------------
        // FIND SAFE ROUTE
        // ----------------------------------------------------

        const result =
            findShortestSafeRoute(
                room.id,
                graph
            );


        if (result) {

            routes.push({

                roomId:
                    room.id,

                roomName:
                    room.name ||
                    room.id,

                floor:
                    getFloorNumber(floor),

                status:
                    "SAFE_ROUTE_FOUND",

                exitId:
                    result.exitId,

                distance:
                    result.distance,

                route:
                    result.path

            });

        }

        else {

            routes.push({

                roomId:
                    room.id,

                roomName:
                    room.name ||
                    room.id,

                floor:
                    getFloorNumber(floor),

                status:
                    "NO_SAFE_ROUTE",

                reason:
                    "No safe exit route is currently available.",

                exitId:
                    null,

                distance:
                    null,

                route:
                    []

            });

        }

    }


    // ========================================================
    // STORE ROUTES ON THIS FLOOR
    // ========================================================

    floor.paths =
        routes;


    // ========================================================
    // ROUTE SUMMARY
    // ========================================================

    const safeRoutes =
        routes.filter(
            route =>
                route.status ===
                "SAFE_ROUTE_FOUND"
        ).length;


    const blockedRoutes =
        routes.filter(
            route =>
                route.status ===
                "BLOCKED"
        ).length;


    const unavailableRoutes =
        routes.filter(
            route =>
                route.status ===
                "NO_SAFE_ROUTE"
        ).length;


    floor.routeSummary = {

        totalRooms:
            routes.length,

        safeRoutes,

        blockedRoutes,

        unavailableRoutes

    };


    console.log(
        `  Safe routes: ${safeRoutes}`
    );

    console.log(
        `  Blocked: ${blockedRoutes}`
    );

    console.log(
        `  No safe route: ${unavailableRoutes}`
    );

}


// ============================================================
// FLOOR DATA HELPERS
// ============================================================

function getFloorNumber(floor) {

    return (
        Number(floor.floorNumber) ||
        Number(floor.floor) ||
        1
    );

}


function getFloorRooms(floor) {

    if (
        Array.isArray(floor.rooms)
    ) {

        return floor.rooms.filter(
            room =>
                room &&
                room.id
        );

    }


    // Some blueprint analyzers may call them spaces.
    if (
        Array.isArray(floor.spaces)
    ) {

        return floor.spaces
            .filter(
                space =>
                    space &&
                    space.id
            )
            .map(
                space => ({

                    ...space,

                    id:
                        space.id,

                    name:
                        space.name ||
                        space.label ||
                        space.id,

                    center:
                        space.center ||
                        space.position

                })
            );

    }


    return [];

}


function getFloorDoors(floor) {

    if (
        Array.isArray(floor.doors)
    ) {

        return floor.doors.filter(
            door =>
                door &&
                door.position
        );

    }


    return [];

}


function getFloorExits(floor) {

    if (
        Array.isArray(floor.exits)
    ) {

        return floor.exits.filter(
            exit =>
                exit &&
                exit.position
        );

    }


    return [];

}


function getFloorFires(floor) {

    if (
        Array.isArray(floor.fires)
    ) {

        return floor.fires.filter(
            fire =>
                fire &&
                fire.active
        );

    }


    return [];

}


// ============================================================
// FIND FIRE-BLOCKED ROOMS
// ============================================================

function getBlockedRoomIds(floor) {

    const blocked =
        new Set();


    const fires =
        getFloorFires(floor);


    const rooms =
        getFloorRooms(floor);


    for (
        const fire of fires
    ) {

        // ----------------------------------------------------
        // Direct room reference
        // ----------------------------------------------------

        const directRoomId =
            fire.roomId ||
            fire.affectedRoomId ||
            fire.spaceId ||
            fire.affectedSpaceId;


        if (
            directRoomId
        ) {

            blocked.add(
                directRoomId
            );

            continue;

        }


        // ----------------------------------------------------
        // Position-based fire
        // ----------------------------------------------------

        if (
            fire.position
        ) {

            const nearestRoom =
                findNearestRoom(
                    fire.position,
                    rooms
                );


            if (
                nearestRoom
            ) {

                blocked.add(
                    nearestRoom.id
                );

            }

        }

    }


    return blocked;

}


// ============================================================
// BUILD NAVIGATION GRAPH
// ============================================================
//
// Graph structure:
//
// room
//   ↓
// door
//   ↓
// room
//   ↓
// exit
//
// Only valid detected relationships are added.
//
// ============================================================

function buildNavigationGraph(
    rooms,
    doors,
    exits,
    blockedRooms
) {

    const graph = {};


    // ========================================================
    // CREATE ROOM NODES
    // ========================================================

    for (
        const room of rooms
    ) {

        if (
            !room ||
            !room.id
        ) {

            continue;

        }


        graph[room.id] = [];

    }


    // ========================================================
    // CONNECT ROOMS THROUGH DETECTED DOORS
    // ========================================================

    for (
        const door of doors
    ) {

        if (
            !door ||
            !door.position
        ) {

            continue;

        }


        // --------------------------------------------------
        // PREFERRED: use explicit connectedSpaces from
        // assignDoorsToSpaces (which uses pointNearSpaceBoundary).
        // This avoids pure distance guessing.
        // --------------------------------------------------

        const connectedSpaceIds =
            Array.isArray(door.connectedSpaces)
                ? door.connectedSpaces.filter(
                    id => graph[id] && !blockedRooms.has(id)
                )
                : [];


        if (connectedSpaceIds.length >= 2) {

            // Connect every pair of spaces through this door.

            for (let i = 0; i < connectedSpaceIds.length; i++) {

                for (let j = i + 1; j < connectedSpaceIds.length; j++) {

                    const idA = connectedSpaceIds[i];
                    const idB = connectedSpaceIds[j];

                    const rA = rooms.find(r => r.id === idA);
                    const rB = rooms.find(r => r.id === idB);

                    const dist = distanceBetweenPoints(
                        rA && rA.center,
                        rB && rB.center
                    );

                    addGraphEdge(
                        graph,
                        idA,
                        idB,
                        {
                            type:    "DOOR",
                            doorId:  door.id,
                            distance: Number.isFinite(dist) ? dist : DOOR_CONNECTION_DISTANCE
                        }
                    );

                }

            }

            continue;

        }


        // --------------------------------------------------
        // FALLBACK: distance-based connection.
        // --------------------------------------------------

        const nearestRooms =
            findRoomsNearDoor(
                door,
                rooms
            );


        if (
            nearestRooms.length < 2
        ) {

            continue;

        }


        const roomA =
            nearestRooms[0];


        const roomB =
            nearestRooms[1];


        if (
            blockedRooms.has(roomA.id) ||
            blockedRooms.has(roomB.id)
        ) {

            continue;

        }


        const distance =
            distanceBetweenPoints(
                roomA.center,
                roomB.center
            );


        addGraphEdge(
            graph,
            roomA.id,
            roomB.id,
            {

                type:
                    "DOOR",

                doorId:
                    door.id,

                distance:
                    Number.isFinite(distance)
                        ? distance
                        : DOOR_CONNECTION_DISTANCE

            }
        );

    }


    // ========================================================
    // OPTIONAL EXPLICIT ROOM CONNECTIONS
    // ========================================================
    //
    // If the analyzer already knows which rooms are connected,
    // use that information.
    //
    // This is preferred over guessing from distance.
    //
    // Supported examples:
    //
    // room.connectedRooms = ["ROOM-A", "ROOM-B"]
    //
    // room.connections = [...]
    //
    // ========================================================

    for (
        const room of rooms
    ) {

        if (
            !room ||
            !room.id
        ) {

            continue;

        }


        const connections =
            Array.isArray(
                room.connectedRooms
            )
                ? room.connectedRooms
                : Array.isArray(
                    room.connections
                )
                    ? room.connections
                    : [];


        for (
            const connection
            of connections
        ) {

            const targetId =
                typeof connection === "string"
                    ? connection
                    : connection?.roomId ||
                      connection?.id;


            if (
                !targetId ||
                !graph[targetId]
            ) {

                continue;

            }


            if (
                blockedRooms.has(room.id) ||
                blockedRooms.has(targetId)
            ) {

                continue;

            }


            const targetRoom =
                rooms.find(
                    item =>
                        item.id ===
                        targetId
                );


            const distance =
                targetRoom
                    ? distanceBetweenPoints(
                        room.center,
                        targetRoom.center
                    )
                    : ROOM_FALLBACK_CONNECTION_DISTANCE;


            addGraphEdge(
                graph,
                room.id,
                targetId,
                {

                    type:
                        "ROOM_CONNECTION",

                    distance:
                        Number.isFinite(distance)
                            ? distance
                            : 1

                }
            );

        }

    }


    // ========================================================
    // CONNECT ROOMS TO EXITS
    // ========================================================

    for (
        const room of rooms
    ) {

        if (
            !room ||
            !room.id ||
            blockedRooms.has(room.id)
        ) {

            continue;

        }


        for (
            const exit of exits
        ) {

            if (
                !exit ||
                !exit.id ||
                !exit.position
            ) {

                continue;

            }


            const distance =
                distanceBetweenPoints(
                    room.center,
                    exit.position
                );


            // ------------------------------------------------
            // Explicit exit-room relationship
            // ------------------------------------------------

            const explicitlyConnected =
                isExitExplicitlyConnected(
                    room,
                    exit
                );


            if (
                explicitlyConnected ||
                (
                    Number.isFinite(distance) &&
                    distance <= EXIT_CONNECTION_DISTANCE
                )
            ) {

                addGraphEdge(
                    graph,
                    room.id,
                    `EXIT:${exit.id}`,
                    {

                        type:
                            "EXIT",

                        exitId:
                            exit.id,

                        distance:
                            Number.isFinite(distance)
                                ? distance
                                : 1

                    }
                );

            }

        }

    }


    // ========================================================
    // GRAPH DIAGNOSTICS
    // ========================================================

    let totalEdges = 0;
    let exitEdges  = 0;

    for (const [nodeId, edges] of Object.entries(graph)) {

        totalEdges += edges.length;

        for (const e of edges) {
            if (String(e.nodeId).startsWith("EXIT:")) {
                exitEdges++;
            }
        }

    }

    console.log("  Navigation graph nodes (rooms):", Object.keys(graph).length);
    console.log("  Total edges:", totalEdges);
    console.log("  Room→Exit edges:", exitEdges);

    if (exitEdges === 0) {

        // Sample diagnostic: print first few room centers and all exit positions
        console.warn("  WARNING: No room→exit connections. Checking distances...");

        const sampleRooms = rooms.slice(0, 3);

        for (const room of sampleRooms) {
            console.log(
                `    Room ${room.id} center:`,
                room.center
                    ? `x=${Math.round(room.center.x)} y=${Math.round(room.center.y)}`
                    : "NO CENTER"
            );
        }

        for (const exit of exits) {
            console.log(
                `    Exit ${exit.id} position:`,
                exit.position
                    ? `x=${Math.round(exit.position.x)} y=${Math.round(exit.position.y)}`
                    : "NO POSITION"
            );
        }

    }


    return graph;

}


// ============================================================
// ADD GRAPH EDGE
// ============================================================

function addGraphEdge(
    graph,
    from,
    to,
    metadata
) {

    if (
        !graph[from]
    ) {

        graph[from] = [];

    }


    graph[from].push({

        nodeId:
            to,

        ...metadata

    });


}


// ============================================================
// FIND ROOMS NEAR DOOR
// ============================================================

function findRoomsNearDoor(
    door,
    rooms
) {

    const candidates =
        rooms
            .map(
                room => ({

                    room,

                    distance:
                        distanceBetweenPoints(
                            door.position,
                            room.center
                        )

                })
            )
            .filter(
                item =>
                    Number.isFinite(
                        item.distance
                    ) &&
                    item.distance <=
                    DOOR_CONNECTION_DISTANCE
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.distance -
                    b.distance
            );


    return candidates
        .slice(
            0,
            2
        )
        .map(
            item =>
                item.room
        );

}


// ============================================================
// FIND NEAREST ROOM
// ============================================================

function findNearestRoom(
    position,
    rooms
) {

    let nearest =
        null;

    let nearestDistance =
        Infinity;


    for (
        const room of rooms
    ) {

        const distance =
            distanceBetweenPoints(
                position,
                room.center
            );


        if (
            distance <
            nearestDistance
        ) {

            nearest =
                room;

            nearestDistance =
                distance;

        }

    }


    return nearest;

}


// ============================================================
// EXIT CONNECTION CHECK
// ============================================================

function isExitExplicitlyConnected(
    room,
    exit
) {

    const roomExitIds =
        room.exitIds ||
        room.connectedExits ||
        room.exits;


    if (
        !Array.isArray(roomExitIds)
    ) {

        return false;

    }


    return roomExitIds.some(
        item => {

            if (
                typeof item === "string"
            ) {

                return item ===
                    exit.id;

            }


            return (
                item?.id === exit.id ||
                item?.exitId === exit.id
            );

        }
    );

}


// ============================================================
// SHORTEST SAFE ROUTE
// ============================================================
//
// Dijkstra-style shortest path search.
//
// Exit nodes are represented as:
//
//     EXIT:<exitId>
//
// ============================================================

function findShortestSafeRoute(
    startRoomId,
    graph
) {

    if (
        !graph[startRoomId]
    ) {

        return null;

    }


    // ========================================================
    // Dijkstra with open-set.
    //
    // EXIT nodes ("EXIT:<id>") live only as edge targets,
    // not as graph keys. We track them in a separate
    // distances map so we don't miss them.
    // ========================================================

    const distances = {};
    const previous = {};

    // Seed all room nodes.
    for (const node of Object.keys(graph)) {
        distances[node] = Infinity;
        previous[node]  = null;
    }

    distances[startRoomId] = 0;


    // Open set: nodes that have been relaxed but not yet
    // permanently settled. Includes both room and EXIT nodes.

    const openSet = new Set(Object.keys(graph));

    const visited = new Set();


    while (openSet.size > 0) {

        // ------------------------------------------------
        // Pick the open-set node with the smallest distance.
        // ------------------------------------------------

        let current         = null;
        let currentDistance = Infinity;

        for (const node of openSet) {

            const d = distances[node] ?? Infinity;

            if (d < currentDistance) {
                current         = node;
                currentDistance = d;
            }

        }


        // No reachable node left.
        if (current === null || currentDistance === Infinity) {
            break;
        }


        openSet.delete(current);
        visited.add(current);


        // ------------------------------------------------
        // EXIT FOUND
        // ------------------------------------------------

        if (current.startsWith("EXIT:")) {

            const exitId =
                current.substring("EXIT:".length);


            return {

                exitId,

                distance:
                    currentDistance,

                path:
                    reconstructPath(
                        previous,
                        current
                    )

            };

        }


        // ------------------------------------------------
        // EXPLORE NEIGHBOURS
        // ------------------------------------------------

        const neighbours =
            graph[current] || [];


        for (const neighbour of neighbours) {

            const neighbourId = neighbour.nodeId;


            if (visited.has(neighbourId)) {
                continue;
            }


            const edgeDistance =
                Number(neighbour.distance);


            const safeDistance =
                Number.isFinite(edgeDistance)
                    ? edgeDistance
                    : 1;


            const newDistance =
                currentDistance + safeDistance;


            const knownDistance =
                distances[neighbourId] ?? Infinity;


            if (newDistance < knownDistance) {

                distances[neighbourId] = newDistance;

                previous[neighbourId] = {
                    nodeId: current,
                    type:   neighbour.type,
                    doorId: neighbour.doorId,
                    exitId: neighbour.exitId
                };

                // Make sure EXIT nodes enter the open set.
                openSet.add(neighbourId);

            }

        }

    }


    return null;

}


// ============================================================
// RECONSTRUCT PATH
// ============================================================

function reconstructPath(
    previous,
    current
) {

    const path = [];


    while (
        current
    ) {

        // ----------------------------------------------------
        // EXIT NODE
        // ----------------------------------------------------

        if (
            current.startsWith(
                "EXIT:"
            )
        ) {

            const exitId =
                current.substring(
                    "EXIT:".length
                );


            path.unshift({

                type:
                    "EXIT",

                exitId

            });

        }

        else {

            // ------------------------------------------------
            // ROOM NODE
            // ------------------------------------------------

            path.unshift({

                type:
                    "ROOM",

                roomId:
                    current

            });

        }


        const previousNode =
            previous[current];


        if (
            !previousNode
        ) {

            break;

        }


        if (
            previousNode.type ===
            "DOOR"
        ) {

            path.splice(
                1,
                0,
                {

                    type:
                        "DOOR",

                    doorId:
                        previousNode.doorId

                }
            );

        }


        current =
            previousNode.nodeId;

    }


    return path;

}


// ============================================================
// POINT DISTANCE
// ============================================================

function distanceBetweenPoints(
    pointA,
    pointB
) {

    if (
        !pointA ||
        !pointB
    ) {

        return Infinity;

    }


    const x1 =
        Number(pointA.x);


    const y1 =
        Number(pointA.y);


    const x2 =
        Number(pointB.x);


    const y2 =
        Number(pointB.y);


    if (
        !Number.isFinite(x1) ||
        !Number.isFinite(y1) ||
        !Number.isFinite(x2) ||
        !Number.isFinite(y2)
    ) {

        return Infinity;

    }


    const dx =
        x1 -
        x2;


    const dy =
        y1 -
        y2;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    generateEvacuationRoutes

};