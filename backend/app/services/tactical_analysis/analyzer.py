import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict
from sklearn.cluster import DBSCAN


@dataclass
class TacticalMetrics:
    formation: Optional[str] = None
    tactical_system: Optional[str] = None
    high_press_intensity: float = 0.0
    mid_press_intensity: float = 0.0
    low_press_intensity: float = 0.0
    coverage_efficiency: float = 0.0
    rotation_quality: float = 0.0
    transition_offensive_speed: float = 0.0
    transition_defensive_speed: float = 0.0
    numerical_superiority_attacks: int = 0
    numerical_inferiority_defenses: int = 0
    heatmap: np.ndarray = field(default_factory=lambda: np.zeros((100, 100)))
    formation_positions: List[Dict] = field(default_factory=list)


class TacticalAnalyzer:
    def __init__(self, field_width: int = 40, field_height: int = 20):
        self.field_width = field_width
        self.field_height = field_height

    def _detect_formation(self, positions: np.ndarray) -> str:
        if len(positions) < 4:
            return "unknown"

        clustering = DBSCAN(eps=3, min_samples=2).fit(positions)
        labels = clustering.labels_

        zones = np.zeros(4)
        for pos in positions:
            x, y = pos
            if x < self.field_width * 0.25:
                zones[0] += 1
            elif x < self.field_width * 0.5:
                zones[1] += 1
            elif x < self.field_width * 0.75:
                zones[2] += 1
            else:
                zones[3] += 1

        total = len(positions)
        if total == 0:
            return "unknown"

        zone_ratios = zones / total if total > 0 else zones

        formations = {
            "2-2-1": (0.15, 0.35, 0.35, 0.15),
            "2-1-2": (0.15, 0.35, 0.15, 0.35),
            "3-1-1": (0.20, 0.40, 0.25, 0.15),
            "1-2-2": (0.10, 0.25, 0.35, 0.30),
            "4-0-1": (0.25, 0.40, 0.25, 0.10),
            "1-3-1": (0.10, 0.35, 0.35, 0.20),
        }

        best_match = "unknown"
        best_distance = float("inf")

        for formation, ratios in formations.items():
            dist = np.sqrt(np.sum((np.array(zone_ratios) - np.array(ratios)) ** 2))
            if dist < best_distance:
                best_distance = dist
                best_match = formation

        return best_match

    def _detect_tactical_system(self, formation: str, ball_positions: np.ndarray) -> str:
        systems = {
            "2-2-1": "Rombo",
            "2-1-2": "Cuadrado",
            "3-1-1": "Ensenada",
            "1-2-2": "Diamante",
            "4-0-1": "Cajon",
            "1-3-1": "Triangulo",
        }
        return systems.get(formation, "Sistema adaptable")

    def _calculate_pressing(
        self,
        player_positions: np.ndarray,
        ball_positions: np.ndarray,
    ) -> Tuple[float, float, float]:
        high_press = 0
        mid_press = 0
        low_press = 0

        for ball_pos in ball_positions[-100:]:
            bx, by = ball_pos
            distances = np.sqrt(np.sum((player_positions[-10:] - [bx, by]) ** 2, axis=1))
            avg_distance = np.mean(distances) if len(distances) > 0 else float("inf")

            if avg_distance < 3:
                high_press += 1
            elif avg_distance < 7:
                mid_press += 1
            else:
                low_press += 1

        total = high_press + mid_press + low_press
        return (
            (high_press / total * 100) if total > 0 else 0,
            (mid_press / total * 100) if total > 0 else 0,
            (low_press / total * 100) if total > 0 else 0,
        )

    def _calculate_coverage(self, positions: np.ndarray) -> float:
        if len(positions) < 2:
            return 0.0

        hull_points = positions[
            np.unique(
                positions.view([("", positions.dtype)] * positions.shape[1]).ravel()
            ).astype(int)
        ]

        if len(hull_points) < 3:
            return positions.std(axis=0).mean() / (self.field_width / 2) * 100

        x_range = positions[:, 0].max() - positions[:, 0].min()
        y_range = positions[:, 1].max() - positions[:, 1].min()

        coverage = (x_range * y_range) / (self.field_width * self.field_height)
        return min(100, coverage * 100)

    def _calculate_rotations(self, positions: np.ndarray, window: int = 30) -> float:
        if len(positions) < window:
            return 0.0

        rotations = 0
        for i in range(window, len(positions)):
            prev_cluster = np.mean(positions[i - window : i], axis=0)
            curr_cluster = np.mean(positions[i - window + 1 : i + 1], axis=0)
            shift = np.linalg.norm(curr_cluster - prev_cluster)
            if shift > 1.0:
                rotations += 1

        return (rotations / (len(positions) - window)) * 100

    def _calculate_transitions(
        self,
        player_positions: np.ndarray,
        ball_positions: np.ndarray,
    ) -> Tuple[float, float]:
        offensive_speeds = []
        defensive_speeds = []

        for i in range(1, min(len(player_positions), len(ball_positions))):
            player_delta = np.linalg.norm(player_positions[i] - player_positions[i - 1])
            ball_delta = np.linalg.norm(ball_positions[i] - ball_positions[i - 1])

            direction = np.sign(ball_positions[i, 0] - ball_positions[i - 1, 0]) if ball_delta > 0 else 0

            if direction > 0:
                offensive_speeds.append(player_delta)
            elif direction < 0:
                defensive_speeds.append(player_delta)

        off_speed = np.mean(offensive_speeds) if offensive_speeds else 0
        def_speed = np.mean(defensive_speeds) if defensive_speeds else 0

        return off_speed, def_speed

    def _calculate_numerical_advantage(
        self,
        positions_by_team: Dict[str, np.ndarray],
        ball_position: np.ndarray,
    ) -> Tuple[int, int]:
        superiority = 0
        inferiority = 0

        for bp in [ball_position]:
            team_a_near = 0
            team_b_near = 0

            for pos in positions_by_team.get("team_a", []):
                if np.linalg.norm(pos - bp) < 5:
                    team_a_near += 1

            for pos in positions_by_team.get("team_b", []):
                if np.linalg.norm(pos - bp) < 5:
                    team_b_near += 1

            if team_a_near > team_b_near:
                superiority += 1
            elif team_b_near > team_a_near:
                inferiority += 1

        return superiority, inferiority

    def analyze(
        self,
        player_tracks: Dict[int, List[Dict]],
        ball_trajectory: List[Dict],
        field_width: int = 40,
        field_height: int = 20,
    ) -> TacticalMetrics:
        self.field_width = field_width
        self.field_height = field_height

        all_positions = []
        for track_data in player_tracks.values():
            for td in track_data:
                all_positions.append([td["position"]["x"], td["position"]["y"]])

        if not all_positions:
            return TacticalMetrics()

        positions = np.array(all_positions)

        ball_positions = np.array([[b["position"]["x"], b["position"]["y"]] for b in ball_trajectory]) if ball_trajectory else np.zeros((1, 2))

        formation = self._detect_formation(positions)
        tactical_system = self._detect_tactical_system(formation, ball_positions)
        high_press, mid_press, low_press = self._calculate_pressing(positions, ball_positions)
        coverage = self._calculate_coverage(positions)
        rotation_quality = self._calculate_rotations(positions)
        off_speed, def_speed = self._calculate_transitions(positions, ball_positions)

        positions_by_team = {"team_a": positions[: len(positions) // 2], "team_b": positions[len(positions) // 2 :]}
        superiority, inferiority = self._calculate_numerical_advantage(
            positions_by_team, ball_positions[-1] if len(ball_positions) > 0 else np.array([0, 0])
        )

        heatmap, _, _ = np.histogram2d(
            positions[:, 0],
            positions[:, 1],
            bins=(100, 100),
            range=[[0, field_width], [0, field_height]],
        )

        return TacticalMetrics(
            formation=formation,
            tactical_system=tactical_system,
            high_press_intensity=round(high_press, 2),
            mid_press_intensity=round(mid_press, 2),
            low_press_intensity=round(low_press, 2),
            coverage_efficiency=round(coverage, 2),
            rotation_quality=round(rotation_quality, 2),
            transition_offensive_speed=round(off_speed, 2),
            transition_defensive_speed=round(def_speed, 2),
            numerical_superiority_attacks=superiority,
            numerical_inferiority_defenses=inferiority,
            heatmap=heatmap,
            formation_positions=[{"x": float(p[0]), "y": float(p[1])} for p in positions[:5]],
        )
