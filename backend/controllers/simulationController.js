import { simulationService } from '../services/simulationService.js';
import { successResponse } from '../utils/response.js';

export const simulationController = {
  /**
   * POST /api/simulation/start
   */
  async startSimulation(req, res, next) {
    try {
      const session = await simulationService.startSimulation(req.body, req.user?.id || '00000000-0000-0000-0000-000000000001');
      return successResponse(res, 201, 'Simulation session started successfully', session);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/simulation/:id
   */
  async updateSession(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await simulationService.updateSimulationSession(id, req.body, req.user?.id || '00000000-0000-0000-0000-000000000001');
      return successResponse(res, 200, 'Simulation session updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/simulation/alerts
   */
  async getAlerts(req, res, next) {
    try {
      const floorLevel = parseInt(req.query.floor || '0', 10);
      const data = await simulationService.getLiveAlerts(floorLevel);
      return successResponse(res, 200, 'Alerts retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/simulation/evacuate
   */
  async calculateEvacuation(req, res, next) {
    try {
      const result = await simulationService.calculateEvacuationRoute(req.body);
      return successResponse(res, 200, 'Evacuation route computed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/simulation/predict-hazard
   */
  async predictHazard(req, res, next) {
    try {
      const result = await simulationService.evaluateHazard(req.body);
      return successResponse(res, 200, 'Hazard prediction computed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/simulation/status
   */
  async getStatus(req, res, next) {
    try {
      return successResponse(res, 200, 'Simulation engine online', {
        status: 'ONLINE',
        mode: 'ACTIVE_MONITORING',
        multiFloorSupported: true,
        supportedAlgorithms: ['A*', 'Dijkstra', 'BFS']
      });
    } catch (error) {
      next(error);
    }
  }
};
