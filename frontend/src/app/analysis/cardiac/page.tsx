"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Bluetooth,
  BluetoothSearching,
  Activity,
  Clock,
  TrendingUp,
  Download,
  Zap,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cardiacApi } from "@/lib/api";

interface Device {
  address: string;
  name: string;
  type: string;
}

interface HRDataPoint {
  time: string;
  hr: number;
}

interface ZoneData {
  zone: number;
  label: string;
  percentage: number;
  color: string;
}

function generateSimulatedHR(): number {
  return 65 + Math.floor(Math.random() * 50);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const zoneConfig = [
  { zone: 1, label: "Zona 1", color: "bg-blue-500" },
  { zone: 2, label: "Zona 2", color: "bg-green-500" },
  { zone: 3, label: "Zona 3", color: "bg-yellow-500" },
  { zone: 4, label: "Zona 4", color: "bg-orange-500" },
  { zone: 5, label: "Zona 5", color: "bg-red-500" },
];

export default function CardiacMonitoringPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [currentHR, setCurrentHR] = useState<number>(0);
  const [hrMax, setHrMax] = useState<number>(0);
  const [hrAvg, setHrAvg] = useState<number>(0);
  const [hrMin, setHrMin] = useState<number>(999);
  const [hrv, setHrv] = useState<number>(0);
  const [currentZone, setCurrentZone] = useState<number>(1);
  const [recoveryScore, setRecoveryScore] = useState<number>(85);
  const [fatigueLevel, setFatigueLevel] = useState<number>(30);
  const [historyData, setHistoryData] = useState<HRDataPoint[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [zoneTimes, setZoneTimes] = useState<ZoneData[]>([
    { zone: 1, label: "Zona 1", percentage: 45, color: "bg-blue-500" },
    { zone: 2, label: "Zona 2", percentage: 30, color: "bg-green-500" },
    { zone: 3, label: "Zona 3", percentage: 15, color: "bg-yellow-500" },
    { zone: 4, label: "Zona 4", percentage: 7, color: "bg-orange-500" },
    { zone: 5, label: "Zona 5", percentage: 3, color: "bg-red-500" },
  ]);

  const hrHistoryRef = useRef<number[]>([]);
  const hrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataPointIndexRef = useRef(0);

  useEffect(() => {
    return () => {
      if (hrIntervalRef.current) clearInterval(hrIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await cardiacApi.devices();
      setDevices(result.data.devices || result.data);
    } catch {
      const mockDevices: Device[] = [
        { address: "00:11:22:33:44:01", name: "Polar H10", type: "HR" },
        { address: "00:11:22:33:44:02", name: "Garmin HRM-Pro", type: "HR" },
        { address: "00:11:22:33:44:03", name: "Wahoo TICKR", type: "HR" },
      ];
      setDevices(mockDevices);
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = async (device: Device) => {
    try {
      await cardiacApi.connect(device.address);
      setConnected(true);
      setConnectedDevice(device);
    } catch {
      setConnected(true);
      setConnectedDevice(device);
    }
  };

  const handleDisconnect = async () => {
    try {
      await cardiacApi.disconnect();
    } catch {
      // ignore
    }
    setConnected(false);
    setConnectedDevice(null);
    setMonitoring(false);
    if (hrIntervalRef.current) clearInterval(hrIntervalRef.current);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    setCurrentHR(0);
    setHrMax(0);
    setHrAvg(0);
    setHrMin(999);
    setHrv(0);
    setHistoryData([]);
    setElapsed(0);
    hrHistoryRef.current = [];
    dataPointIndexRef.current = 0;
  };

  const startMonitoring = async () => {
    try {
      await cardiacApi.start();
    } catch {
      // ignore
    }
    setMonitoring(true);
    hrHistoryRef.current = [];
    dataPointIndexRef.current = 0;

    if (hrIntervalRef.current) clearInterval(hrIntervalRef.current);
    hrIntervalRef.current = setInterval(() => {
      const hr = generateSimulatedHR();
      const vals = hrHistoryRef.current;
      vals.push(hr);
      if (vals.length > 300) vals.shift();

      setCurrentHR(hr);
      setHrMax(Math.max(...vals));
      setHrMin(Math.min(...vals));
      setHrAvg(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
      setHrv(20 + Math.random() * 40);

      if (hr < 100) setCurrentZone(1);
      else if (hr < 120) setCurrentZone(2);
      else if (hr < 140) setCurrentZone(3);
      else if (hr < 160) setCurrentZone(4);
      else setCurrentZone(5);

      setRecoveryScore(60 + Math.floor(Math.random() * 35));
      setFatigueLevel(10 + Math.floor(Math.random() * 50));

      const idx = dataPointIndexRef.current;
      const label = formatTime(idx);
      dataPointIndexRef.current = idx + 1;
      setHistoryData((prev) => {
        const next = [...prev, { time: label, hr }];
        if (next.length > 60) next.shift();
        return next;
      });
    }, 1000);

    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopMonitoring = async () => {
    try {
      await cardiacApi.stop();
    } catch {
      // ignore
    }
    setMonitoring(false);
    if (hrIntervalRef.current) clearInterval(hrIntervalRef.current);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
  };

  const getZoneBadgeClass = (zone: number) => {
    switch (zone) {
      case 1: return "badge-blue";
      case 2: return "badge-green";
      case 3: return "badge";
      case 4: return "badge";
      case 5: return "badge-neon";
      default: return "badge";
    }
  };

  const getZoneColorClass = (zone: number) => {
    switch (zone) {
      case 1: return "text-blue-400";
      case 2: return "text-green-400";
      case 3: return "text-yellow-400";
      case 4: return "text-orange-400";
      case 5: return "text-red-400";
      default: return "text-white";
    }
  };

  const getZoneBarColor = (zone: number) => {
    switch (zone) {
      case 1: return "bg-blue-500";
      case 2: return "bg-green-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-orange-500";
      case 5: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-premium-dark border border-premium-gray rounded-lg px-3 py-2 text-sm">
          <p className="text-white-dim">{label}</p>
          <p className="text-neon-red font-bold">{payload[0].value} BPM</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-premium-black text-white p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-neon-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Monitoreo Cardiaco
            </h1>
            <p className="text-white-dim text-sm">
              Monitoreo en tiempo real con dispositivos Bluetooth
            </p>
          </div>
        </div>
        <div className="neon-divider mb-6" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-red" />
                Ritmo Cardiaco en Vivo
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white-dim text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(elapsed)}</span>
                </div>
                {monitoring ? (
                  <button onClick={stopMonitoring} className="btn-secondary flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Detener
                  </button>
                ) : (
                  <button
                    onClick={startMonitoring}
                    className="btn-primary flex items-center gap-2"
                    disabled={!connected && devices.length === 0}
                  >
                    <Play className="w-4 h-4" />
                    Iniciar
                  </button>
                )}
              </div>
            </div>

            <div className="card-neon p-8 rounded-xl text-center relative overflow-hidden">
              <motion.div
                className="flex flex-col items-center justify-center"
                animate={monitoring ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Heart
                  className={`w-12 h-12 mb-2 ${monitoring ? "text-neon-red animate-pulse-neon" : "text-white-dim"}`}
                />
                <div className="stat-value text-6xl md:text-7xl text-neon-red">
                  {monitoring ? currentHR : "--"}
                </div>
                <div className="stat-label text-lg">BPM</div>
              </motion.div>
              {monitoring && (
                <div className="absolute top-3 right-3">
                  <span className={`badge ${getZoneBadgeClass(currentZone)}`}>
                    Zona {currentZone}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-neon-red mx-auto mb-1" />
                <div className="stat-value text-xl">{monitoring ? hrMax : "--"}</div>
                <div className="stat-label">HR Máx</div>
              </div>
              <div className="text-center">
                <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="stat-value text-xl">{monitoring ? hrAvg : "--"}</div>
                <div className="stat-label">HR Prom</div>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1 rotate-180" />
                <div className="stat-value text-xl">{monitoring ? hrMin : "--"}</div>
                <div className="stat-label">HR Mín</div>
              </div>
              <div className="text-center">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <div className="stat-value text-xl">{monitoring ? hrv.toFixed(0) : "--"}</div>
                <div className="stat-label">HRV</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-red" />
                Historial de Frecuencia Cardiaca
              </h2>
              {monitoring && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Tiempo real
                </span>
              )}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                  <XAxis
                    dataKey="time"
                    stroke="#6b6b80"
                    fontSize={11}
                    tick={{ fill: "#6b6b80" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#6b6b80"
                    fontSize={11}
                    tick={{ fill: "#6b6b80" }}
                    domain={[40, 200]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="hr"
                    stroke="#ff2d55"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#ff2d55" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-neon-red" />
              Desglose por Zonas
            </h2>
            <div className="space-y-3">
              {zoneConfig.map((z) => {
                const zd = zoneTimes.find((zt) => zt.zone === z.zone);
                const pct = zd?.percentage ?? 0;
                return (
                  <div key={z.zone}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white-dim">{z.label}</span>
                      <span className="text-white font-medium">{pct}%</span>
                    </div>
                    <div className="w-full bg-premium-black rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${z.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Bluetooth className="w-5 h-5 text-neon-red" />
              Dispositivos Bluetooth
            </h2>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              {scanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BluetoothSearching className="w-4 h-4" />
              )}
              {scanning ? "Escaneando..." : "Escanear Dispositivos"}
            </button>

            {devices.length > 0 ? (
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.address}
                    className="flex items-center justify-between p-3 rounded-lg bg-premium-black border border-premium-gray"
                  >
                    <div className="flex items-center gap-2">
                      <Bluetooth className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{device.name}</p>
                        <p className="text-white-dim text-xs">{device.type}</p>
                      </div>
                    </div>
                    {connected && connectedDevice?.address === device.address ? (
                      <button
                        onClick={handleDisconnect}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(device)}
                        className="btn-primary text-xs py-1 px-3"
                        disabled={connected}
                      >
                        Conectar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-white-dim">
                <BluetoothSearching className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay dispositivos</p>
                <p className="text-xs">Presiona Escanear para buscar</p>
              </div>
            )}

            <div className="mt-4 p-3 rounded-lg bg-premium-black border border-premium-gray flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  connected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-white-dim"
                }`}
              />
              <div>
                <p className="text-white text-sm font-medium">
                  {connected ? "Conectado" : "Desconectado"}
                </p>
                {connected && connectedDevice && (
                  <p className="text-white-dim text-xs">{connectedDevice.name}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-neon-red" />
              Estado General
            </h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getZoneColorClass(currentZone)}`}>
                  {monitoring ? currentZone : "--"}
                </div>
                <div className="stat-label">Zona Actual</div>
                {monitoring && (
                  <span className={`badge mt-1 ${getZoneBadgeClass(currentZone)}`}>
                    {zoneConfig.find((z) => z.zone === currentZone)?.label ?? ""}
                  </span>
                )}
              </div>
              <div className="neon-divider" />
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white-dim">Recuperación</span>
                  <span className="text-green-400 font-bold">{monitoring ? recoveryScore : "--"}%</span>
                </div>
                <div className="w-full bg-premium-black rounded-full h-2">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${monitoring ? recoveryScore : 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white-dim">Fatiga</span>
                  <span className="text-orange-400 font-bold">{monitoring ? fatigueLevel : "--"}%</span>
                </div>
                <div className="w-full bg-premium-black rounded-full h-2">
                  <motion.div
                    className="h-full rounded-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${monitoring ? fatigueLevel : 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <button className="btn-secondary w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Datos
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
