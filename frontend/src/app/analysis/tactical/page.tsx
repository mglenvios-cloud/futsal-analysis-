"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Grid3x3,
  Shield,
  Move,
  ArrowRightLeft,
  Zap,
  Eye,
  TrendingUp,
  RefreshCw,
  ClipboardList,
  Maximize2,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { analysisApi, videosApi } from "@/lib/api";

interface Video {
  id: string;
  title: string;
  status: string;
}

interface TacticalAnalysis {
  formation: string;
  tactical_system: string;
  high_press_intensity: number;
  mid_press_intensity: number;
  low_press_intensity: number;
  coverage_efficiency: number;
  rotation_quality: number;
  transition_offensive_speed: number;
  transition_defensive_speed: number;
  numerical_superiority_attacks: number;
  numerical_inferiority_defenses: number;
  positions?: { label: string; x: number; y: number }[];
}

const metricConfig = [
  { key: "high_press_intensity", label: "Presion Alta", icon: Zap, suffix: "%", color: "text-neon-red" },
  { key: "mid_press_intensity", label: "Presion Media", icon: Shield, suffix: "%", color: "text-yellow-400" },
  { key: "low_press_intensity", label: "Presion Baja", icon: Shield, suffix: "%", color: "text-blue-400" },
  { key: "coverage_efficiency", label: "Cobertura", icon: Eye, suffix: "%", color: "text-green-400" },
  { key: "rotation_quality", label: "Rotaciones", icon: RefreshCw, suffix: "%", color: "text-purple-400" },
  { key: "transition_offensive_speed", label: "Transicion Ofensiva", icon: TrendingUp, suffix: "", color: "text-orange-400" },
  { key: "transition_defensive_speed", label: "Transicion Defensiva", icon: ArrowRightLeft, suffix: "", color: "text-cyan-400" },
  { key: "numerical_superiority_attacks", label: "Sup. Numericas", icon: Move, suffix: "", color: "text-pink-400" },
];

const radarMetrics = [
  { key: "high_press_intensity", label: "Presion Alta" },
  { key: "mid_press_intensity", label: "Presion Media" },
  { key: "low_press_intensity", label: "Presion Baja" },
  { key: "coverage_efficiency", label: "Cobertura" },
  { key: "rotation_quality", label: "Rotaciones" },
  { key: "transition_offensive_speed", label: "Trans. Ofensiva" },
  { key: "transition_defensive_speed", label: "Trans. Defensiva" },
];

const defaultPositions = [
  { label: "PIVOT", x: 50, y: 22 },
  { label: "ALA D", x: 72, y: 40 },
  { label: "ALA I", x: 28, y: 40 },
  { label: "CIERRE", x: 50, y: 60 },
  { label: "ARQ", x: 50, y: 78 },
];

function formatVal(val: number, suffix: string): string {
  if (suffix === "%") return `${Math.round(val)}%`;
  return val.toFixed(1);
}

export default function TacticalAnalysisPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TacticalAnalysis | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await videosApi.list();
        const completed = (res.data?.results || res.data || []).filter(
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
      const res = await analysisApi.tactical(Number(selectedVideoId));
      setAnalysis(res.data || res);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const getMetricValue = (key: string): number => {
    if (!analysis) return 0;
    return (analysis as any)[key] ?? 0;
  };

  const radarData = radarMetrics.map(({ key, label }) => ({
    metric: label,
    valor: Math.min(getMetricValue(key) * 20, 100),
  }));

  const positions = analysis?.positions ?? defaultPositions;

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
              Analisis <span className="text-neon-red">Tactico</span>
            </h1>
            <p className="text-white-dim mt-1">
              Sistemas tacticos, presiones y formaciones
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
                  {v.title || `Video ${v.id}`}
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
              Analizando sistema tactico...
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
            <Swords size={64} className="text-premium-gray mb-4" />
            <p className="text-white-dim text-lg mb-2">
              Selecciona un video procesado y presiona Analizar
            </p>
            <p className="text-white-dim text-sm">
              Para obtener el analisis tactico y las metricas del partido
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
            {/* Formation & Tactical System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="card-premium flex flex-col items-center justify-center p-8"
              >
                <Grid3x3 size={40} className="text-neon-red mb-3" />
                <span className="text-xs text-white-dim uppercase tracking-widest mb-1">
                  Formacion Detectada
                </span>
                <span className="text-5xl font-bold text-white">
                  {analysis.formation || "—"}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="card-premium flex flex-col items-center justify-center p-8"
              >
                <Swords size={40} className="text-neon-red mb-3" />
                <span className="text-xs text-white-dim uppercase tracking-widest mb-1">
                  Sistema Tactico
                </span>
                <span className="text-4xl font-bold text-white">
                  {analysis.tactical_system || "—"}
                </span>
              </motion.div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metricConfig.map((metric, index) => {
                const Icon = metric.icon;
                const value = getMetricValue(metric.key);
                return (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="card-premium flex items-start gap-3 p-4"
                  >
                    <div className={`${metric.color} mt-1`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="stat-value text-xl">
                        {formatVal(value, metric.suffix)}
                      </p>
                      <p className="stat-label text-sm">{metric.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Radar Chart + Tactical Board */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card-premium p-4 md:p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Maximize2 size={18} className="text-neon-red" />
                  Comparativa Tactica
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2a2e" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      tickCount={5}
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

              {/* Tactical Board */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="card-premium p-4 md:p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ClipboardList size={18} className="text-neon-red" />
                  Tablero Tactico — {analysis.formation || "Formacion"}
                </h3>
                <div className="flex justify-center">
                  <svg
                    viewBox="0 0 400 300"
                    className="w-full max-w-[400px] h-auto"
                  >
                    {/* Court background */}
                    <rect x="0" y="0" width="400" height="300" rx="6" fill="#1a6b3c" stroke="#ffffff" strokeWidth="2" />
                    {/* Center line */}
                    <line x1="0" y1="150" x2="400" y2="150" stroke="#ffffff" strokeWidth="2" strokeDasharray="6,4" />
                    {/* Center circle */}
                    <circle cx="200" cy="150" r="30" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Top penalty area */}
                    <rect x="100" y="0" width="200" height="80" rx="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Bottom penalty area */}
                    <rect x="100" y="220" width="200" height="80" rx="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Top goal */}
                    <rect x="150" y="0" width="100" height="16" rx="2" fill="#0d4f2b" stroke="#ffffff" strokeWidth="2" />
                    {/* Bottom goal */}
                    <rect x="150" y="284" width="100" height="16" rx="2" fill="#0d4f2b" stroke="#ffffff" strokeWidth="2" />

                    {/* Player positions */}
                    {positions.map((pos, i) => {
                      const cx = (pos.x / 100) * 400;
                      const cy = (pos.y / 100) * 300;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="14" fill="#ff1f4f" fillOpacity="0.3" stroke="#ff1f4f" strokeWidth="2" />
                          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="9" fontWeight="bold">
                            {pos.label.substring(0, 4)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Formation connection lines */}
                    {positions.length > 1 && (
                      <line x1={(positions[0].x / 100) * 400} y1={(positions[0].y / 100) * 300} x2={(positions[1].x / 100) * 400} y2={(positions[1].y / 100) * 300} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,3" />
                    )}
                    {positions.length > 1 && (
                      <line x1={(positions[0].x / 100) * 400} y1={(positions[0].y / 100) * 300} x2={(positions[2].x / 100) * 400} y2={(positions[2].y / 100) * 300} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,3" />
                    )}
                    {positions.length > 2 && (
                      <>
                        <line x1={(positions[1].x / 100) * 400} y1={(positions[1].y / 100) * 300} x2={(positions[3].x / 100) * 400} y2={(positions[3].y / 100) * 300} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,3" />
                        <line x1={(positions[2].x / 100) * 400} y1={(positions[2].y / 100) * 300} x2={(positions[3].x / 100) * 400} y2={(positions[3].y / 100) * 300} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,3" />
                      </>
                    )}
                    {positions.length > 3 && (
                      <line x1={(positions[3].x / 100) * 400} y1={(positions[3].y / 100) * 300} x2={(positions[4].x / 100) * 400} y2={(positions[4].y / 100) * 300} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,3" />
                    )}
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Formation Positions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card-premium p-4 md:p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Grid3x3 size={18} className="text-neon-red" />
                Posiciones de Formacion ({analysis.formation || positions.length}v{positions.length > 4 ? positions.length - 1 : "?"})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {positions.map((pos, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-premium-dark border border-premium-gray/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-neon-red/20 flex items-center justify-center text-neon-red text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{pos.label}</p>
                      <p className="text-white-dim text-xs">
                        ({Math.round(pos.x)}, {Math.round(pos.y)})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
