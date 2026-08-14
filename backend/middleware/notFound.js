import { errorResponse } from '../utils/response.js';

/**
 * 404 Route Not Found Middleware
 */
export const notFound = (req, res, next) => {
  return errorResponse(res, 404, `Cannot ${req.method} ${req.originalUrl} - Endpoint Not Found`);
};
