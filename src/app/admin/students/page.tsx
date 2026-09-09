"use client";

import type {
  ColumnDef,
} from "@tanstack/react-table";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  KeyRound,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import {
  Badge,
  Button,
  Input,
  PageHeader,
} from "@/components/ui";
import {
  adminService,
  type AdminStudentImportResult,
} from "@/lib/services";
import type {
  College,
  Student,
} from "@/types";

interface StudentWithRelations extends Student {
  college?: {
    id: number;
    name: string;
    code?: string | null;
    university?: string | null;
  } | null;

  domain?: {
    id: number;
    domain_name: string;
  } | null;
}

interface StudentFilters {
  search: string;
  college_id: string;
  session: string;
  semester: string;
  status: string;
}

const initialFilters: StudentFilters = {
  search: "",
  college_id: "",
  session: "",
  semester: "",
  status: "",
};

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<
    StudentWithRelations[]
  >([]);

  const [colleges, setColleges] = useState<
    College[]
  >([]);

  const [filters, setFilters] =
    useState<StudentFilters>(
      initialFilters,
    );

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [
  internshipStartDates,
  setInternshipStartDates,
] = useState<Record<number, string>>(
  {},
);

const [
  startingStudentId,
  setStartingStudentId,
] = useState<number | null>(
  null,
);

  const [collegesLoading, setCollegesLoading] =
    useState(true);

  const [importOpen, setImportOpen] =
    useState(false);

  const [
    passwordStudent,
    setPasswordStudent,
  ] =
    useState<StudentWithRelations | null>(
      null,
    );

  const loadColleges = useCallback(
    async () => {
      try {
        setCollegesLoading(true);

        const response =
          await adminService.colleges({
            page: 1,
            limit: 100,
          });

        setColleges(
          response.data.data.items || [],
        );
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ??
            "Unable to load colleges",
        );
      } finally {
        setCollegesLoading(false);
      }
    },
    [],
  );

  const loadStudents = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await adminService.students({
            page,
            limit,
            search:
              filters.search.trim() ||
              undefined,
            college_id:
              filters.college_id ||
              undefined,
            session:
              filters.session.trim() ||
              undefined,
            semester:
              filters.semester.trim() ||
              undefined,
            status:
              filters.status ||
              undefined,
          });

        const result =
          response.data.data;

        setStudents(
          result.items || [],
        );

        setTotal(
          Number(result.total || 0),
        );

        setTotalPages(
          Math.max(
            1,
            Number(result.totalPages || 1),
          ),
        );
      } catch (error: any) {
        setStudents([]);

        toast.error(
          error?.response?.data?.message ??
            "Unable to load students",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      filters.college_id,
      filters.search,
      filters.semester,
      filters.session,
      filters.status,
      limit,
      page,
    ],
  );

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        loadStudents();
      },
      350,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadStudents]);

  const updateFilter = (
    key: keyof StudentFilters,
    value: string,
  ) => {
    setPage(1);

    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters(initialFilters);
  };
const handleStartInternship =
  useCallback(
    async (
      student:
        StudentWithRelations,
    ) => {
      const startDate =
        internshipStartDates[
          student.id
        ] ||
        student
          .internship_start_date ||
        "";

      if (!startDate) {
        toast.error(
          "Please select internship start date",
        );
        return;
      }

      if (
        student.payment_status !==
        "paid"
      ) {
        toast.error(
          "Student payment is not completed",
        );
        return;
      }

      try {
        setStartingStudentId(
          student.id,
        );

        const response =
          await adminService
            .startStudentInternship(
              student.id,
              startDate,
            );

        toast.success(
          response.data.message ||
            "Internship start date saved",
        );

        await loadStudents();
      } catch (error: any) {
        toast.error(
          error?.response?.data
            ?.message ??
            "Unable to start internship",
        );
      } finally {
        setStartingStudentId(
          null,
        );
      }
    },
    [
      internshipStartDates,
      loadStudents,
    ],
  );

  const handleResetPassword =
    useCallback(
      async (
        studentId: number,
        newPassword: string,
      ) => {
        const response =
          await adminService
            .resetStudentPassword(
              studentId,
              newPassword,
            );

        toast.success(
          response.data.message ||
            "Student password changed successfully",
        );

        setPasswordStudent(
          null,
        );
      },
      [],
    );

  const hasFilters =
    filters.search !== "" ||
    filters.college_id !== "" ||
    filters.session !== "" ||
    filters.semester !== "" ||
    filters.status !== "";

  const columns = useMemo<
  ColumnDef<StudentWithRelations>[]
>(
  () => [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = row.original;

        return (
          <div className="w-[190px]">
            <p className="font-semibold text-slate-900">
              {student.name || "-"}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-600">
              {student.registration_number || "-"}
            </p>

            <p className="text-xs text-slate-500">
              {student.student_id || "ID not assigned"}
            </p>

            {student.email && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {student.email}
              </p>
            )}

            {student.mobile && (
              <p className="text-xs text-slate-500">
                {student.mobile}
              </p>
            )}
          </div>
        );
      },
    },

    {
      id: "college_domain",
      header: "College / Domain",
      cell: ({ row }) => (
        <div className="w-[180px]">
          <p className="line-clamp-2 font-medium text-slate-900">
            {row.original.college?.name || "-"}
          </p>

          {row.original.college?.code && (
            <p className="mt-1 text-xs text-slate-500">
              {row.original.college.code}
            </p>
          )}

          {row.original.domain?.domain_name && (
            <p className="mt-1 text-xs font-medium text-indigo-600">
              {row.original.domain.domain_name}
            </p>
          )}
        </div>
      ),
    },

    {
      id: "academic",
      header: "Academic",
      cell: ({ row }) => (
        <div className="w-[165px]">
          <p className="line-clamp-2 font-medium text-slate-800">
            {row.original.programme || "-"}
          </p>

          {row.original.major_subject && (
            <p className="mt-1 text-xs text-slate-500">
              {row.original.major_subject}
            </p>
          )}

          <p className="mt-1 text-xs text-slate-500">
            {row.original.session || "-"} · Sem{" "}
            {row.original.semester || "-"}
          </p>
        </div>
      ),
    },

    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="w-[110px] space-y-2">
          <InternshipStatusBadge
            status={row.original.internship_status}
          />

          <div>
            <PaymentStatusBadge
              status={row.original.payment_status}
            />
          </div>
        </div>
      ),
    },

    {
      id: "internship_start",
      header: "Start Internship",
      cell: ({ row }) => {
        const student = row.original;

        if (student.payment_status !== "paid") {
          return (
            <div className="w-[200px]">
              <p className="text-xs font-medium text-amber-600">
                Payment pending
              </p>
            </div>
          );
        }

        if (student.internship_status === "completed") {
          return (
            <div className="w-[200px]">
              <Badge tone="green">
                Completed
              </Badge>
            </div>
          );
        }

        if (student.internship_status === "blocked") {
          return (
            <div className="w-[200px]">
              <Badge tone="red">
                Blocked
              </Badge>
            </div>
          );
        }

        return (
          <div className="w-[215px]">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={
                  internshipStartDates[student.id] ||
                  student.internship_start_date ||
                  ""
                }
                onChange={(event) =>
                  setInternshipStartDates((current) => ({
                    ...current,
                    [student.id]: event.target.value,
                  }))
                }
                className="h-9 w-[140px] px-2 text-xs"
              />

              <Button
                type="button"
                className="h-9 whitespace-nowrap px-3 text-xs"
                disabled={
                  startingStudentId === student.id
                }
                onClick={() =>
                  void handleStartInternship(student)
                }
              >
                {startingStudentId === student.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : student.internship_start_date ? (
                  "Save"
                ) : (
                  "Start"
                )}
              </Button>
            </div>

            {student.internship_start_date && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {student.internship_start_date}
              </p>
            )}
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex w-[210px] gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-9 whitespace-nowrap px-3 text-xs"
            onClick={() =>
              router.push(
                `/admin/students/${row.original.id}`,
              )
            }
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-9 whitespace-nowrap px-3 text-xs"
            onClick={() =>
              setPasswordStudent(
                row.original,
              )
            }
          >
            <KeyRound className="mr-1.5 h-4 w-4" />
            Password
          </Button>
        </div>
      ),
    },
  ],
  [
    router,
    internshipStartDates,
    startingStudentId,
    handleStartInternship,
  ],
);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        action={
          <Button
            type="button"
            onClick={() =>
              setImportOpen(true)
            }
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="font-semibold text-slate-900">
            Student filters
          </h2>

          <p className="text-sm text-slate-500">
            Search and filter students across
            all colleges.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  "search",
                  event.target.value,
                )
              }
              placeholder="Name, registration, email..."
              className="pl-9"
            />
          </div>

          <select
            value={filters.college_id}
            onChange={(event) =>
              updateFilter(
                "college_id",
                event.target.value,
              )
            }
            disabled={collegesLoading}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              All colleges
            </option>

            {colleges.map((college) => (
              <option
                key={college.id}
                value={college.id}
              >
                {college.name}
              </option>
            ))}
          </select>

          <Input
            value={filters.session}
            onChange={(event) =>
              updateFilter(
                "session",
                event.target.value,
              )
            }
            placeholder="Session, e.g. 2025-28"
          />

          <Input
            value={filters.semester}
            onChange={(event) =>
              updateFilter(
                "semester",
                event.target.value,
              )
            }
            placeholder="Semester"
          />

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value,
              )
            }
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
          >
            <option value="">
              All statuses
            </option>

            <option value="preloaded">
              Preloaded
            </option>

            <option value="registered">
              Registered
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="blocked">
              Blocked
            </option>
          </select>
        </div>

        {hasFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={clearFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Student list
            </h2>

            <p className="text-sm text-slate-500">
              {total.toLocaleString()} student
              {total === 1 ? "" : "s"} found
            </p>
          </div>

          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          )}
        </div>

        {loading && students.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-slate-400" />

            <h3 className="font-semibold text-slate-900">
              No students found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Change the filters or import students
              using an Excel file.
            </p>

            <Button
              type="button"
              className="mt-4"
              onClick={() =>
                setImportOpen(true)
              }
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import Students
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              data={students}
              columns={columns}
            />
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={
              page <= 1 || loading
            }
            onClick={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1,
                ),
              )
            }
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={
              page >= totalPages ||
              loading
            }
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1,
                ),
              )
            }
          >
            Next
          </Button>
        </div>
      </div>

      {passwordStudent && (
        <ResetPasswordModal
          student={passwordStudent}
          onClose={() =>
            setPasswordStudent(
              null,
            )
          }
          onSubmit={
            handleResetPassword
          }
        />
      )}

      {importOpen && (
        <StudentImportModal
          colleges={colleges}
          collegesLoading={
            collegesLoading
          }
          onClose={() =>
            setImportOpen(false)
          }
          onImported={() => {
            setImportOpen(false);
            setPage(1);
            loadStudents();
          }}
        />
      )}
    </div>
  );
}

function ResetPasswordModal({
  student,
  onClose,
  onSubmit,
}: {
  student: StudentWithRelations;
  onClose: () => void;
  onSubmit: (
    studentId: number,
    newPassword: string,
  ) => Promise<void>;
}) {
  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const submit = async () => {
    if (
      newPassword.length < 8
    ) {
      toast.error(
        "Password must be at least 8 characters",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "New password and confirm password do not match",
      );
      return;
    }

    try {
      setSaving(true);

      await onSubmit(
        student.id,
        newPassword,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data
          ?.message ??
          "Unable to change student password",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student Password
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Change Password
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {student.name || "Student"} ·{" "}
              {student.registration_number}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <div className="relative">
              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value,
                  )
                }
                placeholder="Minimum 8 characters"
                className="pr-11"
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>

            <Input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Enter password again"
            />
          </div>

          <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Existing refresh-token sessions for this student will be revoked.
            The student will need to log in again when the current access token expires.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              saving ||
              newPassword.length < 8 ||
              confirmPassword.length < 8
            }
            onClick={() =>
              void submit()
            }
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentImportModal({
  colleges,
  collegesLoading,
  onClose,
  onImported,
}: {
  colleges: College[];
  collegesLoading: boolean;
  onClose: () => void;
  onImported: (
    result:
      AdminStudentImportResult,
  ) => void;
}) {
  const [collegeId, setCollegeId] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [importing, setImporting] =
    useState(false);

  const [result, setResult] =
    useState<AdminStudentImportResult | null>(
      null,
    );

  const handleFileChange = (
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      extension !== "xlsx" &&
      extension !== "xls"
    ) {
      toast.error(
        "Please select an XLSX or XLS file",
      );

      event.target.value = "";
      setFile(null);
      return;
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      toast.error(
        "File size cannot exceed 10 MB",
      );

      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleImport = async () => {
    if (!collegeId) {
      toast.error(
        "Please select a college",
      );
      return;
    }

    if (!file) {
      toast.error(
        "Please select an Excel file",
      );
      return;
    }

    try {
      setImporting(true);
      setResult(null);

      const response =
        await adminService.importStudents(
          Number(collegeId),
          file,
        );

      const importResult =
        response.data.data;

      setResult(importResult);

      toast.success(
        `Import completed: ${importResult.inserted} inserted and ${importResult.updated} updated`,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Student import failed",
      );
    } finally {
      setImporting(false);
    }
  };

  const finishImport = () => {
    if (result) {
      onImported(result);
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !importing
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Import Students
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a college and upload the
              student Excel file.
            </p>
          </div>

          <button
            type="button"
            onClick={finishImport}
            disabled={importing}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {!result && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  College
                </label>

                <select
                  value={collegeId}
                  onChange={(event) =>
                    setCollegeId(
                      event.target.value,
                    )
                  }
                  disabled={
                    importing ||
                    collegesLoading
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    Select college
                  </option>

                  {colleges.map(
                    (college) => (
                      <option
                        key={college.id}
                        value={college.id}
                      >
                        {college.name}
                        {college.code
                          ? ` (${college.code})`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Excel file
                </label>

                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-slate-400 hover:bg-slate-50">
                  <Upload className="mb-3 h-9 w-9 text-slate-400" />

                  <span className="font-medium text-slate-800">
                    {file
                      ? file.name
                      : "Choose Excel file"}
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    XLSX or XLS, maximum 10 MB
                  </span>

                  {file && (
                    <span className="mt-2 text-xs font-medium text-green-600">
                      File selected successfully
                    </span>
                  )}

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    disabled={importing}
                    onChange={
                      handleFileChange
                    }
                  />
                </label>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      College mapping
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      Every student from the Excel
                      file will be linked to the
                      selected college.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {result && (
            <ImportResult
              result={result}
            />
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          {result ? (
            <Button
              type="button"
              onClick={finishImport}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={importing}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleImport}
                disabled={
                  importing ||
                  !collegeId ||
                  !file
                }
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Students
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ImportResult({
  result,
}: {
  result:
    AdminStudentImportResult;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <h3 className="font-semibold text-green-900">
          Import completed
        </h3>

        <p className="mt-1 text-sm text-green-700">
          Students were imported for{" "}
          <strong>
            {result.college.name}
          </strong>
          .
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ResultCard
          label="Total Rows"
          value={result.total_rows}
        />

        <ResultCard
          label="Inserted"
          value={result.inserted}
        />

        <ResultCard
          label="Updated"
          value={result.updated}
        />

        <ResultCard
          label="Skipped"
          value={result.skipped}
        />
      </div>

      {result.errors.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-slate-900">
            Import errors
          </h3>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-red-200">
            {result.errors.map(
              (error, index) => (
                <div
                  key={`${error.row}-${index}`}
                  className="border-b border-red-100 p-3 last:border-b-0"
                >
                  <p className="text-sm font-medium text-red-800">
                    Row {error.row}
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error.message}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InternshipStatusBadge({
  status,
}: {
  status: string;
}) {
  switch (status) {
    case "active":
      return (
        <Badge tone="green">
          Active
        </Badge>
      );

    case "completed":
      return (
        <Badge tone="green">
          Completed
        </Badge>
      );

    case "blocked":
      return (
        <Badge tone="red">
          Blocked
        </Badge>
      );

    case "registered":
      return (
        <Badge>
          Registered
        </Badge>
      );

    case "preloaded":
      return (
        <Badge>
          Preloaded
        </Badge>
      );

    default:
      return (
        <Badge>
          {status || "Unknown"}
        </Badge>
      );
  }
}

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  switch (status) {
    case "paid":
      return (
        <Badge tone="green">
          Paid
        </Badge>
      );

    case "failed":
      return (
        <Badge tone="red">
          Failed
        </Badge>
      );

    case "refunded":
      return (
        <Badge>
          Refunded
        </Badge>
      );

    default:
      return (
        <Badge>
          Pending
        </Badge>
      );
  }
}