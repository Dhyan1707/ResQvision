import { Router } from 'express';
import { body } from 'express-validator';
import { simulationController } from '../controllers/simulationController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// GET /api/simulation/alerts - Retrieve simulation alerts
router.get('/alerts', simulationController.getAlerts);

// GET /api/simulation/status - Retrieve simulation system status
router.get('/status', simulationController.getStatus);

// POST /api/simulation/start - Start a live simulation session
router.post(
  '/start',
  optionalAuth,
  [
    body('current_floor').optional().isInt({ min: 0, max: 10 }),
    body('victim_count').optional().isInt({ min: 1, max: 500 }),
    body('algorithm').optional().isIn(['A*', 'Dijkstra', 'BFS'])
  ],
  validate,
  simulationController.startSimulation
);

// PUT /api/simulation/:id - Update simulation session status / fires
router.put(
  '/:id',
  optionalAuth,
  simulationController.updateSession
);

// POST /api/simulation/evacuate - Compute route / evaluation
router.post(
  '/evacuate',
  [
    body('startLocation').optional().trim(),
    body('currentFloor').optional().isInt({ min: 0, max: 10 }),
    body('algorithm').optional().isIn(['A*', 'Dijkstra', 'BFS'])
  ],
  validate,
  simulationController.calculateEvacuation
);

// POST /api/simulation/predict-hazard - Machine Learning Hazard Prediction
router.post(
  '/predict-hazard',
  [
    body('fire_distance').optional().isNumeric(),
    body('smoke_distance').optional().isNumeric(),
    body('smoke_level').optional().isNumeric()
  ],
  validate,
  simulationController.predictHazard
);

export default router;
