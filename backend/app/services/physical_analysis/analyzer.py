import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from scipy import signal
from scipy.ndimage import gaussian_filter1d


@dataclass
class PhysicalMetrics:
    distance_covered: float = 0.0
    max_speed: float = 0.0
    avg_speed: float = 0.0
    sprint_count: int = 0
    accelerations: int = 0
    decelerations: int = 0
    direction_changes: int = 0
    time_moving: float = 0.0
    time_stopped: float = 0.0
    intensity_index: float = 0.0
    speed_profile: List[float] = field(default_factory=list)
    acceleration_profile: List[float] = field(default_factory=list)
    heart_rate_zones: Dict[str, float] = field(default_factory=dict)


class PhysicalAnalyzer:
    def __init__(self):
        self.SPRINT_SPEED_THRESHOLD = 18.0
        self.MOVING_SPEED_THRESHOLD = 0.5
        self.ACCELERATION_THRESHOLD = 2.0
        self.DIRECTION_CHANGE_THRESHOLD = 45.0
        self.PIXEL_TO_METER_RATIO = 0.05

    def _calculate_speed(
        self,
        positions: np.ndarray,
        timestamps: np.ndarray,
    ) -> np.ndarray:
        if len(positions) < 2:
            return np.array([0.0])

        distances = np.sqrt(np.sum(np.diff(positions, axis=0) ** 2, axis=1))
        distances_m = distances * self.PIXEL_TO_METER_RATIO
        time_diffs = np.diff(timestamps)
        time_diffs = np.where(time_diffs == 0, 0.001, time_diffs)

        speeds = distances_m / time_diffs
        speeds = gaussian_filter1d(speeds, sigma=2)
        return speeds * 3.6

    def _calculate_acceleration(self, speeds: np.ndarray, timestamps: np.ndarray) -> np.ndarray:
        if len(speeds) < 2:
            return np.array([0.0])

        time_diffs = np.diff(timestamps[: len(speeds)])
        time_diffs = np.where(time_diffs == 0, 0.001, time_diffs)
        accelerations = np.diff(speeds) / time_diffs
        return gaussian_filter1d(accelerations, sigma=2)

    def _calculate_direction_changes(
        self,
        positions: np.ndarray,
        timestamps: np.ndarray,
    ) -> int:
        if len(positions) < 3:
            return 0

        vectors = np.diff(positions, axis=0)
        angles = []

        for i in range(len(vectors) - 1):
            v1 = vectors[i]
            v2 = vectors[i + 1]
            dot = np.dot(v1, v2)
            norm = np.linalg.norm(v1) * np.linalg.norm(v2)
            if norm > 0:
                cos_angle = np.clip(dot / norm, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                angles.append(angle)

        return sum(1 for a in angles if a > self.DIRECTION_CHANGE_THRESHOLD)

    def _calculate_intensity_index(
        self,
        speeds: np.ndarray,
        accelerations: np.ndarray,
        max_speed: float,
    ) -> float:
        if len(speeds) == 0 or max_speed == 0:
            return 0.0

        speed_ratio = np.mean(speeds) / max_speed
        accel_intensity = np.mean(np.abs(accelerations)) / 5.0 if len(accelerations) > 0 else 0
        return min(100.0, (speed_ratio * 50 + accel_intensity * 50))

    def analyze(
        self,
        player_tracks: Dict[int, List[Dict]],
        fps: float = 30.0,
    ) -> Dict[int, PhysicalMetrics]:
        results = {}

        for track_id, track_data in player_tracks.items():
            if len(track_data) < 10:
                continue

            positions = np.array([t["position"] for t in track_data])
            timestamps = np.array([t["timestamp"] for t in track_data])

            speeds = self._calculate_speed(positions, timestamps)
            accelerations = self._calculate_acceleration(speeds, timestamps)
            distance = np.sum(
                np.sqrt(np.sum(np.diff(positions, axis=0) ** 2, axis=1))
            ) * self.PIXEL_TO_METER_RATIO

            max_speed = float(np.max(speeds)) if len(speeds) > 0 else 0.0
            avg_speed = float(np.mean(speeds)) if len(speeds) > 0 else 0.0

            sprint_count = int(np.sum(speeds > self.SPRINT_SPEED_THRESHOLD))
            time_moving = np.sum(speeds > self.MOVING_SPEED_THRESHOLD) / fps
            time_stopped = np.sum(speeds <= self.MOVING_SPEED_THRESHOLD) / fps

            accel_count = int(np.sum(accelerations > self.ACCELERATION_THRESHOLD))
            decel_count = int(np.sum(accelerations < -self.ACCELERATION_THRESHOLD))
            dir_changes = self._calculate_direction_changes(positions, timestamps)
            intensity = self._calculate_intensity_index(speeds, accelerations, max_speed)

            results[track_id] = PhysicalMetrics(
                distance_covered=round(distance, 2),
                max_speed=round(max_speed, 2),
                avg_speed=round(avg_speed, 2),
                sprint_count=sprint_count,
                accelerations=accel_count,
                decelerations=decel_count,
                direction_changes=dir_changes,
                time_moving=round(time_moving, 2),
                time_stopped=round(time_stopped, 2),
                intensity_index=round(intensity, 2),
                speed_profile=speeds.tolist(),
                acceleration_profile=accelerations.tolist(),
            )

        return results
