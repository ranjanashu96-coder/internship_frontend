"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button, PageHeader } from "@/components/ui";
import {
  studentService,
  type StudentQuizQuestion,
  type StudentQuizStartData,
} from "@/lib/services";

const getErrorMessage = (error: unknown) => {
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

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

export default function StudentQuizPage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();

  const quizId = Number(params.quizId);

  const [data, setData] =
    useState<StudentQuizStartData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | null>
  >({});
  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const autoSubmitStarted = useRef(false);

  const startQuiz = useCallback(async () => {
    if (!Number.isInteger(quizId) || quizId <= 0) {
      setError("Invalid quiz ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await studentService.startQuiz(quizId);

      const payload = response.data.data;
      setData(payload);

      const initialAnswers: Record<
        string,
        string | null
      > = {};

      payload.questions.forEach((question) => {
        initialAnswers[question.id] = null;
      });

      setAnswers(initialAnswers);

      if (payload.attempt.expires_at) {
        const expiresAt = new Date(
          payload.attempt.expires_at,
        ).getTime();

        setRemainingSeconds(
          Math.max(
            0,
            Math.floor(
              (expiresAt - Date.now()) / 1000,
            ),
          ),
        );
      } else {
        setRemainingSeconds(null);
      }
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    void startQuiz();
  }, [startQuiz]);

  const questions = data?.questions ?? [];
  const currentQuestion =
    questions[currentIndex] ?? null;

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(Boolean).length,
    [answers],
  );

  const submitQuiz = useCallback(
    async (automatic = false) => {
      if (!data || submitting) {
        return;
      }

      try {
        setSubmitting(true);

        const response =
          await studentService.submitQuiz(
            data.attempt.id,
            {
              answers: questions.map((question) => ({
                question_id: question.id,
                selected_option_id:
                  answers[question.id] ?? null,
              })),
            },
          );

        toast.success(
          automatic
            ? "Time expired. Quiz submitted automatically."
            : response.data.message ||
                "Quiz submitted successfully.",
        );

        router.replace(
          `/student/learning/result/${data.attempt.id}`,
        );
      } catch (requestError) {
        const message = getErrorMessage(requestError);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [
      answers,
      data,
      questions,
      router,
      submitting,
    ],
  );

  useEffect(() => {
    if (remainingSeconds === null) {
      return;
    }

    if (remainingSeconds <= 0) {
      if (!autoSubmitStarted.current) {
        autoSubmitStarted.current = true;
        void submitQuiz(true);
      }

      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) =>
        current === null
          ? null
          : Math.max(0, current - 1),
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remainingSeconds, submitQuiz]);

  const selectAnswer = (
    questionId: string,
    optionId: string,
  ) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  };

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={34}
            className="animate-spin"
          />
          <p className="text-sm">
            Preparing your quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data || !currentQuestion) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="card max-w-lg text-center">
          <AlertCircle
            size={38}
            className="mx-auto text-red-500"
          />
          <h2 className="mt-4 text-lg font-bold">
            Quiz could not be opened
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Quiz data is unavailable."}
          </p>
          <Button
            type="button"
            className="mt-5"
            onClick={() => void startQuiz()}
          >
            <RotateCcw size={17} className="mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <PageHeader title={data.quiz.title} />

      <section className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Attempt {data.attempt.attempt_number}
            </p>
            <h1 className="mt-1 text-xl font-bold">
              Question {currentIndex + 1} of{" "}
              {questions.length}
            </h1>
          </div>

          <div
            className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold ${
              remainingSeconds !== null &&
              remainingSeconds <= 60
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Clock3 size={17} className="mr-2" />
            {remainingSeconds === null
              ? "No time limit"
              : `${formatTime(remainingSeconds)} remaining`}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {answeredCount} of {questions.length} questions
          answered
        </p>
      </section>

      <section className="card">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold leading-7 text-slate-900">
            {currentQuestion.question}
          </h2>
          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {currentQuestion.marks} mark
            {currentQuestion.marks === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option) => {
            const selected =
              answers[currentQuestion.id] === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  selectAnswer(
                    currentQuestion.id,
                    option.id,
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selected && <CheckCircle2 size={15} />}
                </span>

                <span className="text-sm font-medium text-slate-700">
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="secondary"
          disabled={currentIndex === 0 || submitting}
          onClick={() =>
            setCurrentIndex((current) =>
              Math.max(0, current - 1),
            )
          }
        >
          <ArrowLeft size={17} className="mr-2" />
          Previous
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {currentIndex < questions.length - 1 ? (
            <Button
              type="button"
              disabled={submitting}
              onClick={() =>
                setCurrentIndex((current) =>
                  Math.min(
                    questions.length - 1,
                    current + 1,
                  ),
                )
              }
            >
              Next
              <ArrowRight size={17} className="ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting}
              onClick={() => void submitQuiz(false)}
            >
              {submitting ? (
                <Loader2
                  size={17}
                  className="mr-2 animate-spin"
                />
              ) : (
                <Send size={17} className="mr-2" />
              )}
              {submitting
                ? "Submitting..."
                : "Submit Quiz"}
            </Button>
          )}
        </div>
      </section>

      <section className="card">
        <div className="flex flex-wrap gap-2">
          {questions.map(
            (
              question: StudentQuizQuestion,
              index: number,
            ) => {
              const active = index === currentIndex;
              const answered = Boolean(
                answers[question.id],
              );

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-bold transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : answered
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}
