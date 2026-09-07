"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  ExternalLink,
  Video,
} from "lucide-react";

import {
  studentService,
  type LiveClassItem,
} from "@/lib/services";

const formatDateTime = (
  value: string,
) =>
  new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

const countdownText = (
  seconds: number,
) => {
  if (seconds <= 0) {
    return "Class is starting";
  }

  const days = Math.floor(
    seconds / 86400,
  );

  const hours = Math.floor(
    (seconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  if (minutes > 0) {
    return `${minutes}m remaining`;
  }

  return "Less than 1 minute remaining";
};

const getClassStartTime = (
  liveClass: LiveClassItem,
) => {
  return new Date(
    liveClass.scheduled_at,
  ).getTime();
};

const getClassEndTime = (
  liveClass: LiveClassItem,
) => {
  const startTime =
    getClassStartTime(liveClass);

  const durationMinutes =
    Number(
      liveClass.duration_minutes ||
        60,
    );

  return (
    startTime +
    durationMinutes *
      60 *
      1000
  );
};

export default function StudentLiveClassPopup() {
  const [
    liveClass,
    setLiveClass,
  ] =
    useState<LiveClassItem | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    now,
    setNow,
  ] = useState(() =>
    Date.now(),
  );

  // ============================================================
  // LOAD NEXT LIVE CLASS
  // ============================================================

  const load =
    useCallback(
      async () => {
        try {
          const response =
            await studentService
              .upcomingLiveClasses();

          const next =
            response.data.data
              .next_class ??
            null;

          /*
           * IMPORTANT:
           *
           * Agar current class already popup me hai
           * aur wo abhi khatam nahi hui hai,
           * to backend se next_class null aane par
           * current class ko remove nahi karna.
           *
           * Popup class end hone tak compulsory rahega.
           */
          setLiveClass(
            (current) => {
              if (current) {
                const currentEnd =
                  getClassEndTime(
                    current,
                  );

                const currentNotEnded =
                  Date.now() <=
                  currentEnd;

                if (
                  currentNotEnded
                ) {
                  /*
                   * Same/current class ko hold rakho.
                   *
                   * Agar API same class ka updated data
                   * bhejti hai to updated version use karo.
                   */
                  if (
                    next &&
                    next.id ===
                      current.id
                  ) {
                    return next;
                  }

                  return current;
                }
              }

              /*
               * Current class khatam ho chuki hai.
               * Ab API ki next scheduled class show hogi.
               */
              return next;
            },
          );
        } catch (error) {
          /*
           * Live class API fail hone se
           * student portal crash nahi karega.
           *
           * Existing class bhi remove nahi hogi.
           */
          console.error(
            "LIVE CLASS POPUP ERROR:",
            error,
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  // ============================================================
  // API REFRESH
  // ============================================================

  useEffect(() => {
    void load();

    const apiTimer =
      window.setInterval(
        () => {
          void load();
        },
        60_000,
      );

    return () => {
      window.clearInterval(
        apiTimer,
      );
    };
  }, [load]);

  // ============================================================
  // LOCAL CLOCK
  // ============================================================

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        1_000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, []);

  // ============================================================
  // CLASS TIME CALCULATION
  // ============================================================

  const classTiming =
    useMemo(() => {
      if (!liveClass) {
        return null;
      }

      const startTime =
        getClassStartTime(
          liveClass,
        );

      const endTime =
        getClassEndTime(
          liveClass,
        );

      /*
       * Join button class se
       * 10 minute pehle enable hoga.
       */
      const joinOpenTime =
        startTime -
        10 *
          60 *
          1000;

      const secondsUntilStart =
        Math.max(
          0,
          Math.floor(
            (startTime -
              now) /
              1000,
          ),
        );

      const secondsUntilEnd =
        Math.max(
          0,
          Math.floor(
            (endTime -
              now) /
              1000,
          ),
        );

      const isLive =
        now >= startTime &&
        now <= endTime;

      const hasEnded =
        now > endTime;

      const canJoin =
        now >= joinOpenTime &&
        now <= endTime;

      return {
        startTime,
        endTime,
        joinOpenTime,
        secondsUntilStart,
        secondsUntilEnd,
        isLive,
        hasEnded,
        canJoin,
      };
    }, [
      liveClass,
      now,
    ]);

  // ============================================================
  // WHEN CLASS ENDS -> FETCH NEXT CLASS
  // ============================================================

  useEffect(() => {
    if (
      !liveClass ||
      !classTiming?.hasEnded
    ) {
      return;
    }

    /*
     * Current class khatam hote hi
     * usko remove karo.
     */
    setLiveClass(null);

    /*
     * Fir immediately next class fetch karo.
     */
    void load();
  }, [
    liveClass,
    classTiming?.hasEnded,
    load,
  ]);

  // ============================================================
  // HIDE ONLY WHEN THERE IS ACTUALLY NO CLASS
  // ============================================================

  if (
    loading &&
    !liveClass
  ) {
    return null;
  }

  if (
    !liveClass ||
    !classTiming
  ) {
    return null;
  }

  /*
   * NOTE:
   *
   * Yahan:
   *
   * dismissedId nahi hai
   * popup_visible condition nahi hai
   * X close button nahi hai
   *
   * Student popup manually close nahi kar sakta.
   */

  const joinText =
    classTiming.isLive
      ? "Join Live Class"
      : classTiming.canJoin
        ? "Join Class"
        : "Join opens 10 min before";

  return (
    <div className="fixed bottom-5 right-5 z-[80] w-[calc(100%-2.5rem)] max-w-md overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl shadow-slate-900/20">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
            {classTiming.isLive ? (
              <Video className="h-5 w-5 animate-pulse" />
            ) : (
              <CalendarClock className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-100">
              {classTiming.isLive
                ? "Live Now"
                : "Next Live Class"}
            </p>

            <h3 className="mt-0.5 truncate font-black">
              {liveClass.title}
            </h3>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* BODY */}
      {/* ===================================================== */}

      <div className="space-y-3 p-5">
        {/* DATE / COUNTDOWN */}

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-bold text-slate-900">
            {formatDateTime(
              liveClass.scheduled_at,
            )}
          </p>

          {classTiming.isLive ? (
            <div className="mt-1">
              <p className="text-xs font-bold text-red-600">
                ● Class is live now
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {Math.ceil(
                  classTiming.secondsUntilEnd /
                    60,
                )}{" "}
                min remaining
              </p>
            </div>
          ) : (
            <p className="mt-1 text-xs font-semibold text-blue-700">
              {countdownText(
                classTiming.secondsUntilStart,
              )}
            </p>
          )}
        </div>

        {/* CLASS DETAILS */}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Info
            label="Faculty"
            value={
              liveClass.instructor_name ||
              "-"
            }
          />

          <Info
            label="Duration"
            value={`${liveClass.duration_minutes || 60} min`}
          />

          <Info
            label="Module"
            value={
              liveClass.module
                ?.module_name ||
              "Domain class"
            }
          />

          <Info
            label="Chapter"
            value={
              liveClass.chapter
                ?.chapter_name ||
              "All chapters"
            }
          />
        </div>

        {/* ================================================= */}
        {/* JOIN BUTTON */}
        {/* ================================================= */}

        {classTiming.canJoin ? (
          <a
            href={
              liveClass.meeting_url
            }
            target="_blank"
            rel="noreferrer"
            className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-black text-white transition ${
              classTiming.isLive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Video className="mr-2 h-4 w-4" />

            {joinText}

            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-500"
          >
            <CalendarClock className="mr-2 h-4 w-4" />

            {joinText}
          </button>
        )}

        {/* ================================================= */}
        {/* COMPULSORY NOTICE */}
        {/* ================================================= */}

        {!classTiming.isLive && (
          <p className="text-center text-[11px] font-medium text-slate-400">
            This notification will remain visible until the class is completed.
          </p>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}