import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();

// GET /api/dashboard/stats - Aggregated live metrics from database records
router.get('/stats', dashboardController.getStats);

export default router;

