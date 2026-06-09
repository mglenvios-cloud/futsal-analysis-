"use client";

import { useState } from "react";
import { Bell, Search, Settings, Zap, Heart } from "lucide-react";
import { useStore } from "@/store";

export function Header() {
  const { cardiacData, isMonitoring } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 border-b border-premium-gray bg-premium-dark/80 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white-dim/50 cursor-pointer"
            onClick={() => setSearchOpen(!searchOpen)}
          />
          <input
            type="text"
            placeholder="Buscar jugadores, equipos..."
            className={`input-premium pl-10 pr-4 py-2 w-64 text-sm transition-all duration-300 ${
              searchOpen ? "opacity-100" : "opacity-70 focus:opacity-100"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isMonitoring && cardiacData && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-red/10 border border-neon-red/30">
            <Heart size={16} className="text-neon-red animate-pulse-neon" />
            <div>
              <span className="text-sm font-mono font-bold text-neon-red">
                {cardiacData.heart_rate.toFixed(0)}
              </span>
              <span className="text-xs text-white-dim/50 ml-1">bpm</span>
            </div>
          </div>
        )}

        <button className="btn-ghost relative p-2">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full" />
        </button>

        <button className="btn-ghost p-2">
          <Settings size={18} />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-premium-gray">
          <div className="w-8 h-8 rounded-full bg-neon-red/20 flex items-center justify-center">
            <Zap size={14} className="text-neon-red" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-white">Futsal AI</p>
            <p className="text-xs text-white-dim/50">Division A</p>
          </div>
        </div>
      </div>
    </header>
  );
}
