import { blueprintService } from '../services/blueprintService.js';
import { successResponse } from '../utils/response.js';

export const blueprintController = {
  /**
   * POST /api/blueprints/generate
   */
  async generate(req, res, next) {
    try {
      const { prompt, building_type } = req.body;
      const result = await blueprintService.generateAIBlueprint(prompt, building_type, req.user.id);
      return successResponse(res, 201, 'AI Blueprint generated and saved as draft successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/blueprints/upload
   */
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
      }

      const { title, building_type } = req.body;
      
      const result = await blueprintService.generateBlueprintFromImage(
        req.file.buffer,
        req.file.mimetype,
        req.user.id,
        title,
        building_type
      );
      
      return successResponse(res, 201, 'Blueprint extracted from image and saved as draft successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/blueprints
   */
  async create(req, res, next) {
    try {
      const result = await blueprintService.createBlueprint(req.body, req.user.id);
      return successResponse(res, 201, 'Blueprint created successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/blueprints
   */
  async getAll(req, res, next) {
    try {
      const { status, createdBy, limit, page } = req.query;
      const result = await blueprintService.getBlueprints({ status, createdBy, limit, page });
      return successResponse(res, 200, 'Blueprints retrieved successfully', result.blueprints, { total: result.total });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/blueprints/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const blueprint = await blueprintService.getBlueprintById(id);
      return successResponse(res, 200, 'Blueprint retrieved successfully', blueprint);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/blueprints/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await blueprintService.updateBlueprint(id, req.body, req.user.id, req.user.role);
      return successResponse(res, 200, 'Blueprint updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/blueprints/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await blueprintService.deleteBlueprint(id, req.user.id, req.user.role);
      return successResponse(res, 200, 'Blueprint deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/blueprints/:id/publish
   */
  async publish(req, res, next) {
    try {
      const { id } = req.params;
      const published = await blueprintService.publishBlueprint(id, req.user.id);
      return successResponse(res, 200, 'Blueprint submitted for publication/approval', published);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/blueprints/:id/approve
   */
  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'approved' or 'rejected'
      const approved = await blueprintService.approveBlueprint(id, status);
      return successResponse(res, 200, `Blueprint status updated to ${status}`, approved);
    } catch (error) {
      next(error);
    }
  }
};
