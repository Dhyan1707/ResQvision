# M7 Machine Learning Hazard Prediction

This module provides a standalone, scikit-learn based machine learning model to predict hazard levels in the fire evacuation simulator.

## Features Used
- `fire_distance`: Euclidean distance to nearest fire
- `smoke_distance`: Euclidean distance to nearest smoke front
- `fire_radius`: Scale/intensity of nearest fire
- `smoke_radius`: Scale/intensity of nearest smoke
- `smoke_level`: Numeric smoke opacity/thickness
- `fire_age`: Time elapsed since fire started
- `floor_index`: Floor number
- `active_fires_count`: Number of active fires globally or on floor
- `local_fire_density`: Density of nearby fires
- `is_inside_affected_region`: Boolean integer if inside smoke/fire radius

## Target Classes
The model predicts one of four hazard levels:
- `SAFE`
- `MODERATE`
- `HIGH`
- `CRITICAL`

## Workflow
1. **Dataset Generation:** `python generate_data.py` synthetically creates `dataset/hazard_data.csv` using simulator-like deterministic rules.
2. **Training:** `python train_model.py` loads the data, trains a `RandomForestClassifier`, evaluates it, and saves the artifacts to `model/`.
3. **Prediction:** `python predict.py` loads the serialized `.pkl` model and runs sample scenarios.

## Future Integration (M8)
M8 will bridge this Python environment with the Electron application using `child_process` or local sockets, allowing real-time M6 hazard features to query the M7 Python ML model continuously.
