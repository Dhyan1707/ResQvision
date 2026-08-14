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
});
