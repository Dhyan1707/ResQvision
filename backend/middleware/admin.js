import { errorResponse } from '../utils/response.js';

/**
 * Admin Middleware - Enforces Administrator Privileges
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Authentication required before performing administrative actions.');
  }

  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Forbidden. Access restricted to administrator accounts only.');
  }

  next();
};
