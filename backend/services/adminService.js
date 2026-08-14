import { userRepository } from '../repositories/userRepository.js';
import { blueprintRepository } from '../repositories/blueprintRepository.js';
import { reportRepository } from '../repositories/reportRepository.js';

export const adminService = {
  /**
   * Get high level admin dashboard metrics summary
   */
  async getDashboardMetrics() {
    const totalUsers = await userRepository.countAll();
    const totalBlueprints = await blueprintRepository.countAll();
    const totalReports = await reportRepository.countAll();

    const pendingBlueprints = await blueprintRepository.findAll({ status: 'pending', limit: 1 });

    return {
      total_users: totalUsers,
      total_blueprints: totalBlueprints,
      total_reports: totalReports,
      pending_approvals: pendingBlueprints.total
    };
  },

  /**
   * List all system users with pagination
   */
  async getUsers({ page, limit }) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const offset = (pageNum - 1) * limitNum;

    return await userRepository.findAll(limitNum, offset);
  },

  /**
   * Update user details or role/status as admin
   */
  async updateUser(userId, updateData) {
    const existing = await userRepository.findById(userId);
    if (!existing) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return await userRepository.updateUser(userId, updateData);
  },

  /**
   * Delete user account as admin
   */
  async deleteUser(userId) {
    const existing = await userRepository.findById(userId);
    if (!existing) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return await userRepository.deleteUser(userId);
  },

  /**
   * Get overall simulation reports (Admin view)
   */
  async getAllReports({ page, limit }) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const offset = (pageNum - 1) * limitNum;

    return await reportRepository.findAll({ limit: limitNum, offset });
  },

  /**
   * Get overall blueprints (Admin view)
   */
  async getAllBlueprints({ status, page, limit }) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const offset = (pageNum - 1) * limitNum;

    return await blueprintRepository.findAll({ status, limit: limitNum, offset });
  }
};
