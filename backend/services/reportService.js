import { reportRepository } from '../repositories/reportRepository.js';
import { blueprintRepository } from '../repositories/blueprintRepository.js';

export const reportService = {
  /**
   * Save a simulation run report
   */
  async createReport(reportData, userId) {
    const { blueprint_id, algorithm_used, evacuation_time, total_distance, visited_nodes, benchmark_json } = reportData;

    // Verify blueprint exists
    const blueprint = await blueprintRepository.findById(blueprint_id);
    if (!blueprint) {
      const error = new Error('Associated blueprint does not exist.');
      error.statusCode = 404;
      throw error;
    }

    return await reportRepository.createReport({
      user_id: userId,
      blueprint_id,
      algorithm_used,
      evacuation_time,
      total_distance,
      visited_nodes,
      benchmark_json: benchmark_json || {}
    });
  },

  /**
   * Get reports with pagination and optional user filter
   */
  async getReports({ userId, blueprintId, page, limit }) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const offset = (pageNum - 1) * limitNum;

    return await reportRepository.findAll({
      userId,
      blueprintId,
      limit: limitNum,
      offset
    });
  },

  /**
   * Get single simulation report by ID
   */
  async getReportById(id, userId, userRole) {
    const report = await reportRepository.findById(id);
    if (!report) {
      const error = new Error('Simulation report not found.');
      error.statusCode = 404;
      throw error;
    }

    // Access control: User can access own report or admin can access any
    if (report.user_id !== userId && userRole !== 'admin') {
      const error = new Error('Forbidden. You do not have permission to view this report.');
      error.statusCode = 403;
      throw error;
    }

    return report;
  },

  /**
   * Delete report
   */
  async deleteReport(id, userId, userRole) {
    const existing = await reportRepository.findById(id);
    if (!existing) {
      const error = new Error('Simulation report not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.user_id !== userId && userRole !== 'admin') {
      const error = new Error('Forbidden. You do not have permission to delete this report.');
      error.statusCode = 403;
      throw error;
    }

    return await reportRepository.deleteReport(id);
  }
};
