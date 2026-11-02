import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';

const router = Router();

// GET /api/analytics/summary - Comparative algorithm performance and hazard matrix
router.get('/summary', analyticsController.getSummary);

export default router;

