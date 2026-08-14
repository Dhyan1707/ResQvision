import { simulationService } from '../services/simulationService.js';
import { blueprintService } from '../services/blueprintService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const simulationController = {
  /**
   * POST /api/simulation/fire-spread
   * Calculates the spread of fire over time.
   */
  async calculateFireSpread(req, res, next) {
    try {
      const { blueprint_id, fire_origin, steps = 10 } = req.body;
      
      if (!blueprint_id || !fire_origin || fire_origin.x === undefined || fire_origin.y === undefined) {
        return errorResponse(res, 400, "Missing required fields: blueprint_id and fire_origin {x, y}");
      }

      // Fetch the blueprint
      const blueprint = await blueprintService.getBlueprintById(blueprint_id);
      
      // Calculate spread
      const fireHistory = simulationService.simulateFireSpread(blueprint.blueprint_json, fire_origin, steps);

      return successResponse(res, 200, "Fire spread simulation generated successfully", {
        steps_calculated: fireHistory.length,
        fire_history: fireHistory // Array where index is step, value is array of fire nodes
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/simulation/pathfind
   * Calculates shortest path avoiding fire.
   */
  async calculateEscapeRoute(req, res, next) {
    try {
      const { blueprint_id, start_position, fire_nodes = [] } = req.body;

      if (!blueprint_id || !start_position || start_position.x === undefined || start_position.y === undefined) {
        return errorResponse(res, 400, "Missing required fields: blueprint_id and start_position {x, y}");
      }

      // Fetch the blueprint
      const blueprint = await blueprintService.getBlueprintById(blueprint_id);

      // Run A*
      try {
        const escapeRoute = simulationService.calculateEscapeRoute(blueprint.blueprint_json, start_position, fire_nodes);
        
        return successResponse(res, 200, "Safe escape route calculated successfully", {
          path: escapeRoute,
          path_length: escapeRoute.length
        });
      } catch (simError) {
        // Safe route couldn't be found (e.g. fire blocked everything)
        return errorResponse(res, 404, simError.message);
      }
    } catch (error) {
      next(error);
    }
  }
};
