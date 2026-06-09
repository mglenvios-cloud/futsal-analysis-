import numpy as np
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
import joblib


@dataclass
class PredictionResult:
    prediction_type: str
    score: float
    future_performance_score: Optional[float] = None
    injury_risk_score: Optional[float] = None
    physical_evolution_score: Optional[float] = None
    potential_score: Optional[float] = None
    predicted_metrics: Dict = field(default_factory=dict)
    confidence_interval: Dict = field(default_factory=dict)
    risk_factors: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    model_version: str = "1.0.0"


class PredictiveAI:
    def __init__(self):
        self.performance_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            random_state=42,
        )
        self.injury_model = GradientBoostingRegressor(
            n_estimators=150,
            max_depth=5,
            random_state=42,
        )
        self.potential_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=8,
            random_state=42,
        )
        self.scaler = StandardScaler()
        self.model_version = "1.0.0"

    def _extract_features(self, player_data: Dict) -> np.ndarray:
        features = []

        feature_mappings = {
            "age": "age",
            "height": "height",
            "weight": "weight",
            "goals": "goals",
            "assists": "assists",
            "matches_played": "matches_played",
            "minutes_played": "minutes_played",
            "distance_covered": "distance_covered",
            "max_speed": "max_speed",
            "avg_speed": "avg_speed",
            "sprint_count": "sprint_count",
            "accelerations": "accelerations",
            "decelerations": "decelerations",
            "direction_changes": "direction_changes",
            "time_moving": "time_moving",
            "intensity_index": "intensity_index",
            "pass_accuracy": "pass_accuracy",
            "shots_on_target": "shots_on_target",
            "tackles": "tackles",
            "interceptions": "interceptions",
            "yellow_cards": "yellow_cards",
            "red_cards": "red_cards",
            "fouls": "fouls",
            "hrv": "hrv",
            "recovery_score": "recovery_score",
            "fatigue_level": "fatigue_level",
            "injury_count": "injury_count",
            "days_injured": "days_injured",
        }

        for feature_key in feature_mappings.values():
            value = player_data.get(feature_key, 0)
            if value is None:
                value = 0
            features.append(float(value))

        return np.array(features).reshape(1, -1)

    def _normalize_features(self, features: np.ndarray) -> np.ndarray:
        if not hasattr(self.scaler, "mean_"):
            self.scaler.fit(features)
        return self.scaler.transform(features)

    def predict_performance(self, player_data: Dict) -> PredictionResult:
        features = self._extract_features(player_data)
        normalized = self._normalize_features(features)

        score = float(self.performance_model.predict(normalized)[0])
        score = max(0, min(100, score))

        return PredictionResult(
            prediction_type="performance",
            score=round(score, 1),
            future_performance_score=round(score, 1),
            predicted_metrics={
                "expected_goals": round(player_data.get("goals", 0) * 1.1, 1),
                "expected_assists": round(player_data.get("assists", 0) * 1.05, 1),
                "expected_distance": round(player_data.get("distance_covered", 0) * 1.02, 1),
                "expected_avg_speed": round(player_data.get("avg_speed", 0) * 1.01, 2),
            },
            confidence_interval={
                "lower": max(0, score - 10),
                "upper": min(100, score + 10),
            },
            recommendations=self._generate_performance_recommendations(score, player_data),
        )

    def predict_injury_risk(self, player_data: Dict) -> PredictionResult:
        features = self._extract_features(player_data)
        normalized = self._normalize_features(features)

        risk_score = float(self.injury_model.predict(normalized)[0])
        risk_score = max(0, min(100, risk_score))
        health_score = 100 - risk_score

        risk_factors = self._identify_risk_factors(player_data)

        return PredictionResult(
            prediction_type="injury_risk",
            score=round(health_score, 1),
            injury_risk_score=round(risk_score, 1),
            risk_factors=risk_factors,
            recommendations=self._generate_injury_recommendations(risk_factors),
            confidence_interval={
                "lower": max(0, risk_score - 8),
                "upper": min(100, risk_score + 8),
            },
        )

    def predict_potential(self, player_data: Dict) -> PredictionResult:
        features = self._extract_features(player_data)
        normalized = self._normalize_features(features)

        potential = float(self.potential_model.predict(normalized)[0])
        potential = max(0, min(100, potential))

        age = player_data.get("age", 25)
        current_performance = player_data.get("rating", 50)

        age_factor = max(0, min(1, (35 - age) / 20))
        growth_potential = (100 - current_performance) * age_factor * 0.5

        evolution_score = min(100, current_performance + growth_potential)

        return PredictionResult(
            prediction_type="potential",
            score=round(potential, 1),
            potential_score=round(potential, 1),
            physical_evolution_score=round(evolution_score, 1),
            predicted_metrics={
                "peak_age": max(22, min(32, age + 2)),
                "estimated_peak_rating": round(evolution_score, 1),
                "growth_potential": round(growth_potential, 1),
                "experience_factor": round(age_factor * 100, 1),
            },
            confidence_interval={
                "lower": max(0, potential - 12),
                "upper": min(100, potential + 12),
            },
            recommendations=self._generate_potential_recommendations(potential, age),
        )

    def full_prediction(self, player_data: Dict) -> Dict[str, PredictionResult]:
        return {
            "performance": self.predict_performance(player_data),
            "injury_risk": self.predict_injury_risk(player_data),
            "potential": self.predict_potential(player_data),
            "overall_score": self._calculate_overall_score(player_data),
        }

    def _calculate_overall_score(self, player_data: Dict) -> float:
        age = player_data.get("age", 25)
        goals = player_data.get("goals", 0)
        assists = player_data.get("assists", 0)
        distance = player_data.get("distance_covered", 0)
        speed = player_data.get("max_speed", 0)
        intensity = player_data.get("intensity_index", 0)
        passes = player_data.get("pass_accuracy", 0)
        tackles = player_data.get("tackles", 0)

        score = (
            min(goals * 5, 30) +
            min(assists * 3, 15) +
            min(distance / 100, 10) +
            min(speed / 2, 10) +
            min(intensity / 10, 10) +
            min(passes / 10, 10) +
            min(tackles * 2, 10) +
            max(0, 5 - abs(age - 25))
        )

        return round(max(0, min(100, score)), 1)

    def _identify_risk_factors(self, player_data: Dict) -> List[str]:
        factors = []

        fatigue = player_data.get("fatigue_level", 0)
        if fatigue and fatigue > 70:
            factors.append("Alto nivel de fatiga")

        hrv = player_data.get("hrv", 0)
        if hrv and hrv < 40:
            factors.append("HRV bajo indicando recuperacion insuficiente")

        intensity = player_data.get("intensity_index", 0)
        if intensity and intensity > 85:
            factors.append("Intensidad sostenida muy alta")

        accelerations = player_data.get("accelerations", 0)
        if accelerations and accelerations > 50:
            factors.append("Alta cantidad de aceleraciones")

        distance = player_data.get("distance_covered", 0)
        if distance and distance > 5000:
            factors.append("Distancia recorrida excesiva")

        recent_injuries = player_data.get("injury_count", 0)
        if recent_injuries and recent_injuries > 2:
            factors.append(f"Historial de {recent_injuries} lesiones recientes")

        return factors

    def _generate_performance_recommendations(self, score: float, data: Dict) -> List[str]:
        recs = []
        if score < 40:
            recs.append("Plan de entrenamiento intensivo recomendado")
        if data.get("pass_accuracy", 0) < 60:
            recs.append("Entrenamiento especifico de precision de pases")
        if data.get("max_speed", 0) < 15:
            recs.append("Trabajo de velocidad y explosividad")
        if data.get("distance_covered", 0) < 2000:
            recs.append("Mejorar capacidad aerobica con intervalos")
        return recs

    def _generate_injury_recommendations(self, risk_factors: List[str]) -> List[str]:
        recs = []
        if any("fatiga" in f.lower() for f in risk_factors):
            recs.append("Reducir carga de entrenamiento 48hs")
        if any("HRV" in f for f in risk_factors):
            recs.append("Implementar protocolo de recuperacion activa")
        if any("intensidad" in f.lower() for f in risk_factors):
            recs.append("Alternar dias de alta y baja intensidad")
        if any("aceleraciones" in f.lower() for f in risk_factors):
            recs.append("Incluir ejercicios de prevencion de lesiones")
        if not recs:
            recs.append("Mantener regimen actual de entrenamiento")
        return recs

    def _generate_potential_recommendations(self, potential: float, age: int) -> List[str]:
        recs = []
        if potential > 80:
            recs.append("Alto potencial - considerar rotacion en primera division")
        elif potential > 60:
            recs.append("Potencial medio-alto - trabajo tecnico especifico")
        else:
            recs.append("Potencial en desarrollo - enfocar en fundamentos")

        if age < 22:
            recs.append("Jugador joven - priorizar desarrollo fisico y tecnico")
        elif age > 30:
            recs.append("Jugador experimentado - mantener condicion fisica")

        return recs

    def save_models(self, path: str = "/app/models/"):
        joblib.dump(self.performance_model, f"{path}performance_model.pkl")
        joblib.dump(self.injury_model, f"{path}injury_model.pkl")
        joblib.dump(self.potential_model, f"{path}potential_model.pkl")
        joblib.dump(self.scaler, f"{path}scaler.pkl")

    def load_models(self, path: str = "/app/models/"):
        self.performance_model = joblib.load(f"{path}performance_model.pkl")
        self.injury_model = joblib.load(f"{path}injury_model.pkl")
        self.potential_model = joblib.load(f"{path}potential_model.pkl")
        self.scaler = joblib.load(f"{path}scaler.pkl")

    def train_models(self, training_data: List[Dict]):
        if len(training_data) < 10:
            return

        X_list = []
        y_performance = []
        y_injury = []
        y_potential = []

        for data in training_data:
            features = self._extract_features(data).flatten()
            X_list.append(features)
            y_performance.append(data.get("rating", 50))
            y_injury.append(data.get("injury_risk", 20))
            y_potential.append(data.get("potential", 50))

        X = np.array(X_list)
        self.scaler.fit(X)
        X_norm = self.scaler.transform(X)

        if len(X) >= 5:
            self.performance_model.fit(X_norm, np.array(y_performance))
            self.injury_model.fit(X_norm, np.array(y_injury))
            self.potential_model.fit(X_norm, np.array(y_potential))
