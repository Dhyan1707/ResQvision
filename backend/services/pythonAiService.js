import { envConfig } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pythonAiService = {
  /**
   * Predict hazard level using ML pipeline (HTTP microservice, local CLI, or analytical fallback)
   */
  async predictHazard(features) {
    const requiredFields = [
      'fire_distance', 'smoke_distance', 'fire_radius', 'smoke_radius',
      'smoke_level', 'fire_age', 'floor_index', 'active_fires_count',
      'local_fire_density', 'is_inside_affected_region'
    ];

    const sanitizedFeatures = {};
    for (const field of requiredFields) {
      sanitizedFeatures[field] = typeof features[field] === 'number' ? features[field] : 0.0;
    }

    // 1. Attempt HTTP call to Python AI microservice
    try {
      const response = await fetch(`${envConfig.PYTHON_AI_URL}/api/predict-hazard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedFeatures),
        signal: AbortSignal.timeout(1500)
      });

      if (response.ok) {
        const result = await response.json();
        return {
          ...result,
          source: 'python-ai-microservice'
        };
      }
    } catch (httpError) {
      // Microservice not reachable, proceed to local CLI execution
    }

    // 2. Attempt local Python script execution via CLI
    try {
      const result = await new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, '../../ai_pipeline/ml/predict.py');
        const jsonInput = JSON.stringify(sanitizedFeatures).replace(/"/g, '\\"');
        const cmd = `python "${scriptPath}" "${jsonInput}"`;

        exec(cmd, { timeout: 3000 }, (error, stdout) => {
          if (error) {
            return reject(error);
          }
          try {
            const parsed = JSON.parse(stdout.trim());
            resolve({ ...parsed, source: 'python-cli' });
          } catch (err) {
            reject(err);
          }
        });
      });

      return result;
    } catch (cliError) {
      // CLI not available, fallback to analytical classifier
    }

    // 3. Fallback: Analytical Hazard Classification derived from trained Random Forest rules
    const fDist = sanitizedFeatures.fire_distance;
    const sDist = sanitizedFeatures.smoke_distance;
    const sLevel = sanitizedFeatures.smoke_level;
    const inRegion = sanitizedFeatures.is_inside_affected_region;

    let hazardLevel = 'SAFE';
    let confidence = 0.95;

    if (fDist <= 4 || (inRegion && fDist <= 8)) {
      hazardLevel = 'CRITICAL';
      confidence = 0.98;
    } else if (fDist <= 18 || sDist <= 12 || sLevel >= 0.7) {
      hazardLevel = 'HIGH';
      confidence = 0.92;
    } else if (fDist <= 35 || sDist <= 28 || sLevel >= 0.4) {
      hazardLevel = 'MODERATE';
      confidence = 0.88;
    } else {
      hazardLevel = 'SAFE';
      confidence = 0.96;
    }

    return {
      hazardLevel,
      confidence,
      source: 'analytical-engine',
      features_used: sanitizedFeatures
    };
  }
};

