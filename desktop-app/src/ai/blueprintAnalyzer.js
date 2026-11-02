// ============================================================
// BLUEPRINT ANALYZER
// AI FIRE EVACUATION SYSTEM
// ============================================================
//
// DYNAMIC BLUEPRINT ANALYSIS
//
// IMPORTANT ARCHITECTURE:
//
// OCR is NOT the room detector.
//
// Geometry detects spaces.
// OCR only provides optional names / labels.
//
// No building positions, room counts, exits,
// stairs or routes are hard-coded.
//
// Pipeline:
//
// Blueprint
//    ↓
// Image preprocessing
//    ↓
// Multi-pass OCR
//    ↓
// OCR reliability filtering
//    ↓
// Structural geometry analysis
//    ↓
// Dynamic space detection
//    ↓
// OCR ↔ space matching
//    ↓
// Corridor detection
//    ↓
// Stair detection
//    ↓
// Door detection
//    ↓
// Exit detection
//    ↓
// Dynamic Building Model
//
// ============================================================
const sharp = require("sharp");
const { createWorker } = require("tesseract.js");
// ============================================================
// SETTINGS
// ============================================================
const ANALYSIS_WIDTH = 1800;
const OCR_WIDTH = 3000;

const OCR_MIN_CONFIDENCE = 20;
// OCR labels used as actual spatial evidence need
// much stronger confidence than general OCR.
const LABEL_MIN_CONFIDENCE = 45;

const DARK_THRESHOLD = 105;

const MIN_ROOM_WIDTH = 45;
const MIN_ROOM_HEIGHT = 40;

const MIN_REGION_AREA = 900;

const MAX_ROOM_RATIO = 0.88;

const POINT_DEDUP_DISTANCE = 35;

const DOOR_MIN_SIZE = 12;
const DOOR_MAX_SIZE = 95;

const EXIT_BOUNDARY_RATIO = 0.025;

const WALL_RUN_MIN = 4;

const MAX_OCR_LABELS_FOR_GEOMETRY = 60;

const MIN_LABEL_LETTERS = 2;
// ============================================================
// OPTIONAL SEMANTIC TYPES
// ============================================================
// These DO NOT determine whether something is a room.
// They are only optional hints.
// Therefore an arbitrary label such as:
// MASTER SUITE
// CHILDREN ROOM
// WASH AREA
// TRAINING ROOM
// SERVER BAY
// can still become a detected space even if it
// does not exist in this dictionary.
// ============================================================
const SPACE_TYPE_KEYWORDS = {
    BEDROOM: [
        "BED",
        "BEDROOM",
        "BED RM",
        "BEDRM",
        "MASTER",
        "BED ROOM"
    ],
    TOILET: [
        "TOILET",
        "WC",
        "W C",
        "WASHROOM",
        "BATH",
        "BATHROOM",
        "LAVATORY"
    ],
    KITCHEN: [
        "KITCHEN",
        "KIT",
        "KITCH"
    ],
    DINING: [
        "DINING",
        "DIN",
        "DINING ROOM"
    ],
    LIVING: [
        "LIVING",
        "LOUNGE",
        "DRAWING",
        "DRAWING ROOM",
        "LIVING ROOM"
    ],
    OFFICE: [
        "OFFICE",
        "CABIN",
        "WORKSPACE",
        "WORK ROOM"
    ],
    CLASSROOM: [
        "CLASSROOM",
        "CLASS",
        "LECTURE",
        "LECTURE ROOM"
    ],
    LABORATORY: [
        "LAB",
        "LABORATORY"
    ],
    STORAGE: [
        "STORE",
        "STORAGE",
        "STORE ROOM"
    ],
    SERVER_ROOM: [
        "SERVER",
        "SERVER ROOM",
        "SERVERROOM"
    ],
    RECEPTION: [
        "RECEPTION"
    ],
    LOBBY: [
        "LOBBY"
    ],
    CORRIDOR: [
        "CORRIDOR",
        "PASSAGE",
        "HALLWAY",
        "HALL"
    ],
    STAIR: [
        "STAIR",
        "STAIRS",
        "STAIRCASE",
        "STAIRWAY"
    ],
    EXIT: [
        "EXIT",
        "FIRE EXIT",
        "EMERGENCY EXIT",
        "EXIT DOOR"
    ],
    ENTRANCE: [
        "ENTRANCE",
        "ENTRY",
        "MAIN ENTRY",
        "MAIN ENTRANCE"
    ],
    PORCH: [
        "PORCH"
    ],
    VERANDA: [
        "VERANDA",
        "VERANDAH",
        "VER"
    ]
};
// ============================================================
// MAIN ANALYZER
// ============================================================
async function analyzeBlueprint(filePath, options = {}) {
    console.log("");
    console.log("================================================");
    console.log("DYNAMIC BLUEPRINT ANALYSIS STARTED");
    console.log("================================================");
    if (!filePath) {
        throw new Error("Blueprint file path is required.");
    }

    const source = sharp(filePath);

    const metadata =
        await source.metadata();

    const originalWidth =
        metadata.width;

    const originalHeight =
        metadata.height;
    if (
        !originalWidth ||
        !originalHeight
    ) {
        throw new Error(
            "Unable to read blueprint dimensions."
        );
    }
    console.log(
        "Original blueprint:",
        originalWidth,
        "x",
        originalHeight
    );
    // ========================================================
    // ANALYSIS IMAGE
    // ========================================================
    const scale =
        Math.min(
            1,
            ANALYSIS_WIDTH /
            originalWidth
        );

    const analysisWidth =
        Math.max(
            1000,
            Math.round(
                originalWidth *
                scale
            )
        );

    const analysisHeight =
        Math.max(
            1,
            Math.round(
                originalHeight *
                (
                    analysisWidth /
                    originalWidth
                )
            )
        );

    const analysisResult =
        await source
            .clone()
            .resize({
                width:
                    analysisWidth,

                height:
                    analysisHeight,

                fit:
                    "fill"
            })
            .grayscale()
            .normalize()
            .sharpen({
                sigma: 1.0
            })
            .raw()
            .toBuffer({
                resolveWithObject:
                    true
            });

    const data =
        analysisResult.data;

    console.log(
        "Analysis image:",
        analysisWidth,
        "x",
        analysisHeight
    );
    // ========================================================
    // OCR
    // ========================================================
    console.log(
        "Running multi-pass OCR..."
    );

    const ocrLabels =
        await detectBlueprintLabels(
            filePath,
            originalWidth,
            originalHeight
        );

    console.log(
        "OCR labels:",
        ocrLabels.length
    );
    // ========================================================
    // STRUCTURAL MAP
    // ========================================================
    console.log(
        "Building structural map..."
    );

    const structuralMap =
        createStructuralMap(
            data,
            analysisWidth,
            analysisHeight
        );
    // ========================================================
    // GEOMETRIC SPACE DETECTION
    // ========================================================
    console.log(
        "Detecting enclosed spaces from geometry..."
    );

    const geometricRegions =
        detectGeometricRegions(
            structuralMap,
            analysisWidth,
            analysisHeight
        );

    console.log(
        "Geometric regions:",
        geometricRegions.length
    );

    console.log("----------------------------------");
    console.log("GEOMETRIC REGION STRUCTURE");
    console.log("----------------------------------");

    for (let i = 0; i < geometricRegions.length; i++) {
        console.log(`REGION ${i + 1}:`);
        console.log(JSON.stringify(geometricRegions[i], null, 2));
    }

    console.log("----------------------------------");
    // ========================================================
    // OCR-SEEDED SPACE DETECTION       
    // ========================================================
    // OCR is ONLY used as a seed.
    // The label itself does not make a room.
    // A room is created only when wall geometry
    // surrounding the label is strong enough.
    // ========================================================
    console.log(
        "Detecting spaces from OCR + wall geometry..."
    );

    const labeledSpaces =
        detectSpacesFromLabels(
            ocrLabels,
            structuralMap,
            data,
            analysisWidth,
            analysisHeight,
            originalWidth,
            originalHeight
        );

    console.log(
        "Spaces detected from OCR + geometry:",
        labeledSpaces.length
    );
    // ========================================================
    // GEOMETRIC SPACES
    // ========================================================
    const geometricSpaces =
        convertRegionsToSpaces(
            geometricRegions,
            ocrLabels,
            originalWidth,
            originalHeight,
            analysisWidth,
            analysisHeight
        );
    // ========================================================
    // MERGE
    // ========================================================
    let allSpaces =
        mergeDynamicSpaces(
            labeledSpaces,
            geometricSpaces
        );
    // ========================================================
    // REMOVE DUPLICATES
    // ========================================================
    allSpaces =
        removeDuplicateSpaces(
            allSpaces
        );
    // ========================================================
    // VALIDATE
    // ========================================================
    allSpaces =
        allSpaces.filter(
            space =>
                isValidSpace(
                    space,
                    originalWidth,
                    originalHeight
                )
        );
    // ========================================================
    // OPTIONAL SEMANTIC CLASSIFICATION
    // ========================================================
    classifyUnknownSpaces(
        allSpaces,
        ocrLabels
    );
    // ========================================================
    // ROOMS
    // ========================================================
    const rooms =
        allSpaces.filter(
            space =>
                space.category ===
                "ROOM"
        );
    // ========================================================
    // CORRIDORS
    // ========================================================
    const corridors =
        allSpaces.filter(
            space =>
                space.category ===
                "CORRIDOR"
        );


    console.log(
        "Rooms detected:",
        rooms.length
    );

    console.log(
        "Corridors detected:",
        corridors.length
    );
    // ========================================================
    // STAIRS
    // ========================================================
    console.log(
        "Detecting stairs..."
    );

    const stairs =
        detectStairs(
            ocrLabels,
            structuralMap,
            data,
            analysisWidth,
            analysisHeight,
            originalWidth,
            originalHeight
        );
    // =======================================================
    // DOORS
    // ========================================================
    console.log(
        "Detecting doors..."
    );

    const doors =
        detectDoors(
            rooms,
            corridors,
            data,
            analysisWidth,
            analysisHeight,
            originalWidth,
            originalHeight
        );
    // ========================================================
    // ASSIGN DOORS
    // ========================================================
    assignDoorsToSpaces(
        doors,
        allSpaces
    );
    // ========================================================
    // EXITS
    // ========================================================
    console.log(
        "Detecting exits..."
    );
    const exits =
        detectExits(
            doors,
            ocrLabels,
            originalWidth,
            originalHeight,
            allSpaces,
            structuralMap,
            analysisWidth,
            analysisHeight
        );
    // ========================================================
    // SPECIAL SPACES
    // ========================================================
    const specialSpaces =
        allSpaces.filter(
            space =>
                space.category ===
                "SPECIAL"
        );
    // ========================================================
    // FLOOR
    // ========================================================
    const floor = {

        floorNumber:
            options.floorNumber ||
            1,

        rooms,

        corridors,

        doors,

        exits,

        stairs,

        fires: [],

        occupants: [],

        paths: [],

        spaces:
            allSpaces,

        specialSpaces
    };
    // ========================================================
    // BUILDING MODEL
    // ========================================================
    const building = {

        buildingId:
            createId(
                "BUILDING"
            ),

        buildingName:
            options.buildingName ||
            "Dynamically Analyzed Building",

        sourceBlueprint:
            filePath,

        modelType:
            "DYNAMIC_BLUEPRINT_MODEL",

        analysis: {

            imageWidth:
                originalWidth,

            imageHeight:
                originalHeight,

            analysisWidth,

            analysisHeight,

            detectedOCRLabels:
                ocrLabels.length,

            detectedGeometricRegions:
                geometricRegions.length,

            detectedSpaces:
                allSpaces.length,

            detectedRooms:
                rooms.length,

            detectedCorridors:
                corridors.length,

            detectedDoors:
                doors.length,

            detectedExits:
                exits.length,

            detectedStairs:
                stairs.length
        },

        floors: [
            floor
        ],

        simulator: {

            fireEvents: [],

            evacuationEvents: [],

            activeSimulation:
                false
        },

        metadata: {

            createdAt:
                new Date().toISOString(),

            analyzerVersion:
                "DYNAMIC-V6.0-GEOMETRY-FIRST"
        }
    };
    // ========================================================
    // FINAL LOG
    // ========================================================
    console.log("");
    console.log(
        "================================================"
    );

    console.log(
        "DYNAMIC BLUEPRINT ANALYSIS COMPLETE"
    );

    console.log(
        "================================================"
    );

    console.log(
        "OCR labels:",
        ocrLabels.length
    );

    console.log(
        "Geometric regions:",
        geometricRegions.length
    );

    console.log(
        "Spaces:",
        allSpaces.length
    );

    console.log(
        "Rooms:",
        rooms.length
    );

    console.log(
        "Corridors:",
        corridors.length
    );

    console.log(
        "Doors:",
        doors.length
    );

    console.log(
        "Exits:",
        exits.length
    );

    console.log(
        "Stairs:",
        stairs.length
    );

    console.log(
        "================================================"
    );

    return building;
}
// ============================================================
// OCR
// ============================================================
async function detectBlueprintLabels(
    filePath,
    originalWidth,
    originalHeight
) {

    console.log(
        "----------------------------------"
    );

    console.log(
        "DYNAMIC OCR STARTED"
    );

    console.log(
        "----------------------------------"
    );

    const images =
        await createOCRImages(
            filePath
        );

    let worker = null;

    try {

        worker =
            await createWorker(
                "eng",
                1,
                {
                    logger:
                        message => {

                            if (!message) {
                                return;
                            }

                            if (
                                message.status ===
                                "recognizing text"
                            ) {
                                return;
                            }

                            if (
                                message.status
                            ) {

                                console.log(
                                    `Tesseract: ${message.status}`
                                );
                            }
                        }
                }
            );


        const detectedWords = [];


        for (
            const image
            of images
        ) {

            console.log(
                `OCR pass: ${image.name}`
            );


            for (
                const psm
                of [11, 6, 3]
            ) {

                const result =
                    await runOCR(
                        worker,
                        image.buffer,
                        psm
                    );

                collectOCRWords(
                    result,
                    detectedWords,
                    image.width,
                    image.height
                );
            }
        }

        const uniqueWords =
            deduplicateOCRWords(
                detectedWords
            );

        const groupedLabels =
            groupOCRWordsIntoLabels(
                uniqueWords
            );

        console.log(
            "OCR words detected:",
            uniqueWords.length
        );

        console.log(
            "OCR labels detected:",
            groupedLabels.length
        );

        // ----------------------------------------------------
        // IMPORTANt
        // Do NOT send every OCR result into geometry.
        // ----------------------------------------------------

        const usableLabels =
            groupedLabels.filter(
                isUsableBlueprintLabel
            );

        console.log(
            "Usable blueprint labels:",
            usableLabels.length
        );

        const finalLabels =
            usableLabels.map(
                label => {

                    const scaleX =
                        originalWidth /
                        label.imageWidth;

                    const scaleY =
                        originalHeight /
                        label.imageHeight;

                    return {

                        id:
                            createId(
                                "LABEL"
                            ),

                        text:
                            cleanOCRText(
                                label.text
                            ),

                        normalizedText:
                            normalizeText(
                                label.text
                            ),

                        semanticType:
                            classifyText(
                                label.text
                            ),

                        x:
                            Math.round(
                                label.x *
                                scaleX
                            ),

                        y:
                            Math.round(
                                label.y *
                                scaleY
                            ),

                        width:
                            Math.max(
                                1,
                                Math.round(
                                    label.width *
                                    scaleX
                                )
                            ),

                        height:
                            Math.max(
                                1,
                                Math.round(
                                    label.height *
                                    scaleY
                                )
                            ),

                        confidence:
                            label.confidence,

                        votes:
                            label.votes ||
                            1
                    };
                }
            );

        // Highest-quality labels first.

        finalLabels.sort(
            (a, b) =>
                (
                    b.confidence +
                    (b.votes * 8)
                ) -
                (
                    a.confidence +
                    (a.votes * 8)
                )
        );

        const limitedLabels =
            finalLabels.slice(
                0,
                MAX_OCR_LABELS_FOR_GEOMETRY
            );

        console.log(
            "Labels used for spatial analysis:",
            limitedLabels.length
        );

        limitedLabels
            .slice(0, 20)
            .forEach(
                label => {

                    console.log(
                        `OCR LABEL: "${label.text}" confidence=${Math.round(label.confidence)}% votes=${label.votes}`
                    );
                }
            );

        return limitedLabels;

    }
    catch (error) {

        console.error(
            "Dynamic OCR failed:",
            error.message
        );

        return [];

    }
    finally {

        if (worker) {

            try {

                await worker.terminate();

            }
            catch (error) {

                console.error(
                    "OCR worker termination failed:",
                    error.message
                );
            }
        }
    }
}
// ============================================================
// OCR IMAGE CREATION
// ===========================================================
async function createOCRImages(
    filePath
) {

    const base =
        sharp(filePath)
            .resize({
                width:
                    OCR_WIDTH,

                withoutEnlargement:
                    false
            })
            .grayscale();


    const normal =
        await base
            .clone()
            .normalize()
            .sharpen({
                sigma:
                    1.2
            })
            .png()
            .toBuffer();


    const contrast =
        await base
            .clone()
            .normalize()
            .linear(
                1.6,
                -65
            )
            .sharpen({
                sigma:
                    1.3
            })
            .png()
            .toBuffer();


    const threshold =
        await base
            .clone()
            .normalize()
            .threshold(
                170
            )
            .png()
            .toBuffer();


    const metadata =
        await sharp(
            normal
        ).metadata();


    const imageWidth =
        metadata.width ||
        OCR_WIDTH;

    const imageHeight =
        metadata.height ||
        1;


    return [

        {
            name:
                "normal",

            buffer:
                normal,

            width:
                imageWidth,

            height:
                imageHeight
        },

        {
            name:
                "contrast",

            buffer:
                contrast,

            width:
                imageWidth,

            height:
                imageHeight
        },

        {
            name:
                "threshold",

            buffer:
                threshold,

            width:
                imageWidth,

            height:
                imageHeight
        }
    ];
}
// ============================================================
// OCR EXECUTION
// ============================================================
async function runOCR(
    worker,
    imageBuffer,
    psm
) {

    if (!worker) {

        throw new Error(
            "OCR worker is not initialized."
        );
    }

    if (!imageBuffer) {

        throw new Error(
            "OCR image buffer is missing."
        );
    }


    try {

        await worker.setParameters({

            tessedit_pageseg_mode:
                String(psm),

            preserve_interword_spaces:
                "1",

            user_defined_dpi:
                "300"
        });


        return await worker.recognize(
            imageBuffer,
            {},
            {
                blocks:
                    true
            }
        );

    }
    catch (error) {

        console.error(
            `OCR recognition failed for PSM ${psm}:`,
            error.message
        );

        return null;
    }
}
// ============================================================
// COLLECT OCR WORDS
// ============================================================
function collectOCRWords(
    result,
    output,
    imageWidth,
    imageHeight
) {
    if (
        !result ||
        !result.data ||
        !Array.isArray(output)
    ) {

        return;
    }
    const data =
        result.data;


    let words = [];

    if (
        Array.isArray(
            data.words
        )
    ) {

        words =
            data.words;
    }
    if (
        words.length === 0 &&
        Array.isArray(
            data.blocks
        )
    ) {

        for (
            const block
            of data.blocks
        ) {

            if (
                !block ||
                !Array.isArray(
                    block.paragraphs
                )
            ) {

                continue;
            }


            for (
                const paragraph
                of block.paragraphs
            ) {

                if (
                    !paragraph ||
                    !Array.isArray(
                        paragraph.lines
                    )
                ) {

                    continue;
                }


                for (
                    const line
                    of paragraph.lines
                ) {

                    if (
                        !line ||
                        !Array.isArray(
                            line.words
                        )
                    ) {

                        continue;
                    }


                    words.push(
                        ...line.words
                    );
                }
            }
        }
    }
    for (
        const word
        of words
    ) {

        if (!word) {
            continue;
        }

        const text =
            String(
                word.text ||
                ""
            ).trim();


        if (!text) {
            continue;
        }

        const confidence =
            Number(
                word.confidence ??
                word.conf ??
                0
            );

        if (
            confidence <
            OCR_MIN_CONFIDENCE
        ) {

            continue;
        }

        const bbox =
            word.bbox ||
            {};

        const x0 =
            Number(
                bbox.x0 ??
                word.x ??
                0
            );

        const y0 =
            Number(
                bbox.y0 ??
                word.y ??
                0
            );

        const x1 =
            Number(
                bbox.x1 ??
                (
                    x0 +
                    Number(
                        word.width ||
                        0
                    )
                )
            );

        const y1 =
            Number(
                bbox.y1 ??
                (
                    y0 +
                    Number(
                        word.height ||
                        0
                    )
                )
            );

        const width =
            Math.max(
                1,
                x1 -
                x0
            );

        const height =
            Math.max(
                1,
                y1 -
                y0
            );

        if (
            x0 < 0 ||
            y0 < 0 ||
            x0 >= imageWidth ||
            y0 >= imageHeight
        ) {

            continue;
        }

        if (
            x0 + width >
            imageWidth ||
            y0 + height >
            imageHeight
        ) {

            continue;
        }

        if (
            width < 3 ||
            height < 3
        ) {

            continue;
        }

        output.push({

            text,

            x:
                Math.round(
                    x0
                ),

            y:
                Math.round(
                    y0
                ),

            width:
                Math.round(
                    width
                ),

            height:
                Math.round(
                    height
                ),

            confidence,

            imageWidth,

            imageHeight
        });
    }
}
// ============================================================
// OCR WORD DEDUPLICATION
// ============================================================
// Genuine blueprint text normally appears in multiple
// OCR passes.
// We count repeated detections.
// This prevents one random OCR hallucination from
// creating a room.
// ============================================================
function deduplicateOCRWords(
    words
) {
    const result = [];
    for (
        const word
        of words
    ) {
        const normalized =
            normalizeText(
                word.text
            );
        if (!normalized) {
            continue;
        }
        const duplicate =
            result.find(
                existing => {

                    return (

                        normalizeText(
                            existing.text
                        ) ===
                        normalized

                        &&

                        Math.abs(
                            existing.x -
                            word.x
                        ) < 45

                        &&

                        Math.abs(
                            existing.y -
                            word.y
                        ) < 45
                    );
                }
            );

        if (!duplicate) {

            result.push({

                ...word,

                votes:
                    1
            });

            continue;
        }

        duplicate.votes =
            (
                duplicate.votes ||
                1
            ) + 1;

        if (
            word.confidence >
            duplicate.confidence
        ) {

            duplicate.text =
                word.text;

            duplicate.x =
                word.x;

            duplicate.y =
                word.y;

            duplicate.width =
                word.width;

            duplicate.height =
                word.height;

            duplicate.confidence =
                word.confidence;
        }
    }
    return result;
}
// ============================================================
// GROUP OCR WORDS
// ============================================================
function groupOCRWordsIntoLabels(
    words
) {

    const labels = [];
    const sorted =
        [...words]
            .filter(
                word =>
                    word &&
                    normalizeText(
                        word.text
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.y -
                    b.y ||
                    a.x -
                    b.x
            );

    for (
        const word
        of sorted
    ) {

        let attached =
            false;

        const wordCenterY =
            word.y +
            word.height /
            2;

        for (
            const label
            of labels
        ) {

            const labelRight =
                label.x +
                label.width;

            const labelCenterY =
                label.y +
                label.height /
                2;

            const verticalDistance =
                Math.abs(
                    wordCenterY -
                    labelCenterY
                );

            const horizontalDistance =
                word.x -
                labelRight;

            const sameLine =
                verticalDistance <=
                Math.max(
                    18,
                    word.height *
                    1.5
                );

            const closeEnough =
                horizontalDistance >=
                -15 &&

                horizontalDistance <=
                Math.max(
                    80,
                    word.width *
                    2
                );

            if (
                sameLine &&
                closeEnough
            ) {

                label.text =
                    `${label.text} ${word.text}`;

                const newRight =
                    Math.max(
                        labelRight,
                        word.x +
                        word.width
                    );

                const newBottom =
                    Math.max(
                        label.y +
                        label.height,
                        word.y +
                        word.height
                    );

                label.width =
                    newRight -
                    label.x;

                label.height =
                    newBottom -
                    label.y;

                label.confidence =
                    Math.max(
                        label.confidence,
                        word.confidence
                    );

                label.votes =
                    Math.max(
                        label.votes ||
                        1,
                        word.votes ||
                        1
                    );

                attached =
                    true;

                break;
            }
        }

        if (!attached) {

            labels.push({

                text:
                    word.text,

                x:
                    word.x,

                y:
                    word.y,

                width:
                    word.width,

                height:
                    word.height,

                confidence:
                    word.confidence,

                votes:
                    word.votes ||
                    1,

                imageWidth:
                    word.imageWidth,

                imageHeight:
                    word.imageHeight
            });
        }
    }
    return labels;
}
// ============================================================
// OCR LABEL QUALITY FILTER
// ============================================================
// This is NOT a vocabulary filter.
// It only rejects OCR garbage.
// Arbitrary valid room names remain allowed.
// ============================================================
function isUsableBlueprintLabel(
    label
) {
    if (!label) {
        return false;
    }
    const text =
        normalizeText(
            label.text
        );

    if (!text) {
        return false;
    }
    const confidence =
        Number(
            label.confidence ||
            0
        );

    const votes =
        Number(
            label.votes ||
            1
        );

    const letters =
        (
            text.match(
                /[A-Z]/g
            ) ||
            []
        ).length;

    const digits =
        (
            text.match(
                /[0-9]/g
            ) ||
            []
        ).length;
    const total =
        Math.max(
            1,
            text.replace(
                /\s/g,
                ""
            ).length
        );
    // Reject tiny OCR garbage.
    if (
        text.length <
        2
    ) {
        return false;
    }
    // At least two letters for a normal label.
    // Codes such as R1 are allowed separately.
    const isCode =
        /^[A-Z]{1,4}[0-9]{1,4}$/
            .test(text.replace(/\s/g, ""));

    if (
        letters <
        MIN_LABEL_LETTERS &&
        !isCode
    ) {
        return false;
    }
    // Reject dimensions such as:
    // 17X11
    // 10X12
    // 9'-6"
    // 12.5 X 10
    if (
        isDimensionText(
            text
        )
    ) {
        return false;
    }
    // Reject labels dominated by digits.

    if (
        digits >
        letters * 2
    ) {

        return false;
    }
    // Require either:
    // strong OCR confidence
    // OR repeated OCR detection.
    if (
        confidence <
        LABEL_MIN_CONFIDENCE &&
        votes <
        2
    ) {

        return false;
    }
    // Reject very low-confidence long garbage.
    if (
        confidence <
        55 &&
        votes <
        2 &&
        total >
        12
    ) {

        return false;
    }
    return true;
}
// ============================================================
// DIMENSION TEXT
// ============================================================
function isDimensionText(
    text
) {

    const value =
        normalizeText(
            text
        );

    if (
        /^\d+\s*X\s*\d+$/i
            .test(value)
    ) {

        return true;
    }

    if (
        /^\d+(\.\d+)?\s*X\s*\d+(\.\d+)?$/i
            .test(value)
    ) {

        return true;
    }

    if (
        /^\d+\s*FT\s*X\s*\d+/i
            .test(value)
    ) {

        return true;
    }

    if (
        /^\d+\s*X\s*\d+\s*(FT|M)?$/i
            .test(value)
    ) {

        return true;
    }
    return false;
}
// ============================================================
// CLEAN OCR TEXT
// ============================================================
function cleanOCRText(
    text
) {
    return String(
        text ||
        ""
    )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}
// ============================================================
// STRUCTURAL MAP
// ============================================================
// ============================================================
// STRUCTURAL MAP - WALL FOCUSED
// ============================================================
// IMPORTANT:
// This function does NOT use OCR.
// It does NOT use room names.
// It does NOT use predefined room types.
// It extracts long structural lines from the blueprint.
// Text, dimensions and small symbols are intentionally
// suppressed as much as possible.
// ============================================================
function createStructuralMap(
    data,
    width,
    height
) {
    const total =
        width * height;

    const dark =
        new Uint8Array(total);
    // --------------------------------------------------------
    // STEP 1: Basic dark-pixel map
    // --------------------------------------------------------
    for (
        let i = 0;
        i < total;
        i++
    ) {

        dark[i] =
            data[i] < DARK_THRESHOLD
                ? 1
                : 0;
    }
    // --------------------------------------------------------
    // STEP 2: Horizontal run information
    // --------------------------------------------------------
    const horizontalRun =
        new Uint16Array(total);

    for (
        let y = 0;
        y < height;
        y++
    ) {

        let run = 0;

        for (
            let x = 0;
            x < width;
            x++
        ) {

            const index =
                y * width + x;

            if (dark[index]) {

                run++;

            } else {

                run = 0;
            }

            horizontalRun[index] =
                run;
        }
    }
    // --------------------------------------------------------
    // STEP 3: Vertical run information
    // --------------------------------------------------------
    const verticalRun =
        new Uint16Array(total);

    for (
        let x = 0;
        x < width;
        x++
    ) {

        let run = 0;

        for (
            let y = 0;
            y < height;
            y++
        ) {

            const index =
                y * width + x;

            if (dark[index]) {

                run++;

            } else {

                run = 0;
            }

            verticalRun[index] =
                run;
        }
    }
    // --------------------------------------------------------
    // STEP 4: Keep pixels that belong to structural lines
    //
    // A wall normally produces a long continuous horizontal
    // or vertical run.
    //
    // Small text strokes usually do not.
    // --------------------------------------------------------
    const wallMap =
        new Uint8Array(total);
    const MIN_LINE_LENGTH = 9;
    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            const index =
                y * width + x;

            if (!dark[index]) {
                continue;
            }
            const horizontalLength =
                getCenteredHorizontalRun(
                    dark,
                    width,
                    height,
                    x,
                    y
                );

            const verticalLength =
                getCenteredVerticalRun(
                    dark,
                    width,
                    height,
                    x,
                    y
                );

            // Strong horizontal wall
            if (
                horizontalLength >=
                MIN_LINE_LENGTH
            ) {

                wallMap[index] = 1;
                continue;
            }
            // Strong vertical wall
            if (
                verticalLength >=
                MIN_LINE_LENGTH
            ) {

                wallMap[index] = 1;
            }
        }
    }
    // --------------------------------------------------------
    // STEP 5: Reinforce structural lines
    // Blueprint walls can contain tiny breaks caused by
    // scanning/compression. We bridge only VERY small gaps.
    // We intentionally keep this small so normal door openings
    // are not closed accidentally.
    // --------------------------------------------------------
    const reinforcedMap =
        bridgeTinyStructuralGaps(
            wallMap,
            width,
            height
        );
    console.log(
        "Structural wall map created."
    );
    return reinforcedMap;
}
// ============================================================
// CENTERED HORIZONTAL RUN
// ============================================================
function getCenteredHorizontalRun(
    map,
    width,
    height,
    x,
    y
) {
    if (
        x < 0 ||
        x >= width ||
        y < 0 ||
        y >= height
    ) {
        return 0;
    }
    const index =
        y * width + x;

    if (!map[index]) {
        return 0;
    }

    let left =
        x;

    while (
        left > 0 &&
        map[
        y * width +
        (left - 1)
        ]
    ) {

        left--;
    }
    let right =
        x;

    while (
        right < width - 1 &&
        map[
        y * width +
        (right + 1)
        ]
    ) {

        right++;
    }

    return (
        right -
        left +
        1
    );
}
// ============================================================
// CENTERED VERTICAL RUN
// ============================================================
function getCenteredVerticalRun(
    map,
    width,
    height,
    x,
    y
) {

    if (
        x < 0 ||
        x >= width ||
        y < 0 ||
        y >= height
    ) {
        return 0;
    }
    const index =
        y * width + x;

    if (!map[index]) {
        return 0;
    }

    let top =
        y;

    while (
        top > 0 &&
        map[
        (top - 1) * width +
        x
        ]
    ) {

        top--;
    }


    let bottom =
        y;

    while (
        bottom < height - 1 &&
        map[
        (bottom + 1) * width +
        x
        ]
    ) {

        bottom++;
    }


    return (
        bottom -
        top +
        1
    );
}
// ============================================================
// BRIDGE TINY STRUCTURAL GAPS
// ============================================================
//
// Only gaps of 1-2 pixels are repaired.
// This is intentionally conservative.
//
// We DO NOT close normal-sized door openings.
//
function bridgeTinyStructuralGaps(
    map,
    width,
    height
) {

    const result =
        new Uint8Array(map);

    const MAX_GAP = 5;

    // --------------------------------------------------------
    // Horizontal gaps
    // --------------------------------------------------------

    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 1;
            x < width - MAX_GAP - 1;
            x++
        ) {

            const left =
                map[
                y * width +
                (x - 1)
                ];

            if (!left) {
                continue;
            }

            let gapLength = 0;
            let foundRight = false;

            for (
                let g = 0;
                g <= MAX_GAP;
                g++
            ) {

                if (
                    map[
                    y * width +
                    (x + g)
                    ]
                ) {

                    gapLength = g;
                    foundRight = true;
                    break;
                }
            }

            if (
                foundRight &&
                gapLength > 0
            ) {

                for (
                    let g = 0;
                    g < gapLength;
                    g++
                ) {

                    result[
                        y * width +
                        (x + g)
                    ] = 1;
                }

                x += gapLength - 1;
            }
        }
    }
    // --------------------------------------------------------
    // Vertical gaps
    // --------------------------------------------------------
    for (
        let x = 0;
        x < width;
        x++
    ) {

        for (
            let y = 1;
            y < height - MAX_GAP - 1;
            y++
        ) {

            const top =
                map[
                (y - 1) * width +
                x
                ];

            if (!top) {
                continue;
            }

            let gapLength = 0;
            let foundBottom = false;

            for (
                let g = 0;
                g <= MAX_GAP;
                g++
            ) {

                if (
                    map[
                    (y + g) * width +
                    x
                    ]
                ) {

                    gapLength = g;
                    foundBottom = true;
                    break;
                }
            }

            if (
                foundBottom &&
                gapLength > 0
            ) {

                for (
                    let g = 0;
                    g < gapLength;
                    g++
                ) {

                    result[
                        (y + g) * width +
                        x
                    ] = 1;
                }

                y += gapLength - 1;
            }
        }
    }

    return result;
}
// ============================================================
// OCR + WALL GEOMETRY SPACE DETECTION
// ============================================================
function detectSpacesFromLabels(
    labels,
    structuralMap,
    data,
    width,
    height,
    originalWidth,
    originalHeight
) {

    const spaces = [];

    // Strong labels first.

    const sortedLabels =
        [...labels]
            .sort(
                (a, b) =>
                    (
                        b.confidence +
                        b.votes * 10
                    ) -
                    (
                        a.confidence +
                        a.votes * 10
                    )
            );

    for (
        const label
        of sortedLabels
    ) {

        const centerX =
            label.x +
            label.width /
            2;

        const centerY =
            label.y +
            label.height /
            2;

        const analysisPoint =
            convertOriginalPointToAnalysis(
                centerX,
                centerY,
                originalWidth,
                originalHeight,
                width,
                height
            );


        const bounds =
            findRoomBoundsFromLabel(
                analysisPoint.x,
                analysisPoint.y,
                label,
                structuralMap,
                width,
                height,
                originalWidth,
                originalHeight
            );

        if (!bounds) {
            continue;
        }

        const roomWidth =
            bounds.right -
            bounds.left;

        const roomHeight =
            bounds.bottom -
            bounds.top;

        if (
            roomWidth <
            MIN_ROOM_WIDTH ||
            roomHeight <
            MIN_ROOM_HEIGHT
        ) {

            continue;
        }

        if (
            roomWidth >
            width *
            MAX_ROOM_RATIO ||
            roomHeight >
            height *
            MAX_ROOM_RATIO
        ) {

            continue;
        }

        const geometryQuality =
            calculateBoundaryQuality(
                bounds,
                structuralMap,
                width,
                height
            );

        if (
            geometryQuality <
            0.58
        ) {

            continue;
        }

        const originalBounds = {

            x:
                convertX(
                    bounds.left,
                    width,
                    originalWidth
                ),

            y:
                convertY(
                    bounds.top,
                    height,
                    originalHeight
                ),

            width:
                convertSize(
                    roomWidth,
                    width,
                    originalWidth
                ),

            height:
                convertSize(
                    roomHeight,
                    height,
                    originalHeight
                )
        };


        const semanticType =
            classifyText(
                label.text
            );


        let category =
            "ROOM";


        if (
            semanticType ===
            "CORRIDOR"
        ) {

            category =
                "CORRIDOR";
        }


        if (
            semanticType ===
            "STAIR"
        ) {

            category =
                "SPECIAL";
        }


        const space = {

            id:
                createId(
                    category ===
                        "CORRIDOR"
                        ? "CORRIDOR"
                        : "SPACE"
                ),

            name:
                cleanOCRText(
                    label.text
                ),

            type:
                semanticType ===
                    "UNKNOWN"
                    ? "UNKNOWN"
                    : semanticType,

            category,

            position: {

                x:
                    originalBounds.x,

                y:
                    originalBounds.y
            },

            size: {

                width:
                    originalBounds.width,

                height:
                    originalBounds.height
            },

            center: {

                x:
                    originalBounds.x +
                    originalBounds.width /
                    2,

                y:
                    originalBounds.y +
                    originalBounds.height /
                    2
            },

            geometry: {

                area:
                    originalBounds.width *
                    originalBounds.height
            },

            detection: {

                method:
                    "OCR SEED + ENCLOSED WALL GEOMETRY",

                confidence:
                    Math.min(
                        99,
                        (
                            label.confidence *
                            0.65
                        ) +
                        (
                            geometryQuality *
                            35
                        )
                    ),

                geometryQuality
            },

            labels: [

                {

                    id:
                        label.id,

                    text:
                        label.text,

                    semanticType:
                        label.semanticType,

                    confidence:
                        label.confidence
                }
            ],

            connectedDoors: []
        };


        // Prevent multiple OCR labels from generating
        // the same room.

        const duplicate =
            spaces.find(
                existing =>
                    boxesOverlap(
                        existing,
                        space
                    ) >
                    0.55
            );


        if (!duplicate) {

            spaces.push(
                space
            );
        }
    }


    return spaces;
}


// ============================================================
// ROOM BOUNDARY FROM LABEL
// ============================================================
//
// Important:
//
// The old implementation started searching for walls
// almost immediately beside the OCR center.
//
// That means OCR letters themselves could be detected
// as walls.
//
// This version starts outside the complete label area.
//
// ============================================================

function findRoomBoundsFromLabel(
    centerX,
    centerY,
    label,
    map,
    width,
    height,
    originalWidth,
    originalHeight
) {

    if (
        centerX < 0 ||
        centerY < 0 ||
        centerX >= width ||
        centerY >= height
    ) {

        return null;
    }


    const labelScaleX =
        width /
        Math.max(
            1,
            originalWidth
        );


    const labelScaleY =
        height /
        Math.max(
            1,
            originalHeight
        );


    const labelWidth =
        Math.max(
            4,
            label.width *
            labelScaleX
        );


    const labelHeight =
        Math.max(
            4,
            label.height *
            labelScaleY
        );


    const startHorizontal =
        Math.ceil(
            labelWidth /
            2
        ) + 8;


    const startVertical =
        Math.ceil(
            labelHeight /
            2
        ) + 8;


    const left =
        findWallRay(
            centerX,
            centerY,
            -1,
            0,
            startHorizontal,
            map,
            width,
            height
        );


    const right =
        findWallRay(
            centerX,
            centerY,
            1,
            0,
            startHorizontal,
            map,
            width,
            height
        );


    const top =
        findWallRay(
            centerX,
            centerY,
            0,
            -1,
            startVertical,
            map,
            width,
            height
        );


    const bottom =
        findWallRay(
            centerX,
            centerY,
            0,
            1,
            startVertical,
            map,
            width,
            height
        );


    if (
        left === null ||
        right === null ||
        top === null ||
        bottom === null
    ) {

        return null;
    }


    if (
        right <= left ||
        bottom <= top
    ) {

        return null;
    }


    return {

        left:
            Math.max(
                0,
                left
            ),

        right:
            Math.min(
                width - 1,
                right
            ),

        top:
            Math.max(
                0,
                top
            ),

        bottom:
            Math.min(
                height - 1,
                bottom
            )
    };
}


// ============================================================
// WALL RAY
// ============================================================

function findWallRay(
    startX,
    startY,
    dx,
    dy,
    startDistance,
    map,
    width,
    height
) {

    let darkRun = 0;


    const maxDistance =
        Math.max(
            width,
            height
        );


    for (
        let distanceValue =
            Math.max(
                5,
                startDistance
            );

        distanceValue <
        maxDistance;

        distanceValue++
    ) {

        const x =
            Math.round(
                startX +
                dx *
                distanceValue
            );


        const y =
            Math.round(
                startY +
                dy *
                distanceValue
            );


        if (
            x < 0 ||
            y < 0 ||
            x >= width ||
            y >= height
        ) {

            return null;
        }


        const dark =
            map[
            y *
            width +
            x
            ] === 1;


        if (dark) {

            darkRun++;


            if (
                darkRun >=
                WALL_RUN_MIN
            ) {

                return (
                    dx !== 0
                        ? x -
                        (
                            dx *
                            Math.floor(
                                WALL_RUN_MIN /
                                2
                            )
                        )
                        : y -
                        (
                            dy *
                            Math.floor(
                                WALL_RUN_MIN /
                                2
                            )
                        )
                );
            }

        }
        else {

            darkRun = 0;
        }
    }


    return null;
}


// ============================================================
// BOUNDARY QUALITY
// ============================================================

function calculateBoundaryQuality(
    bounds,
    map,
    width,
    height
) {

    const samples = 20;

    let total = 0;
    let dark = 0;


    for (
        let i = 0;
        i <= samples;
        i++
    ) {

        const ratio =
            i /
            samples;


        const x =
            Math.round(
                bounds.left +
                (
                    bounds.right -
                    bounds.left
                ) *
                ratio
            );


        const y =
            Math.round(
                bounds.top +
                (
                    bounds.bottom -
                    bounds.top
                ) *
                ratio
            );


        if (
            isDark(
                map,
                width,
                height,
                x,
                bounds.top
            )
        ) {
            dark++;
        }


        if (
            isDark(
                map,
                width,
                height,
                x,
                bounds.bottom
            )
        ) {
            dark++;
        }


        if (
            isDark(
                map,
                width,
                height,
                bounds.left,
                y
            )
        ) {
            dark++;
        }


        if (
            isDark(
                map,
                width,
                height,
                bounds.right,
                y
            )
        ) {
            dark++;
        }


        total += 4;
    }


    if (
        total === 0
    ) {

        return 0;
    }


    return dark / total;
}


// ============================================================
// GEOMETRIC REGION DETECTION
// ============================================================
//
// Flood-fill is retained only as supplementary evidence.
//
// It is NOT allowed to create dozens of rooms.
//
// Large connected background regions are rejected.
//
// ============================================================

function detectGeometricRegions(
    map,
    width,
    height
) {

    const visited =
        new Uint8Array(
            width *
            height
        );


    const regions = [];


    const directions = [

        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];


    for (
        let y = 1;
        y < height - 1;
        y++
    ) {

        for (
            let x = 1;
            x < width - 1;
            x++
        ) {

            const index =
                y *
                width +
                x;


            if (
                visited[index] ||
                map[index] === 1
            ) {

                continue;
            }


            const region =
                floodFillRegion(
                    x,
                    y,
                    map,
                    visited,
                    width,
                    height,
                    directions
                );


            if (!region) {
                continue;
            }


            const regionWidth =
                region.maxX -
                region.minX;


            const regionHeight =
                region.maxY -
                region.minY;


            const imageArea =
                width *
                height;


            const areaRatio =
                region.area /
                imageArea;


            // Background-sized regions are not rooms.

            if (
                areaRatio >
                0.65
            ) {

                continue;
            }


            if (
                region.area <
                MIN_REGION_AREA
            ) {

                continue;
            }


            if (
                regionWidth <
                MIN_ROOM_WIDTH ||
                regionHeight <
                MIN_ROOM_HEIGHT
            ) {

                continue;
            }


            regions.push(
                region
            );
        }
    }


    return regions;
}


// ============================================================
// FLOOD FILL
// ============================================================

function floodFillRegion(
    startX,
    startY,
    map,
    visited,
    width,
    height,
    directions
) {

    const queue = [

        {
            x:
                startX,

            y:
                startY
        }
    ];


    visited[
        startY *
        width +
        startX
    ] = 1;


    let head = 0;

    let area = 0;


    let minX =
        startX;

    let maxX =
        startX;

    let minY =
        startY;

    let maxY =
        startY;


    while (
        head <
        queue.length
    ) {

        const current =
            queue[head++];


        area++;


        minX =
            Math.min(
                minX,
                current.x
            );


        maxX =
            Math.max(
                maxX,
                current.x
            );


        minY =
            Math.min(
                minY,
                current.y
            );


        maxY =
            Math.max(
                maxY,
                current.y
            );


        for (
            const direction
            of directions
        ) {

            const nextX =
                current.x +
                direction[0];


            const nextY =
                current.y +
                direction[1];


            if (
                nextX <= 0 ||
                nextY <= 0 ||
                nextX >= width - 1 ||
                nextY >= height - 1
            ) {

                continue;
            }


            const index =
                nextY *
                width +
                nextX;


            if (
                visited[index] ||
                map[index] === 1
            ) {

                continue;
            }


            visited[index] = 1;


            queue.push({

                x:
                    nextX,

                y:
                    nextY
            });
        }
    }


    return {

        area,

        minX,

        maxX,

        minY,

        maxY
    };
}


// ============================================================
// CONVERT GEOMETRIC REGIONS
// ============================================================

function convertRegionsToSpaces(
    regions,
    labels,
    originalWidth,
    originalHeight,
    analysisWidth,
    analysisHeight
) {

    const spaces = [];


    for (
        const region
        of regions
    ) {

        const x =
            convertX(
                region.minX,
                analysisWidth,
                originalWidth
            );


        const y =
            convertY(
                region.minY,
                analysisHeight,
                originalHeight
            );


        const width =
            convertSize(
                region.maxX -
                region.minX,
                analysisWidth,
                originalWidth
            );


        const height =
            convertSize(
                region.maxY -
                region.minY,
                analysisHeight,
                originalHeight
            );


        if (
            width <
            MIN_ROOM_WIDTH ||
            height <
            MIN_ROOM_HEIGHT
        ) {

            continue;
        }


        const center = {

            x:
                x +
                width /
                2,

            y:
                y +
                height /
                2
        };


        const nearbyLabel =
            findLabelInsideRegion(
                labels,
                x,
                y,
                width,
                height
            );


        let semanticType =
            nearbyLabel
                ? nearbyLabel.semanticType
                : "UNKNOWN";


        // Geometry decides category.

        let category =
            classifyGeometricSpace(
                width,
                height,
                originalWidth,
                originalHeight
            );


        if (
            semanticType ===
            "CORRIDOR"
        ) {

            category =
                "CORRIDOR";
        }


        if (
            semanticType ===
            "STAIR"
        ) {

            category =
                "SPECIAL";
        }


        spaces.push({

            id:
                createId(
                    category ===
                        "CORRIDOR"
                        ? "CORRIDOR"
                        : "SPACE"
                ),

            name:
                nearbyLabel
                    ? nearbyLabel.text
                    : (
                        category ===
                            "CORRIDOR"
                            ? "Detected Corridor"
                            : "Detected Space"
                    ),

            type:
                semanticType,

            category,

            position: {

                x,
                y
            },

            size: {

                width,
                height
            },

            center,

            geometry: {

                area:
                    width *
                    height
            },

            detection: {

                method:
                    nearbyLabel
                        ? "GEOMETRY + OCR"
                        : "GEOMETRIC REGION ANALYSIS",

                confidence:
                    nearbyLabel
                        ? nearbyLabel.confidence
                        : 60
            },

            labels:
                nearbyLabel
                    ? [

                        {

                            id:
                                nearbyLabel.id,

                            text:
                                nearbyLabel.text,

                            semanticType:
                                nearbyLabel.semanticType,

                            confidence:
                                nearbyLabel.confidence
                        }

                    ]
                    : [],

            connectedDoors: []
        });
    }


    return spaces;
}


// ============================================================
// FIND LABEL INSIDE REGION
// ============================================================

function findLabelInsideRegion(
    labels,
    x,
    y,
    width,
    height
) {

    const regionCenterX =
        x +
        width /
        2;


    const regionCenterY =
        y +
        height /
        2;


    const candidates =
        labels.filter(
            label => {

                const labelCenterX =
                    label.x +
                    label.width /
                    2;


                const labelCenterY =
                    label.y +
                    label.height /
                    2;


                return (

                    labelCenterX >=
                    x &&

                    labelCenterX <=
                    x +
                    width &&

                    labelCenterY >=
                    y &&

                    labelCenterY <=
                    y +
                    height
                );
            }
        );


    if (
        candidates.length === 0
    ) {

        return null;
    }


    candidates.sort(
        (a, b) => {

            const aX =
                a.x +
                a.width /
                2;


            const aY =
                a.y +
                a.height /
                2;


            const bX =
                b.x +
                b.width /
                2;


            const bY =
                b.y +
                b.height /
                2;


            const distanceA =
                distance(
                    {
                        x:
                            aX,

                        y:
                            aY
                    },
                    {
                        x:
                            regionCenterX,

                        y:
                            regionCenterY
                    }
                );


            const distanceB =
                distance(
                    {
                        x:
                            bX,

                        y:
                            bY
                    },
                    {
                        x:
                            regionCenterX,

                        y:
                            regionCenterY
                    }
                );


            if (
                Math.abs(
                    a.confidence -
                    b.confidence
                ) >
                10
            ) {

                return (
                    b.confidence -
                    a.confidence
                );
            }


            return (
                distanceA -
                distanceB
            );
        }
    );


    return candidates[0];
}


// ============================================================
// GEOMETRIC CLASSIFICATION
// ============================================================

function classifyGeometricSpace(
    width,
    height,
    originalWidth,
    originalHeight
) {

    const aspectRatio =
        Math.max(
            width,
            height
        ) /
        Math.max(
            1,
            Math.min(
                width,
                height
            )
        );


    const area =
        width *
        height;


    const buildingArea =
        originalWidth *
        originalHeight;


    const areaRatio =
        area /
        Math.max(
            1,
            buildingArea
        );


    if (
        aspectRatio >=
        3.2 &&
        areaRatio <
        0.20
    ) {

        return "CORRIDOR";
    }


    return "ROOM";
}


// ============================================================
// MERGE DYNAMIC SPACES
// ============================================================

function mergeDynamicSpaces(
    labeledSpaces,
    geometricSpaces
) {

    const result = [];


    // Strong geometry-seeded spaces first.

    for (
        const space
        of labeledSpaces
    ) {

        result.push(
            space
        );
    }


    for (
        const space
        of geometricSpaces
    ) {

        const duplicate =
            result.find(
                existing =>
                    boxesOverlap(
                        existing,
                        space
                    ) >
                    0.45
            );


        if (
            duplicate
        ) {

            // Keep the geometry-generated structure
            // only when it contains stronger evidence.

            if (
                (
                    space.detection
                        ?.confidence ||
                    0
                ) >
                (
                    duplicate.detection
                        ?.confidence ||
                    0
                )
            ) {

                duplicate.position =
                    space.position;

                duplicate.size =
                    space.size;

                duplicate.center =
                    space.center;

                duplicate.geometry =
                    space.geometry;
            }

            continue;
        }


        // Supplementary geometric spaces are allowed,
        // but never giant background regions.

        if (
            space.size.width <
            0.80 *
            999999 &&
            space.size.height <
            0.80 *
            999999
        ) {

            result.push(
                space
            );
        }
    }


    return result;
}


// ============================================================
// DUPLICATE SPACES
// ============================================================

function removeDuplicateSpaces(
    spaces
) {

    const result = [];


    for (
        const space
        of spaces
    ) {

        const duplicate =
            result.find(
                existing =>
                    boxesOverlap(
                        existing,
                        space
                    ) >
                    0.70
            );


        if (!duplicate) {

            result.push(
                space
            );

            continue;
        }


        const currentConfidence =
            Number(
                space.detection
                    ?.confidence ||
                0
            );


        const oldConfidence =
            Number(
                duplicate.detection
                    ?.confidence ||
                0
            );


        if (
            currentConfidence >
            oldConfidence
        ) {

            const index =
                result.indexOf(
                    duplicate
                );


            result[index] =
                space;
        }
    }


    return result;
}


// ============================================================
// VALIDATE SPACE
// ============================================================

function isValidSpace(
    space,
    originalWidth,
    originalHeight
) {

    if (!space) {
        return false;
    }


    if (
        !space.position ||
        !space.size
    ) {

        return false;
    }


    const width =
        Number(
            space.size.width
        );


    const height =
        Number(
            space.size.height
        );


    if (
        width <
        MIN_ROOM_WIDTH ||
        height <
        MIN_ROOM_HEIGHT
    ) {

        return false;
    }


    if (
        width >
        originalWidth *
        MAX_ROOM_RATIO ||
        height >
        originalHeight *
        MAX_ROOM_RATIO
    ) {

        return false;
    }


    return true;
}


// ============================================================
// UNKNOWN SPACE CLASSIFICATION
// ============================================================
//
// IMPORTANT:
//
// UNKNOWN is allowed.
//
// We do NOT require a predefined vocabulary.
//
// ============================================================

function classifyUnknownSpaces(
    spaces,
    labels
) {

    for (
        const space
        of spaces
    ) {

        if (
            space.type !==
            "UNKNOWN"
        ) {

            continue;
        }


        const label =
            findLabelInsideRegion(
                labels,
                space.position.x,
                space.position.y,
                space.size.width,
                space.size.height
            );


        if (!label) {
            continue;
        }


        space.name =
            label.text;


        // Only classify semantic type if
        // a known semantic match exists.

        const semantic =
            classifyText(
                label.text
            );


        if (
            semantic !==
            "UNKNOWN"
        ) {

            space.type =
                semantic;


            if (
                semantic ===
                "CORRIDOR"
            ) {

                space.category =
                    "CORRIDOR";
            }

            else if (
                semantic ===
                "STAIR"
            ) {

                space.category =
                    "SPECIAL";
            }

            else {

                space.category =
                    "ROOM";
            }
        }

        else {

            space.type =
                "UNKNOWN";

            space.category =
                "ROOM";
        }
    }
}


// ============================================================
// CORRIDORS
// ============================================================

function detectCorridors(
    spaces
) {

    return spaces.filter(
        space =>
            space.category ===
            "CORRIDOR"
    );
}


// ============================================================
// STAIRS
// ============================================================
//
// IMPORTANT:
//
// Previous implementation could produce huge stair counts.
//
// Now:
//
// 1. Only high-confidence stair labels.
// 2. Exact semantic matching.
// 3. Deduplication.
// 4. Maximum one stair object per actual spatial label.
//
// ============================================================

function detectStairs(
    labels,
    structuralMap,
    data,
    analysisWidth,
    analysisHeight,
    originalWidth,
    originalHeight
) {

    const stairs = [];


    const stairLabels =
        labels.filter(
            label => {

                if (
                    label.semanticType !==
                    "STAIR"
                ) {

                    return false;
                }


                if (
                    label.confidence <
                    65 &&
                    label.votes <
                    2
                ) {

                    return false;
                }


                return true;
            }
        );


    for (
        const label
        of stairLabels
    ) {

        const center = {

            x:
                label.x +
                label.width /
                2,

            y:
                label.y +
                label.height /
                2
        };


        const duplicate =
            stairs.find(
                stair =>
                    distance(
                        stair.position,
                        center
                    ) <
                    80
            );


        if (duplicate) {
            continue;
        }


        stairs.push({

            id:
                createId(
                    "STAIR"
                ),

            name:
                label.text,

            type:
                "STAIR",

            position:
                center,

            center:
                center,

            size: {

                width:
                    label.width,

                height:
                    label.height
            },

            confidence:
                label.confidence,

            detectionMethod:
                "HIGH-CONFIDENCE OCR STAIR LABEL"
        });
    }


    return stairs;
}


// ============================================================
// DOOR DETECTION
// ============================================================
//
// Doors are detected ONLY around actual detected spaces.
//
// We also reject very large openings and tiny noise gaps.
//
// ============================================================

function detectDoors(
    rooms,
    corridors,
    data,
    width,
    height,
    originalWidth,
    originalHeight
) {

    const doors = [];

    let counter = 1;


    const spaces = [
        ...rooms,
        ...corridors
    ];


    for (
        const space
        of spaces
    ) {

        const left =
            Math.max(
                0,
                Math.round(
                    space.position.x *
                    width /
                    originalWidth
                )
            );


        const right =
            Math.min(
                width - 1,
                Math.round(
                    (
                        space.position.x +
                        space.size.width
                    ) *
                    width /
                    originalWidth
                )
            );


        const top =
            Math.max(
                0,
                Math.round(
                    space.position.y *
                    height /
                    originalHeight
                )
            );


        const bottom =
            Math.min(
                height - 1,
                Math.round(
                    (
                        space.position.y +
                        space.size.height
                    ) *
                    height /
                    originalHeight
                )
            );


        const candidates = [

            ...findHorizontalOpenings(
                data,
                width,
                height,
                left,
                right,
                top
            ),

            ...findHorizontalOpenings(
                data,
                width,
                height,
                left,
                right,
                bottom
            ),

            ...findVerticalOpenings(
                data,
                width,
                height,
                top,
                bottom,
                left
            ),

            ...findVerticalOpenings(
                data,
                width,
                height,
                top,
                bottom,
                right
            )
        ];


        for (
            const candidate
            of candidates
        ) {

            const position = {

                x:
                    convertX(
                        candidate.x,
                        width,
                        originalWidth
                    ),

                y:
                    convertY(
                        candidate.y,
                        height,
                        originalHeight
                    )
            };


            const duplicate =
                doors.find(
                    door =>
                        distance(
                            door.position,
                            position
                        ) <
                        POINT_DEDUP_DISTANCE
                );


            if (duplicate) {

                duplicate.confidence =
                    Math.max(
                        duplicate.confidence,
                        candidate.confidence
                    );

                continue;
            }


            doors.push({

                id:
                    `DOOR-${String(
                        counter++
                    ).padStart(
                        3,
                        "0"
                    )}`,

                type:
                    "DOOR",

                position,

                confidence:
                    candidate.confidence,

                connectedSpaces: []
            });
        }
    }

    console.log("----------------------------------");
    console.log("DETECTED DOOR POSITIONS");
    console.log("----------------------------------");

    for (const door of doors) {
        console.log(
            `${door.id} -> x=${Math.round(door.position.x)}, y=${Math.round(door.position.y)}, confidence=${Math.round(door.confidence || 0)}`
        );
    }

    console.log("----------------------------------");

    return doors;

}


// ============================================================
// HORIZONTAL OPENINGS
// ============================================================

function findHorizontalOpenings(
    data,
    width,
    height,
    left,
    right,
    y
) {

    const result = [];


    if (
        y < 3 ||
        y >= height - 3
    ) {

        return result;
    }


    let gapStart =
        null;


    for (
        let x = left;
        x <= right;
        x++
    ) {

        if (
            x < 0 ||
            x >= width
        ) {

            continue;
        }


        const dark =
            isDark(
                data,
                width,
                height,
                x,
                y
            );


        if (!dark) {

            if (
                gapStart === null
            ) {

                gapStart =
                    x;
            }

        }

        else {

            if (
                gapStart !== null
            ) {

                const gap =
                    x -
                    gapStart;


                if (
                    gap >=
                    DOOR_MIN_SIZE &&
                    gap <=
                    DOOR_MAX_SIZE
                ) {

                    // Check that the opening is
                    // actually surrounded by wall.

                    const confidence =
                        calculateOpeningConfidence(
                            data,
                            width,
                            height,
                            gapStart,
                            x - 1,
                            y,
                            true
                        );


                    if (
                        confidence >=
                        55
                    ) {

                        result.push({

                            x:
                                (
                                    gapStart +
                                    x
                                ) /
                                2,

                            y,

                            confidence
                        });
                    }
                }


                gapStart =
                    null;
            }
        }
    }


    return result;
}


// ============================================================
// VERTICAL OPENINGS
// ============================================================

function findVerticalOpenings(
    data,
    width,
    height,
    top,
    bottom,
    x
) {

    const result = [];


    if (
        x < 3 ||
        x >= width - 3
    ) {

        return result;
    }


    let gapStart =
        null;


    for (
        let y = top;
        y <= bottom;
        y++
    ) {

        if (
            y < 0 ||
            y >= height
        ) {

            continue;
        }


        const dark =
            isDark(
                data,
                width,
                height,
                x,
                y
            );


        if (!dark) {

            if (
                gapStart === null
            ) {

                gapStart =
                    y;
            }

        }

        else {

            if (
                gapStart !== null
            ) {

                const gap =
                    y -
                    gapStart;


                if (
                    gap >=
                    DOOR_MIN_SIZE &&
                    gap <=
                    DOOR_MAX_SIZE
                ) {

                    const confidence =
                        calculateOpeningConfidence(
                            data,
                            width,
                            height,
                            gapStart,
                            y - 1,
                            x,
                            false
                        );


                    if (
                        confidence >=
                        55
                    ) {

                        result.push({

                            x,

                            y:
                                (
                                    gapStart +
                                    y
                                ) /
                                2,

                            confidence
                        });
                    }
                }


                gapStart =
                    null;
            }
        }
    }


    return result;
}


// ============================================================
// OPENING CONFIDENCE
// ============================================================

function calculateOpeningConfidence(
    data,
    width,
    height,
    start,
    end,
    fixed,
    horizontal
) {

    const gap =
        end -
        start +
        1;


    let score =
        45;


    // Normal door width is more likely
    // than extremely large gaps.

    const ideal =
        32;


    const difference =
        Math.abs(
            gap -
            ideal
        );


    score +=
        Math.max(
            0,
            30 -
            difference
        );


    // Check pixels just outside the opening.

    if (horizontal) {

        const leftWall =
            isDark(
                data,
                width,
                height,
                Math.max(
                    0,
                    start - 3
                ),
                fixed
            );


        const rightWall =
            isDark(
                data,
                width,
                height,
                Math.min(
                    width - 1,
                    end + 3
                ),
                fixed
            );


        if (
            leftWall &&
            rightWall
        ) {

            score +=
                15;
        }

    }

    else {

        const topWall =
            isDark(
                data,
                width,
                height,
                fixed,
                Math.max(
                    0,
                    start - 3
                )
            );


        const bottomWall =
            isDark(
                data,
                width,
                height,
                fixed,
                Math.min(
                    height - 1,
                    end + 3
                )
            );


        if (
            topWall &&
            bottomWall
        ) {

            score +=
                15;
        }
    }


    return Math.min(
        95,
        score
    );
}


// ============================================================
// ASSIGN DOORS
// ============================================================

function assignDoorsToSpaces(
    doors,
    spaces
) {

    for (
        const door
        of doors
    ) {

        const nearby =
            spaces.filter(
                space =>
                    pointNearSpaceBoundary(
                        door.position,
                        space,
                        70
                    )
            );


        door.connectedSpaces =
            nearby.map(
                space =>
                    space.id
            );


        for (
            const space
            of nearby
        ) {

            if (
                !Array.isArray(
                    space.connectedDoors
                )
            ) {

                space.connectedDoors =
                    [];
            }


            if (
                !space.connectedDoors.includes(
                    door.id
                )
            ) {

                space.connectedDoors.push(
                    door.id
                );
            }
        }
    }
}


// ============================================================
// EXIT DETECTION
// ============================================================

// ============================================================
// DYNAMIC EXIT DETECTION
// ============================================================
//
// IMPORTANT:
//
// The image boundary is NOT the building boundary.
//
// Blueprints often have large white margins around the
// actual building drawing.
//
// This function computes the building footprint dynamically
// from detected rooms/spaces and treats doors near the
// OUTER EDGE of that footprint as potential exits.
//
// ============================================================

function detectExits(
    doors,
    labels,
    originalWidth,
    originalHeight,
    spaces,
    structuralMap,
    analysisWidth,
    analysisHeight
) {
    // NOTE: Door positions are in original image coordinates. We'll scale them to analysis dimensions.
    // Diagnostic logs for coordinate consistency
    console.log('--- Coordinate Consistency Diagnostics ---');
    console.log('originalWidth =', originalWidth);
    console.log('originalHeight =', originalHeight);
    console.log('analysisWidth =', analysisWidth);
    console.log('analysisHeight =', analysisHeight);
    console.log('structuralMap.length =', structuralMap.length);
    console.log('analysisWidth * analysisHeight =', analysisWidth * analysisHeight);
    console.log('originalWidth * originalHeight =', originalWidth * originalHeight);
    if (doors.length > 0) {
        console.log('doors[0].position =', doors[0].position);
    }
    console.log('Scaling factor X =', analysisWidth / originalWidth, 'Y =', analysisHeight / originalHeight);
    console.log('--- End Diagnostics ---');


    const exits = [];

    // ------------------------------------------------------------
    // NEW EXIT DETECTION: structural boundary connectivity
    // ------------------------------------------------------------
    function computeExteriorMask(map, w, h) {
        const size = w * h;
        const mask = new Uint8Array(size);
        const stack = [];
        // Seed edge background pixels (value 0)
        for (let x = 0; x < w; x++) {
            const topIdx = x;
            const botIdx = (h - 1) * w + x;
            if (map[topIdx] === 0) { mask[topIdx] = 1; stack.push(topIdx); }
            if (map[botIdx] === 0) { mask[botIdx] = 1; stack.push(botIdx); }
        }
        for (let y = 0; y < h; y++) {
            const leftIdx = y * w;
            const rightIdx = y * w + (w - 1);
            if (map[leftIdx] === 0 && !mask[leftIdx]) { mask[leftIdx] = 1; stack.push(leftIdx); }
            if (map[rightIdx] === 0 && !mask[rightIdx]) { mask[rightIdx] = 1; stack.push(rightIdx); }
        }
        // 4‑connected flood fill
        while (stack.length) {
            const idx = stack.pop();
            const x = idx % w;
            const y = (idx / w) | 0;
            const neighbors = [idx - 1, idx + 1, idx - w, idx + w];
            for (const n of neighbors) {
                if (n < 0 || n >= size) continue;
                if (mask[n]) continue;
                if (map[n] === 0) { mask[n] = 1; stack.push(n); }
            }
        }
        return mask;
    }

    const exteriorMask = computeExteriorMask(structuralMap, analysisWidth, analysisHeight);
    let totalDoors = 0;
    let validatedExits = 0;

    for (const door of doors) {
        totalDoors++;
        if (!door || !door.position) {
            console.log(`DOOR-${door?.id || totalDoors}: missing position – skipped`);
            continue;
        }
        // Scale door position from original image to analysis dimensions
        const scaledX = Math.round(door.position.x * analysisWidth / originalWidth);
        const scaledY = Math.round(door.position.y * analysisHeight / originalHeight);
        if (scaledX < 0 || scaledX >= analysisWidth || scaledY < 0 || scaledY >= analysisHeight) {
            console.log(`DOOR-${door.id}: scaled out of bounds – skipped`);
            continue;
        }
        let interiorFound = Array.isArray(door.connectedSpaces) && door.connectedSpaces.length > 0;
        let exteriorFound = false;
        let wallHorizontal = 0;
        let wallVertical = 0;
        
        // Scan a local circular window around the door to find actual exterior connectivity and wall orientation
        const scanRadius = 25; 
        for (let dy = -scanRadius; dy <= scanRadius; dy++) {
            for (let dx = -scanRadius; dx <= scanRadius; dx++) {
                // Keep the search area roughly circular
                if (dx * dx + dy * dy > scanRadius * scanRadius) continue;

                const nx = scaledX + dx;
                const ny = scaledY + dy;
                if (nx < 0 || nx >= analysisWidth || ny < 0 || ny >= analysisHeight) continue;
                
                const nIdx = ny * analysisWidth + nx;
                
                if (structuralMap[nIdx] === 0) {
                    // It's an open space pixel
                    if (exteriorMask[nIdx] === 1) {
                        exteriorFound = true;
                    }
                } else {
                    // It's a wall pixel
                    if (Math.abs(dx) > Math.abs(dy)) {
                        wallHorizontal++;
                    } else if (Math.abs(dy) > Math.abs(dx)) {
                        wallVertical++;
                    }
                }
            }
        }
        
        const wallOrientation = wallHorizontal > wallVertical ? "HORIZONTAL" : "VERTICAL";
        const externalConnection = interiorFound && exteriorFound;
        const confidence = externalConnection ? Math.min(door.confidence || 60, 95) : 0;
        
        console.log(`DOOR-${door.id}:`);
        console.log(`  position=(${door.position.x.toFixed(1)}, ${door.position.y.toFixed(1)})`);
        console.log(`  wall orientation=${wallOrientation}`);
        console.log(`  interior connectivity=${interiorFound ? "YES" : "NO"}`);
        console.log(`  exterior connectivity=${exteriorFound ? "YES" : "NO"}`);
        console.log(`  external connection=${externalConnection ? "YES" : "NO"}`);
        console.log(`  confidence=${confidence}`);
        
        if (externalConnection) {
            exits.push({
                id: createId("EXIT"),
                name: "External Exit",
                type: "SAFE_EXIT",
                position: { x: door.position.x, y: door.position.y },
                doorId: door.id,
                confidence,
                detectionMethod: "STRUCTURAL_BOUNDARY_CONNECTIVITY"
            });
            validatedExits++;
        }
    }

    console.log("----------------------------------");
    console.log(`Total detected doors: ${totalDoors}`);
    console.log(`Validated external exits: ${validatedExits}`);
    console.log("----------------------------------");

    return exits;

    // --------------------------------------------------------
    // 1. EXPLICIT EXIT / ENTRANCE LABELS
    // --------------------------------------------------------

    const exitLabels =
        labels.filter(label => {

            const text =
                String(label.text || "")
                    .toUpperCase()
                    .replace(/[^A-Z0-9 ]/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

            return (
                /\bEXIT\b/.test(text) ||
                /\bENTRANCE\b/.test(text) ||
                /\bENTRY\b/.test(text) ||
                /\bEGRESS\b/.test(text) ||
                /\bPORCH\b/.test(text)
            );
        });


    for (const label of exitLabels) {

        // Find the nearest door to this exit label.
        // If found, use the door position; otherwise use label position.

        let exitPosition = { x: label.x, y: label.y };
        let linkedDoorId = null;

        if (doors.length > 0) {

            let nearestDoor = null;
            let nearestDist = Infinity;

            for (const door of doors) {

                if (!door || !door.position) {
                    continue;
                }

                const d = distance(
                    { x: label.x, y: label.y },
                    door.position
                );

                if (d < nearestDist) {
                    nearestDist = d;
                    nearestDoor = door;
                }
            }

            // Link to nearby door (within 300px in original coords)
            if (nearestDoor && nearestDist < 300) {
                exitPosition = nearestDoor.position;
                linkedDoorId = nearestDoor.id;
            }
        }


        exits.push({

            id:
                createId("EXIT"),

            name:
                label.text,

            type:
                "MARKED_EXIT",

            position: exitPosition,

            doorId: linkedDoorId,

            confidence:
                Math.min(
                    98,
                    (label.confidence || 70) + 15
                ),

            detectionMethod:
                "OCR_EXIT_MARKING"

        });

    }


    // --------------------------------------------------------
    // 2. COMPUTE BUILDING FOOTPRINT FROM DETECTED SPACES
    //
    // The blueprint image has a margin around the building.
    // We compute the actual building extent from rooms.
    // Doors near the OUTER PERIMETER of this footprint
    // are candidates for external exits.
    // --------------------------------------------------------

    let footprintMinX = Infinity;
    let footprintMaxX = -Infinity;
    let footprintMinY = Infinity;
    let footprintMaxY = -Infinity;


    // Use detected spaces (rooms + corridors + special)
    // to define the building footprint.

    const footprintSpaces =
        Array.isArray(spaces)
            ? spaces.filter(
                s => s && s.position && s.size
            )
            : [];


    for (const space of footprintSpaces) {

        const left = space.position.x;
        const right = space.position.x + space.size.width;
        const top = space.position.y;
        const bot = space.position.y + space.size.height;

        footprintMinX = Math.min(footprintMinX, left);
        footprintMaxX = Math.max(footprintMaxX, right);
        footprintMinY = Math.min(footprintMinY, top);
        footprintMaxY = Math.max(footprintMaxY, bot);
    }


    // Also consider door positions to extend footprint.
    // Doors are on walls, so they refine the building edge.

    for (const door of doors) {

        if (!door || !door.position) {
            continue;
        }

        footprintMinX = Math.min(footprintMinX, door.position.x);
        footprintMaxX = Math.max(footprintMaxX, door.position.x);
        footprintMinY = Math.min(footprintMinY, door.position.y);
        footprintMaxY = Math.max(footprintMaxY, door.position.y);
    }


    // Fallback: if no footprint could be computed, use image.

    if (
        !Number.isFinite(footprintMinX) ||
        !Number.isFinite(footprintMaxX) ||
        !Number.isFinite(footprintMinY) ||
        !Number.isFinite(footprintMaxY)
    ) {
        footprintMinX = 0;
        footprintMaxX = width;
        footprintMinY = 0;
        footprintMaxY = height;
    }


    const footprintWidth = footprintMaxX - footprintMinX;
    const footprintHeight = footprintMaxY - footprintMinY;


    console.log("----------------------------------");
    console.log("BUILDING FOOTPRINT (for exit detection)");
    console.log(`  minX=${Math.round(footprintMinX)} maxX=${Math.round(footprintMaxX)}`);
    console.log(`  minY=${Math.round(footprintMinY)} maxY=${Math.round(footprintMaxY)}`);
    console.log(`  footprintW=${Math.round(footprintWidth)} footprintH=${Math.round(footprintHeight)}`);
    console.log("----------------------------------");


    // --------------------------------------------------------
    // 3. BOUNDARY TOLERANCE
    //
    // How close to the building footprint boundary must a
    // door be to be considered an external exit?
    //
    // We use a generous tolerance because:
    //   - Room bounding boxes may not perfectly align with walls
    //   - OCR positions can be slightly off
    //   - The building may have a small external zone (porch, veranda)
    //
    // Primary:  8% of the smaller footprint dimension.
    // Extended: 14% of the smaller footprint dimension.
    //   (used if no primary exits found)
    // --------------------------------------------------------

    const smallerDim =
        Math.max(
            50,
            Math.min(footprintWidth, footprintHeight)
        );

    const primaryTolerance =
        Math.max(
            60,
            smallerDim * 0.08
        );

    const extendedTolerance =
        Math.max(
            120,
            smallerDim * 0.14
        );


    // --------------------------------------------------------
    // Internal helper: is door near footprint boundary?
    // --------------------------------------------------------

    function isDoorNearFootprintBoundary(doorX, doorY, tolerance) {

        const distLeft = Math.abs(doorX - footprintMinX);
        const distRight = Math.abs(doorX - footprintMaxX);
        const distTop = Math.abs(doorY - footprintMinY);
        const distBottom = Math.abs(doorY - footprintMaxY);

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);

        if (minDist > tolerance) {
            return null;
        }

        // Return which boundary edge this is closest to.
        let side = "LEFT";
        let dist = distLeft;

        if (distRight < dist) {
            side = "RIGHT";
            dist = distRight;
        }

        if (distTop < dist) {
            side = "TOP";
            dist = distTop;
        }

        if (distBottom < dist) {
            side = "BOTTOM";
            dist = distBottom;
        }

        return { side, minDist };
    }


    // --------------------------------------------------------
    // 4. SCAN ALL DETECTED DOORS
    // --------------------------------------------------------

    const boundaryDoorCandidates = [];


    for (const door of doors) {

        if (!door || !door.position) {
            continue;
        }


        const x = Number(door.position.x);
        const y = Number(door.position.y);


        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            continue;
        }


        const match =
            isDoorNearFootprintBoundary(
                x,
                y,
                primaryTolerance
            );


        if (!match) {
            continue;
        }


        // ----------------------------------------------------
        // EXIT CONFIDENCE
        // ----------------------------------------------------

        let confidence = door.confidence || 60;


        // Closer to the boundary = more confident.
        const proximityBonus =
            Math.max(
                0,
                20 - Math.round(match.minDist / (primaryTolerance / 20))
            );

        confidence += proximityBonus;

        confidence = Math.min(92, confidence);


        boundaryDoorCandidates.push({
            door,
            x,
            y,
            side: match.side,
            minDist: match.minDist,
            confidence
        });
    }


    console.log(
        `Exit boundary candidates (primary tolerance ${Math.round(primaryTolerance)}px):`,
        boundaryDoorCandidates.length
    );


    // --------------------------------------------------------
    // 5. IF NO PRIMARY CANDIDATES, EXPAND TOLERANCE
    // --------------------------------------------------------

    if (
        boundaryDoorCandidates.length === 0 &&
        exits.length === 0
    ) {

        console.log(
            `No primary candidates. Expanding to ${Math.round(extendedTolerance)}px tolerance...`
        );

        for (const door of doors) {

            if (!door || !door.position) {
                continue;
            }


            const x = Number(door.position.x);
            const y = Number(door.position.y);


            if (!Number.isFinite(x) || !Number.isFinite(y)) {
                continue;
            }


            const match =
                isDoorNearFootprintBoundary(
                    x,
                    y,
                    extendedTolerance
                );


            if (!match) {
                continue;
            }


            let confidence = Math.min(70, (door.confidence || 60) - 5);


            boundaryDoorCandidates.push({
                door,
                x,
                y,
                side: match.side,
                minDist: match.minDist,
                confidence
            });
        }


        console.log(
            `Extended candidates:`,
            boundaryDoorCandidates.length
        );
    }


    // --------------------------------------------------------
    // 6. IF STILL NO CANDIDATES: FIND MOST BOUNDARY-ADJACENT DOORS
    //
    // Last resort: take doors that are closest to any boundary
    // of the building footprint. At minimum, report the 2 most
    // boundary-adjacent doors as potential exits.
    // --------------------------------------------------------

    if (
        boundaryDoorCandidates.length === 0 &&
        exits.length === 0 &&
        doors.length > 0
    ) {

        console.log(
            "No boundary candidates found. Using closest-to-footprint-edge strategy..."
        );


        const scoredDoors = doors
            .filter(d => d && d.position)
            .map(door => {

                const x = Number(door.position.x);
                const y = Number(door.position.y);

                const distLeft = Math.abs(x - footprintMinX);
                const distRight = Math.abs(x - footprintMaxX);
                const distTop = Math.abs(y - footprintMinY);
                const distBottom = Math.abs(y - footprintMaxY);

                const minDist = Math.min(distLeft, distRight, distTop, distBottom);

                let side = "LEFT";
                let sd = distLeft;

                if (distRight < sd) { side = "RIGHT"; sd = distRight; }
                if (distTop < sd) { side = "TOP"; sd = distTop; }
                if (distBottom < sd) { side = "BOTTOM"; sd = distBottom; }

                return { door, x, y, side, minDist, confidence: 55 };
            })
            .sort((a, b) => a.minDist - b.minDist);


        // Take up to 3 most boundary-adjacent doors.
        for (const candidate of scoredDoors.slice(0, 3)) {
            boundaryDoorCandidates.push(candidate);
        }

        console.log(
            `Closest-to-edge candidates:`,
            boundaryDoorCandidates.length
        );
    }


    // --------------------------------------------------------
    // 7. CREATE EXIT OBJECTS FROM CANDIDATES
    // --------------------------------------------------------

    for (const candidate of boundaryDoorCandidates) {

        const { door, x, y, side, confidence } = candidate;


        // Duplicate check against already-added exits.
        const duplicate =
            exits.find(exit =>
                exit.position &&
                distance(
                    exit.position,
                    door.position
                ) < POINT_DEDUP_DISTANCE
            );


        if (duplicate) {
            continue;
        }


        exits.push({

            id:
                createId("EXIT"),

            name:
                `External Exit - ${side}`,

            type:
                "POTENTIAL_SAFE_EXIT",

            position: { x, y },

            doorId: door.id,

            boundary: side,

            confidence,

            detectionMethod:
                "BUILDING_FOOTPRINT_BOUNDARY_ANALYSIS"

        });
    }


    // --------------------------------------------------------
    // 8. FINAL DEDUPLICATION
    // --------------------------------------------------------

    const result = deduplicatePoints(exits);


    console.log("----------------------------------");
    console.log(`Exits detected: ${result.length}`);
    result.forEach((exit, i) => {
        console.log(
            `  EXIT-${i + 1}: ${exit.name} pos=(${Math.round(exit.position.x)},${Math.round(exit.position.y)}) method=${exit.detectionMethod} confidence=${Math.round(exit.confidence)}`
        );
    });
    console.log("----------------------------------");


    return result;

}

// ============================================================
// SEMANTIC TYPE
// ============================================================

function classifyText(
    text
) {

    const value =
        normalizeText(
            text
        );


    if (!value) {
        return "UNKNOWN";
    }


    for (
        const [
            type,
            keywords
        ]
        of Object.entries(
            SPACE_TYPE_KEYWORDS
        )
    ) {

        for (
            const keyword
            of keywords
        ) {

            const normalizedKeyword =
                normalizeText(
                    keyword
                );


            // Exact or word-level matching only.
            //
            // This prevents random strings containing
            // "STAIR" as a substring from becoming stairs.

            const regex =
                new RegExp(
                    `(^| )${escapeRegExp(
                        normalizedKeyword
                    )}( |$)`
                );


            if (
                regex.test(
                    value
                )
            ) {

                return type;
            }
        }
    }


    return "UNKNOWN";
}


// ============================================================
// REGEX ESCAPE
// ============================================================

function escapeRegExp(
    value
) {

    return String(
        value
    ).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// ============================================================
// BOX OVERLAP
// ============================================================

function boxesOverlap(
    a,
    b
) {

    if (
        !a?.position ||
        !a?.size ||
        !b?.position ||
        !b?.size
    ) {

        return 0;
    }


    const ax1 =
        a.position.x;


    const ay1 =
        a.position.y;


    const ax2 =
        ax1 +
        a.size.width;


    const ay2 =
        ay1 +
        a.size.height;


    const bx1 =
        b.position.x;


    const by1 =
        b.position.y;


    const bx2 =
        bx1 +
        b.size.width;


    const by2 =
        by1 +
        b.size.height;


    const intersectionWidth =
        Math.max(
            0,
            Math.min(
                ax2,
                bx2
            ) -
            Math.max(
                ax1,
                bx1
            )
        );


    const intersectionHeight =
        Math.max(
            0,
            Math.min(
                ay2,
                by2
            ) -
            Math.max(
                ay1,
                by1
            )
        );
    const intersection =
        intersectionWidth *
        intersectionHeight;


    const areaA =
        a.size.width *
        a.size.height;


    const areaB =
        b.size.width *
        b.size.height;


    const union =
        areaA +
        areaB -
        intersection;


    if (
        union <= 0
    ) {

        return 0;
    }


    return (
        intersection /
        union
    );
}
// ============================================================
// POINT NEAR SPACE BOUNDARY
// ============================================================
function pointNearSpaceBoundary(
    point,
    space,
    tolerance
) {
    const left =
        space.position.x;

    const right =
        left +
        space.size.width;

    const top =
        space.position.y;

    const bottom =
        top +
        space.size.height;

    const insideExpanded =

        point.x >=
        left -
        tolerance &&

        point.x <=
        right +
        tolerance &&

        point.y >=
        top -
        tolerance &&

        point.y <=
        bottom +
        tolerance;

    if (!insideExpanded) {
        return false;
    }

    const distanceLeft =
        Math.abs(
            point.x -
            left
        );
    const distanceRight =
        Math.abs(
            point.x -
            right
        );
    const distanceTop =
        Math.abs(
            point.y -
            top
        );
    const distanceBottom =
        Math.abs(
            point.y -
            bottom
        );
    return (
        Math.min(
            distanceLeft,
            distanceRight,
            distanceTop,
            distanceBottom
        ) <=
        tolerance
    );
}
// ============================================================
// DARK PIXEL
// ============================================================

function isDark(
    data,
    width,
    height,
    x,
    y
) {

    if (
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height
    ) {

        return false;
    }


    const index =
        Math.round(y) *
        width +
        Math.round(x);


    const value =
        data[index];


    if (
        typeof value !==
        "number"
    ) {

        return false;
    }


    return (
        value <
        DARK_THRESHOLD
    );
}


// ============================================================
// DISTANCE
// ============================================================

function distance(
    a,
    b
) {

    const dx =
        a.x -
        b.x;


    const dy =
        a.y -
        b.y;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ============================================================
// DEDUPLICATE POINTS
// ============================================================

function deduplicatePoints(
    points
) {

    const result = [];


    for (
        const point
        of points
    ) {

        if (
            !point ||
            !point.position
        ) {

            continue;
        }


        const duplicate =
            result.find(
                existing =>
                    distance(
                        existing.position,
                        point.position
                    ) <
                    POINT_DEDUP_DISTANCE
            );


        if (!duplicate) {

            result.push(
                point
            );
        }
    }
    return result;
}
// ============================================================
// COORDINATE CONVERSION
// ============================================================

function convertX(
    value,
    analysisWidth,
    originalWidth
) {
    return Math.round(
        value *
        (
            originalWidth /
            analysisWidth
        )
    );
}
function convertY(
    value,
    analysisHeight,
    originalHeight
) {

    return Math.round(
        value *
        (
            originalHeight /
            analysisHeight
        )
    );
}
function convertSize(
    value,
    analysisSize,
    originalSize
) {
    return Math.round(
        value *
        (
            originalSize /
            analysisSize
        )
    );
}
function convertOriginalPointToAnalysis(
    x,
    y,
    originalWidth,
    originalHeight,
    analysisWidth,
    analysisHeight
) {

    return {

        x:
            Math.round(
                x *
                (
                    analysisWidth /
                    originalWidth
                )
            ),

        y:
            Math.round(
                y *
                (
                    analysisHeight /
                    originalHeight
                )
            )
    };
}
// ============================================================
// TEXT NORMALIZATION
// ============================================================
function normalizeText(
    text
) {

    return String(
        text ||
        ""
    )
        .toUpperCase()
        .replace(
            /[^A-Z0-9 ]/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}
// ============================================================
// ID
// ============================================================
function createId(
    prefix
) {
    return (

        prefix +
        "-" +
        Date.now()
            .toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(
                2,
                8
            )
            .toUpperCase()
    );
}

// ============================================================
// FIRE EVENT
// ============================================================
function createFireEvent(
    building,
    fireInput = {}
) {

    if (
        !building ||
        !Array.isArray(
            building.floors
        )
    ) {

        throw new Error(
            "Valid building model required."
        );
    }

    const floor =
        building.floors.find(
            item =>
                item.floorNumber ===
                (
                    fireInput.floor ||
                    1
                )
        );

    if (!floor) {

        throw new Error(
            "Requested simulation floor does not exist."
        );
    }

    let position =
        null;


    let affectedSpace =
        null;
    // --------------------------------------------------------
    // FIRE BY SPACE
    // --------------------------------------------------------

    if (
        fireInput.spaceId ||
        fireInput.roomId
    ) {

        const spaceId =
            fireInput.spaceId ||
            fireInput.roomId;


        affectedSpace =
            floor.spaces.find(
                space =>
                    space.id ===
                    spaceId
            );
        if (!affectedSpace) {

            throw new Error(
                "Specified simulation space was not found."
            );
        }
        position = {

            x:
                affectedSpace.center.x,

            y:
                affectedSpace.center.y
        };
    }
    // --------------------------------------------------------
    // FIRE BY POSITION
    // --------------------------------------------------------

    else if (
        Number.isFinite(
            Number(
                fireInput.x
            )
        ) &&
        Number.isFinite(
            Number(
                fireInput.y
            )
        )
    ) {
        position = {

            x:
                Number(
                    fireInput.x
                ),

            y:
                Number(
                    fireInput.y
                )
        };


        affectedSpace =
            findSpaceAtPoint(
                floor.spaces,
                position
            );
    }
    // --------------------------------------------------------
    // FIRE BY RATIO
    // --------------------------------------------------------
    else if (
        Number.isFinite(
            Number(
                fireInput.xRatio
            )
        ) &&
        Number.isFinite(
            Number(
                fireInput.yRatio
            )
        )
    ) {

        position = {

            x:
                Number(
                    fireInput.xRatio
                ) *
                building.analysis.imageWidth,

            y:
                Number(
                    fireInput.yRatio
                ) *
                building.analysis.imageHeight
        };

        affectedSpace =
            findSpaceAtPoint(
                floor.spaces,
                position
            );
    }

    if (!position) {

        throw new Error(
            "Fire simulation requires a dynamic location."
        );
    }

    const severity =
        normalizeSeverity(
            fireInput.severity
        );


    return {

        id:
            createId(
                "FIRE"
            ),

        type:
            "FIRE",

        floor:
            floor.floorNumber,

        severity,

        active:
            true,

        position,

        affectedSpaceId:
            affectedSpace
                ? affectedSpace.id
                : null,

        affectedRoomId:
            affectedSpace
                ? affectedSpace.id
                : null,

        source:
            fireInput.source ||
            "SIMULATION_INPUT",

        createdAt:
            new Date()
                .toISOString(),

        simulation:
            true
    };
}
// ============================================================
// FIND SPACE
// ============================================================
function findSpaceAtPoint(
    spaces,
    point
) {
    return (
        spaces.find(
            space => {

                return (

                    point.x >=
                    space.position.x &&

                    point.x <=
                    space.position.x +
                    space.size.width &&

                    point.y >=
                    space.position.y &&

                    point.y <=
                    space.position.y +
                    space.size.height
                );
            }
        ) ||
        null
    );
}
// ============================================================
// ADD FIRE
// ============================================================
function addFireEvent(
    building,
    fire
) {
    if (
        !building ||
        !fire
    ) {
        throw new Error(
            "Building and fire event are required."
        );
    }
    const floor =
        building.floors.find(
            item =>
                item.floorNumber ===
                fire.floor
        );
    if (!floor) {
        throw new Error(
            "Fire floor not found."
        );
    }
    if (
        !Array.isArray(
            floor.fires
        )
    ) {
        floor.fires = [];
    }
    if (
        !building.simulator
    ) {

        building.simulator = {
            fireEvents: [],
            evacuationEvents: [],
            activeSimulation:
                false
        };
    }
    floor.fires.push(
        fire
    );
    building.simulator.fireEvents.push(
        fire
    )
    building.simulator.activeSimulation =
        true;
    return building;
}
// ============================================================
// SEVERITY
// ============================================================
function normalizeSeverity(
    severity
) {
    const value =
        String(
            severity ||
            "MEDIUM"
        )
            .toUpperCase()
            .trim();
    const allowed = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ];
    return allowed.includes(
        value
    )
        ? value
        : "MEDIUM";
}
// ============================================================
// EXPORT
// ============================================================
module.exports = {
    analyzeBlueprint,
    createFireEvent,
    addFireEvent,
    findSpaceAtPoint
};