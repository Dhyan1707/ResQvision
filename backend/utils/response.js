/**
 * Standard Success Response Formatter
 * @param {Object} res - Express Response Object
 * @param {number} statusCode - HTTP Status Code
 * @param {string} message - User readable message
 * @param {Object|Array} data - Payload data
 * @param {Object} meta - Optional pagination/metadata
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const responseBody = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta })
  };
  return res.status(statusCode).json(responseBody);
};

/**
 * Standard Error Response Formatter
 * @param {Object} res - Express Response Object
 * @param {number} statusCode - HTTP Status Code
 * @param {string} message - Error message
 * @param {Object|Array} errors - Detailed validation/error list
 */
export const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const responseBody = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(responseBody);
};
