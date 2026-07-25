import { api,publicApi  } from "./api";


import type {
  ApiResponse,
  BulkJob,
  BulkJobType,
  BulkProcessPayload,
  BulkProcessResponse,
  College,
  DashboardStats,
  Domain,
  Mentor,
  PaginatedData,
  Student,
  User,
} from "@/types";

export interface CreateCollegePayload {
  name: string;
  code: string;
  university: string;
  principal_name: string;
  coordinator_name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  logo?: string | null;
  college_share: number;
  rknexora_share: number;
  status: "active" | "inactive" | "pending";

  admin_username: string;
  admin_email: string;
  admin_password: string;
}

export interface CollegeProfilePayload {
  name: string;
  university: string;
  principal_name: string;
  coordinator_name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
}

export interface UpdateCollegePayload
  extends Partial<Omit<CreateCollegePayload, "admin_password">> {
  admin_password?: string;
}

export const authService = {
  login: (data: { identifier: string; password: string }) =>
    api.post<
      ApiResponse<{
        user: User;
        accessToken: string;
      }>
    >("/auth/login", data),

  forgot: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  logout: () =>
  api.post(
    "/auth/logout",
  ),

  reset: (token: string, password: string) =>
    api.post("/auth/reset-password", {
      token,
      password,
    }),
};

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  college_id?: number | string;
  domain_id?: number | string;
  session?: string;
  semester?: string;
  batch_id?: number | string;
  mentor_id?: number | string;
}

export interface AdminStudentImportError {
  row: number;
  registration_number?: string;
  message: string;
}

export interface AdminStudentImportResult {
  college: {
    id: number;
    name: string;
    code: string;
  };

  total_rows: number;
  inserted: number;
  updated: number;
  skipped: number;
  error_count: number;
  errors: AdminStudentImportError[];
}


export interface CreateMentorPayload {
  name: string;
  employee_id: string;
  designation?: string;
  department?: string;
  specialization?: string;
  mobile?: string;
  email: string;
  qualification?: string;
  profile_photo?: string | null;
  password: string;
  username?: string;
  domain_id: number;
  college_id?: number | null;
  status: "active" | "inactive";
}

export interface UpdateMentorPayload
  extends Partial<CreateMentorPayload> {}

export type AdminLearningStatus = "active" | "inactive";
export type ChapterContentType = "video" | "pdf" | "text" | "link";

export interface AdminSector {
  id: number;
  sector_name: string;
  status: AdminLearningStatus;
}

export interface AdminDomain {
  id: number;
  sector_id: number;
  domain_name: string;
  fee: number | string;
  duration_hours: number;
  Sector?: AdminSector;
  sector?: AdminSector;
}

export interface AdminModule {
  id: number;
  domain_id: number;
  module_number: number;
  module_name: string;
  Domain?: AdminDomain;
  domain?: AdminDomain;
}

export interface AdminChapter {
  id: number;
  module_id: number;
  chapter_number: number;
  chapter_name: string;
  content_type: ChapterContentType;
  content_url: string;
  Module?: AdminModule;
  module?: AdminModule;
}

export interface AdminAssignment {
  id: number;
  chapter_id: number;
  question_text: string;
  Chapter?: AdminChapter;
  chapter?: AdminChapter;
}

export interface LearningListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminLearningStatus | "";
  sector_id?: number | string;
  domain_id?: number | string;
  module_id?: number | string;
  chapter_id?: number | string;
  content_type?: ChapterContentType | "";
}

export interface CreateSectorPayload {
  sector_name: string;
  status: AdminLearningStatus;
}

export interface CreateDomainPayload {
  sector_id: number;
  domain_name: string;
  fee: number;
  duration_hours: number;
}

export interface CreateModulePayload {
  domain_id: number;
  module_number: number;
  module_name: string;
}

export interface CreateChapterPayload {
  domain_id: number;
  module_id: number;
  chapter_number: number;
  chapter_name: string;
  content_type: ChapterContentType;
  file?: File;
  content_url?: string;
}

export interface CreateAssignmentPayload {
  chapter_id: number;
  question_text: string;
}

export interface MentorAssignableStudent {
  id: number;
  registration_number: string;
  student_id?: string | null;
  name: string;
  email?: string | null;
  mobile?: string | null;

  college_id: number;
  domain_id: number;
  mentor_id?: number | null;

  session?: string | null;
  semester?: string | number | null;

  internship_status: string;
  payment_status: string;

  total_progress?: number | string | null;

  is_assigned_to_mentor: boolean;
  is_assigned_to_other_mentor: boolean;

  college?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;

  domain?: {
    id: number;
    domain_name: string;
  } | null;
}

export interface MentorStudentAssignmentData {
  mentor: {
    id: number;
    name: string;
    employee_id: string;
    domain_id: number;
    college_id?: number | null;
    status: string;

    domain?: {
      id: number;
      domain_name: string;
    } | null;

    college?: {
      id: number;
      name: string;
      code?: string | null;
    } | null;
  };

  items: MentorAssignableStudent[];

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface MentorAssignmentMentor {
  id: number;
  name: string;
  employee_id: string;
  email?: string | null;

  domain_id: number;
  college_id?: number | null;

  status: string;

  domain?: {
    id: number;
    domain_name: string;
  } | null;

  college?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
}

export interface MentorStudentAssignmentParams {
  page?: number;
  limit?: number;
  search?: string;
  session?: string;
  semester?: string;

  assignment_status?:
    | "available"
    | "assigned"
    | "unassigned";
}

export interface AdminDashboardSummary {
  total_colleges: number;
  active_colleges: number;
  pending_colleges: number;

  total_mentors: number;
  active_mentors: number;
  inactive_mentors: number;

  total_students: number;
  active_students: number;
  completed_students: number;
  blocked_students: number;

  paid_students: number;
  pending_payments: number;
  unassigned_students: number;

  total_domains: number;
  completion_rate: number;
  payment_rate: number;
}

export interface AdminDashboardMonthlyRegistration {
  key: string;
  month: string;
  year: number;
  label: string;
  registrations: number;
}

export interface AdminDashboardDomainDistribution {
  domain_id: number;
  domain_name: string;
  student_count: number;
}

export interface AdminDashboardCollegeDistribution {
  college_id: number;
  college_name: string;
  college_code: string | null;
  student_count: number;
}

export interface AdminDashboardRecentStudent {
  id: number;
  registration_number: string;
  student_id?: string | null;
  name: string;
  email?: string | null;
  session?: string | null;
  semester?: string | number | null;
  internship_status: string;
  payment_status: string;
  created_at?: string | null;

  college?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;

  domain?: {
    id: number;
    domain_name: string;
  } | null;
}

export interface AdminDashboardRecentCollege {
  id: number;
  name: string;
  code: string;
  university?: string | null;
  status: string;
  created_at?: string | null;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;

  student_status: Record<string, number>;
  payment_status: Record<string, number>;
  mentor_status: Record<string, number>;
  college_status: Record<string, number>;

  monthly_registrations: AdminDashboardMonthlyRegistration[];

  domain_distribution: AdminDashboardDomainDistribution[];

  college_distribution: AdminDashboardCollegeDistribution[];

  recent_students: AdminDashboardRecentStudent[];

  recent_colleges: AdminDashboardRecentCollege[];
}

const createChapterFormData = (
  data: CreateChapterPayload | Partial<CreateChapterPayload>,
) => {
  const formData = new FormData();

  if (data.domain_id !== undefined) {
    formData.append("domain_id", String(data.domain_id));
  }

  if (data.module_id !== undefined) {
    formData.append("module_id", String(data.module_id));
  }

  if (data.chapter_number !== undefined) {
    formData.append("chapter_number", String(data.chapter_number));
  }

  if (data.chapter_name !== undefined) {
    formData.append("chapter_name", data.chapter_name);
  }

  if (data.content_type !== undefined) {
    formData.append("content_type", data.content_type);
  }

  if (data.content_url !== undefined) {
    formData.append("content_url", data.content_url);
  }

  if (data.file) {
    formData.append("file", data.file);
  }

  return formData;
};

export const adminService = {


dashboard: () =>
  api.get<
    ApiResponse<AdminDashboardData>
  >(
    "/admin/dashboard",
  ),

  /*
  |--------------------------------------------------------------------------
  | Colleges
  |--------------------------------------------------------------------------
  */

  colleges: (params?: AdminListParams) =>
    api.get<ApiResponse<PaginatedData<College>>>(
      "/admin/colleges",
      { params },
    ),

  collegeById: (id: number) =>
    api.get<ApiResponse<College>>(
      `/admin/colleges/${id}`,
    ),

  createCollege: (data: CreateCollegePayload) =>
    api.post<
      ApiResponse<{
        college: College;
        admin: {
          id: number;
          username: string;
          email: string;
          role: string;
          college_id: number;
          status: string;
        };
      }>
    >("/admin/colleges", data),

  updateCollege: (
    id: number,
    data: UpdateCollegePayload,
  ) =>
    api.put<
      ApiResponse<{
        college: College;
        admin: {
          id: number;
          username: string;
          email: string;
          role: string;
          status: string;
        } | null;
      }>
    >(`/admin/colleges/${id}`, data),

  approveCollege: (id: number) =>
    api.patch<ApiResponse<College>>(
      `/admin/colleges/${id}/approve`,
    ),

  deleteCollege: (id: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/admin/colleges/${id}`,
    ),

  /*
  |--------------------------------------------------------------------------
  | Mentors
  |--------------------------------------------------------------------------
  */

   mentors: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    domain_id?: number | string;
    college_id?: number | string;
    status?: string;
  }) =>
    api.get<ApiResponse<PaginatedData<Mentor>>>(
      "/admin/mentors",
      { params },
    ),

  mentorById: (id: number) =>
    api.get<ApiResponse<Mentor>>(
      `/admin/mentors/${id}`,
    ),

  createMentor: (data: CreateMentorPayload) =>
    api.post<
      ApiResponse<{
        mentor: Mentor;
        user: {
          id: number;
          username: string;
          email: string;
          role: string;
          college_id: number | null;
          status: string;
        };
      }>
    >("/admin/mentors", data),

  updateMentor: (
    id: number,
    data: UpdateMentorPayload,
  ) =>
    api.put<
      ApiResponse<{
        mentor: Mentor;
        user: {
          id: number;
          username: string;
          email: string;
          role: string;
          college_id: number | null;
          status: string;
        };
      }>
    >(`/admin/mentors/${id}`, data),

  deleteMentor: (id: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/admin/mentors/${id}`,
    ),

    mentorStudents: (
  mentorId: number,
  params?: MentorStudentAssignmentParams,
) =>
  api.get<
    ApiResponse<MentorStudentAssignmentData>
  >(
    `/admin/mentors/${mentorId}/students`,
    {
      params,
    },
  ),

assignStudentsToMentor: (
  mentorId: number,
  studentIds: number[],
  replaceExisting = false,
) =>
  api.post<
    ApiResponse<{
      mentor_id: number;
      domain_id: number;
      college_id?: number | null;
      assigned_count: number;
      student_ids: number[];
    }>
  >(
    `/admin/mentors/${mentorId}/assign-students`,
    {
      student_ids: studentIds,
      replace_existing: replaceExisting,
    },
  ),

removeStudentsFromMentor: (
  mentorId: number,
  studentIds: number[],
) =>
  api.post<
    ApiResponse<{
      removed_count: number;
      student_ids: number[];
    }>
  >(
    `/admin/mentors/${mentorId}/remove-students`,
    {
      student_ids: studentIds,
    },
  ),

  /*
  |--------------------------------------------------------------------------
  | Students
  |--------------------------------------------------------------------------
  */

  students: (params?: AdminListParams) =>
    api.get<ApiResponse<PaginatedData<Student>>>(
      "/admin/students",
      { params },
    ),

  studentById: (id: number) =>
    api.get<ApiResponse<Student>>(
      `/admin/students/${id}`,
    ),

  createStudent: (data: object) =>
    api.post<ApiResponse<Student>>(
      "/admin/students",
      data,
    ),

  updateStudent: (id: number, data: object) =>
    api.put<ApiResponse<Student>>(
      `/admin/students/${id}`,
      data,
    ),

  deleteStudent: (id: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/admin/students/${id}`,
    ),
    importStudents: (
  collegeId: number,
  file: File,
) => {
  const formData = new FormData();

  formData.append(
    "college_id",
    String(collegeId),
  );

  formData.append("file", file);

  return api.post<
    ApiResponse<AdminStudentImportResult>
  >(
    "/admin/students/import",
    formData,
  );
},

  /*
  |--------------------------------------------------------------------------
  | Sectors
  |--------------------------------------------------------------------------
  */

  sectors: (params?: LearningListParams) =>
  api.get<ApiResponse<PaginatedData<AdminSector>>>(
    "/admin/sectors",
    { params },
  ),

sectorById: (id: number) =>
  api.get<ApiResponse<AdminSector>>(`/admin/sectors/${id}`),

createSector: (data: CreateSectorPayload) =>
  api.post<ApiResponse<AdminSector>>("/admin/sectors", data),

updateSector: (id: number, data: Partial<CreateSectorPayload>) =>
  api.put<ApiResponse<AdminSector>>(`/admin/sectors/${id}`, data),

deleteSector: (id: number) =>
  api.delete<ApiResponse<Record<string, never>>>(`/admin/sectors/${id}`),
  /*
  |--------------------------------------------------------------------------
  | Domains
  |--------------------------------------------------------------------------
  */

  domains: (params?: LearningListParams) =>
  api.get<ApiResponse<PaginatedData<AdminDomain>>>(
    "/admin/domains",
    { params },
  ),

domainById: (id: number) =>
  api.get<ApiResponse<AdminDomain>>(`/admin/domains/${id}`),

createDomain: (data: CreateDomainPayload) =>
  api.post<ApiResponse<AdminDomain>>("/admin/domains", data),

updateDomain: (id: number, data: Partial<CreateDomainPayload>) =>
  api.put<ApiResponse<AdminDomain>>(`/admin/domains/${id}`, data),

deleteDomain: (id: number) =>
  api.delete<ApiResponse<Record<string, never>>>(`/admin/domains/${id}`),
  /*
  |--------------------------------------------------------------------------
  | Modules
  |--------------------------------------------------------------------------
  */

 modules: (params?: LearningListParams) =>
  api.get<ApiResponse<PaginatedData<AdminModule>>>(
    "/admin/modules",
    { params },
  ),

moduleById: (id: number) =>
  api.get<ApiResponse<AdminModule>>(`/admin/modules/${id}`),

createModule: (data: CreateModulePayload) =>
  api.post<ApiResponse<AdminModule>>("/admin/modules", data),

updateModule: (id: number, data: Partial<CreateModulePayload>) =>
  api.put<ApiResponse<AdminModule>>(`/admin/modules/${id}`, data),

deleteModule: (id: number) =>
  api.delete<ApiResponse<Record<string, never>>>(`/admin/modules/${id}`),
  /*
  |--------------------------------------------------------------------------
  | Chapters
  |--------------------------------------------------------------------------
  */

  chapters: (params?: LearningListParams) =>
  api.get<ApiResponse<PaginatedData<AdminChapter>>>(
    "/admin/chapters",
    { params },
  ),

chapterById: (id: number) =>
  api.get<ApiResponse<AdminChapter>>(
    `/admin/chapters/${id}`,
  ),

createChapter: (data: CreateChapterPayload) =>
  api.post<ApiResponse<AdminChapter>>(
    "/admin/chapters",
    createChapterFormData(data),
  ),

updateChapter: (
  id: number,
  data: Partial<CreateChapterPayload>,
) =>
  api.put<ApiResponse<AdminChapter>>(
    `/admin/chapters/${id}`,
    createChapterFormData(data),
  ),

deleteChapter: (id: number) =>
  api.delete<ApiResponse<Record<string, never>>>(
    `/admin/chapters/${id}`,
  ),
  /*
  |--------------------------------------------------------------------------
  | Assignments
  |--------------------------------------------------------------------------
  */

 assignments: (params?: LearningListParams) =>
  api.get<ApiResponse<PaginatedData<AdminAssignment>>>(
    "/admin/assignments",
    { params },
  ),

assignmentById: (id: number) =>
  api.get<ApiResponse<AdminAssignment>>(`/admin/assignments/${id}`),

createAssignment: (data: CreateAssignmentPayload) =>
  api.post<ApiResponse<AdminAssignment>>("/admin/assignments", data),

updateAssignment: (id: number, data: Partial<CreateAssignmentPayload>) =>
  api.put<ApiResponse<AdminAssignment>>(`/admin/assignments/${id}`, data),

deleteAssignment: (id: number) =>
  api.delete<ApiResponse<Record<string, never>>>(`/admin/assignments/${id}`),
  /*
  |--------------------------------------------------------------------------
  | Bulk Operations
  |--------------------------------------------------------------------------
  */

  processBulk: (
  type: BulkJobType,
  payload: BulkProcessPayload,
) =>
  api.post<
    ApiResponse<BulkProcessResponse>
  >(
    "/admin/bulk/process",
    {
      type,
      payload,
    },
  ),

bulkStatus: (
  jobUuid: string,
) =>
  api.get<
    ApiResponse<BulkJob>
  >(
    `/admin/bulk/status/${jobUuid}`,
  ),
};

export interface ExcelImportWarning {
  row: number;
  registration_number?: string;
  field?: string;
  value?: string;
  message: string;
}

export interface ExcelImportError {
  row: number;
  registration_number?: string;
  message: string;
}

export interface ExcelImportResult {
  total_rows: number;
  valid_rows: number;
  inserted: number;
  updated: number;
  skipped: number;
  warning_count: number;
  error_count: number;
  warnings: ExcelImportWarning[];
  errors: ExcelImportError[];
}

export interface CollegeStudentCertificate {
  id: number;
  certificate_number: string;
  certificate_url: string;
  qr_code_url?: string | null;
  verification_url?: string | null;
  issued_date?: string | null;
}

export interface CollegeStudentRow {
  id: number;
  college_id: number;

  registration_number: string;
  student_id?: string | null;

  name: string;
  email?: string | null;
  mobile?: string | null;

  programme?: string | null;
  major_subject?: string | null;

  session?: string | null;
  semester?: string | number | null;

  internship_status:
    | "preloaded"
    | "registered"
    | "active"
    | "completed"
    | "blocked";

  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

  total_progress?: number | string | null;

  domain?: {
    id: number;
    domain_name: string;
    duration_hours: number;
  } | null;

  certificate: CollegeStudentCertificate | null;

  can_download_certificate: boolean;
  certificate_message: string;
}

export interface CollegeStudentsData {
  items: CollegeStudentRow[];

  total: number;
  page: number;
  limit: number;
  totalPages: number;

  summary: {
    total: number;
    active: number;
    completed: number;
    pending: number;
    blocked: number;
  };
}

export interface CollegeStudentParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  session?: string;
  semester?: string;
}

export interface CollegeDashboardStudent {
  id: number;
  registration_number: string;
  student_id?: string | null;
  name: string;
  email?: string | null;
  mobile?: string | null;
  programme?: string | null;
  major_subject?: string | null;
  session?: string | null;
  semester?: string | number | null;
  internship_status: string;
  payment_status: string;
  total_progress: number;
  mentor_assigned: boolean;
  registered_at?: string | null;

  domain?: {
    id: number;
    domain_name: string;
    fee: number;
    duration_hours: number;
  } | null;
}

export interface CollegeDashboardData {
  college: {
    id: number;
    name: string;
    code: string;
    university?: string | null;
    principal_name?: string | null;
    coordinator_name?: string | null;
    email?: string | null;
    mobile?: string | null;
    address?: string | null;
    state?: string | null;
    district?: string | null;
    pincode?: string | null;
    logo?: string | null;
    status: string;
  };

  summary: {
    total_students: number;
    active_students: number;
    completed_students: number;
    pending_students: number;
    preloaded_students: number;
    registered_students: number;
    blocked_students: number;

    paid_students: number;
    pending_payments: number;
    failed_payments: number;
    refunded_payments: number;

    assigned_students: number;
    unassigned_students: number;

    certificates_generated: number;

    average_progress: number;
    completion_rate: number;
    payment_rate: number;
    mentor_assignment_rate: number;
    certificate_rate: number;

    estimated_revenue: number;
    college_share_amount: number;
    rknexora_share_amount: number;
  };

  student_status: {
    preloaded: number;
    registered: number;
    active: number;
    completed: number;
    blocked: number;
  };

  payment_status: {
    pending: number;
    paid: number;
    failed: number;
    refunded: number;
  };

  progress_distribution: {
    not_started: number;
    up_to_25: number;
    up_to_50: number;
    up_to_75: number;
    up_to_99: number;
    completed: number;
  };

  monthly_registrations: Array<{
    key: string;
    month: string;
    year: number;
    label: string;
    registrations: number;
  }>;

  domain_distribution: Array<{
    domain_id: number;
    domain_name: string;
    student_count: number;
  }>;

  session_distribution: Array<{
    session: string;
    student_count: number;
  }>;

  recent_students:
    CollegeDashboardStudent[];
}

export const collegeService = {
  profile: () =>
    api.get<ApiResponse<College>>(
      "/college/profile",
    ),

  updateProfile: (
    data: CollegeProfilePayload,
  ) =>
    api.put<ApiResponse<College>>(
      "/college/profile",
      data,
    ),

  upload: (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    return api.post<
      ApiResponse<ExcelImportResult>
    >(
      "/college/upload",
      formData,
    );
  },

  students: (params?: object) =>
    api.get<ApiResponse<Student[]>>(
      "/college/registrations",
      {
        params,
      },
    ),

  studentsWithCertificates: (
    params?: CollegeStudentParams,
  ) =>
    api.get<
      ApiResponse<CollegeStudentsData>
    >(
      "/college/students",
      {
        params,
      },
    ),

  downloadStudentCertificate: (
    studentId: number,
  ) =>
    api.get(
      `/college/students/${studentId}/certificate/download`,
      {
        responseType: "blob",
      },
    ),

 dashboard: () =>
  api.get<
    ApiResponse<CollegeDashboardData>
  >(
    "/college/dashboard",
  ),
};

export interface MentorAssignedStudentsData {
  mentor: {
    id: number;
    name: string;
    employee_id: string;
    email: string;
    domain_id: number;
    college_id?: number | null;
    status: string;
  };

  students: Student[];
  total: number;
}

export interface MentorStudentParams {
  search?: string;
  status?: string;
  session?: string;
  semester?: string;
}

export interface MentorReviewPayload {
  status:
    | "approved"
    | "rejected"
    | "resubmit";

  marks?: number | null;
  mentor_comments?: string;
}

export interface MentorAssessmentPayload {
  criteria_ratings: unknown;
  overall_performance?: string;
  supervisor_remarks?: string;
}

export const mentorService = {
  students: (
    params?: MentorStudentParams,
  ) =>
    api.get<
      ApiResponse<MentorAssignedStudentsData>
    >(
      "/mentor/students",
      {
        params,
      },
    ),

  review: (
    submissionId: number,
    data: MentorReviewPayload,
  ) =>
    api.put(
      `/mentor/submissions/${submissionId}/review`,
      data,
    ),

  assessment: (
    studentId: number,
    data: MentorAssessmentPayload,
  ) =>
    api.post(
      `/mentor/assessments/${studentId}`,
      data,
    ),
};

export interface StudentDashboardData {
  student: {
    id: number;
    registration_number: string;
    student_id?: string | null;
    name: string;
    father_name?: string | null;
    email?: string | null;
    mobile?: string | null;
    photo?: string | null;
    programme?: string | null;
    major_subject?: string | null;
    session?: string | null;
    semester?: string | null;
    internship_status: string;
    payment_status: string;

    college?: {
      id: number;
      name: string;
      code?: string | null;
      university?: string | null;
      logo?: string | null;
    } | null;

    domain?: {
      id: number;
      domain_name: string;
      duration_hours: number;
      fee: number;
    } | null;
  };

  stats: {
    course_progress: number;
    attendance: number;
    overall_progress: number;
    learning_hours: number;
    required_hours: number;
    hours_remaining: number;
    logbook_hours: number;
    logbook_entries: number;
    assignments_completed: number;
    assignments_submitted: number;
    assignments_total: number;
    assignment_progress: number;
    completed_chapters: number;
    total_chapters: number;
  };

  attendance_summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    leave_days: number;
    percentage: number;
  };

  status: {
    project: {
      id: number;
      title?: string | null;
      status: string;
      report_url?: string | null;
      mentor_feedback?: string | null;
      submitted_at?: string | null;
    } | null;

    report: {
      id: number;
      status: string;
      report_url?: string | null;
      mentor_remarks?: string | null;
      submitted_at?: string | null;
    } | null;

    certificate: {
      available: boolean;
      certificate_number?: string | null;
      qr_code_url?: string | null;
      issued_date?: string | null;
    };

    payment: {
      amount: number;
      transaction_id: string;
      status: string;
      date?: string | null;
    } | null;
  };

  recent_activities: StudentRecentActivity[];
}

export interface StudentRecentActivity {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  date?: string | null;
  status?: string | null;
  marks?: number | null;
  hours?: number | null;
}

export interface StudentProfileData {
  id: number;
  registration_number: string;
  student_id?: string | null;
  name: string;
  father_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  programme?: string | null;
  major_subject?: string | null;
  session?: string | null;
  semester?: string | null;
  mobile?: string | null;
  email?: string | null;
  photo?: string | null;
  registration_date?: string | null;
  internship_status: string;
  payment_status: string;
  username?: string | null;
  academics?: Record<string, unknown>;

  college?: {
    id: number;
    name: string;
    code?: string | null;
    university?: string | null;
    principal_name?: string | null;
    coordinator_name?: string | null;
    email?: string | null;
    mobile?: string | null;
    address?: string | null;
    state?: string | null;
    district?: string | null;
    pincode?: string | null;
    logo?: string | null;
  } | null;

  domain?: {
    id: number;
    domain_name: string;
    duration_hours: number;
    fee: number;
  } | null;
}

export interface StudentProfileUpdatePayload {
  mobile?: string;
  email?: string;
  photo?: string | null;
}

export interface StudentChapter {
  id: number;
  module_id: number;
  chapter_number: number;
  chapter_name: string;
  content_type:
    | "video"
    | "pdf"
    | "text"
    | "link";
  content_url: string;
  unlocked: boolean;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentLearningModule {
  id: number;
  domain_id: number;
  module_number: number;
  module_name: string;
  Chapters: StudentChapter[];
  created_at?: string;
  updated_at?: string;
}

export interface StudentLearningData {
  modules: StudentLearningModule[];

  summary: {
    total_chapters: number;
    completed_chapters: number;
    progress_percentage: number;
  };
}

export type StudentAssignmentStatus =
  | "pending"
  | "submitted"
  | "pending_review"
  | "approved"
  | "rejected"
  | "resubmit";

export interface StudentAssignmentSubmission {
  id: number;
  status: StudentAssignmentStatus;
  file_url: string;
  marks: number | null;
  mentor_comments: string | null;
  submitted_at: string | null;
  updated_at: string | null;
}

export interface StudentAssignment {
  id: number;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  maximum_marks: number;
  file_url: string | null;

  module: {
    id: number;
    name: string;
    number: number;
  };

  chapter: {
    id: number;
    name: string;
    number: number;
  };

  submission: StudentAssignmentSubmission | null;
  status: StudentAssignmentStatus;
  can_submit: boolean;
}

export interface StudentAssignmentSummary {
  total: number;
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface StudentAssignmentsData {
  assignments: StudentAssignment[];
  summary: StudentAssignmentSummary;
}

export type StudentAttendanceStatus =
  | "present"
  | "absent"
  | "leave"
  | "half_day";

export interface StudentAttendanceRecord {
  id: number;
  student_id?: number;
  date: string;
  login_time: string | null;
  logout_time: string | null;
  learning_hours: number | string;
  status: StudentAttendanceStatus;
  remarks: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TodayAttendanceRecord {
  id: number;
  date: string;
  login_time: string | null;
  logout_time: string | null;
  learning_hours: number;
  status: StudentAttendanceStatus;
  remarks: string | null;
}

export interface TodayAttendanceData {
  date: string;
  checked_in: boolean;
  checked_out: boolean;
  attendance: TodayAttendanceRecord | null;
}

export interface StudentAttendanceSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  half_days: number;
  attendance_percentage: number;
  total_learning_hours: number;
}

export interface StudentAttendancePagination {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
}

export interface StudentAttendanceData {
  records: StudentAttendanceRecord[];
  summary: StudentAttendanceSummary;
  pagination: StudentAttendancePagination;
}

export interface StudentAttendanceCalendarData {
  month: number;
  year: number;
  records: StudentAttendanceRecord[];
}

export interface StudentAttendanceParams {
  from_date?: string;
  to_date?: string;
  status?: StudentAttendanceStatus | "";
  page?: number;
  limit?: number;
}

export interface StudentLogbook {
  id: number;
  date: string;
  activity: string;
  skills_learned?: string | null;
  hours_worked: number;
  status?: string;
  mentor_comments?: string | null;
  created_at?: string;
}

export interface StudentLogbookPayload {
  date: string;
  activity: string;
  skills_learned?: string;
  hours_worked: number;
}

export interface StudentProject {
  id: number;
  title: string;
  report_url?: string | null;
  presentation_url?: string | null;
  photos_json?: unknown;
  status: string;
  mentor_feedback?: string | null;
  created_at?: string;
}

export interface StudentReport {
  id: number;
  report_url?: string | null;
  status: string;
  mentor_remarks?: string | null;
  created_at?: string;
}

export interface StudentPayment {
  id: number;
  amount: number;
  transaction_id: string;
  status: string;
  created_at?: string;
}

export interface StudentCertificateData {
  available?: boolean;
  certificate_number?: string | null;
  qr_code_url?: string | null;
  issued_date?: string | null;
}

export interface StudentAnalyticsData {
  [key: string]: unknown;
}

export interface StudentGeneratedDocument {
  id: number;

  type:
    | "acceptance_letter"
    | "internship_report"
    | "attendance_sheet"
    | "logbook"
    | "certificate"
    | "assessment_marksheet"
    | "offer_letter";

  file_url: string;
  generated_at?: string | null;
  download_url?: string;
  metadata?: Record<
    string,
    unknown
  > | null;
}

export interface StudentDocumentsData {
  documents:
    StudentGeneratedDocument[];

  total: number;
}


export const studentService = {
  dashboard: () =>
    api.get<ApiResponse<StudentDashboardData>>(
      "/student/dashboard",
    ),

  profile: () =>
    api.get<ApiResponse<StudentProfileData>>(
      "/student/profile",
    ),

  updateProfile: (
    data: StudentProfileUpdatePayload,
  ) =>
    api.put<ApiResponse<{
      id: number;
      mobile: string | null;
      email: string | null;
      photo: string | null;
    }>>(
      "/student/profile",
      data,
    ),

  learning: () =>
    api.get<ApiResponse<StudentLearningData>>(
      "/student/learning",
    ),

  completeChapter: (
    chapterId: number,
  ) =>
    api.post<
      ApiResponse<Record<string, unknown>>
    >(
      `/student/chapters/${chapterId}/complete`,
    ),

  assignments: () =>
  api.get<ApiResponse<StudentAssignmentsData>>(
    "/student/assignments",
  ),

assignmentById: (
  assignmentId: number,
) =>
  api.get<
    ApiResponse<{
      assignment: StudentAssignment;
    }>
  >(
    `/student/assignments/${assignmentId}`,
  ),

documents: () =>
  api.get<
    ApiResponse<StudentDocumentsData>
  >(
    "/student/documents",
  ),

downloadDocument: (
  documentId: number,
) =>
  api.get(
    `/student/documents/${documentId}/download`,
    {
      responseType:
        "blob",
    },
  ),

submitAssignment: (
  assignmentId: number,
  file: File,
) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post<
    ApiResponse<StudentAssignmentSubmission>
  >(
    `/student/assignments/${assignmentId}`,
    formData,
  );
},
attendance: (
  params: StudentAttendanceParams = {},
) =>
  api.get<ApiResponse<StudentAttendanceData>>(
    "/student/attendance",
    {
      params,
    },
  ),

attendanceCalendar: (
  month: number,
  year: number,
) =>
  api.get<
    ApiResponse<StudentAttendanceCalendarData>
  >("/student/attendance/calendar", {
    params: {
      month,
      year,
    },
  }),

  todayAttendance: () =>
  api.get<ApiResponse<TodayAttendanceData>>(
    "/student/attendance/today",
  ),

checkIn: () =>
  api.post<
    ApiResponse<
      TodayAttendanceRecord & {
        checked_in: boolean;
        checked_out: boolean;
      }
    >
  >("/student/attendance/check-in"),

checkOut: () =>
  api.post<
    ApiResponse<
      TodayAttendanceRecord & {
        checked_in: boolean;
        checked_out: boolean;
      }
    >
  >("/student/attendance/check-out"),

  logbooks: () =>
    api.get<
      ApiResponse<StudentLogbook[]>
    >(
      "/student/logbooks",
    ),

  logbookById: (
    logbookId: number,
  ) =>
    api.get<
      ApiResponse<StudentLogbook>
    >(
      `/student/logbooks/${logbookId}`,
    ),

  createLogbook: (
    data: StudentLogbookPayload,
  ) =>
    api.post<
      ApiResponse<StudentLogbook>
    >(
      "/student/logbook",
      data,
    ),

  updateLogbook: (
    logbookId: number,
    data: Partial<StudentLogbookPayload>,
  ) =>
    api.put<
      ApiResponse<StudentLogbook>
    >(
      `/student/logbooks/${logbookId}`,
      data,
    ),

  deleteLogbook: (
    logbookId: number,
  ) =>
    api.delete<
      ApiResponse<Record<string, never>>
    >(
      `/student/logbooks/${logbookId}`,
    ),

  projects: () =>
    api.get<
      ApiResponse<StudentProject[]>
    >(
      "/student/projects",
    ),

  projectById: (
    projectId: number,
  ) =>
    api.get<
      ApiResponse<StudentProject>
    >(
      `/student/projects/${projectId}`,
    ),

  submitProject: (
    data: FormData | object,
  ) =>
    api.post(
      "/student/projects",
      data,
    ),

  reports: () =>
    api.get<
      ApiResponse<StudentReport[]>
    >(
      "/student/reports",
    ),

  reportById: (
    reportId: number,
  ) =>
    api.get<
      ApiResponse<StudentReport>
    >(
      `/student/reports/${reportId}`,
    ),

  submitReport: (
    data: FormData | object,
  ) =>
    api.post(
      "/student/reports",
      data,
    ),

  payments: () =>
    api.get<
      ApiResponse<StudentPayment[]>
    >(
      "/student/payments",
    ),

  paymentById: (
    paymentId: number,
  ) =>
    api.get<
      ApiResponse<StudentPayment>
    >(
      `/student/payments/${paymentId}`,
    ),

  certificate: () =>
    api.get<
      ApiResponse<StudentCertificateData>
    >(
      "/student/certificate",
    ),

  analytics: () =>
    api.get<
      ApiResponse<StudentAnalyticsData>
    >(
      "/student/analytics",
    ),
};

export interface RegistrationVerification {
  id: number;
  student_id: number;

  registration_number: string;

  name: string;
  father_name?: string | null;
  gender?: string | null;
  dob?: string | null;

  email?: string | null;
  mobile?: string | null;

  college_id: number;

  programme?: string | null;
  major_subject?: string | null;

  session?: string | null;
  semester?: string | null;

  domain_id?: number | null;
  username?: string | null;

  photo?: string | null;

  documents?: {
    photo?: string | null;
    identity_document?: string | null;
    marksheet?: string | null;
  };

  internship_status:
    | "preloaded"
    | "registered"
    | "active"
    | "completed"
    | "blocked";

  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

  registration_locked: boolean;

  next_step:
    | "details"
    | "documents"
    | "review"
    | "payment"
    | "login";
}
export interface SaveRegistrationResponse {
  student_id: number;
  registration_number: string;
  internship_status: string;
  registration_locked: boolean;
  next_step: "documents";
}

export interface UploadDocumentsResponse {
  photo: string | null;
  identity_document: string | null;
  marksheet: string | null;
  documents_complete: boolean;
  next_step: "review";
}

export interface LockRegistrationResponse {
  student_id: number;
  registration_number?: string;
  registration_locked: boolean;
  payment_status?: string;
  next_step:
    | "payment"
    | "login";
}

export interface CashfreeOrderResponse {
  order_id: string;
  cf_order_id: string;
  payment_session_id: string;
  amount: number;
  currency: string;

  student: {
    id: number;
    name: string;
    email?: string | null;
    mobile?: string | null;
    registration_number: string;
  };

  domain: {
    id: number;
    domain_name: string;
  };
}

export interface CashfreeVerificationPayload {
  order_id: string;
}

export interface CashfreeVerificationResponse {
  order_id: string;
  cf_order_id?: string | number | null;
  transaction_id?: string | null;
  order_status?: string;
  payment_status: "paid" | "pending" | "failed";
  internship_status?: string;
  amount?: number;
  currency?: string;
}

export const registrationService = {
  verify: (registration_number: string) =>
    publicApi.post(
      "/registration/verify",
      { registration_number },
    ),

  domains: () =>
    publicApi.get(
      "/registration/domains",
    ),

  saveDetails: (data: object) =>
    publicApi.post(
      "/registration/details",
      data,
    ),

  uploadDocuments: (
    data: FormData,
  ) =>
    publicApi.post(
      "/registration/documents",
      data,
    ),

  lockRegistration: (
    student_id: number,
  ) =>
    publicApi.post(
      "/registration/lock",
      { student_id },
    ),

  createPaymentOrder: (
    studentId: number,
  ) =>
    publicApi.post(
      "/registration/payment/order",
      {
        student_id: studentId,
      },
    ),

  verifyPayment: (
    orderId: string,
  ) =>
    publicApi.post(
      "/registration/payment/verify",
      {
        order_id: orderId,
      },
    ),

  downloadPaymentReceipt: (
    transactionId: string,
  ) =>
    publicApi.get(
      `/registration/payment/receipt/${encodeURIComponent(
        transactionId,
      )}`,
      {
        responseType: "blob",
      },
    ),
};