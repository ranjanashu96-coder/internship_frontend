"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { studentService } from "@/lib/services";

type Resource = {
  id: number; title: string; file_url?: string | null;
  external_url?: string | null; duration_seconds?: number | null;
};

const contentUrl = (value?: string | null) => {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  return `${api.replace(/\/api\/?$/, "")}${value.startsWith("/") ? value : `/${value}`}`;
};

const fmt = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}` : `${m}:${String(r).padStart(2,"0")}`;
};

export default function TrackedVideoResource({ resource }: { resource: Resource }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const lastSent = useRef(0);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(0);
  const [duration, setDuration] = useState(Number(resource.duration_seconds || 0));
  const [progress, setProgress] = useState(0);
  const [required, setRequired] = useState(95);
  const [completed, setCompleted] = useState(false);
  const url = resource.external_url || contentUrl(resource.file_url);

  useEffect(() => {
    (async () => {
      try {
        const response = await studentService.videoProgress(resource.id);
        const d = response.data.data;
        setWatched(Number(d.watched_seconds || 0));
        setDuration(Number(d.duration_seconds || resource.duration_seconds || 0));
        setProgress(Number(d.progress_percentage || 0));
        setRequired(Number(d.completion_required_percentage || 95));
        setCompleted(Boolean(d.is_completed));
        if (ref.current && Number(d.last_position_seconds) > 0) {
          const resume = () => {
            if (ref.current) ref.current.currentTime = Math.min(Number(d.last_position_seconds), Number.isFinite(ref.current.duration) ? ref.current.duration : Number(d.last_position_seconds));
          };
          ref.current.readyState >= 1 ? resume() : ref.current.addEventListener("loadedmetadata", resume, { once: true });
        }
      } finally { setLoading(false); }
    })();
  }, [resource.id, resource.duration_seconds]);

  const heartbeat = useCallback(async (video: HTMLVideoElement, force = false) => {
    const now = Date.now();
    if (!force && now - lastSent.current < 9000) return;
    lastSent.current = now;
    try {
      const response = await studentService.videoHeartbeat(resource.id, {
        position_seconds: Number(video.currentTime || 0),
        duration_seconds: Number.isFinite(video.duration) ? Math.round(video.duration) : Number(resource.duration_seconds || 0),
        playing: !video.paused && !video.ended,
        visible: document.visibilityState === "visible",
      });
      const d = response.data.data;
      setWatched(Number(d.watched_seconds || 0));
      setDuration(Number(d.duration_seconds || 0));
      setProgress(Number(d.progress_percentage || 0));
      setRequired(Number(d.completion_required_percentage || 95));
      setCompleted(Boolean(d.is_completed));
    } catch { /* next heartbeat retries */ }
  }, [resource.id, resource.duration_seconds]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const timer = window.setInterval(() => { if (!video.paused && !video.ended) void heartbeat(video); }, 3000);
    const flush = () => void heartbeat(video, true);
    video.addEventListener("pause", flush);
    video.addEventListener("ended", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.clearInterval(timer);
      video.removeEventListener("pause", flush);
      video.removeEventListener("ended", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [heartbeat]);

  return <section className="card">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Recorded Lecture</p><h3 className="mt-1 font-bold">{resource.title}</h3></div>
      {completed && <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="mr-1 h-4 w-4"/>Completed</span>}
    </div>
    <div className="overflow-hidden rounded-2xl bg-slate-950"><video ref={ref} src={url} controls className="aspect-video w-full" onPlay={(e) => void heartbeat(e.currentTarget, true)} /></div>
    <div className="mt-4 rounded-xl border bg-slate-50 p-4">
      {loading ? <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/>Loading progress...</p> : <>
        <div className="flex justify-between text-sm"><b>Watched {fmt(watched)} / {fmt(duration)}</b><b className="text-blue-600">{progress.toFixed(0)}%</b></div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${completed ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${Math.min(100, progress)}%` }}/></div>
        <p className="mt-2 text-xs text-slate-500">{completed ? "Lecture requirement completed." : `Watch at least ${required}%. Skipped time is not counted.`}</p>
      </>}
    </div>
  </section>;
}
