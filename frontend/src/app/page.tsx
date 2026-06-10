"use client";

import Link from "next/link";
import {
  Zap, Activity, Heart, Swords, Search, TrendingUp,
  Users, BarChart3, Video, FileText, ChevronRight,
  Shield, Award, Clock, ArrowUpRight, Sparkles,
  Menu, X, Github, Twitter, Instagram,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  {
    icon: Video,
    title: "Analisis de Video",
    desc: "Procesamiento automatico de partidos con deteccion de jugadores, pases, tiros y acciones de juego.",
    gradient: "from-neon-red/20 to-neon-red/5",
    border: "border-neon-red/20",
    iconColor: "text-neon-red",
    href: "/analysis/video",
  },
  {
    icon: Activity,
    title: "Analisis Fisico",
    desc: "Metricas de rendimiento fisico: velocidad, distancia recorrida, sprints, mapas de calor.",
    gradient: "from-accent-green/20 to-accent-green/5",
    border: "border-accent-green/20",
    iconColor: "text-accent-green",
    href: "/analysis/physical",
  },
  {
    icon: Heart,
    title: "Monitoreo Cardiaco",
    desc: "Monitoreo en tiempo real de frecuencia cardiaca con alertas y reportes personalizados.",
    gradient: "from-neon-red/20 to-neon-red/5",
    border: "border-neon-red/20",
    iconColor: "text-neon-red",
    href: "/analysis/cardiac",
  },
  {
    icon: Swords,
    title: "Analisis Tactico",
    desc: "Diagramas tacticos, formaciones, patrones de juego y deteccion de jugadas clave.",
    gradient: "from-accent-purple/20 to-accent-purple/5",
    border: "border-accent-purple/20",
    iconColor: "text-accent-purple",
    href: "/analysis/tactical",
  },
  {
    icon: Search,
    title: "Scouting IA",
    desc: "Busqueda inteligente de talentos con analisis predictivo y comparativas automaticas.",
    gradient: "from-accent-blue/20 to-accent-blue/5",
    border: "border-accent-blue/20",
    iconColor: "text-accent-blue",
    href: "/scouting",
  },
  {
    icon: TrendingUp,
    title: "Predicciones",
    desc: "Modelos predictivos para rendimiento de jugadores, resultados de partidos y proyecciones.",
    gradient: "from-accent-yellow/20 to-accent-yellow/5",
    border: "border-accent-yellow/20",
    iconColor: "text-accent-yellow",
    href: "/dashboard/rankings",
  },
];

const STATS = [
  { label: "Divisiones", value: "1", sub: "Division A" },
  { label: "Jugadores", value: "0", sub: "Registrados" },
  { label: "Equipos", value: "0", sub: "Activos" },
  { label: "Partidos", value: "0", sub: "Analizados" },
];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/players", label: "Jugadores" },
  { href: "/teams", label: "Equipos" },
  { href: "/matches", label: "Partidos" },
  { href: "/reports", label: "Reportes" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-premium-gray/40 bg-premium-black/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-neon-red/15 flex items-center justify-center group-hover:bg-neon-red/25 transition-colors">
              <Zap className="w-4 h-4 text-neon-red" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Futsal <span className="text-neon-red">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-white-dim/70 hover:text-white rounded-lg hover:bg-premium-gray/40 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white-dim/70 hover:text-white transition-colors"
            >
              Acceder
            </Link>
            <Link
              href="/dashboard"
              className="btn-primary text-sm !px-4 !py-2"
            >
              Dashboard
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-icon"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-premium-gray/40 bg-premium-black/95 backdrop-blur-2xl">
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-white-dim/70 hover:text-white rounded-lg hover:bg-premium-gray/40 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-red/[0.02] via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-neon-red/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-blue/[0.03] rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs font-medium mb-6 animate-fade-in">
              <Sparkles size={14} />
              Plataforma Profesional de Analisis
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Analisis Inteligente para{" "}
              <span className="text-gradient">Futsal</span>
            </h1>

            <p className="text-lg md:text-xl text-white-dim/40 max-w-2xl mx-auto mb-10 leading-relaxed">
              Plataforma todo-en-uno con analisis de video, fisico, tactico, 
              monitoreo cardiaco, scouting IA y predicciones para equipos profesionales.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="btn-primary text-base !px-8 !py-3.5 flex items-center gap-2 group"
              >
                Ir al Dashboard
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/players"
                className="btn-secondary text-base !px-8 !py-3.5 flex items-center gap-2"
              >
                <Users size={18} />
                Ver Jugadores
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-premium-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white font-mono mb-1">{stat.value}</p>
                <p className="text-sm text-white-dim/50 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xs text-white-dim/30 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-white-dim/40 max-w-2xl mx-auto">
              Seis modulos integrados para el analisis completo de rendimiento en futsal profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative overflow-hidden rounded-xl bg-premium-dark/60 border border-premium-gray/50 p-6 hover-lift-lg hover-glow-neon transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-premium-black/60 border ${feature.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={22} className={feature.iconColor} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-red transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white-dim/40 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-premium-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-premium-dark via-premium-dark to-premium-black border border-premium-gray/50 p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-red/[0.03] via-transparent to-accent-blue/[0.03]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-red/[0.03] rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-neon-red/10 border border-neon-red/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-neon-red" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Comenza a analizar tu equipo
              </h2>
              <p className="text-white-dim/40 max-w-lg mx-auto mb-8">
                Gestiona jugadores, equipos, partidos y obten reportes detallados con inteligencia artificial.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/dashboard"
                  className="btn-primary !px-8 !py-3 text-base"
                >
                  Ir al Dashboard
                </Link>
                <Link
                  href="/players"
                  className="btn-secondary !px-8 !py-3 text-base"
                >
                  Ver Jugadores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-premium-gray/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon-red/15 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-neon-red" />
              </div>
              <span className="font-bold text-white">Futsal <span className="text-neon-red">AI</span></span>
            </div>

            <div className="flex items-center gap-6 text-sm text-white-dim/30">
              <Link href="/dashboard" className="hover:text-white-dim/60 transition-colors">Dashboard</Link>
              <Link href="/players" className="hover:text-white-dim/60 transition-colors">Jugadores</Link>
              <Link href="/teams" className="hover:text-white-dim/60 transition-colors">Equipos</Link>
              <Link href="/reports" className="hover:text-white-dim/60 transition-colors">Reportes</Link>
            </div>

            <div className="flex items-center gap-3 text-white-dim/20">
              <Github size={16} className="hover:text-white-dim/50 transition-colors cursor-pointer" />
              <Twitter size={16} className="hover:text-white-dim/50 transition-colors cursor-pointer" />
              <Instagram size={16} className="hover:text-white-dim/50 transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-premium-gray/20 text-center text-xs text-white-dim/20">
            &copy; {new Date().getFullYear()} Futsal AI. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
