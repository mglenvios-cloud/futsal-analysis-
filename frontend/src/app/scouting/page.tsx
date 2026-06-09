"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Target,
  Trophy,
  Globe,
  RefreshCw,
  Download,
  UserPlus,
  Zap,
  Filter,
  ArrowUpDown,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { scoutingApi } from "@/lib/api";

interface Player {
  id: string;
  nombre: string;
  club: string;
  posicion: string;
  edad: number;
  goles: number;
  asistencias: number;
  partidos: number;
  source_url?: string;
  foto_url?: string;
  nacionalidad?: string;
  ultimo_partido?: string;
}

interface ScoutingStats {
  total_jugadores: number;
  clubes_encontrados: number;
  ultima_actualizacion: string;
}

const POSITIONS = ["Todas", "Cierre", "Ala", "Pivot", "Universal"];
const SORT_OPTIONS = [
  { value: "goles", label: "Goles" },
  { value: "asistencias", label: "Asistencias" },
  { value: "partidos", label: "Partidos" },
  { value: "edad", label: "Edad" },
];

export default function ScoutingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [stats, setStats] = useState<ScoutingStats>({
    total_jugadores: 0,
    clubes_encontrados: 0,
    ultima_actualizacion: "",
  });
  const [loading, setLoading] = useState(true);
  const [scoutingLoading, setScoutingLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState("Todos");
  const [selectedPosition, setSelectedPosition] = useState("Todas");
  const [sortBy, setSortBy] = useState("goles");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const ITEMS_PER_PAGE = 15;

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: ITEMS_PER_PAGE,
        sort: sortBy,
      };
      if (selectedClub !== "Todos") params.club = selectedClub;
      if (selectedPosition !== "Todas") params.posicion = selectedPosition;
      if (searchQuery.trim()) params.nombre = searchQuery.trim();

      const res = await scoutingApi.list(params);
      setPlayers(res.data || []);
      setTotalPages(res.totalPages || 1);
      if (res.stats) setStats(res.stats);
      if (res.clubs) setClubs(res.clubs);
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedClub, selectedPosition, searchQuery]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleScoutingRun = async () => {
    setScoutingLoading(true);
    try {
      await scoutingApi.run();
      await fetchPlayers();
    } finally {
      setScoutingLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await scoutingApi.search(searchQuery.trim());
      setPlayers(res.data || []);
      setTotalPages(1);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-premium-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-neon-red" />
            <h1 className="text-3xl font-bold text-white">Scouting IA</h1>
          </div>
          <p className="text-white-dim text-lg">
            Busqueda automatica de jugadores de Division A
          </p>
          <div className="mt-3 h-0.5 w-24 bg-neon-red neon-divider" />
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-neon-red" />
              <span className="stat-label text-white-dim text-sm uppercase tracking-wider">
                Total jugadores scouteados
              </span>
            </div>
            <span className="stat-value text-2xl font-bold text-white">
              {stats.total_jugadores}
            </span>
          </div>
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-neon-red" />
              <span className="stat-label text-white-dim text-sm uppercase tracking-wider">
                Clubes encontrados
              </span>
            </div>
            <span className="stat-value text-2xl font-bold text-white">
              {stats.clubes_encontrados}
            </span>
          </div>
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-5 h-5 text-neon-red" />
              <span className="stat-label text-white-dim text-sm uppercase tracking-wider">
                Ultima actualizacion
              </span>
            </div>
            <span className="stat-value text-lg font-bold text-white">
              {formatDate(stats.ultima_actualizacion)}
            </span>
          </div>
        </motion.div>

        {/* Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 mb-6"
        >
          <button
            onClick={handleScoutingRun}
            disabled={scoutingLoading}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-neon-red hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {scoutingLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {scoutingLoading ? "Ejecutando..." : "Ejecutar Scouting"}
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar Jugador..."
                className="input-premium w-full pl-10 pr-4 py-2.5 bg-premium-dark border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 bg-premium-dark border border-premium-gray hover:border-neon-red text-white font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {searchLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Buscar
            </button>
          </div>

          <div className="badge badge-neon px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-neon-red text-neon-red rounded-full">
            Division A
          </div>
        </motion.div>

        {/* Filters Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl border border-premium-gray bg-premium-dark"
        >
          <Filter className="w-4 h-4 text-neon-red" />

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white-dim" />
            <select
              value={selectedClub}
              onChange={(e) => {
                setSelectedClub(e.target.value);
                setPage(1);
              }}
              className="bg-premium-black border border-premium-gray text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-red transition-colors"
            >
              <option value="Todos">Todos los clubes</option>
              {clubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-white-dim" />
            <select
              value={selectedPosition}
              onChange={(e) => {
                setSelectedPosition(e.target.value);
                setPage(1);
              }}
              className="bg-premium-black border border-premium-gray text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-red transition-colors"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos === "Todas" ? "Todas las posiciones" : pos}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-white-dim" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-premium-black border border-premium-gray text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-red transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Ordenar por {opt.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Players Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-premium-gray bg-premium-dark overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neon-red" />
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white-dim">
              <Users className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-xl font-medium">No se encontraron jugadores</p>
              <p className="text-sm mt-2">
                Ejecuta un scouting o ajusta los filtros de busqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-premium-gray">
                    <th className="text-left py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Nombre
                    </th>
                    <th className="text-left py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Club
                    </th>
                    <th className="text-left py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Posicion
                    </th>
                    <th className="text-center py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Edad
                    </th>
                    <th className="text-center py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Goles
                    </th>
                    <th className="text-center py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Asistencias
                    </th>
                    <th className="text-center py-4 px-4 text-white-dim text-xs uppercase tracking-wider font-medium">
                      Partidos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="border-b border-premium-gray/50 hover:bg-premium-black/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="text-white font-medium">
                          {player.nombre}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-white-dim">{player.club}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`badge text-xs px-2.5 py-0.5 rounded-full ${
                            player.posicion === "Cierre"
                              ? "badge-blue"
                              : player.posicion === "Ala"
                                ? "badge-green"
                                : player.posicion === "Pivot"
                                  ? "badge-yellow"
                                  : "badge-neon"
                          }`}
                        >
                          {player.posicion}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-white">
                        {player.edad}
                      </td>
                      <td className="py-3.5 px-4 text-center text-white font-semibold">
                        {player.goles}
                      </td>
                      <td className="py-3.5 px-4 text-center text-white font-semibold">
                        {player.asistencias}
                      </td>
                      <td className="py-3.5 px-4 text-center text-white">
                        {player.partidos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && players.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-premium-gray">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-premium-black border border-premium-gray text-white-dim hover:text-white hover:border-neon-red transition-all disabled:opacity-30 text-sm"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (p >= page - 1 && p <= page + 1) return true;
                  return false;
                })
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-white-dim">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        page === p
                          ? "bg-neon-red text-white font-semibold"
                          : "bg-premium-black border border-premium-gray text-white-dim hover:text-white hover:border-neon-red"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-premium-black border border-premium-gray text-white-dim hover:text-white hover:border-neon-red transition-all disabled:opacity-30 text-sm"
              >
                Siguiente
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-premium-gray bg-premium-dark shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-premium-gray">
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-premium-black border border-premium-gray text-white-dim hover:text-white hover:border-neon-red transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-premium-black border border-premium-gray flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-neon-red" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedPlayer.nombre}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Trophy className="w-3.5 h-3.5 text-white-dim" />
                      <span className="text-white-dim text-sm">
                        {selectedPlayer.club}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`badge text-xs px-3 py-1 rounded-full ${
                      selectedPlayer.posicion === "Cierre"
                        ? "badge-blue"
                        : selectedPlayer.posicion === "Ala"
                          ? "badge-green"
                          : selectedPlayer.posicion === "Pivot"
                            ? "badge-yellow"
                            : "badge-neon"
                    }`}
                  >
                    {selectedPlayer.posicion}
                  </span>
                  <span className="badge px-3 py-1 text-xs rounded-full border border-premium-gray text-white-dim">
                    {selectedPlayer.edad} anos
                  </span>
                  {selectedPlayer.nacionalidad && (
                    <span className="badge px-3 py-1 text-xs rounded-full border border-premium-gray text-white-dim flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {selectedPlayer.nacionalidad}
                    </span>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-premium-black border border-premium-gray text-center">
                    <div className="stat-value text-xl font-bold text-neon-red">
                      {selectedPlayer.goles}
                    </div>
                    <div className="stat-label text-xs text-white-dim uppercase tracking-wider mt-1">
                      Goles
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-premium-black border border-premium-gray text-center">
                    <div className="stat-value text-xl font-bold text-neon-red">
                      {selectedPlayer.asistencias}
                    </div>
                    <div className="stat-label text-xs text-white-dim uppercase tracking-wider mt-1">
                      Asistencias
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-premium-black border border-premium-gray text-center">
                    <div className="stat-value text-xl font-bold text-neon-red">
                      {selectedPlayer.partidos}
                    </div>
                    <div className="stat-label text-xs text-white-dim uppercase tracking-wider mt-1">
                      Partidos
                    </div>
                  </div>
                </div>

                {/* Extra info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Ultimo partido</span>
                    <span className="text-white">
                      {selectedPlayer.ultimo_partido
                        ? formatDate(selectedPlayer.ultimo_partido)
                        : "---"}
                    </span>
                  </div>
                  {selectedPlayer.source_url && (
                    <div className="flex justify-between py-2 border-b border-premium-gray/50 items-center">
                      <span className="text-white-dim">Fuente</span>
                      <span className="text-white text-xs truncate max-w-[200px]">
                        {selectedPlayer.source_url}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedPlayer.source_url && (
                  <a
                    href={selectedPlayer.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-2 w-full py-3 bg-neon-red hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en AFA
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
