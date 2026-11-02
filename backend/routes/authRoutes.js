import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email address is required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin.')
  ],
  validate,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email address is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  authController.login
);

// GET /api/auth/profile
router.get('/profile', authenticate, authController.getProfile);

// PUT /api/auth/profile
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
  ],
  validate,
  authController.updateProfile
);

export default router;
