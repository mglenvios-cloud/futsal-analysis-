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

export default function DashboardPage() {
  const [stats, setStats] = useState({
    players: 0,
    teams: 0,
    matches: 0,
    predictions: 0,
  });

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
    }
    loadStats();
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">
            Dashboard <span className="text-gradient">Futsal AI</span>
          </h1>
          <p className="page-subtitle">Division A - Panorama general de la plataforma de analisis</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <Zap size={14} className="text-neon-red" />
          <span className="text-xs text-neon-red font-medium">Sistema activo</span>
        </div>
      </div>

      <div className="dashboard-grid mb-6">
        <StatCard icon={Users} label="Jugadores" value={stats.players} color="blue" />
        <StatCard icon={Activity} label="Equipos" value={stats.teams} color="green" />
        <StatCard icon={Swords} label="Partidos" value={stats.matches} color="yellow" />
        <StatCard icon={TrendingUp} label="Predicciones IA" value={stats.predictions} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardCard title="Evolucion de Rendimiento" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="rendimiento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff1744" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff1744" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2d2d2d", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="rendimiento" stroke="#ff1744" fill="url(#rendimiento)" strokeWidth={2} />
              <Area type="monotone" dataKey="fisico" stroke="#00e676" fill="none" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="tactico" stroke="#2979ff" fill="none" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Intensidad por Minuto" icon={Heart}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={intensityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
              <XAxis dataKey="minuto" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2d2d2d", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="intensidad" fill="#ff1744" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-premium p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <Award size={20} className="text-accent-green" />
            </div>
            <div>
              <p className="text-sm text-white-dim/70">Mejor Jugador</p>
              <p className="text-white font-semibold">Lucas Martinez</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white-dim/50">
            <span>Rating: 92</span>
            <span>Goles: 15</span>
            <span>Asistencias: 8</span>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-yellow/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-accent-yellow" />
            </div>
            <div>
              <p className="text-sm text-white-dim/70">Riesgo de Lesion</p>
              <p className="text-white font-semibold">Alerta moderada</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white-dim/50">
            <span>3 jugadores en riesgo</span>
            <span>Fatiga: 72%</span>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-red/10 flex items-center justify-center">
              <Zap size={20} className="text-neon-red" />
            </div>
            <div>
              <p className="text-sm text-white-dim/70">Equipo del Mes</p>
              <p className="text-white font-semibold">Boca Juniors</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white-dim/50">
            <span>Division A</span>
            <span>Puntos: 45</span>
            <span>Partidos: 18</span>
          </div>
        </div>
      </div>
    </div>
  );
}
