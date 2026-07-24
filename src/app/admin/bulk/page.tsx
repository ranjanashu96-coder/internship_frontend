"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { toast } from "sonner";

import {
  adminService,
} from "@/lib/services";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import type {
  AdminListParams,
} from "@/lib/services";

import type {
  BulkJob,
  BulkJobType,
  BulkProcessPayload,
  College,
  Domain,
  Mentor,
  PaginatedData,
  Student,
} from "@/types";

interface Sector {
  id: number;
  sector_name: string;
}

interface FormState {
  college_id: string;
  sector_id: string;
  domain_id: string;
  session: string;
  semester: string;
  batch_id: string;
  mentor_id: string;
  search: string;

  start_date: string;
  end_date: string;

  login_time: string;
  logout_time: string;
  learning_hours: string;

  completed_at: string;
  assessed_at: string;
  published_at: string;
  generated_at: string;
  issued_date: string;

  technical_knowledge: string;
  quality_of_work: string;
  initiative: string;
  communication: string;
  professional_conduct: string;

  pass_percentage: string;

  supervisor_remarks: string;
  result_remarks: string;

  daily_activity: string;
  skills: string;
  report_summary: string;

  certificate_prefix: string;
  holidays: string;
}

interface Operation {
  type: BulkJobType;
  title: string;
  description: string;
}

const operations: Operation[] = [
  {
    type: "full_internship_process",
    title: "Full Internship Process",
    description:
      "Run complete internship automation in one click.",
  },
  {
    type: "attendance",
    title: "Generate Attendance",
    description:
      "Generate attendance between start and end dates.",
  },
  {
    type: "complete_learning",
    title: "Complete Learning",
    description:
      "Complete all assigned modules and chapters.",
  },
  {
    type: "assessment",
    title: "Generate Assessment",
    description:
      "Create or update student assessments.",
  },
  {
    type: "publish_results",
    title: "Publish Results",
    description:
      "Publish final results from assessments.",
  },
  {
    type: "complete_internship",
    title: "Complete Internship",
    description:
      "Set internship status and progress to completed.",
  },
  {
    type: "acceptance_letters",
    title: "Acceptance Letters",
    description:
      "Generate student-wise acceptance letter PDFs.",
  },
  {
    type: "attendance_sheets",
    title: "Attendance Sheets",
    description:
      "Generate student-wise attendance sheet PDFs.",
  },
  {
    type: "log_books",
    title: "Generate Log Books",
    description:
      "Generate daily logbook entries and PDFs.",
  },
  {
    type: "internship_reports",
    title: "Internship Reports",
    description:
      "Generate internship completion report PDFs.",
  },
  {
    type: "certificates",
    title: "QR Certificates",
    description:
      "Generate QR-verified certificates.",
  },
  {
    type: "zip_documents",
    title: "Generate ZIP",
    description:
      "Download all generated documents together.",
  },
];

const getDateValue = (
  date: Date,
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateTimeValue = (
  date: Date,
) => {
  const dateValue =
    getDateValue(date);

  const hours =
    String(
      date.getHours(),
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(2, "0");

  return `${dateValue}T${hours}:${minutes}`;
};

const extractItems = <T,>(
  data:
    | PaginatedData<T>
    | T[],
): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  return data.items || [];
};

const getErrorMessage = (
  error: unknown,
) => {
  const apiError =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };

      message?: string;
    };

  return (
    apiError.response
      ?.data
      ?.message ||
    apiError.message ||
    "Something went wrong"
  );
};

const API_ORIGIN =
  (
    process.env
      .NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
  ).replace(
    /\/api\/?$/,
    "",
  );

const getDownloadUrl = (
  url?: string | null,
) => {
  if (!url) {
    return null;
  }

  if (
    url.startsWith(
      "http://",
    ) ||
    url.startsWith(
      "https://",
    )
  ) {
    return url;
  }

  return `${API_ORIGIN}${
    url.startsWith("/")
      ? url
      : `/${url}`
  }`;
};

export default function Page() {
  const now =
    useMemo(
      () => new Date(),
      [],
    );

  const monthStart =
    useMemo(
      () =>
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ),
      [now],
    );

  const [form, setForm] =
    useState<FormState>({
      college_id: "",
      sector_id: "",
      domain_id: "",
      session: "",
      semester: "",
      batch_id: "",
      mentor_id: "",
      search: "",

      start_date:
        getDateValue(
          monthStart,
        ),

      end_date:
        getDateValue(now),

      login_time: "09:00",
      logout_time: "17:00",
      learning_hours: "8",

      completed_at:
        getDateTimeValue(now),

      assessed_at:
        getDateTimeValue(now),

      published_at:
        getDateTimeValue(now),

      generated_at:
        getDateTimeValue(now),

      issued_date:
        getDateValue(now),

      technical_knowledge:
        "5",

      quality_of_work:
        "5",

      initiative: "5",
      communication: "5",

      professional_conduct:
        "5",

      pass_percentage:
        "40",

      supervisor_remarks:
        "Assessment completed through bulk automation.",

      result_remarks:
        "Final result published successfully.",

      daily_activity:
        "Completed assigned learning modules and internship activities.",

      skills:
        "Technical learning, communication and professional skills",

      report_summary:
        "The student completed all internship requirements successfully.",

      certificate_prefix:
        "RKN",

      holidays: "",
    });

  const [colleges, setColleges] =
    useState<College[]>([]);

  const [sectors, setSectors] =
    useState<Sector[]>([]);

  const [domains, setDomains] =
    useState<Domain[]>([]);

  const [mentors, setMentors] =
    useState<Mentor[]>([]);

  const [students, setStudents] =
    useState<Student[]>([]);

  const [
    selectedStudents,
    setSelectedStudents,
  ] =
    useState<number[]>([]);

  const [
    loadingStudents,
    setLoadingStudents,
  ] = useState(false);

  const [
    runningType,
    setRunningType,
  ] =
    useState<
      BulkJobType | null
    >(null);

  const [job, setJob] =
    useState<BulkJob | null>(
      null,
    );

  const timerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const filteredDomains =
    useMemo(() => {
      if (
        !form.sector_id
      ) {
        return domains;
      }

      return domains.filter(
        (domain) =>
          String(
            domain.sector_id,
          ) ===
          form.sector_id,
      );
    }, [
      domains,
      form.sector_id,
    ]);

  const filteredMentors =
    useMemo(() => {
      return mentors.filter(
        (mentor) => {
          const collegeMatches =
            !form.college_id ||
            String(
              mentor.college_id ||
                "",
            ) ===
              form.college_id;

          const domainMatches =
            !form.domain_id ||
            String(
              mentor.domain_id ||
                "",
            ) ===
              form.domain_id;

          return (
            collegeMatches &&
            domainMatches
          );
        },
      );
    }, [
      mentors,
      form.college_id,
      form.domain_id,
    ]);

  const setValue = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  };

  useEffect(() => {
    const loadReferences =
      async () => {
        try {
          const [
            collegeResponse,
            sectorResponse,
            domainResponse,
            mentorResponse,
          ] =
            await Promise.all([
              adminService.colleges({
                page: 1,
                limit: 100,
              }),

              adminService.sectors({
                page: 1,
                limit: 100,
              }),

              adminService.domains({
                page: 1,
                limit: 100,
              }),

              adminService.mentors({
                page: 1,
                limit: 100,
              }),
            ]);

          setColleges(
            extractItems(
              collegeResponse
                .data.data,
            ),
          );

          setSectors(
            extractItems(
              sectorResponse
                .data.data as
                | PaginatedData<Sector>
                | Sector[],
            ),
          );

          setDomains(
            extractItems(
              domainResponse
                .data.data,
            ),
          );

          setMentors(
            extractItems(
              mentorResponse
                .data.data,
            ),
          );
        } catch (error) {
          toast.error(
            getErrorMessage(
              error,
            ),
          );
        }
      };

    void loadReferences();

    return () => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current,
        );
      }
    };
  }, []);

  const loadStudents =
    async () => {
      setLoadingStudents(
        true,
      );

      try {
        const params:
          AdminListParams = {
          page: 1,
          limit: 100,

          search:
            form.search ||
            undefined,

          college_id:
            form.college_id ||
            undefined,

          domain_id:
            form.domain_id ||
            undefined,

          session:
            form.session ||
            undefined,

          semester:
            form.semester ||
            undefined,

          batch_id:
            form.batch_id ||
            undefined,

          mentor_id:
            form.mentor_id ||
            undefined,
        };

        const response =
          await adminService.students(
            params,
          );

        setStudents(
          response.data.data
            .items,
        );

        setSelectedStudents(
          [],
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setLoadingStudents(
          false,
        );
      }
    };

  const pollJob =
    async (
      jobUuid: string,
    ) => {
      try {
        const response =
          await adminService.bulkStatus(
            jobUuid,
          );

        const currentJob =
          response.data.data;

        setJob({
          ...currentJob,

          progress:
            Number(
              currentJob.progress ||
                0,
            ),

          processed:
            Number(
              currentJob.processed ||
                0,
            ),

          total:
            Number(
              currentJob.total ||
                0,
            ),
        });

        if (
          currentJob.status ===
          "completed"
        ) {
          setRunningType(
            null,
          );

          toast.success(
            "Bulk operation completed",
          );

          return;
        }

        if (
          currentJob.status ===
          "failed"
        ) {
          setRunningType(
            null,
          );

          toast.error(
            currentJob.error_message ||
              "Bulk operation failed",
          );

          return;
        }

        timerRef.current =
          setTimeout(
            () => {
              void pollJob(
                jobUuid,
              );
            },
            2000,
          );
      } catch (error) {
        setRunningType(
          null,
        );

        toast.error(
          getErrorMessage(
            error,
          ),
        );
      }
    };

  const hasTarget =
    () => {
      return (
        selectedStudents
          .length > 0 ||
        Boolean(
          form.college_id,
        ) ||
        Boolean(
          form.sector_id,
        ) ||
        Boolean(
          form.domain_id,
        ) ||
        Boolean(
          form.session,
        ) ||
        Boolean(
          form.semester,
        ) ||
        Boolean(
          form.batch_id,
        ) ||
        Boolean(
          form.mentor_id,
        )
      );
    };

  const buildPayload =
    (): BulkProcessPayload => {
      const payload:
        BulkProcessPayload =
        {
          start_date:
            form.start_date,

          end_date:
            form.end_date,

          login_time:
            form.login_time
              .length === 5
              ? `${form.login_time}:00`
              : form.login_time,

          logout_time:
            form.logout_time
              .length === 5
              ? `${form.logout_time}:00`
              : form.logout_time,

          learning_hours:
            Number(
              form.learning_hours,
            ),

          status:
            "present",

          excluded_days:
            [0],

          holidays:
            form.holidays
              .split(
                /[\n,]+/,
              )
              .map(
                (value) =>
                  value.trim(),
              )
              .filter(
                Boolean,
              ),

          completed_at:
            form.completed_at,

          assessed_at:
            form.assessed_at,

          published_at:
            form.published_at,

          generated_at:
            form.generated_at,

          issued_date:
            form.issued_date,

          assessment_type:
            "final",

          technical_knowledge:
            Number(
              form.technical_knowledge,
            ),

          quality_of_work:
            Number(
              form.quality_of_work,
            ),

          initiative:
            Number(
              form.initiative,
            ),

          communication:
            Number(
              form.communication,
            ),

          professional_conduct:
            Number(
              form.professional_conduct,
            ),

          pass_percentage:
            Number(
              form.pass_percentage,
            ),

          supervisor_remarks:
            form.supervisor_remarks,

          result_remarks:
            form.result_remarks,

          daily_activity:
            form.daily_activity,

          skills:
            form.skills,

          report_summary:
            form.report_summary,

          certificate_prefix:
            form.certificate_prefix,

          stop_on_error:
            true,
        };

      if (
        form.college_id
      ) {
        payload.college_id =
          Number(
            form.college_id,
          );
      }

      if (
        form.sector_id
      ) {
        payload.sector_id =
          Number(
            form.sector_id,
          );
      }

      if (
        form.domain_id
      ) {
        payload.domain_id =
          Number(
            form.domain_id,
          );
      }

      if (form.session) {
        payload.session =
          form.session;
      }

      if (
        form.semester
      ) {
        payload.semester =
          form.semester;
      }

      if (
        form.batch_id
      ) {
        payload.batch_id =
          Number(
            form.batch_id,
          );
      }

      if (
        form.mentor_id
      ) {
        payload.mentor_id =
          Number(
            form.mentor_id,
          );
      }

      if (
        selectedStudents
          .length > 0
      ) {
        payload.student_ids =
          selectedStudents;
      }

      return payload;
    };

  const runOperation =
    async (
      type: BulkJobType,
    ) => {
      if (!hasTarget()) {
        toast.error(
          "Select students or apply at least one filter",
        );

        return;
      }

      if (
        form.start_date >
        form.end_date
      ) {
        toast.error(
          "Start date cannot be after end date",
        );

        return;
      }

      setRunningType(
        type,
      );

      setJob(null);

      try {
        const response =
          await adminService.processBulk(
            type,
            buildPayload(),
          );

        const startedJob =
          response.data.data;

        setJob({
          job_uuid:
            startedJob.job_uuid,

          type:
            startedJob.type,

          status:
            startedJob.status,

          progress: 0,
          processed: 0,
          total: 0,
        });

        toast.success(
          response.data.message,
        );

        void pollJob(
          startedJob.job_uuid,
        );
      } catch (error) {
        setRunningType(
          null,
        );

        toast.error(
          getErrorMessage(
            error,
          ),
        );
      }
    };

  const toggleStudent =
    (
      studentId: number,
    ) => {
      setSelectedStudents(
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

  const selectAll =
    () => {
      if (
        selectedStudents
          .length ===
        students.length
      ) {
        setSelectedStudents(
          [],
        );

        return;
      }

      setSelectedStudents(
        students.map(
          (student) =>
            student.id,
        ),
      );
    };

  const zipUrl =
    getDownloadUrl(
      typeof job?.result
        ?.zip_url ===
        "string"
        ? job.result
            .zip_url
        : null,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Automation"
        description="Run bulk internship operations with filters, selected students and tracked job progress."
      />

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Student Filters
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="label">
              College
            </label>

            <select
              className="input"
              value={
                form.college_id
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "college_id",
                  event.target
                    .value,
                )
              }
            >
              <option value="">
                All Colleges
              </option>

              {colleges.map(
                (college) => (
                  <option
                    key={
                      college.id
                    }
                    value={
                      college.id
                    }
                  >
                    {
                      college.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="label">
              Sector
            </label>

            <select
              className="input"
              value={
                form.sector_id
              }
              onChange={(
                event,
              ) => {
                setValue(
                  "sector_id",
                  event.target
                    .value,
                );

                setValue(
                  "domain_id",
                  "",
                );
              }}
            >
              <option value="">
                All Sectors
              </option>

              {sectors.map(
                (sector) => (
                  <option
                    key={
                      sector.id
                    }
                    value={
                      sector.id
                    }
                  >
                    {
                      sector.sector_name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="label">
              Domain
            </label>

            <select
              className="input"
              value={
                form.domain_id
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "domain_id",
                  event.target
                    .value,
                )
              }
            >
              <option value="">
                All Domains
              </option>

              {filteredDomains.map(
                (domain) => (
                  <option
                    key={
                      domain.id
                    }
                    value={
                      domain.id
                    }
                  >
                    {
                      domain.domain_name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="label">
              Mentor
            </label>

            <select
              className="input"
              value={
                form.mentor_id
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "mentor_id",
                  event.target
                    .value,
                )
              }
            >
              <option value="">
                All Mentors
              </option>

              {filteredMentors.map(
                (mentor) => (
                  <option
                    key={
                      mentor.id
                    }
                    value={
                      mentor.id
                    }
                  >
                    {
                      mentor.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="label">
              Session
            </label>

            <Input
              value={
                form.session
              }
              placeholder="2025-28"
              onChange={(
                event,
              ) =>
                setValue(
                  "session",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Semester
            </label>

            <Input
              value={
                form.semester
              }
              placeholder="3"
              onChange={(
                event,
              ) =>
                setValue(
                  "semester",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Batch ID
            </label>

            <Input
              type="number"
              value={
                form.batch_id
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "batch_id",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Search
            </label>

            <Input
              value={
                form.search
              }
              placeholder="Name or registration"
              onChange={(
                event,
              ) =>
                setValue(
                  "search",
                  event.target
                    .value,
                )
              }
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Button
            onClick={
              loadStudents
            }
            disabled={
              loadingStudents
            }
          >
            {loadingStudents
              ? "Loading..."
              : "Find Students"}
          </Button>

          <span className="text-sm text-slate-500">
            Selected:{" "}
            {
              selectedStudents.length
            }
          </span>
        </div>
      </section>

      {students.length >
        0 && (
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex justify-between border-b p-4">
            <h2 className="font-semibold">
              Matching Students
            </h2>

            <button
              type="button"
              className="text-sm font-medium text-blue-600"
              onClick={
                selectAll
              }
            >
              Select All
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="p-3 text-left">
                    Select
                  </th>

                  <th className="p-3 text-left">
                    Registration
                  </th>

                  <th className="p-3 text-left">
                    Student
                  </th>

                  <th className="p-3 text-left">
                    Session
                  </th>

                  <th className="p-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map(
                  (student) => (
                    <tr
                      key={
                        student.id
                      }
                      className="border-t"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(
                            student.id,
                          )}
                          onChange={() =>
                            toggleStudent(
                              student.id,
                            )
                          }
                        />
                      </td>

                      <td className="p-3">
                        {
                          student.registration_number
                        }
                      </td>

                      <td className="p-3">
                        {
                          student.name
                        }
                      </td>

                      <td className="p-3">
                        {
                          student.session
                        }
                      </td>

                      <td className="p-3 capitalize">
                        {
                          student.internship_status
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Attendance and Dates
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="label">
              Start Date
            </label>

            <Input
              type="date"
              value={
                form.start_date
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "start_date",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              End Date
            </label>

            <Input
              type="date"
              value={
                form.end_date
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "end_date",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Login Time
            </label>

            <Input
              type="time"
              value={
                form.login_time
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "login_time",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Logout Time
            </label>

            <Input
              type="time"
              value={
                form.logout_time
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "logout_time",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Learning Hours
            </label>

            <Input
              type="number"
              value={
                form.learning_hours
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "learning_hours",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Issue Date
            </label>

            <Input
              type="date"
              value={
                form.issued_date
              }
              onChange={(
                event,
              ) =>
                setValue(
                  "issued_date",
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">
              Holidays
            </label>

            <Input
              value={
                form.holidays
              }
              placeholder="2026-07-15, 2026-07-20"
              onChange={(
                event,
              ) =>
                setValue(
                  "holidays",
                  event.target
                    .value,
                )
              }
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          Bulk Operations
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operations.map(
            (operation) => (
              <div
                key={
                  operation.type
                }
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold">
                  {
                    operation.title
                  }
                </h3>

                <p className="mt-2 min-h-10 text-sm text-slate-500">
                  {
                    operation.description
                  }
                </p>

                <Button
                  className="mt-4 w-full"
                  disabled={
                    runningType !==
                    null
                  }
                  onClick={() =>
                    runOperation(
                      operation.type,
                    )
                  }
                >
                  {runningType ===
                  operation.type
                    ? "Processing..."
                    : operation.title}
                </Button>
              </div>
            ),
          )}
        </div>
      </section>

      {job && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Current Job
              </h2>

              <p className="text-sm text-slate-500">
                {
                  job.job_uuid
                }
              </p>
            </div>

            <span className="capitalize">
              {
                job.status
              }
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Progress
              </span>

              <span>
                {Number(
                  job.progress ||
                    0,
                ).toFixed(0)}
                %
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Number(
                      job.progress ||
                        0,
                    ),
                  )}%`,
                }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Processed:{" "}
              {
                job.processed ||
                0
              }{" "}
              /{" "}
              {
                job.total ||
                0
              }
            </p>
          </div>

          {job.error_message && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {
                job.error_message
              }
            </div>
          )}

          {zipUrl && (
            <a
              href={zipUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Download ZIP
            </a>
          )}

          {job.result && (
            <details className="mt-4 rounded-lg bg-slate-50 p-4">
              <summary className="cursor-pointer font-medium">
                View Job Result
              </summary>

              <pre className="mt-3 overflow-auto text-xs">
                {JSON.stringify(
                  job.result,
                  null,
                  2,
                )}
              </pre>
            </details>
          )}
        </section>
      )}
    </div>
  );
}