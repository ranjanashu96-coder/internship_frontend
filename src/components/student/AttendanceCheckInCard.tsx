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

const formatTime = (
  value?: string | null,
) => {
  if (!value) {
    return "—";
  }

  const [hours, minutes] = String(value)
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
      weekday: "long",
      day: "2-digit",
      month: "long",
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
    actionLoading,
    setActionLoading,
  ] = useState<
    "check-in" | "check-out" | null
  >(null);

  const loadTodayAttendance =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await studentService.todayAttendance();

        setAttendanceData(
          response.data.data,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadTodayAttendance();
  }, [loadTodayAttendance]);

 const handleCheckIn = async () => {
  try {
    setActionLoading("check-in");

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

const handleCheckOut = async () => {
  try {
    setActionLoading("check-out");

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

  const currentState = useMemo(() => {
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid min-h-52 place-items-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />

            <p className="text-sm">
              Loading today's attendance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck2 size={21} />

              <p className="text-sm font-semibold text-blue-100">
                Today's Attendance
              </p>
            </div>

            <h2 className="mt-2 text-xl font-bold">
              {formatDate(
                attendanceData?.date,
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadTodayAttendance()
            }
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh attendance"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <LogIn size={17} />

              <span className="text-xs font-semibold uppercase tracking-wide">
                Check In
              </span>
            </div>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {formatTime(
                attendance?.login_time,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <LogOut size={17} />

              <span className="text-xs font-semibold uppercase tracking-wide">
                Check Out
              </span>
            </div>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {formatTime(
                attendance?.logout_time,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock3 size={17} />

              <span className="text-xs font-semibold uppercase tracking-wide">
                Learning Hours
              </span>
            </div>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {Number(
                attendance?.learning_hours ||
                  0,
              ).toFixed(2)}
              h
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Current Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    attendance?.status ===
                    "present"
                      ? "bg-green-500"
                      : attendance?.status ===
                          "half_day"
                        ? "bg-orange-500"
                        : attendance?.status ===
                            "absent"
                          ? "bg-red-500"
                          : attendance?.status ===
                              "leave"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                  }`}
                />

                <span className="font-bold text-slate-900">
                  {getStatusLabel(
                    attendance?.status,
                  )}
                </span>
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
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ===
                "check-in" ? (
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <LogIn
                    size={18}
                    className="mr-2"
                  />
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
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ===
                "check-out" ? (
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <LogOut
                    size={18}
                    className="mr-2"
                  />
                )}

                Check Out
              </button>
            )}

            {currentState ===
              "completed" && (
              <div className="inline-flex min-h-11 items-center justify-center rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700">
                <CheckCircle2
                  size={18}
                  className="mr-2"
                />

                Attendance Completed
              </div>
            )}
          </div>

          {attendance?.remarks && (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
              {attendance.remarks}
            </p>
          )}
        </div>

        {currentState ===
          "not_checked_in" && (
          <p className="mt-4 text-xs text-slate-500">
            Click Check In when you
            start your internship work.
          </p>
        )}

        {currentState ===
          "checked_in" && (
          <p className="mt-4 text-xs text-slate-500">
            Your check-in is active.
            Click Check Out after
            completing today's work.
          </p>
        )}
      </div>
    </section>
  );
}