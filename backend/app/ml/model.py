import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from app.core.config import get_settings

settings = get_settings()

FEATURES = [
    "age",
    "income",
    "employment_years",
    "debt_to_income",
    "credit_history_months",
    "delinquencies",
    "loan_amount",
    "loan_term_months",
    "interest_rate",
]


@dataclass
class ModelBundle:
    model: LogisticRegression
    scaler: StandardScaler
    feature_names: List[str]


_bundle: ModelBundle | None = None


def _generate_dataset(path: Path) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    size = 2000
    data = {
        "age": rng.integers(21, 70, size=size),
        "income": rng.normal(75000, 20000, size=size).clip(15000, 200000),
        "employment_years": rng.integers(0, 30, size=size),
        "debt_to_income": rng.uniform(0.1, 0.9, size=size),
        "credit_history_months": rng.integers(6, 240, size=size),
        "delinquencies": rng.integers(0, 5, size=size),
        "loan_amount": rng.normal(25000, 10000, size=size).clip(2000, 80000),
        "loan_term_months": rng.integers(12, 84, size=size),
        "interest_rate": rng.uniform(4.0, 22.0, size=size),
    }
    frame = pd.DataFrame(data)
    score = (
        0.03 * frame["debt_to_income"]
        + 0.02 * frame["delinquencies"]
        + 0.015 * (frame["loan_amount"] / 10000)
        - 0.02 * (frame["income"] / 10000)
        - 0.01 * frame["employment_years"]
        - 0.005 * (frame["credit_history_months"] / 12)
    )
    probability = 1 / (1 + np.exp(-score))
    frame["default"] = rng.binomial(1, probability.clip(0.05, 0.8))
    frame.to_csv(path, index=False)
    return frame


def _train_model(frame: pd.DataFrame) -> ModelBundle:
    x = frame[FEATURES].values
    y = frame["default"].values
    x_train, _, y_train, _ = train_test_split(x, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    x_train_scaled = scaler.fit_transform(x_train)
    model = LogisticRegression(max_iter=500)
    model.fit(x_train_scaled, y_train)
    return ModelBundle(model=model, scaler=scaler, feature_names=FEATURES)


def load_or_train_model() -> ModelBundle:
    global _bundle
    if _bundle is not None:
        return _bundle

    model_path = Path(settings.model_path)
    dataset_path = Path(settings.dataset_path)
    model_path.parent.mkdir(parents=True, exist_ok=True)

    if not dataset_path.exists():
        frame = _generate_dataset(dataset_path)
    else:
        frame = pd.read_csv(dataset_path)

    if model_path.exists():
        _bundle = joblib.load(model_path)
    else:
        _bundle = _train_model(frame)
        joblib.dump(_bundle, model_path)
    return _bundle


def retrain_model() -> ModelBundle:
    global _bundle
    dataset_path = Path(settings.dataset_path)
    frame = _generate_dataset(dataset_path)
    _bundle = _train_model(frame)
    joblib.dump(_bundle, Path(settings.model_path))
    return _bundle


def score_application(features: Dict[str, float]) -> Dict[str, object]:
    bundle = load_or_train_model()
    values = np.array([[features[name] for name in bundle.feature_names]])
    scaled = bundle.scaler.transform(values)
    pd_score = float(bundle.model.predict_proba(scaled)[0][1])
    coefficients = bundle.model.coef_[0]
    top_idx = np.argsort(np.abs(coefficients))[::-1][:3]
    top_factors = [bundle.feature_names[i] for i in top_idx]
    return {
        "pd": pd_score,
        "top_factors": top_factors,
        "coefficients": {
            name: float(coeff) for name, coeff in zip(bundle.feature_names, coefficients)
        },
    }


def export_model_metadata() -> str:
    bundle = load_or_train_model()
    meta = {"features": bundle.feature_names}
    return json.dumps(meta)
