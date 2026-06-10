"use client";

import Link from "next/link";
import { Zap, Activity, Heart, Swords, Search, TrendingUp, Users, Video, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { icon: Video, title: "Video", desc: "Procesamiento automatico de partidos", color: "from-fuchsia-500 to-pink-600", href: "/analysis/video" },
  { icon: Activity, title: "Fisico", desc: "Velocidad, sprints y mapas de calor", color: "from-emerald-400 to-teal-500", href: "/analysis/physical" },
  { icon: Heart, title: "Cardiaco", desc: "Monitoreo en tiempo real", color: "from-rose-500 to-red-600", href: "/analysis/cardiac" },
  { icon: Swords, title: "Tactico", desc: "Diagramas y patrones de juego", color: "from-violet-500 to-purple-600", href: "/analysis/tactical" },
  { icon: Search, title: "Scouting", desc: "Busqueda de talentos con IA", color: "from-sky-400 to-blue-600", href: "/scouting" },
  { icon: TrendingUp, title: "Predicciones", desc: "Proyecciones de rendimiento", color: "from-amber-400 to-orange-600", href: "/dashboard/rankings" },
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
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">FUTSAL AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:from-fuchsia-600 hover:to-pink-700 transition-all shadow-lg shadow-fuchsia-500/25">
              Dashboard
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 text-zinc-400 hover:text-white">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a] px-4 py-2">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-zinc-400 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-medium mb-6">
            <Sparkles size={12} />
            Plataforma Profesional
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[0.9]">
            Analisis
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">Inteligente</span>
            <br />
            para Futsal
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-8">
            Video, fisico, tactico, cardiaco, scouting y predicciones para equipos profesionales.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard" className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-2xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all inline-flex items-center gap-2">
              Ir al Dashboard
              <ArrowRight size={18} />
            </Link>
            <Link href="/players" className="bg-white/5 text-white px-7 py-3.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all inline-flex items-center gap-2">
              <Users size={18} />
              Jugadores
            </Link>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black text-white">Modulos</h2>
            <p className="text-zinc-500 mt-2">Seis areas de analisis integradas</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href} className="group bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.06] transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon size={18} className="text-white" />
                </div>
                <h3 className="text-white text-sm font-bold">{f.title}</h3>
                <p className="text-zinc-500 text-xs mt-1">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-16 bg-gradient-to-b from-fuchsia-500/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2">Comienza hoy</h2>
              <p className="text-zinc-500 mb-6">Gestiona jugadores, equipos y partidos con IA.</p>
              <div className="flex gap-3">
                <Link href="/dashboard" className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-fuchsia-500/30 transition-all">
                  Dashboard
                  <ArrowRight size={16} />
                </Link>
                <Link href="/players" className="bg-white/5 text-white px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  Jugadores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-zinc-600">
          Futsal AI &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
