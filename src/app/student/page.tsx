"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  FolderKanban,
  Loader2,
  RefreshCw,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/stat-card";
import AttendanceCheckInCard from "@/components/student/AttendanceCheckInCard";
import { Button } from "@/components/ui";
import {
  studentService,
  type StudentDashboardData,
  type StudentRecentActivity,
} from "@/lib/services";

const formatNumber = (
  value: number | null | undefined,
) => {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatPercentage = (
  value: number | null | undefined,
) => {
  return `${formatNumber(value).toFixed(0)}%`;
};

const formatDate = (
  value: string | null | undefined,
) => {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
};

const getActivityIcon = (
  type: string,
) => {
  if (
    type === "chapter_completed"
  ) {
    return CheckCircle2;
  }

  if (
    type === "logbook_submitted"
  ) {
    return BookOpen;
  }

  if (
    type === "assignment_submitted"
  ) {
    return FileCheck2;
  }

  return Target;
};

function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2
          className="animate-spin"
          size={34}
        />

        <p className="text-sm">
          Loading student dashboard...
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="card max-w-lg text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={24} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Dashboard could not be loaded
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>

        <Button
          type="button"
          className="mt-5"
          onClick={onRetry}
        >
          <RefreshCw
            size={17}
            className="mr-2"
          />

          Try Again
        </Button>
      </div>
    </div>
  );
}

function RecentActivityCard({
  activity,
}: {
  activity: StudentRecentActivity;
}) {
  const Icon = getActivityIcon(
    activity.type,
  );

  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-slate-900">
              {activity.title}
            </p>

            {activity.description && (
              <p className="mt-1 text-sm text-slate-500">
                {activity.description}
              </p>
            )}
          </div>

          {activity.status && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
              {activity.status}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
          <span>
            {formatDate(activity.date)}
          </span>

          {activity.hours !== null &&
            activity.hours !== undefined && (
              <span>
                {activity.hours} hours
              </span>
            )}

          {activity.marks !== null &&
            activity.marks !== undefined && (
              <span>
                Marks: {activity.marks}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<StudentDashboardData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await studentService.dashboard();

      setDashboard(
        response.data.data,
      );
    } catch (requestError: any) {
      const message =
        requestError?.response?.data
          ?.message ||
        requestError?.message ||
        "Unable to load dashboard data.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !dashboard) {
    return (
      <ErrorState
        message={
          error ||
          "Dashboard data was not returned."
        }
        onRetry={() => {
          void loadDashboard();
        }}
      />
    );
  }

  const {
    student,
    stats,
    attendance_summary,
    status,
    recent_activities,
  } = dashboard;

  const overallProgress =
    Math.min(
      100,
      Math.max(
        0,
        formatNumber(
          stats.overall_progress,
        ),
      ),
    );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white">
  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
    <div>
      <p className="text-sm font-medium text-blue-300">
        Student Dashboard
      </p>

      <h1 className="mt-2 text-2xl font-bold md:text-3xl">
        Welcome back,{" "}
        {student.name || "Student"}
      </h1>

      <p className="mt-2 text-sm text-slate-300">
        {student.registration_number}
        {student.domain?.domain_name
          ? ` • ${student.domain.domain_name}`
          : ""}
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        Internship Status
      </p>

      <p className="mt-1 font-semibold capitalize text-green-300">
        {student.internship_status}
      </p>
    </div>
  </div>
</section>

<AttendanceCheckInCard
  onAttendanceUpdated={() => {
    void loadDashboard();
  }}
/>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Course Progress"
          value={formatPercentage(
            stats.course_progress,
          )}
          icon={BookOpen}
        />

        <StatCard
          label="Attendance"
          value={formatPercentage(
            stats.attendance,
          )}
          icon={CalendarCheck}
        />

        <StatCard
          label="Hours Remaining"
          value={String(
            formatNumber(
              stats.hours_remaining,
            ),
          )}
          icon={Clock}
        />

        <StatCard
          label="Assignments"
          value={`${formatNumber(
            stats.assignments_completed,
          )}/${formatNumber(
            stats.assignments_total,
          )}`}
          icon={Target}
        />
      </section>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-slate-900">
              Overall Internship Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Learning, attendance,
              assignments, project and
              report progress.
            </p>
          </div>

          <strong className="text-lg text-blue-600">
            {formatPercentage(
              overallProgress,
            )}
          </strong>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
            }}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">
            Learning Summary
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-slate-500">
                Chapters Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.completed_chapters}
                <span className="text-base font-medium text-slate-400">
                  /{stats.total_chapters}
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-slate-500">
                Learning Hours
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.learning_hours}
                <span className="text-base font-medium text-slate-400">
                  /{stats.required_hours}
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-sm text-slate-500">
                Logbook Entries
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.logbook_entries}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm text-slate-500">
                Assignment Progress
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatPercentage(
                  stats.assignment_progress,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-slate-900">
            Attendance Summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Total Days
              </span>

              <strong>
                {
                  attendance_summary.total_days
                }
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Present
              </span>

              <strong className="text-green-600">
                {
                  attendance_summary.present_days
                }
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Absent
              </span>

              <strong className="text-red-600">
                {
                  attendance_summary.absent_days
                }
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Leave
              </span>

              <strong className="text-amber-600">
                {
                  attendance_summary.leave_days
                }
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <FolderKanban size={20} />
            </div>

            <h2 className="font-bold">
              Live Project
            </h2>
          </div>

          <div className="mt-4">
            {status.project ? (
              <>
                <p className="font-semibold text-slate-900">
                  {status.project.title ||
                    "Project submitted"}
                </p>

                <p className="mt-2 text-sm capitalize text-slate-500">
                  Status:{" "}
                  {status.project.status}
                </p>

                {status.project
                  .mentor_feedback && (
                  <p className="mt-3 text-sm text-slate-500">
                    {
                      status.project
                        .mentor_feedback
                    }
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Project has not been
                submitted yet.
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
              <FileCheck2 size={20} />
            </div>

            <h2 className="font-bold">
              Internship Report
            </h2>
          </div>

          <div className="mt-4">
            {status.report ? (
              <>
                <p className="text-sm capitalize text-slate-500">
                  Status:{" "}
                  {status.report.status}
                </p>

                {status.report
                  .mentor_remarks && (
                  <p className="mt-3 text-sm text-slate-500">
                    {
                      status.report
                        .mentor_remarks
                    }
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Internship report has not
                been submitted.
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={20} />
            </div>

            <h2 className="font-bold">
              Certificate
            </h2>
          </div>

          <div className="mt-4">
            {status.certificate
              .available ? (
              <>
                <p className="font-semibold text-green-600">
                  Certificate Available
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {
                    status.certificate
                      .certificate_number
                  }
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Certificate is not
                available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Activities
        </h2>

        <div className="mt-5 space-y-3">
          {recent_activities.length >
          0 ? (
            recent_activities.map(
              (activity) => (
                <RecentActivityCard
                  key={activity.id}
                  activity={activity}
                />
              ),
            )
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No recent activity found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}