"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Heart,
  Swords,
  Users,
  TrendingUp,
  Zap,
  AlertTriangle,
  Award,
  Clock,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { playersApi, teamsApi, matchesApi, predictionsApi } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";

const performanceData = [
  { month: "Ene", rendimiento: 65, fisico: 70, tactico: 60 },
  { month: "Feb", rendimiento: 70, fisico: 72, tactico: 65 },
  { month: "Mar", rendimiento: 75, fisico: 75, tactico: 70 },
  { month: "Abr", rendimiento: 72, fisico: 78, tactico: 75 },
  { month: "May", rendimiento: 80, fisico: 80, tactico: 78 },
  { month: "Jun", rendimiento: 85, fisico: 82, tactico: 82 },
];

const intensityData = [
  { minuto: "1-5", intensidad: 75, frecuencia: 140 },
  { minuto: "6-10", intensidad: 85, frecuencia: 155 },
  { minuto: "11-15", intensidad: 70, frecuencia: 145 },
  { minuto: "16-20", intensidad: 90, frecuencia: 165 },
  { minuto: "21-25", intensidad: 80, frecuencia: 150 },
  { minuto: "26-30", intensidad: 95, frecuencia: 170 },
  { minuto: "31-35", intensidad: 78, frecuencia: 148 },
  { minuto: "36-40", intensidad: 88, frecuencia: 160 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    players: 0,
    teams: 0,
    matches: 0,
    predictions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [players, teams, matches, predictions] = await Promise.all([
          playersApi.list({ page_size: 1 }),
          teamsApi.list({ page_size: 1 }),
          matchesApi.list({ page_size: 1 }),
          predictionsApi.ranking(),
        ]);
        setStats({
          players: players.data.total || 0,
          teams: teams.data.total || 0,
          matches: matches.data.total || 0,
          predictions: predictions.data.rankings?.length || 0,
        });
      } catch {}
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="page-container">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">
              Dashboard <span className="text-gradient">Futsal AI</span>
            </h1>
            <p className="page-subtitle">Division A — Panorama general de la plataforma de analisis</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-red/10 border border-neon-red/20">
            <div className="w-2 h-2 rounded-full bg-neon-red animate-pulse-neon" />
            <span className="text-xs text-neon-red font-medium">Sistema activo</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="dashboard-grid mb-6">
          <StatCard icon={Users} label="Jugadores" value={loading ? "..." : stats.players} color="blue" />
          <StatCard icon={Activity} label="Equipos" value={loading ? "..." : stats.teams} color="green" />
          <StatCard icon={Swords} label="Partidos" value={loading ? "..." : stats.matches} color="yellow" />
          <StatCard icon={TrendingUp} label="Predicciones IA" value={loading ? "..." : stats.predictions} color="purple" />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DashboardCard title="Evolucion de Rendimiento" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="rendimiento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff1744" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ff1744" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fisico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tactico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2979ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2979ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                <XAxis dataKey="month" stroke="#555" fontSize={12} tickLine={false} />
                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #2d2d2d",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="rendimiento" stroke="#ff1744" fill="url(#rendimiento)" strokeWidth={2} />
                <Area type="monotone" dataKey="fisico" stroke="#00e676" fill="url(#fisico)" strokeWidth={2} />
                <Area type="monotone" dataKey="tactico" stroke="#2979ff" fill="url(#tactico)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </DashboardCard>

          <DashboardCard title="Intensidad por Minuto" icon={Heart}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={intensityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                <XAxis dataKey="minuto" stroke="#555" fontSize={12} tickLine={false} />
                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #2d2d2d",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                />
                <Bar dataKey="intensidad" fill="#ff1744" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-premium p-5 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                <Award size={20} className="text-accent-green" />
              </div>
              <div>
                <p className="text-xs text-white-dim/50 font-medium uppercase tracking-wider">Mejor Jugador</p>
                <p className="text-white font-semibold">Lucas Martinez</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white-dim/40">
              <span className="flex items-center gap-1"><span className="font-mono text-white-dim/70">92</span> Rating</span>
              <span className="w-px h-3 bg-premium-gray/60" />
              <span className="flex items-center gap-1"><span className="font-mono text-white-dim/70">15</span> Goles</span>
              <span className="w-px h-3 bg-premium-gray/60" />
              <span className="flex items-center gap-1"><span className="font-mono text-white-dim/70">8</span> Asistencias</span>
            </div>
          </div>

          <div className="card-premium p-5 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-accent-orange" />
              </div>
              <div>
                <p className="text-xs text-white-dim/50 font-medium uppercase tracking-wider">Riesgo de Lesion</p>
                <p className="text-white font-semibold">Alerta moderada</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white-dim/40">
              <span className="flex items-center gap-1"><span className="font-mono text-white-dim/70">3</span> Jugadores en riesgo</span>
              <span className="w-px h-3 bg-premium-gray/60" />
              <span className="flex items-center gap-1"><span className="font-mono text-white-dim/70">72%</span> Fatiga</span>
            </div>
          </div>

          <div className="card-premium p-5 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-neon-red/10 flex items-center justify-center">
                <Clock size={20} className="text-neon-red" />
              </div>
              <div>
                <p className="text-xs text-white-dim/50 font-medium uppercase tracking-wider">Proximo Partido</p>
                <p className="text-white font-semibold">Sabado 20:00 hs</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white-dim/40">
              <span className="flex items-center gap-1"><span className="font-mono text-white-dim/70">7</span> Dias</span>
              <span className="w-px h-3 bg-premium-gray/60" />
              <span className="text-white-dim/40">vs Club Atletico</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
