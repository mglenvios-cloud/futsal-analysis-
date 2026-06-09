import { create } from "zustand";
import type { CardiacData, Player, Team } from "@/types";

interface AppState {
  sidebarOpen: boolean;
  theme: "dark" | "light";
  toggleSidebar: () => void;
  setTheme: (theme: "dark" | "light") => void;

  cardiacData: CardiacData | null;
  setCardiacData: (data: CardiacData) => void;

  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;

  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;

  isMonitoring: boolean;
  setIsMonitoring: (monitoring: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),

  cardiacData: null,
  setCardiacData: (data) => set({ cardiacData: data }),

  selectedPlayer: null,
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),

  selectedTeam: null,
  setSelectedTeam: (team) => set({ selectedTeam: team }),

  isMonitoring: false,
  setIsMonitoring: (monitoring) => set({ isMonitoring: monitoring }),
}));
