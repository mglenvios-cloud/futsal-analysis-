"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  Eye,
  Edit,
  Users,
  MapPin,
  Trophy,
  Calendar,
  Zap,
} from "lucide-react";
import { teamsApi } from "@/lib/api";

interface Team {
  id: number;
  name: string;
  short_name?: string;
  city?: string;
  coach?: string;
  founded_year?: number;
  logo_url?: string;
}

interface Player {
  id: number;
  unique_id: string;
  name: string;
  surname: string;
  position?: string;
  jersey_number?: number;
}

interface TeamPlayers {
  [teamId: number]: Player[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayers>({});
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    city: "",
    coach: "",
    founded_year: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await teamsApi.list({ page_size: 50 });
        setTeams(res.data.items || res.data || []);
      } catch {
        setTeams([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(q) ||
      (t.short_name && t.short_name.toLowerCase().includes(q)) ||
      (t.city && t.city.toLowerCase().includes(q)) ||
      (t.coach && t.coach.toLowerCase().includes(q))
    );
  });

  const handleToggleExpand = async (teamId: number) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      return;
    }
    setExpandedTeamId(teamId);
    if (!teamPlayers[teamId]) {
      setLoadingPlayers(true);
      try {
        const res = await teamsApi.players(teamId);
        setTeamPlayers((prev) => ({
          ...prev,
          [teamId]: res.data.items || res.data || [],
        }));
      } catch {
        setTeamPlayers((prev) => ({ ...prev, [teamId]: [] }));
      } finally {
        setLoadingPlayers(false);
      }
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
      };
      if (formData.short_name) payload.short_name = formData.short_name;
      if (formData.city) payload.city = formData.city;
      if (formData.coach) payload.coach = formData.coach;
      if (formData.founded_year) payload.founded_year = parseInt(formData.founded_year);

      await teamsApi.create(payload);
      const res = await teamsApi.list({ page_size: 50 });
      setTeams(res.data.items || res.data || []);
      setShowCreateModal(false);
      setFormData({ name: "", short_name: "", city: "", coach: "", founded_year: "" });
    } catch {
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-neon-red" />
            <h1 className="text-3xl font-bold text-white">Equipos Division A</h1>
          </div>
          <p className="text-white-dim text-lg">
            Gestion de equipos de futsal
          </p>
          <div className="mt-3 h-0.5 w-24 bg-neon-red neon-divider" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm uppercase tracking-wider">
                Total equipos
              </span>
            </div>
            <span className="text-2xl font-bold text-white">{teams.length}</span>
          </div>
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm uppercase tracking-wider">
                Ciudades representadas
              </span>
            </div>
            <span className="text-2xl font-bold text-white">
              {new Set(teams.map((t) => t.city).filter(Boolean)).size}
            </span>
          </div>
          <div className="card-premium p-5 rounded-xl border border-premium-gray bg-premium-dark">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm uppercase tracking-wider">
                Temporada activa
              </span>
            </div>
            <span className="text-2xl font-bold text-white">2024/25</span>
          </div>
        </motion.div>

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
              placeholder="Buscar equipo..."
              className="input-premium w-full pl-10 pr-4 py-2.5 bg-premium-dark border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-neon-red hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Equipo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white-dim">
              <Building2 className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-xl font-medium">No hay equipos registrados</p>
              <p className="text-sm mt-2">
                {searchQuery
                  ? "No se encontraron equipos con ese criterio de busqueda"
                  : "Crea un nuevo equipo para comenzar"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="card-premium rounded-xl border border-premium-gray bg-premium-dark overflow-hidden"
                >
                  <div
                    onClick={() => handleToggleExpand(team.id)}
                    className="p-5 cursor-pointer hover:border-neon-red/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-premium-black border border-premium-gray flex items-center justify-center shrink-0 group-hover:border-neon-red/50 transition-colors">
                        <Building2 className="w-7 h-7 text-neon-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white truncate">
                            {team.name}
                          </h3>
                          {team.short_name && (
                            <span className="badge badge-neon text-xs px-2 py-0.5 rounded-full shrink-0">
                              {team.short_name}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                          {team.city && (
                            <div className="flex items-center gap-1.5 text-white-dim">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{team.city}</span>
                            </div>
                          )}
                          {team.coach && (
                            <div className="flex items-center gap-1.5 text-white-dim">
                              <Users className="w-3.5 h-3.5" />
                              <span>{team.coach}</span>
                            </div>
                          )}
                          {team.founded_year && (
                            <div className="flex items-center gap-1.5 text-white-dim">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Fundado {team.founded_year}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleExpand(team.id);
                        }}
                        className="btn-secondary p-2 rounded-lg border border-premium-gray text-white-dim hover:text-white hover:border-neon-red transition-all shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable players section */}
                  <AnimatePresence initial={false}>
                    {expandedTeamId === team.id && (
                      <motion.div
                        key="players"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-premium-gray"
                      >
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-neon-red" />
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                              Jugadores
                            </h4>
                          </div>
                          {loadingPlayers ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-6 h-6 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (teamPlayers[team.id] || []).length === 0 ? (
                            <p className="text-sm text-white-dim text-center py-6">
                              No hay jugadores en este equipo
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-premium-gray">
                                    <th className="text-left py-2 pr-4 text-white-dim font-medium">Nombre</th>
                                    <th className="text-left py-2 pr-4 text-white-dim font-medium">Posicion</th>
                                    <th className="text-left py-2 text-white-dim font-medium">Camiseta</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(teamPlayers[team.id] || []).map((player) => (
                                    <tr
                                      key={player.id}
                                      className="border-b border-premium-gray/50 hover:bg-premium-black/50 transition-colors"
                                    >
                                      <td className="py-2.5 pr-4 text-white">
                                        {player.name} {player.surname}
                                      </td>
                                      <td className="py-2.5 pr-4">
                                        {player.position ? (
                                          <span
                                            className={`badge text-xs px-2 py-0.5 rounded-full ${
                                              player.position === "Cierre"
                                                ? "badge-blue"
                                                : player.position === "Ala"
                                                ? "badge-green"
                                                : player.position === "Pivot"
                                                ? "badge-neon"
                                                : "badge"
                                            }`}
                                          >
                                            {player.position}
                                          </span>
                                        ) : (
                                          <span className="text-white-dim">---</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 text-white-dim">
                                        {player.jersey_number ? (
                                          <span className="font-mono text-white">#{player.jersey_number}</span>
                                        ) : (
                                          "---"
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Team Modal */}
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-neon-red" />
                  <h2 className="text-xl font-bold text-white">Nuevo Equipo</h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Nombre del equipo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Los Angeles Futsal Club"
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Nombre corto</label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="Ej: LAFC"
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ej: Buenos Aires"
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Director tecnico</label>
                  <input
                    type="text"
                    value={formData.coach}
                    onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                    placeholder="Ej: Carlos Perez"
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white-dim">Ano de fundacion</label>
                  <input
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                    placeholder="Ej: 2010"
                    className="input-premium w-full px-3 py-2 bg-premium-black border border-premium-gray rounded-lg text-white placeholder-white-dim focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-premium-gray">
                <button
                  onClick={handleCreate}
                  disabled={creating || !formData.name}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neon-red hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {creating ? "Creando..." : "Crear Equipo"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
