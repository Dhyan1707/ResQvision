import { envConfig } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing request ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errors = envConfig.NODE_ENV === 'development' ? err.stack : undefined;

  return errorResponse(res, statusCode, message, errors);
};
