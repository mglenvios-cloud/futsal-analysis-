"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Activity, Heart, Swords, Search, TrendingUp } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-premium-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-red/5 via-transparent to-accent-blue/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />

      <div className="text-center animate-in relative">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-neon-red/10 border border-neon-red/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,23,68,0.1)]">
            <Zap className="w-8 h-8 text-neon-red animate-pulse-neon" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
          Futsal <span className="text-gradient">AI</span>
        </h1>

        <p className="text-white-dim/50 text-lg mb-8 max-w-md mx-auto">
          Plataforma Profesional de Analisis de Futsal
        </p>

        <div className="flex items-center justify-center gap-6 mb-10">
          {[
            { icon: Activity, label: "Fisico" },
            { icon: Heart, label: "Cardiaco" },
            { icon: Swords, label: "Tactico" },
            { icon: Search, label: "Scouting" },
            { icon: TrendingUp, label: "Predicciones" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-white-dim/30">
              <Icon size={20} className="hover:text-neon-red/50 transition-colors" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white-dim/20 font-mono">Cargando dashboard...</p>
        </div>
      </div>
    </div>
  );
}
