import os
import random

def generate_dataset(num_samples=2500, output_path="dataset/hazard_data.csv"):
    """
    Generates synthetic training dataset for fire/smoke hazard classification.
    Produces balanced distributions across SAFE, MODERATE, HIGH, and CRITICAL labels.
    """
    if not os.path.isabs(output_path):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(base_dir, output_path)

    try:
        import numpy as np
        import pandas as pd
    except ImportError as e:
        print(f"[GenerateData] Missing required packages: {e}. Install via: pip install numpy pandas")
        return False

    np.random.seed(42)
    random.seed(42)

    data = []

    for _ in range(num_samples):
        # 25% of cases simulate no active fire in building
        has_fire = np.random.rand() > 0.25

        if not has_fire:
            fire_distance = np.random.uniform(80.0, 200.0)
            smoke_distance = np.random.uniform(80.0, 200.0)
            fire_radius = 0.0
            smoke_radius = 0.0
            smoke_level = 0.0
            fire_age = 0.0
            floor_index = int(np.random.randint(0, 8))
            active_fires_count = 0
            local_fire_density = 0.0
            is_inside_affected_region = 0
            label = "SAFE"
        else:
            fire_distance = max(0.5, float(np.random.exponential(scale=25.0)))
            fire_radius = float(np.random.uniform(3.0, 45.0))
            smoke_radius = fire_radius * float(np.random.uniform(1.3, 1.8))

            # Smoke spreads outward from fire
            smoke_offset = float(np.random.uniform(3.0, 15.0))
            smoke_distance = max(0.0, fire_distance - smoke_offset)

            # Smoke level decreases with distance from hazard
            smoke_level = max(0.0, min(1.0, 1.0 - (smoke_distance / (smoke_radius + 0.1))))
            fire_age = float(np.random.uniform(10.0, 900.0))
            floor_index = int(np.random.randint(0, 8))
            active_fires_count = int(np.random.randint(1, 5))
            local_fire_density = float(np.random.uniform(0.1, 3.5))

            is_inside_affected_region = 1 if (fire_distance <= fire_radius or smoke_distance <= smoke_radius) else 0

            # Deterministic, multi-factor label classification
            if fire_distance <= fire_radius or (is_inside_affected_region and fire_distance <= 4.0):
                label = "CRITICAL"
            elif smoke_distance <= smoke_radius or smoke_level >= 0.70:
                label = "HIGH"
            elif smoke_distance <= smoke_radius + 18.0 or smoke_level >= 0.35:
                label = "MODERATE"
            else:
                label = "SAFE"

        data.append({
            "fire_distance": round(fire_distance, 2),
            "smoke_distance": round(smoke_distance, 2),
            "fire_radius": round(fire_radius, 2),
            "smoke_radius": round(smoke_radius, 2),
            "smoke_level": round(smoke_level, 4),
            "fire_age": round(fire_age, 1),
            "floor_index": floor_index,
            "active_fires_count": active_fires_count,
            "local_fire_density": round(local_fire_density, 2),
            "is_inside_affected_region": is_inside_affected_region,
            "hazard_label": label
        })

    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)

    print(f"[GenerateData] Successfully generated {len(df)} samples saved to:\n  {output_path}")
    print("\nClass distribution:")
    print(df["hazard_label"].value_counts())
    return True

if __name__ == "__main__":
    generate_dataset()
