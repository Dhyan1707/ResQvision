import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication Middleware - Verifies Bearer JWT Token
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No authentication token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 401, 'Access denied. Invalid token format.');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Authentication failed. Token has expired.');
    }
    return errorResponse(res, 401, 'Authentication failed. Invalid token.');
  }
};
