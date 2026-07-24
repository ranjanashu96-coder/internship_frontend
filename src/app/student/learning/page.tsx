"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Lock,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  PageHeader,
} from "@/components/ui";

import {
  studentService,
  type StudentChapter,
  type StudentLearningData,
  type StudentLearningModule,
} from "@/lib/services";

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
    requestError?.response?.data?.message ||
    requestError?.message ||
    "Something went wrong."
  );
};

const getContentUrl = (
  value?: string | null,
) => {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const serverUrl = apiUrl.replace(
    /\/api\/?$/,
    "",
  );

  return `${serverUrl}${
    value.startsWith("/") ? value : `/${value}`
  }`;
};

const getYouTubeEmbedUrl = (
  value: string,
) => {
  try {
    const url = new URL(value);

    if (
      url.hostname.includes("youtu.be")
    ) {
      const videoId =
        url.pathname.replace("/", "");

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : value;
    }

    if (
      url.hostname.includes("youtube.com")
    ) {
      const videoId =
        url.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (
        url.pathname.startsWith(
          "/embed/",
        )
      ) {
        return value;
      }
    }

    return value;
  } catch {
    return value;
  }
};

const getChapterIcon = (
  chapter: StudentChapter,
) => {
  if (chapter.completed) {
    return CheckCircle2;
  }

  if (!chapter.unlocked) {
    return Lock;
  }

  if (chapter.content_type === "video") {
    return PlayCircle;
  }

  if (chapter.content_type === "pdf") {
    return FileText;
  }

  if (chapter.content_type === "link") {
    return Link2;
  }

  return BookOpen;
};

const flattenChapters = (
  modules: StudentLearningModule[],
) => {
  return modules.flatMap(
    (module) => module.Chapters ?? [],
  );
};

function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2
          size={34}
          className="animate-spin"
        />

        <p className="text-sm">
          Loading learning modules...
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
          Learning modules could not be loaded
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

function EmptyState() {
  return (
    <div className="card py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600">
        <BookOpen size={27} />
      </div>

      <h2 className="mt-4 text-lg font-bold">
        No learning modules available
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Learning modules have not been
        assigned to your selected domain
        yet.
      </p>
    </div>
  );
}

function ContentViewer({
  chapter,
}: {
  chapter: StudentChapter;
}) {
  const contentUrl = getContentUrl(
    chapter.content_url,
  );

  if (!chapter.content_url) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <div>
          <BookOpen
            className="mx-auto text-slate-400"
            size={40}
          />

          <h3 className="mt-4 font-semibold text-slate-700">
            Content not available
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Content has not been added to
            this chapter yet.
          </p>
        </div>
      </div>
    );
  }

  if (
    chapter.content_type === "video"
  ) {
    const videoUrl =
      getYouTubeEmbedUrl(contentUrl);

    return (
      <div className="overflow-hidden rounded-2xl bg-slate-950">
        <iframe
          src={videoUrl}
          title={chapter.chapter_name}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (
    chapter.content_type === "pdf"
  ) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <iframe
          src={contentUrl}
          title={chapter.chapter_name}
          className="h-[650px] w-full"
        />
      </div>
    );
  }

  if (
    chapter.content_type === "link"
  ) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-blue-600">
            <ExternalLink size={25} />
          </div>

          <h3 className="mt-4 text-lg font-bold">
            External learning resource
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            This chapter content is
            available on an external
            website.
          </p>

          <a
            href={contentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open Resource

            <ExternalLink
              size={16}
              className="ml-2"
            />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[360px] whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700">
      {chapter.content_url}
    </div>
  );
}

export default function LearningPage() {
  const [
    learning,
    setLearning,
  ] =
    useState<StudentLearningData | null>(
      null,
    );

  const [
    activeChapterId,
    setActiveChapterId,
  ] = useState<number | null>(null);

  const [
    expandedModules,
    setExpandedModules,
  ] = useState<number[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    completing,
    setCompleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadLearning = useCallback(
    async (
      preferredChapterId?: number,
    ) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await studentService.learning();

        const data = response.data.data;

        setLearning(data);

        setExpandedModules(
          data.modules.map(
            (module) => module.id,
          ),
        );

        const chapters =
          flattenChapters(data.modules);

        const preferredChapter =
          preferredChapterId
            ? chapters.find(
                (chapter) =>
                  chapter.id ===
                    preferredChapterId &&
                  chapter.unlocked,
              )
            : null;

        const firstAvailableChapter =
          preferredChapter ??
          chapters.find(
            (chapter) =>
              chapter.unlocked &&
              !chapter.completed,
          ) ??
          chapters.find(
            (chapter) =>
              chapter.unlocked,
          ) ??
          null;

        setActiveChapterId(
          firstAvailableChapter?.id ??
            null,
        );
      } catch (requestError) {
        const message =
          getErrorMessage(requestError);

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadLearning();
  }, [loadLearning]);

  const allChapters = useMemo(
    () =>
      flattenChapters(
        learning?.modules ?? [],
      ),
    [learning],
  );

  const activeChapter = useMemo(
    () =>
      allChapters.find(
        (chapter) =>
          chapter.id === activeChapterId,
      ) ?? null,
    [allChapters, activeChapterId],
  );

  const activeChapterIndex =
    activeChapter
      ? allChapters.findIndex(
          (chapter) =>
            chapter.id ===
            activeChapter.id,
        )
      : -1;

  const previousChapter =
    activeChapterIndex > 0
      ? allChapters[
          activeChapterIndex - 1
        ]
      : null;

  const nextChapter =
    activeChapterIndex >= 0
      ? allChapters[
          activeChapterIndex + 1
        ] ?? null
      : null;

  const handleChapterSelect = (
    chapter: StudentChapter,
  ) => {
    if (!chapter.unlocked) {
      toast.error(
        "Complete the previous chapter to unlock this chapter.",
      );

      return;
    }

    setActiveChapterId(chapter.id);
  };

  const handleCompleteChapter =
    async () => {
      if (
        !activeChapter ||
        activeChapter.completed
      ) {
        return;
      }

      try {
        setCompleting(true);

        const response =
          await studentService.completeChapter(
            activeChapter.id,
          );

        toast.success(
          response.data.message ||
            "Chapter completed successfully",
        );

        const currentChapterId =
          activeChapter.id;

        await loadLearning(
          currentChapterId,
        );
      } catch (requestError) {
        toast.error(
          getErrorMessage(requestError),
        );
      } finally {
        setCompleting(false);
      }
    };

  const toggleModule = (
    moduleId: number,
  ) => {
    setExpandedModules(
      (current) =>
        current.includes(moduleId)
          ? current.filter(
              (id) => id !== moduleId,
            )
          : [...current, moduleId],
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !learning) {
    return (
      <ErrorState
        message={
          error ||
          "Learning data was not returned."
        }
        onRetry={() => {
          void loadLearning();
        }}
      />
    );
  }

  if (learning.modules.length === 0) {
    return (
      <>
        <PageHeader title="Learning Modules" />
        <EmptyState />
      </>
    );
  }

  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(
        learning.summary
          .progress_percentage ?? 0,
      ),
    ),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Learning Modules" />

      <section className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Course Progress
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {learning.summary
                .completed_chapters}{" "}
              of{" "}
              {
                learning.summary
                  .total_chapters
              }{" "}
              chapters completed
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative grid h-20 w-20 place-items-center rounded-full bg-slate-100">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(rgb(37 99 235) ${progress * 3.6}deg, rgb(241 245 249) 0deg)`,
                }}
              />

              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-white">
                <span className="text-lg font-bold text-blue-600">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {learning.modules.map(
            (module) => {
              const isExpanded =
                expandedModules.includes(
                  module.id,
                );

              const moduleChapters =
                module.Chapters ?? [];

              const completedCount =
                moduleChapters.filter(
                  (chapter) =>
                    chapter.completed,
                ).length;

              const moduleProgress =
                moduleChapters.length > 0
                  ? Math.round(
                      (completedCount /
                        moduleChapters.length) *
                        100,
                    )
                  : 0;

              return (
                <div
                  key={module.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleModule(
                        module.id,
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Module{" "}
                        {
                          module.module_number
                        }
                      </p>

                      <h3 className="mt-1 truncate font-bold text-slate-900">
                        {module.module_name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {completedCount}/
                        {
                          moduleChapters.length
                        }{" "}
                        chapters •{" "}
                        {moduleProgress}%
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronDown
                        size={19}
                        className="shrink-0 text-slate-400"
                      />
                    ) : (
                      <ChevronRight
                        size={19}
                        className="shrink-0 text-slate-400"
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-2">
                      {moduleChapters.length >
                      0 ? (
                        moduleChapters.map(
                          (chapter) => {
                            const Icon =
                              getChapterIcon(
                                chapter,
                              );

                            const isActive =
                              activeChapterId ===
                              chapter.id;

                            return (
                              <button
                                type="button"
                                key={
                                  chapter.id
                                }
                                onClick={() =>
                                  handleChapterSelect(
                                    chapter,
                                  )
                                }
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                                  isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : chapter.unlocked
                                      ? "text-slate-700 hover:bg-slate-50"
                                      : "cursor-not-allowed text-slate-400"
                                }`}
                              >
                                <div
                                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                                    chapter.completed
                                      ? "bg-green-50 text-green-600"
                                      : isActive
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-slate-100"
                                  }`}
                                >
                                  <Icon
                                    size={
                                      17
                                    }
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">
                                    {
                                      chapter.chapter_name
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs capitalize opacity-70">
                                    Chapter{" "}
                                    {
                                      chapter.chapter_number
                                    }{" "}
                                    •{" "}
                                    {
                                      chapter.content_type
                                    }
                                  </p>
                                </div>

                                {chapter.completed && (
                                  <Check
                                    size={
                                      16
                                    }
                                    className="shrink-0 text-green-600"
                                  />
                                )}
                              </button>
                            );
                          },
                        )
                      ) : (
                        <p className="p-4 text-center text-sm text-slate-500">
                          No chapters found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </aside>

        <main className="min-w-0">
          {activeChapter ? (
            <div className="space-y-5">
              <section className="card">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                        {
                          activeChapter.content_type
                        }
                      </span>

                      {activeChapter.completed && (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                          <CheckCircle2
                            size={
                              14
                            }
                            className="mr-1.5"
                          />

                          Completed
                        </span>
                      )}
                    </div>

                    <h1 className="mt-3 text-2xl font-bold text-slate-900">
                      {
                        activeChapter.chapter_name
                      }
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                      Chapter{" "}
                      {
                        activeChapter.chapter_number
                      }
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={
                      activeChapter.completed ||
                      completing
                    }
                    onClick={() => {
                      void handleCompleteChapter();
                    }}
                  >
                    {completing ? (
                      <Loader2
                        size={17}
                        className="mr-2 animate-spin"
                      />
                    ) : (
                      <CheckCircle2
                        size={17}
                        className="mr-2"
                      />
                    )}

                    {activeChapter.completed
                      ? "Completed"
                      : completing
                        ? "Completing..."
                        : "Mark Complete"}
                  </Button>
                </div>
              </section>

              <ContentViewer
                chapter={activeChapter}
              />

              <section className="card flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    !previousChapter ||
                    !previousChapter.unlocked
                  }
                  onClick={() => {
                    if (
                      previousChapter?.unlocked
                    ) {
                      setActiveChapterId(
                        previousChapter.id,
                      );
                    }
                  }}
                >
                  <ArrowLeft
                    size={17}
                    className="mr-2"
                  />

                  Previous Chapter
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    !nextChapter ||
                    !nextChapter.unlocked
                  }
                  onClick={() => {
                    if (
                      nextChapter?.unlocked
                    ) {
                      setActiveChapterId(
                        nextChapter.id,
                      );
                    }
                  }}
                >
                  Next Chapter

                  <ArrowRight
                    size={17}
                    className="ml-2"
                  />
                </Button>
              </section>
            </div>
          ) : (
            <div className="card grid min-h-[420px] place-items-center text-center">
              <div>
                <BookOpen
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold">
                  Select a chapter
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Select an unlocked
                  chapter to start
                  learning.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}