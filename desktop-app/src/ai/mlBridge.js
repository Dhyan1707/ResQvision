(function() {
    let exec = null;
    let path = null;
    if (typeof require !== 'undefined') {
        exec = require('child_process').exec;
        path = require('path');
    }

    function predictHazardWithML(features) {
        return new Promise((resolve, reject) => {
            try {
                // Validate features
                const requiredFields = [
                    'fire_distance', 'smoke_distance', 'fire_radius', 'smoke_radius', 
                    'smoke_level', 'fire_age', 'floor_index', 'active_fires_count', 
                    'local_fire_density', 'is_inside_affected_region'
                ];
                for (let field of requiredFields) {
                    if (features[field] === undefined) {
                        features[field] = 0.0; // fallback
                    }
                }

                if (!exec || !path || typeof __dirname === 'undefined') {
                    return resolve({ hazardLevel: 'SAFE', confidence: 1.0 }); // fallback
                }

                const fs = require('fs');
                let scriptPath = path.resolve(__dirname, '../../../ai_pipeline/ml/predict.py');
                if (!fs.existsSync(scriptPath)) {
                    scriptPath = path.resolve(__dirname, '../../ml/predict.py');
                }
                
                // Escape double quotes for Windows CMD
                const jsonInput = JSON.stringify(features).replace(/"/g, '\\"');
                
                // Execute python script
                const cmd = `python "${scriptPath}" "${jsonInput}"`;
                
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        return resolve({ error: error.message });
                    }
                    try {
                        const result = JSON.parse(stdout.trim());
                        resolve(result);
                    } catch (e) {
                        resolve({ error: "Invalid JSON from ML: " + stdout.trim() });
                    }
                });
            } catch (e) {
                resolve({ error: e.message });
            }
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { predictHazardWithML };
    }
    if (typeof window !== 'undefined') {
        window.predictHazardWithML = predictHazardWithML;
    }
})();
