import Link from "next/link";
import { Zap, Activity, Heart, Video, Search, TrendingUp, Sword, Menu } from "lucide-react";

const modulos = [
  { href: "/analysis/video", icon: Video, label: "Video", desc: "Procesamiento autom\u00e1tico", gradient: "from-fuchsia-500 to-pink-600" },
  { href: "/analysis/physical", icon: Activity, label: "F\u00edsico", desc: "Velocidad, sprints y calor", gradient: "from-emerald-400 to-teal-500" },
  { href: "/analysis/cardiac", icon: Heart, label: "Card\u00edaco", desc: "Monitoreo en tiempo real", gradient: "from-rose-500 to-red-600" },
  { href: "/analysis/tactical", icon: Sword, label: "T\u00e1ctico", desc: "Diagramas y patrones", gradient: "from-violet-500 to-purple-600" },
  { href: "/scouting", icon: Search, label: "Scouting", desc: "B\u00fasqueda con IA", gradient: "from-sky-400 to-blue-600" },
  { href: "/dashboard/rankings", icon: TrendingUp, label: "Predicciones", desc: "Proyecciones", gradient: "from-amber-400 to-orange-600" },
];

export default function HomePage() {
  const gradients = [
    "from-fuchsia-500/10 via-transparent to-transparent",
    "from-transparent via-blue-500/10 to-transparent",
    "from-transparent via-emerald-500/10 to-transparent",
    "from-transparent via-rose-500/10 to-transparent",
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-600/20 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-gradient-to-tl from-blue-600/20 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 via-fuchsia-500/5 to-rose-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-600/10 rounded-full blur-[60px]" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-sky-400/10 to-violet-500/10 rounded-full blur-[70px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Futsal<span className="text-fuchsia-400">AI</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {["Dashboard", "Jugadores", "Equipos", "Partidos"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  {item}
                </Link>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-xl hover:shadow-fuchsia-500/25 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm mb-8 backdrop-blur">
            <Zap size={14} className="text-fuchsia-400" />
            Plataforma Profesional de An&aacute;lisis
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[0.85] tracking-tight">
            An&aacute;lisis
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              Inteligente
            </span>
            <br />
            para Futsal
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Video, f&iacute;sico, t&aacute;ctico, card&iacute;aco, scouting y predicciones.
            <br />
            Todo en una plataforma.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2.5 text-lg"
            >
              Ir al Dashboard
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link
              href="/players"
              className="bg-white/5 text-white px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all inline-flex items-center gap-2.5 text-lg"
            >
              Ver Jugadores
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
          <span className="text-xs">Despl&aacute;zate</span>
          <div className="w-5 h-8 rounded-full border border-zinc-700 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-zinc-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Módulos Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/[0.02] to-transparent" />

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="text-fuchsia-400 text-sm font-semibold tracking-widest uppercase">M&oacute;dulos</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
              Todo lo que necesit&aacute;s
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Seis m&oacute;dulos de an&aacute;lisis integrados para equipos profesionales.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modulos.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group relative bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                  <m.icon size={24} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-1">{m.label}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05)_0%,transparent_50%)]" />

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-violet-400 text-sm font-semibold tracking-widest uppercase">Caracter&iacute;sticas</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
              Potenciado por IA
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              An&aacute;lisis avanzado para llevar tu equipo al pr&oacute;ximo nivel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Video, title: "An&aacute;lisis de Video", desc: "Procesamiento autom&aacute;tico con detecci&oacute;n de jugadas, goles y eventos.", color: "from-fuchsia-500/20 to-pink-600/20", border: "border-fuchsia-500/20", text: "text-fuchsia-400" },
              { icon: Heart, title: "Monitoreo Card&iacute;aco", desc: "Seguimiento en tiempo real de frecuencia card&iacute;aca y carga f&iacute;sica.", color: "from-rose-500/20 to-red-600/20", border: "border-rose-500/20", text: "text-rose-400" },
              { icon: Search, title: "Scouting con IA", desc: "Descubr&iacute; talentos ocultos con an&aacute;lisis predictivo y comparativas.", color: "from-sky-400/20 to-blue-600/20", border: "border-sky-500/20", text: "text-sky-400" },
            ].map((f) => (
              <div key={f.title} className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} backdrop-blur p-8`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon size={22} className={f.text} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2" dangerouslySetInnerHTML={{ __html: f.title }} />
                <p className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: f.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/[0.03] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-rose-500/10 rounded-full blur-[120px]" />

        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Comenz&aacute; hoy
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-lg mx-auto">
            Gestion&aacute; jugadores, equipos y partidos con an&aacute;lisis inteligente.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-105 transition-all duration-300"
            >
              Ir al Dashboard
            </Link>
            <Link
              href="/players"
              className="bg-white/5 text-white px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Explorar Jugadores
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-zinc-500 font-semibold text-sm">FutsalAI</span>
          </div>
          <p className="text-zinc-700 text-xs">&copy; 2026 FutsalAI. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
