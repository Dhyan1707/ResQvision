import { adminService } from '../services/adminService.js';
import { successResponse } from '../utils/response.js';

export const adminController = {
  /**
   * GET /api/admin/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const metrics = await adminService.getDashboardMetrics();
      return successResponse(res, 200, 'Admin dashboard metrics retrieved successfully', metrics);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/users
   */
  async getUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getUsers({ page, limit });
      return successResponse(res, 200, 'User list retrieved successfully', result.users, { total: result.total });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/admin/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await adminService.updateUser(id, req.body);
      return successResponse(res, 200, 'User account updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      return successResponse(res, 200, 'User account deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/reports
   */
  async getReports(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAllReports({ page, limit });
      return successResponse(res, 200, 'All simulation reports retrieved successfully', result.reports, { total: result.total });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/blueprints
   */
  async getBlueprints(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = await adminService.getAllBlueprints({ status, page, limit });
      return successResponse(res, 200, 'All blueprints retrieved successfully', result.blueprints, { total: result.total });
    } catch (error) {
      next(error);
    }
  }
};
