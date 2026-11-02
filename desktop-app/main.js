// ==========================================
// AI FIRE EVACUATION SYSTEM
// MAIN PROCESS
// ==========================================

const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    session
} = require("electron");

const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

// Backend server process management
let backendProcess = null;

function checkBackendHealth(timeoutMs = 1200) {
    return new Promise((resolve) => {
        const req = http.get("http://127.0.0.1:5000/api/health", (res) => {
            resolve(res.statusCode === 200);
        });
        req.on("error", () => resolve(false));
        req.setTimeout(timeoutMs, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function waitForBackend(maxAttempts = 25, delayMs = 250) {
    for (let i = 0; i < maxAttempts; i++) {
        const isUp = await checkBackendHealth(600);
        if (isUp) {
            console.log(`[Electron] Backend server is verified healthy & ready (attempt ${i + 1}).`);
            return true;
        }
        await new Promise((r) => setTimeout(r, delayMs));
    }
    console.warn("[Electron] Backend readiness polling timed out; launching window anyway.");
    return false;
}

async function ensureBackendRunning() {
    try {
        const isAlreadyRunning = await checkBackendHealth(800);
        if (isAlreadyRunning) {
            console.log("[Electron] Backend server is already running on port 5000.");
            return;
        }

        const backendDir = path.resolve(__dirname, "../backend");
        const serverScript = path.join(backendDir, "server.js");

        console.log("[Electron] Automatically starting Backend Server:", serverScript);
        backendProcess = spawn("node", ["server.js"], {
            cwd: backendDir,
            env: { ...process.env, PORT: "5000" },
            stdio: "pipe",
            shell: true
        });

        backendProcess.stdout.on("data", (data) => {
            console.log(`[Backend] ${data.toString().trim()}`);
        });

        backendProcess.stderr.on("data", (data) => {
            console.error(`[Backend ERR] ${data.toString().trim()}`);
        });

        backendProcess.on("exit", (code) => {
            console.log(`[Backend] Process exited with code ${code}`);
            backendProcess = null;
        });

        // Block launch until backend is actually listening and ready to accept requests
        await waitForBackend(25, 250);
    } catch (err) {
        console.error("[Electron] Failed to start backend server:", err);
    }
}

function stopBackend() {
    if (backendProcess) {
        console.log("[Electron] Stopping auto-started backend server...");
        try {
            if (process.platform === "win32" && backendProcess.pid) {
                const { exec } = require("child_process");
                exec(`taskkill /pid ${backendProcess.pid} /T /F`, () => {});
            } else {
                backendProcess.kill();
            }
        } catch (e) {}
        backendProcess = null;
    }
}


// ==========================================
// IMPORT SERVICES
// ==========================================

const api =
    require("./src/services/api");


// ==========================================
// IMPORT BLUEPRINT CONTROLLER
// ==========================================

const {
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
} = require(
    "./src/controllers/blueprintController"
);


// ==========================================
// CREATE WINDOW
// ==========================================

function createWindow() {

    const win =
        new BrowserWindow({

            width: 1400,

            height: 900,

            minWidth: 1024,

            minHeight: 650,

            autoHideMenuBar: true,

            webPreferences: {

                // ROOT preload.js
                preload: path.join(
                    __dirname,
                    "preload.js"
                ),

                contextIsolation: true,

                nodeIntegration: false

            }

        });

    win.maximize();


    // ======================================
    // LOAD RENDERER
    // ======================================

    win.loadFile(
        path.join(
            __dirname,
            "src",
            "renderer",
            "index.html"
        )
    );


    // ======================================
    // DEBUGGING (DevTools)
    // ======================================

    // Uncomment below if you want DevTools open for debugging
    // win.webContents.openDevTools();

}


// ==========================================
// APP READY
// ==========================================

app.whenReady().then(async () => {

    // Ensure backend server is running alongside desktop frontend
    await ensureBackendRunning();

    // Handle camera media permissions for AR mode
    if (session && session.defaultSession) {
        session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
            if (permission === "media") return callback(true);
            callback(true);
        });
    }


    // ======================================
    // GET ALERTS
    // ======================================

    ipcMain.handle(
        "api:getAlerts",
        async (event, floorLevel) => {

            return await api.getAlerts(floorLevel);

        }
    );


    // ======================================
    // GET MAP DATA
    // ======================================

    ipcMain.handle(
        "api:getMapData",
        async () => {

            return await api.getMapData();

        }
    );


    // ======================================
    // GET EVACUATION ROUTE
    // ======================================

    ipcMain.handle(
        "api:getEvacuationRoute",
        async (
            event,
            locationId,
            floorLevel,
            activeFires
        ) => {

            return await api.getEvacuationRoute(
                locationId,
                floorLevel,
                activeFires
            );

        }
    );


    // ======================================
    // BACKEND INTEGRATION HANDLERS
    // ======================================

    ipcMain.handle("api:checkBackendHealth", async () => {
        return await api.checkBackendHealth();
    });

    ipcMain.handle("api:setAuthToken", async (event, token) => {
        api.setAuthToken(token);
        return true;
    });

    ipcMain.handle("api:saveSimulationReport", async (event, reportData, customToken) => {
        return await api.saveSimulationReport(reportData, customToken);
    });

    ipcMain.handle("api:getSimulationReports", async (event, customToken) => {
        return await api.getSimulationReports(customToken);
    });

    ipcMain.handle("api:getSavedBlueprints", async () => {
        return await api.getSavedBlueprints();
    });

    ipcMain.handle("api:saveBlueprintToBackend", async (event, blueprintData) => {
        return await api.saveBlueprintToBackend(blueprintData);
    });

    ipcMain.handle("api:generateAIBlueprint", async (event, prompt, buildingType) => {
        return await api.generateAIBlueprint(prompt, buildingType);
    });

    ipcMain.handle("api:login", async (event, email, password) => {
        return await api.login(email, password);
    });

    ipcMain.handle("api:register", async (event, name, email, password, role) => {
        return await api.register(name, email, password, role);
    });


    // ======================================
    // SELECT BLUEPRINT
    // ======================================

    ipcMain.handle(
        "api:selectBlueprint",
        async () => {

            const result =
                await dialog.showOpenDialog({

                    title:
                        "Select Building Blueprint",

                    properties: [
                        "openFile"
                    ],

                    filters: [

                        {
                            name:
                                "Blueprint Images",

                            extensions: [
                                "png",
                                "jpg",
                                "jpeg",
                                "webp"
                            ]
                        },

                        {
                            name:
                                "All Files",

                            extensions: [
                                "*"
                            ]
                        }

                    ]

                });


            if (
                result.canceled ||
                result.filePaths.length === 0
            ) {

                return {

                    success: false,

                    canceled: true

                };

            }


            return {

                success: true,

                filePath:
                    result.filePaths[0]

            };

        }
    );


    // ======================================
    // PROCESS BLUEPRINT
    // ======================================

    ipcMain.handle(
        "api:processBlueprint",
        async (
            event,
            filePath
        ) => {

            try {

                if (!filePath) {

                    throw new Error(
                        "Blueprint file path is missing."
                    );

                }


                console.log(
                    "=================================="
                );

                console.log(
                    "PROCESSING BLUEPRINT"
                );

                console.log(
                    "File:",
                    filePath
                );

                console.log(
                    "=================================="
                );


                const result =
                    await processUploadedBlueprint(
                        filePath
                    );


                return {

                    success: true,

                    data: result

                };

            }


            catch (error) {

                console.error(
                    "Blueprint processing failed:",
                    error
                );


                return {

                    success: false,

                    error:
                        error.message

                };

            }

        }
    );


    // ======================================
    // GET CURRENT BUILDING
    // ======================================

    ipcMain.handle(
        "api:getBuilding",
        () => {

            return getCurrentBuilding();

        }
    );


    // ======================================
    // CHECK BUILDING
    // ======================================

    ipcMain.handle(
        "api:hasBuilding",
        () => {

            return hasBuilding();

        }
    );


    // ======================================
    // GET CURRENT FLOOR
    // ======================================

    ipcMain.handle(
        "api:getCurrentFloor",
        () => {

            return getCurrentFloor();

        }
    );


    // ======================================
    // GET ROOMS
    // ======================================

    ipcMain.handle(
        "api:getRooms",
        () => {

            return getRooms();

        }
    );


    // ======================================
    // GET DOORS
    // ======================================

    ipcMain.handle(
        "api:getDoors",
        () => {

            return getDoors();

        }
    );


    // ======================================
    // GET EXITS
    // ======================================

    ipcMain.handle(
        "api:getExits",
        () => {

            return getExits();

        }
    );


    // ======================================
    // GET FIRES
    // ======================================

    ipcMain.handle(
        "api:getFires",
        () => {

            return getFires();

        }
    );


    // ======================================
    // GET EVACUATION ROUTES
    // ======================================

    ipcMain.handle(
        "api:getRoutes",
        () => {

            return getRoutes();

        }
    );


    // ======================================
    // GET BUILDING SUMMARY
    // ======================================

    ipcMain.handle(
        "api:getBuildingSummary",
        () => {

            return getBuildingSummary();

        }
    );


    // ======================================
    // CLEAR BUILDING
    // ======================================

    ipcMain.handle(
        "api:clearBuilding",
        () => {

            clearBuilding();

            return {
                success: true
            };

        }
    );


    // ======================================
    // CREATE WINDOW
    // ======================================

    createWindow();

});


// ==========================================
// WINDOW CLOSE
// ==========================================

app.on(
    "window-all-closed",
    () => {

        stopBackend();

        if (
            process.platform !== "darwin"
        ) {

            app.quit();

        }

    }
);

app.on("will-quit", () => {
    stopBackend();
});


// ==========================================
// MACOS
// ==========================================

app.on(
    "activate",
    () => {

        if (
            BrowserWindow
                .getAllWindows()
                .length === 0
        ) {

            createWindow();

        }

    }
);