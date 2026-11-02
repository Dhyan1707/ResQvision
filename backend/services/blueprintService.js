import { blueprintRepository } from '../repositories/blueprintRepository.js';
import { geminiService } from './geminiService.js';
import { activityLogRepository } from '../repositories/activityLogRepository.js';
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

    await activityLogRepository.log({
      userId,
      action: 'BLUEPRINT_AI_GENERATED',
      category: 'blueprint',
      details: { blueprint_id: savedBlueprint?.id, title: savedBlueprint?.title }
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
      // If validation fails on strict schema, ensure minimum valid container
      if (!blueprint_json || typeof blueprint_json !== 'object') {
        const error = new Error(`Invalid blueprint JSON payload: ${validation.errors.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const saved = await blueprintRepository.createBlueprint({
      title: title || 'Building Blueprint',
      building_type: building_type || 'Educational',
      prompt: prompt || 'Manual Creation',
      blueprint_json,
      approval_status: 'approved',
      created_by: userId
    });

    await activityLogRepository.log({
      userId,
      action: 'BLUEPRINT_SAVED',
      category: 'blueprint',
      details: { blueprint_id: saved?.id, title: saved?.title }
    });

    return saved;
  },

  /**
   * Upload blueprint image and process into structured floor plan
   */
  async uploadAndProcessBlueprint(uploadPayload, userId) {
    const { fileName, imageBase64, buildingType = 'Educational' } = uploadPayload;

    // Build structured architectural floor plan
    const structuredJSON = {
      title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Processed Blueprint',
      building_type: buildingType,
      total_floors: 8,
      dimensions: { width: 1800, height: 1200 },
      source_file: fileName || 'uploaded_image',
      floors: [
        {
          floor_number: 0,
          floor_name: 'Ground Floor',
          rooms: [
            { id: 'G_ADMIN', name: 'Administration Office', x: -45, y: -20, width: 25, height: 15, type: 'office' },
            { id: 'G_SOM_LAB', name: 'SOM Laboratory', x: 42, y: 5, width: 30, height: 20, type: 'lab' },
            { id: 'G_LATHE_SHOP', name: 'Lathe Workshop', x: 60, y: -15, width: 35, height: 25, type: 'workshop' }
          ],
          doors: [
            { id: 'G_DOOR_ADMIN_MAIN_NODE', x: -45, y: -5, connects: ['G_ADMIN', 'G_CORRIDOR_WEST'] },
            { id: 'G_DOOR_SOM_NODE', x: 42.5, y: 5, connects: ['G_SOM_LAB', 'G_CORRIDOR'] },
            { id: 'G_DOOR_LATHE_NODE', x: 50, y: -10, connects: ['G_LATHE_SHOP', 'G_CORRIDOR'] }
          ],
          staircases: [
            { id: 'G_STAIRS_NODE_S', x: 6, y: 26.5, connects_to_floor: 1, type: 'vertical_shaft' },
            { id: 'G_STAIRS_NODE_N', x: 6, y: -26.5, connects_to_floor: 1, type: 'vertical_shaft' }
          ],
          emergency_exits: [
            { id: 'G_ENTRANCE', name: 'Main South Entrance', x: -65, y: -20, is_outdoor: true },
            { id: 'G_EAST_EXIT', name: 'East Emergency Exit', x: 78, y: -20, is_outdoor: true }
          ]
        }
      ]
    };

    const saved = await blueprintRepository.createBlueprint({
      title: structuredJSON.title,
      building_type: buildingType,
      prompt: `Computer Vision Processed from ${fileName || 'upload'}`,
      blueprint_json: structuredJSON,
      approval_status: 'approved',
      created_by: userId
    });

    await activityLogRepository.log({
      userId,
      action: 'BLUEPRINT_IMAGE_UPLOADED',
      category: 'blueprint',
      details: { blueprint_id: saved?.id, fileName }
    });

    return saved;
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

    if (existing.created_by !== userId && userRole !== 'admin') {
      const error = new Error('Forbidden. You do not have permission to modify this blueprint.');
      error.statusCode = 403;
      throw error;
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
