"use client";

import Link from "next/link";
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
  BrainCircuit,
  Trophy,
  Clock3,
   LockKeyhole,
   Megaphone,
Bell,
} from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/stat-card";
import AttendanceCheckInCard from "@/components/student/AttendanceCheckInCard";
import { Button } from "@/components/ui";
import {
  studentService,
  notificationService,
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

const formatInternshipStartDate = (
  value?: string | null,
) => {
  if (!value) {
    return "Not assigned";
  }

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return "Not assigned";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
};


const getIndiaToday = () => {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      new Date(),
    );

  const values =
    Object.fromEntries(
      parts.map(
        (part) => [
          part.type,
          part.value,
        ],
      ),
    );

  return `${values.year}-${values.month}-${values.day}`;
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

  const [
  adminMessages,
  setAdminMessages,
] = useState<any[]>([]);

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

const loadAdminMessages = async () => {
  try {
    const response =
      await notificationService.list(
        1,
        50,
      );

    const items =
      response.data.data?.items || [];

    console.log(
      "ALL NOTIFICATIONS:",
      items,
    );

    const messages =
      items.filter(
        (item: any) => {
          let metadata =
            item.metadata;

          // Agar metadata JSON string hai
          if (
            typeof metadata ===
            "string"
          ) {
            try {
              metadata =
                JSON.parse(
                  metadata,
                );
            } catch {
              metadata = {};
            }
          }

          return (
            metadata?.source ===
            "admin_message"
          );
        },
      );

    console.log(
      "ADMIN MESSAGES:",
      messages,
    );

    setAdminMessages(
      messages,
    );
  } catch (error) {
    console.error(
      "Unable to load admin messages:",
      error,
    );
  }
};
  useEffect(() => {
    void loadDashboard();
     void loadAdminMessages();
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
  eligibility,
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

    const internshipStartDate =
  student.internship_start_date
    ? String(
        student.internship_start_date,
      ).slice(0, 10)
    : null;

const today =
  getIndiaToday();

const internshipStarted =
  student.payment_status === "paid" &&
  Boolean(
    internshipStartDate,
  ) &&
  today >=
    String(
      internshipStartDate,
    ) &&
  student.internship_status !==
    "blocked" &&
  student.internship_status !==
    "completed";

const internshipDisplayStatus =
  student.internship_status ===
  "completed"
    ? "Completed"
    : student.internship_status ===
        "blocked"
      ? "Blocked"
      : internshipStarted
        ? "Active"
        : internshipStartDate
          ? "Scheduled"
          : "Waiting to Start";

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

    <div className="min-w-[220px] rounded-xl border border-white/10 bg-white/5 px-4 py-3">
  <p className="text-xs uppercase tracking-wide text-slate-400">
    Internship Status
  </p>

  <p
    className={`mt-1 font-semibold ${
      internshipStarted
        ? "text-green-300"
        : student.internship_status ===
            "blocked"
          ? "text-red-300"
          : "text-amber-300"
    }`}
  >
    {internshipDisplayStatus}
  </p>

  {internshipStartDate && (
    <div className="mt-2 border-t border-white/10 pt-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        Start Date
      </p>

      <p className="mt-1 text-sm font-medium text-white">
        {formatInternshipStartDate(
          internshipStartDate,
        )}
      </p>
    </div>
  )}
</div>
  </div>
</section>

{adminMessages.length >
  0 && (
  <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">

    <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4">

      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
        <Megaphone
          size={20}
        />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">
          Admin Announcements
        </h2>

        <p className="text-xs text-slate-500">
          Important messages
          from RK Nexora
        </p>
      </div>

    </div>


    <div className="divide-y divide-slate-100">

      {adminMessages
        .slice(0, 5)
        .map(
          (
            item: any,
          ) => (
            <div
              key={
                item.id
              }
              className="p-5"
            >

              <div className="flex items-start gap-3">

                <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                  <Bell
                    size={
                      17
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-start justify-between gap-2">

                    <h3 className="font-bold text-slate-900">
                      {
                        item.title
                      }
                    </h3>

                    {!item.read_at &&
                      !item.is_read && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                          New
                        </span>
                      )}

                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {
                      item.message
                    }
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {formatDate(
                      item.created_at ||
                        item.createdAt,
                    )}
                  </p>

                </div>

              </div>

            </div>
          ),
        )}

    </div>

  </section>
)}

{internshipStarted ? (
  <AttendanceCheckInCard
    onAttendanceUpdated={() => {
      void loadDashboard();
    }}
  />
) : (
  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <LockKeyhole
          size={26}
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Attendance Locked
        </p>

        <h2 className="mt-1 text-lg font-bold text-slate-900">
          {student.internship_status ===
          "completed"
            ? "Internship Completed"
            : student.internship_status ===
                "blocked"
              ? "Internship Access Blocked"
              : internshipStartDate
                ? "Your Internship Has Not Started Yet"
                : "Waiting for Administrator"}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {student.internship_status ===
          "completed"
            ? "Attendance check-in is closed because your internship has been completed."
            : student.internship_status ===
                "blocked"
              ? "Your internship access is currently blocked."
              : internshipStartDate
                ? `Attendance will automatically become available from ${formatInternshipStartDate(
                    internshipStartDate,
                  )}.`
                : "The administrator has not assigned your internship start date yet."}
        </p>
      </div>
    </div>
  </section>
)}

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
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-bold text-slate-900">
        Learning Summary
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Continue your course and complete pending chapters.
      </p>
    </div>

    <Link
      href="/student/learning"
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      <BookOpen size={17} />
      Go to Learning
    </Link>
  </div>

  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <p className="mt-1 text-xs text-blue-600">
        {formatPercentage(
          stats.course_progress,
        )} complete
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

      <p className="mt-1 text-xs text-emerald-600">
        {stats.hours_remaining} hours remaining
      </p>
    </div>

    <div className="rounded-xl bg-violet-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Quizzes Passed
        </p>

        <BrainCircuit
          size={20}
          className="text-violet-600"
        />
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {stats.quizzes_passed}
        <span className="text-base font-medium text-slate-400">
          /{stats.total_quizzes}
        </span>
      </p>

      <p className="mt-1 text-xs text-violet-600">
        {formatPercentage(
          stats.quiz_progress,
        )} passed
      </p>
    </div>

    <div className="rounded-xl bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Quiz Average
        </p>

        <Trophy
          size={20}
          className="text-amber-600"
        />
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {formatPercentage(
          stats.quiz_average,
        )}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {stats.total_quiz_attempts} total{" "}
        {stats.total_quiz_attempts === 1
          ? "attempt"
          : "attempts"}
      </p>
    </div>

    <div className="rounded-xl bg-cyan-50 p-4">
      <p className="text-sm text-slate-500">
        Logbook Entries
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {stats.logbook_entries}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {stats.logbook_hours} logged hours
      </p>
    </div>

    <div className="rounded-xl bg-orange-50 p-4">
      <p className="text-sm text-slate-500">
        Assignments
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {stats.assignments_completed}
        <span className="text-base font-medium text-slate-400">
          /{stats.assignments_total}
        </span>
      </p>

      <p className="mt-1 text-xs text-orange-600">
        {stats.assignments_total === 0
          ? "Not Required"
          : `${formatPercentage(
              stats.assignment_progress,
            )} complete`}
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
  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <p className="text-sm font-semibold text-blue-600">
        Internship Completion
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-900">
        {eligibility.eligible
          ? "Internship requirements completed"
          : "Complete the remaining requirements"}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Complete all required activities to become
        eligible for your internship certificate.
      </p>
    </div>

    <span
      className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
        eligibility.eligible
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {eligibility.eligible
        ? "Certificate Eligible"
        : "In Progress"}
    </span>
  </div>

  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {/* Chapters */}
    <div
      className={`rounded-xl border p-4 ${
        eligibility.checks.chapters_completed
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {eligibility.checks.chapters_completed ? (
          <CheckCircle2
            size={19}
            className="text-green-600"
          />
        ) : (
          <Clock3
            size={19}
            className="text-slate-400"
          />
        )}

        <p className="font-semibold">
          Chapters
        </p>
      </div>

      <p className="mt-3 text-xl font-bold">
        {eligibility.progress.chapters.completed}
        <span className="text-sm font-medium text-slate-400">
          /{eligibility.progress.chapters.total}
        </span>
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatPercentage(
          eligibility.progress.chapters.percentage,
        )} complete
      </p>
    </div>

    {/* Quizzes */}
    <div
      className={`rounded-xl border p-4 ${
        eligibility.checks.quizzes_passed
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {eligibility.checks.quizzes_passed ? (
          <CheckCircle2
            size={19}
            className="text-green-600"
          />
        ) : (
          <Clock3
            size={19}
            className="text-slate-400"
          />
        )}

        <p className="font-semibold">
          Quizzes
        </p>
      </div>

      <p className="mt-3 text-xl font-bold">
        {eligibility.progress.quizzes.passed}
        <span className="text-sm font-medium text-slate-400">
          /{eligibility.progress.quizzes.total}
        </span>
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatPercentage(
          eligibility.progress.quizzes.percentage,
        )} passed
      </p>
    </div>

    {/* Assignments */}
    <div
      className={`rounded-xl border p-4 ${
        eligibility.checks.assignments_completed
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {eligibility.checks.assignments_completed ? (
          <CheckCircle2
            size={19}
            className="text-green-600"
          />
        ) : (
          <Clock3
            size={19}
            className="text-slate-400"
          />
        )}

        <p className="font-semibold">
          Assignments
        </p>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {eligibility.progress.assignments.total === 0
          ? "Not Required"
          : `${eligibility.progress.assignments.approved}/${eligibility.progress.assignments.total} Approved`}
      </p>
    </div>

    {/* Learning Hours */}
<div
  className={`rounded-xl border p-4 ${
    eligibility.checks.required_hours_completed
      ? "border-green-200 bg-green-50"
      : "border-slate-200 bg-slate-50"
  }`}
>
  <div className="flex items-center gap-2">
    {eligibility.checks.required_hours_completed ? (
      <CheckCircle2
        size={19}
        className="text-green-600"
      />
    ) : (
      <Clock3
        size={19}
        className="text-slate-400"
      />
    )}

    <p className="font-semibold">
      Learning Hours
    </p>
  </div>

  <p className="mt-3 text-xl font-bold">
    {eligibility.progress.learning_hours.completed}

    <span className="text-sm font-medium text-slate-400">
      /{eligibility.progress.learning_hours.required}
    </span>
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {eligibility.progress.learning_hours.remaining} hours remaining
  </p>
</div>

{/* Attendance */}
<div
  className={`rounded-xl border p-4 ${
    eligibility.checks.attendance_completed
      ? "border-green-200 bg-green-50"
      : "border-slate-200 bg-slate-50"
  }`}
>
  <div className="flex items-center gap-2">
    {eligibility.checks.attendance_completed ? (
      <CheckCircle2
        size={19}
        className="text-green-600"
      />
    ) : (
      <Clock3
        size={19}
        className="text-slate-400"
      />
    )}

    <p className="font-semibold">
      Attendance
    </p>
  </div>

  <p className="mt-3 text-xl font-bold">
    {formatPercentage(
      eligibility.progress.attendance.percentage,
    )}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    Minimum{" "}
    {formatPercentage(
      eligibility.progress.attendance.minimum_required,
    )} required
  </p>
</div>

    {/* Live Project */}
    <div
      className={`rounded-xl border p-4 ${
        eligibility.checks.project_approved
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {eligibility.checks.project_approved ? (
          <CheckCircle2
            size={19}
            className="text-green-600"
          />
        ) : (
          <Clock3
            size={19}
            className="text-slate-400"
          />
        )}

        <p className="font-semibold">
          Live Project
        </p>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-600">
        {eligibility.checks.project_approved
          ? "Approved"
          : "Pending"}
      </p>
    </div>

    {/* Report */}
    <div
      className={`rounded-xl border p-4 ${
        eligibility.checks.report_approved
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {eligibility.checks.report_approved ? (
          <CheckCircle2
            size={19}
            className="text-green-600"
          />
        ) : (
          <Clock3
            size={19}
            className="text-slate-400"
          />
        )}

        <p className="font-semibold">
          Internship Report
        </p>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-600">
        {eligibility.checks.report_approved
          ? "Approved"
          : "Pending"}
      </p>
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