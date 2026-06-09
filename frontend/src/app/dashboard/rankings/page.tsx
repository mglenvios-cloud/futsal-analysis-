"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  Activity,
  Heart,
  Swords,
  BarChart3,
  Users,
  Target,
  Zap,
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
  GitCompare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { predictionsApi, playersApi } from "@/lib/api";

interface Player {
  id: number;
  name: string;
  overall_score: number;
  performance_score: number;
  potential: number;
  injury_risk: number;
  goals?: number;
  assists?: number;
  physical_metrics?: {
    speed: number;
    stamina: number;
    strength: number;
  };
  tactical_metrics?: {
    positioning: number;
    decision_making: number;
    teamwork: number;
  };
}

type Tab = "ranking" | "comparator";

const rankMedal = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

const injuryColor = (risk: number) => {
  if (risk <= 25) return "badge-green";
  if (risk <= 50) return "badge-yellow";
  return "badge-neon";
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
};

const ComparisonBar = ({
  label,
  player1Val,
  player2Val,
  player1Name,
  player2Name,
}: {
  label: string;
  player1Val: number;
  player2Val: number;
  player1Name: string;
  player2Name: string;
}) => {
  const max = Math.max(player1Val, player2Val, 100);
  const p1Pct = (player1Val / max) * 100;
  const p2Pct = (player2Val / max) * 100;

  return (
    <div className="mb-6">
      <p className="text-white-dim text-sm mb-2 font-semibold">{label}</p>
      <div className="flex items-center gap-4">
        <span className="text-white text-sm w-28 text-right truncate">
          {player1Name}
        </span>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-3 bg-premium-dark rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p1Pct}%` }}
              className="h-full rounded-full"
              style={{
                background:
                  player1Val >= player2Val
                    ? "linear-gradient(90deg, #ff0040, #ff3366)"
                    : "linear-gradient(90deg, #3b3b4a, #555566)",
              }}
            />
          </div>
          <div className="h-3 bg-premium-dark rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p2Pct}%` }}
              className="h-full rounded-full"
              style={{
                background:
                  player2Val >= player1Val
                    ? "linear-gradient(90deg, #ff0040, #ff3366)"
                    : "linear-gradient(90deg, #3b3b4a, #555566)",
              }}
            />
          </div>
        </div>
        <span className="text-white text-sm w-28 truncate">{player2Name}</span>
      </div>
      <div className="flex justify-between mt-1 text-xs text-white-dim px-28">
        <span className="text-neon-red font-bold">{player1Val}</span>
        <span className="text-neon-red font-bold">{player2Val}</span>
      </div>
    </div>
  );
};

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ranking");
  const [rankings, setRankings] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const [searchP1, setSearchP1] = useState("");
  const [searchP2, setSearchP2] = useState("");
  const [resultsP1, setResultsP1] = useState<Player[]>([]);
  const [resultsP2, setResultsP2] = useState<Player[]>([]);
  const [selectedP1, setSelectedP1] = useState<Player | null>(null);
  const [selectedP2, setSelectedP2] = useState<Player | null>(null);
  const [searchingP1, setSearchingP1] = useState(false);
  const [searchingP2, setSearchingP2] = useState(false);

  useEffect(() => {
    if (activeTab !== "ranking") return;
    setLoading(true);
    predictionsApi
      .ranking()
      .then((data) => setRankings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const searchPlayers = async (
    query: string,
    side: "p1" | "p2"
  ) => {
    if (query.length < 2) {
      if (side === "p1") setResultsP1([]);
      else setResultsP2([]);
      return;
    }
    if (side === "p1") setSearchingP1(true);
    else setSearchingP2(true);
    try {
      const data = await playersApi.list({ search: query });
      if (side === "p1") setResultsP1(data);
      else setResultsP2(data);
    } catch {
      if (side === "p1") setResultsP1([]);
      else setResultsP2([]);
    } finally {
      if (side === "p1") setSearchingP1(false);
      else setSearchingP2(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => searchPlayers(searchP1, "p1"), 300);
    return () => clearTimeout(t);
  }, [searchP1]);

  useEffect(() => {
    const t = setTimeout(() => searchPlayers(searchP2, "p2"), 300);
    return () => clearTimeout(t);
  }, [searchP2]);

  const paginatedRankings = rankings.slice(0, page * perPage);

  const radarData = selectedP1 && selectedP2
    ? [
        {
          metric: "Overall",
          [selectedP1.name]: selectedP1.overall_score,
          [selectedP2.name]: selectedP2.overall_score,
        },
        {
          metric: "Goals",
          [selectedP1.name]: selectedP1.goals ?? 0,
          [selectedP2.name]: selectedP2.goals ?? 0,
        },
        {
          metric: "Assists",
          [selectedP1.name]: selectedP1.assists ?? 0,
          [selectedP2.name]: selectedP2.assists ?? 0,
        },
        {
          metric: "Speed",
          [selectedP1.name]: selectedP1.physical_metrics?.speed ?? 0,
          [selectedP2.name]: selectedP2.physical_metrics?.speed ?? 0,
        },
        {
          metric: "Stamina",
          [selectedP1.name]: selectedP1.physical_metrics?.stamina ?? 0,
          [selectedP2.name]: selectedP2.physical_metrics?.stamina ?? 0,
        },
        {
          metric: "Strength",
          [selectedP1.name]: selectedP1.physical_metrics?.strength ?? 0,
          [selectedP2.name]: selectedP2.physical_metrics?.strength ?? 0,
        },
        {
          metric: "Positioning",
          [selectedP1.name]: selectedP1.tactical_metrics?.positioning ?? 0,
          [selectedP2.name]: selectedP2.tactical_metrics?.positioning ?? 0,
        },
        {
          metric: "Decision",
          [selectedP1.name]: selectedP1.tactical_metrics?.decision_making ?? 0,
          [selectedP2.name]: selectedP2.tactical_metrics?.decision_making ?? 0,
        },
        {
          metric: "Teamwork",
          [selectedP1.name]: selectedP1.tactical_metrics?.teamwork ?? 0,
          [selectedP2.name]: selectedP2.tactical_metrics?.teamwork ?? 0,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-premium-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-neon-red w-8 h-8" />
            <h1 className="text-3xl font-bold text-white">Rankings</h1>
          </div>
          <p className="text-white-dim text-sm ml-11">
            Comparativas y rankings de Division A
          </p>
        </motion.div>

        <div className="flex gap-1 bg-premium-dark rounded-xl p-1 w-fit mb-8 border border-premium-gray">
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "ranking"
                ? "bg-neon-red/20 text-neon-red shadow-lg shadow-neon-red/10"
                : "text-white-dim hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Ranking General
          </button>
          <button
            onClick={() => setActiveTab("comparator")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "comparator"
                ? "bg-neon-red/20 text-neon-red shadow-lg shadow-neon-red/10"
                : "text-white-dim hover:text-white"
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Comparador
          </button>
        </div>

        {activeTab === "ranking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white-dim text-sm">
                <Users className="w-4 h-4 text-neon-red" />
                <span>
                  Top {Math.min(page * perPage, rankings.length)} de{" "}
                  {rankings.length} jugadores
                </span>
              </div>
              {rankings.length > perPage && page * perPage < rankings.length && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <ChevronDown className="w-3 h-3" />
                  Mostrar más
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-neon-red animate-spin" />
              </div>
            ) : rankings.length === 0 ? (
              <div className="card-premium flex flex-col items-center justify-center py-20 text-white-dim">
                <Target className="w-12 h-12 mb-4 opacity-40" />
                <p>No hay datos de ranking disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedRankings.map((player, idx) => {
                  const rank = idx + 1;
                  const medal = rankMedal(rank);
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="card-premium flex items-center gap-4 p-4 hover:border-neon-red/30 transition-all"
                    >
                      <div className="w-10 text-center">
                        {medal ? (
                          <span className="text-2xl">{medal}</span>
                        ) : (
                          <span className="text-white-dim font-bold text-sm">
                            {rank}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold truncate">
                            {player.name}
                          </span>
                          <Zap
                            className={`w-3.5 h-3.5 ${scoreColor(player.overall_score)}`}
                          />
                        </div>
                        <div className="w-full h-2 bg-premium-dark rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${player.overall_score}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.03 }}
                            className="h-full rounded-full"
                            style={{
                              background:
                                player.overall_score >= 80
                                  ? "linear-gradient(90deg, #ff0040, #ff6b6b)"
                                  : player.overall_score >= 60
                                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                    : "linear-gradient(90deg, #ef4444, #dc2626)",
                            }}
                          />
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-xs text-white-dim">
                            <Activity className="w-3 h-3" />
                            <span>Rend.</span>
                          </div>
                          <span
                            className={`stat-value text-sm ${scoreColor(player.performance_score)}`}
                          >
                            {player.performance_score}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 text-xs text-white-dim">
                            <TrendingUp className="w-3 h-3" />
                            <span>Pot.</span>
                          </div>
                          <span className="stat-value text-sm text-blue-400">
                            {player.potential}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 text-xs text-white-dim">
                            <Heart className="w-3 h-3" />
                            <span>Lesión</span>
                          </div>
                          <span
                            className={`badge ${injuryColor(player.injury_risk)} text-xs`}
                          >
                            {player.injury_risk}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "comparator" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-premium p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Swords className="w-5 h-5 text-neon-red" />
                  <h3 className="text-white font-semibold">Jugador 1</h3>
                </div>
                {selectedP1 ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {selectedP1.name}
                      </p>
                      <p className="text-white-dim text-xs">
                        Overall: {selectedP1.overall_score}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedP1(null);
                        setSearchP1("");
                        setResultsP1([]);
                      }}
                      className="text-white-dim hover:text-neon-red text-xs"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-2 bg-premium-black rounded-lg px-3 py-2 border border-premium-gray">
                      <Search className="w-4 h-4 text-white-dim" />
                      <input
                        type="text"
                        placeholder="Buscar jugador..."
                        value={searchP1}
                        onChange={(e) => setSearchP1(e.target.value)}
                        className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white-dim/50"
                      />
                      {searchingP1 && (
                        <Loader2 className="w-4 h-4 text-neon-red animate-spin" />
                      )}
                    </div>
                    {resultsP1.length > 0 && (
                      <div className="absolute z-10 mt-2 w-full bg-premium-dark border border-premium-gray rounded-xl overflow-hidden shadow-2xl">
                        {resultsP1.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedP1(p);
                              setSearchP1("");
                              setResultsP1([]);
                            }}
                            className="w-full text-left px-4 py-3 text-white text-sm hover:bg-neon-red/10 transition-colors border-b border-premium-gray last:border-0"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {resultsP1.length === 0 &&
                      searchP1.length >= 2 &&
                      !searchingP1 && (
                        <p className="text-white-dim text-xs mt-2">
                          Sin resultados
                        </p>
                      )}
                  </div>
                )}
              </div>

              <div className="card-premium p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Swords className="w-5 h-5 text-neon-red" />
                  <h3 className="text-white font-semibold">Jugador 2</h3>
                </div>
                {selectedP2 ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {selectedP2.name}
                      </p>
                      <p className="text-white-dim text-xs">
                        Overall: {selectedP2.overall_score}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedP2(null);
                        setSearchP2("");
                        setResultsP2([]);
                      }}
                      className="text-white-dim hover:text-neon-red text-xs"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-2 bg-premium-black rounded-lg px-3 py-2 border border-premium-gray">
                      <Search className="w-4 h-4 text-white-dim" />
                      <input
                        type="text"
                        placeholder="Buscar jugador..."
                        value={searchP2}
                        onChange={(e) => setSearchP2(e.target.value)}
                        className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white-dim/50"
                      />
                      {searchingP2 && (
                        <Loader2 className="w-4 h-4 text-neon-red animate-spin" />
                      )}
                    </div>
                    {resultsP2.length > 0 && (
                      <div className="absolute z-10 mt-2 w-full bg-premium-dark border border-premium-gray rounded-xl overflow-hidden shadow-2xl">
                        {resultsP2.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedP2(p);
                              setSearchP2("");
                              setResultsP2([]);
                            }}
                            className="w-full text-left px-4 py-3 text-white text-sm hover:bg-neon-red/10 transition-colors border-b border-premium-gray last:border-0"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {resultsP2.length === 0 &&
                      searchP2.length >= 2 &&
                      !searchingP2 && (
                        <p className="text-white-dim text-xs mt-2">
                          Sin resultados
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>

            {selectedP1 && selectedP2 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="neon-divider" />

                <div className="card-premium p-6">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-neon-red" />
                    Comparativa General
                  </h3>

                  <ComparisonBar
                    label="Overall Score"
                    player1Val={selectedP1.overall_score}
                    player2Val={selectedP2.overall_score}
                    player1Name={selectedP1.name}
                    player2Name={selectedP2.name}
                  />
                  <ComparisonBar
                    label="Goles"
                    player1Val={selectedP1.goals ?? 0}
                    player2Val={selectedP2.goals ?? 0}
                    player1Name={selectedP1.name}
                    player2Name={selectedP2.name}
                  />
                  <ComparisonBar
                    label="Asistencias"
                    player1Val={selectedP1.assists ?? 0}
                    player2Val={selectedP2.assists ?? 0}
                    player1Name={selectedP1.name}
                    player2Name={selectedP2.name}
                  />

                  {selectedP1.physical_metrics && selectedP2.physical_metrics && (
                    <>
                      <p className="text-white font-semibold mt-8 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-neon-red" />
                        Métricas Físicas
                      </p>
                      <ComparisonBar
                        label="Velocidad"
                        player1Val={selectedP1.physical_metrics.speed}
                        player2Val={selectedP2.physical_metrics.speed}
                        player1Name={selectedP1.name}
                        player2Name={selectedP2.name}
                      />
                      <ComparisonBar
                        label="Resistencia"
                        player1Val={selectedP1.physical_metrics.stamina}
                        player2Val={selectedP2.physical_metrics.stamina}
                        player1Name={selectedP1.name}
                        player2Name={selectedP2.name}
                      />
                      <ComparisonBar
                        label="Fuerza"
                        player1Val={selectedP1.physical_metrics.strength}
                        player2Val={selectedP2.physical_metrics.strength}
                        player1Name={selectedP1.name}
                        player2Name={selectedP2.name}
                      />
                    </>
                  )}

                  {selectedP1.tactical_metrics && selectedP2.tactical_metrics && (
                    <>
                      <p className="text-white font-semibold mt-8 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-neon-red" />
                        Métricas Tácticas
                      </p>
                      <ComparisonBar
                        label="Posicionamiento"
                        player1Val={selectedP1.tactical_metrics.positioning}
                        player2Val={selectedP2.tactical_metrics.positioning}
                        player1Name={selectedP1.name}
                        player2Name={selectedP2.name}
                      />
                      <ComparisonBar
                        label="Toma de Decisiones"
                        player1Val={selectedP1.tactical_metrics.decision_making}
                        player2Val={selectedP2.tactical_metrics.decision_making}
                        player1Name={selectedP1.name}
                        player2Name={selectedP2.name}
                      />
                      <ComparisonBar
                        label="Trabajo en Equipo"
                        player1Val={selectedP1.tactical_metrics.teamwork}
                        player2Val={selectedP2.tactical_metrics.teamwork}
                        player1Name={selectedP1.name}
                        player2Name={selectedP2.name}
                      />
                    </>
                  )}
                </div>

                <div className="card-premium p-6">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-red" />
                    Comparativa Radar
                  </h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis
                          dataKey="metric"
                          tick={{ fill: "#999", fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                          tick={{ fill: "#666", fontSize: 10 }}
                          domain={[0, 100]}
                        />
                        <Radar
                          name={selectedP1.name}
                          dataKey={selectedP1.name}
                          stroke="#ff0040"
                          fill="#ff0040"
                          fillOpacity={0.15}
                        />
                        <Radar
                          name={selectedP2.name}
                          dataKey={selectedP2.name}
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.15}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a2e",
                            border: "1px solid #333",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neon-red" />
                      <span className="text-white-dim text-sm">
                        {selectedP1.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-white-dim text-sm">
                        {selectedP2.name}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="card-premium flex flex-col items-center justify-center py-20 text-white-dim">
                <GitCompare className="w-12 h-12 mb-4 opacity-40" />
                <p className="text-lg font-semibold mb-1">
                  Selecciona dos jugadores
                </p>
                <p className="text-sm">
                  Usa los buscadores de arriba para comparar estadísticas
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
