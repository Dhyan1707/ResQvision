import { reportRepository } from '../repositories/reportRepository.js';
import { blueprintRepository } from '../repositories/blueprintRepository.js';
import { activityLogRepository } from '../repositories/activityLogRepository.js';

export const reportService = {
  /**
   * Save a simulation run report
   */
  async createReport(reportData, userId) {
    let { blueprint_id, algorithm_used, evacuation_time, total_distance, visited_nodes, benchmark_json } = reportData;

    // Verify blueprint exists or fallback to available blueprint
    let blueprint = null;
    if (blueprint_id) {
      blueprint = await blueprintRepository.findById(blueprint_id).catch(() => null);
    }

    if (!blueprint) {
      // Find any existing blueprint or create a baseline system blueprint
      const existing = await blueprintRepository.findAll({ limit: 1, offset: 0 }).catch(() => ({ blueprints: [] }));
      if (existing.blueprints && existing.blueprints.length > 0) {
        blueprint_id = existing.blueprints[0].id;
      } else {
        const fallback = await blueprintRepository.createBlueprint({
          title: 'College Evacuation Baseline Model',
          building_type: 'Educational',
          prompt: 'System Generated Baseline',
          blueprint_json: { title: 'Baseline Model', floors: [] },
          approval_status: 'approved',
          created_by: userId
        }).catch(() => null);
        if (fallback) blueprint_id = fallback.id;
      }
    }

    const saved = await reportRepository.createReport({
      user_id: userId,
      blueprint_id,
      algorithm_used: algorithm_used || 'A*',
      evacuation_time: parseFloat(evacuation_time) || 0.0,
      total_distance: parseFloat(total_distance) || 0.0,
      visited_nodes: parseInt(visited_nodes, 10) || 0,
      benchmark_json: benchmark_json || {}
    });

    // Log simulation activity
    await activityLogRepository.log({
      userId,
      action: 'SIMULATION_REPORT_SAVED',
      category: 'simulation',
      details: {
        report_id: saved?.id,
        algorithm: algorithm_used,
        evacuation_time,
        total_distance
      }
    });

    return saved;
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
   * Export reports in JSON or CSV format
   */
  async exportReports({ userId, format = 'json' }) {
    const { reports } = await reportRepository.findAll({
      userId,
      limit: 500,
      offset: 0
    }).catch(() => ({ reports: [] }));

    await activityLogRepository.log({
      userId,
      action: 'REPORTS_EXPORTED',
      category: 'export',
      details: { format, count: reports.length }
    });

    if (format.toLowerCase() === 'csv') {
      const headers = ['ID', 'Algorithm', 'Evacuation Time (s)', 'Total Distance (m)', 'Visited Nodes', 'Created At'];
      const rows = reports.map(r => [
        `"${r.id}"`,
        `"${r.algorithm_used || ''}"`,
        r.evacuation_time,
        r.total_distance,
        r.visited_nodes,
        `"${r.created_at}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      return { format: 'csv', data: csvContent, contentType: 'text/csv' };
    }

    return { format: 'json', data: reports, contentType: 'application/json' };
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
