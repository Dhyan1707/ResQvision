import { getGeminiModel } from '../config/gemini.js';
import { validateBlueprintJSON } from '../utils/validator.js';
import { logger } from '../utils/logger.js';

export const geminiService = {
  /**
   * Generate architectural blueprint using Google Gemini AI
   * @param {string} prompt - User request, e.g., "Generate a 3-floor hospital with ICU, reception, emergency exit and staircase."
   * @param {string} buildingType - Optional building type override
   * @returns {Object} Validated Blueprint JSON Object
   */
  async generateBlueprint(prompt, buildingType = 'General Building') {
    try {
      const model = getGeminiModel('gemini-1.5-flash');

      const systemPrompt = `You are an expert AI Architectural Blueprint Generator specializing in fire evacuation safety layouts.
      Generate a realistic, detailed 2D/3D building layout based on the user prompt: "${prompt}".
      Building Type: "${buildingType}".

      CRITICAL MANDATE: You MUST return ONLY valid JSON matching this EXACT schema without markdown wrapping or extra prose:
      {
        "title": "Descriptive Title of the Building",
        "building_type": "${buildingType}",
        "total_floors": 3,
        "dimensions": {
          "width": 100,
          "height": 100
        },
        "floors": [
          {
            "floor_number": 1,
            "floor_name": "Ground Floor / Reception",
            "rooms": [
              {
                "id": "room_101",
                "name": "Reception",
                "x": 10,
                "y": 10,
                "width": 30,
                "height": 20,
                "type": "reception"
              }
            ],
            "emergency_exits": [
              {
                "id": "exit_1",
                "x": 0,
                "y": 20,
                "name": "Main Emergency Exit"
              }
            ],
            "staircases": [
              {
                "id": "stair_1",
                "x": 90,
                "y": 90,
                "connects_to_floor": 2
              }
            ]
          }
        ]
      }

      Ensure coordinates and room sizes fit within dimensions width and height. Include all requested special areas such as ICU, reception, staircases, and emergency exits.`;

      logger.info(`Sending blueprint prompt to Gemini AI: "${prompt}"`);
      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text().trim();

      // Clean markdown codeblocks if wrapped
      let cleanedJSONStr = responseText;
      if (cleanedJSONStr.startsWith('```json')) {
        cleanedJSONStr = cleanedJSONStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJSONStr.startsWith('```')) {
        cleanedJSONStr = cleanedJSONStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(cleanedJSONStr);
      } catch (jsonErr) {
        logger.error('Failed to parse Gemini AI JSON output:', cleanedJSONStr);
        const error = new Error('Gemini AI produced invalid JSON structure. Please retry.');
        error.statusCode = 502;
        throw error;
      }

      // Enforce title & building_type fallback if missing
      if (!parsedData.title) parsedData.title = `AI Generated ${buildingType}`;
      if (!parsedData.building_type) parsedData.building_type = buildingType;

      // Validate blueprint JSON against system contract
      const validation = validateBlueprintJSON(parsedData);
      if (!validation.isValid) {
        logger.warn('Gemini AI JSON validation failed:', validation.errors);
        const error = new Error(`AI generated JSON contract validation failed: ${validation.errors.join(', ')}`);
        error.statusCode = 422;
        throw error;
      }

      return parsedData;
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error('Gemini AI API Call Error:', error.message);
      const apiError = new Error(`AI Generation Service Error: ${error.message}`);
      apiError.statusCode = 500;
      throw apiError;
    }
  },

  /**
   * Extract architectural blueprint from an uploaded image using Google Gemini Vision AI
   * @param {Buffer} imageBuffer - The uploaded image buffer
   * @param {string} mimeType - The mime type of the image (e.g., 'image/png')
   * @param {string} title - User provided title
   * @param {string} buildingType - User provided building type
   * @returns {Object} Validated Blueprint JSON Object
   */
  async generateBlueprintFromImage(imageBuffer, mimeType, title = 'AI Generated Map', buildingType = 'General Building') {
    try {
      // Use gemini-1.5-flash as it supports multimodal and is fast
      const model = getGeminiModel('gemini-1.5-flash');

      const systemPrompt = `You are an expert AI Architectural Blueprint Analyzer specializing in fire evacuation safety layouts.
      Analyze the provided 2D floor plan/blueprint image.
      
      Extract the walls, rooms, emergency exits, and staircases into a structured JSON format.
      Assume the total dimensions based on a standard scale (e.g., width: 100, height: 100).
      
      CRITICAL MANDATE: You MUST return ONLY valid JSON matching this EXACT schema without markdown wrapping or extra prose:
      {
        "title": "${title}",
        "building_type": "${buildingType}",
        "total_floors": 1,
        "dimensions": {
          "width": 100,
          "height": 100
        },
        "floors": [
          {
            "floor_number": 1,
            "floor_name": "Main Floor",
            "rooms": [
              {
                "id": "room_1",
                "name": "Extracted Room Name",
                "x": 10,
                "y": 10,
                "width": 30,
                "height": 20,
                "type": "general"
              }
            ],
            "emergency_exits": [
              {
                "id": "exit_1",
                "x": 0,
                "y": 20,
                "name": "Main Emergency Exit"
              }
            ],
            "staircases": []
          }
        ]
      }
      
      If you cannot identify specific rooms, generate generic rooms (e.g., Room A, Hallway) that approximate the layout shown in the image. Ensure bounding boxes (x, y, width, height) roughly match the visual layout in the image relative to 100x100 dimensions.`;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        },
      };

      logger.info(`Sending blueprint image to Gemini Vision AI for extraction.`);
      const result = await model.generateContent([systemPrompt, imagePart]);
      const responseText = result.response.text().trim();

      // Clean markdown codeblocks if wrapped
      let cleanedJSONStr = responseText;
      if (cleanedJSONStr.startsWith('```json')) {
        cleanedJSONStr = cleanedJSONStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJSONStr.startsWith('```')) {
        cleanedJSONStr = cleanedJSONStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(cleanedJSONStr);
      } catch (jsonErr) {
        logger.error('Failed to parse Gemini AI JSON output from image:', cleanedJSONStr);
        const error = new Error('Gemini AI produced invalid JSON structure from image. Please retry.');
        error.statusCode = 502;
        throw error;
      }

      // Enforce title & building_type fallback if missing
      if (!parsedData.title) parsedData.title = title;
      if (!parsedData.building_type) parsedData.building_type = buildingType;

      // Validate blueprint JSON against system contract
      const validation = validateBlueprintJSON(parsedData);
      if (!validation.isValid) {
        logger.warn('Gemini AI JSON validation failed for extracted image:', validation.errors);
        const error = new Error(`AI generated JSON contract validation failed: ${validation.errors.join(', ')}`);
        error.statusCode = 422;
        throw error;
      }

      return parsedData;
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error('Gemini AI Vision API Call Error:', error.message);
      const apiError = new Error(`AI Vision Service Error: ${error.message}`);
      apiError.statusCode = 500;
      throw apiError;
    }
  }
};
