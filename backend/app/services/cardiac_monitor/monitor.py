import asyncio
from typing import Optional, Dict, List, Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone
import struct


@dataclass
class HeartRateData:
    heart_rate: float = 0.0
    heart_rate_max: float = 0.0
    heart_rate_min: float = float("inf")
    heart_rate_avg: float = 0.0
    hrv: Optional[float] = None
    rr_intervals: List[float] = field(default_factory=list)
    zone: int = 1
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class DeviceInfo:
    name: str
    address: str
    device_type: str
    is_connected: bool = False


class HeartRateZones:
    ZONE_1 = (0, 120)
    ZONE_2 = (120, 140)
    ZONE_3 = (140, 160)
    ZONE_4 = (160, 180)
    ZONE_5 = (180, 220)

    @classmethod
    def get_zone(cls, hr: float) -> int:
        if hr < cls.ZONE_2[0]:
            return 1
        elif hr < cls.ZONE_3[0]:
            return 2
        elif hr < cls.ZONE_4[0]:
            return 3
        elif hr < cls.ZONE_5[0]:
            return 4
        else:
            return 5


class BLEHeartRateMonitor:
    HEART_RATE_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb"
    HEART_RATE_CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
    BODY_SENSOR_LOCATION_UUID = "00002a38-0000-1000-8000-00805f9b34fb"

    def __init__(self):
        self.device: Optional[DeviceInfo] = None
        self.client = None
        self.is_monitoring = False
        self.current_data = HeartRateData()
        self.history: List[HeartRateData] = []
        self.on_data_callback: Optional[Callable[[HeartRateData], None]] = None

    async def scan_devices(self, timeout: int = 10) -> List[DeviceInfo]:
        try:
            from bleak import BleakScanner

            devices = await BleakScanner.discover(timeout=timeout)
            hr_devices = []

            for d in devices:
                if any(svc.lower() == self.HEART_RATE_SERVICE_UUID.lower() for svc in (d.metadata.get("uuids") or [])):
                    hr_devices.append(
                        DeviceInfo(
                            name=d.name or "Unknown",
                            address=d.address,
                            device_type="ble_hr",
                        )
                    )
            return hr_devices
        except ImportError:
            return self._simulate_devices()

    def _simulate_devices(self) -> List[DeviceInfo]:
        return [
            DeviceInfo(name="Polar H10 Sim", address="00:1A:2B:3C:4D:01", device_type="polar"),
            DeviceInfo(name="Garmin HRM-Pro Sim", address="00:1A:2B:3C:4D:02", device_type="garmin"),
            DeviceInfo(name="Apple Watch Sim", address="00:1A:2B:3C:4D:03", device_type="apple_watch"),
        ]

    async def connect(self, device: DeviceInfo) -> bool:
        try:
            from bleak import BleakClient

            self.client = BleakClient(device.address)
            await self.client.connect()
            self.device = device
            self.device.is_connected = True
            return True
        except ImportError:
            self.device = device
            self.device.is_connected = True
            return True

    async def disconnect(self):
        if self.client and self.client.is_connected:
            await self.client.disconnect()
        self.device = None
        self.is_monitoring = False

    def _parse_heart_rate_data(self, data: bytearray) -> HeartRateData:
        hr_data = HeartRateData()
        flags = data[0]
        hr_format = (flags & 1) == 0

        if hr_format:
            hr_data.heart_rate = float(data[1])
            offset = 2
        else:
            hr_data.heart_rate = float(struct.unpack("<H", data[1:3])[0])
            offset = 3

        if flags & 0x10:
            for i in range(offset, len(data) - 1, 2):
                rr_interval = struct.unpack("<H", data[i : i + 2])[0] / 1024.0
                hr_data.rr_intervals.append(rr_interval)

            if hr_data.rr_intervals:
                hr_data.hrv = float(np.std(hr_data.rr_intervals) * 1000)

        hr_data.zone = HeartRateZones.get_zone(hr_data.heart_rate)
        hr_data.timestamp = datetime.now(timezone.utc)

        return hr_data

    def _notification_handler(self, sender: int, data: bytearray):
        hr_data = self._parse_heart_rate_data(data)

        self.current_data = hr_data
        self.current_data.heart_rate_max = max(self.current_data.heart_rate_max, hr_data.heart_rate)
        self.current_data.heart_rate_min = min(self.current_data.heart_rate_min, hr_data.heart_rate)

        total_hr = sum(d.heart_rate for d in self.history) + hr_data.heart_rate
        total_count = len(self.history) + 1
        self.current_data.heart_rate_avg = total_hr / total_count

        self.history.append(hr_data)
        if len(self.history) > 3600:
            self.history.pop(0)

        if self.on_data_callback:
            self.on_data_callback(self.current_data)

    async def start_monitoring(self, callback: Optional[Callable[[HeartRateData], None]] = None):
        if callback:
            self.on_data_callback = callback

        if self.client and self.client.is_connected:
            await self.client.start_notify(
                self.HEART_RATE_CHAR_UUID,
                self._notification_handler,
            )
        else:
            asyncio.create_task(self._simulate_monitoring(callback))

        self.is_monitoring = True

    async def _simulate_monitoring(self, callback: Optional[Callable[[HeartRateData], None]] = None):
        import random

        base_hr = 75
        while self.is_monitoring:
            hr = base_hr + random.uniform(-5, 5)
            if random.random() < 0.1:
                hr += random.uniform(30, 60)

            data = HeartRateData(
                heart_rate=round(hr, 1),
                hrv=round(random.uniform(40, 100), 1),
                zone=HeartRateZones.get_zone(hr),
                timestamp=datetime.now(timezone.utc),
            )

            self.current_data = data
            self.current_data.heart_rate_max = max(self.current_data.heart_rate_max, hr)
            self.current_data.heart_rate_min = min(self.current_data.heart_rate_min, hr)

            total_hr = sum(d.heart_rate for d in self.history) + hr
            total_count = len(self.history) + 1
            self.current_data.heart_rate_avg = total_hr / total_count

            self.history.append(data)
            if callback:
                callback(self.current_data)

            await asyncio.sleep(1)

    async def stop_monitoring(self):
        self.is_monitoring = False
        if self.client and self.client.is_connected:
            try:
                await self.client.stop_notify(self.HEART_RATE_CHAR_UUID)
            except Exception:
                pass
