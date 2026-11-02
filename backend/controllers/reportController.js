import { reportService } from '../services/reportService.js';
import { successResponse } from '../utils/response.js';

export const reportController = {
  /**
   * POST /api/reports
   */
  async create(req, res, next) {
    try {
      const report = await reportService.createReport(req.body, req.user.id);
      return successResponse(res, 201, 'Simulation report recorded successfully', report);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports
   */
  async getAll(req, res, next) {
    try {
      const { blueprintId, page, limit, all } = req.query;
      // Show only the authenticated user's reports unless an admin explicitly requests all
      const filterUserId = (req.user && req.user.role === 'admin' && all === 'true') ? req.query.userId : (req.user ? req.user.id : null);
      const result = await reportService.getReports({
        userId: filterUserId,
        blueprintId,
        page,
        limit
      });
      return successResponse(res, 200, 'Simulation reports retrieved successfully', result.reports, { total: result.total });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/export?format=json|csv
   */
  async exportReports(req, res, next) {
    try {
      const format = req.query.format || 'json';
      const result = await reportService.exportReports({
        userId: req.user.role === 'admin' ? null : req.user.id,
        format
      });

      if (format.toLowerCase() === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="evacuation_reports.csv"');
        return res.send(result.data);
      }

      return successResponse(res, 200, 'Reports exported successfully', result.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const report = await reportService.getReportById(id, req.user.id, req.user.role);
      return successResponse(res, 200, 'Simulation report retrieved successfully', report);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/reports/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await reportService.deleteReport(id, req.user.id, req.user.role);
      return successResponse(res, 200, 'Simulation report deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
