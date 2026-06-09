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
    <div className="min-h-screen bg-premium-black flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-12 h-12 text-neon-red animate-pulse-neon" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Futsal <span className="text-gradient">AI</span>
        </h1>
        <p className="text-white-dim/70 mb-8">Plataforma Profesional de Analisis de Futsal</p>
        <div className="flex items-center justify-center gap-8 text-white-dim/50">
          <Activity size={20} /><Heart size={20} /><Swords size={20} /><Search size={20} /><TrendingUp size={20} />
        </div>
        <div className="mt-8">
          <div className="w-8 h-8 border-2 border-neon-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-white-dim/30 mt-3">Cargando dashboard...</p>
        </div>
      </div>
    </div>
  );
}
