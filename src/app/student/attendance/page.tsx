"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Hourglass,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  SunMedium,
  UserCheck,
  UserMinus,
  UserX,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import {
  studentService,
  type StudentAttendanceCalendarData,
  type StudentAttendanceData,
  type StudentAttendanceRecord,
  type StudentAttendanceStatus,
} from "@/lib/services";

type AttendanceFilter =
  | "all"
  | StudentAttendanceStatus;

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getErrorMessage = (
  error: unknown,
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
    "Something went wrong."
  );
};

const toNumber = (
  value: number | string | null | undefined,
) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
};

const formatTime = (
  value?: string | null,
) => {
  if (!value) {
    return "—";
  }

  const time = String(value).slice(0, 5);
  const [hourValue, minuteValue] =
    time.split(":").map(Number);

  if (
    !Number.isFinite(hourValue) ||
    !Number.isFinite(minuteValue)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hourValue,
    minuteValue,
    0,
    0,
  );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
};

const statusDetails: Record<
  StudentAttendanceStatus,
  {
    label: string;
    icon: typeof UserCheck;
    badgeClass: string;
    dotClass: string;
    calendarClass: string;
  }
> = {
  present: {
    label: "Present",
    icon: UserCheck,
    badgeClass:
      "bg-green-50 text-green-700",
    dotClass: "bg-green-500",
    calendarClass:
      "border-green-200 bg-green-50 text-green-700",
  },

  absent: {
    label: "Absent",
    icon: UserX,
    badgeClass:
      "bg-red-50 text-red-700",
    dotClass: "bg-red-500",
    calendarClass:
      "border-red-200 bg-red-50 text-red-700",
  },

  leave: {
    label: "Leave",
    icon: SunMedium,
    badgeClass:
      "bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
    calendarClass:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  half_day: {
    label: "Half Day",
    icon: Hourglass,
    badgeClass:
      "bg-orange-50 text-orange-700",
    dotClass: "bg-orange-500",
    calendarClass:
      "border-orange-200 bg-orange-50 text-orange-700",
  },
};

function StatusBadge({
  status,
}: {
  status: StudentAttendanceStatus;
}) {
  const detail =
    statusDetails[status] ||
    statusDetails.absent;

  const Icon = detail.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${detail.badgeClass}`}
    >
      <Icon
        size={14}
        className="mr-1.5"
      />

      {detail.label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2
          size={34}
          className="animate-spin"
        />

        <p className="text-sm">
          Loading attendance...
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

        <h2 className="mt-4 text-lg font-bold">
          Attendance could not be loaded
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

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof UserCheck;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function AttendanceCalendar({
  data,
  loading,
  selectedDate,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
}: {
  data: StudentAttendanceCalendarData | null;
  loading: boolean;
  selectedDate: string | null;
  onSelectDate: (
    record: StudentAttendanceRecord,
  ) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}) {
  const calendarDays = useMemo(() => {
    if (!data) {
      return [];
    }

    const firstDay = new Date(
      data.year,
      data.month - 1,
      1,
    ).getDay();

    const totalDays = new Date(
      data.year,
      data.month,
      0,
    ).getDate();

    const recordMap = new Map(
      data.records.map((record) => [
        String(record.date).slice(0, 10),
        record,
      ]),
    );

    const days: Array<{
      day: number | null;
      date: string | null;
      record: StudentAttendanceRecord | null;
    }> = [];

    for (
      let index = 0;
      index < firstDay;
      index += 1
    ) {
      days.push({
        day: null,
        date: null,
        record: null,
      });
    }

    for (
      let day = 1;
      day <= totalDays;
      day += 1
    ) {
      const date = `${data.year}-${String(
        data.month,
      ).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;

      days.push({
        day,
        date,
        record: recordMap.get(date) || null,
      });
    }

    return days;
  }, [data]);

  const today = new Date();

  const todayValue = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  return (
    <section className="card">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Monthly Calendar
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {data
              ? `${MONTHS[data.month - 1]} ${data.year}`
              : "Attendance Calendar"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCurrentMonth}
          >
            Today
          </Button>

          <button
            type="button"
            onClick={onPreviousMonth}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-[360px] place-items-center">
          <Loader2
            size={28}
            className="animate-spin text-blue-600"
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-7 gap-1 sm:gap-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                {day}
              </div>
            ))}

            {calendarDays.map(
              (item, index) => {
                if (!item.day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-20 rounded-xl sm:min-h-24"
                    />
                  );
                }

                const status =
                  item.record?.status;

                const detail = status
                  ? statusDetails[status]
                  : null;

                const isToday =
                  item.date === todayValue;

                const isSelected =
                  selectedDate === item.date;

                return (
                  <button
                    type="button"
                    key={item.date}
                    disabled={!item.record}
                    onClick={() => {
                      if (item.record) {
                        onSelectDate(
                          item.record,
                        );
                      }
                    }}
                    className={`relative min-h-20 rounded-xl border p-2 text-left transition sm:min-h-24 ${
                      detail
                        ? detail.calendarClass
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    } ${
                      item.record
                        ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                        : "cursor-default"
                    } ${
                      isSelected
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : ""
                        }`}
                      >
                        {item.day}
                      </span>

                      {detail && (
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${detail.dotClass}`}
                        />
                      )}
                    </div>

                    {item.record && (
                      <div className="mt-2">
                        <p className="truncate text-xs font-semibold">
                          {detail?.label}
                        </p>

                        <p className="mt-1 text-[11px] opacity-75">
                          {toNumber(
                            item.record
                              .learning_hours,
                          ).toFixed(1)}
                          h
                        </p>
                      </div>
                    )}
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
            {(
              Object.keys(
                statusDetails,
              ) as StudentAttendanceStatus[]
            ).map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusDetails[status].dotClass}`}
                />

                {
                  statusDetails[status]
                    .label
                }
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AttendanceRecordModal({
  record,
  onClose,
}: {
  record: StudentAttendanceRecord;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <StatusBadge
              status={record.status}
            />

            <h2 className="mt-3 text-xl font-bold text-slate-900">
              Attendance Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatDate(record.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <LogIn
                size={19}
                className="text-blue-600"
              />

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Login
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {formatTime(
                  record.login_time,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <LogOut
                size={19}
                className="text-blue-600"
              />

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Logout
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {formatTime(
                  record.logout_time,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <Clock3
                size={19}
                className="text-blue-600"
              />

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Hours
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {toNumber(
                  record.learning_hours,
                ).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Remarks
            </h3>

            <div className="mt-2 min-h-24 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {record.remarks ||
                "No remarks added."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentAttendancePage() {
  const today = new Date();

  const [
    data,
    setData,
  ] =
    useState<StudentAttendanceData | null>(
      null,
    );

  const [
    calendarData,
    setCalendarData,
  ] =
    useState<StudentAttendanceCalendarData | null>(
      null,
    );

  const [
    selectedRecord,
    setSelectedRecord,
  ] =
    useState<StudentAttendanceRecord | null>(
      null,
    );

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    today.getMonth() + 1,
  );

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(today.getFullYear());

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<AttendanceFilter>("all");

  const [
    fromDate,
    setFromDate,
  ] = useState("");

  const [
    toDate,
    setToDate,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    calendarLoading,
    setCalendarLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadAttendance =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await studentService.attendance({
            page,
            limit: 20,
            status:
              statusFilter === "all"
                ? ""
                : statusFilter,
            from_date:
              fromDate || undefined,
            to_date:
              toDate || undefined,
          });

        setData(response.data.data);
      } catch (requestError) {
        const message =
          getErrorMessage(requestError);

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }, [
      page,
      statusFilter,
      fromDate,
      toDate,
    ]);

  const loadCalendar =
    useCallback(async () => {
      try {
        setCalendarLoading(true);

        const response =
          await studentService.attendanceCalendar(
            selectedMonth,
            selectedYear,
          );

        setCalendarData(
          response.data.data,
        );
      } catch (requestError) {
        toast.error(
          getErrorMessage(requestError),
        );
      } finally {
        setCalendarLoading(false);
      }
    }, [
      selectedMonth,
      selectedYear,
    ]);

  useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const visibleRecords = useMemo(() => {
    const records =
      data?.records || [];

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter(
      (record) => {
        const statusLabel =
          statusDetails[
            record.status
          ]?.label.toLowerCase();

        return (
          formatDate(record.date)
            .toLowerCase()
            .includes(query) ||
          statusLabel.includes(query) ||
          record.remarks
            ?.toLowerCase()
            .includes(query)
        );
      },
    );
  }, [data, search]);

  const changeMonth = (
    offset: number,
  ) => {
    const nextDate = new Date(
      selectedYear,
      selectedMonth - 1 + offset,
      1,
    );

    setSelectedMonth(
      nextDate.getMonth() + 1,
    );

    setSelectedYear(
      nextDate.getFullYear(),
    );
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setSearch("");
    setPage(1);
  };

  if (
    loading &&
    !data
  ) {
    return <LoadingState />;
  }

  if (error && !data) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void loadAttendance();
          void loadCalendar();
        }}
      />
    );
  }

  const summary = data?.summary;

  const percentage = Math.min(
    100,
    Math.max(
      0,
      toNumber(
        summary?.attendance_percentage,
      ),
    ),
  );

  const filtersActive =
    statusFilter !== "all" ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(search);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          title="Attendance"
          value={`${percentage.toFixed(1)}%`}
          subtitle="Overall percentage"
          icon={CalendarCheck2}
        />

        <SummaryCard
          title="Present"
          value={
            summary?.present_days || 0
          }
          subtitle="Full days"
          icon={UserCheck}
        />

        <SummaryCard
          title="Half Days"
          value={
            summary?.half_days || 0
          }
          subtitle="Half attendance"
          icon={UserMinus}
        />

        <SummaryCard
          title="Absent"
          value={
            summary?.absent_days || 0
          }
          subtitle="Absent days"
          icon={UserX}
        />

        <SummaryCard
          title="Leave"
          value={
            summary?.leave_days || 0
          }
          subtitle="Approved leave"
          icon={SunMedium}
        />

        <SummaryCard
          title="Learning Hours"
          value={toNumber(
            summary?.total_learning_hours,
          ).toFixed(1)}
          subtitle="Total completed"
          icon={Clock3}
        />
      </section>

      <section className="card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search date, status or remarks..."
              className="pl-10"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex">
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(
                  event.target.value,
                );
                setPage(1);
              }}
              title="From date"
            />

            <Input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => {
                setToDate(
                  event.target.value,
                );
                setPage(1);
              }}
              title="To date"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Filter
            size={17}
            className="mr-1 text-slate-400"
          />

          {(
            [
              "all",
              "present",
              "half_day",
              "absent",
              "leave",
            ] as AttendanceFilter[]
          ).map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                statusFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter === "all"
                ? "All"
                : statusDetails[filter]
                    .label}
            </button>
          ))}

          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <X
                size={16}
                className="mr-1.5"
              />

              Clear Filters
            </button>
          )}
        </div>
      </section>

      <AttendanceCalendar
        data={calendarData}
        loading={calendarLoading}
        selectedDate={
          selectedRecord
            ? String(
                selectedRecord.date,
              ).slice(0, 10)
            : null
        }
        onSelectDate={setSelectedRecord}
        onPreviousMonth={() =>
          changeMonth(-1)
        }
        onNextMonth={() =>
          changeMonth(1)
        }
        onCurrentMonth={() => {
          const currentDate =
            new Date();

          setSelectedMonth(
            currentDate.getMonth() + 1,
          );

          setSelectedYear(
            currentDate.getFullYear(),
          );
        }}
      />

      <section className="card overflow-hidden p-0">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {data?.pagination
                .total_records || 0}{" "}
              attendance records
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => {
              void loadAttendance();
              void loadCalendar();
            }}
          >
            <RefreshCw
              size={17}
              className={`mr-2 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>

        {visibleRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Login
                  </th>

                  <th className="px-5 py-4">
                    Logout
                  </th>

                  <th className="px-5 py-4">
                    Learning Hours
                  </th>

                  <th className="px-5 py-4">
                    Remarks
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visibleRecords.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatDate(
                          record.date,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            record.status
                          }
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatTime(
                          record.login_time,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatTime(
                          record.logout_time,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                          <Clock3
                            size={15}
                            className="mr-1.5"
                          />

                          {toNumber(
                            record.learning_hours,
                          ).toFixed(2)}
                          h
                        </span>
                      </td>

                      <td className="max-w-[260px] px-5 py-4">
                        <p className="truncate text-sm text-slate-500">
                          {record.remarks ||
                            "No remarks"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRecord(
                              record,
                            )
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <CalendarCheck2
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No attendance records found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No records match the
              selected filters.
            </p>
          </div>
        )}

        {(data?.pagination.total_pages ||
          0) > 1 && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {data?.pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {
                  data?.pagination
                    .total_pages
                }
              </span>
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  page <= 1 || loading
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      current - 1,
                      1,
                    ),
                  )
                }
              >
                <ChevronLeft
                  size={17}
                  className="mr-1"
                />

                Previous
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={
                  page >=
                    (data?.pagination
                      .total_pages || 1) ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
              >
                Next

                <ChevronRight
                  size={17}
                  className="ml-1"
                />
              </Button>
            </div>
          </div>
        )}
      </section>

      {selectedRecord && (
        <AttendanceRecordModal
          record={selectedRecord}
          onClose={() =>
            setSelectedRecord(null)
          }
        />
      )}
    </div>
  );
}