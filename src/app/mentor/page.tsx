"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Files,
  Loader2,
  RefreshCw,
  RotateCcw,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui";
import {
  mentorService,
  type MentorDashboardData,
} from "@/lib/services";

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return value.response?.data?.message || value.message || "Unable to load mentor dashboard";
};

export default function MentorDashboardPage() {
  const [data, setData] = useState<MentorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await mentorService.dashboard();
      setData(response.data.data);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading mentor dashboard...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">Mentor dashboard data is not available.</p>
        <Button className="mt-4" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const { mentor, summary, recent_students } = data;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-blue-300">Mentor Dashboard</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Welcome, {mentor.name}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {mentor.employee_id}
              {mentor.designation ? ` • ${mentor.designation}` : ""}
              {mentor.department ? ` • ${mentor.department}` : ""}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => void load(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Students" value={String(summary.total_students)} icon={Users} />
        <StatCard label="Active Students" value={String(summary.active_students)} icon={CheckCircle2} />
        <StatCard label="Pending Reviews" value={String(summary.pending_reviews)} icon={ClipboardCheck} />
        <StatCard label="Pending Assessments" value={String(summary.assessments_pending)} icon={FileCheck2} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed Students" value={String(summary.completed_students)} icon={CheckCircle2} />
        <StatCard label="Assessments Submitted" value={String(summary.assessments_submitted)} icon={FileCheck2} />
        <StatCard label="Average Progress" value={`${Number(summary.average_progress || 0).toFixed(0)}%`} icon={BrainCircuit} />
        <StatCard label="Quiz Attempts Exhausted" value={String(summary.failed_quiz_exhausted)} icon={RotateCcw} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/mentor/students" className="card transition hover:-translate-y-0.5 hover:shadow-md">
          <Users className="h-7 w-7 text-blue-600" />
          <h2 className="mt-3 font-bold text-slate-900">Assigned Students</h2>
          <p className="mt-1 text-sm text-slate-500">View only students assigned to you.</p>
        </Link>

        <Link href="/mentor/resources" className="card transition hover:-translate-y-0.5 hover:shadow-md">
          <Files className="h-7 w-7 text-emerald-600" />
          <h2 className="mt-3 font-bold text-slate-900">Learning Resources</h2>
          <p className="mt-1 text-sm text-slate-500">Add and manage chapter resources in your domain.</p>
        </Link>

        <Link href="/mentor/quizzes" className="card transition hover:-translate-y-0.5 hover:shadow-md">
          <BrainCircuit className="h-7 w-7 text-violet-600" />
          <h2 className="mt-3 font-bold text-slate-900">Manage Quizzes</h2>
          <p className="mt-1 text-sm text-slate-500">Create and manage quizzes in your domain.</p>
        </Link>

        <Link href="/mentor/quiz-reattempts" className="card transition hover:-translate-y-0.5 hover:shadow-md">
          <RotateCcw className="h-7 w-7 text-amber-600" />
          <h2 className="mt-3 font-bold text-slate-900">Quiz Reattempts</h2>
          <p className="mt-1 text-sm text-slate-500">Grant another attempt to assigned students who exhausted attempts and did not pass.</p>
        </Link>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="border-b px-5 py-4">
          <h2 className="font-bold text-slate-900">Recently Assigned Students</h2>
          <p className="mt-1 text-sm text-slate-500">Real data from students assigned to your mentor profile.</p>
        </div>

        {recent_students.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No students assigned yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Registration</th>
                  <th className="px-5 py-3">College</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{student.name}</td>
                    <td className="px-5 py-4 text-slate-600">{student.registration_number}</td>
                    <td className="px-5 py-4 text-slate-600">{student.college?.name || "-"}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{student.internship_status}</td>
                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {Number(student.total_progress || 0).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
