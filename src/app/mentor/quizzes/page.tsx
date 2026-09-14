"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Input, PageHeader } from "@/components/ui";
import {
  mentorService,
  type AdminQuiz,
  type CreateQuizPayload,
  type MentorQuizChapterOption,
  type QuizQuestion,
} from "@/lib/services";

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return value.response?.data?.message || value.message || "Something went wrong";
};

const makeQuestion = (index: number): QuizQuestion => ({
  id: `question-${Date.now()}-${index}`,
  question: "",
  options: [
    { id: `q-${Date.now()}-${index}-a`, text: "" },
    { id: `q-${Date.now()}-${index}-b`, text: "" },
    { id: `q-${Date.now()}-${index}-c`, text: "" },
    { id: `q-${Date.now()}-${index}-d`, text: "" },
  ],
  correct_option_id: "",
  marks: 1,
  explanation: null,
});

type FormState = {
  chapter_id: string;
  title: string;
  description: string;
  passing_score: string;
  attempts_allowed: string;
  time_limit_minutes: string;
  randomize_questions: boolean;
  show_result_immediately: boolean;
  status: "draft" | "active" | "inactive";
  questions: QuizQuestion[];
};

const initialForm = (): FormState => ({
  chapter_id: "",
  title: "",
  description: "",
  passing_score: "60",
  attempts_allowed: "3",
  time_limit_minutes: "",
  randomize_questions: false,
  show_result_immediately: true,
  status: "active",
  questions: [makeQuestion(0)],
});

export default function MentorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [chapters, setChapters] = useState<MentorQuizChapterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminQuiz | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm());

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const [quizResponse, chapterResponse] = await Promise.all([
        mentorService.quizzes({ page: 1, limit: 100 }),
        mentorService.quizChapters(),
      ]);

      setQuizzes(quizResponse.data.data?.items || []);
      setChapters(chapterResponse.data.data?.items || []);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const availableChapters = useMemo(() => {
    if (editing) {
      return chapters.filter((chapter) => !chapter.quiz || chapter.quiz.id === editing.id);
    }
    return chapters.filter((chapter) => !chapter.quiz);
  }, [chapters, editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm());
    setModalOpen(true);
  };

  const openEdit = (quiz: AdminQuiz) => {
    setEditing(quiz);
    setForm({
      chapter_id: String(quiz.chapter_id),
      title: quiz.title,
      description: quiz.description || "",
      passing_score: String(quiz.passing_score ?? 60),
      attempts_allowed: String(quiz.attempts_allowed ?? 3),
      time_limit_minutes: quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : "",
      randomize_questions: Boolean(quiz.randomize_questions),
      show_result_immediately: Boolean(quiz.show_result_immediately),
      status: quiz.status,
      questions: Array.isArray(quiz.questions_json)
        ? quiz.questions_json.map((question) => ({
            ...question,
            options: question.options.map((option) => ({ ...option })),
          }))
        : [makeQuestion(0)],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const updateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? { ...option, text } : option,
          ),
        };
      }),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, makeQuestion(current.questions.length)],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  };

  const buildPayload = (): CreateQuizPayload => {
    const chapterId = Number(form.chapter_id);
    if (!Number.isInteger(chapterId) || chapterId <= 0) throw new Error("Select a chapter");

    const title = form.title.trim();
    if (!title) throw new Error("Quiz title is required");

    const passingScore = Number(form.passing_score);
    if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
      throw new Error("Passing score must be between 0 and 100");
    }

    const attemptsAllowed = Number(form.attempts_allowed);
    if (!Number.isInteger(attemptsAllowed) || attemptsAllowed < 1) {
      throw new Error("Attempts allowed must be at least 1");
    }

    if (form.questions.length === 0) throw new Error("At least one question is required");

    const questions = form.questions.map((question, index) => {
      const questionText = question.question.trim();
      if (!questionText) throw new Error(`Question ${index + 1} is required`);

      const options = question.options.map((option, optionIndex) => {
        const text = option.text.trim();
        if (!text) throw new Error(`Option ${optionIndex + 1} of question ${index + 1} is required`);
        return { id: option.id, text };
      });

      if (!question.correct_option_id) throw new Error(`Select the correct answer for question ${index + 1}`);
      if (!options.some((option) => option.id === question.correct_option_id)) {
        throw new Error(`Correct answer for question ${index + 1} is invalid`);
      }

      const marks = Number(question.marks);
      if (!Number.isFinite(marks) || marks <= 0) throw new Error(`Marks for question ${index + 1} must be greater than 0`);

      return {
        id: question.id,
        question: questionText,
        options,
        correct_option_id: question.correct_option_id,
        marks,
        explanation: question.explanation?.trim() || null,
      };
    });

    return {
      chapter_id: chapterId,
      title,
      description: form.description.trim() || null,
      passing_score: passingScore,
      attempts_allowed: attemptsAllowed,
      time_limit_minutes: form.time_limit_minutes ? Number(form.time_limit_minutes) : null,
      randomize_questions: form.randomize_questions,
      show_result_immediately: form.show_result_immediately,
      status: form.status,
      questions,
    };
  };

  const save = async () => {
    try {
      setSaving(true);
      const payload = buildPayload();

      if (editing) {
        await mentorService.updateQuiz(editing.id, payload);
        toast.success("Quiz updated successfully");
      } else {
        await mentorService.createQuiz(payload);
        toast.success("Quiz created successfully");
      }

      setModalOpen(false);
      setEditing(null);
      await load(true);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (quiz: AdminQuiz) => {
    if (!window.confirm(`Delete quiz “${quiz.title}”?`)) return;
    try {
      setDeletingId(quiz.id);
      await mentorService.deleteQuiz(quiz.id);
      toast.success("Quiz deleted successfully");
      await load(true);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor Quizzes"
        description="Create and manage quizzes only for chapters in your assigned domain."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void load(true)} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Quiz
            </Button>
          </div>
        }
      />

      <section className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading quizzes...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-10 text-center">
            <BrainCircuit className="mx-auto h-11 w-11 text-slate-300" />
            <h2 className="mt-3 font-bold text-slate-900">No quiz created in your domain</h2>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Create Quiz
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Quiz</th>
                  <th className="px-5 py-3">Chapter</th>
                  <th className="px-5 py-3">Pass</th>
                  <th className="px-5 py-3">Attempts</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{quiz.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{quiz.questions_json?.length || 0} questions</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {quiz.chapter?.chapter_name || quiz.Chapter?.chapter_name || `Chapter #${quiz.chapter_id}`}
                    </td>
                    <td className="px-5 py-4 font-semibold">{Number(quiz.passing_score)}%</td>
                    <td className="px-5 py-4">{quiz.attempts_allowed}</td>
                    <td className="px-5 py-4">
                      <Badge tone={quiz.status === "active" ? "green" : quiz.status === "draft" ? "amber" : "slate"}>
                        {quiz.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEdit(quiz)}>
                          <Pencil className="mr-1.5 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="danger" onClick={() => void remove(quiz)} disabled={deletingId === quiz.id}>
                          {deletingId === quiz.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{editing ? "Edit Quiz" : "Create Quiz"}</h2>
                <p className="mt-1 text-xs text-slate-500">Only chapters from your mentor domain are available.</p>
              </div>
              <button className="rounded-lg p-2 hover:bg-slate-100" onClick={closeModal} disabled={saving}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Chapter *</label>
                  <select
                    className="input"
                    value={form.chapter_id}
                    onChange={(event) => setForm((current) => ({ ...current, chapter_id: event.target.value }))}
                  >
                    <option value="">Select chapter</option>
                    {availableChapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.module?.module_name ? `${chapter.module.module_name} — ` : ""}
                        Chapter {chapter.chapter_number}: {chapter.chapter_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Quiz Title *</label>
                  <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Description</label>
                <textarea className="input min-h-20" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Passing Score %</label>
                  <Input type="number" min={0} max={100} value={form.passing_score} onChange={(event) => setForm((current) => ({ ...current, passing_score: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Attempts Allowed</label>
                  <Input type="number" min={1} value={form.attempts_allowed} onChange={(event) => setForm((current) => ({ ...current, attempts_allowed: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Time Limit (minutes)</label>
                  <Input type="number" min={1} value={form.time_limit_minutes} onChange={(event) => setForm((current) => ({ ...current, time_limit_minutes: event.target.value }))} placeholder="No limit" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Status</label>
                  <select className="input" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FormState["status"] }))}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 rounded-xl bg-slate-50 p-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={form.randomize_questions} onChange={(event) => setForm((current) => ({ ...current, randomize_questions: event.target.checked }))} />
                  Randomize questions
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={form.show_result_immediately} onChange={(event) => setForm((current) => ({ ...current, show_result_immediately: event.target.checked }))} />
                  Show result immediately
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Questions</h3>
                  <Button variant="secondary" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </div>

                {form.questions.map((question, questionIndex) => (
                  <div key={question.id} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold">Question {questionIndex + 1}</h4>
                      {form.questions.length > 1 ? (
                        <Button variant="danger" onClick={() => removeQuestion(questionIndex)}>
                          <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_120px]">
                      <Input value={question.question} onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })} placeholder="Question text" />
                      <Input type="number" min={1} value={question.marks} onChange={(event) => updateQuestion(questionIndex, { marks: Number(event.target.value) })} placeholder="Marks" />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={option.id} className="flex items-center gap-3 rounded-lg border p-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correct_option_id === option.id}
                            onChange={() => updateQuestion(questionIndex, { correct_option_id: option.id })}
                          />
                          <Input
                            value={option.text}
                            onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Input
                        value={question.explanation || ""}
                        onChange={(event) => updateQuestion(questionIndex, { explanation: event.target.value || null })}
                        placeholder="Explanation (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t bg-slate-50 px-6 py-4">
              <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                {editing ? "Save Changes" : "Create Quiz"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
