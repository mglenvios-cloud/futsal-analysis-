"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  UserCheck,
  Zap,
  X,
  Loader2,
} from "lucide-react";
import { playersApi, teamsApi } from "@/lib/api";

interface PlayerWithStats {
  id: number;
  unique_id: string;
  name: string;
  surname: string;
  age?: number;
  position?: string;
  height?: number;
  weight?: number;
  dominant_foot?: string;
  jersey_number?: number;
  team_id?: number;
  team_name?: string;
  category?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  goals?: number;
  assists?: number;
  rating?: number;
}

interface Team {
  id: number;
  name: string;
  short_name?: string;
}

const POSITIONS = ["Todas", "Cierre", "Ala", "Pivot", "Universal"];

const POSITION_COLORS: Record<string, string> = {
  Cierre: "badge-blue",
  Ala: "badge-green",
  Pivot: "badge-neon",
  Universal: "badge-yellow",
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("Todas");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    date_of_birth: "",
    position: "Ala",
    height: "",
    weight: "",
    dominant_foot: "Diestro",
    jersey_number: "",
    team_id: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [playersRes, teamsRes] = await Promise.all([
          playersApi.list({ page_size: 100 }),
          teamsApi.list({ page_size: 50 }),
        ]);
        setPlayers(playersRes.data.items || playersRes.data || []);
        setTeams(teamsRes.data.items || teamsRes.data || []);
      } catch {
        setPlayers([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPlayers = players.filter((p) => {
    const fullName = `${p.name} ${p.surname}`.toLowerCase();
    const matchesSearch = !searchQuery.trim() || fullName.includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === "Todas" || p.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const stats = {
    total: players.length,
    positions: new Set(players.map((p) => p.position).filter(Boolean)).size,
    teams: new Set(players.map((p) => p.team_name).filter(Boolean)).size,
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        surname: formData.surname,
        position: formData.position,
        dominant_foot: formData.dominant_foot,
      };
      if (formData.date_of_birth) payload.date_of_birth = formData.date_of_birth;
      if (formData.height) payload.height = parseFloat(formData.height);
      if (formData.weight) payload.weight = parseFloat(formData.weight);
      if (formData.jersey_number) payload.jersey_number = parseInt(formData.jersey_number);
      if (formData.team_id) payload.team_id = parseInt(formData.team_id);

      await playersApi.create(payload);
      const res = await playersApi.list({ page_size: 100 });
      setPlayers(res.data.items || res.data || []);
      setShowCreateModal(false);
      setFormData({
        name: "",
        surname: "",
        date_of_birth: "",
        position: "Ala",
        height: "",
        weight: "",
        dominant_foot: "Diestro",
        jersey_number: "",
        team_id: "",
      });
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await playersApi.delete(id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch {}
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
            <UserCheck className="w-8 h-8 text-neon-red" />
            <h1 className="text-3xl font-bold text-white">Jugadores</h1>
          </div>
          <p className="text-white-dim text-lg">
            Gestion de jugadores de Division A
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
              <span className="text-white-dim text-sm uppercase tracking-wider">
                Total jugadores
              </span>
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <Filter className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm uppercase tracking-wider">
                Posiciones disponibles
              </span>
            </div>
            <span className="text-2xl font-bold text-white">{stats.positions}</span>
          </div>
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm uppercase tracking-wider">
                Equipos representados
              </span>
            </div>
            <span className="text-2xl font-bold text-white">{stats.teams}</span>
          </div>
        </motion.div>

        {/* Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 mb-6"
        >
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jugador..."
              className="input-premium w-full pl-10 pr-4 py-2.5 bg-premium-dark border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white-dim" />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="bg-premium-black border border-premium-gray text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neon-red transition-colors"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos === "Todas" ? "Todas las posiciones" : pos}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-neon-red hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Jugador
          </button>
        </motion.div>

        {/* Players Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neon-red" />
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white-dim">
              <Users className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-xl font-medium">No hay jugadores registrados</p>
              <p className="text-sm mt-2">
                Agrega un nuevo jugador o ajusta los filtros de busqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => setSelectedPlayer(player)}
                  className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark hover:border-neon-red/50 cursor-pointer transition-all duration-300 group"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-premium-black border border-premium-gray flex items-center justify-center group-hover:border-neon-red/50 transition-colors">
                      <span className="text-lg font-bold text-neon-red">
                        {player.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {player.name} {player.surname}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`badge text-xs px-2 py-0.5 rounded-full ${
                            POSITION_COLORS[player.position || ""] || "badge"
                          }`}
                        >
                          {player.position || "---"}
                        </span>
                        {player.jersey_number && (
                          <span className="text-xs text-white-dim">
                            #{player.jersey_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team & Age */}
                  <div className="space-y-1.5 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white-dim">Equipo</span>
                      <span className="text-white">{player.team_name || "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white-dim">Edad</span>
                      <span className="text-white">{player.age ?? "---"}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-premium-gray">
                    <div className="text-center">
                      <p className="text-sm font-bold text-neon-red">{player.goals ?? 0}</p>
                      <p className="text-xs text-white-dim">Goles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-accent-green">{player.assists ?? 0}</p>
                      <p className="text-xs text-white-dim">Asist.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-accent-yellow">{player.rating ?? "---"}</p>
                      <p className="text-xs text-white-dim">Rating</p>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              <div className="relative p-6 pb-4 border-b border-premium-gray">
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-premium-black border border-premium-gray text-white-dim hover:text-white hover:border-neon-red transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-premium-black border border-premium-gray flex items-center justify-center">
                    <span className="text-2xl font-bold text-neon-red">
                      {selectedPlayer.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedPlayer.name} {selectedPlayer.surname}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`badge text-xs px-2.5 py-0.5 rounded-full ${
                          POSITION_COLORS[selectedPlayer.position || ""] || "badge"
                        }`}
                      >
                        {selectedPlayer.position || "---"}
                      </span>
                      {selectedPlayer.team_name && (
                        <span className="text-white-dim text-sm">{selectedPlayer.team_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-premium-black border border-premium-gray text-center">
                    <p className="text-xl font-bold text-neon-red">{selectedPlayer.goals ?? 0}</p>
                    <p className="text-xs text-white-dim uppercase tracking-wider mt-1">Goles</p>
                  </div>
                  <div className="p-3 rounded-xl bg-premium-black border border-premium-gray text-center">
                    <p className="text-xl font-bold text-accent-green">{selectedPlayer.assists ?? 0}</p>
                    <p className="text-xs text-white-dim uppercase tracking-wider mt-1">Asistencias</p>
                  </div>
                  <div className="p-3 rounded-xl bg-premium-black border border-premium-gray text-center">
                    <p className="text-xl font-bold text-accent-yellow">{selectedPlayer.rating ?? "---"}</p>
                    <p className="text-xs text-white-dim uppercase tracking-wider mt-1">Rating</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Edad</span>
                    <span className="text-white">{selectedPlayer.age ?? "---"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Altura</span>
                    <span className="text-white">{selectedPlayer.height ? `${selectedPlayer.height} cm` : "---"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Peso</span>
                    <span className="text-white">{selectedPlayer.weight ? `${selectedPlayer.weight} kg` : "---"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Pie dominante</span>
                    <span className="text-white">{selectedPlayer.dominant_foot || "---"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Camiseta</span>
                    <span className="text-white">#{selectedPlayer.jersey_number || "---"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-premium-gray/50">
                    <span className="text-white-dim">Equipo</span>
                    <span className="text-white">{selectedPlayer.team_name || "---"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(selectedPlayer.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-premium-gray text-white-dim hover:text-neon-red hover:border-neon-red transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Player Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !creating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-premium-gray bg-premium-dark shadow-2xl overflow-hidden"
            >
              <div className="relative p-6 pb-4 border-b border-premium-gray">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-premium-black border border-premium-gray text-white-dim hover:text-white hover:border-neon-red transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-neon-red" />
                  <h2 className="text-xl font-bold text-white">Nuevo Jugador</h2>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-white-dim">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-white-dim">Apellido</label>
                    <input
                      type="text"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Posicion</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white focus:outline-none focus:border-neon-red transition-colors"
                  >
                    <option value="Cierre">Cierre</option>
                    <option value="Ala">Ala</option>
                    <option value="Pivot">Pivot</option>
                    <option value="Universal">Universal</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-white-dim">Altura (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-white-dim">Peso (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Pie Dominante</label>
                  <select
                    value={formData.dominant_foot}
                    onChange={(e) => setFormData({ ...formData, dominant_foot: e.target.value })}
                    className="w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white focus:outline-none focus:border-neon-red transition-colors"
                  >
                    <option value="Diestro">Diestro</option>
                    <option value="Zurdo">Zurdo</option>
                    <option value="Ambidiestro">Ambidiestro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Numero de Camiseta</label>
                  <input
                    type="number"
                    value={formData.jersey_number}
                    onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Equipo</label>
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white focus:outline-none focus:border-neon-red transition-colors"
                  >
                    <option value="">Sin equipo</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-premium-gray">
                <button
                  onClick={handleCreate}
                  disabled={creating || !formData.name || !formData.surname}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neon-red hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {creating ? "Creando..." : "Crear Jugador"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
