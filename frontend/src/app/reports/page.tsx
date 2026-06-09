"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, FileSpreadsheet, File, User, Building2, Swords, ChevronDown, Search, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { reportsApi, playersApi, teamsApi, matchesApi } from "@/lib/api";

export default function ReportsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [matchSearch, setMatchSearch] = useState("");
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});
  const [successFeedback, setSuccessFeedback] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    playersApi.list()
      .then((res) => setPlayers(res.data))
      .catch(() => {})
      .finally(() => setLoadingPlayers(false));
  }, []);

  useEffect(() => {
    teamsApi.list()
      .then((res) => setTeams(res.data))
      .catch(() => {})
      .finally(() => setLoadingTeams(false));
  }, []);

  useEffect(() => {
    matchesApi.list()
      .then((res) => setMatches(res.data))
      .catch(() => {})
      .finally(() => setLoadingMatches(false));
  }, []);

  const triggerDownload = async (key: string, apiCall: () => Promise<any>, filename: string) => {
    setDownloading((prev) => ({ ...prev, [key]: true }));
    setSuccessFeedback((prev) => ({ ...prev, [key]: false }));
    try {
      const response = await apiCall();
      const blob = new Blob([response.data], { type: response.headers?.["content-type"] || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setSuccessFeedback((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSuccessFeedback((prev) => ({ ...prev, [key]: false })), 2500);
    } catch {
      setSuccessFeedback((prev) => ({ ...prev, [key]: false }));
    } finally {
      setDownloading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const filteredPlayers = players.filter((p) =>
    `${p.name || ""} ${p.lastName || ""}`.toLowerCase().includes(playerSearch.toLowerCase())
  );
  const filteredTeams = teams.filter((t) =>
    (t.name || "").toLowerCase().includes(teamSearch.toLowerCase())
  );
  const filteredMatches = matches.filter((m) =>
    `${m.localTeam?.name || ""} vs ${m.visitorTeam?.name || ""}`.toLowerCase().includes(matchSearch.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-premium-black">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-neon-red" />
              <h1 className="text-3xl font-bold text-white">Reportes</h1>
            </div>
            <p className="text-white-dim text-sm">Exportacion de reportes en PDF, Excel y CSV</p>
            <div className="mt-4 h-0.5 w-24 bg-neon-red neon-divider" />
          </motion.div>

          <motion.div variants={item} className="card-premium rounded-xl border border-premium-gray bg-premium-dark p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-neon-red" />
              <h2 className="text-lg font-semibold text-white">Reporte de Jugador</h2>
            </div>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white-dim" />
              <input
                type="text"
                placeholder="Buscar jugador..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full rounded-lg border border-premium-gray bg-premium-black py-2.5 pl-10 pr-4 text-sm text-white placeholder-white-dim focus:border-neon-red focus:outline-none"
              />
            </div>
            <div className="relative mb-5">
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full appearance-none rounded-lg border border-premium-gray bg-premium-black py-2.5 pl-4 pr-10 text-sm text-white focus:border-neon-red focus:outline-none"
              >
                <option value="">Seleccionar jugador</option>
                {filteredPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.lastName}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white-dim" />
            </div>
            {loadingPlayers ? (
              <div className="flex items-center gap-2 text-sm text-white-dim">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando jugadores...
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-premium-gray bg-premium-black p-4 text-sm text-white-dim">
                <AlertCircle className="h-4 w-4" />
                No se encontraron jugadores
              </div>
            ) : null}
            {selectedPlayer && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    triggerDownload(
                      `player-pdf-${selectedPlayer}`,
                      () => reportsApi.playerPdf(selectedPlayer),
                      `reporte-jugador-${selectedPlayer}.pdf`
                    )
                  }
                  disabled={downloading[`player-pdf-${selectedPlayer}`]}
                  className="btn-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {downloading[`player-pdf-${selectedPlayer}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : successFeedback[`player-pdf-${selectedPlayer}`] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  PDF
                  <Download className="ml-1 h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() =>
                    triggerDownload(
                      `player-xlsx-${selectedPlayer}`,
                      () => reportsApi.playerExcel(selectedPlayer),
                      `reporte-jugador-${selectedPlayer}.xlsx`
                    )
                  }
                  disabled={downloading[`player-xlsx-${selectedPlayer}`]}
                  className="btn-secondary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {downloading[`player-xlsx-${selectedPlayer}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : successFeedback[`player-xlsx-${selectedPlayer}`] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  Excel
                  <Download className="ml-1 h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() =>
                    triggerDownload(
                      `player-csv-${selectedPlayer}`,
                      () => reportsApi.playerCsv(selectedPlayer),
                      `reporte-jugador-${selectedPlayer}.csv`
                    )
                  }
                  disabled={downloading[`player-csv-${selectedPlayer}`]}
                  className="btn-secondary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {downloading[`player-csv-${selectedPlayer}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : successFeedback[`player-csv-${selectedPlayer}`] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  CSV
                  <Download className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="card-premium rounded-xl border border-premium-gray bg-premium-dark p-6">
            <div className="mb-5 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-neon-red" />
              <h2 className="text-lg font-semibold text-white">Reporte de Equipo</h2>
            </div>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white-dim" />
              <input
                type="text"
                placeholder="Buscar equipo..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full rounded-lg border border-premium-gray bg-premium-black py-2.5 pl-10 pr-4 text-sm text-white placeholder-white-dim focus:border-neon-red focus:outline-none"
              />
            </div>
            <div className="relative mb-5">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full appearance-none rounded-lg border border-premium-gray bg-premium-black py-2.5 pl-4 pr-10 text-sm text-white focus:border-neon-red focus:outline-none"
              >
                <option value="">Seleccionar equipo</option>
                {filteredTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white-dim" />
            </div>
            {loadingTeams ? (
              <div className="flex items-center gap-2 text-sm text-white-dim">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando equipos...
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-premium-gray bg-premium-black p-4 text-sm text-white-dim">
                <AlertCircle className="h-4 w-4" />
                No se encontraron equipos
              </div>
            ) : null}
            {selectedTeam && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    triggerDownload(
                      `team-pdf-${selectedTeam}`,
                      () => reportsApi.teamPdf(selectedTeam),
                      `reporte-equipo-${selectedTeam}.pdf`
                    )
                  }
                  disabled={downloading[`team-pdf-${selectedTeam}`]}
                  className="btn-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {downloading[`team-pdf-${selectedTeam}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : successFeedback[`team-pdf-${selectedTeam}`] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  PDF
                  <Download className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="card-premium rounded-xl border border-premium-gray bg-premium-dark p-6">
            <div className="mb-5 flex items-center gap-2">
              <Swords className="h-5 w-5 text-neon-red" />
              <h2 className="text-lg font-semibold text-white">Reporte de Partido</h2>
            </div>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white-dim" />
              <input
                type="text"
                placeholder="Buscar partido..."
                value={matchSearch}
                onChange={(e) => setMatchSearch(e.target.value)}
                className="w-full rounded-lg border border-premium-gray bg-premium-black py-2.5 pl-10 pr-4 text-sm text-white placeholder-white-dim focus:border-neon-red focus:outline-none"
              />
            </div>
            <div className="relative mb-5">
              <select
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="w-full appearance-none rounded-lg border border-premium-gray bg-premium-black py-2.5 pl-4 pr-10 text-sm text-white focus:border-neon-red focus:outline-none"
              >
                <option value="">Seleccionar partido</option>
                {filteredMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.localTeam?.name} vs {m.visitorTeam?.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white-dim" />
            </div>
            {loadingMatches ? (
              <div className="flex items-center gap-2 text-sm text-white-dim">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando partidos...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-premium-gray bg-premium-black p-4 text-sm text-white-dim">
                <AlertCircle className="h-4 w-4" />
                No se encontraron partidos
              </div>
            ) : null}
            {selectedMatch && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    triggerDownload(
                      `match-pdf-${selectedMatch}`,
                      () => reportsApi.matchPdf(selectedMatch),
                      `reporte-partido-${selectedMatch}.pdf`
                    )
                  }
                  disabled={downloading[`match-pdf-${selectedMatch}`]}
                  className="btn-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {downloading[`match-pdf-${selectedMatch}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : successFeedback[`match-pdf-${selectedMatch}`] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  PDF
                  <Download className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
