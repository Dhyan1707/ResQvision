// ==========================================
// BLUEPRINT PROCESSOR
// AI FIRE EVACUATION SYSTEM
// ==========================================
//
// MODIFIED FOR SPECIFIC COLLEGE BUILDING
// Bypassing generic dynamic analyzer
//
// ==========================================

const path = require("path");
const buildingData = require("../models/buildingData");

const ALLOWED_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
];

async function processBlueprint(filePath) {
    console.log("==================================");
    console.log("BLUEPRINT PROCESSOR STARTED");
    console.log("==================================");

    if (!filePath) {
        throw new Error("No blueprint file selected.");
    }

    const extension = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        throw new Error("Unsupported blueprint format.");
    }

    console.log("File format:", extension);
    console.log("LOADING HARDCODED COLLEGE DATA...");

    // Instead of dynamic analysis, use our new structured data
    const building = buildingData;
    building.sourceBlueprint = filePath;
    building.buildingId = "COLLEGE-BHAGUBHAI";
    building.modelType = "SPECIFIC_COLLEGE_MODEL";

    console.log("==================================");
    console.log("BLUEPRINT PROCESSING BYPASSED - LOADED COLLEGE DATA");
    console.log("==================================");
    console.log("College:", building.collegeName);
    console.log("Floors loaded:", building.floors.length);
    console.log("==================================");

    return building;
}

module.exports = {
    processBlueprint
};
