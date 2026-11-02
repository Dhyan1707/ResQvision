import { Router } from 'express';
import { body, param } from 'express-validator';
import { reportController } from '../controllers/reportController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// GET /api/reports/export - Export simulation reports as CSV or JSON
router.get('/export', optionalAuth, reportController.exportReports);

// POST /api/reports - Record a simulation run report (supports both authenticated users and desktop client)
router.post(
  '/',
  optionalAuth,
  [
    body('algorithm_used').optional().trim().notEmpty(),
    body('evacuation_time').isNumeric().withMessage('evacuation_time must be a positive number.'),
    body('total_distance').isNumeric().withMessage('total_distance must be a positive number.'),
    body('visited_nodes').isInt({ min: 0 }).withMessage('visited_nodes must be a non-negative integer.'),
    body('benchmark_json').optional().isObject()
  ],
  validate,
  reportController.create
);

// GET /api/reports - Get simulation reports
router.get('/', optionalAuth, reportController.getAll);

// GET /api/reports/:id - Get single report
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid UUID format for report ID.')],
  validate,
  reportController.getById
);

// DELETE /api/reports/:id - Delete report
router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid UUID format for report ID.')],
  validate,
  reportController.delete
);

export default router;
