"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: "red" | "green" | "blue" | "yellow" | "purple" | "orange";
  subtitle?: string;
  trend?: { value: number; positive: boolean };
}

const colorMap = {
  red: { bg: "bg-neon-red/10", icon: "text-neon-red", border: "border-neon-red/20" },
  green: { bg: "bg-accent-green/10", icon: "text-accent-green", border: "border-accent-green/20" },
  blue: { bg: "bg-accent-blue/10", icon: "text-accent-blue", border: "border-accent-blue/20" },
  yellow: { bg: "bg-accent-yellow/10", icon: "text-accent-yellow", border: "border-accent-yellow/20" },
  purple: { bg: "bg-accent-purple/10", icon: "text-accent-purple", border: "border-accent-purple/20" },
  orange: { bg: "bg-accent-orange/10", icon: "text-accent-orange", border: "border-accent-orange/20" },
};

export function StatCard({ icon: Icon, label, value, color, subtitle, trend }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className={`card-premium p-4 relative overflow-hidden ${c.border}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${c.bg} opacity-50 blur-2xl`} />
      <div className="flex items-start justify-between relative">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? "text-accent-green" : "text-neon-red"}`}>
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3 relative">
        <p className="stat-value">{value}</p>
        <p className="stat-label mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-white-dim/30 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
