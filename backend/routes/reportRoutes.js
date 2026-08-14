import { Router } from 'express';
import { body, param } from 'express-validator';
import { reportController } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// POST /api/reports - Record a simulation run report
router.post(
  '/',
  [
    body('blueprint_id').isUUID().withMessage('Valid blueprint_id (UUID) is required.'),
    body('algorithm_used').trim().notEmpty().withMessage('algorithm_used is required.'),
    body('evacuation_time').isNumeric().withMessage('evacuation_time must be a positive number.'),
    body('total_distance').isNumeric().withMessage('total_distance must be a positive number.'),
    body('visited_nodes').isInt({ min: 0 }).withMessage('visited_nodes must be a non-negative integer.'),
    body('benchmark_json').optional().isObject()
  ],
  validate,
  reportController.create
);

// GET /api/reports - Get simulation reports
router.get('/', reportController.getAll);

// GET /api/reports/:id - Get single report
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid UUID format for report ID.')],
  validate,
  reportController.getById
);

// DELETE /api/reports/:id - Delete report
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid UUID format for report ID.')],
  validate,
  reportController.delete
);

export default router;
