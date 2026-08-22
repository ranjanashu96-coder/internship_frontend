"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Loader2,
  RefreshCcw,
  TrendingUp,
  UserCheck,
  UserRoundX,
  Users,
  MessageSquare,
  Send,
  Search,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  BarAnalytics,
  PieAnalytics,
} from "@/components/charts";

import {
  StatCard,
} from "@/components/stat-card";

import {
  Badge,
  Button,
} from "@/components/ui";

import {
  adminService,
  type AdminDashboardData,
    type AdminMessageStudent,
} from "@/lib/services";

const numberFormatter =
  new Intl.NumberFormat("en-IN");

const formatNumber = (
  value?: number | null,
) =>
  numberFormatter.format(
    Number(value || 0),
  );

const formatPercentage = (
  value?: number | null,
) =>
  `${Number(value || 0).toFixed(1)}%`;

const getErrorMessage = (
  error: unknown,
) => {
  const requestError =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

  return (
    requestError.response?.data
      ?.message ||
    requestError.message ||
    "Failed to load admin dashboard"
  );
};

const getStatusTone = (
  status?: string,
) => {
  switch (status) {
    case "active":
    case "completed":
    case "paid":
      return "green" as const;

    case "blocked":
    case "failed":
    case "inactive":
      return "red" as const;

    default:
      return "amber" as const;
  }
};

export default function AdminDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboardData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
  messageOpen,
  setMessageOpen,
] = useState(false);

const [
  messageTitle,
  setMessageTitle,
] = useState("");

const [
  messageText,
  setMessageText,
] = useState("");

const [
  recipientMode,
  setRecipientMode,
] =
  useState<
    "all" | "selected"
  >("all");

const [
  paidStudents,
  setPaidStudents,
] =
  useState<
    AdminMessageStudent[]
  >([]);

const [
  selectedStudentIds,
  setSelectedStudentIds,
] =
  useState<number[]>([]);

const [
  studentSearch,
  setStudentSearch,
] = useState("");

const [
  loadingStudents,
  setLoadingStudents,
] = useState(false);

const [
  sendingMessage,
  setSendingMessage,
] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadDashboard =
    useCallback(
      async (
        showRefreshLoader =
          false,
      ) => {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const response =
            await adminService.dashboard();

          setDashboard(
            response.data.data,
          );
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summary =
    dashboard?.summary;

  const registrationChartData =
    useMemo(
      () =>
        (
          dashboard
            ?.monthly_registrations ??
          []
        ).map((item) => ({
          name: item.label,
          value:
            item.registrations,
        })),
      [
        dashboard
          ?.monthly_registrations,
      ],
    );

  const domainChartData =
    useMemo(
      () =>
        (
          dashboard
            ?.domain_distribution ??
          []
        )
          .slice(0, 7)
          .map((item) => ({
            name:
              item.domain_name,
            value:
              item.student_count,
          })),
      [
        dashboard
          ?.domain_distribution,
      ],
    );

  const topColleges =
    dashboard?.college_distribution
      ?.slice(0, 8) ?? [];

  const recentStudents =
    dashboard?.recent_students ??
    [];

  const loadPaidStudents =
  async () => {
    try {
      setLoadingStudents(true);

      const response =
        await adminService
          .messagePaidStudents(
            studentSearch,
          );

      setPaidStudents(
        response.data.data
          .items || [],
      );
    } catch (requestError: any) {
      toast.error(
        requestError
          ?.response
          ?.data
          ?.message ||
          "Unable to load paid students",
      );
    } finally {
      setLoadingStudents(
        false,
      );
    }
  };


const openMessageBox =
  async () => {
    setMessageOpen(true);

    if (
      recipientMode ===
      "selected"
    ) {
      await loadPaidStudents();
    }
  };


const toggleStudent =
  (studentId: number) => {
    setSelectedStudentIds(
      (current) =>
        current.includes(
          studentId,
        )
          ? current.filter(
              (id) =>
                id !== studentId,
            )
          : [
              ...current,
              studentId,
            ],
    );
  };


const toggleAllVisible =
  () => {
    const visibleIds =
      paidStudents.map(
        (student) =>
          student.id,
      );

    const allSelected =
      visibleIds.every(
        (id) =>
          selectedStudentIds.includes(
            id,
          ),
      );

    if (allSelected) {
      setSelectedStudentIds(
        (current) =>
          current.filter(
            (id) =>
              !visibleIds.includes(
                id,
              ),
          ),
      );

      return;
    }

    setSelectedStudentIds(
      (current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ],
    );
  };


const handleSendMessage =
  async () => {
    const title =
      messageTitle.trim();

    const message =
      messageText.trim();

    if (!title) {
      toast.error(
        "Enter message title",
      );

      return;
    }

    if (!message) {
      toast.error(
        "Enter message",
      );

      return;
    }

    if (
      recipientMode ===
        "selected" &&
      selectedStudentIds.length ===
        0
    ) {
      toast.error(
        "Select at least one student",
      );

      return;
    }

    try {
      setSendingMessage(true);

      const response =
        await adminService
          .sendStudentMessage({
            title,
            message,
            mode:
              recipientMode,

            student_ids:
              recipientMode ===
              "selected"
                ? selectedStudentIds
                : undefined,
          });

      const result =
        response.data.data;

      toast.success(
        `Message sent to ${result.sent_count} student(s)`,
      );

      setMessageTitle("");
      setMessageText("");
      setSelectedStudentIds(
        [],
      );
      setRecipientMode(
        "all",
      );
      setMessageOpen(false);
    } catch (requestError: any) {
      toast.error(
        requestError
          ?.response
          ?.data
          ?.message ||
          "Unable to send message",
      );
    } finally {
      setSendingMessage(
        false,
      );
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading admin
            dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertCircle
              size={24}
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Dashboard could not
            be loaded
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={() => {
              void loadDashboard();
            }}
          >
            <RefreshCcw
              size={16}
              className="mr-2"
            />

            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
     <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
  <div>
    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
      Admin Dashboard
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Monitor colleges,
      mentors, students,
      payments and internship
      performance.
    </p>
  </div>

  <div className="flex flex-wrap gap-2">
    <Button
      type="button"
      onClick={() => {
        void openMessageBox();
      }}
    >
      <MessageSquare
        size={16}
        className="mr-2"
      />

      Send Message
    </Button>

    <Button
      type="button"
      variant="secondary"
      disabled={refreshing}
      onClick={() => {
        void loadDashboard(
          true,
        );
      }}
    >
      <RefreshCcw
        size={16}
        className={`mr-2 ${
          refreshing
            ? "animate-spin"
            : ""
        }`}
      />

      Refresh
    </Button>
  </div>
</div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertCircle
            size={18}
          />

          {error}
        </div>
      )}

      {/* Primary statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/students">
          <StatCard
            label="Total Students"
            value={formatNumber(
              summary?.total_students,
            )}
            icon={Users}
            helper={`${formatNumber(
              summary?.active_students,
            )} active students`}
          />
        </Link>

        <Link href="/admin/colleges">
          <StatCard
            label="Total Colleges"
            value={formatNumber(
              summary?.total_colleges,
            )}
            icon={Building2}
            helper={`${formatNumber(
              summary?.active_colleges,
            )} active colleges`}
          />
        </Link>

        <Link href="/admin/mentors">
          <StatCard
            label="Total Mentors"
            value={formatNumber(
              summary?.total_mentors,
            )}
            icon={UserCheck}
            helper={`${formatNumber(
              summary?.active_mentors,
            )} active mentors`}
          />
        </Link>

        <Link href="/admin/students?status=active">
          <StatCard
            label="Active Internships"
            value={formatNumber(
              summary?.active_students,
            )}
            icon={ClipboardCheck}
            helper={`${formatNumber(
              summary?.completed_students,
            )} completed`}
          />
        </Link>
      </div>

      {/* Secondary statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/students?status=completed">
          <StatCard
            label="Completion Rate"
            value={formatPercentage(
              summary?.completion_rate,
            )}
            icon={TrendingUp}
            helper={`${formatNumber(
              summary?.completed_students,
            )} completed students`}
          />
        </Link>

        <Link href="/admin/students?payment_status=paid">
          <StatCard
            label="Payment Rate"
            value={formatPercentage(
              summary?.payment_rate,
            )}
            icon={CreditCard}
            helper={`${formatNumber(
              summary?.paid_students,
            )} paid students`}
          />
        </Link>

        <Link href="/admin/students?mentor_id=unassigned">
          <StatCard
            label="Unassigned Students"
            value={formatNumber(
              summary?.unassigned_students,
            )}
            icon={UserRoundX}
            helper="Mentor assignment required"
          />
        </Link>

        <Link href="/admin/learning">
          <StatCard
            label="Total Domains"
            value={formatNumber(
              summary?.total_domains,
            )}
            icon={GraduationCap}
            helper="Available learning domains"
          />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Monthly Student
              Registrations
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Registrations recorded
              during the last 12 months
            </p>
          </div>

          <div className="p-5">
            {registrationChartData.length >
            0 ? (
              <BarAnalytics
                data={
                  registrationChartData
                }
              />
            ) : (
              <div className="grid min-h-72 place-items-center text-sm text-slate-500">
                No registration data
                available
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Domain-wise Students
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Distribution across
              internship domains
            </p>
          </div>

          <div className="p-5">
            {domainChartData.length >
            0 ? (
              <PieAnalytics
                data={
                  domainChartData
                }
              />
            ) : (
              <div className="grid min-h-72 place-items-center text-sm text-slate-500">
                No domain data
                available
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">
                Paid Students
              </p>

              <p className="mt-2 text-3xl font-black text-green-900">
                {formatNumber(
                  summary?.paid_students,
                )}
              </p>
            </div>

            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-700">
                Pending Payments
              </p>

              <p className="mt-2 text-3xl font-black text-yellow-900">
                {formatNumber(
                  summary?.pending_payments,
                )}
              </p>
            </div>

            <CreditCard className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">
                Blocked Students
              </p>

              <p className="mt-2 text-3xl font-black text-red-900">
                {formatNumber(
                  summary?.blocked_students,
                )}
              </p>
            </div>

            <UserRoundX className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Pending Colleges
              </p>

              <p className="mt-2 text-3xl font-black text-blue-900">
                {formatNumber(
                  summary?.pending_colleges,
                )}
              </p>
            </div>

            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        {/* Recent students */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Students
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest student
                registrations
              </p>
            </div>

            <Link
              href="/admin/students"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    Student
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    College
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Domain
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Payment
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentStudents.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No students found
                    </td>
                  </tr>
                ) : (
                  recentStudents.map(
                    (student) => (
                      <tr
                        key={
                          student.id
                        }
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600"
                          >
                            {
                              student.name
                            }
                          </Link>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              student.registration_number
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student
                            .college
                            ?.name ??
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student
                            .domain
                            ?.domain_name ??
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            tone={getStatusTone(
                              student.internship_status,
                            )}
                          >
                            {
                              student.internship_status
                            }
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            tone={getStatusTone(
                              student.payment_status,
                            )}
                          >
                            {
                              student.payment_status
                            }
                          </Badge>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* College ranking */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Top Colleges
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Ranked by number of
                students
              </p>
            </div>

            <Link
              href="/admin/colleges"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topColleges.length ===
            0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No college data
                available
              </div>
            ) : (
              topColleges.map(
                (
                  college,
                  index,
                ) => {
                  const maximum =
                    topColleges[0]
                      ?.student_count ||
                    1;

                  const percentage =
                    Math.min(
                      100,
                      Math.round(
                        (college.student_count /
                          maximum) *
                          100,
                      ),
                    );

                  return (
                    <Link
                      key={
                        college.college_id
                      }
                      href={`/admin/colleges/${college.college_id}`}
                      className="block px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                            {index +
                              1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {
                                college.college_name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {college.college_code ??
                                "No code"}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-slate-900">
                          {formatNumber(
                            college.student_count,
                          )}
                        </p>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </Link>
                  );
                },
              )
            )}
          </div>
        </section>
      </div>
      {messageOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

    <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Send Student Message
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Message will only be
            sent to paid students.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setMessageOpen(
              false,
            )
          }
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>
      </div>


      {/* Body */}

      <div className="flex-1 space-y-5 overflow-y-auto p-6">

        {/* Title */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Message Title
          </label>

          <input
            value={
              messageTitle
            }
            onChange={(event) =>
              setMessageTitle(
                event.target
                  .value,
              )
            }
            maxLength={150}
            placeholder="Example: Important Internship Notice"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>


        {/* Message */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Message
          </label>

          <textarea
            value={
              messageText
            }
            onChange={(event) =>
              setMessageText(
                event.target
                  .value,
              )
            }
            rows={5}
            maxLength={5000}
            placeholder="Type your message here..."
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {
              messageText.length
            }
            /5000
          </p>
        </div>


        {/* Recipient Mode */}

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Send To
          </label>

          <div className="grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={() => {
                setRecipientMode(
                  "all",
                );

                setSelectedStudentIds(
                  [],
                );
              }}
              className={`rounded-xl border p-4 text-left transition ${
                recipientMode ===
                "all"
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="font-semibold text-slate-900">
                All Paid Students
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Message all students
                whose payment is paid.
              </p>
            </button>


            <button
              type="button"
              onClick={() => {
                setRecipientMode(
                  "selected",
                );

                if (
                  !paidStudents
                    .length
                ) {
                  void loadPaidStudents();
                }
              }}
              className={`rounded-xl border p-4 text-left transition ${
                recipientMode ===
                "selected"
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="font-semibold text-slate-900">
                Selected Students
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Select specific paid
                students.
              </p>
            </button>

          </div>
        </div>


        {/* Selected Student List */}

        {recipientMode ===
          "selected" && (
          <div className="overflow-hidden rounded-xl border border-slate-200">

            <div className="border-b border-slate-200 bg-slate-50 p-3">

              <div className="flex gap-2">

                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={
                      studentSearch
                    }
                    onChange={(
                      event,
                    ) =>
                      setStudentSearch(
                        event
                          .target
                          .value,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        void loadPaidStudents();
                      }
                    }}
                    placeholder="Search name or registration number"
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void loadPaidStudents();
                  }}
                >
                  Search
                </Button>

              </div>

              <div className="mt-3 flex items-center justify-between">

                <button
                  type="button"
                  onClick={
                    toggleAllVisible
                  }
                  className="text-sm font-semibold text-blue-600"
                >
                  Select All Visible
                </button>

                <span className="text-xs text-slate-500">
                  {
                    selectedStudentIds.length
                  }{" "}
                  selected
                </span>

              </div>
            </div>


            <div className="max-h-[270px] overflow-y-auto">

              {loadingStudents ? (
                <div className="grid place-items-center py-10">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : paidStudents.length ===
                0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No paid students
                  found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">

                  {paidStudents.map(
                    (student) => {

                      const selected =
                        selectedStudentIds.includes(
                          student.id,
                        );

                      return (
                        <label
                          key={
                            student.id
                          }
                          className={`flex cursor-pointer items-start gap-3 p-4 transition ${
                            selected
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleStudent(
                                student.id,
                              )
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />

                          <div className="min-w-0 flex-1">

                            <p className="font-semibold text-slate-900">
                              {
                                student.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                student.registration_number
                              }

                              {student
                                .college
                                ?.name
                                ? ` • ${student.college.name}`
                                : ""}

                              {student
                                .domain
                                ?.domain_name
                                ? ` • ${student.domain.domain_name}`
                                : ""}
                            </p>

                          </div>

                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Paid
                          </span>
                        </label>
                      );
                    },
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </div>


      {/* Footer */}

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

        <p className="text-xs text-slate-500">
          {recipientMode ===
          "all"
            ? "All paid students will receive this message."
            : `${selectedStudentIds.length} student(s) selected.`}
        </p>

        <div className="flex gap-2">

          <Button
            type="button"
            variant="secondary"
            disabled={
              sendingMessage
            }
            onClick={() =>
              setMessageOpen(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              sendingMessage
            }
            onClick={() => {
              void handleSendMessage();
            }}
          >
            {sendingMessage ? (
              <Loader2
                size={16}
                className="mr-2 animate-spin"
              />
            ) : (
              <Send
                size={16}
                className="mr-2"
              />
            )}

            {sendingMessage
              ? "Sending..."
              : "Send Message"}
          </Button>

        </div>

      </div>

    </div>

  </div>
)}
    </div>
  );
}