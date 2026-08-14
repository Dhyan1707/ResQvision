import { Router } from 'express';
import { simulationController } from '../controllers/simulationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/simulation/fire-spread - Simulate fire spread
router.post('/fire-spread', authenticate, simulationController.calculateFireSpread);

// POST /api/simulation/pathfind - Calculate shortest path to exit
router.post('/pathfind', authenticate, simulationController.calculateEscapeRoute);

export default router;
