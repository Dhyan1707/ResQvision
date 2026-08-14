import { blueprintRepository } from '../repositories/blueprintRepository.js';
import { geminiService } from './geminiService.js';
import { validateBlueprintJSON } from '../utils/validator.js';

export const blueprintService = {
  /**
   * Generate a blueprint using AI and return the JSON
   */
  async generateAIBlueprint(prompt, buildingType, userId) {
    if (!prompt) {
      const error = new Error('Prompt is required for blueprint generation.');
      error.statusCode = 400;
      throw error;
    }

    const generatedJSON = await geminiService.generateBlueprint(prompt, buildingType);

    // Save as draft in database
    const savedBlueprint = await blueprintRepository.createBlueprint({
      title: generatedJSON.title || prompt.substring(0, 50),
      building_type: generatedJSON.building_type || buildingType || 'General Building',
      prompt,
      blueprint_json: generatedJSON,
      approval_status: 'draft',
      created_by: userId
    });

    return savedBlueprint;
  },

  /**
   * Extract a blueprint from an image using AI and return the JSON
   */
  async generateBlueprintFromImage(imageBuffer, mimeType, userId, title, buildingType) {
    if (!imageBuffer) {
      const error = new Error('Image is required for blueprint generation.');
      error.statusCode = 400;
      throw error;
    }

    const generatedJSON = await geminiService.generateBlueprintFromImage(imageBuffer, mimeType, title, buildingType);

    // Save as draft in database
    const savedBlueprint = await blueprintRepository.createBlueprint({
      title: generatedJSON.title || title || 'AI Generated Map',
      building_type: generatedJSON.building_type || buildingType || 'General Building',
      prompt: 'Generated from image upload',
      blueprint_json: generatedJSON,
      approval_status: 'draft',
      created_by: userId
    });

    return savedBlueprint;
  },

  /**
   * Save a manually created/edited blueprint
   */
  async createBlueprint(data, userId) {
    const { title, building_type, prompt, blueprint_json } = data;

    const validation = validateBlueprintJSON(blueprint_json);
    if (!validation.isValid) {
      const error = new Error(`Invalid blueprint JSON payload: ${validation.errors.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    return await blueprintRepository.createBlueprint({
      title,
      building_type,
      prompt: prompt || 'Manual Creation',
      blueprint_json,
      approval_status: 'draft',
      created_by: userId
    });
  },

  /**
   * Get all blueprints with optional filter
   */
  async getBlueprints({ status, createdBy, limit, page }) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const offset = (pageNum - 1) * limitNum;

    return await blueprintRepository.findAll({
      status,
      createdBy,
      limit: limitNum,
      offset
    });
  },

  /**
   * Get single blueprint by ID
   */
  async getBlueprintById(id) {
    const blueprint = await blueprintRepository.findById(id);
    if (!blueprint) {
      const error = new Error('Blueprint not found.');
      error.statusCode = 404;
      throw error;
    }
    return blueprint;
  },

  /**
   * Update blueprint details
   */
  async updateBlueprint(id, updateData, userId, userRole) {
    const existing = await blueprintRepository.findById(id);
    if (!existing) {
      const error = new Error('Blueprint not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership or admin privilege
    if (existing.created_by !== userId && userRole !== 'admin') {
      const error = new Error('Forbidden. You do not have permission to modify this blueprint.');
      error.statusCode = 403;
      throw error;
    }

    if (updateData.blueprint_json) {
      const validation = validateBlueprintJSON(updateData.blueprint_json);
      if (!validation.isValid) {
        const error = new Error(`Invalid blueprint JSON structure: ${validation.errors.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
    }

    return await blueprintRepository.updateBlueprint(id, updateData);
  },

  /**
   * Delete blueprint
   */
  async deleteBlueprint(id, userId, userRole) {
    const existing = await blueprintRepository.findById(id);
    if (!existing) {
      const error = new Error('Blueprint not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.created_by !== userId && userRole !== 'admin') {
      const error = new Error('Forbidden. You do not have permission to delete this blueprint.');
      error.statusCode = 403;
      throw error;
    }

    return await blueprintRepository.deleteBlueprint(id);
  },

  /**
   * Request blueprint publication (Change status to 'pending')
   */
  async publishBlueprint(id, userId) {
    const existing = await blueprintRepository.findById(id);
    if (!existing) {
      const error = new Error('Blueprint not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.created_by !== userId) {
      const error = new Error('Forbidden. You can only publish blueprints you created.');
      error.statusCode = 403;
      throw error;
    }

    return await blueprintRepository.updateApprovalStatus(id, 'pending');
  },

  /**
   * Admin Approve/Reject blueprint
   */
  async approveBlueprint(id, status) {
    if (!['approved', 'rejected'].includes(status)) {
      const error = new Error('Invalid status. Must be "approved" or "rejected".');
      error.statusCode = 400;
      throw error;
    }

    const existing = await blueprintRepository.findById(id);
    if (!existing) {
      const error = new Error('Blueprint not found.');
      error.statusCode = 404;
      throw error;
    }

    return await blueprintRepository.updateApprovalStatus(id, status);
  }
};
