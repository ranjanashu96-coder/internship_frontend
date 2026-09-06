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
  Loader2,
  Video,
  X,
} from "lucide-react";

import {
  studentService,
  type LiveClassItem,
} from "@/lib/services";

const formatDateTime = (
  value: string,
) =>
  new Date(value)
    .toLocaleString(
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

  const days =
    Math.floor(
      seconds / 86400,
    );

  const hours =
    Math.floor(
      (seconds % 86400) /
        3600,
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
        60,
    );

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
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
  ] = useState(
    Date.now(),
  );

  const [
    dismissedId,
    setDismissedId,
  ] =
    useState<number | null>(
      null,
    );

  const load =
    useCallback(
      async () => {
        try {
          const response =
            await studentService
              .upcomingLiveClasses();

          const next =
            response.data.data
              .next_class;

          setLiveClass(
            next,
          );
        } catch (error) {
          /*
           * Popup failure ko main student portal
           * error nahi bana rahe.
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

  useEffect(() => {
    void load();

    const apiTimer =
      window.setInterval(
        () => {
          void load();
        },
        60_000,
      );

    return () =>
      window.clearInterval(
        apiTimer,
      );
  }, [load]);

  useEffect(() => {
    const timer =
      window.setInterval(
        () =>
          setNow(
            Date.now(),
          ),
        1_000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, []);

  const seconds =
    useMemo(
      () => {
        if (!liveClass) {
          return 0;
        }

        return Math.max(
          0,
          Math.floor(
            (new Date(
              liveClass.scheduled_at,
            ).getTime() -
              now) /
              1000,
          ),
        );
      },
      [
        liveClass,
        now,
      ],
    );

  if (
    loading ||
    !liveClass ||
    dismissedId ===
      liveClass.id ||
    liveClass
      .popup_visible === false
  ) {
    return null;
  }

  const joinText =
    liveClass.is_live
      ? "Join Live Class"
      : liveClass.can_join
        ? "Join Class"
        : "Join opens 10 min before";

  return (
    <div className="fixed bottom-5 right-5 z-[80] w-[calc(100%-2.5rem)] max-w-md overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl shadow-slate-900/20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              {liveClass.is_live ? (
                <Video className="h-5 w-5 animate-pulse" />
              ) : (
                <CalendarClock className="h-5 w-5" />
              )}
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-blue-100">
                {liveClass.is_live
                  ? "Live Now"
                  : "Next Live Class"}
              </p>

              <h3 className="mt-0.5 font-black">
                {
                  liveClass.title
                }
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setDismissedId(
                liveClass.id,
              )
            }
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
            aria-label="Close live class popup"
          >
            <X
              size={
                16
              }
            />
          </button>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-bold text-slate-900">
            {formatDateTime(
              liveClass.scheduled_at,
            )}
          </p>

          <p className="mt-1 text-xs font-semibold text-blue-700">
            {liveClass.is_live
              ? "Class is live now"
              : countdownText(
                  seconds,
                )}
          </p>
        </div>

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
            value={`${liveClass.duration_minutes} min`}
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

        {liveClass.can_join ? (
          <a
            href={
              liveClass.meeting_url
            }
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <Video className="mr-2 h-4 w-4" />
            {joinText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500"
          >
            <Loader2 className="mr-2 hidden h-4 w-4" />
            {joinText}
          </button>
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
    <div>
      <p className="font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}
