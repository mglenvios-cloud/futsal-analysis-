"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, TrendingUp, Zap, Heart, Gauge, Timer,
  GitCompare, RefreshCw, Download, Dumbbell, UserCheck
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line
} from "recharts";
import { videosApi, analysisApi } from "@/lib/api";

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Metric {
  label: string;
  value: number;
  unit: string;
  normalized: number;
}

interface PlayerTrack {
  player: string;
  distance: number;
  maxSpeed: number;
  avgSpeed: number;
  sprints: number;
  accelerations: number;
  directionChanges: number;
  movementTime: number;
  intensity: number;
}

interface PhysicalAnalysis {
  id: string;
  videoId: string;
  metrics: Metric[];
  speedProfile: { timestamp: number; speed: number }[];
  playerTracks: PlayerTrack[];
}

const metricIcons: Record<string, React.ReactNode> = {
  "Distancia Total": <Activity size={20} />,
  "Velocidad Max": <Zap size={20} />,
  "Velocidad Prom": <TrendingUp size={20} />,
  Sprints: <Dumbbell size={20} />,
  Aceleraciones: <TrendingUp size={20} />,
  "Cambios de Direccion": <GitCompare size={20} />,
  "Tiempo Movimiento": <Timer size={20} />,
  Intensidad: <Heart size={20} />,
};

const radarMetrics = [
  { key: "Distancia Total", label: "Distancia" },
  { key: "Velocidad Max", label: "Velocidad" },
  { key: "Sprints", label: "Sprints" },
  { key: "Aceleraciones", label: "Aceleraciones" },
  { key: "Cambios de Direccion", label: "Direccion" },
  { key: "Intensidad", label: "Intensidad" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-premium px-3 py-2 text-sm">
        <p className="text-white">{`${label}`}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-neon-red">{`${p.name}: ${p.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PhysicalAnalysisPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PhysicalAnalysis | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await videosApi.list();
        const completed = (res.data || res || []).filter(
          (v: Video) => v.status === "completed"
        );
        setVideos(completed);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedVideoId) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await analysisApi.physical(Number(selectedVideoId));
      setAnalysis(res.data || res);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefresh = async () => {
    setSelectedVideoId("");
    setAnalysis(null);
    setLoading(true);
    try {
      const res = await videosApi.list();
      const completed = (res.data || res || []).filter(
        (v: Video) => v.status === "completed"
      );
      setVideos(completed);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (label: string): Metric | undefined => {
    return analysis?.metrics.find((m) => m.label === label);
  };

  const radarData = radarMetrics.map(({ key, label }) => {
    const m = getMetricValue(key);
    return {
      metric: label,
      valor: m?.normalized ?? 0,
    };
  });

  return (
    <div className="min-h-screen bg-premium-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Analisis Fisico
            </h1>
            <p className="text-white-dim mt-1">
              Metricas de rendimiento fisico de jugadores
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="bg-premium-dark text-white border border-premium-gray rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-neon-red"
              disabled={analyzing}
            >
              <option value="">
                {loading ? "Cargando videos..." : "Seleccionar video"}
              </option>
              {videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleAnalyze}
              disabled={!selectedVideoId || analyzing}
              className="btn-primary flex items-center gap-2"
            >
              {analyzing ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Zap size={16} />
              )}
              {analyzing ? "Analizando..." : "Analizar"}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </motion.div>

        <div className="neon-divider" />

        {/* Loading State */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <RefreshCw size={48} className="text-neon-red animate-spin mb-4" />
            <p className="text-white-dim text-lg">
              Analizando rendimiento fisico...
            </p>
          </motion.div>
        )}

        {/* Empty State */}
        {!analyzing && !analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Zap size={64} className="text-premium-gray mb-4" />
            <p className="text-white-dim text-lg mb-2">
              Selecciona un video procesado y presiona Analizar
            </p>
            <p className="text-white-dim text-sm">
              Para ver las metricas de rendimiento fisico de los jugadores
            </p>
          </motion.div>
        )}

        {/* Results */}
        {!analyzing && analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {analysis.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="card-premium flex items-start gap-3 p-4"
                >
                  <div className="text-neon-red mt-1">
                    {metricIcons[metric.label] || <Activity size={20} />}
                  </div>
                  <div>
                    <p className="stat-value text-xl">
                      {metric.value.toFixed(2)}
                      <span className="text-xs text-white-dim ml-1">
                        {metric.unit}
                      </span>
                    </p>
                    <p className="stat-label text-sm">{metric.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card-premium p-4 md:p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Gauge size={20} className="text-neon-red" />
                  Perfil Fisico General
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2a2e" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      tickCount={6}
                    />
                    <Radar
                      name="Rendimiento"
                      dataKey="valor"
                      stroke="#ff1f4f"
                      fill="#ff1f4f"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Speed Profile Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card-premium p-4 md:p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-neon-red" />
                  Perfil de Velocidad
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={analysis.speedProfile}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      tickFormatter={(v) => `${v}s`}
                    />
                    <YAxis
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      unit=" km/h"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="speed"
                      fill="#ff1f4f"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Player Tracks Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card-premium p-4 md:p-6 overflow-x-auto"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-neon-red" />
                Metricas por Jugador
              </h3>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-premium-gray">
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Jugador
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Distancia
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Vel. Max
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Vel. Prom
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Sprints
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Acelerac.
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Cambios Dir.
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Tiempo Mov.
                    </th>
                    <th className="py-3 px-2 text-white-dim font-medium">
                      Intensidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.playerTracks.map((track, i) => (
                    <tr
                      key={track.player}
                      className="border-b border-premium-gray/50 hover:bg-premium-dark transition-colors"
                    >
                      <td className="py-3 px-2 text-white font-medium">
                        {track.player}
                      </td>
                      <td className="py-3 px-2 text-white-dim">
                        {track.distance.toFixed(2)} km
                      </td>
                      <td className="py-3 px-2">
                        <span className="badge badge-neon">
                          {track.maxSpeed.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white-dim">
                        {track.avgSpeed.toFixed(1)} km/h
                      </td>
                      <td className="py-3 px-2">
                        <span className="badge badge-green">
                          {track.sprints}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="badge badge-blue">
                          {track.accelerations}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="badge badge-yellow">
                          {track.directionChanges}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white-dim">
                        {track.movementTime.toFixed(1)} min
                      </td>
                      <td className="py-3 px-2">
                        <span className="badge badge-neon">
                          {track.intensity.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analysis.playerTracks.length === 0 && (
                <p className="text-white-dim text-center py-8">
                  No hay datos de jugadores disponibles
                </p>
              )}
            </motion.div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button className="btn-secondary flex items-center gap-2">
                <Download size={16} />
                Exportar Reporte
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
