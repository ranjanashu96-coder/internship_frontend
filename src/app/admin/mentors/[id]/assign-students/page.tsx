"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Search,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  adminService,
  type MentorAssignableStudent,
  type MentorAssignmentMentor,
} from "@/lib/services";

type AssignmentTab =
  | "unassigned"
  | "assigned";

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
    requestError.response?.data
      ?.message ||
    requestError.message ||
    "Something went wrong"
  );
};

const getStatusClass = (
  status: string,
) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-700";

    case "completed":
      return "bg-emerald-100 text-emerald-700";

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

export default function AssignMentorStudentsPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const mentorId =
    Number(
      params.id,
    );

  const [
    mentor,
    setMentor,
  ] =
    useState<MentorAssignmentMentor | null>(
      null,
    );

  const [
    students,
    setStudents,
  ] =
    useState<
      MentorAssignableStudent[]
    >([]);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AssignmentTab>(
      "unassigned",
    );

  const [
    selectedStudentIds,
    setSelectedStudentIds,
  ] =
    useState<number[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

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
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const loadStudents =
    useCallback(
      async () => {
        if (
          !Number.isInteger(
            mentorId,
          ) ||
          mentorId <= 0
        ) {
          toast.error(
            "Invalid mentor ID",
          );

          return;
        }

        setLoading(true);

        try {
          const response =
            await adminService
              .mentorStudents(
                mentorId,
                {
                  page,
                  limit: 20,

                  search:
                    search.trim() ||
                    undefined,

                  session:
                    session.trim() ||
                    undefined,

                  semester:
                    semester.trim() ||
                    undefined,

                  assignment_status:
                    activeTab,
                },
              );

          const responseData =
            response.data.data;

          setMentor(
            responseData.mentor,
          );

          setStudents(
            responseData.items,
          );

          setTotal(
            responseData.total,
          );

          setTotalPages(
            responseData.totalPages,
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
        activeTab,
        mentorId,
        page,
        search,
        semester,
        session,
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

  useEffect(() => {
    setSelectedStudentIds(
      [],
    );
  }, [
    activeTab,
    page,
    search,
    session,
    semester,
  ]);

  const allCurrentPageSelected =
    useMemo(
      () =>
        students.length >
          0 &&
        students.every(
          (student) =>
            selectedStudentIds.includes(
              student.id,
            ),
        ),
      [
        selectedStudentIds,
        students,
      ],
    );

  const toggleStudent = (
    studentId: number,
  ) => {
    setSelectedStudentIds(
      (current) =>
        current.includes(
          studentId,
        )
          ? current.filter(
              (id) =>
                id !==
                studentId,
            )
          : [
              ...current,
              studentId,
            ],
    );
  };

  const toggleCurrentPage =
    () => {
      if (
        allCurrentPageSelected
      ) {
        const currentPageIds =
          students.map(
            (student) =>
              student.id,
          );

        setSelectedStudentIds(
          (current) =>
            current.filter(
              (id) =>
                !currentPageIds.includes(
                  id,
                ),
            ),
        );

        return;
      }

      setSelectedStudentIds(
        (current) => [
          ...new Set([
            ...current,

            ...students.map(
              (student) =>
                student.id,
            ),
          ]),
        ],
      );
    };

  const handleAssign =
    async () => {
      if (
        selectedStudentIds.length ===
        0
      ) {
        toast.error(
          "Select at least one student",
        );

        return;
      }

      setProcessing(true);

      try {
        const response =
          await adminService
            .assignStudentsToMentor(
              mentorId,
              selectedStudentIds,
              false,
            );

        toast.success(
          response.data.message ||
            `${selectedStudentIds.length} students assigned successfully`,
        );

        setSelectedStudentIds(
          [],
        );

        await loadStudents();
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setProcessing(false);
      }
    };

  const handleRemove =
    async () => {
      if (
        selectedStudentIds.length ===
        0
      ) {
        toast.error(
          "Select at least one student",
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Remove ${selectedStudentIds.length} selected students from this mentor?`,
        );

      if (!confirmed) {
        return;
      }

      setProcessing(true);

      try {
        const response =
          await adminService
            .removeStudentsFromMentor(
              mentorId,
              selectedStudentIds,
            );

        toast.success(
          response.data.message ||
            `${selectedStudentIds.length} students removed successfully`,
        );

        setSelectedStudentIds(
          [],
        );

        await loadStudents();
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setProcessing(false);
      }
    };

  const handleTabChange = (
    tab: AssignmentTab,
  ) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedStudentIds(
      [],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/mentors",
              )
            }
            className="mt-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Assign Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Assign same-domain students to the selected mentor.
            </p>
          </div>
        </div>

        {selectedStudentIds.length >
          0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {
                selectedStudentIds.length
              }{" "}
              selected
            </span>

            {activeTab ===
            "unassigned" ? (
              <button
                type="button"
                disabled={
                  processing
                }
                onClick={() =>
                  void handleAssign()
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus
                  size={17}
                />

                {processing
                  ? "Assigning..."
                  : "Assign Students"}
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  processing
                }
                onClick={() =>
                  void handleRemove()
                }
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserMinus
                  size={17}
                />

                {processing
                  ? "Removing..."
                  : "Remove Students"}
              </button>
            )}
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {mentor ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mentor
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {mentor.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {mentor.employee_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Domain
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {mentor.domain
                  ?.domain_name ||
                  `Domain ${mentor.domain_id}`}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                College
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {mentor.college
                  ?.name ||
                  "All colleges"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mentor Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  mentor.status ===
                  "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {mentor.status}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Loading mentor details...
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleTabChange(
                  "unassigned",
                )
              }
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab ===
                "unassigned"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <UserPlus size={17} />
              Unassigned Students
            </button>

            <button
              type="button"
              onClick={() =>
                handleTabChange(
                  "assigned",
                )
              }
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab ===
                "assigned"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CheckCircle2
                size={17}
              />
              Assigned Students
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );

                  setPage(1);
                }}
                placeholder="Search name, registration, email or mobile"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <input
              value={session}
              onChange={(event) => {
                setSession(
                  event.target.value,
                );

                setPage(1);
              }}
              placeholder="Session"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              value={semester}
              onChange={(event) => {
                setSemester(
                  event.target.value,
                );

                setPage(1);
              }}
              placeholder="Semester"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      allCurrentPageSelected
                    }
                    onChange={
                      toggleCurrentPage
                    }
                    disabled={
                      students.length ===
                      0
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>

                <th className="px-4 py-3">
                  Student
                </th>

                <th className="px-4 py-3">
                  Registration
                </th>

                <th className="px-4 py-3">
                  College
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
              ) : students.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <Users
                        size={35}
                        className="text-slate-300"
                      />

                      <p className="mt-3 font-semibold text-slate-700">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {activeTab ===
                        "unassigned"
                          ? "No unassigned student is available for this mentor."
                          : "No student is currently assigned to this mentor."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map(
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

                    const selected =
                      selectedStudentIds.includes(
                        student.id,
                      );

                    return (
                      <tr
                        key={student.id}
                        className={
                          selected
                            ? "bg-blue-50/60"
                            : "hover:bg-slate-50"
                        }
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleStudent(
                                student.id,
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                              <GraduationCap
                                size={19}
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {student.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {student.email ||
                                  student.mobile ||
                                  "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">
                            {student.registration_number}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.student_id ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-700">
                            {student.college
                              ?.name ||
                              "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.domain
                              ?.domain_name ||
                              "-"}
                          </p>
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
                          <div className="mb-1 flex justify-between text-xs">
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
                            {student.internship_status}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Total {total} students
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <span className="min-w-24 text-center text-sm text-slate-600">
              Page {page} of{" "}
              {Math.max(
                totalPages,
                1,
              )}
            </span>

            <button
              type="button"
              disabled={
                page >=
                  totalPages ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.min(
                      totalPages,
                      current + 1,
                    ),
                )
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}