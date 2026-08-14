import { Router } from 'express';
import { param, body } from 'express-validator';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Protect all admin endpoints with JWT authentication and Admin RBAC
router.use(authenticate, requireAdmin);

// GET /api/admin/dashboard - High-level metrics
router.get('/dashboard', adminController.getDashboard);

// GET /api/admin/users - User management list
router.get('/users', adminController.getUsers);

// PUT /api/admin/users/:id - Update user details/role
router.put(
  '/users/:id',
  [
    param('id').isUUID().withMessage('Invalid UUID format for user ID.'),
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['user', 'admin']),
    body('is_active').optional().isBoolean()
  ],
  validate,
  adminController.updateUser
);

// DELETE /api/admin/users/:id - Delete user account
router.delete(
  '/users/:id',
  [param('id').isUUID().withMessage('Invalid UUID format for user ID.')],
  validate,
  adminController.deleteUser
);

// GET /api/admin/reports - View all system simulation reports
router.get('/reports', adminController.getReports);

// GET /api/admin/blueprints - View all system blueprints
router.get('/blueprints', adminController.getBlueprints);

export default router;
