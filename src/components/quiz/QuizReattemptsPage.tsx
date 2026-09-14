"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Input, PageHeader } from "@/components/ui";
import {
  adminService,
  mentorService,
  type QuizReattemptItem,
} from "@/lib/services";

type Mode = "admin" | "mentor";

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return value.response?.data?.message || value.message || "Something went wrong";
};

export default function QuizReattemptsPage({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<QuizReattemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grantingKey, setGrantingKey] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = mode === "admin"
        ? await adminService.quizReattempts()
        : await mentorService.quizReattempts();

      setItems(response.data.data?.items || []);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) =>
      item.student.name.toLowerCase().includes(value) ||
      item.student.registration_number.toLowerCase().includes(value) ||
      item.quiz.title.toLowerCase().includes(value),
    );
  }, [items, search]);

  const grant = async (item: QuizReattemptItem) => {
    const reason = window.prompt(
      `Reason for giving ${item.student.name} one more attempt?`,
      "Student exhausted all attempts but could not pass",
    );

    if (reason === null) return;

    const key = `${item.student.id}:${item.quiz.id}`;
    try {
      setGrantingKey(key);
      if (mode === "admin") {
        await adminService.grantQuizReattempt(
          item.student.id,
          item.quiz.id,
          { extra_attempts: 1, reason: reason.trim() || undefined },
        );
      } else {
        await mentorService.grantQuizReattempt(
          item.student.id,
          item.quiz.id,
          { extra_attempts: 1, reason: reason.trim() || undefined },
        );
      }
      toast.success("One more quiz attempt granted successfully");
      await load(true);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setGrantingKey("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz Reattempts"
        description={
          mode === "mentor"
            ? "Assigned students who used all attempts but have not passed."
            : "Students who used all quiz attempts but have not passed."
        }
        action={
          <Button variant="secondary" onClick={() => void load(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="card">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, registration number or quiz..."
            className="pl-9"
          />
        </div>
      </div>

      <section className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading quiz attempts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <RotateCcw className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-3 font-bold text-slate-900">No exhausted failed quiz attempts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Students appear here only after all currently allowed attempts are used without passing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Quiz</th>
                  <th className="px-5 py-3">Latest Score</th>
                  <th className="px-5 py-3">Attempts</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const key = `${item.student.id}:${item.quiz.id}`;
                  return (
                    <tr key={key}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{item.student.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.student.registration_number}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{item.quiz.title}</p>
                        <p className="mt-1 text-xs text-slate-500">Pass: {item.quiz.passing_score}%</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-red-600">{Number(item.latest_score).toFixed(0)}%</td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.attempts_used}/{item.total_attempts_allowed}
                        {item.extra_attempts > 0 ? (
                          <p className="mt-1 text-xs text-blue-600">+{item.extra_attempts} extra previously granted</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone="red">Failed · Exhausted</Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          onClick={() => void grant(item)}
                          disabled={grantingKey === key}
                        >
                          {grantingKey === key ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="mr-2 h-4 w-4" />
                          )}
                          Grant 1 More Attempt
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
