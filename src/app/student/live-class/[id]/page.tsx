"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, Radio } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { studentService } from "@/lib/services";
import { toast } from "sonner";

export default function StudentLiveClassAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const token = useRef<string | null>(null);
  const [joining, setJoining] = useState(true);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [attended, setAttended] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [required, setRequired] = useState(80);
  const [completed, setCompleted] = useState(false);
  const [ended, setEnded] = useState(false);

  const start = useCallback(async () => {
    try {
      setJoining(true);
      const response = await studentService.joinLiveClass(id);
      const d = response.data.data;
      token.current = d.session_token;
      setMeetingUrl(d.meeting_url || "");
      setAttended(Number(d.attended_seconds || 0));
      setPercentage(Number(d.attendance_percentage || 0));
      setRequired(Number(d.attendance_required_percentage || 80));
      setCompleted(Boolean(d.is_completed));
      if (d.meeting_url) window.open(d.meeting_url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Unable to join live class");
    } finally { setJoining(false); }
  }, [id]);

  useEffect(() => { if (id) void start(); }, [id, start]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (!token.current || ended) return;
      try {
        const response = await studentService.liveClassHeartbeat(id, token.current);
        const d = response.data.data;
        setAttended(Number(d.attended_seconds || 0));
        setPercentage(Number(d.attendance_percentage || 0));
        setRequired(Number(d.attendance_required_percentage || 80));
        setCompleted(Boolean(d.is_completed));
        setEnded(Boolean(d.ended));
      } catch {}
    }, 30000);
    return () => window.clearInterval(timer);
  }, [id, ended]);

  const leave = async () => {
    if (token.current) {
      try { await studentService.leaveLiveClass(id, token.current); } catch {}
    }
    router.push("/student");
  };

  if (joining) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>;

  return <div className="mx-auto max-w-3xl space-y-5">
    <Button variant="secondary" onClick={() => void leave()}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Dashboard</Button>
    <section className="card">
      <div className="flex justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold text-rose-600"><Radio className="h-5 w-5"/>LIVE ATTENDANCE</p><h1 className="mt-2 text-2xl font-black">Live Class Attendance</h1><p className="mt-1 text-sm text-slate-500">Meeting new tab me khulega. Attendance ke liye is portal page ko open rakho.</p></div>{completed && <span className="inline-flex h-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="mr-1 h-4 w-4"/>Completed</span>}</div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-5"><div className="flex justify-between"><div><p className="text-xs uppercase text-slate-500">Attendance</p><p className="mt-1 text-2xl font-black">{percentage.toFixed(0)}%</p></div><p className="text-sm text-slate-600">{Math.floor(attended/60)} min attended</p></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${completed ? "bg-emerald-500" : "bg-blue-600"}`} style={{width:`${Math.min(100,percentage)}%`}}/></div><p className="mt-3 text-xs text-slate-500">Required attendance: {required}%. Long heartbeat gaps count nahi honge.</p></div>
      {meetingUrl && <Button className="mt-5" onClick={() => window.open(meetingUrl,"_blank","noopener,noreferrer")}><ExternalLink className="mr-2 h-4 w-4"/>Open Meeting Again</Button>}
      {ended && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-700">This live class has ended.</p>}
    </section>
  </div>;
}
