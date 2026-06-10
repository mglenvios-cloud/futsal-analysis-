"use client";

import { useState } from "react";
import { Bell, Search, Settings, Zap, Heart } from "lucide-react";
import { useStore } from "@/store";

export function Header() {
  const { cardiacData, isMonitoring } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 border-b border-premium-gray/60 bg-premium-dark/50 backdrop-blur-2xl flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white-dim/30 cursor-pointer hover:text-white-dim/60 transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
          />
          <input
            type="text"
            placeholder="Buscar jugadores, equipos..."
            className={`input-premium pl-10 pr-4 py-2 w-48 md:w-64 text-sm transition-all duration-300 ${
              searchOpen ? "opacity-100" : "opacity-60 focus:opacity-100"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isMonitoring && cardiacData && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-red/10 border border-neon-red/20">
            <Heart size={16} className="text-neon-red animate-pulse-neon" />
            <div>
              <span className="text-sm font-mono font-bold text-neon-red">
                {cardiacData.heart_rate.toFixed(0)}
              </span>
              <span className="text-xs text-white-dim/40 ml-1">bpm</span>
            </div>
          </div>
        )}

        <button className="btn-icon relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-red rounded-full ring-2 ring-premium-dark" />
        </button>

        <button className="btn-icon">
          <Settings size={18} />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-premium-gray/60 ml-1">
          <div className="w-8 h-8 rounded-full bg-neon-red/15 flex items-center justify-center">
            <Zap size={14} className="text-neon-red" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-white">Futsal AI</p>
            <p className="text-xs text-white-dim/40">Division A</p>
          </div>
        </div>
      </div>
    </header>
  );
}
