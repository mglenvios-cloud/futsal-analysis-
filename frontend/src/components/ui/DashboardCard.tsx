"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, icon: Icon, children, className = "" }: DashboardCardProps) {
  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-premium-gray/50">
        <div className="w-8 h-8 rounded-lg bg-neon-red/10 flex items-center justify-center">
          <Icon size={16} className="text-neon-red" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
