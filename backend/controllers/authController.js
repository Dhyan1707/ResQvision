import { authService } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });
      return successResponse(res, 201, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return successResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return successResponse(res, 200, 'Profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, password } = req.body;
      const updatedUser = await authService.updateProfile(req.user.id, { name, password });
      return successResponse(res, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }
};
