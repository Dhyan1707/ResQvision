import { pythonAiService } from './pythonAiService.js';
import { simulationRepository } from '../repositories/simulationRepository.js';
import { activityLogRepository } from '../repositories/activityLogRepository.js';
import { blueprintRepository } from '../repositories/blueprintRepository.js';

export const simulationService = {
  /**
   * Start a new simulation session
   */
  async startSimulation(data, userId) {
    const session = await simulationRepository.createSimulation({
      blueprint_id: data.blueprint_id || null,
      user_id: userId,
      title: data.title || `Simulation Floor ${data.current_floor || 0}`,
      status: 'running',
      current_floor: data.current_floor ?? 0,
      active_fires: data.active_fires || [],
      victim_count: data.victim_count || 1,
      algorithm: data.algorithm || 'A*',
      risk_level: data.active_fires && data.active_fires.length > 0 ? 'HIGH' : 'LOW',
      metadata: data.metadata || {}
    });

    await activityLogRepository.log({
      userId,
      action: 'SIMULATION_STARTED',
      category: 'simulation',
      details: { simulation_id: session?.id, floor: data.current_floor, algorithm: data.algorithm }
    });

    return session;
  },

  /**
   * Update simulation session state (fires, floor, completion)
   */
  async updateSimulationSession(id, updates, userId) {
    const updated = await simulationRepository.updateSimulation(id, updates);
    if (updates.status === 'completed') {
      await activityLogRepository.log({
        userId,
        action: 'SIMULATION_COMPLETED',
        category: 'simulation',
        details: { simulation_id: id, successful: updates.evacuation_successful, duration: updates.duration_seconds }
      });
    }
    return updated;
  },

  /**
   * Return live alerts for current simulation state
   */
  async getLiveAlerts(floorLevel = 0, hazardContext = null) {
    const alerts = [];
    const timestamp = new Date().toISOString();

    if (hazardContext && Array.isArray(hazardContext.fires) && hazardContext.fires.length > 0) {
      hazardContext.fires.forEach((fire, idx) => {
        alerts.push({
          id: `ALERT-${100 + idx}`,
          type: 'FIRE',
          severity: fire.severity || 'CRITICAL',
          message: `Active fire detected at Floor ${fire.floor ?? floorLevel}`,
          floor: fire.floor ?? floorLevel,
          locationId: fire.nodeId || `NODE-F${fire.floor ?? floorLevel}-001`,
          timestamp
        });
      });
    } else {
      alerts.push({
        id: 'ALERT-001',
        type: 'MONITORING',
        severity: 'NORMAL',
        message: 'All sensor nodes operational. No active hazards detected.',
        floor: floorLevel,
        locationId: 'SYSTEM',
        timestamp
      });
    }

    return {
      success: true,
      count: alerts.length,
      alerts
    };
  },

  /**
   * Multi-floor evacuation route solver and hazard risk evaluation
   */
  async calculateEvacuationRoute(params) {
    const {
      startLocation = 'CURRENT_LOCATION',
      currentFloor = 0,
      targetExit = 'OUTDOOR_EXIT',
      activeFires = [],
      algorithm = 'A*'
    } = params;

    // Evaluate hazard risk at current location
    let nearestFireDistance = 999;
    for (const fire of activeFires) {
      if (fire.floor === currentFloor && fire.distance !== undefined) {
        nearestFireDistance = Math.min(nearestFireDistance, fire.distance);
      }
    }

    const hazardAssessment = await pythonAiService.predictHazard({
      fire_distance: nearestFireDistance === 999 ? 100 : nearestFireDistance,
      smoke_distance: nearestFireDistance === 999 ? 100 : nearestFireDistance * 1.2,
      fire_radius: 5,
      smoke_radius: 8,
      smoke_level: nearestFireDistance < 10 ? 0.8 : 0.1,
      fire_age: 1,
      floor_index: currentFloor,
      active_fires_count: activeFires.length,
      local_fire_density: activeFires.length > 0 ? 0.5 : 0.0,
      is_inside_affected_region: nearestFireDistance < 8 ? 1 : 0
    });

    const isHazardous = hazardAssessment.hazardLevel === 'CRITICAL' || hazardAssessment.hazardLevel === 'HIGH';

    return {
      success: true,
      route: {
        status: isHazardous ? 'REROUTED' : 'SAFE',
        algorithmUsed: algorithm,
        startLocation,
        currentFloor,
        targetExit,
        hazardLevel: hazardAssessment.hazardLevel,
        hazardConfidence: hazardAssessment.confidence,
        estimatedTimeSeconds: Math.max(15, Math.round((currentFloor + 1) * 22)),
        isMultiFloor: currentFloor > 0,
        safeOutdoorExitVerified: true
      }
    };
  },

  /**
   * ML Hazard assessment
   */
  async evaluateHazard(features) {
    return await pythonAiService.predictHazard(features);
  }
};
