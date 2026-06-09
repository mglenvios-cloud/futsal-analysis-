"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Swords, Clock, MapPin, Eye, Video, TrendingUp, Zap, Loader2 } from "lucide-react"
import matchesApi from "@/lib/api"

const statusConfig = {
  scheduled: { label: "Programado", color: "badge-yellow" },
  live: { label: "En Vivo", color: "badge-neon" },
  completed: { label: "Finalizado", color: "badge-blue" },
  cancelled: { label: "Cancelado", color: "badge" },
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const data = await matchesApi.getAll()
        setMatches(data)
      } catch {
        setMatches([])
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter)

  const totalMatches = matches.length
  const topScoringTeam = [...matches]
    .filter((m) => m.status === "completed")
    .reduce((acc, m) => {
      acc[m.homeTeam] = (acc[m.homeTeam] || 0) + (m.homeScore || 0)
      acc[m.awayTeam] = (acc[m.awayTeam] || 0) + (m.awayScore || 0)
      return acc
    }, {})
  const bestTeam = Object.entries(topScoringTeam).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="min-h-screen bg-premium-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Swords className="w-8 h-8 text-neon-red" />
          <h1 className="text-3xl font-bold text-white">Partidos Division A</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-premium p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm">Total Partidos</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalMatches}</p>
          </div>
          <div className="card-premium p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm">Equipo con mas goles</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {bestTeam ? `${bestTeam[0]} (${bestTeam[1]})` : "—"}
            </p>
          </div>
          <div className="card-premium p-5">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-neon-red" />
              <span className="text-white-dim text-sm">En vivo ahora</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {matches.filter((m) => m.status === "live").length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "scheduled", "live", "completed", "cancelled"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`btn-secondary text-sm ${
                filter === key ? "bg-premium-dark border-neon-red text-neon-red" : ""
              }`}
            >
              {key === "all" ? "Todos" : statusConfig[key].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-neon-red animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Swords className="w-12 h-12 text-white-dim mx-auto mb-4" />
            <p className="text-white-dim text-lg">No hay partidos disponibles</p>
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
                        <span className="text-white-dim text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {match.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-2xl font-bold text-white">{match.homeTeam}</span>
                        <span className="text-lg font-bold text-white-dim">vs</span>
                        <span className="text-2xl font-bold text-white">{match.awayTeam}</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-4xl font-bold text-neon-red">
                        {match.homeScore ?? "—"} <span className="text-white-dim text-2xl">-</span> {match.awayScore ?? "—"}
                      </p>
                      <p className="text-white-dim text-sm mt-1 flex items-center gap-1 justify-end">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.venue}
                      </p>
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
                          <h3 className="text-sm font-semibold text-white-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Video className="w-4 h-4 text-neon-red" />
                            Timeline de eventos
                          </h3>
                          {match.events?.length > 0 ? (
                            <div className="space-y-2">
                              {match.events.map((ev, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                  <span className="text-neon-red font-mono w-10 text-right">{ev.minute}&apos;</span>
                                  <span className="w-2 h-2 rounded-full bg-premium-gray" />
                                  <span className={ev.type === "goal" ? "text-green-400" : ev.type === "red" ? "text-red-500" : "text-white-dim"}>
                                    {ev.player} {ev.type === "goal" && `⚽${ev.detail ? ` (${ev.detail})` : ""}`}
                                    {ev.type === "yellow" && " 🟨"}
                                    {ev.type === "red" && " 🟥"}
                                    {ev.type === "sub" && " 🔄"}
                                    {ev.type === "var" && " 📺"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white-dim text-sm">No hay eventos registrados</p>
                          )}
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-white-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-neon-red" />
                            Estadisticas
                          </h3>
                          <div className="space-y-3">
                            {match.statistics?.map((stat, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-sm text-white-dim mb-1">
                                  <span>{stat.home}</span>
                                  <span className="font-semibold text-white">{stat.label}</span>
                                  <span>{stat.away}</span>
                                </div>
                                <div className="relative h-2 bg-premium-dark rounded-full overflow-hidden">
                                  <div
                                    className="absolute left-0 top-0 h-full bg-neon-red rounded-full transition-all"
                                    style={{ width: `${stat.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="btn-primary text-sm flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Ver detalle
                          </button>
                          {match.videoUrl && (
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
    </div>
  )
}
