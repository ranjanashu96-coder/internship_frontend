"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileQuestion,
  FileUp,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import {
  adminService,
  type AdminAssignment,
  type AdminChapter,
  type AdminChapterResource,
  type AdminDomain,
  type AdminModule,
  type AdminQuiz,
  type AdminSector,
  type ChapterResourceType,
  type CreateChapterResourcePayload,
  type CreateQuizPayload,
  type LearningListParams,
  type QuizQuestion,
  type QuizStatus,
} from "@/lib/services";

type Tab = "sectors" | "domains" | "modules" | "chapters" | "assignments";
type RecordItem = AdminSector | AdminDomain | AdminModule | AdminChapter | AdminAssignment;

type FormState = {
  sector_name: string;
  status: "active" | "inactive";
  sector_id: string;
  domain_name: string;
  fee: string;
  duration_hours: string;
  domain_id: string;
  module_number: string;
  module_name: string;
  module_id: string;
  chapter_number: string;
  chapter_name: string;
  chapter_id: string;
  question_text: string;
};

const emptyForm: FormState = {
  sector_name: "",
  status: "active",
  sector_id: "",
  domain_name: "",
  fee: "0",
  duration_hours: "0",
  domain_id: "",
  module_number: "",
  module_name: "",
  module_id: "",
  chapter_number: "",
  chapter_name: "",
  chapter_id: "",
  question_text: "",
};

const tabs: Array<{ key: Tab; label: string; icon: ElementType }> = [
  { key: "sectors", label: "Sectors", icon: Layers3 },
  { key: "domains", label: "Domains", icon: BookOpen },
  { key: "modules", label: "Modules", icon: Layers3 },
  { key: "chapters", label: "Chapters", icon: BookOpen },
  { key: "assignments", label: "Assignments", icon: FileQuestion },
];

type ResourceFormState = {
  title: string;
  resource_type: ChapterResourceType;
  external_url: string;
  text_content: string;
  is_downloadable: boolean;
  is_primary: boolean;
  status: "active" | "inactive";
};

const emptyResourceForm: ResourceFormState = {
  title: "",
  resource_type: "video",
  external_url: "",
  text_content: "",
  is_downloadable: true,
  is_primary: false,
  status: "active",
};

type QuizFormState = {
  title: string;
  description: string;
  passing_score: string;
  attempts_allowed: string;
  time_limit_minutes: string;
  randomize_questions: boolean;
  show_result_immediately: boolean;
  status: QuizStatus;
  questions: QuizQuestion[];
};

const createId = (
  prefix: string,
) => {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const createEmptyQuestion =
  (): QuizQuestion => {
    const firstOptionId =
      createId("option");

    const secondOptionId =
      createId("option");

    return {
      id: createId("question"),
      question: "",
      options: [
        {
          id: firstOptionId,
          text: "",
        },
        {
          id: secondOptionId,
          text: "",
        },
      ],
      correct_option_id: "",
      marks: 1,
      explanation: "",
    };
  };

const createEmptyQuizForm =
  (): QuizFormState => ({
    title: "",
    description: "",
    passing_score: "60",
    attempts_allowed: "3",
    time_limit_minutes: "",
    randomize_questions: false,
    show_result_immediately: true,
    status: "draft",
    questions: [
      createEmptyQuestion(),
    ],
  });

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return value.response?.data?.message || value.message || "Something went wrong";
};

const resolveContentUrl = (
  contentUrl?: string | null,
) => {
  const safeContentUrl =
    String(contentUrl || "").trim();

  if (!safeContentUrl) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      safeContentUrl,
    )
  ) {
    return safeContentUrl;
  }

  const apiUrl =
    process.env
      .NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const backendOrigin =
    apiUrl.replace(
      /\/api\/?$/,
      "",
    );

  return `${backendOrigin}${
    safeContentUrl.startsWith("/")
      ? ""
      : "/"
  }${safeContentUrl}`;
};

export default function AdminLearningPage() {
  const [tab, setTab] = useState<Tab>("sectors");
  const [items, setItems] = useState<RecordItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [chapterDomainFilter, setChapterDomainFilter] = useState("");
  const [chapterModuleFilter, setChapterModuleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [sectors, setSectors] = useState<AdminSector[]>([]);
  const [domains, setDomains] = useState<AdminDomain[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [resourceModal, setResourceModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<AdminChapter | null>(null);
  const [resources, setResources] = useState<AdminChapterResource[]>([]);
  const [resourceForm, setResourceForm] =
    useState<ResourceFormState>(emptyResourceForm);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [
  quizModal,
  setQuizModal,
] = useState(false);

const [
  quiz,
  setQuiz,
] = useState<AdminQuiz | null>(
  null,
);

const [
  quizForm,
  setQuizForm,
] = useState<QuizFormState>(
  createEmptyQuizForm(),
);

const [
  quizLoading,
  setQuizLoading,
] = useState(false);

const [
  quizSaving,
  setQuizSaving,
] = useState(false);

const [
  quizDeleting,
  setQuizDeleting,
] = useState(false);

  const title = useMemo(
    () => tabs.find((item) => item.key === tab)?.label || "Learning Setup",
    [tab],
  );

  const chapterFilterModules = useMemo(
    () =>
      modules.filter(
        (module) =>
          !chapterDomainFilter ||
          Number(module.domain_id) === Number(chapterDomainFilter),
      ),
    [modules, chapterDomainFilter],
  );

  const chapterFormModules = useMemo(
    () =>
      modules.filter(
        (module) =>
          !form.domain_id || Number(module.domain_id) === Number(form.domain_id),
      ),
    [modules, form.domain_id],
  );

  const loadReferences = useCallback(async () => {
    try {
      const [sectorResponse, domainResponse, moduleResponse, chapterResponse] =
        await Promise.all([
          adminService.sectors({ page: 1, limit: 100 }),
          adminService.domains({ page: 1, limit: 100 }),
          adminService.modules({ page: 1, limit: 100 }),
          adminService.chapters({ page: 1, limit: 100 }),
        ]);

      setSectors(sectorResponse.data.data.items);
      setDomains(domainResponse.data.data.items);
      setModules(moduleResponse.data.data.items);
      setChapters(chapterResponse.data.data.items);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);

    try {
      const params: LearningListParams = {
        page,
        limit: 20,
        search: search.trim() || undefined,
      };

      if (tab === "sectors") {
        params.status = secondaryFilter as "active" | "inactive" | "";
      }

      if (tab === "domains" && filterId) params.sector_id = filterId;
      if (tab === "modules" && filterId) params.domain_id = filterId;

      if (tab === "chapters" && chapterDomainFilter) {
        params.domain_id = chapterDomainFilter;
      }

      if (tab === "chapters" && chapterModuleFilter) {
        params.module_id = chapterModuleFilter;
      }

      if (tab === "assignments" && filterId) params.chapter_id = filterId;

      const response =
        tab === "sectors"
          ? await adminService.sectors(params)
          : tab === "domains"
            ? await adminService.domains(params)
            : tab === "modules"
              ? await adminService.modules(params)
              : tab === "chapters"
                ? await adminService.chapters(params)
                : await adminService.assignments(params);

      setItems(response.data.data.items);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages ?? 0);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [
    chapterDomainFilter,
    chapterModuleFilter,
    filterId,
    page,
    search,
    secondaryFilter,
    tab,
  ]);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadRows(), 250);
    return () => window.clearTimeout(timeout);
  }, [loadRows]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    setPage(1);
    setSearch("");
    setFilterId("");
    setSecondaryFilter("");
    setChapterDomainFilter("");
    setChapterModuleFilter("");
    setEditing(null);
    setModal(false);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (row: RecordItem) => {
    setEditing(row);

    if (tab === "sectors") {
      const value = row as AdminSector;
      setForm({
        ...emptyForm,
        sector_name: value.sector_name,
        status: value.status,
      });
    }

    if (tab === "domains") {
      const value = row as AdminDomain;
      setForm({
        ...emptyForm,
        sector_id: String(value.sector_id),
        domain_name: value.domain_name,
        fee: String(value.fee),
        duration_hours: String(value.duration_hours),
      });
    }

    if (tab === "modules") {
      const value = row as AdminModule;
      setForm({
        ...emptyForm,
        domain_id: String(value.domain_id),
        module_number: String(value.module_number),
        module_name: value.module_name,
      });
    }

    if (tab === "chapters") {
      const value = row as AdminChapter;
      const includedModule = value.Module || value.module;
      const selectedModule = modules.find(
        (module) => Number(module.id) === Number(value.module_id),
      );
      const domainId = selectedModule?.domain_id || includedModule?.domain_id || "";

      setForm({
        ...emptyForm,
        domain_id: domainId ? String(domainId) : "",
        module_id: String(value.module_id),
        chapter_number: String(value.chapter_number),
        chapter_name: value.chapter_name,
      });
    }

    if (tab === "assignments") {
      const value = row as AdminAssignment;
      setForm({
        ...emptyForm,
        chapter_id: String(value.chapter_id),
        question_text: value.question_text,
      });
    }

    setModal(true);
  };

  const saveChapter = async () => {
    const domainId = Number(form.domain_id);
    const moduleId = Number(form.module_id);
    const chapterNumber = Number(form.chapter_number);
    const chapterName = form.chapter_name.trim();

    if (!domainId) throw new Error("Domain is required");
    if (!moduleId) throw new Error("Module is required");
    if (!chapterNumber || chapterNumber <= 0) {
      throw new Error("Valid chapter number is required");
    }
    if (!chapterName) throw new Error("Chapter name is required");

    const selectedModule = modules.find(
      (module) => Number(module.id) === moduleId,
    );

    if (!selectedModule) throw new Error("Selected module was not found");

    if (Number(selectedModule.domain_id) !== domainId) {
      throw new Error("Selected module does not belong to the selected domain");
    }

    const payload = {
      domain_id: domainId,
      module_id: moduleId,
      chapter_number: chapterNumber,
      chapter_name: chapterName,
    };

    if (editing) {
      await adminService.updateChapter(editing.id, payload);
    } else {
      await adminService.createChapter(payload);
    }
  };

  const save = async () => {
    setSaving(true);

    try {
      if (tab === "sectors") {
        const payload = {
          sector_name: form.sector_name.trim(),
          status: form.status,
        };

        if (!payload.sector_name) throw new Error("Sector name is required");

        if (editing) await adminService.updateSector(editing.id, payload);
        else await adminService.createSector(payload);
      }

      if (tab === "domains") {
        const payload = {
          sector_id: Number(form.sector_id),
          domain_name: form.domain_name.trim(),
          fee: Number(form.fee),
          duration_hours: Number(form.duration_hours),
        };

        if (!payload.sector_id || !payload.domain_name) {
          throw new Error("Sector and domain name are required");
        }

        if (editing) await adminService.updateDomain(editing.id, payload);
        else await adminService.createDomain(payload);
      }

      if (tab === "modules") {
        const payload = {
          domain_id: Number(form.domain_id),
          module_number: Number(form.module_number),
          module_name: form.module_name.trim(),
        };

        if (!payload.domain_id || !payload.module_number || !payload.module_name) {
          throw new Error("Domain, module number and module name are required");
        }

        if (editing) await adminService.updateModule(editing.id, payload);
        else await adminService.createModule(payload);
      }

      if (tab === "chapters") await saveChapter();

      if (tab === "assignments") {
        const payload = {
          chapter_id: Number(form.chapter_id),
          question_text: form.question_text.trim(),
        };

        if (!payload.chapter_id || !payload.question_text) {
          throw new Error("Chapter and question text are required");
        }

        if (editing) await adminService.updateAssignment(editing.id, payload);
        else await adminService.createAssignment(payload);
      }

      toast.success(editing ? "Updated successfully" : "Created successfully");

      setModal(false);
      setEditing(null);
      setForm(emptyForm);
  
      await Promise.all([loadRows(), loadReferences()]);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const loadChapterResources = async (chapterId: number) => {
    setResourceLoading(true);

    try {
      const response = await adminService.chapterResources(chapterId);
      setResources(response.data.data.resources || []);
    } catch (error) {
      toast.error(errorMessage(error));
      setResources([]);
    } finally {
      setResourceLoading(false);
    }
  };

  const openResourceManager = async (chapter: AdminChapter) => {
    setSelectedChapter(chapter);
    setResourceForm(emptyResourceForm);
    setResourceFile(null);
    setResourceModal(true);
    await loadChapterResources(chapter.id);
  };

  const saveResource = async () => {
    if (!selectedChapter) {
      toast.error("Chapter was not selected");
      return;
    }

    const title = resourceForm.title.trim();
    if (!title) {
      toast.error("Resource title is required");
      return;
    }

    const isLink = resourceForm.resource_type === "link";
    const isText = resourceForm.resource_type === "text";

    if (isLink && !resourceForm.external_url.trim()) {
      toast.error("External link is required");
      return;
    }

    if (isText && !resourceForm.text_content.trim()) {
      toast.error("Text content is required");
      return;
    }

    if (!isLink && !isText && !resourceFile) {
      toast.error("Please select a file");
      return;
    }

    setResourceSaving(true);

    try {
      const payload: CreateChapterResourcePayload = {
        title,
        resource_type: resourceForm.resource_type,
        file: !isLink && !isText ? resourceFile || undefined : undefined,
        external_url: isLink
          ? resourceForm.external_url.trim()
          : undefined,
        text_content: isText
          ? resourceForm.text_content.trim()
          : undefined,
        is_downloadable: resourceForm.is_downloadable,
        is_primary: resourceForm.is_primary,
        status: resourceForm.status,
      };

      await adminService.createChapterResource(selectedChapter.id, payload);
      toast.success("Resource added successfully");

      setResourceForm(emptyResourceForm);
      setResourceFile(null);
      await loadChapterResources(selectedChapter.id);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setResourceSaving(false);
    }
  };

  const removeResource = async (resource: AdminChapterResource) => {
    if (!window.confirm(`Delete "${resource.title}"?`)) return;

    try {
      await adminService.deleteChapterResource(resource.id);
      toast.success("Resource deleted successfully");

      if (selectedChapter) {
        await loadChapterResources(selectedChapter.id);
      }
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const resetQuizManager = () => {
  setQuiz(null);
  setQuizForm(
    createEmptyQuizForm(),
  );
};

const loadChapterQuiz = async (
  chapterId: number,
) => {
  setQuizLoading(true);

  try {
    const response =
      await adminService.quizzes({
        chapter_id: chapterId,
        page: 1,
        limit: 1,
      });

    const existingQuiz =
      response.data.data.items?.[0] ||
      null;

    setQuiz(existingQuiz);

    if (!existingQuiz) {
      setQuizForm(
        createEmptyQuizForm(),
      );

      return;
    }

    const questions =
      Array.isArray(
        existingQuiz.questions_json,
      )
        ? existingQuiz.questions_json
        : [];

    setQuizForm({
      title:
        existingQuiz.title || "",
      description:
        existingQuiz.description || "",
      passing_score: String(
        existingQuiz.passing_score ??
          60,
      ),
      attempts_allowed: String(
        existingQuiz.attempts_allowed ??
          3,
      ),
      time_limit_minutes:
        existingQuiz.time_limit_minutes
          ? String(
              existingQuiz.time_limit_minutes,
            )
          : "",
      randomize_questions:
        Boolean(
          existingQuiz.randomize_questions,
        ),
      show_result_immediately:
        Boolean(
          existingQuiz.show_result_immediately,
        ),
      status:
        existingQuiz.status ||
        "draft",
      questions:
        questions.length > 0
          ? questions.map(
              (question) => ({
                ...question,
                explanation:
                  question.explanation ||
                  "",
                marks: Number(
                  question.marks || 1,
                ),
                options:
                  Array.isArray(
                    question.options,
                  )
                    ? question.options
                    : [],
              }),
            )
          : [
              createEmptyQuestion(),
            ],
    });
  } catch (error) {
    toast.error(
      errorMessage(error),
    );

    resetQuizManager();
  } finally {
    setQuizLoading(false);
  }
};

const openQuizManager = async (
  chapter: AdminChapter,
) => {
  setSelectedChapter(chapter);
  resetQuizManager();
  setQuizModal(true);

  await loadChapterQuiz(
    chapter.id,
  );
};

const updateQuizField = <
  K extends keyof QuizFormState,
>(
  key: K,
  value: QuizFormState[K],
) => {
  setQuizForm((current) => ({
    ...current,
    [key]: value,
  }));
};

const updateQuestion = (
  questionIndex: number,
  changes: Partial<QuizQuestion>,
) => {
  setQuizForm((current) => ({
    ...current,
    questions:
      current.questions.map(
        (
          question,
          currentIndex,
        ) =>
          currentIndex ===
          questionIndex
            ? {
                ...question,
                ...changes,
              }
            : question,
      ),
  }));
};

const addQuestion = () => {
  setQuizForm((current) => ({
    ...current,
    questions: [
      ...current.questions,
      createEmptyQuestion(),
    ],
  }));
};

const removeQuestion = (
  questionIndex: number,
) => {
  setQuizForm((current) => {
    if (
      current.questions.length <=
      1
    ) {
      toast.error(
        "At least one question is required",
      );

      return current;
    }

    return {
      ...current,
      questions:
        current.questions.filter(
          (_, index) =>
            index !==
            questionIndex,
        ),
    };
  });
};

const addQuestionOption = (
  questionIndex: number,
) => {
  setQuizForm((current) => ({
    ...current,
    questions:
      current.questions.map(
        (
          question,
          currentIndex,
        ) =>
          currentIndex ===
          questionIndex
            ? {
                ...question,
                options: [
                  ...question.options,
                  {
                    id: createId(
                      "option",
                    ),
                    text: "",
                  },
                ],
              }
            : question,
      ),
  }));
};

const updateQuestionOption = (
  questionIndex: number,
  optionIndex: number,
  text: string,
) => {
  setQuizForm((current) => ({
    ...current,
    questions:
      current.questions.map(
        (
          question,
          currentQuestionIndex,
        ) => {
          if (
            currentQuestionIndex !==
            questionIndex
          ) {
            return question;
          }

          return {
            ...question,
            options:
              question.options.map(
                (
                  option,
                  currentOptionIndex,
                ) =>
                  currentOptionIndex ===
                  optionIndex
                    ? {
                        ...option,
                        text,
                      }
                    : option,
              ),
          };
        },
      ),
  }));
};

const removeQuestionOption = (
  questionIndex: number,
  optionIndex: number,
) => {
  setQuizForm((current) => ({
    ...current,
    questions:
      current.questions.map(
        (
          question,
          currentQuestionIndex,
        ) => {
          if (
            currentQuestionIndex !==
            questionIndex
          ) {
            return question;
          }

          if (
            question.options.length <=
            2
          ) {
            toast.error(
              "Each question must have at least two options",
            );

            return question;
          }

          const removedOption =
            question.options[
              optionIndex
            ];

          const options =
            question.options.filter(
              (_, index) =>
                index !== optionIndex,
            );

          return {
            ...question,
            options,
            correct_option_id:
              question.correct_option_id ===
              removedOption.id
                ? ""
                : question.correct_option_id,
          };
        },
      ),
  }));
};

const validateQuizForm = () => {
  if (!selectedChapter) {
    throw new Error(
      "Chapter was not selected",
    );
  }

  const title =
    quizForm.title.trim();

  if (!title) {
    throw new Error(
      "Quiz title is required",
    );
  }

  const passingScore =
    Number(
      quizForm.passing_score,
    );

  if (
    !Number.isFinite(
      passingScore,
    ) ||
    passingScore < 0 ||
    passingScore > 100
  ) {
    throw new Error(
      "Passing score must be between 0 and 100",
    );
  }

  const attemptsAllowed =
    Number(
      quizForm.attempts_allowed,
    );

  if (
    !Number.isInteger(
      attemptsAllowed,
    ) ||
    attemptsAllowed < 1
  ) {
    throw new Error(
      "Attempts allowed must be at least 1",
    );
  }

  const timeLimit =
    quizForm.time_limit_minutes.trim()
      ? Number(
          quizForm.time_limit_minutes,
        )
      : null;

  if (
    timeLimit !== null &&
    (!Number.isInteger(
      timeLimit,
    ) ||
      timeLimit < 1)
  ) {
    throw new Error(
      "Time limit must be at least 1 minute",
    );
  }

  if (
    quizForm.questions.length ===
    0
  ) {
    throw new Error(
      "At least one question is required",
    );
  }

  const normalizedQuestions =
    quizForm.questions.map(
      (
        question,
        questionIndex,
      ) => {
        const questionText =
          question.question.trim();

        if (!questionText) {
          throw new Error(
            `Question ${questionIndex + 1} text is required`,
          );
        }

        if (
          question.options.length <
          2
        ) {
          throw new Error(
            `Question ${questionIndex + 1} must have at least two options`,
          );
        }

        const options =
          question.options.map(
            (
              option,
              optionIndex,
            ) => {
              const optionText =
                option.text.trim();

              if (!optionText) {
                throw new Error(
                  `Option ${optionIndex + 1} of question ${questionIndex + 1} is required`,
                );
              }

              return {
                id: option.id,
                text: optionText,
              };
            },
          );

        if (
          !question.correct_option_id
        ) {
          throw new Error(
            `Select the correct answer for question ${questionIndex + 1}`,
          );
        }

        const correctOptionExists =
          options.some(
            (option) =>
              option.id ===
              question.correct_option_id,
          );

        if (
          !correctOptionExists
        ) {
          throw new Error(
            `Correct answer for question ${questionIndex + 1} is invalid`,
          );
        }

        const marks = Number(
          question.marks,
        );

        if (
          !Number.isFinite(marks) ||
          marks <= 0
        ) {
          throw new Error(
            `Marks for question ${questionIndex + 1} must be greater than 0`,
          );
        }

        return {
          id: question.id,
          question:
            questionText,
          options,
          correct_option_id:
            question.correct_option_id,
          marks,
          explanation:
            question.explanation?.trim() ||
            null,
        };
      },
    );

  const payload:
    CreateQuizPayload = {
    chapter_id:
      selectedChapter.id,
    title,
    description:
      quizForm.description.trim() ||
      null,
    passing_score:
      passingScore,
    attempts_allowed:
      attemptsAllowed,
    time_limit_minutes:
      timeLimit,
    randomize_questions:
      quizForm.randomize_questions,
    show_result_immediately:
      quizForm.show_result_immediately,
    status:
      quizForm.status,
    questions:
      normalizedQuestions,
  };

  return payload;
};

const saveQuiz = async () => {
  setQuizSaving(true);

  try {
    const payload =
      validateQuizForm();

    const response = quiz
      ? await adminService.updateQuiz(
          quiz.id,
          payload,
        )
      : await adminService.createQuiz(
          payload,
        );

    setQuiz(
      response.data.data,
    );

    toast.success(
      quiz
        ? "Quiz updated successfully"
        : "Quiz created successfully",
    );

    if (selectedChapter) {
      await loadChapterQuiz(
        selectedChapter.id,
      );
    }
  } catch (error) {
    toast.error(
      errorMessage(error),
    );
  } finally {
    setQuizSaving(false);
  }
};

const deleteQuiz = async () => {
  if (!quiz) {
    return;
  }

  const confirmed =
    window.confirm(
      `Delete "${quiz.title}"?`,
    );

  if (!confirmed) {
    return;
  }

  setQuizDeleting(true);

  try {
    await adminService.deleteQuiz(
      quiz.id,
    );

    toast.success(
      "Quiz deleted successfully",
    );

    resetQuizManager();
  } catch (error) {
    toast.error(
      errorMessage(error),
    );
  } finally {
    setQuizDeleting(false);
  }
};

  const remove = async (row: RecordItem) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      if (tab === "sectors") await adminService.deleteSector(row.id);
      if (tab === "domains") await adminService.deleteDomain(row.id);
      if (tab === "modules") await adminService.deleteModule(row.id);
      if (tab === "chapters") await adminService.deleteChapter(row.id);
      if (tab === "assignments") await adminService.deleteAssignment(row.id);

      toast.success("Deleted successfully");
      await Promise.all([loadRows(), loadReferences()]);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const renderFilters = () => {
    if (tab === "sectors") {
      return (
        <select
          value={secondaryFilter}
          onChange={(event) => {
            setSecondaryFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      );
    }

    if (tab === "chapters") {
      return (
        <>
          <select
            value={chapterDomainFilter}
            onChange={(event) => {
              setChapterDomainFilter(event.target.value);
              setChapterModuleFilter("");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.domain_name}
              </option>
            ))}
          </select>

          <select
            value={chapterModuleFilter}
            disabled={!chapterDomainFilter}
            onChange={(event) => {
              setChapterModuleFilter(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">All modules</option>
            {chapterFilterModules.map((module) => (
              <option key={module.id} value={module.id}>
                Module {module.module_number} - {module.module_name}
              </option>
            ))}
          </select>
        </>
      );
    }

    const options =
      tab === "domains"
        ? sectors.map((item) => ({ id: item.id, label: item.sector_name }))
        : tab === "modules"
          ? domains.map((item) => ({ id: item.id, label: item.domain_name }))
          : chapters.map((item) => ({ id: item.id, label: item.chapter_name }));

    return (
      <select
        value={filterId}
        onChange={(event) => {
          setFilterId(event.target.value);
          setPage(1);
        }}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
      >
        <option value="">All</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    );
  };

  const renderCells = (row: RecordItem) => {
    if (tab === "sectors") {
      const value = row as AdminSector;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.sector_name}</td>
          <td className="px-4 py-4 capitalize">{value.status}</td>
        </>
      );
    }

    if (tab === "domains") {
      const value = row as AdminDomain;
      const sector = value.Sector || value.sector;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.domain_name}</td>
          <td className="px-4 py-4">{sector?.sector_name || "-"}</td>
          <td className="px-4 py-4">₹{Number(value.fee).toLocaleString("en-IN")}</td>
          <td className="px-4 py-4">{value.duration_hours} hours</td>
        </>
      );
    }

    if (tab === "modules") {
      const value = row as AdminModule;
      const domain = value.Domain || value.domain;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.module_name}</td>
          <td className="px-4 py-4">{value.module_number}</td>
          <td className="px-4 py-4">{domain?.domain_name || "-"}</td>
        </>
      );
    }

    if (tab === "chapters") {
      const value = row as AdminChapter;
      const module = value.Module || value.module;
      const domain = module?.Domain || module?.domain;

      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.chapter_name}</td>
          <td className="px-4 py-4">{value.chapter_number}</td>
          <td className="px-4 py-4">{domain?.domain_name || "-"}</td>
          <td className="px-4 py-4">{module?.module_name || "-"}</td>
         <td className="px-4 py-4">
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() =>
        void openResourceManager(
          value,
        )
      }
      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
    >
      <FileUp size={16} />
      Manage Resources
    </button>

    <button
      type="button"
      onClick={() =>
        void openQuizManager(
          value,
        )
      }
      className="inline-flex items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
    >
      <FileQuestion
        size={16}
      />
      Manage Quiz
    </button>
  </div>
</td>
        </>
      );
    }

    const value = row as AdminAssignment;
    const chapter = value.Chapter || value.chapter;

    return (
      <>
        <td className="max-w-2xl px-4 py-4">{value.question_text}</td>
        <td className="px-4 py-4">{chapter?.chapter_name || "-"}</td>
      </>
    );
  };

  const headerCells =
    tab === "sectors"
      ? ["Sector", "Status"]
      : tab === "domains"
        ? ["Domain", "Sector", "Fee", "Duration"]
        : tab === "modules"
          ? ["Module", "Number", "Domain"]
          : tab === "chapters"
            ? ["Chapter", "Number", "Domain", "Module",  "Learning Content",]
            : ["Question", "Chapter"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Setup</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage sectors, domains, modules, chapters and assignments.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2">
          <Plus size={17} />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-3">
        {tabs.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => changeTab(item.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                tab === item.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-5 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-10"
              placeholder={`Search ${title.toLowerCase()}`}
            />
          </div>

          <div className="flex flex-wrap gap-3">{renderFilters()}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {headerCells.map((header) => (
                  <th key={header} className="px-4 py-3 text-center">
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={headerCells.length + 1}
                    className="px-4 py-16 text-center"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-slate-500">Loading...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={headerCells.length + 1}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {renderCells(row)}
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-lg border p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <p className="text-sm text-slate-500">{total} records</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              {page} / {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={totalPages === 0 || page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">
                {editing ? "Edit" : "Create"} {title.slice(0, -1)}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                              }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {tab === "sectors" && (
                <>
                  <FieldLabel label="Sector Name" required>
                    <Input
                      value={form.sector_name}
                      onChange={(event) => updateForm("sector_name", event.target.value)}
                      placeholder="Sector name"
                    />
                  </FieldLabel>

                  <FieldLabel label="Status" required>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target.value as "active" | "inactive",
                        )
                      }
                      className="h-10 w-full rounded-lg border px-3 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </FieldLabel>
                </>
              )}

              {tab === "domains" && (
                <>
                  <FieldLabel label="Sector" required>
                    <select
                      value={form.sector_id}
                      onChange={(event) => updateForm("sector_id", event.target.value)}
                      className="h-10 w-full rounded-lg border px-3 text-sm"
                    >
                      <option value="">Select sector</option>
                      {sectors.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.sector_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Domain Name" required>
                    <Input
                      value={form.domain_name}
                      onChange={(event) => updateForm("domain_name", event.target.value)}
                      placeholder="Domain name"
                    />
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Fee" required>
                      <Input
                        type="number"
                        min={0}
                        value={form.fee}
                        onChange={(event) => updateForm("fee", event.target.value)}
                        placeholder="Fee"
                      />
                    </FieldLabel>
                    <FieldLabel label="Duration Hours" required>
                      <Input
                        type="number"
                        min={0}
                        value={form.duration_hours}
                        onChange={(event) =>
                          updateForm("duration_hours", event.target.value)
                        }
                        placeholder="Duration hours"
                      />
                    </FieldLabel>
                  </div>
                </>
              )}

              {tab === "modules" && (
                <>
                  <FieldLabel label="Domain" required>
                    <select
                      value={form.domain_id}
                      onChange={(event) => updateForm("domain_id", event.target.value)}
                      className="h-10 w-full rounded-lg border px-3 text-sm"
                    >
                      <option value="">Select domain</option>
                      {domains.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.domain_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Module Number" required>
                      <Input
                        type="number"
                        min={1}
                        value={form.module_number}
                        onChange={(event) =>
                          updateForm("module_number", event.target.value)
                        }
                        placeholder="Module number"
                      />
                    </FieldLabel>
                    <FieldLabel label="Module Name" required>
                      <Input
                        value={form.module_name}
                        onChange={(event) => updateForm("module_name", event.target.value)}
                        placeholder="Module name"
                      />
                    </FieldLabel>
                  </div>
                </>
              )}

              {tab === "chapters" && (
                <div className="space-y-5">
                  <FieldLabel label="Domain" required>
                    <select
                      value={form.domain_id}
                      onChange={(event) => {
                        updateForm("domain_id", event.target.value);
                        updateForm("module_id", "");
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Select domain</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.domain_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Module" required>
                    <select
                      value={form.module_id}
                      disabled={!form.domain_id}
                      onChange={(event) => updateForm("module_id", event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {form.domain_id ? "Select module" : "Select domain first"}
                      </option>
                      {chapterFormModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          Module {module.module_number} - {module.module_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Chapter Number" required>
                      <Input
                        type="number"
                        min={1}
                        value={form.chapter_number}
                        onChange={(event) =>
                          updateForm("chapter_number", event.target.value)
                        }
                        placeholder="e.g. 1"
                      />
                    </FieldLabel>

                    <FieldLabel label="Chapter Name" required>
                      <Input
                        value={form.chapter_name}
                        onChange={(event) =>
                          updateForm("chapter_name", event.target.value)
                        }
                        placeholder="Enter chapter name"
                      />
                    </FieldLabel>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    Pehle chapter save karein. Save hone ke baad table me
                    <strong> Manage Resources</strong> se video, PDF, notes,
                    PPT, ZIP aur links add karein.
                  </div>
                </div>
              )}

              {tab === "assignments" && (
                <>
                  <FieldLabel label="Chapter" required>
                    <select
                      value={form.chapter_id}
                      onChange={(event) => updateForm("chapter_id", event.target.value)}
                      className="h-10 w-full rounded-lg border px-3 text-sm"
                    >
                      <option value="">Select chapter</option>
                      {chapters.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.chapter_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Question Text" required>
                    <textarea
                      value={form.question_text}
                      onChange={(event) => updateForm("question_text", event.target.value)}
                      rows={6}
                      placeholder="Question text"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </FieldLabel>
                </>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModal(false);
                                  }}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <Button type="button" disabled={saving} onClick={() => void save()}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editing ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {resourceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Chapter Resources
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedChapter?.chapter_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setResourceModal(false);
                  setSelectedChapter(null);
                  setResources([]);
                  setResourceForm(emptyResourceForm);
                  setResourceFile(null);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">Add Resource</h3>

                <div className="mt-5 space-y-4">
                  <FieldLabel label="Resource Title" required>
                    <Input
                      value={resourceForm.title}
                      onChange={(event) =>
                        setResourceForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Example: Introduction video"
                    />
                  </FieldLabel>

                  <FieldLabel label="Resource Type" required>
                    <select
                      value={resourceForm.resource_type}
                      onChange={(event) => {
                        setResourceForm((current) => ({
                          ...current,
                          resource_type:
                            event.target.value as ChapterResourceType,
                          external_url: "",
                          text_content: "",
                        }));
                        setResourceFile(null);
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="ppt">PPT</option>
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                      <option value="text">Written Notes</option>
                      <option value="link">External Link</option>
                      <option value="zip">ZIP</option>
                      <option value="source_code">Source Code</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldLabel>

                  {resourceForm.resource_type === "link" ? (
                    <FieldLabel label="External Link" required>
                      <Input
                        type="url"
                        value={resourceForm.external_url}
                        onChange={(event) =>
                          setResourceForm((current) => ({
                            ...current,
                            external_url: event.target.value,
                          }))
                        }
                        placeholder="https://example.com"
                      />
                    </FieldLabel>
                  ) : resourceForm.resource_type === "text" ? (
                    <FieldLabel label="Written Notes" required>
                      <textarea
                        rows={8}
                        value={resourceForm.text_content}
                        onChange={(event) =>
                          setResourceForm((current) => ({
                            ...current,
                            text_content: event.target.value,
                          }))
                        }
                        placeholder="Write notes here..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </FieldLabel>
                  ) : (
                    <FieldLabel label="Upload File" required>
                      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 hover:border-blue-400">
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(event) =>
                            setResourceFile(event.target.files?.[0] || null)
                          }
                        />
                        <div className="flex items-center gap-3">
                          <FileUp className="h-5 w-5 text-blue-600" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {resourceFile ? resourceFile.name : "Choose file"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Select the resource file
                            </p>
                          </div>
                        </div>
                      </label>
                    </FieldLabel>
                  )}

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={resourceForm.is_downloadable}
                      onChange={(event) =>
                        setResourceForm((current) => ({
                          ...current,
                          is_downloadable: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    Student can download
                  </label>

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={resourceForm.is_primary}
                      onChange={(event) =>
                        setResourceForm((current) => ({
                          ...current,
                          is_primary: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    Primary resource
                  </label>

                  <Button
                    type="button"
                    disabled={resourceSaving}
                    onClick={() => void saveResource()}
                    className="w-full"
                  >
                    {resourceSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">Saved Resources</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {resources.length} resource{resources.length === 1 ? "" : "s"}
                </p>

                {resourceLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-slate-500">
                      Loading resources...
                    </p>
                  </div>
                ) : resources.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed py-16 text-center">
                    <FileUp className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 font-semibold text-slate-700">
                      No resources added
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {resources.map((resource) => {
                      const resourceUrl = resolveContentUrl(
                        resource.file_url || resource.external_url,
                      );

                      return (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {resource.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="rounded-full bg-slate-100 px-2 py-1 uppercase">
                                {resource.resource_type}
                              </span>
                              {resource.is_primary && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                                  Primary
                                </span>
                              )}
                              {!resource.is_downloadable && (
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                                  View only
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {resourceUrl && (
                              <a
                                href={resourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                                title="Open resource"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => void removeResource(resource)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              title="Delete resource"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {quizModal &&
  selectedChapter && (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Manage Quiz
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Chapter{" "}
              {
                selectedChapter.chapter_number
              }{" "}
              —{" "}
              {
                selectedChapter.chapter_name
              }
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setQuizModal(
                false,
              );
              setSelectedChapter(
                null,
              );
              resetQuizManager();
            }}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {quizLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading quiz...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Quiz Details
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Configure quiz
                      availability and
                      attempt rules.
                    </p>
                  </div>

                  {quiz && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Existing quiz
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FieldLabel
                    label="Quiz Title"
                    required
                  >
                    <Input
                      value={
                        quizForm.title
                      }
                      onChange={(
                        event,
                      ) =>
                        updateQuizField(
                          "title",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter quiz title"
                    />
                  </FieldLabel>

                  <FieldLabel
                    label="Status"
                    required
                  >
                    <select
                      value={
                        quizForm.status
                      }
                      onChange={(
                        event,
                      ) =>
                        updateQuizField(
                          "status",
                          event.target
                            .value as QuizStatus,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="draft">
                        Draft
                      </option>
                      <option value="active">
                        Active
                      </option>
                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </FieldLabel>

                  <div className="md:col-span-2">
                    <FieldLabel label="Description">
                      <textarea
                        value={
                          quizForm.description
                        }
                        onChange={(
                          event,
                        ) =>
                          updateQuizField(
                            "description",
                            event.target
                              .value,
                          )
                        }
                        rows={3}
                        placeholder="Optional quiz description"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </FieldLabel>
                  </div>

                  <FieldLabel
                    label="Passing Score (%)"
                    required
                  >
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={
                        quizForm.passing_score
                      }
                      onChange={(
                        event,
                      ) =>
                        updateQuizField(
                          "passing_score",
                          event.target
                            .value,
                        )
                      }
                    />
                  </FieldLabel>

                  <FieldLabel
                    label="Attempts Allowed"
                    required
                  >
                    <Input
                      type="number"
                      min={1}
                      value={
                        quizForm.attempts_allowed
                      }
                      onChange={(
                        event,
                      ) =>
                        updateQuizField(
                          "attempts_allowed",
                          event.target
                            .value,
                        )
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Time Limit (Minutes)">
                    <Input
                      type="number"
                      min={1}
                      value={
                        quizForm.time_limit_minutes
                      }
                      onChange={(
                        event,
                      ) =>
                        updateQuizField(
                          "time_limit_minutes",
                          event.target
                            .value,
                        )
                      }
                      placeholder="No limit"
                    />
                  </FieldLabel>

                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={
                          quizForm.randomize_questions
                        }
                        onChange={(
                          event,
                        ) =>
                          updateQuizField(
                            "randomize_questions",
                            event.target
                              .checked,
                          )
                        }
                        className="h-4 w-4 rounded"
                      />
                      Randomize questions
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={
                          quizForm.show_result_immediately
                        }
                        onChange={(
                          event,
                        ) =>
                          updateQuizField(
                            "show_result_immediately",
                            event.target
                              .checked,
                          )
                        }
                        className="h-4 w-4 rounded"
                      />
                      Show result
                      immediately
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Questions
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        quizForm
                          .questions
                          .length
                      }{" "}
                      question(s),{" "}
                      {quizForm.questions.reduce(
                        (
                          totalMarks,
                          question,
                        ) =>
                          totalMarks +
                          Number(
                            question.marks ||
                              0,
                          ),
                        0,
                      )}{" "}
                      total marks
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={
                      addQuestion
                    }
                    className="gap-2"
                  >
                    <Plus
                      size={16}
                    />
                    Add Question
                  </Button>
                </div>

                {quizForm.questions.map(
                  (
                    question,
                    questionIndex,
                  ) => (
                    <div
                      key={
                        question.id
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {questionIndex +
                              1}
                          </span>

                          <h4 className="font-semibold text-slate-900">
                            Question{" "}
                            {questionIndex +
                              1}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              questionIndex,
                            )
                          }
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <FieldLabel
                          label="Question Text"
                          required
                        >
                          <textarea
                            value={
                              question.question
                            }
                            onChange={(
                              event,
                            ) =>
                              updateQuestion(
                                questionIndex,
                                {
                                  question:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                            rows={3}
                            placeholder="Enter question"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          />
                        </FieldLabel>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">
                              Options
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                addQuestionOption(
                                  questionIndex,
                                )
                              }
                              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              + Add option
                            </button>
                          </div>

                          <div className="space-y-3">
                            {question.options.map(
                              (
                                option,
                                optionIndex,
                              ) => (
                                <div
                                  key={
                                    option.id
                                  }
                                  className="flex items-center gap-3"
                                >
                                  <button
                                    type="button"
                                    title="Mark as correct answer"
                                    onClick={() =>
                                      updateQuestion(
                                        questionIndex,
                                        {
                                          correct_option_id:
                                            option.id,
                                        },
                                      )
                                    }
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                                      question.correct_option_id ===
                                      option.id
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-slate-300 bg-white text-slate-400"
                                    }`}
                                  >
                                    <CheckCircle2
                                      size={
                                        18
                                      }
                                    />
                                  </button>

                                  <Input
                                    value={
                                      option.text
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateQuestionOption(
                                        questionIndex,
                                        optionIndex,
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeQuestionOption(
                                        questionIndex,
                                        optionIndex,
                                      )
                                    }
                                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                  >
                                    <X
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-500">
                            Click the
                            circle beside
                            an option to
                            mark it as the
                            correct answer.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <FieldLabel
                            label="Marks"
                            required
                          >
                            <Input
                              type="number"
                              min={0.01}
                              step="0.01"
                              value={
                                question.marks
                              }
                              onChange={(
                                event,
                              ) =>
                                updateQuestion(
                                  questionIndex,
                                  {
                                    marks:
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                  },
                                )
                              }
                            />
                          </FieldLabel>

                          <div className="md:col-span-2">
                            <FieldLabel label="Explanation">
                              <Input
                                value={
                                  question.explanation ||
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateQuestion(
                                    questionIndex,
                                    {
                                      explanation:
                                        event
                                          .target
                                          .value,
                                    },
                                  )
                                }
                                placeholder="Explanation shown after submission"
                              />
                            </FieldLabel>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </section>
            </div>
          )}
        </div>

        {!quizLoading && (
          <div className="flex flex-col-reverse justify-between gap-3 border-t bg-slate-50 px-6 py-4 sm:flex-row">
            <div>
              {quiz && (
                <button
                  type="button"
                  disabled={
                    quizDeleting ||
                    quizSaving
                  }
                  onClick={() =>
                    void deleteQuiz()
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {quizDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2
                      size={16}
                    />
                  )}

                  Delete Quiz
                </button>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuizModal(
                    false,
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>

              <Button
                type="button"
                disabled={
                  quizSaving ||
                  quizDeleting
                }
                onClick={() =>
                  void saveQuiz()
                }
                className="gap-2"
              >
                {quizSaving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {quiz
                  ? "Update Quiz"
                  : "Create Quiz"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

    </div>
  );
}

function FieldLabel({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}