"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  Input,
} from "@/components/ui";

import {
  collegeService,
  type CollegeStudentRow,
  type CollegeStudentsData,
} from "@/lib/services";

const initialData: CollegeStudentsData = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,

  summary: {
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    blocked: 0,
  },
};

const statusTabs = [
  {
    label: "All Students",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Blocked",
    value: "blocked",
  },
];

const getApiOrigin = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  return apiUrl.replace(
    /\/api\/?$/,
    "",
  );
};

const buildFileUrl = (
  fileUrl?: string | null,
) => {
  if (!fileUrl) {
    return null;
  }

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  const origin = getApiOrigin();

  return `${origin}${
    fileUrl.startsWith("/")
      ? fileUrl
      : `/${fileUrl}`
  }`;
};

const getErrorMessage = (
  error: unknown,
) => {
  const requestError =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

  return (
    requestError.response?.data?.message ||
    requestError.message ||
    "Something went wrong"
  );
};

const getStatusClass = (
  status: string,
) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";

    case "active":
      return "bg-blue-100 text-blue-700";

    case "blocked":
      return "bg-red-100 text-red-700";

    case "registered":
      return "bg-amber-100 text-amber-700";

    case "preloaded":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function CollegeStudentsPage() {
  const [
    data,
    setData,
  ] =
    useState<CollegeStudentsData>(
      initialData,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    session,
    setSession,
  ] = useState("");

  const [
    semester,
    setSemester,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    passwordStudent,
    setPasswordStudent,
  ] =
    useState<CollegeStudentRow | null>(
      null,
    );

  const loadStudents =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const response =
            await collegeService
              .studentsWithCertificates({
                page,
                limit: 20,

                search:
                  search.trim() ||
                  undefined,

                status:
                  status === "all"
                    ? undefined
                    : status,

                session:
                  session.trim() ||
                  undefined,

                semester:
                  semester.trim() ||
                  undefined,
              });

          setData(
            response.data.data,
          );
        } catch (error) {
          toast.error(
            getErrorMessage(
              error,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        status,
        session,
        semester,
      ],
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadStudents();
        },
        300,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [loadStudents]);

  const handleViewCertificate = (
    student: CollegeStudentRow,
  ) => {
    const certificateUrl =
      buildFileUrl(
        student.certificate
          ?.certificate_url,
      );

    if (!certificateUrl) {
      toast.error(
        "Certificate file is not available",
      );

      return;
    }

    window.open(
      certificateUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleDownloadCertificate =
    async (
      student: CollegeStudentRow,
    ) => {
      if (
        !student.can_download_certificate
      ) {
        toast.error(
          student.certificate_message,
        );

        return;
      }

      setDownloadingId(
        student.id,
      );

      try {
        const response =
          await collegeService
            .downloadStudentCertificate(
              student.id,
            );

        const blob =
          response.data instanceof Blob
            ? response.data
            : new Blob(
                [response.data],
                {
                  type: "application/pdf",
                },
              );

        const blobUrl =
          window.URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            "a",
          );

        const registrationNumber =
          student.registration_number ||
          student.student_id ||
          String(student.id);

        anchor.href = blobUrl;

        anchor.download =
          `${registrationNumber}-internship-certificate.pdf`;

        document.body.appendChild(
          anchor,
        );

        anchor.click();
        anchor.remove();

        window.URL.revokeObjectURL(
          blobUrl,
        );

        toast.success(
          "Certificate downloaded successfully",
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setDownloadingId(
          null,
        );
      }
    };

  const cards = [
    {
      label: "Total Students",
      value: data.summary.total,
      icon: Users,
    },
    {
      label: "Active",
      value: data.summary.active,
      icon: Clock3,
    },
    {
      label: "Completed",
      value: data.summary.completed,
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: data.summary.pending,
      icon: ShieldAlert,
    },
  ];

  const handleResetPassword =
    async (
      studentId: number,
      newPassword: string,
    ) => {
      const response =
        await collegeService
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
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Students & Certificates
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View all students of your college and download certificates after internship completion.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map(
              (tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatus(
                      tab.value,
                    );

                    setPage(1);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    status === tab.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ),
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                value={search}
                placeholder="Search name, registration, email or mobile"
                className="pl-10"
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );

                  setPage(1);
                }}
              />
            </div>

            <Input
              value={session}
              placeholder="Session"
              onChange={(event) => {
                setSession(
                  event.target.value,
                );

                setPage(1);
              }}
            />

            <Input
              value={semester}
              placeholder="Semester"
              onChange={(event) => {
                setSemester(
                  event.target.value,
                );

                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Student
                </th>

                <th className="px-4 py-3">
                  Registration
                </th>

                <th className="px-4 py-3">
                  Domain
                </th>

                <th className="px-4 py-3">
                  Session
                </th>

                <th className="px-4 py-3">
                  Progress
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : data.items.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                data.items.map(
                  (student) => {
                    const progress =
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            student.total_progress ||
                            0,
                          ),
                        ),
                      );

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {student.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.email ||
                              student.mobile ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">
                            {
                              student.registration_number
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.student_id ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          {student.domain
                            ?.domain_name ||
                            student.major_subject ||
                            "-"}
                        </td>

                        <td className="px-4 py-4">
                          <p>
                            {student.session ||
                              "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Semester{" "}
                            {student.semester ||
                              "-"}
                          </p>
                        </td>

                        <td className="min-w-40 px-4 py-4">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span>
                              Progress
                            </span>

                            <span className="font-semibold">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                              student.internship_status,
                            )}`}
                          >
                            {
                              student.internship_status
                            }
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex min-w-[250px] flex-col items-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-9 gap-1.5 whitespace-nowrap px-3 text-xs"
                              onClick={() =>
                                setPasswordStudent(
                                  student,
                                )
                              }
                            >
                              <KeyRound size={15} />
                              Change Password
                            </Button>

                            {student.can_download_certificate ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewCertificate(
                                      student,
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  <Eye size={15} />
                                  View Certificate
                                </button>

                                <Button
                                  type="button"
                                  disabled={
                                    downloadingId ===
                                    student.id
                                  }
                                  onClick={() =>
                                    void handleDownloadCertificate(
                                      student,
                                    )
                                  }
                                  className="gap-1.5"
                                >
                                  <Download
                                    size={15}
                                  />

                                  {downloadingId ===
                                  student.id
                                    ? "Downloading..."
                                    : "Download"}
                                </Button>
                              </div>
                            ) : (
                              <p className="max-w-60 text-right text-xs text-slate-500">
                                {
                                  student.certificate_message
                                }
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              Page {data.page} of{" "}
              {data.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  data.totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        data.totalPages,
                        current + 1,
                      ),
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {passwordStudent && (
        <CollegeResetPasswordModal
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
    </div>
  );
}

function CollegeResetPasswordModal({
  student,
  onClose,
  onSubmit,
}: {
  student: CollegeStudentRow;
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
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
        ),
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
              {student.name} ·{" "}
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

          <p className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            You can change passwords only for students registered under your college.
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