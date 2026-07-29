"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button, PageHeader } from "@/components/ui";
import {
  studentService,
  type StudentQuizResultData,
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

const formatDuration = (
  totalSeconds?: number | null,
) => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined
  ) {
    return "—";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
};

export default function QuizResultPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();

  const attemptId = Number(params.attemptId);

  const [result, setResult] =
    useState<StudentQuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResult = useCallback(async () => {
    if (
      !Number.isInteger(attemptId) ||
      attemptId <= 0
    ) {
      setError("Invalid attempt ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await studentService.quizAttemptResult(
          attemptId,
        );

      setResult(response.data.data);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    void loadResult();
  }, [loadResult]);

  const counts = useMemo(() => {
    const answers = result?.answers ?? [];

    return {
      correct: answers.filter(
        (answer) => answer.is_correct,
      ).length,
      wrong: answers.filter(
        (answer) =>
          answer.selected_option_id &&
          !answer.is_correct,
      ).length,
      unanswered: answers.filter(
        (answer) => !answer.selected_option_id,
      ).length,
    };
  }, [result]);

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <Loader2
          size={36}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="card max-w-lg text-center">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />
          <h2 className="mt-4 text-lg font-bold">
            Result could not be loaded
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Result is unavailable."}
          </p>
          <Button
            type="button"
            className="mt-5"
            onClick={() => void loadResult()}
          >
            <RotateCcw size={17} className="mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const attempt = result.attempt;

  return (
    <div className="space-y-6">
      <PageHeader title="Quiz Result" />

      <section className="card text-center">
        <div
          className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${
            attempt.passed
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {attempt.passed ? (
            <Trophy size={38} />
          ) : (
            <XCircle size={38} />
          )}
        </div>

        <p
          className={`mt-4 text-sm font-bold uppercase tracking-wide ${
            attempt.passed
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {attempt.passed ? "Passed" : "Not Passed"}
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900">
          {attempt.percentage.toFixed(2)}%
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {attempt.obtained_marks} out of{" "}
          {attempt.total_marks} marks
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">
            Correct
          </p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {counts.correct}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">
            Wrong
          </p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {counts.wrong}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">
            Unanswered
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {counts.unanswered}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">
            Time Taken
          </p>
          <p className="mt-2 flex items-center text-lg font-bold text-slate-800">
            <Clock3 size={18} className="mr-2" />
            {formatDuration(
              attempt.time_taken_seconds,
            )}
          </p>
        </div>
      </section>

      {result.answers &&
        result.answers.length > 0 && (
          <section className="space-y-4">
            {result.answers.map((answer, index) => (
              <article
                key={answer.question_id}
                className="card"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-bold leading-7 text-slate-900">
                    {index + 1}. {answer.question}
                  </h2>

                  {answer.is_correct ? (
                    <CheckCircle2
                      size={22}
                      className="shrink-0 text-green-600"
                    />
                  ) : (
                    <XCircle
                      size={22}
                      className="shrink-0 text-red-600"
                    />
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {answer.options.map((option) => {
                    const selected =
                      option.id ===
                      answer.selected_option_id;
                    const correct =
                      option.id ===
                      answer.correct_option_id;

                    return (
                      <div
                        key={option.id}
                        className={`rounded-xl border px-4 py-3 text-sm ${
                          correct
                            ? "border-green-300 bg-green-50 text-green-800"
                            : selected
                              ? "border-red-300 bg-red-50 text-red-800"
                              : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {option.text}
                        {correct && (
                          <span className="ml-2 font-semibold">
                            (Correct answer)
                          </span>
                        )}
                        {selected && !correct && (
                          <span className="ml-2 font-semibold">
                            (Your answer)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {answer.explanation && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                    <strong>Explanation:</strong>{" "}
                    {answer.explanation}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

      <section className="card flex flex-col justify-between gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            router.push("/student/learning")
          }
        >
          <ArrowLeft size={17} className="mr-2" />
          Back to Learning
        </Button>

        {!attempt.passed && (
          <Button
            type="button"
            onClick={() =>
              router.push(
                `/student/learning/quiz/${result.quiz.id}`,
              )
            }
          >
            <RotateCcw size={17} className="mr-2" />
            Retry Quiz
          </Button>
        )}
      </section>
    </div>
  );
}
