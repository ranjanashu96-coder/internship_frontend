"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  BadgeIndianRupee,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  FilterX,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import {
  adminService,
  type AdminReportData,
  type AdminReportParams,
  type AdminReportType,
  type AdminDomain,
} from "@/lib/services";

import type { College } from "@/types";

const initialFilters: AdminReportParams = {
  report_type: "student_registration",
  page: 1,
  limit: 20,
  search: "",
  college_id: "",
  domain_id: "",
  session: "",
  semester: "",
  internship_status: "",
  payment_status: "",
  from_date: "",
  to_date: "",
};

const reportOptions: Array<{
  value: AdminReportType;
  label: string;
  shortLabel: string;
  description: string;
  icon: ComponentType<{
    className?: string;
  }>;
  tone: string;
}> = [
  {
    value: "student_registration",
    label: "Student Registration Report",
    shortLabel: "Registrations",
    description:
      "Registration, college, domain and account status.",
    icon: Users,
    tone:
      "bg-blue-50 text-blue-700 ring-blue-600/10",
  },
  {
    value: "attendance",
    label: "Attendance Report",
    shortLabel: "Attendance",
    description:
      "Student-wise attendance days, hours and percentage.",
    icon: CalendarDays,
    tone:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
  },
  {
    value: "completion",
    label: "Completion Report",
    shortLabel: "Completion",
    description:
      "Internship progress, completion and certificate status.",
    icon: ClipboardCheck,
    tone:
      "bg-violet-50 text-violet-700 ring-violet-600/10",
  },
  {
    value: "payment",
    label: "Payment Report",
    shortLabel: "Payments",
    description:
      "Transactions, payment status and collected revenue.",
    icon: CircleDollarSign,
    tone:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },
];

const selectClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const numberFormatter =
  new Intl.NumberFormat("en-IN");

const currencyFormatter =
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const statusClasses: Record<
  string,
  string
> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  completed:
    "bg-blue-50 text-blue-700 ring-blue-600/15",
  paid:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  present:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  registered:
    "bg-violet-50 text-violet-700 ring-violet-600/15",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/15",
  preloaded:
    "bg-amber-50 text-amber-700 ring-amber-600/15",
  half_day:
    "bg-orange-50 text-orange-700 ring-orange-600/15",
  blocked:
    "bg-red-50 text-red-700 ring-red-600/15",
  failed:
    "bg-red-50 text-red-700 ring-red-600/15",
  absent:
    "bg-red-50 text-red-700 ring-red-600/15",
  refunded:
    "bg-slate-100 text-slate-700 ring-slate-600/15",
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  const requestError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    requestError.response?.data?.message ||
    requestError.message ||
    fallback
  );
};

const formatValue = (
  value: unknown,
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const downloadBlob = (
  blob: Blob,
  fileName: string,
) => {
  const url =
    window.URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
};

const isStatusColumn = (
  key: string,
) =>
  key.includes("status") ||
  key === "certificate_generated";

const isProgressColumn = (
  key: string,
) =>
  key.includes("progress") ||
  key.includes("percentage");

const isAmountColumn = (
  key: string,
) =>
  key === "amount" ||
  key.includes("revenue");

export default function AdminReportsPage() {
  const [filters, setFilters] =
    useState<AdminReportParams>(
      initialFilters,
    );

  const [report, setReport] =
    useState<AdminReportData | null>(
      null,
    );

  const [colleges, setColleges] =
    useState<College[]>([]);

  const [domains, setDomains] =
    useState<AdminDomain[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState<"excel" | "pdf" | null>(
      null,
    );

  const selectedReport = useMemo(
    () =>
      reportOptions.find(
        (item) =>
          item.value ===
          filters.report_type,
      ) || reportOptions[0],
    [filters.report_type],
  );

  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.college_id,
        filters.domain_id,
        filters.session,
        filters.semester,
        filters.internship_status,
        filters.payment_status,
        filters.from_date,
        filters.to_date,
      ].filter(Boolean).length,
    [filters],
  );

  const updateFilter = (
    key: keyof AdminReportParams,
    value: string | number,
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const loadOptions = useCallback(
    async () => {
      try {
        const [
          collegeResponse,
          domainResponse,
        ] = await Promise.all([
          adminService.colleges({
            page: 1,
            limit: 1000,
          }),
          adminService.domains({
            page: 1,
            limit: 1000,
          }),
        ]);

        setColleges(
          collegeResponse.data.data
            .items || [],
        );

        setDomains(
          domainResponse.data.data
            .items || [],
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Filter options could not be loaded",
          ),
        );
      }
    },
    [],
  );

  const loadReport = useCallback(
    async (
      nextPage: number,
      activeFilters: AdminReportParams,
    ) => {
      try {
        setLoading(true);

        const response =
          await adminService.report({
            ...activeFilters,
            page: nextPage,
          });

        setReport(response.data.data);

        setFilters((current) => ({
          ...current,
          page: nextPage,
        }));
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Report could not be loaded",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void Promise.all([
      loadOptions(),
      loadReport(1, initialFilters),
    ]);
  }, [loadOptions, loadReport]);

  const applyFilters = () => {
    void loadReport(1, filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    void loadReport(1, initialFilters);
  };

  const changeReportType = (
    reportType: AdminReportType,
  ) => {
    const nextFilters = {
      ...filters,
      report_type: reportType,
      page: 1,
    };

    setFilters(nextFilters);
    void loadReport(1, nextFilters);
  };

  const exportReport = async (
    format: "excel" | "pdf",
  ) => {
    try {
      setExporting(format);

      const response =
        await adminService.exportReport(
          format,
          filters,
        );

      const extension =
        format === "excel"
          ? "xlsx"
          : "pdf";

      const typeName =
        filters.report_type.replaceAll(
          "_",
          "-",
        );

      downloadBlob(
        response.data,
        `rknexora-${typeName}-report.${extension}`,
      );

      toast.success(
        `${
          format === "excel"
            ? "Excel"
            : "PDF"
        } report downloaded`,
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Report could not be exported",
        ),
      );
    } finally {
      setExporting(null);
    }
  };

  const summary = report?.summary;
  const pagination = report?.pagination;
  const SelectedReportIcon =
    selectedReport.icon;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Reports & Analytics"
        action={
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() =>
              void loadReport(
                filters.page || 1,
                filters,
              )
            }
            className="rounded-xl border-slate-200 bg-white shadow-sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh Data
          </Button>
        }
      />

      <section className="relative overflow-hidden rounded-[30px] bg-[#071a2f] p-6 text-white shadow-2xl shadow-slate-900/15 sm:p-8">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.05),transparent_45%)]" />

        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-300 ring-1 ring-white/15 backdrop-blur sm:h-16 sm:w-16">
              <SelectedReportIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200 ring-1 ring-cyan-300/15">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Reporting Centre
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/75 ring-1 ring-white/10">
                  Live analytics
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
                {selectedReport.label}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                {selectedReport.description}{" "}
                Apply filters, inspect the
                current dataset and export the
                exact same report to Excel or
                PDF.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/65">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <Table2 className="h-4 w-4 text-cyan-300" />
                  {numberFormatter.format(
                    pagination?.total || 0,
                  )}{" "}
                  matching records
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
                  {activeFilterCount}{" "}
                  active filters
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Button
              type="button"
              disabled={
                Boolean(exporting) || loading
              }
              onClick={() =>
                void exportReport("excel")
              }
              className="h-11 rounded-xl bg-emerald-500 px-5 text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-600"
            >
              {exporting === "excel" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Download Excel
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={
                Boolean(exporting) || loading
              }
              onClick={() =>
                void exportReport("pdf")
              }
              className="h-11 rounded-xl border-white/15 bg-white/10 px-5 text-white backdrop-blur hover:bg-white/15"
            >
              {exporting === "pdf" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportOptions.map((item) => {
          const Icon = item.icon;
          const active =
            filters.report_type ===
            item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                changeReportType(item.value)
              }
              className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition duration-200 ${
                active
                  ? "border-blue-200 bg-blue-50/80 shadow-md shadow-blue-100/60 ring-1 ring-blue-500/10"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
              }`}
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${item.tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-black ${
                    active
                      ? "text-blue-900"
                      : "text-slate-900"
                  }`}
                >
                  {item.shortLabel}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Filtered Students"
          value={numberFormatter.format(
            summary?.total_students || 0,
          )}
          helper="Matching current filters"
          icon={Users}
          tone="blue"
        />

        <SummaryCard
          label="Active Internships"
          value={numberFormatter.format(
            summary?.active_students || 0,
          )}
          helper="Currently in progress"
          icon={UserCheck}
          tone="emerald"
        />

        <SummaryCard
          label="Completed"
          value={numberFormatter.format(
            summary?.completed_students || 0,
          )}
          helper="Internships completed"
          icon={CheckCircle2}
          tone="violet"
        />

        <SummaryCard
          label="Revenue Collected"
          value={currencyFormatter.format(
            Number(
              summary?.total_revenue || 0,
            ),
          )}
          helper="Successful payments"
          icon={BadgeIndianRupee}
          tone="amber"
        />
      </section>

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-slate-900">
                  Report Filters
                </h2>

                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                    {activeFilterCount} active
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Preview and exports use the same
                selected filters.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={resetFilters}
            disabled={loading}
            className="rounded-xl border-slate-200 bg-white"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Report Type">
              <select
                value={filters.report_type}
                className={selectClassName}
                onChange={(event) =>
                  changeReportType(
                    event.target
                      .value as AdminReportType,
                  )
                }
              >
                {reportOptions.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="College">
              <select
                value={
                  filters.college_id || ""
                }
                className={selectClassName}
                onChange={(event) =>
                  updateFilter(
                    "college_id",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Colleges
                </option>

                {colleges.map((college) => (
                  <option
                    key={college.id}
                    value={college.id}
                  >
                    {college.name}
                    {college.code
                      ? ` (${college.code})`
                      : ""}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Domain">
              <select
                value={
                  filters.domain_id || ""
                }
                className={selectClassName}
                onChange={(event) =>
                  updateFilter(
                    "domain_id",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Domains
                </option>

                {domains.map((domain) => (
                  <option
                    key={domain.id}
                    value={domain.id}
                  >
                    {domain.domain_name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />

                <Input
                  value={filters.search || ""}
                  placeholder="Name, registration no., email..."
                  className="h-11 rounded-xl border-slate-200 bg-white pl-10 font-medium"
                  onChange={(event) =>
                    updateFilter(
                      "search",
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applyFilters();
                    }
                  }}
                />
              </div>
            </FilterField>

            <FilterField label="Session">
              <Input
                value={filters.session || ""}
                placeholder="Example: 2024-28"
                className="h-11 rounded-xl border-slate-200 font-medium"
                onChange={(event) =>
                  updateFilter(
                    "session",
                    event.target.value,
                  )
                }
              />
            </FilterField>

            <FilterField label="Semester">
              <select
                value={
                  filters.semester || ""
                }
                className={selectClassName}
                onChange={(event) =>
                  updateFilter(
                    "semester",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Semesters
                </option>

                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                ].map((semester) => (
                  <option
                    key={semester}
                    value={semester}
                  >
                    Semester {semester}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Internship Status">
              <select
                value={
                  filters.internship_status ||
                  ""
                }
                className={selectClassName}
                onChange={(event) =>
                  updateFilter(
                    "internship_status",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Statuses
                </option>
                <option value="preloaded">
                  Preloaded
                </option>
                <option value="registered">
                  Registered
                </option>
                <option value="active">
                  Active
                </option>
                <option value="completed">
                  Completed
                </option>
                <option value="blocked">
                  Blocked
                </option>
              </select>
            </FilterField>

            <FilterField label="Payment Status">
              <select
                value={
                  filters.payment_status || ""
                }
                className={selectClassName}
                onChange={(event) =>
                  updateFilter(
                    "payment_status",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Payment Statuses
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="paid">
                  Paid
                </option>
                <option value="failed">
                  Failed
                </option>
                <option value="refunded">
                  Refunded
                </option>
              </select>
            </FilterField>

            <FilterField label="From Date">
              <Input
                type="date"
                value={
                  filters.from_date || ""
                }
                className="h-11 rounded-xl border-slate-200 font-medium"
                onChange={(event) =>
                  updateFilter(
                    "from_date",
                    event.target.value,
                  )
                }
              />
            </FilterField>

            <FilterField label="To Date">
              <Input
                type="date"
                value={
                  filters.to_date || ""
                }
                className="h-11 rounded-xl border-slate-200 font-medium"
                onChange={(event) =>
                  updateFilter(
                    "to_date",
                    event.target.value,
                  )
                }
              />
            </FilterField>

            <div className="flex items-end md:col-span-2">
              <Button
                type="button"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[#071a2f] to-[#0b315a] font-bold shadow-lg shadow-slate-900/10 hover:from-[#0b294b] hover:to-[#10406f]"
                disabled={loading}
                onClick={applyFilters}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-600/10">
              <Table2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                Report Preview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {pagination
                  ? `${numberFormatter.format(
                      pagination.total,
                    )} matching record(s)`
                  : "No records"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-slate-500 sm:inline">
              Rows per page
            </span>

            <select
              value={filters.limit || 20}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              onChange={(event) => {
                const limit = Number(
                  event.target.value,
                );

                const nextFilters = {
                  ...filters,
                  limit,
                };

                setFilters(nextFilters);
                void loadReport(
                  1,
                  nextFilters,
                );
              }}
            >
              <option value={10}>
                10 rows
              </option>
              <option value={20}>
                20 rows
              </option>
              <option value={50}>
                50 rows
              </option>
              <option value={100}>
                100 rows
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
              <tr>
                <th className="w-14 border-b border-slate-200 px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  #
                </th>

                {report?.columns.map(
                  (column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
                    >
                      {column.label}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRows
                  columns={
                    (report?.columns.length ||
                      1) + 1
                  }
                />
              ) : !report?.rows.length ? (
                <tr>
                  <td
                    colSpan={
                      (report?.columns.length ||
                        1) + 1
                    }
                    className="px-4 py-20 text-center"
                  >
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                      <GraduationCap className="h-7 w-7" />
                    </div>

                    <h3 className="mt-4 font-black text-slate-900">
                      No matching records
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Change or clear filters and
                      generate the report again.
                    </p>
                  </td>
                </tr>
              ) : (
                report.rows.map(
                  (row, index) => (
                    <tr
                      key={String(
                        row.id ||
                          row.transaction_id ||
                          index,
                      )}
                      className="group transition hover:bg-blue-50/35"
                    >
                      <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">
                        {(
                          ((pagination?.page ||
                            1) -
                            1) *
                            (pagination?.limit ||
                              Number(
                                filters.limit ||
                                  20,
                              )) +
                          index +
                          1
                        ).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      {report.columns.map(
                        (column) => (
                          <td
                            key={column.key}
                            className="max-w-[280px] whitespace-nowrap px-4 py-4 text-slate-600"
                          >
                            <CellValue
                              columnKey={
                                column.key
                              }
                              value={
                                row[column.key]
                              }
                            />
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-sm font-bold text-slate-700">
                Page {pagination.page} of{" "}
                {Math.max(
                  1,
                  pagination.total_pages,
                )}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Showing up to{" "}
                {pagination.limit} rows per page
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  loading ||
                  pagination.page <= 1
                }
                onClick={() =>
                  void loadReport(
                    pagination.page - 1,
                    filters,
                  )
                }
                className="rounded-xl border-slate-200 bg-white"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={
                  loading ||
                  pagination.page >=
                    pagination.total_pages
                }
                onClick={() =>
                  void loadReport(
                    pagination.page + 1,
                    filters,
                  )
                }
                className="rounded-xl border-slate-200 bg-white"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ComponentType<{
    className?: string;
  }>;
  tone:
    | "blue"
    | "emerald"
    | "violet"
    | "amber";
}) {
  const tones = {
    blue: {
      icon:
        "bg-blue-50 text-blue-700 ring-blue-600/10",
      line:
        "from-blue-600 to-cyan-400",
    },
    emerald: {
      icon:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
      line:
        "from-emerald-600 to-teal-400",
    },
    violet: {
      icon:
        "bg-violet-50 text-violet-700 ring-violet-600/10",
      line:
        "from-violet-600 to-fuchsia-400",
    },
    amber: {
      icon:
        "bg-amber-50 text-amber-700 ring-amber-600/10",
      line:
        "from-amber-500 to-orange-400",
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone].line}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 truncate text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {helper}
          </p>
        </div>

        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 transition group-hover:scale-105 ${tones[tone].icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function CellValue({
  columnKey,
  value,
}: {
  columnKey: string;
  value: unknown;
}) {
  const formattedValue =
    formatValue(value);

  if (isStatusColumn(columnKey)) {
    const normalized = String(
      value || "unknown",
    ).toLowerCase();

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ring-inset ${
          statusClasses[normalized] ||
          "bg-slate-100 text-slate-700 ring-slate-600/15"
        }`}
      >
        {formattedValue.replaceAll(
          "_",
          " ",
        )}
      </span>
    );
  }

  if (isProgressColumn(columnKey)) {
    const numericValue = Math.min(
      100,
      Math.max(
        0,
        Number(value || 0),
      ),
    );

    return (
      <div className="w-32">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black text-slate-700">
            {numericValue.toFixed(1)}%
          </span>
        </div>

        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
            style={{
              width: `${numericValue}%`,
            }}
          />
        </div>
      </div>
    );
  }

  if (isAmountColumn(columnKey)) {
    const numericValue = Number(value);

    return (
      <span className="font-black text-slate-900">
        {Number.isFinite(numericValue)
          ? currencyFormatter.format(
              numericValue,
            )
          : formattedValue}
      </span>
    );
  }

  if (
    columnKey === "name" ||
    columnKey === "student_name"
  ) {
    return (
      <span className="font-bold text-slate-900">
        {formattedValue}
      </span>
    );
  }

  if (
    columnKey.includes("registration") ||
    columnKey.includes("transaction") ||
    columnKey.includes("order_id")
  ) {
    return (
      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700">
        {formattedValue}
      </span>
    );
  }

  return (
    <span className="text-slate-600">
      {formattedValue}
    </span>
  );
}

function LoadingRows({
  columns,
}: {
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: 6 }).map(
        (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({
              length: columns,
            }).map((__, columnIndex) => (
              <td
                key={columnIndex}
                className="px-4 py-4"
              >
                <div
                  className={`h-4 animate-pulse rounded bg-slate-100 ${
                    columnIndex % 3 === 0
                      ? "w-20"
                      : columnIndex % 3 === 1
                        ? "w-32"
                        : "w-24"
                  }`}
                />
              </td>
            ))}
          </tr>
        ),
      )}
    </>
  );
}