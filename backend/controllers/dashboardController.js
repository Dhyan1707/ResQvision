import { dashboardService } from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';

export const dashboardController = {
  /**
   * GET /api/dashboard/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return successResponse(res, 200, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }
};

