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
  BulkPreviewData,
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
  group:
    | "automation"
    | "academic"
    | "documents";
}

const operations: Operation[] = [
  {
    type:
      "full_internship_process",
    title:
      "Full Internship Process",
    description:
      "Run the complete internship lifecycle automatically in the correct sequence.",
    group:
      "automation",
  },
  {
    type: "attendance",
    title:
      "Generate Attendance",
    description:
      "Generate student attendance between the selected start and end dates.",
    group:
      "academic",
  },
  {
    type:
      "complete_learning",
    title:
      "Complete Learning",
    description:
      "Mark all applicable learning chapters as completed.",
    group:
      "academic",
  },
  {
    type: "assessment",
    title:
      "Generate Assessment",
    description:
      "Create or update final assessments for selected students.",
    group:
      "academic",
  },
  {
    type:
      "publish_results",
    title:
      "Publish Results",
    description:
      "Calculate grades and publish final student results.",
    group:
      "academic",
  },
  {
    type:
      "complete_internship",
    title:
      "Complete Internship",
    description:
      "Mark selected internships as completed with 100% progress.",
    group:
      "academic",
  },
  {
    type:
      "acceptance_letters",
    title:
      "Offer Letters",
    description:
      "Generate student-wise internship offer letter PDFs.",
    group:
      "documents",
  },
  {
    type:
      "attendance_sheets",
    title:
      "Attendance Sheets",
    description:
      "Generate student-wise attendance sheet PDFs.",
    group:
      "documents",
  },
  {
    type:
      "log_books",
    title:
      "Generate Log Books",
    description:
      "Generate daily logbook entries and student logbook PDFs.",
    group:
      "documents",
  },
  {
    type:
      "internship_reports",
    title:
      "Internship Reports",
    description:
      "Generate internship completion report PDFs.",
    group:
      "documents",
  },
  {
    type:
      "certificates",
    title:
      "QR Certificates",
    description:
      "Generate eligibility-based QR verified internship certificates.",
    group:
      "documents",
  },
  {
    type:
      "zip_documents",
    title:
      "Generate ZIP",
    description:
      "Package all available student documents into a ZIP archive.",
    group:
      "documents",
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
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
};

const getDateTimeValue = (
  date: Date,
) => {
  const dateValue =
    getDateValue(
      date,
    );

  const hours =
    String(
      date.getHours(),
    ).padStart(
      2,
      "0",
    );

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(
      2,
      "0",
    );

  return `${dateValue}T${hours}:${minutes}`;
};

const extractItems = <T,>(
  data:
    | PaginatedData<T>
    | T[],
): T[] => {
  if (
    Array.isArray(
      data,
    )
  ) {
    return data;
  }

  return (
    data.items ||
    []
  );
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

const normalizeJob = (
  value: BulkJob,
): BulkJob => {
  return {
    ...value,

    progress:
      Number(
        value.progress ||
          0,
      ),

    processed:
      Number(
        value.processed ||
          0,
      ),

    total:
      Number(
        value.total ||
          0,
      ),

    success_count:
      Number(
        value.success_count ||
          0,
      ),

    failed_count:
      Number(
        value.failed_count ||
          0,
      ),
  };
};

const getOperationTitle = (
  type: BulkJobType,
) => {
  return (
    operations.find(
      (item) =>
        item.type ===
        type,
    )?.title ||
    type
  );
};

const formatDateTime = (
  value?: string | null,
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  );
};

const getStatusClass = (
  status: BulkJob["status"],
) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";

    case "running":
      return "bg-blue-50 text-blue-700";

    case "queued":
      return "bg-amber-50 text-amber-700";

    case "failed":
      return "bg-red-50 text-red-700";

    case "cancelled":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function Page() {
  const now =
    useMemo(
      () =>
        new Date(),
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
      [
        now,
      ],
    );

  const [
    form,
    setForm,
  ] =
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
        getDateValue(
          now,
        ),

      login_time:
        "09:00",

      logout_time:
        "17:00",

      learning_hours:
        "8",

      completed_at:
        getDateTimeValue(
          now,
        ),

      assessed_at:
        getDateTimeValue(
          now,
        ),

      published_at:
        getDateTimeValue(
          now,
        ),

      generated_at:
        getDateTimeValue(
          now,
        ),

      issued_date:
        getDateValue(
          now,
        ),

      technical_knowledge:
        "5",

      quality_of_work:
        "5",

      initiative:
        "5",

      communication:
        "5",

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

      holidays:
        "",
    });

  const [
    colleges,
    setColleges,
  ] =
    useState<
      College[]
    >([]);

  const [
    sectors,
    setSectors,
  ] =
    useState<
      Sector[]
    >([]);

  const [
    domains,
    setDomains,
  ] =
    useState<
      Domain[]
    >([]);

  const [
    mentors,
    setMentors,
  ] =
    useState<
      Mentor[]
    >([]);

  const [
    students,
    setStudents,
  ] =
    useState<
      Student[]
    >([]);

  const [
    selectedStudents,
    setSelectedStudents,
  ] =
    useState<
      number[]
    >([]);

  const [
    loadingStudents,
    setLoadingStudents,
  ] =
    useState(
      false,
    );

  const [
    runningType,
    setRunningType,
  ] =
    useState<
      BulkJobType | null
    >(
      null,
    );

  const [
    job,
    setJob,
  ] =
    useState<
      BulkJob | null
    >(
      null,
    );

  const [
    preview,
    setPreview,
  ] =
    useState<
      BulkPreviewData | null
    >(
      null,
    );

  const [
    previewType,
    setPreviewType,
  ] =
    useState<
      BulkJobType | null
    >(
      null,
    );

  const [
    loadingPreview,
    setLoadingPreview,
  ] =
    useState(
      false,
    );

  const [
    jobs,
    setJobs,
  ] =
    useState<
      BulkJob[]
    >([]);

  const [
    loadingJobs,
    setLoadingJobs,
  ] =
    useState(
      false,
    );

  const [
    cancellingJobUuid,
    setCancellingJobUuid,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    retryingJobUuid,
    setRetryingJobUuid,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const timerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(
      null,
    );

  const filteredDomains =
    useMemo(
      () => {
        if (
          !form.sector_id
        ) {
          return domains;
        }

        return domains.filter(
          (
            domain,
          ) =>
            String(
              domain.sector_id,
            ) ===
            form.sector_id,
        );
      },
      [
        domains,
        form.sector_id,
      ],
    );

  const filteredMentors =
    useMemo(
      () => {
        return mentors.filter(
          (
            mentor,
          ) => {
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
      },
      [
        mentors,
        form.college_id,
        form.domain_id,
      ],
    );

  const clearPreview =
    () => {
      setPreview(
        null,
      );

      setPreviewType(
        null,
      );
    };

  const setValue = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    );

    clearPreview();
  };

  const loadReferences =
    async () => {
      try {
        const [
          collegeResponse,
          sectorResponse,
          domainResponse,
          mentorResponse,
        ] =
          await Promise.all(
            [
              adminService.colleges(
                {
                  page: 1,
                  limit:
                    100,
                },
              ),

              adminService.sectors(
                {
                  page: 1,
                  limit:
                    100,
                },
              ),

              adminService.domains(
                {
                  page: 1,
                  limit:
                    100,
                },
              ),

              adminService.mentors(
                {
                  page: 1,
                  limit:
                    100,
                },
              ),
            ],
          );

        setColleges(
          extractItems(
            collegeResponse
              .data.data,
          ),
        );

        setSectors(
          extractItems(
            sectorResponse
              .data
              .data as
              | PaginatedData<Sector>
              | Sector[],
          ),
        );

        setDomains(
          (
            extractItems(
              domainResponse
                .data
                .data as
                | PaginatedData<Domain>
                | Domain[],
            ) as Domain[]
          ).map(
            (
              domain,
            ) => ({
              ...domain,

              fee:
                typeof domain.fee ===
                "number"
                  ? domain.fee
                  : Number(
                      domain.fee ??
                        0,
                    ),
            }),
          ),
        );

        setMentors(
          extractItems(
            mentorResponse
              .data.data,
          ),
        );
      } catch (
        error
      ) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      }
    };

const loadStudents =
  async () => {
    setLoadingStudents(true);

    clearPreview();

    try {
      const params:
        AdminListParams & {
          sector_id?:
            | number
            | string;
        } = {
          page: 1,
          limit: 100,

          search:
            form.search ||
            undefined,

          college_id:
            form.college_id ||
            undefined,

          sector_id:
            form.sector_id ||
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

          // Sirf active internship
          status: "active",

          // Sirf paid students
          payment_status: "paid",
        };

      const response =
        await adminService.students(
          params,
        );

      /*
       * Frontend safety filter:
       * Backend galti se extra student bheje
       * tab bhi list me nahi dikhega.
       */
      const eligibleStudents =
        (
          response.data.data.items ||
          []
        ).filter(
          (student) =>
            student.payment_status ===
              "paid" &&
            student.internship_status ===
              "active",
        );

      setStudents(
        eligibleStudents,
      );

      setSelectedStudents(
        [],
      );

      if (
        eligibleStudents.length === 0
      ) {
        toast.info(
          "No paid and active students found",
        );
      }
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

  const loadJobs =
    async () => {
      setLoadingJobs(
        true,
      );

      try {
        const response =
          await adminService.bulkJobs(
            {
              page: 1,
              limit:
                20,
            },
          );

        setJobs(
          (
            response
              .data
              .data
              .items ||
            []
          ).map(
            normalizeJob,
          ),
        );
      } catch (
        error
      ) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setLoadingJobs(
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
          normalizeJob(
            response
              .data
              .data,
          );

        setJob(
          currentJob,
        );

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

          void loadJobs();

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

          void loadJobs();

          return;
        }

        if (
          currentJob.status ===
          "cancelled"
        ) {
          setRunningType(
            null,
          );

          toast.info(
            "Bulk operation cancelled",
          );

          void loadJobs();

          return;
        }

        if (
          ![
            "queued",
            "running",
          ].includes(
            currentJob.status,
          )
        ) {
          return;
        }

        if (
          timerRef.current
        ) {
          clearTimeout(
            timerRef.current,
          );
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
      } catch (
        error
      ) {
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

  useEffect(
    () => {
      void loadReferences();
      void loadJobs();

      return () => {
        if (
          timerRef.current
        ) {
          clearTimeout(
            timerRef.current,
          );
        }
      };
    },
    [],
  );

  const hasTarget =
    () => {
      return (
        selectedStudents
          .length >
          0 ||
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
        BulkProcessPayload = {
          start_date:
            form.start_date,

          end_date:
            form.end_date,

          login_time:
            form.login_time
              .length ===
            5
              ? `${form.login_time}:00`
              : form.login_time,

          logout_time:
            form.logout_time
              .length ===
            5
              ? `${form.logout_time}:00`
              : form.logout_time,

          learning_hours:
            Number(
              form.learning_hours,
            ),

          status:
            "present",

          excluded_days:
            [
              0,
            ],

          holidays:
            form.holidays
              .split(
                /[\n,]+/,
              )
              .map(
                (
                  value,
                ) =>
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

      if (
        form.session
      ) {
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
          .length >
        0
      ) {
        payload.student_ids =
          selectedStudents;
      }

      return payload;
    };

  const validateTarget =
    () => {
      if (
        !hasTarget()
      ) {
        toast.error(
          "Select students or apply at least one filter",
        );

        return false;
      }

      /*
       * Backend bulk query currently
       * search text support nahi karta.
       *
       * Isliye search use karne ke
       * baad manual student selection
       * mandatory rakha gaya hai.
       */
      if (
        form.search &&
        selectedStudents
          .length ===
          0
      ) {
        toast.error(
          "Search is only for finding students. Select the searched students before running bulk automation.",
        );

        return false;
      }

      if (
        form.start_date &&
        form.end_date &&
        form.start_date >
          form.end_date
      ) {
        toast.error(
          "Start date cannot be after end date",
        );

        return false;
      }

      return true;
    };

  const previewOperation =
    async (
      type: BulkJobType,
    ) => {
      if (
        !validateTarget()
      ) {
        return;
      }

      setLoadingPreview(
        true,
      );

      setPreview(
        null,
      );

      setPreviewType(
        type,
      );

      try {
        const response =
          await adminService.bulkPreview(
            type,
            buildPayload(),
          );

        setPreview(
          response
            .data
            .data,
        );
      } catch (
        error
      ) {
        setPreviewType(
          null,
        );

        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setLoadingPreview(
          false,
        );
      }
    };

  const confirmOperation =
    async () => {
      if (
        !previewType ||
        !preview
      ) {
        return;
      }

      const type =
        previewType;

      setRunningType(
        type,
      );

      try {
        const response =
          await adminService.processBulk(
            type,
            buildPayload(),
          );

        const startedJob =
          response
            .data
            .data;

        setPreview(
          null,
        );

        setPreviewType(
          null,
        );

        setJob({
          job_uuid:
            startedJob.job_uuid,

          type:
            startedJob.type,

          status:
            startedJob.status,

          current_step:
            "queued",

          progress:
            0,

          processed:
            0,

          total:
            0,

          success_count:
            0,

          failed_count:
            0,
        });

        toast.success(
          response
            .data
            .message,
        );

        void loadJobs();

        void pollJob(
          startedJob.job_uuid,
        );
      } catch (
        error
      ) {
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

  const cancelJob =
    async (
      jobUuid: string,
    ) => {
      setCancellingJobUuid(
        jobUuid,
      );

      try {
        const response =
          await adminService.cancelBulk(
            jobUuid,
          );

        const updated =
          normalizeJob(
            response
              .data
              .data,
          );

        if (
          job?.job_uuid ===
          jobUuid
        ) {
          setJob(
            updated,
          );

          if (
            updated.status ===
            "cancelled"
          ) {
            setRunningType(
              null,
            );
          }
        }

        toast.success(
          response
            .data
            .message,
        );

        void loadJobs();
      } catch (
        error
      ) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setCancellingJobUuid(
          null,
        );
      }
    };

  const retryJob =
    async (
      jobUuid: string,
    ) => {
      setRetryingJobUuid(
        jobUuid,
      );

      try {
        const response =
          await adminService.retryBulk(
            jobUuid,
          );

        const started =
          response
            .data
            .data;

        setJob({
          job_uuid:
            started.job_uuid,

          type:
            started.type,

          status:
            started.status,

          current_step:
            "queued",

          progress:
            0,

          processed:
            0,

          total:
            0,

          success_count:
            0,

          failed_count:
            0,
        });

        setRunningType(
          started.type,
        );

        toast.success(
          response
            .data
            .message,
        );

        void loadJobs();

        void pollJob(
          started.job_uuid,
        );
      } catch (
        error
      ) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setRetryingJobUuid(
          null,
        );
      }
    };

  const viewJob =
    (
      historyJob: BulkJob,
    ) => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current,
        );
      }

      const normalized =
        normalizeJob(
          historyJob,
        );

      setJob(
        normalized,
      );

      if (
        [
          "queued",
          "running",
        ].includes(
          normalized.status,
        )
      ) {
        setRunningType(
          normalized.type,
        );

        void pollJob(
          normalized.job_uuid,
        );
      } else {
        setRunningType(
          null,
        );
      }

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    };

  const toggleStudent =
    (
      studentId: number,
    ) => {
      clearPreview();

      setSelectedStudents(
        (
          current,
        ) =>
          current.includes(
            studentId,
          )
            ? current.filter(
                (
                  id,
                ) =>
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
      clearPreview();

      if (
        students.length >
          0 &&
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
          (
            student,
          ) =>
            student.id,
        ),
      );
    };

  const zipUrl =
    getDownloadUrl(
      typeof job
        ?.result
        ?.zip_url ===
      "string"
        ? job.result
            .zip_url
        : null,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Automation Center"
        description="Preview, run and monitor bulk internship operations across selected students or filtered groups."
      />

      {/* Current Job */}

      {job && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Job
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                {getOperationTitle(
                  job.type,
                )}
              </h2>

              <p className="mt-1 break-all text-xs text-slate-500">
                {
                  job.job_uuid
                }
              </p>

              {job.current_step && (
                <p className="mt-3 text-sm font-semibold text-blue-600">
                  {
                    job.current_step
                  }
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                  job.status,
                )}`}
              >
                {
                  job.status
                }
              </span>

              {[
                "queued",
                "running",
              ].includes(
                job.status,
              ) && (
                <Button
                  type="button"
                  className="border bg-white text-slate-700 hover:bg-slate-50"
                  disabled={
                    cancellingJobUuid ===
                    job.job_uuid
                  }
                  onClick={() =>
                    void cancelJob(
                      job.job_uuid,
                    )
                  }
                >
                  {cancellingJobUuid ===
                  job.job_uuid
                    ? "Cancelling..."
                    : "Cancel Job"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Overall
                Progress
              </span>

              <span className="font-semibold">
                {Number(
                  job.progress ||
                    0,
                ).toFixed(
                  0,
                )}
                %
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
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
              {Number(
                job.processed ||
                  0,
              )}{" "}
              /{" "}
              {Number(
                job.total ||
                  0,
              )}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-600">
                Successful
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {Number(
                  job.success_count ||
                    0,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs font-medium text-red-600">
                Failed
              </p>

              <p className="mt-1 text-2xl font-bold text-red-700">
                {Number(
                  job.failed_count ||
                    0,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Started
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDateTime(
                  job.started_at,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Finished
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDateTime(
                  job.finished_at,
                )}
              </p>
            </div>
          </div>

          {job.error_message && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {
                job.error_message
              }
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {zipUrl && (
              <a
                href={
                  zipUrl
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Download
                ZIP
              </a>
            )}

            {[
              "failed",
              "cancelled",
            ].includes(
              job.status,
            ) && (
              <Button
                type="button"
                disabled={
                  retryingJobUuid ===
                  job.job_uuid
                }
                onClick={() =>
                  void retryJob(
                    job.job_uuid,
                  )
                }
              >
                {retryingJobUuid ===
                job.job_uuid
                  ? "Retrying..."
                  : "Retry Job"}
              </Button>
            )}
          </div>

          {job.result && (
            <details className="mt-5 rounded-xl bg-slate-50 p-4">
              <summary className="cursor-pointer font-medium">
                View Job
                Result
              </summary>

              <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs">
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

      {/* Filters */}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">
            Student
            Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Leave manual
            student selection
            empty to run for
            every student
            matching these
            filters.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              ) => {
                setValue(
                  "college_id",
                  event.target
                    .value,
                );

                setValue(
                  "mentor_id",
                  "",
                );
              }}
            >
              <option value="">
                All
                Colleges
              </option>

              {colleges.map(
                (
                  college,
                ) => (
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

                setValue(
                  "mentor_id",
                  "",
                );
              }}
            >
              <option value="">
                All
                Sectors
              </option>

              {sectors.map(
                (
                  sector,
                ) => (
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
              ) => {
                setValue(
                  "domain_id",
                  event.target
                    .value,
                );

                setValue(
                  "mentor_id",
                  "",
                );
              }}
            >
              <option value="">
                All
                Domains
              </option>

              {filteredDomains.map(
                (
                  domain,
                ) => (
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
                All
                Mentors
              </option>

              {filteredMentors.map(
                (
                  mentor,
                ) => (
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
              placeholder="2024-27"
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
              placeholder="Batch ID"
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

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            onClick={() =>
              void loadStudents()
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
            Loaded:{" "}
            {
              students.length
            }
          </span>

          <span className="text-sm font-medium text-blue-600">
            Selected:{" "}
            {
              selectedStudents.length
            }
          </span>
        </div>

        {form.search &&
          selectedStudents
            .length ===
            0 && (
            <p className="mt-3 text-xs text-amber-700">
              Search is
              only used for
              finding students.
              Select the
              searched students
              before starting
              automation.
            </p>
          )}
      </section>

      {/* Students */}

      {students.length >
        0 && (
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="font-semibold">
                Matching
                Students
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing up to
                100 students.
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              onClick={
                selectAll
              }
            >
              {selectedStudents
                .length ===
              students.length
                ? "Clear All"
                : "Select All"}
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
                    Semester
                  </th>

                  <th className="p-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map(
                  (
                    student,
                  ) => (
                    <tr
                      key={
                        student.id
                      }
                      className="border-t hover:bg-slate-50"
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

                      <td className="p-3 font-medium">
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

                      <td className="p-3">
                        {
                          student.semester
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

      {/* Dates */}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">
            Internship
            Dates &
            Attendance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These values are
            used by attendance,
            documents and full
            internship
            automation.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              Learning
              Hours
            </label>

            <Input
              type="number"
              min="0"
              step="0.5"
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

      {/* Operations */}

      <section>
        <div>
          <h2 className="text-lg font-semibold">
            Bulk
            Operations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Every operation
            will show a preview
            before it is
            queued.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operations.map(
            (
              operation,
            ) => {
              const isFull =
                operation.type ===
                "full_internship_process";

              const checking =
                loadingPreview &&
                previewType ===
                  operation.type;

              return (
                <div
                  key={
                    operation.type
                  }
                  className={`rounded-2xl border p-5 shadow-sm ${
                    isFull
                      ? "border-blue-200 bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {
                          operation.group
                        }
                      </p>

                      <h3 className="mt-1 font-semibold">
                        {
                          operation.title
                        }
                      </h3>
                    </div>

                    {isFull && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="mt-2 min-h-12 text-sm text-slate-500">
                    {
                      operation.description
                    }
                  </p>

                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={
                      runningType !==
                        null ||
                      loadingPreview
                    }
                    onClick={() =>
                      void previewOperation(
                        operation.type,
                      )
                    }
                  >
                    {checking
                      ? "Checking..."
                      : "Preview & Run"}
                  </Button>
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* Preview */}

      {preview &&
        previewType && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Operation
                  Preview
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {getOperationTitle(
                    previewType,
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Verify the
                  target before
                  starting the
                  job.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="border bg-white text-slate-700 hover:bg-slate-50"
                  onClick={
                    clearPreview
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={
                    runningType !==
                    null
                  }
                  onClick={() =>
                    void confirmOperation()
                  }
                >
                  Confirm &
                  Run
                </Button>
              </div>
            </div>

            {previewType ===
              "full_internship_process" && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Full Internship
                Process will
                run offer
                letters,
                attendance,
                learning,
                assessment,
                result,
                documents,
                internship
                completion,
                certificates
                and ZIP
                generation in
                sequence.
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">
                  Matched
                  Students
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {
                    preview.matched_students
                  }
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">
                  Working
                  Days
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {preview.working_days ??
                    "-"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">
                  Estimated
                  Records
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {
                    preview.estimated_records
                  }
                </p>
              </div>
            </div>

            {preview.sample
              .length >
              0 && (
              <div className="mt-5 overflow-hidden rounded-xl border bg-white">
                <div className="border-b px-4 py-3">
                  <h3 className="font-semibold">
                    Sample
                    Students
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    First 10
                    matched
                    students.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left">
                          Registration
                        </th>

                        <th className="p-3 text-left">
                          Name
                        </th>

                        <th className="p-3 text-left">
                          College
                        </th>

                        <th className="p-3 text-left">
                          Domain
                        </th>

                        <th className="p-3 text-left">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {preview.sample.map(
                        (
                          student,
                        ) => (
                          <tr
                            key={
                              student.id
                            }
                            className="border-t"
                          >
                            <td className="p-3 font-medium">
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
                              {student
                                .college
                                ?.name ||
                                "-"}
                            </td>

                            <td className="p-3">
                              {student
                                .domain
                                ?.name ||
                                "-"}
                            </td>

                            <td className="p-3 capitalize">
                              {student.internship_status ||
                                "-"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

      {/* History */}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Automation
              History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent bulk jobs,
              progress and
              available
              actions.
            </p>
          </div>

          <Button
            type="button"
            className="border bg-white text-slate-700 hover:bg-slate-50"
            disabled={
              loadingJobs
            }
            onClick={() =>
              void loadJobs()
            }
          >
            {loadingJobs
              ? "Loading..."
              : "Refresh"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">
                  Operation
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Current
                  Step
                </th>

                <th className="p-3 text-left">
                  Progress
                </th>

                <th className="p-3 text-left">
                  Success /
                  Failed
                </th>

                <th className="p-3 text-left">
                  Created
                </th>

                <th className="p-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {jobs.map(
                (
                  historyJob,
                ) => (
                  <tr
                    key={
                      historyJob.job_uuid
                    }
                    className="border-t align-top hover:bg-slate-50"
                  >
                    <td className="p-3">
                      <p className="font-semibold">
                        {getOperationTitle(
                          historyJob.type,
                        )}
                      </p>

                      <p className="mt-1 max-w-52 truncate text-xs text-slate-400">
                        {
                          historyJob.job_uuid
                        }
                      </p>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          historyJob.status,
                        )}`}
                      >
                        {
                          historyJob.status
                        }
                      </span>
                    </td>

                    <td className="p-3">
                      {historyJob.current_step ||
                        "-"}
                    </td>

                    <td className="p-3">
                      <div className="w-32">
                        <div className="flex justify-between text-xs">
                          <span>
                            {Number(
                              historyJob.progress ||
                                0,
                            ).toFixed(
                              0,
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(
                                100,
                                Number(
                                  historyJob.progress ||
                                    0,
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold text-emerald-600">
                        {Number(
                          historyJob.success_count ||
                            0,
                        )}
                      </span>

                      {" / "}

                      <span className="font-semibold text-red-600">
                        {Number(
                          historyJob.failed_count ||
                            0,
                        )}
                      </span>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {formatDateTime(
                        historyJob.created_at,
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() =>
                            viewJob(
                              historyJob,
                            )
                          }
                        >
                          View
                        </button>

                        {[
                          "queued",
                          "running",
                        ].includes(
                          historyJob.status,
                        ) && (
                          <button
                            type="button"
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            disabled={
                              cancellingJobUuid ===
                              historyJob.job_uuid
                            }
                            onClick={() =>
                              void cancelJob(
                                historyJob.job_uuid,
                              )
                            }
                          >
                            {cancellingJobUuid ===
                            historyJob.job_uuid
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}

                        {[
                          "failed",
                          "cancelled",
                        ].includes(
                          historyJob.status,
                        ) && (
                          <button
                            type="button"
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                            disabled={
                              retryingJobUuid ===
                              historyJob.job_uuid
                            }
                            onClick={() =>
                              void retryJob(
                                historyJob.job_uuid,
                              )
                            }
                          >
                            {retryingJobUuid ===
                            historyJob.job_uuid
                              ? "Retrying..."
                              : "Retry"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {!loadingJobs &&
                jobs.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                      className="p-10 text-center text-slate-500"
                    >
                      No bulk jobs
                      found.
                    </td>
                  </tr>
                )}

              {loadingJobs &&
                jobs.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                      className="p-10 text-center text-slate-500"
                    >
                      Loading
                      automation
                      history...
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}