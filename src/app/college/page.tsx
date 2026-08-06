"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import {
  AlertCircle,
  Award,
  BadgeIndianRupee,
  BookOpenCheck,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import {
  BarAnalytics,
  PieAnalytics,
} from "@/components/charts";

import {
  Button,
} from "@/components/ui";

import {
  collegeService,
  type CollegeDashboardData,
} from "@/lib/services";

const numberFormatter =
  new Intl.NumberFormat(
    "en-IN",
  );

const currencyFormatter =
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  );

const formatNumber = (
  value?: number | null,
) =>
  numberFormatter.format(
    Number(value || 0),
  );

const formatCurrency = (
  value?: number | null,
) =>
  currencyFormatter.format(
    Number(value || 0),
  );

const formatPercentage = (
  value?: number | null,
) =>
  `${Number(value || 0).toFixed(
    1,
  )}%`;

const getCollegeLogoUrl = (
  logo?: string | null,
) => {
  if (!logo) {
    return null;
  }

  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://")
  ) {
    return logo;
  }

  const backendUrl = String(
    process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api",
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  return `${backendUrl}${
    logo.startsWith("/")
      ? logo
      : `/${logo}`
  }`;
};

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
    requestError.response
      ?.data?.message ||
    requestError.message ||
    "Dashboard could not be loaded"
  );
};

const statusClasses:
  Record<string, string> = {
    active:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/15",

    completed:
      "bg-blue-50 text-blue-700 ring-blue-600/15",

    paid:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/15",

    pending:
      "bg-amber-50 text-amber-700 ring-amber-600/15",

    preloaded:
      "bg-amber-50 text-amber-700 ring-amber-600/15",

    registered:
      "bg-violet-50 text-violet-700 ring-violet-600/15",

    blocked:
      "bg-red-50 text-red-700 ring-red-600/15",

    failed:
      "bg-red-50 text-red-700 ring-red-600/15",
  };

export default function CollegeDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<CollegeDashboardData | null>(
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
    error,
    setError,
  ] = useState("");

  const loadDashboard =
    useCallback(
      async (
        refresh = false,
      ) => {
        refresh
          ? setRefreshing(true)
          : setLoading(true);

        setError("");

        try {
          const response =
            await collegeService
              .dashboard();

          setDashboard(
            response.data.data,
          );
        } catch (
          requestError
        ) {
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

  const registrationData =
    useMemo(
      () =>
        (
          dashboard
            ?.monthly_registrations ||
          []
        ).map((item) => ({
          name: item.month,
          value:
            item.registrations,
        })),
      [
        dashboard
          ?.monthly_registrations,
      ],
    );

  const domainData =
    useMemo(
      () =>
        (
          dashboard
            ?.domain_distribution ||
          []
        )
          .slice(0, 6)
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

  const recentStudents =
    dashboard?.recent_students ||
    [];

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load
            dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Button
            className="mt-5"
            onClick={() => {
              void loadDashboard();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* College Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#071a2f] px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(59,130,246,0.25),transparent_34%)]" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
           <CollegeLogo
  logo={dashboard?.college.logo}
  name={
    dashboard?.college.name ||
    "College"
  }
/>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                  {dashboard
                    ?.college
                    .code ||
                    "College"}
                </span>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  {dashboard
                    ?.college
                    .status ||
                    "Active"}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
                {dashboard
                  ?.college
                  .name}
              </h1>

              <p className="mt-2 text-sm text-white/65 sm:text-base">
                {dashboard
                  ?.college
                  .university ||
                  "Internship ERP Management"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={refreshing}
            onClick={() => {
              void loadDashboard(
                true,
              );
            }}
            className="h-11 border-white/10 bg-white/10 text-white hover:bg-white/15"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh Data
          </Button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Students"
          value={formatNumber(
            summary?.total_students,
          )}
          helper={`${formatNumber(
            summary?.pending_students,
          )} registration pending`}
          icon={Users}
          href="/college/students"
          tone="blue"
        />

        <MetricCard
          label="Active Internships"
          value={formatNumber(
            summary?.active_students,
          )}
          helper={`${formatNumber(
            summary?.completed_students,
          )} completed`}
          icon={ClipboardCheck}
          href="/college/students?status=active"
          tone="emerald"
        />

        <MetricCard
          label="Average Progress"
          value={formatPercentage(
            summary?.average_progress,
          )}
          helper={`${formatPercentage(
            summary?.completion_rate,
          )} completion rate`}
          icon={TrendingUp}
          tone="violet"
        />

        <MetricCard
          label="Revenue Collected"
          value={formatCurrency(
            summary?.estimated_revenue,
          )}
          helper={`${formatNumber(
            summary?.paid_students,
          )} paid students`}
          icon={CircleDollarSign}
          tone="amber"
        />
      </section>

      {/* Compact Operational Summary */}
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Operational Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current registration,
              assignment and document
              status
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CompactStat
            label="Pending Students"
            value={summary?.pending_students}
            icon={Clock3}
            className="bg-amber-50 text-amber-700"
          />

          <CompactStat
            label="Mentor Assigned"
            value={summary?.assigned_students}
            icon={UserCheck}
            className="bg-blue-50 text-blue-700"
          />

          <CompactStat
            label="Unassigned"
            value={summary?.unassigned_students}
            icon={UserRoundX}
            className="bg-red-50 text-red-700"
          />

          <CompactStat
            label="Certificates"
            value={summary?.certificates_generated}
            icon={Award}
            className="bg-violet-50 text-violet-700"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Panel
          title="Registration Trend"
          description="Student registrations during the last 12 months"
          action={
            <Link
              href="/college/registrations"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View registrations
            </Link>
          }
        >
          {registrationData.length >
          0 ? (
            <div className="min-h-[300px]">
              <BarAnalytics
                data={
                  registrationData
                }
              />
            </div>
          ) : (
            <EmptyState message="No registration data available" />
          )}
        </Panel>

        <Panel
          title="Domain Distribution"
          description="Students grouped by internship domain"
        >
          {domainData.length >
          0 ? (
            <div className="min-h-[300px]">
              <PieAnalytics
                data={
                  domainData
                }
              />
            </div>
          ) : (
            <EmptyState message="No domain data available" />
          )}
        </Panel>
      </section>

      {/* Payment and Progress Summary */}
      <section className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Payment Summary"
          description="Payment status of college students"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryRow
              label="Paid Students"
              value={
                summary?.paid_students
              }
              icon={CheckCircle2}
              className="bg-emerald-50 text-emerald-700"
            />

            <SummaryRow
              label="Pending for Payments"
              value={
                summary?.pending_payments
              }
              icon={Clock3}
              className="bg-amber-50 text-amber-700"
            />

            <SummaryRow
              label="Failed Payments"
              value={
                summary?.failed_payments
              }
              icon={AlertCircle}
              className="bg-red-50 text-red-700"
            />

            <SummaryRow
              label="Payment Rate"
              textValue={formatPercentage(
                summary?.payment_rate,
              )}
              icon={BadgeIndianRupee}
              className="bg-blue-50 text-blue-700"
            />
          </div>
        </Panel>

        <Panel
          title="Revenue Distribution"
          description="College and RKNexora revenue share"
        >
          <div className="space-y-4">
            <RevenueRow
              label="Total Collected"
              value={summary?.estimated_revenue}
              percentage={100}
            />

            <RevenueRow
              label="College Share"
              value={
                summary?.college_share_amount
              }
              percentage={
                summary?.estimated_revenue
                  ? Number(
                      (
                        (Number(
                          summary.college_share_amount,
                        ) /
                          Number(
                            summary.estimated_revenue,
                          )) *
                        100
                      ).toFixed(
                        1,
                      ),
                    )
                  : 0
              }
            />

            <RevenueRow
              label="RKNexora Share"
              value={
                summary?.rknexora_share_amount
              }
              percentage={
                summary?.estimated_revenue
                  ? Number(
                      (
                        (Number(
                          summary.rknexora_share_amount,
                        ) /
                          Number(
                            summary.estimated_revenue,
                          )) *
                        100
                      ).toFixed(
                        1,
                      ),
                    )
                  : 0
              }
            />
          </div>
        </Panel>
      </section>

      {/* Recent Students */}
      <Panel
        title="Recent Students"
        description="Latest students registered under this college"
        action={
          <Link
            href="/college/students"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View all students
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-3 font-bold">
                  Student
                </th>

                <th className="px-3 py-3 font-bold">
                  Domain
                </th>

                <th className="px-3 py-3 font-bold">
                  Session
                </th>

                <th className="px-3 py-3 font-bold">
                  Internship
                </th>

                <th className="px-3 py-3 font-bold">
                  Payment
                </th>

                <th className="px-3 py-3 font-bold">
                  Progress
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentStudents.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-12 text-center text-sm text-slate-500"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                recentStudents.map(
                  (student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-4">
                        <p className="font-bold text-slate-900">
                          {student.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            student.registration_number
                          }
                        </p>
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {student.domain
                          ?.domain_name ||
                          "-"}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {student.session ||
                          "-"}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge
                          value={
                            student.internship_status
                          }
                        />
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge
                          value={
                            student.payment_status
                          }
                        />
                      </td>

                      <td className="px-3 py-4">
                        <ProgressBar
                          value={Number(
                            student.total_progress ||
                              0,
                          )}
                        />
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  href,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{
    className?: string;
  }>;
  href?: string;
  tone:
    | "blue"
    | "emerald"
    | "violet"
    | "amber";
}) {
  const tones = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      line:
        "bg-blue-500",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-600",
      line:
        "bg-emerald-500",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-600",
      line:
        "bg-violet-500",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      line:
        "bg-amber-500",
    },
  };

  const content = (
    <div className="group relative h-full overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${tones[tone].line}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {helper}
          </p>
        </div>

        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tones[tone].icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href}>
      {content}
    </Link>
  ) : (
    content
  );
}

function CompactStat({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value?: number;
  icon: ComponentType<{
    className?: string;
  }>;
  className: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${className}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xl font-black text-slate-900">
          {formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-black text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  textValue,
  icon: Icon,
  className,
}: {
  label: string;
  value?: number;
  textValue?: string;
  icon: ComponentType<{
    className?: string;
  }>;
  className: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div
        className={`grid h-10 w-10 place-items-center rounded-xl ${className}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xl font-black text-slate-900">
          {textValue ||
            formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

function RevenueRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value?: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600">
          {label}
        </p>

        <div className="text-right">
          <p className="font-black text-slate-900">
            {formatCurrency(
              value,
            )}
          </p>

          <p className="text-xs text-slate-400">
            {percentage.toFixed(
              1,
            )}
            %
          </p>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                percentage,
              ),
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${
        statusClasses[value] ||
        "bg-slate-50 text-slate-600 ring-slate-500/15"
      }`}
    >
      {value.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function ProgressBar({
  value,
}: {
  value: number;
}) {
  const safeValue =
    Math.min(
      100,
      Math.max(0, value),
    );

  return (
    <div className="w-32">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          {safeValue.toFixed(
            0,
          )}
          %
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="grid min-h-[280px] place-items-center">
      <div className="text-center">
        <BookOpenCheck className="mx-auto h-9 w-9 text-slate-300" />

        <p className="mt-3 text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

function CollegeLogo({
  logo,
  name,
}: {
  logo?: string | null;
  name: string;
}) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const logoUrl =
    getCollegeLogoUrl(logo);

  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white p-1.5 text-cyan-300 ring-1 ring-white/10">
      {logoUrl && !imageFailed ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          onError={() =>
            setImageFailed(true)
          }
        />
      ) : (
        <GraduationCap className="h-7 w-7" />
      )}
    </div>
  );
}