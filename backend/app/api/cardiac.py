from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional

from app.services.cardiac_monitor.monitor import BLEHeartRateMonitor, HeartRateData

router = APIRouter()
hr_monitor = BLEHeartRateMonitor()


@router.get("/devices")
async def scan_devices():
    devices = await hr_monitor.scan_devices(timeout=10)
    return {
        "devices": [
            {
                "name": d.name,
                "address": d.address,
                "device_type": d.device_type,
                "is_connected": d.is_connected,
            }
            for d in devices
        ],
        "count": len(devices),
    }


@router.post("/connect")
async def connect_device(address: str, name: Optional[str] = None):
    from app.services.cardiac_monitor.monitor import DeviceInfo

    device = DeviceInfo(
        name=name or "Unknown",
        address=address,
        device_type="ble_hr",
    )
    success = await hr_monitor.connect(device)
    return {"connected": success, "device": device.name}


@router.post("/disconnect")
async def disconnect_device():
    await hr_monitor.disconnect()
    return {"disconnected": True}


@router.post("/start")
async def start_monitoring():
    await hr_monitor.start_monitoring()
    return {"monitoring": True}


@router.post("/stop")
async def stop_monitoring():
    await hr_monitor.stop_monitoring()
    return {"monitoring": False}


@router.get("/current")
async def get_current_data():
    data = hr_monitor.current_data
    return {
        "heart_rate": data.heart_rate,
        "heart_rate_max": data.heart_rate_max,
        "heart_rate_avg": data.heart_rate_avg,
        "heart_rate_min": data.heart_rate_min if data.heart_rate_min != float("inf") else 0,
        "hrv": data.hrv,
        "zone": data.zone,
        "timestamp": str(data.timestamp),
    }


@router.get("/history")
async def get_history():
    return {
        "readings": len(hr_monitor.history),
        "data": [
            {
                "heart_rate": d.heart_rate,
                "hrv": d.hrv,
                "zone": d.zone,
                "timestamp": str(d.timestamp),
            }
            for d in hr_monitor.history[-300:]
        ],
    }


@router.websocket("/ws")
async def cardiac_websocket(websocket: WebSocket):
    await websocket.accept()

    async def send_data(data: HeartRateData):
        await websocket.send_json(
            {
                "heart_rate": data.heart_rate,
                "heart_rate_max": data.heart_rate_max,
                "heart_rate_avg": data.heart_rate_avg,
                "hrv": data.hrv,
                "zone": data.zone,
                "timestamp": str(data.timestamp),
            }
        )

    hr_monitor.on_data_callback = send_data
    await hr_monitor.start_monitoring()

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await hr_monitor.stop_monitoring()
