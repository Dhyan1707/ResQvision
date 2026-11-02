import { blueprintService } from '../services/blueprintService.js';
import { successResponse } from '../utils/response.js';

export const blueprintController = {
  /**
   * POST /api/blueprints/generate
   */
  async generate(req, res, next) {
    try {
      const { prompt, building_type } = req.body;
      const result = await blueprintService.generateAIBlueprint(prompt, building_type, req.user?.id || '00000000-0000-0000-0000-000000000001');
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
      const result = await blueprintService.uploadAndProcessBlueprint(req.body, req.user?.id || '00000000-0000-0000-0000-000000000001');
      return successResponse(res, 201, 'Blueprint image uploaded and parsed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/blueprints
   */
  async create(req, res, next) {
    try {
      const result = await blueprintService.createBlueprint(req.body, req.user?.id || '00000000-0000-0000-0000-000000000001');
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
      const result = await blueprintService.updateBlueprint(id, req.body, req.user.id, req.user.role);
      return successResponse(res, 200, 'Blueprint updated successfully', result);
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
      const result = await blueprintService.publishBlueprint(id, req.user.id);
      return successResponse(res, 200, 'Blueprint publication requested successfully', result);
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
      const { status } = req.body;
      const result = await blueprintService.approveBlueprint(id, status);
      return successResponse(res, 200, `Blueprint ${status} successfully`, result);
    } catch (error) {
      next(error);
    }
  }
};
