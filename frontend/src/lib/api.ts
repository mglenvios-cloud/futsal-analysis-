import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || "Error de conexion";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export const playersApi = {
  list: (params?: any) => api.get("/players/", { params }),
  get: (id: number) => api.get(`/players/${id}`),
  create: (data: any) => api.post("/players/", data),
  update: (id: number, data: any) => api.put(`/players/${id}`, data),
  delete: (id: number) => api.delete(`/players/${id}`),
  statistics: (id: number) => api.get(`/players/${id}/statistics`),
};

export const teamsApi = {
  list: (params?: any) => api.get("/teams/", { params }),
  get: (id: number) => api.get(`/teams/${id}`),
  create: (data: any) => api.post("/teams/", data),
  players: (id: number) => api.get(`/teams/${id}/players`),
};

export const matchesApi = {
  list: (params?: any) => api.get("/matches/", { params }),
  get: (id: number) => api.get(`/matches/${id}`),
  events: (id: number) => api.get(`/matches/${id}/events`),
  statistics: (id: number) => api.get(`/matches/${id}/statistics`),
};

export const videosApi = {
  list: (params?: any) => api.get("/videos/", { params }),
  get: (id: number) => api.get(`/videos/${id}`),
  upload: (formData: FormData) =>
    api.post("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  process: (id: number) => api.post(`/videos/${id}/process`),
};

export const analysisApi = {
  physical: (videoId: number) => api.post(`/analysis/physical/${videoId}`),
  tactical: (videoId: number) => api.post(`/analysis/tactical/${videoId}`),
  full: (videoId: number) => api.post(`/analysis/full/${videoId}`),
};

export const scoutingApi = {
  run: () => api.post("/scouting/run"),
  list: (params?: any) => api.get("/scouting/players", { params }),
  get: (id: number) => api.get(`/scouting/players/${id}`),
  search: (name: string) => api.post("/scouting/search", null, { params: { name } }),
  stats: () => api.get("/scouting/stats"),
};

export const cardiacApi = {
  devices: () => api.get("/cardiac/devices"),
  connect: (address: string, name?: string) =>
    api.post("/cardiac/connect", null, { params: { address, name } }),
  disconnect: () => api.post("/cardiac/disconnect"),
  start: () => api.post("/cardiac/start"),
  stop: () => api.post("/cardiac/stop"),
  current: () => api.get("/cardiac/current"),
  history: () => api.get("/cardiac/history"),
};

export const reportsApi = {
  playerPdf: (id: number) =>
    api.get(`/reports/player/${id}/pdf`, { responseType: "blob" }),
  teamPdf: (id: number) =>
    api.get(`/reports/team/${id}/pdf`, { responseType: "blob" }),
  matchPdf: (id: number) =>
    api.get(`/reports/match/${id}/pdf`, { responseType: "blob" }),
  playerExcel: (id: number) =>
    api.get(`/reports/player/${id}/excel`, { responseType: "blob" }),
  playerCsv: (id: number) =>
    api.get(`/reports/player/${id}/csv`, { responseType: "blob" }),
};

export const predictionsApi = {
  predict: (playerId: number) => api.post(`/predictions/${playerId}`),
  history: (playerId: number) => api.get(`/predictions/${playerId}/history`),
  ranking: () => api.get("/predictions/ranking"),
};

export default api;
