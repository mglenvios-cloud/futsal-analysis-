"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Upload,
  Play,
  Settings,
  Download,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { videosApi, analysisApi } from "@/lib/api";

type VideoStatus = "pending" | "processing" | "completed" | "failed";

interface VideoFile {
  id: number;
  name: string;
  size: number;
  status: VideoStatus;
  duration?: string;
  resolution?: string;
  fps?: number;
  uploadedAt: string;
}

const statusConfig: Record<VideoStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "Pendiente", bg: "bg-accent-yellow/10", text: "text-accent-yellow", dot: "bg-accent-yellow" },
  processing: { label: "Procesando", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  completed: { label: "Completado", bg: "bg-accent-green/10", text: "text-accent-green", dot: "bg-accent-green" },
  failed: { label: "Fallido", bg: "bg-neon-red/10", text: "text-neon-red", dot: "bg-neon-red" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

interface UploadingFile {
  name: string;
  size: number;
  progress: number;
}

export default function VideoAnalysisPage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [uploading, setUploading] = useState<UploadingFile | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadVideos() {
    setLoading(true);
    try {
      const res = await videosApi.list();
      setVideos(
        (res.data.results || res.data).map((v: any) => ({
          id: v.id,
          name: v.filename || v.name || `Video ${v.id}`,
          size: v.file_size || v.size || 0,
          status: v.status || "pending",
          duration: v.duration,
          resolution: v.resolution,
          fps: v.fps,
          uploadedAt: v.created_at || v.uploaded_at,
        }))
      );
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading({ name: file.name, size: file.size, progress: 0 });
    const formData = new FormData();
    formData.append("file", file);
    try {
      await videosApi.upload(formData);
      await loadVideos();
    } catch {
      /* ignore */
    } finally {
      setUploading(null);
    }
  }

  async function handleProcess(videoId: number) {
    setProcessingId(videoId);
    try {
      await analysisApi.full(videoId);
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, status: "completed" as VideoStatus } : v))
      );
    } catch {
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, status: "failed" as VideoStatus } : v))
      );
    } finally {
      setProcessingId(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">
            Analisis de <span className="text-gradient">Video</span>
          </h1>
          <p className="page-subtitle">
            Subi y procesa videos de partidos para analisis tactico y fisico con IA
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <Video size={14} className="text-neon-red" />
          <span className="text-xs text-neon-red font-medium">
            {videos.length} videos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`card-premium p-8 border-2 border-dashed cursor-pointer transition-all duration-300 text-center ${
                dragOver
                  ? "border-neon-red bg-neon-red/5"
                  : "border-white/10 hover:border-neon-red/50 hover:bg-premium-dark/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={40} className="text-neon-red animate-spin" />
                  <p className="text-white font-medium">{uploading.name}</p>
                  <p className="text-xs text-white-dim/50">{formatSize(uploading.size)}</p>
                  <div className="w-full max-w-xs h-1.5 rounded-full bg-premium-dark overflow-hidden">
                    <div className="h-full rounded-full bg-neon-red animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-neon-red/10 flex items-center justify-center">
                    <Upload size={28} className="text-neon-red" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {dragOver ? "Soltá el archivo aca" : "Arrastrá tu video aca"}
                    </p>
                    <p className="text-xs text-white-dim/50 mt-1">
                      o hace clic para seleccionar un archivo
                    </p>
                  </div>
                  <span className="text-[10px] text-white-dim/30">
                    MP4, MOV, AVI - Max 2GB
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4"
          >
            <div className="card-premium p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Settings size={16} className="text-neon-red" />
                Configuracion de Procesamiento
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-white-dim/70">Analisis Fisico</span>
                  <span className="text-xs text-accent-green">Activado</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-white-dim/70">Analisis Tactico</span>
                  <span className="text-xs text-accent-green">Activado</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-white-dim/70">Deteccion de Eventos</span>
                  <span className="text-xs text-accent-green">Activado</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-white-dim/70">Tracking de Jugadores</span>
                  <span className="text-xs text-accent-green">Activado</span>
                </div>
              </div>
              <button className="w-full mt-4 btn-neon flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neon-red hover:bg-neon-red/90 text-white font-medium text-sm transition-all duration-200">
                <Zap size={16} />
                Procesar Todos los Videos
              </button>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="card-premium p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Video size={16} className="text-neon-red" />
                  Videos Subidos
                </h3>
                <button
                  onClick={loadVideos}
                  disabled={loading}
                  className="text-xs text-white-dim/50 hover:text-white-dim/80 transition-colors disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Actualizar"}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="text-neon-red animate-spin" />
                </div>
              ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-premium-dark flex items-center justify-center mb-3">
                    <Video size={20} className="text-white-dim/30" />
                  </div>
                  <p className="text-sm text-white-dim/50">No hay videos subidos aun</p>
                  <p className="text-xs text-white-dim/30 mt-1">Arrastra un video o usa el boton de subir</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-2 text-xs text-white-dim/50 font-medium">Nombre</th>
                        <th className="text-left py-3 px-2 text-xs text-white-dim/50 font-medium">Tamaño</th>
                        <th className="text-left py-3 px-2 text-xs text-white-dim/50 font-medium">Metadatos</th>
                        <th className="text-left py-3 px-2 text-xs text-white-dim/50 font-medium">Estado</th>
                        <th className="text-right py-3 px-2 text-xs text-white-dim/50 font-medium">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map((video, i) => {
                        const status = statusConfig[video.status];
                        return (
                          <motion.tr
                            key={video.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="border-b border-white/5 hover:bg-premium-dark/50 transition-colors"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <Video size={14} className="text-neon-red/70 shrink-0" />
                                <span className="text-white text-xs truncate max-w-[140px] block">
                                  {video.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-xs text-white-dim/60">{formatSize(video.size)}</span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex flex-col gap-0.5">
                                {video.duration && (
                                  <span className="text-[10px] text-white-dim/40">{video.duration}</span>
                                )}
                                {video.resolution && (
                                  <span className="text-[10px] text-white-dim/40">{video.resolution}</span>
                                )}
                                {!video.duration && !video.resolution && (
                                  <span className="text-[10px] text-white-dim/30">—</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>
                                  {status.label}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {video.status === "pending" && (
                                  <button
                                    onClick={() => handleProcess(video.id)}
                                    disabled={processingId === video.id}
                                    className="p-1.5 rounded-md bg-neon-red/10 text-neon-red hover:bg-neon-red/20 transition-colors disabled:opacity-50"
                                    title="Procesar video"
                                  >
                                    {processingId === video.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <Play size={14} />
                                    )}
                                  </button>
                                )}
                                {video.status === "completed" && (
                                  <>
                                    <button
                                      className="p-1.5 rounded-md bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors"
                                      title="Descargar reporte"
                                    >
                                      <Download size={14} />
                                    </button>
                                    <button
                                      className="p-1.5 rounded-md bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors"
                                      title="Ver resultados"
                                    >
                                      <Play size={14} />
                                    </button>
                                  </>
                                )}
                                {video.status === "failed" && (
                                  <button
                                    onClick={() => handleProcess(video.id)}
                                    disabled={processingId === video.id}
                                    className="p-1.5 rounded-md bg-neon-red/10 text-neon-red hover:bg-neon-red/20 transition-colors disabled:opacity-50"
                                    title="Reintentar"
                                  >
                                    {processingId === video.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <AlertCircle size={14} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
