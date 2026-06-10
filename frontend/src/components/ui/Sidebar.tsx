"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import {
  LayoutDashboard,
  Video,
  Activity,
  Heart,
  Swords,
  Search,
  Users,
  Building2,
  Calendar,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analysis/video", label: "Analisis de Video", icon: Video },
  { href: "/analysis/physical", label: "Analisis Fisico", icon: Activity },
  { href: "/analysis/cardiac", label: "Monitoreo Cardiaco", icon: Heart },
  { href: "/analysis/tactical", label: "Analisis Tactico", icon: Swords },
  { href: "/scouting", label: "Scouting IA", icon: Search },
  { href: "/players", label: "Jugadores", icon: Users },
  { href: "/teams", label: "Equipos", icon: Building2 },
  { href: "/matches", label: "Partidos", icon: Calendar },
  { href: "/reports", label: "Reportes", icon: FileText },
  { href: "/dashboard/rankings", label: "Rankings", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-premium-dark/95 backdrop-blur-2xl border-r border-premium-gray/60 z-50 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-premium-gray/60">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-neon-red/15 flex items-center justify-center group-hover:bg-neon-red/25 transition-colors">
              <Zap className="w-4 h-4 text-neon-red" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Futsal AI</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="btn-icon ml-auto"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-neon-red/10 text-neon-red"
                  : "text-white-dim/70 hover:text-white hover:bg-premium-gray/40"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-neon-red rounded-full" />
              )}
              <Icon size={20} className={isActive ? "text-neon-red" : ""} />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {sidebarOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-premium-gray/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-premium-black/40">
            <div className="w-8 h-8 rounded-full bg-neon-red/15 flex items-center justify-center">
              <Zap size={14} className="text-neon-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white-dim/40">Division A</p>
              <p className="text-xs text-neon-red font-medium">Futsal AFA</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
