import { analyticsService } from '../services/analyticsService.js';
import { successResponse } from '../utils/response.js';

export const analyticsController = {
  /**
   * GET /api/analytics/summary
   */
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsService.getAnalyticsSummary();
      return successResponse(res, 200, 'Analytics summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }
};

