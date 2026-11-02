import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { validateBlueprintJSON } from '../utils/validator.js';

describe('AI Fire Evacuation Simulator Backend Test Suite', () => {
  describe('JWT Utility Tests', () => {
    test('Should sign and verify a valid JWT token', () => {
      const payload = { id: 'test-uuid-123', email: 'test@evacuation.com', role: 'user' };
      const token = generateToken(payload);
      assert.ok(typeof token === 'string');

      const decoded = verifyToken(token);
      assert.strictEqual(decoded.id, payload.id);
      assert.strictEqual(decoded.email, payload.email);
      assert.strictEqual(decoded.role, payload.role);
    });
  });

  describe('Blueprint Contract Validator Tests', () => {
    test('Should validate a correctly formatted Blueprint JSON contract', () => {
      const validBlueprint = {
        title: '3-Floor Hospital evac route',
        building_type: 'Hospital',
        total_floors: 3,
        dimensions: { width: 100, height: 100 },
        floors: [
          {
            floor_number: 1,
            floor_name: 'Ground Floor',
            rooms: [{ id: 'r1', name: 'ICU', x: 0, y: 0, width: 20, height: 20, type: 'icu' }],
            emergency_exits: [{ id: 'e1', x: 0, y: 10, name: 'Main Exit' }],
            staircases: [{ id: 's1', x: 50, y: 50, connects_to_floor: 2 }]
          }
        ]
      };

      const result = validateBlueprintJSON(validBlueprint);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    test('Should reject invalid blueprint contract missing required fields', () => {
      const invalidBlueprint = {
        title: 'Broken Layout'
        // missing building_type, total_floors, dimensions, floors
      };

      const result = validateBlueprintJSON(invalidBlueprint);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.length > 0);
    });
  });

  describe('Simulation Service Tests', () => {
    test('Should return live alerts structure with default monitoring state', async () => {
      const { simulationService } = await import('../services/simulationService.js');
      const alertsData = await simulationService.getLiveAlerts(0);
      assert.strictEqual(alertsData.success, true);
      assert.ok(Array.isArray(alertsData.alerts));
      assert.ok(alertsData.alerts.length > 0);
    });

    test('Should calculate safe evacuation route with multi-floor awareness', async () => {
      const { simulationService } = await import('../services/simulationService.js');
      const routeResult = await simulationService.calculateEvacuationRoute({
        startLocation: 'ROOM-F3-301',
        currentFloor: 3,
        algorithm: 'A*'
      });
      assert.strictEqual(routeResult.success, true);
      assert.strictEqual(routeResult.route.algorithmUsed, 'A*');
      assert.strictEqual(routeResult.route.isMultiFloor, true);
      assert.strictEqual(routeResult.route.safeOutdoorExitVerified, true);
    });

    test('Should evaluate hazard using analytical model or ML engine', async () => {
      const { pythonAiService } = await import('../services/pythonAiService.js');
      const criticalResult = await pythonAiService.predictHazard({
        fire_distance: 2,
        smoke_distance: 3,
        is_inside_affected_region: 1
      });
      assert.strictEqual(criticalResult.hazardLevel, 'CRITICAL');
      assert.ok(criticalResult.confidence >= 0.8);

      const safeResult = await pythonAiService.predictHazard({
        fire_distance: 100,
        smoke_distance: 100,
        is_inside_affected_region: 0
      });
      assert.strictEqual(safeResult.hazardLevel, 'SAFE');
    });
  });

  describe('Dashboard Service Tests', () => {
    test('Should return calculated dashboard statistics with overview and risk stats', async () => {
      const { dashboardService } = await import('../services/dashboardService.js');
      const stats = await dashboardService.getDashboardStats();
      assert.ok(stats.overview);
      assert.ok(stats.evacuation_stats);
      assert.ok(stats.risk_stats);
      assert.strictEqual(typeof stats.overview.total_users, 'number');
      assert.strictEqual(typeof stats.evacuation_stats.average_evacuation_time_seconds, 'number');
    });
  });

  describe('Analytics Service Tests', () => {
    test('Should return algorithm performance comparisons and floor matrix', async () => {
      const { analyticsService } = await import('../services/analyticsService.js');
      const summary = await analyticsService.getAnalyticsSummary();
      assert.ok(Array.isArray(summary.algorithm_comparison));
      assert.ok(Array.isArray(summary.floor_hazard_matrix));
      assert.strictEqual(summary.floor_hazard_matrix.length, 8); // 8 floors
      assert.ok(typeof summary.safety_score, 'number');
    });
  });

  describe('Report Export Tests', () => {
    test('Should generate formatted CSV report export', async () => {
      const { reportService } = await import('../services/reportService.js');
      const csvExport = await reportService.exportReports({ format: 'csv' });
      assert.strictEqual(csvExport.format, 'csv');
      assert.strictEqual(csvExport.contentType, 'text/csv');
      assert.ok(typeof csvExport.data === 'string');
      assert.ok(csvExport.data.includes('Algorithm'));
    });
  });
});
