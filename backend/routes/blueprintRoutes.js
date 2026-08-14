import { Router } from 'express';
import { body, param } from 'express-validator';
import { blueprintController } from '../controllers/blueprintController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/blueprints/upload - Upload blueprint image and convert to JSON
router.post(
  '/upload',
  authenticate,
  upload.single('blueprint_image'),
  blueprintController.upload
);

// POST /api/blueprints/generate - Generate blueprint via Google Gemini AI
router.post(
  '/generate',
  authenticate,
  [
    body('prompt').trim().notEmpty().withMessage('Prompt string is required.'),
    body('building_type').optional().trim().notEmpty()
  ],
  validate,
  blueprintController.generate
);

// POST /api/blueprints - Create blueprint manually
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('building_type').trim().notEmpty().withMessage('Building type is required.'),
    body('blueprint_json').isObject().withMessage('blueprint_json must be a valid JSON object.')
  ],
  validate,
  blueprintController.create
);

// GET /api/blueprints - List blueprints
router.get('/', blueprintController.getAll);

// GET /api/blueprints/:id - Get single blueprint
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid UUID format for blueprint ID.')],
  validate,
  blueprintController.getById
);

// PUT /api/blueprints/:id - Update blueprint
router.put(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid UUID format for blueprint ID.')],
  validate,
  blueprintController.update
);

// DELETE /api/blueprints/:id - Delete blueprint
router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid UUID format for blueprint ID.')],
  validate,
  blueprintController.delete
);

// POST /api/blueprints/:id/publish - Request publish
router.post(
  '/:id/publish',
  authenticate,
  [param('id').isUUID().withMessage('Invalid UUID format for blueprint ID.')],
  validate,
  blueprintController.publish
);

// POST /api/blueprints/:id/approve - Approve / Reject (Admin only)
router.post(
  '/:id/approve',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid UUID format for blueprint ID.'),
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected.')
  ],
  validate,
  blueprintController.approve
);

export default router;
