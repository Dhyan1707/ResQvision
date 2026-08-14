import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.js';

/**
 * Sign a JWT token with user payload.
 * @param {Object} payload - User object payload containing id, email, role.
 * @returns {string} Signed JWT string.
 */
export const generateToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role
    },
    envConfig.JWT_SECRET,
    {
      expiresIn: envConfig.JWT_EXPIRES_IN
    }
  );
};

/**
 * Verify a JWT token string.
 * @param {string} token - JWT token string.
 * @returns {Object} Decoded payload object.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, envConfig.JWT_SECRET);
};
