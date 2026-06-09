import cv2
import numpy as np
from ultralytics import YOLO
import mediapipe as mp
from typing import List, Dict, Optional, Tuple
import supervision as sv
from dataclasses import dataclass


@dataclass
class Detection:
    bbox: List[float]
    confidence: float
    class_id: int
    class_name: str
    track_id: Optional[int] = None


@dataclass
class FrameResult:
    frame_number: int
    timestamp: float
    players: List[Detection]
    ball: Optional[Detection] = None
    goals: List[Detection] = None
    field_lines: Optional[np.ndarray] = None


class FutsalDetector:
    def __init__(self, model_path: str = "yolov8n.pt"):
        self.player_model = YOLO(model_path)
        self.ball_model = YOLO(model_path)
        self.field_model = YOLO(model_path)
        self.pose_estimator = mp.solutions.pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        self.tracker = sv.ByteTrack()
        self.tracker.reset()

        self.class_names = {
            0: "player",
            1: "ball",
            2: "goal",
            3: "goalkeeper",
            4: "referee",
        }

    def detect_players(self, frame: np.ndarray) -> List[Detection]:
        results = self.player_model(frame, conf=0.5, iou=0.5)[0]
        detections = []

        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            cls_id = int(box.cls[0].item())

            detection = Detection(
                bbox=[x1, y1, x2, y2],
                confidence=conf,
                class_id=cls_id,
                class_name=self.class_names.get(cls_id, "unknown"),
            )
            detections.append(detection)

        return detections

    def detect_ball(self, frame: np.ndarray) -> Optional[Detection]:
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lower_white = np.array([0, 0, 200])
        upper_white = np.array([180, 30, 255])
        mask = cv2.inRange(hsv, lower_white, upper_white)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 50 < area < 500:
                x, y, w, h = cv2.boundingRect(cnt)
                aspect_ratio = w / h
                if 0.8 < aspect_ratio < 1.2:
                    return Detection(
                        bbox=[float(x), float(y), float(x + w), float(y + h)],
                        confidence=0.9,
                        class_id=1,
                        class_name="ball",
                    )
        return None

    def detect_goals(self, frame: np.ndarray) -> List[Detection]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)

        goals = []
        h, w = frame.shape[:2]

        if lines is not None:
            vertical_lines = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
                if angle > 75 and angle < 105:
                    vertical_lines.append(line[0])

            if vertical_lines:
                sorted_lines = sorted(vertical_lines, key=lambda l: l[0])
                if len(sorted_lines) >= 2:
                    left_goal = sorted_lines[0]
                    right_goal = sorted_lines[-1]
                    goals.append(
                        Detection(
                            bbox=[float(left_goal[0]), 0, float(left_goal[0] + 20), float(h)],
                            confidence=0.85,
                            class_id=2,
                            class_name="goal",
                        )
                    )
                    goals.append(
                        Detection(
                            bbox=[float(right_goal[0]), 0, float(right_goal[0] + 20), float(h)],
                            confidence=0.85,
                            class_id=2,
                            class_name="goal",
                        )
                    )
        return goals

    def detect_field_lines(self, frame: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 30, 100)
        return edges

    def track_players(self, detections: List[Detection], frame: np.ndarray) -> List[Detection]:
        if not detections:
            return detections

        xyxy = np.array([d.bbox for d in detections])
        confidence = np.array([d.confidence for d in detections])
        class_id = np.array([d.class_id for d in detections])

        detections_sv = sv.Detections(
            xyxy=xyxy,
            confidence=confidence,
            class_id=class_id,
        )

        tracked = self.tracker.update_with_detections(detections_sv)

        tracked_detections = []
        for i, track_id in enumerate(tracked.tracker_id):
            det = detections[i]
            det.track_id = int(track_id)
            tracked_detections.append(det)

        return tracked_detections

    def estimate_pose(self, frame: np.ndarray) -> Optional[Dict]:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose_estimator.process(rgb_frame)
        if results.pose_landmarks:
            landmarks = {}
            for idx, lm in enumerate(results.pose_landmarks.landmark):
                landmarks[idx] = {"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility}
            return landmarks
        return None

    def process_frame(self, frame: np.ndarray, frame_number: int, fps: float) -> FrameResult:
        players = self.detect_players(frame)
        ball = self.detect_ball(frame)
        goals = self.detect_goals(frame)
        field_lines = self.detect_field_lines(frame)

        if players:
            players = self.track_players(players, frame)

        return FrameResult(
            frame_number=frame_number,
            timestamp=frame_number / fps,
            players=players,
            ball=ball,
            goals=goals,
            field_lines=field_lines,
        )
