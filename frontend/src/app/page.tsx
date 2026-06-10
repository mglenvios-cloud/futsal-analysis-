"use client";

import Link from "next/link";
import {
  Zap, Activity, Heart, Swords, Search, TrendingUp,
  Users, BarChart3, Video, FileText, ChevronRight, ArrowUpRight,
  Menu, X, Github, Twitter, Instagram, Sparkles, Shield, Check,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  {
    icon: Video, title: "Analisis de Video", color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/25",
    desc: "Procesa partidos con deteccion automatica de jugadores, pases, tiros y acciones.",
    href: "/analysis/video",
  },
  {
    icon: Activity, title: "Analisis Fisico", color: "from-emerald-400 to-green-500", shadow: "shadow-emerald-400/25",
    desc: "Velocidad, distancia, sprints y mapas de calor en tiempo real.",
    href: "/analysis/physical",
  },
  {
    icon: Heart, title: "Monitoreo Cardiaco", color: "from-red-500 to-rose-600", shadow: "shadow-red-500/25",
    desc: "Frecuencia cardiaca en vivo con alertas y reportes personalizados.",
    href: "/analysis/cardiac",
  },
  {
    icon: Swords, title: "Analisis Tactico", color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/25",
    desc: "Diagramas, formaciones, patrones y deteccion de jugadas clave.",
    href: "/analysis/tactical",
  },
  {
    icon: Search, title: "Scouting IA", color: "from-blue-400 to-cyan-500", shadow: "shadow-blue-400/25",
    desc: "Busqueda inteligente de talentos con analisis predictivo.",
    href: "/scouting",
  },
  {
    icon: TrendingUp, title: "Predicciones", color: "from-amber-400 to-orange-500", shadow: "shadow-amber-400/25",
    desc: "Modelos predictivos para rendimiento y proyecciones de jugadores.",
    href: "/dashboard/rankings",
  },
];

const STATS = [
  { value: "1", label: "Division", sub: "Division A" },
  { value: "0", label: "Jugadores", sub: "Registrados" },
  { value: "0", label: "Equipos", sub: "Activos" },
  { value: "0", label: "Partidos", sub: "Analizados" },
];

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/players", label: "Jugadores" },
  { href: "/teams", label: "Equipos" },
  { href: "/matches", label: "Partidos" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Futsal <span className="text-rose-400">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="px-3 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors">Acceder</Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-200 active:scale-[0.97]">
              Dashboard
              <ArrowUpRight size={16} />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl">
            <div className="px-4 py-3 space-y-1">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-gradient-to-br from-rose-500/20 to-pink-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-600/10 border border-rose-500/30 text-rose-400 text-xs font-medium mb-6">
              <Sparkles size={14} />
              Plataforma Profesional de Analisis
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[0.9]">
              Analisis
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">Inteligente</span>
              <br />
              para Futsal
            </h1>

            <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
              Video, fisico, tactico, cardiaco, scouting IA y predicciones.
              Todo integrado para equipos profesionales.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:from-rose-600 hover:to-pink-700 transition-all duration-200 active:scale-[0.97]">
                Ir al Dashboard
                <ArrowUpRight size={20} />
              </Link>
              <Link href="/players" className="inline-flex items-center gap-2 bg-white/5 text-white text-lg font-medium px-8 py-4 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                <Users size={20} />
                Ver Jugadores
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 mt-16">
              {[
                { icon: Activity, label: "Fisico", color: "text-emerald-400" },
                { icon: Heart, label: "Cardiaco", color: "text-rose-400" },
                { icon: Swords, label: "Tactico", color: "text-violet-400" },
                { icon: Search, label: "Scouting", color: "text-blue-400" },
                { icon: TrendingUp, label: "Prediccion", color: "text-amber-400" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                    <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold font-mono bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-white/40 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xs text-white/20 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Todo en <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">uno</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">
              Analisis completo para futsal profesional en seis modulos integrados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href}
                className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {f.title}
                  </h3>
                  <p className="text-white/40 leading-relaxed text-sm">
                    {f.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/20 via-pink-600/10 to-transparent border border-rose-500/20 p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-blue-500/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px]" />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/30">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Comenza hoy
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-8 text-lg">
                    Gestiona jugadores, equipos, partidos y obtene reportes con IA.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl shadow-rose-500/30 hover:from-rose-600 hover:to-pink-700 transition-all active:scale-[0.97]">
                  Ir al Dashboard
                  <ArrowUpRight size={20} />
                </Link>
                <Link href="/players" className="inline-flex items-center gap-2 bg-white/5 text-white px-8 py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <Users size={20} />
                  Ver Jugadores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">Futsal <span className="text-rose-400">AI</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</Link>
              <Link href="/players" className="hover:text-white/60 transition-colors">Jugadores</Link>
              <Link href="/teams" className="hover:text-white/60 transition-colors">Equipos</Link>
              <Link href="/reports" className="hover:text-white/60 transition-colors">Reportes</Link>
            </div>
            <div className="flex items-center gap-3 text-white/20">
              <Github size={16} className="hover:text-white/50 transition-colors cursor-pointer" />
              <Twitter size={16} className="hover:text-white/50 transition-colors cursor-pointer" />
              <Instagram size={16} className="hover:text-white/50 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-white/20">
            &copy; {new Date().getFullYear()} Futsal AI
          </div>
        </div>
      </footer>
    </div>
  );
}
