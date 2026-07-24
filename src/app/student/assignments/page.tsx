"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Upload,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import {
  studentService,
  type StudentAssignment,
  type StudentAssignmentsData,
  type StudentAssignmentStatus,
} from "@/lib/services";

type AssignmentFilter =
  | "all"
  | "pending"
  | "submitted"
  | "approved"
  | "rejected";

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

const getFileUrl = (
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
    value.startsWith("/")
      ? value
      : `/${value}`
  }`;
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(date);
};

const formatDateTime = (
  value?: string | null,
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
};

const normalizeStatus = (
  status: StudentAssignmentStatus,
): AssignmentFilter => {
  if (
    status === "submitted" ||
    status === "pending_review"
  ) {
    return "submitted";
  }

  if (
    status === "rejected" ||
    status === "resubmit"
  ) {
    return "rejected";
  }

  if (status === "approved") {
    return "approved";
  }

  return "pending";
};

const statusDetails: Record<
  StudentAssignmentStatus,
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  submitted: {
    label: "Submitted",
    className:
      "bg-blue-50 text-blue-700",
    icon: Send,
  },

  pending_review: {
    label: "Pending Review",
    className:
      "bg-blue-50 text-blue-700",
    icon: Clock3,
  },

  approved: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },

  rejected: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700",
    icon: XCircle,
  },

  resubmit: {
    label: "Resubmit",
    className:
      "bg-orange-50 text-orange-700",
    icon: RotateCcw,
  },
};

function StatusBadge({
  status,
}: {
  status: StudentAssignmentStatus;
}) {
  const detail =
    statusDetails[status] ??
    statusDetails.pending;

  const Icon = detail.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${detail.className}`}
    >
      <Icon
        size={14}
        className="mr-1.5"
      />

      {detail.label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2
          size={34}
          className="animate-spin"
        />

        <p className="text-sm">
          Loading assignments...
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
          Assignments could not be loaded
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

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof FileText;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function AssignmentDetailsModal({
  assignment,
  onClose,
  onSubmitted,
}: {
  assignment: StudentAssignment;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const isOverdue = useMemo(() => {
    if (!assignment.due_date) {
      return false;
    }

    const dueDate = new Date(
      assignment.due_date,
    );

    if (
      Number.isNaN(dueDate.getTime())
    ) {
      return false;
    }

    return (
      dueDate.getTime() <
        new Date().getTime() &&
      !assignment.submission
    );
  }, [
    assignment.due_date,
    assignment.submission,
  ]);

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error(
        "Please select an assignment file.",
      );

      return;
    }

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "zip",
    ];

    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase() ?? "";

    if (
      !allowedExtensions.includes(
        extension,
      )
    ) {
      toast.error(
        "Only PDF, DOC, DOCX, PPT, PPTX and ZIP files are allowed.",
      );

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (
      selectedFile.size > maxSize
    ) {
      toast.error(
        "File size must not exceed 10 MB.",
      );

      return;
    }

    try {
      setSubmitting(true);

      const response =
        await studentService.submitAssignment(
          assignment.id,
          selectedFile,
        );

      toast.success(
        response.data.message ||
          "Assignment submitted successfully",
      );

      setSelectedFile(null);
      onSubmitted();
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(error),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
          <div>
            <StatusBadge
              status={assignment.status}
            />

            <h2 className="mt-3 text-xl font-bold text-slate-900">
              {assignment.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Module{" "}
              {assignment.module.number}:{" "}
              {assignment.module.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Chapter
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {assignment.chapter.number}.{" "}
                {assignment.chapter.name}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Due Date
              </p>

              <p
                className={`mt-2 font-semibold ${
                  isOverdue
                    ? "text-red-600"
                    : "text-slate-900"
                }`}
              >
                {formatDate(
                  assignment.due_date,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Maximum Marks
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {assignment.maximum_marks ||
                  "Not specified"}
              </p>
            </div>
          </section>

          {assignment.description && (
            <section>
              <h3 className="font-bold text-slate-900">
                Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {assignment.description}
              </p>
            </section>
          )}

          {assignment.instructions && (
            <section>
              <h3 className="font-bold text-slate-900">
                Instructions
              </h3>

              <div className="mt-2 whitespace-pre-wrap rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-slate-700">
                {assignment.instructions}
              </div>
            </section>
          )}

          {assignment.file_url && (
            <section>
              <h3 className="font-bold text-slate-900">
                Assignment File
              </h3>

              <a
                href={getFileUrl(
                  assignment.file_url,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download
                  size={17}
                  className="mr-2"
                />

                Download Assignment
              </a>
            </section>
          )}

          {assignment.submission && (
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Your Submission
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Submitted on{" "}
                    {formatDateTime(
                      assignment
                        .submission
                        .submitted_at,
                    )}
                  </p>
                </div>

                <StatusBadge
                  status={
                    assignment.submission
                      .status
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={getFileUrl(
                    assignment.submission
                      .file_url,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Eye
                    size={17}
                    className="mr-2"
                  />

                  View Submission
                </a>

                {assignment.submission
                  .marks !== null && (
                  <div className="inline-flex items-center rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                    <Award
                      size={17}
                      className="mr-2"
                    />

                    Marks:{" "}
                    {
                      assignment.submission
                        .marks
                    }
                    {assignment.maximum_marks
                      ? `/${assignment.maximum_marks}`
                      : ""}
                  </div>
                )}
              </div>

              {assignment.submission
                .mentor_comments && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mentor Feedback
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {
                      assignment.submission
                        .mentor_comments
                    }
                  </p>
                </div>
              )}
            </section>
          )}

          {assignment.can_submit && (
            <section className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
              <h3 className="font-bold text-slate-900">
                {assignment.submission
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload your completed
                assignment file. Maximum
                size is 10 MB.
              </p>

              <div className="mt-4">
                <label className="label">
                  Assignment File
                </label>

                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                  disabled={submitting}
                  onChange={(event) => {
                    setSelectedFile(
                      event.target
                        .files?.[0] ??
                        null,
                    );
                  }}
                />

                {selectedFile && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3 text-sm">
                    <FileText
                      size={18}
                      className="text-blue-600"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-700">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                className="mt-4"
                disabled={
                  submitting ||
                  !selectedFile
                }
                onClick={() => {
                  void handleSubmit();
                }}
              >
                {submitting ? (
                  <Loader2
                    size={17}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <Upload
                    size={17}
                    className="mr-2"
                  />
                )}

                {submitting
                  ? "Submitting..."
                  : assignment.submission
                    ? "Resubmit Assignment"
                    : "Submit Assignment"}
              </Button>
            </section>
          )}

          {!assignment.can_submit &&
            assignment.status ===
              "approved" && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
                This assignment has been
                approved and cannot be
                submitted again.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const [
    data,
    setData,
  ] =
    useState<StudentAssignmentsData | null>(
      null,
    );

  const [
    selectedAssignment,
    setSelectedAssignment,
  ] =
    useState<StudentAssignment | null>(
      null,
    );

  const [
    filter,
    setFilter,
  ] =
    useState<AssignmentFilter>("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadAssignments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await studentService.assignments();

        setData(response.data.data);
      } catch (requestError) {
        const message =
          getErrorMessage(requestError);

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const filteredAssignments =
    useMemo(() => {
      const assignments =
        data?.assignments ?? [];

      const query =
        search.trim().toLowerCase();

      return assignments.filter(
        (assignment) => {
          const matchesFilter =
            filter === "all" ||
            normalizeStatus(
              assignment.status,
            ) === filter;

          const matchesSearch =
            !query ||
            assignment.title
              ?.toLowerCase()
              .includes(query) ||
            assignment.module.name
              ?.toLowerCase()
              .includes(query) ||
            assignment.chapter.name
              ?.toLowerCase()
              .includes(query);

          return (
            matchesFilter &&
            matchesSearch
          );
        },
      );
    }, [data, filter, search]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message={
          error ||
          "Assignment data was not returned."
        }
        onRetry={() => {
          void loadAssignments();
        }}
      />
    );
  }

  const filterButtons: Array<{
    key: AssignmentFilter;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "All",
      count: data.summary.total,
    },
    {
      key: "pending",
      label: "Pending",
      count: data.summary.pending,
    },
    {
      key: "submitted",
      label: "Submitted",
      count: data.summary.submitted,
    },
    {
      key: "approved",
      label: "Approved",
      count: data.summary.approved,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: data.summary.rejected,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total"
          value={data.summary.total}
          icon={FileText}
        />

        <SummaryCard
          title="Pending"
          value={data.summary.pending}
          icon={Clock3}
        />

        <SummaryCard
          title="Submitted"
          value={data.summary.submitted}
          icon={Send}
        />

        <SummaryCard
          title="Approved"
          value={data.summary.approved}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Rejected"
          value={data.summary.rejected}
          icon={XCircle}
        />
      </section>

      <section className="card">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(
              (item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() =>
                    setFilter(item.key)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === item.key
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}{" "}
                  <span className="ml-1 opacity-70">
                    ({item.count})
                  </span>
                </button>
              ),
            )}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search assignments..."
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {filteredAssignments.length >
      0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {filteredAssignments.map(
            (assignment) => {
              const isOverdue =
                assignment.due_date &&
                new Date(
                  assignment.due_date,
                ).getTime() <
                  new Date().getTime() &&
                !assignment.submission;

              return (
                <article
                  key={assignment.id}
                  className="card flex flex-col"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Module{" "}
                        {
                          assignment.module
                            .number
                        }{" "}
                        • Chapter{" "}
                        {
                          assignment.chapter
                            .number
                        }
                      </p>

                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {assignment.title}
                      </h2>
                    </div>

                    <StatusBadge
                      status={
                        assignment.status
                      }
                    />
                  </div>

                  {assignment.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {
                        assignment.description
                      }
                    </p>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays
                        size={17}
                      />

                      <span
                        className={
                          isOverdue
                            ? "font-medium text-red-600"
                            : ""
                        }
                      >
                        {formatDate(
                          assignment.due_date,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Award size={17} />

                      <span>
                        {assignment.maximum_marks
                          ? `${assignment.maximum_marks} marks`
                          : "Marks not specified"}
                      </span>
                    </div>
                  </div>

                  {assignment.submission
                    ?.mentor_comments && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-semibold">
                        Mentor:
                      </span>{" "}
                      {
                        assignment.submission
                          .mentor_comments
                      }
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <div className="text-sm">
                      {assignment.submission
                        ?.marks !== null &&
                      assignment.submission
                        ?.marks !==
                        undefined ? (
                        <span className="font-semibold text-green-600">
                          Marks:{" "}
                          {
                            assignment
                              .submission
                              .marks
                          }
                          {assignment.maximum_marks
                            ? `/${assignment.maximum_marks}`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          No marks available
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setSelectedAssignment(
                          assignment,
                        )
                      }
                    >
                      <Eye
                        size={17}
                        className="mr-2"
                      />

                      View Details
                    </Button>
                  </div>
                </article>
              );
            },
          )}
        </section>
      ) : (
        <section className="card py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600">
            <FileCheck2 size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold">
            No assignments found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            No assignments match the
            selected filter or search.
          </p>
        </section>
      )}

      {selectedAssignment && (
        <AssignmentDetailsModal
          assignment={
            selectedAssignment
          }
          onClose={() =>
            setSelectedAssignment(null)
          }
          onSubmitted={() => {
            void loadAssignments();
          }}
        />
      )}
    </div>
  );
}