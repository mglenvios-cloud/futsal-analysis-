"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Activity, Heart, Swords, Search, TrendingUp } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2200);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 3, 100));
    }, 60);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-red/[0.02] via-transparent to-accent-blue/[0.02]" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-neon-red/[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent-blue/[0.03] rounded-full blur-[120px]" />

      <div className="text-center relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-red/20 to-neon-red/5 border border-neon-red/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,23,68,0.12)] animate-float">
            <Zap className="w-10 h-10 text-neon-red" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          Futsal <span className="text-gradient">AI</span>
        </h1>

        <p className="text-white-dim/40 text-lg mb-10 max-w-md mx-auto font-light tracking-wide">
          Plataforma Profesional de Analisis de Futsal
        </p>

        <div className="flex items-center justify-center gap-8 mb-12">
          {[
            { icon: Activity, label: "Fisico" },
            { icon: Heart, label: "Cardiaco" },
            { icon: Swords, label: "Tactico" },
            { icon: Search, label: "Scouting" },
            { icon: TrendingUp, label: "Predicciones" },
          ].map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-white-dim/20 transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-premium-dark/40 border border-premium-gray/30 flex items-center justify-center group-hover:bg-neon-red/10 transition-colors">
                <Icon size={18} className="text-white-dim/30" />
              </div>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white-dim/20">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-[2px] bg-premium-gray/30 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-red to-neon-redlight rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-white-dim/15 font-mono tracking-wider">
            {progress < 100 ? "Cargando dashboard..." : "Redirigiendo..."}
          </p>
        </div>
      </div>
    </div>
  );
}
