import os
import sys

def train_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "dataset", "hazard_data.csv")

    if not os.path.exists(data_path):
        print(f"[TrainModel] Dataset not found at {data_path}. Auto-generating synthetic training data...")
        try:
            from generate_data import generate_dataset
            generate_dataset(num_samples=2500, output_path=data_path)
        except Exception as ex:
            print(f"[TrainModel] Error auto-generating dataset: {ex}")
            return False

    try:
        import pandas as pd
        import joblib
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
    except ImportError as ie:
        print(f"[TrainModel] Missing required ML libraries: {ie}")
        print("Please install requirements: pip install pandas scikit-learn joblib numpy")
        return False

    print(f"[TrainModel] Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)

    features = [
        "fire_distance",
        "smoke_distance",
        "fire_radius",
        "smoke_radius",
        "smoke_level",
        "fire_age",
        "floor_index",
        "active_fires_count",
        "local_fire_density",
        "is_inside_affected_region"
    ]

    # Verify all feature columns exist
    missing_cols = [c for c in features if c not in df.columns]
    if missing_cols:
        print(f"[TrainModel] Error: Missing feature columns in CSV: {missing_cols}")
        return False

    X = df[features].fillna(0.0)
    y = df["hazard_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("[TrainModel] Training RandomForestClassifier (n_jobs=-1, n_estimators=100)...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    print("[TrainModel] Evaluating model performance...")
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[TrainModel] Model Accuracy: {acc * 100:.2f}%")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Persist model and features to both 'model/' and 'models/' directories for full compatibility
    target_dirs = [
        os.path.join(base_dir, "model"),
        os.path.join(base_dir, "models"),
        os.path.join(base_dir, "features")
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

    primary_model_path = os.path.join(base_dir, "model", "hazard_rf_model.pkl")
    secondary_model_path = os.path.join(base_dir, "models", "hazard_rf_model.pkl")
    primary_feat_path = os.path.join(base_dir, "model", "features.pkl")
    secondary_feat_path = os.path.join(base_dir, "features", "features.pkl")

    joblib.dump(clf, primary_model_path)
    joblib.dump(clf, secondary_model_path)
    joblib.dump(features, primary_feat_path)
    joblib.dump(features, secondary_feat_path)

    print(f"\n[TrainModel] Model saved successfully to:")
    print(f"  - {primary_model_path}")
    print(f"  - {secondary_model_path}")
    return True

if __name__ == "__main__":
    train_model()
