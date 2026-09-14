"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Radio,
  Video,
} from "lucide-react";

import {
  studentService,
  type StudentChapterRequirements,
} from "@/lib/services";

const fmt = (
  seconds: number,
) => {
  const s = Math.max(
    0,
    Math.floor(
      seconds || 0,
    ),
  );

  const m = Math.floor(
    s / 60,
  );

  const r = s % 60;

  return `${m}:${String(
    r,
  ).padStart(2, "0")}`;
};

export default function ChapterRequirementsCard({
  chapterId,
}: {
  chapterId: number;
}) {
  const [
    data,
    setData,
  ] =
    useState<StudentChapterRequirements | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRequirements =
      async () => {
        try {
          setLoading(true);

          const response =
            await studentService.chapterRequirements(
              chapterId,
            );

          if (!cancelled) {
            setData(
              response.data.data,
            );
          }
        } catch (error) {
          console.error(
            "Failed to load chapter requirements",
            error,
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadRequirements();

    /*
     * Every 10 sec refresh:
     * video/live/PDF timer ka latest
     * progress UI me dikhega.
     */
    const interval =
      window.setInterval(
        () => {
          void loadRequirements();
        },
        10000,
      );

    return () => {
      cancelled = true;

      window.clearInterval(
        interval,
      );
    };
  }, [chapterId]);

  if (loading && !data) {
    return (
      <section className="card flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />

        Checking chapter
        requirements...
      </section>
    );
  }

  if (!data) {
    return null;
  }

  /*
   * IMPORTANT:
   *
   * Purana:
   * no video + no live => null
   *
   * Ab:
   * no video + chapter_engagement
   * => card dikhna chahiye.
   */
  const hasAnyRequirement =
    data.videos.length > 0 ||
    data.live_classes.length >
      0 ||
    Boolean(
      data.chapter_engagement,
    );

  if (!hasAnyRequirement) {
    return null;
  }

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Completion Requirements
          </p>

          <h2 className="mt-1 font-bold">
            Finish required learning
            before completing this
            chapter
          </h2>
        </div>

        {data.summary
          .learning_requirements_complete && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Ready
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">

        {/* =========================
            VIDEO REQUIREMENTS
        ========================== */}

        {data.videos.map(
          (x) => (
            <div
              key={
                x.resource_id
              }
              className="flex gap-3 rounded-xl border p-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Video className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <b>
                    {x.title}
                  </b>

                  <span
                    className={`text-xs font-semibold ${
                      x.is_completed
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {x.is_completed
                      ? "Completed"
                      : `${x.progress_percentage.toFixed(
                          0,
                        )}% watched`}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {fmt(
                    x.watched_seconds,
                  )}{" "}
                  /{" "}
                  {fmt(
                    x.duration_seconds,
                  )}
                </p>
              </div>
            </div>
          ),
        )}

        {/* =========================
            NO-VIDEO / PDF / TEXT
            10 MINUTE REQUIREMENT
        ========================== */}

       {/* =========================
    NO-VIDEO / PDF / TEXT
    10 MINUTE REQUIREMENT
========================== */}

{data.chapter_engagement && (
  <div className="flex gap-3 rounded-xl border p-3">
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
      <BookOpen className="h-4 w-4" />
    </div>

    <div className="flex-1">
      <div className="flex justify-between gap-2">
        <b>
          Chapter Reading Time
        </b>

        <span
          className={`text-xs font-semibold ${
            data.chapter_engagement
              .is_completed
              ? "text-emerald-600"
              : "text-slate-500"
          }`}
        >
          {data.chapter_engagement
            .is_completed
            ? "Completed"
            : "10 minutes required"}
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        {fmt(
          Number(
            data.chapter_engagement
              .engaged_seconds ??
              data.chapter_engagement
                .completed_seconds ??
              0,
          ),
        )}{" "}
        /{" "}
        {fmt(
          Number(
            data.chapter_engagement
              .required_seconds ??
              600,
          ),
        )}
      </p>

      {!data.chapter_engagement
        .is_completed && (
        <p className="mt-1 text-xs font-medium text-amber-600">
          {Math.ceil(
            Number(
              data.chapter_engagement
                .remaining_seconds ??
                0,
            ) / 60,
          )}{" "}
          minute(s) remaining
        </p>
      )}
    </div>
  </div>
)}

        {/* =========================
            LIVE CLASS
        ========================== */}

        {data.live_classes.map(
          (x) => (
            <div
              key={
                x.live_class_id
              }
              className="flex gap-3 rounded-xl border p-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600">
                <Radio className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <b>
                    {x.title}
                  </b>

                  <span
                    className={`text-xs font-semibold ${
                      x.is_completed
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {x.is_completed
                      ? "Attendance complete"
                      : `${x.attendance_percentage.toFixed(
                          0,
                        )}% attendance`}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {fmt(
                    x.attended_seconds,
                  )}{" "}
                  /{" "}
                  {fmt(
                    x.duration_seconds,
                  )}
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}