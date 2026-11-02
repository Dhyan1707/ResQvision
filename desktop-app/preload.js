// ==========================================
// AI FIRE EVACUATION SYSTEM
// PRELOAD SCRIPT
// ==========================================
//
// Secure bridge between Renderer and Main
// ==========================================

const {
    contextBridge,
    ipcRenderer,
    webUtils,
    webFrame
} = require("electron");

// Force reset and lock zoom level
webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);

// ==========================================
// EXPOSE API TO RENDERER
// ==========================================

contextBridge.exposeInMainWorld(
    "electronAPI",
    {
        // ======================================
        // FIRE / HAZARD ALERTS
        // ======================================
        getAlerts: (floorLevel) => {
            return ipcRenderer.invoke(
                "api:getAlerts",
                floorLevel
            );
        },

        // ======================================
        // BUILDING / MAP DATA
        // ======================================
        getMapData: () => {
            return ipcRenderer.invoke(
                "api:getMapData"
            );
        },

        // ======================================
        // EVACUATION ROUTE
        // ======================================
        getEvacuationRoute: (locationId, floorLevel, activeFires) => {
            return ipcRenderer.invoke(
                "api:getEvacuationRoute",
                locationId,
                floorLevel,
                activeFires
            );
        },

        // ======================================
        // BLUEPRINT PROCESSING
        // ======================================
        processBlueprint: (filePath) => {
            return ipcRenderer.invoke(
                "api:processBlueprint",
                filePath
            );
        },

        // ======================================
        // SELECT BLUEPRINT
        // ======================================
        selectBlueprint: () => {
            return ipcRenderer.invoke(
                "api:selectBlueprint"
            );
        },

        // ======================================
        // BUILDING CONTROLLER DATA
        // ======================================
        getBuilding: () => {
            return ipcRenderer.invoke(
                "api:getBuilding"
            );
        },

        // ======================================
        // CHECK WHETHER BUILDING EXISTS
        // ======================================
        hasBuilding: () => {
            return ipcRenderer.invoke(
                "api:hasBuilding"
            );
        },

        // ======================================
        // BUILDING SUMMARY
        // ======================================
        getBuildingSummary: () => {
            return ipcRenderer.invoke(
                "api:getBuildingSummary"
            );
        },

        // ======================================
        // GET CURRENT FLOOR
        // ======================================
        getCurrentFloor: () => {
            return ipcRenderer.invoke(
                "api:getCurrentFloor"
            );
        },

        // ======================================
        // GET ROOMS
        // ======================================
        getRooms: () => {
            return ipcRenderer.invoke(
                "api:getRooms"
            );
        },

        // ======================================
        // GET DOORS
        // ======================================
        getDoors: () => {
            return ipcRenderer.invoke(
                "api:getDoors"
            );
        },

        // ======================================
        // GET EXITS
        // ======================================
        getExits: () => {
            return ipcRenderer.invoke(
                "api:getExits"
            );
        },

        // ======================================
        // GET FIRES
        // ======================================
        getFires: () => {
            return ipcRenderer.invoke(
                "api:getFires"
            );
        },

        // ======================================
        // GET EVACUATION ROUTES
        // ======================================
        getRoutes: () => {
            return ipcRenderer.invoke(
                "api:getRoutes"
            );
        },

        // ======================================
        // CLEAR CURRENT BUILDING
        // ======================================
        clearBuilding: () => {
            return ipcRenderer.invoke(
                "api:clearBuilding"
            );
        },

        // ======================================
        // BACKEND INTEGRATION APIs
        // ======================================
        checkBackendHealth: () => {
            return ipcRenderer.invoke(
                "api:checkBackendHealth"
            );
        },

        setAuthToken: (token) => {
            return ipcRenderer.invoke(
                "api:setAuthToken",
                token
            );
        },

        saveSimulationReport: (reportData, customToken) => {
            return ipcRenderer.invoke(
                "api:saveSimulationReport",
                reportData,
                customToken
            );
        },

        getSimulationReports: (customToken) => {
            return ipcRenderer.invoke(
                "api:getSimulationReports",
                customToken
            );
        },

        getSavedBlueprints: () => {
            return ipcRenderer.invoke(
                "api:getSavedBlueprints"
            );
        },

        saveBlueprintToBackend: (blueprintData) => {
            return ipcRenderer.invoke(
                "api:saveBlueprintToBackend",
                blueprintData
            );
        },

        generateAIBlueprint: (prompt, buildingType) => {
            return ipcRenderer.invoke(
                "api:generateAIBlueprint",
                prompt,
                buildingType
            );
        },

        login: (email, password) => {
            return ipcRenderer.invoke(
                "api:login",
                email,
                password
            );
        },

        register: (name, email, password, role) => {
            return ipcRenderer.invoke(
                "api:register",
                name,
                email,
                password,
                role
            );
        },

        // ======================================
        // GET ACTUAL FILE PATH (Electron 32+)
        // ======================================
        getFilePath: (file) => {
            if (!file) {
                return null;
            }
            try {
                return webUtils.getPathForFile(file);
            } catch (error) {
                console.error("Failed to get file path:", error);
                return null;
            }
        }
    }
);
