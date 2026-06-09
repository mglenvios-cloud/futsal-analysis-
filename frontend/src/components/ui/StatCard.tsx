"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: "red" | "blue" | "green" | "yellow" | "purple";
}

const colorMap = {
  red: { bg: "bg-neon-red/10", border: "border-neon-red/30", text: "text-neon-red" },
  blue: { bg: "bg-accent-blue/10", border: "border-accent-blue/30", text: "text-accent-blue" },
  green: { bg: "bg-accent-green/10", border: "border-accent-green/30", text: "text-accent-green" },
  yellow: { bg: "bg-accent-yellow/10", border: "border-accent-yellow/30", text: "text-accent-yellow" },
  purple: { bg: "bg-accent-purple/10", border: "border-accent-purple/30", text: "text-accent-purple" },
};

export function StatCard({ icon: Icon, label, value, color = "red" }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-premium p-4 flex items-center gap-4`}
    >
      <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
        <Icon size={24} className={colors.text} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </motion.div>
  );
}
