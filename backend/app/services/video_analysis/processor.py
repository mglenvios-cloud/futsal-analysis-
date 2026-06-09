import numpy as np
from typing import List, Dict, Optional, Callable
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

from app.services.video_analysis.detector import FutsalDetector, FrameResult


@dataclass
class VideoMetadata:
    filename: str
    filepath: str
    width: int
    height: int
    fps: float
    total_frames: int
    duration: float
    codec: str


@dataclass
class ProcessingResult:
    video_metadata: VideoMetadata
    frame_results: List[FrameResult] = field(default_factory=list)
    player_tracks: Dict[int, List[Dict]] = field(default_factory=dict)
    ball_trajectory: List[Dict] = field(default_factory=list)
    processing_time: float = 0.0
    total_frames_processed: int = 0


class VideoProcessor:
    def __init__(self, model_path: str = "yolov8n.pt"):
        self.detector = FutsalDetector(model_path)
        self.executor = ThreadPoolExecutor(max_workers=2)

    def get_metadata(self, video_path: str) -> VideoMetadata:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        metadata = VideoMetadata(
            filename=Path(video_path).name,
            filepath=video_path,
            width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            fps=cap.get(cv2.CAP_PROP_FPS),
            total_frames=int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            duration=cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 0,
            codec=self._get_codec_string(int(cap.get(cv2.CAP_PROP_FOURCC))),
        )
        cap.release()
        return metadata

    def _get_codec_string(self, fourcc: int) -> str:
        return "".join([chr((fourcc >> 8 * i) & 0xFF) for i in range(4)])

    def process_video(
        self,
        video_path: str,
        progress_callback: Optional[Callable[[float], None]] = None,
        frame_skip: int = 1,
    ) -> ProcessingResult:
        metadata = self.get_metadata(video_path)
        cap = cv2.VideoCapture(video_path)

        result = ProcessingResult(video_metadata=metadata)
        player_tracks: Dict[int, List[Dict]] = {}
        ball_trajectory: List[Dict] = []

        total_frames = metadata.total_frames
        frames_to_process = total_frames // frame_skip

        for frame_number in tqdm(range(0, total_frames, frame_skip), desc="Processing video"):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            ret, frame = cap.read()
            if not ret:
                break

            frame_result = self.detector.process_frame(frame, frame_number, metadata.fps)
            result.frame_results.append(frame_result)

            for player in frame_result.players:
                if player.track_id is not None:
                    if player.track_id not in player_tracks:
                        player_tracks[player.track_id] = []
                    player_tracks[player.track_id].append(
                        {
                            "frame": frame_number,
                            "timestamp": frame_number / metadata.fps,
                            "bbox": player.bbox,
                            "position": {
                                "x": (player.bbox[0] + player.bbox[2]) / 2,
                                "y": (player.bbox[1] + player.bbox[3]) / 2,
                            },
                        }
                    )

            if frame_result.ball:
                ball_trajectory.append(
                    {
                        "frame": frame_number,
                        "timestamp": frame_number / metadata.fps,
                        "position": {
                            "x": (frame_result.ball.bbox[0] + frame_result.ball.bbox[2]) / 2,
                            "y": (frame_result.ball.bbox[1] + frame_result.ball.bbox[3]) / 2,
                        },
                    }
                )

            if progress_callback:
                progress = (frame_number / total_frames) * 100
                progress_callback(progress)

        cap.release()

        result.player_tracks = player_tracks
        result.ball_trajectory = ball_trajectory
        result.total_frames_processed = len(result.frame_results)

        return result

    async def process_video_async(
        self,
        video_path: str,
        progress_callback: Optional[Callable[[float], None]] = None,
    ) -> ProcessingResult:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.process_video,
            video_path,
            progress_callback,
        )

    def generate_annotated_video(
        self,
        video_path: str,
        output_path: str,
        processing_result: ProcessingResult,
    ) -> str:
        metadata = self.get_metadata(video_path)
        cap = cv2.VideoCapture(video_path)

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, metadata.fps, (metadata.width, metadata.height))

        frame_idx = 0
        for frame_result in processing_result.frame_results:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_result.frame_number)
            ret, frame = cap.read()
            if not ret:
                break

            annotated = self._annotate_frame(frame, frame_result)
            out.write(annotated)
            frame_idx += 1

        cap.release()
        out.release()
        return output_path

    def _annotate_frame(self, frame: np.ndarray, frame_result: FrameResult) -> np.ndarray:
        for player in frame_result.players:
            x1, y1, x2, y2 = map(int, player.bbox)
            color = (0, 255, 0) if player.class_name == "player" else (255, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            label = f"ID:{player.track_id} {player.confidence:.2f}" if player.track_id else f"{player.confidence:.2f}"
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        if frame_result.ball:
            x1, y1, x2, y2 = map(int, frame_result.ball.bbox)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(frame, "Ball", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        for goal in (frame_result.goals or []):
            x1, y1, x2, y2 = map(int, goal.bbox)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

        if frame_result.field_lines is not None:
            colored_lines = cv2.cvtColor(frame_result.field_lines, cv2.COLOR_GRAY2BGR)
            frame = cv2.addWeighted(frame, 0.8, colored_lines, 0.2, 0)

        return frame
