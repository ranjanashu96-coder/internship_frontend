"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import {
  studentService,
  type TodayAttendanceData,
} from "@/lib/services";

interface AttendanceCheckInCardProps {
  onAttendanceUpdated?: () => void;
}

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
    "Something went wrong."
  );
};

const formatTime = (
  value?: string | null,
) => {
  if (!value) {
    return "—";
  }

  const [hours, minutes] =
    String(value)
      .slice(0, 5)
      .split(":")
      .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
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

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return "";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

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

const getStatusLabel = (
  status?: string,
) => {
  switch (status) {
    case "present":
      return "Present";

    case "half_day":
      return "Half Day";

    case "leave":
      return "Leave";

    case "absent":
      return "Absent";

    default:
      return "Not Marked";
  }
};

const getStatusClass = (
  status?: string,
) => {
  switch (status) {
    case "present":
      return {
        dot: "bg-emerald-500",
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "half_day":
      return {
        dot: "bg-orange-500",
        badge:
          "border-orange-200 bg-orange-50 text-orange-700",
      };

    case "leave":
      return {
        dot: "bg-amber-500",
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "absent":
      return {
        dot: "bg-red-500",
        badge:
          "border-red-200 bg-red-50 text-red-700",
      };

    default:
      return {
        dot: "bg-slate-300",
        badge:
          "border-slate-200 bg-slate-50 text-slate-600",
      };
  }
};

export default function AttendanceCheckInCard({
  onAttendanceUpdated,
}: AttendanceCheckInCardProps) {
  const [
    attendanceData,
    setAttendanceData,
  ] =
    useState<TodayAttendanceData | null>(
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
    actionLoading,
    setActionLoading,
  ] = useState<
    "check-in" | "check-out" | null
  >(null);

  const loadTodayAttendance =
    useCallback(
      async (
        showRefreshLoader = false,
      ) => {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {
          const response =
            await studentService
              .todayAttendance();

          setAttendanceData(
            response.data.data,
          );
        } catch (error) {
          toast.error(
            getErrorMessage(error),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadTodayAttendance();
  }, [loadTodayAttendance]);

  const handleCheckIn =
    async () => {
      try {
        setActionLoading(
          "check-in",
        );

        await studentService.checkIn();

        toast.success(
          "Check-in completed successfully",
        );

        await loadTodayAttendance();

        onAttendanceUpdated?.();
      } catch (error) {
        toast.error(
          getErrorMessage(error),
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleCheckOut =
    async () => {
      try {
        setActionLoading(
          "check-out",
        );

        await studentService.checkOut();

        toast.success(
          "Check-out completed successfully",
        );

        await loadTodayAttendance();

        onAttendanceUpdated?.();
      } catch (error) {
        toast.error(
          getErrorMessage(error),
        );
      } finally {
        setActionLoading(null);
      }
    };

  const attendance =
    attendanceData?.attendance;

  const currentState =
    useMemo(() => {
      if (!attendanceData) {
        return "not_checked_in";
      }

      if (
        attendanceData.checked_in &&
        attendanceData.checked_out
      ) {
        return "completed";
      }

      if (
        attendanceData.checked_in &&
        !attendanceData.checked_out
      ) {
        return "checked_in";
      }

      return "not_checked_in";
    }, [attendanceData]);

  const statusStyle =
    getStatusClass(
      attendance?.status,
    );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex min-h-36 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading attendance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Compact header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
            <CalendarCheck2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Today&apos;s Attendance
            </p>

            <h2 className="mt-0.5 truncate text-base font-bold">
              {formatDate(
                attendanceData?.date,
              )}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadTodayAttendance(
              true,
            )
          }
          disabled={refreshing}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:opacity-60"
          title="Refresh attendance"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        {/* Compact details */}
        <div className="grid grid-cols-3 gap-2">
          <AttendanceStat
            label="Check In"
            value={formatTime(
              attendance?.login_time,
            )}
            icon={LogIn}
          />

          <AttendanceStat
            label="Check Out"
            value={formatTime(
              attendance?.logout_time,
            )}
            icon={LogOut}
          />

          <AttendanceStat
            label="Hours"
            value={`${Number(
              attendance?.learning_hours ||
                0,
            ).toFixed(2)}h`}
            icon={Clock3}
          />
        </div>

        {/* Status and action */}
       <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Current Status
            </p>

            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${statusStyle.badge}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
              />

              {getStatusLabel(
                attendance?.status,
              )}
            </div>
          </div>

          {currentState ===
            "not_checked_in" && (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={
                actionLoading !== null
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ===
              "check-in" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}

              Check In
            </button>
          )}

          {currentState ===
            "checked_in" && (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={
                actionLoading !== null
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ===
              "check-out" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}

              Check Out
            </button>
          )}

          {currentState ===
            "completed" && (
            <div className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />

              Completed
            </div>
          )}
        </div>

        {attendance?.remarks && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
            {attendance.remarks}
          </p>
        )}

        {currentState ===
          "not_checked_in" && (
          <p className="mt-3 text-xs text-slate-400">
            Check in when you begin
            today&apos;s internship work.
          </p>
        )}

        {currentState ===
          "checked_in" && (
          <p className="mt-3 text-xs text-slate-400">
            Your attendance is active.
            Check out after finishing
            today&apos;s work.
          </p>
        )}
      </div>
    </section>
  );
}

function AttendanceStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof LogIn;
}) {
  return (
   <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5 shrink-0" />

        <span className="truncate text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

     <p className="mt-1 truncate text-base font-bold text-slate-900">
      </p>
    </div>
  );
}