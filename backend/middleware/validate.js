import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

/**
 * Validation Middleware - Executes express-validator checks and formats error payload
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return errorResponse(res, 400, 'Validation failed for input fields.', formattedErrors);
  }
  next();
};
