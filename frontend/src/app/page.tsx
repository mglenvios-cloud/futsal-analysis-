import Link from "next/link";
import { Zap, Activity, Heart, Video, Search, TrendingUp, Sword, Menu } from "lucide-react";

const modulos = [
  { href: "/analysis/video", icon: Video, label: "Video", desc: "Procesamiento autom\u00e1tico de partidos", color: "neon-red" },
  { href: "/analysis/physical", icon: Activity, label: "F\u00edsico", desc: "Velocidad, sprints y mapas de calor", color: "neon-red" },
  { href: "/analysis/cardiac", icon: Heart, label: "Card\u00edaco", desc: "Monitoreo en tiempo real", color: "neon-red" },
  { href: "/analysis/tactical", icon: Sword, label: "T\u00e1ctico", desc: "Diagramas y patrones de juego", color: "neon-red" },
  { href: "/scouting", icon: Search, label: "Scouting", desc: "B\u00fasqueda de talentos con IA", color: "neon-red" },
  { href: "/dashboard/rankings", icon: TrendingUp, label: "Predicciones", desc: "Proyecciones de rendimiento", color: "neon-red" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-premium-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-premium-black/90 backdrop-blur border-b border-premium-gray/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-red flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">FUTSAL AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Dashboard</Link>
            <Link href="/players" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Jugadores</Link>
            <Link href="/teams" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Equipos</Link>
            <Link href="/matches" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Partidos</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="bg-neon-red text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-neon-red/90 transition-all shadow-lg shadow-neon-red/25"
            >
              Dashboard
            </Link>
            <button className="md:hidden p-1.5 text-zinc-400 hover:text-white">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-red/10 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs font-medium mb-6">
            <Zap size={12} />
            Plataforma Profesional
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[0.9]">
            Análisis<br />
            <span className="text-neon-red">Inteligente</span><br />
            para Futsal
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-8">
            Video, físico, táctico, cardíaco, scouting y predicciones para equipos profesionales.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="bg-neon-red text-white font-bold px-7 py-3.5 rounded-xl shadow-2xl shadow-neon-red/30 hover:shadow-neon-red/50 transition-all inline-flex items-center gap-2"
            >
              Ir al Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link
              href="/players"
              className="bg-white/5 text-white px-7 py-3.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all inline-flex items-center gap-2"
            >
              Jugadores
            </Link>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black text-white">Módulos</h2>
            <p className="text-zinc-500 mt-2">Seis áreas de análisis integradas</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {modulos.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.06] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-neon-red flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <m.icon size={18} className="text-white" />
                </div>
                <h3 className="text-white text-sm font-bold">{m.label}</h3>
                <p className="text-zinc-500 text-xs mt-1">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-neon-red/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-red/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2">Comienza hoy</h2>
              <p className="text-zinc-500 mb-6">Gestiona jugadores, equipos y partidos con IA.</p>
              <div className="flex gap-3">
                <Link
                  href="/dashboard"
                  className="bg-neon-red text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-neon-red/30 transition-all"
                >
                  Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
                <Link
                  href="/players"
                  className="bg-white/5 text-white px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  Jugadores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-premium-gray/60 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-zinc-600">
          Futsal AI &copy; 2026
        </div>
      </footer>
    </div>
  );
}
