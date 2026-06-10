"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Swords, Clock, MapPin, Eye, Video, TrendingUp, Zap, Loader2,
} from "lucide-react";
import { matchesApi } from "@/lib/api";

interface MatchEvent {
  minute: number;
  type: string;
  player: string;
  detail?: string;
}

interface MatchStat {
  home: number;
  away: number;
  label: string;
  percentage: number;
}

interface Match {
  id: number;
  home_team?: string;
  away_team?: string;
  homeTeam?: string;
  awayTeam?: string;
  home_score?: number;
  away_score?: number;
  homeScore?: number;
  awayScore?: number;
  status: string;
  date: string;
  venue?: string;
  video_url?: string;
  videoUrl?: string;
  events?: MatchEvent[];
  statistics?: MatchStat[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Programado", color: "badge-yellow" },
  live: { label: "En Vivo", color: "badge-neon" },
  completed: { label: "Finalizado", color: "badge-blue" },
  cancelled: { label: "Cancelado", color: "badge" },
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await matchesApi.list({ page_size: 50 });
        const items = res.data?.matches || res.data?.items || res.data || [];
        setMatches(Array.isArray(items) ? items : []);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter);

  const totalMatches = matches.length;
  const completed = matches.filter((m) => m.status === "completed");

  const topScoringTeam = (() => {
    const acc: Record<string, number> = {};
    for (const m of completed) {
      const home = m.homeTeam || m.home_team || "";
      const away = m.awayTeam || m.away_team || "";
      const hs = m.homeScore ?? m.home_score ?? 0;
      const as = m.awayScore ?? m.away_score ?? 0;
      if (home) acc[home] = (acc[home] || 0) + Number(hs);
      if (away) acc[away] = (acc[away] || 0) + Number(as);
    }
    const sorted = Object.entries(acc).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  })();

  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neon-red/10 flex items-center justify-center">
          <Swords className="w-5 h-5 text-neon-red" />
        </div>
        <div>
          <h1 className="page-title">Partidos</h1>
          <p className="page-subtitle">Division A</p>
        </div>
      </div>

      <div className="dashboard-grid mb-6">
        <div className="card-premium p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-4 h-4 text-neon-red" />
            <span className="stat-label">Total Partidos</span>
          </div>
          <p className="stat-value">{totalMatches}</p>
        </div>
        <div className="card-premium p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-neon-red" />
            <span className="stat-label">Equipo con mas goles</span>
          </div>
          <p className="stat-value text-sm">
            {topScoringTeam ? `${topScoringTeam[0]} (${topScoringTeam[1]})` : "—"}
          </p>
        </div>
        <div className="card-premium p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-4 h-4 text-neon-red" />
            <span className="stat-label">En vivo ahora</span>
          </div>
          <p className="stat-value">{liveCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "scheduled", "live", "completed", "cancelled"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn-secondary text-sm ${
              filter === key ? "!bg-premium-dark !border-neon-red !text-neon-red" : ""
            }`}
          >
            {key === "all" ? "Todos" : (statusConfig[key]?.label || key)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neon-red animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Swords className="w-8 h-8 text-white-dim/30" />
          </div>
          <h3 className="empty-state-title">No hay partidos</h3>
          <p className="empty-state-text">No hay partidos disponibles para esta categoria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((match) => (
            <motion.div
              key={match.id}
              layout
              className="card-premium overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                className="w-full text-left p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={match.status === "live" ? "badge-neon flex items-center gap-1" : statusConfig[match.status]?.color || "badge"}>
                        {match.status === "live" && (
                          <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                        )}
                        {statusConfig[match.status]?.label || match.status}
                      </span>
                      <span className="text-white-dim/50 text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {match.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xl font-bold text-white">{match.homeTeam || match.home_team || "Local"}</span>
                      <span className="text-base text-white-dim/50">vs</span>
                      <span className="text-xl font-bold text-white">{match.awayTeam || match.away_team || "Visitante"}</span>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-3xl font-bold text-neon-red">
                      {match.homeScore ?? match.home_score ?? "—"}
                      <span className="text-white-dim/50 text-xl mx-1">-</span>
                      {match.awayScore ?? match.away_score ?? "—"}
                    </p>
                    {match.venue && (
                      <p className="text-white-dim/40 text-sm mt-1 flex items-center gap-1 justify-end">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.venue}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === match.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="neon-divider mx-5" />
                    <div className="p-5 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-white-dim/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Video className="w-4 h-4 text-neon-red" />
                          Timeline de eventos
                        </h3>
                        {match.events && match.events.length > 0 ? (
                          <div className="space-y-2">
                            {match.events.map((ev, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                <span className="text-neon-red font-mono w-10 text-right">{ev.minute}&apos;</span>
                                <span className="w-2 h-2 rounded-full bg-premium-gray" />
                                <span className={ev.type === "goal" ? "text-accent-green" : ev.type === "red" ? "text-neon-red" : "text-white-dim/70"}>
                                  {ev.player} {ev.type === "goal" && `(${ev.detail || "Gol"})`}
                                  {ev.type === "yellow" && "(Amarilla)"}
                                  {ev.type === "red" && "(Roja)"}
                                  {ev.type === "sub" && "(Cambio)"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white-dim/40 text-sm">No hay eventos registrados</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white-dim/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-neon-red" />
                          Estadisticas
                        </h3>
                        {match.statistics && match.statistics.length > 0 ? (
                          <div className="space-y-3">
                            {match.statistics.map((stat, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-sm text-white-dim/50 mb-1">
                                  <span>{stat.home}</span>
                                  <span className="font-semibold text-white/70">{stat.label}</span>
                                  <span>{stat.away}</span>
                                </div>
                                <div className="progress-bar">
                                  <div className="progress-bar-fill" style={{ width: `${stat.percentage}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white-dim/40 text-sm">No hay estadisticas disponibles</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button className="btn-primary text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Ver detalle
                        </button>
                        {(match.videoUrl || match.video_url) && (
                          <button className="btn-secondary text-sm flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Ver resumen
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
