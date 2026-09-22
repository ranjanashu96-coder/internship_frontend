import { api,publicApi  } from "./api";


import type {
   ApiResponse,
  BulkJob,
  BulkJobType,
  BulkPreviewData,
  BulkProcessPayload,
  BulkProcessResponse,
  College,
  DashboardStats,
  Domain,
  Mentor,
  PaginatedData,
  Student,
  User,
  Notification as AppNotification,
NotificationListData,
NotificationUnreadCountData,
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
  login: (
    data: {
      identifier: string;
      password: string;
    },
  ) =>
    publicApi.post<
      ApiResponse<{
        user: User;
        accessToken: string;
      }>
    >(
      "/auth/login",
      data,
    ),

  forgot: (
    email: string,
  ) =>
    publicApi.post(
      "/auth/forgot-password",
      {
        email,
      },
    ),

  reset: (
    token: string,
    password: string,
  ) =>
    publicApi.post(
      "/auth/reset-password",
      {
        token,
        password,
      },
    ),

  logout: () =>
    api.post(
      "/auth/logout",
    ),
};

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

export const notificationService = {
  list: (
    page = 1,
    limit = 20,
  ) =>
    api.get<
      ApiResponse<NotificationListData>
    >(
      "/notifications",
      {
        params: {
          page,
          limit,
        },
      },
    ),

  unreadCount: () =>
    api.get<
      ApiResponse<NotificationUnreadCountData>
    >(
      "/notifications/unread-count",
    ),

  markAsRead: (
    notificationId: number,
  ) =>
    api.patch<
      ApiResponse<AppNotification>
    >(
      `/notifications/${notificationId}/read`,
    ),

  markAllAsRead: () =>
    api.patch<
      ApiResponse<Record<string, never>>
    >(
      "/notifications/read-all",
    ),
};

export type AdminReportType =
  | "student_registration"
  | "attendance"
  | "completion"
  | "payment";

export interface AdminReportParams {
  report_type: AdminReportType;
  page?: number;
  limit?: number;
  search?: string;
  college_id?: number | string;
  domain_id?: number | string;
  session?: string;
  semester?: string;
  internship_status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
}

export interface AdminReportColumn {
  key: string;
  label: string;
}

export interface AdminReportSummary {
  total_students: number;
  active_students: number;
  completed_students: number;
  paid_students: number;
  pending_payments: number;
  total_revenue: number;
}

export interface AdminReportData {
  report_type: AdminReportType;
  columns: AdminReportColumn[];
  rows: Array<
    Record<
      string,
      string | number | boolean | null
    >
  >;
  summary: AdminReportSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
   payment_status?: string;
  college_id?: number | string;
  domain_id?: number | string;
  session?: string;
  semester?: string;
  batch_id?: number | string;
  mentor_id?: number | string;
  from_date?: string;
to_date?: string;
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

export interface AdminPaymentStudent {
  id: number;
  registration_number: string;
  student_id?: string | null;
  name: string;
  email?: string | null;
  mobile?: string | null;
  payment_status: string;
  internship_status: string;
}

export interface AdminPaymentRow {
  id: number;
  student_id: number;
  transaction_id: string;
  order_id?: string | null;
  cashfree_order_id?: string | null;
  cf_order_id?: string | null;
  cf_payment_id?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  gateway?: string | null;
  amount: number | string;
  currency?: string | null;
  status: string;
  paid_at?: string | null;
  payment_method?: string | null;
  payment_message?: string | null;
  failure_reason?: string | null;
  receipt_path?: string | null;
  receipt_generated_at?: string | null;
  receipt_number?: string | null;
  gateway_payload?: Record<string, unknown> | string | null;
  created_at?: string | null;
  createdAt?: string | null;
  student: AdminPaymentStudent | null;
  can_mark_success: boolean;
}

export interface AdminPaymentsData {
  items: AdminPaymentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    total: number;
    created: number;
    success: number;
    failed: number;
  };
}

export interface CollegeDomainFeeItem {
  id: number;
  sector_id: number;
  domain_name: string;
  duration_hours: number;

  default_fee: number;
  custom_fee: number | null;
  effective_fee: number;

  fee_source:
    | "college"
    | "default";

  status:
    | "active"
    | "inactive"
    | "default";
}

export interface CollegeDomainFeesData {
  college: {
    id: number;
    name: string;
    code: string;
  };

  items: CollegeDomainFeeItem[];
}

export interface SaveCollegeDomainFeesPayload {
  fees: Array<{
    domain_id: number;
    fee?: number;
    use_default?: boolean;
    status?: "active" | "inactive";
  }>;
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

  content_type?: ChapterContentType | null;
  content_url?: string | null;

  resources?: AdminChapterResource[];

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

  description?: string | null;
  duration_minutes?: number;
  is_preview?: boolean;
  status?: "draft" | "published";
}

export interface CreateAssignmentPayload {
  chapter_id: number;
  question_text: string;
}

export type LiveClassStatus =
  | "scheduled"
  | "completed"
  | "cancelled";

export interface LiveClassItem {
  id: number;

  domain_id: number;
  module_id?: number | null;
  chapter_id?: number | null;

  title: string;
  description?: string | null;
  instructor_name?: string | null;

  meeting_url: string;
  scheduled_at: string;

  duration_minutes: number;
  popup_minutes_before: number;

  status: LiveClassStatus;

  can_join?: boolean;
  is_live?: boolean;
  is_upcoming?: boolean;
  popup_visible?: boolean;

  join_opens_at?: string;
  ends_at?: string;

  seconds_until_start?: number;

  domain?: {
    id: number;
    domain_name: string;
  } | null;

  module?: {
    id: number;
    module_number: number;
    module_name: string;
    domain_id: number;
  } | null;

  chapter?: {
    id: number;
    module_id: number;
    chapter_number: number;
    chapter_name: string;
  } | null;
}

export interface LiveClassListData {
  items: LiveClassItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentUpcomingLiveClasses {
  next_class: LiveClassItem | null;
  items: LiveClassItem[];
}

export interface CreateLiveClassPayload {
  domain_id: number;
  module_id?: number | null;
  chapter_id?: number | null;

  title: string;
  description?: string;
  instructor_name?: string;

  meeting_url: string;
  scheduled_at: string;

  duration_minutes: number;
  popup_minutes_before?: number;
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

export type ChapterResourceType =
  | "video"
  | "pdf"
  | "ppt"
  | "document"
  | "image"
  | "audio"
  | "text"
  | "link"
  | "zip"
  | "source_code"
  | "other";

export interface AdminChapterResource {
  id: number;
  chapter_id: number;

  title: string;
  resource_type: ChapterResourceType;

  file_url?: string | null;
  external_url?: string | null;
  text_content?: string | null;

  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | string | null;

  sort_order: number;

  is_downloadable: boolean;
  is_primary: boolean;

  status: "active" | "inactive";

  created_at?: string;
  updated_at?: string;
}

export interface CreateChapterResourcePayload {
  title: string;
  resource_type: ChapterResourceType;

  file?: File;

  external_url?: string;
  text_content?: string;

  sort_order?: number;

  is_downloadable?: boolean;
  is_primary?: boolean;

  status?: "active" | "inactive";
}

export interface ChapterResourcesResponse {
  chapter: AdminChapter;
  resources: AdminChapterResource[];
}

export type QuizStatus =
  | "draft"
  | "active"
  | "inactive";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correct_option_id: string;
  marks: number;
  explanation: string | null;
}

export interface AdminQuiz {
  id: number;
  chapter_id: number;
  title: string;
  description: string | null;
  questions_json: QuizQuestion[];
  passing_score: number | string;
  total_marks: number | string;
  attempts_allowed: number;
  time_limit_minutes: number | null;
  randomize_questions: boolean;
  show_result_immediately: boolean;
  status: QuizStatus;
  created_at: string;
  updated_at: string;

  chapter?: AdminChapter;
  Chapter?: AdminChapter;
}

export interface QuizListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuizStatus | "";
  chapter_id?: number | string;
  module_id?: number | string;
  domain_id?: number | string;
  sector_id?: number | string;
}

export interface CreateQuizPayload {
  chapter_id: number;
  title: string;
  description?: string | null;
  questions: QuizQuestion[];
  passing_score: number;
  attempts_allowed: number;
  time_limit_minutes?: number | null;
  randomize_questions: boolean;
  show_result_immediately: boolean;
  status: QuizStatus;
}

export type UpdateQuizPayload =
  Partial<CreateQuizPayload>;


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

  // if (data.content_type !== undefined) {
  //   formData.append("content_type", data.content_type);
  // }

  // if (data.content_url !== undefined) {
  //   formData.append("content_url", data.content_url);
  // }

  // if (data.file) {
  //   formData.append("file", data.file);
  // }

  return formData;
};
const createChapterResourceFormData = (
  data: CreateChapterResourcePayload,
) => {
  const formData = new FormData();

  formData.append(
    "title",
    data.title,
  );

  formData.append(
    "resource_type",
    data.resource_type,
  );

  if (data.file) {
    formData.append(
      "file",
      data.file,
    );
  }

  if (data.external_url !== undefined) {
    formData.append(
      "external_url",
      data.external_url,
    );
  }

  if (data.text_content !== undefined) {
    formData.append(
      "text_content",
      data.text_content,
    );
  }

  if (data.sort_order !== undefined) {
    formData.append(
      "sort_order",
      String(data.sort_order),
    );
  }

  if (data.is_downloadable !== undefined) {
    formData.append(
      "is_downloadable",
      String(data.is_downloadable),
    );
  }

  if (data.is_primary !== undefined) {
    formData.append(
      "is_primary",
      String(data.is_primary),
    );
  }

  if (data.status !== undefined) {
    formData.append(
      "status",
      data.status,
    );
  }

  return formData;
};

export interface AdminMessageStudent {
  id: number;

  registration_number:
    string;

  student_id?:
    string | null;

  name: string;

  email?:
    string | null;

  mobile?:
    string | null;

  payment_status:
    string;

  internship_status:
    string;

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

export interface AdminMessageStudentsData {
  items:
    AdminMessageStudent[];

  total: number;
}

export interface SendAdminMessagePayload {
  title: string;

  message: string;

  mode:
    | "all"
    | "selected";

  student_ids?: number[];
}

export interface SendAdminMessageResponse {
  recipient_mode:
    | "all"
    | "selected";

  requested_count:
    number;

  sent_count:
    number;

  failed_count:
    number;

  sent_student_ids:
    number[];

  failed: Array<{
    student_id:
      number;

    name?:
      string;

    message:
      string;
  }>;
}



/*
|--------------------------------------------------------------------------
| College Settlement / College Payouts
|--------------------------------------------------------------------------
*/

export type CollegeSettlementPaymentMode =
  | "bank_transfer"
  | "upi"
  | "cheque"
  | "cash"
  | "other";

export interface CollegeSettlementSummary {
  gross_revenue: number;
  successful_payments: number;
  college_share_percentage: number;
  earned_share: number;
  total_paid: number;
  remaining_payable: number;
  settlement_percentage: number;
}

export interface CollegeSettlementCollege {
  id: number;
  name: string;
  code?: string | null;
  university?: string | null;
  status?: string | null;
  college_share?: number;
  rknexora_share?: number;
}

export interface CollegeSettlementItem {
  id: number;
  college_id: number;
  amount: number | string;
  payment_date: string;
  payment_mode: CollegeSettlementPaymentMode;
  transaction_reference?: string | null;
  remarks?: string | null;
  receipt_file?: string | null;
  share_percentage_snapshot?: number | string;
  earned_share_snapshot?: number | string;
  balance_before?: number | string;
  balance_after?: number | string;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminCollegeSettlementRow
  extends CollegeSettlementCollege,
    CollegeSettlementSummary {}

export interface AdminCollegeSettlementsData {
  items: AdminCollegeSettlementRow[];

  summary: {
    total_colleges: number;
    gross_revenue: number;
    total_college_share: number;
    total_paid: number;
    remaining_payable: number;
    pending_colleges: number;
  };
}

export interface CollegeSettlementDetailData {
  college: CollegeSettlementCollege;
  summary: CollegeSettlementSummary;
  history: CollegeSettlementItem[];
}

export interface CreateCollegeSettlementPayload {
  amount: number;
  payment_date: string;
  payment_mode: CollegeSettlementPaymentMode;
  transaction_reference?: string;
  remarks?: string;
  receipt?: File | null;
}


export interface RoutineItem {
  id: number;
  title: string;
  description?: string | null;
  file_path: string;
  file_url: string | null;
  original_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  status: "active" | "inactive";
  published_at?: string | null;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineListData {
  routines: RoutineItem[];
}

export interface RoutinePayload {
  title: string;
  description?: string;
  status: "active" | "inactive";
  published_at?: string;
  routine_file?: File | null;
}

export const adminService = {
  routines: () =>
    api.get<ApiResponse<RoutineListData>>(
      "/admin/routines",
    ),

  createRoutine: (data: RoutinePayload) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("status", data.status);
    if (data.published_at) {
      formData.append("published_at", data.published_at);
    }
    if (data.routine_file) {
      formData.append("routine_file", data.routine_file);
    }

    return api.post<ApiResponse<{ routine: RoutineItem }>>(
      "/admin/routines",
      formData,
    );
  },

  updateRoutine: (id: number, data: Partial<RoutinePayload>) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description || "");
    if (data.status !== undefined) formData.append("status", data.status);
    if (data.published_at !== undefined) formData.append("published_at", data.published_at || "");
    if (data.routine_file) formData.append("routine_file", data.routine_file);

    return api.put<ApiResponse<{ routine: RoutineItem }>>(
      `/admin/routines/${id}`,
      formData,
    );
  },

  deleteRoutine: (id: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/admin/routines/${id}`,
    ),



  collegeSettlements: (
    params?: {
      search?: string;
      status?: string;
    },
  ) =>
    api.get<
      ApiResponse<AdminCollegeSettlementsData>
    >(
      "/admin/college-payments",
      {
        params,
      },
    ),

  collegeSettlementDetail: (
    collegeId: number,
  ) =>
    api.get<
      ApiResponse<CollegeSettlementDetailData>
    >(
      `/admin/college-payments/${collegeId}`,
    ),

  createCollegeSettlement: (
    collegeId: number,
    data: CreateCollegeSettlementPayload,
  ) => {
    const formData =
      new FormData();

    formData.append(
      "amount",
      String(data.amount),
    );

    formData.append(
      "payment_date",
      data.payment_date,
    );

    formData.append(
      "payment_mode",
      data.payment_mode,
    );

    if (
      data.transaction_reference
    ) {
      formData.append(
        "transaction_reference",
        data.transaction_reference,
      );
    }

    if (data.remarks) {
      formData.append(
        "remarks",
        data.remarks,
      );
    }

    if (data.receipt) {
      formData.append(
        "receipt",
        data.receipt,
      );
    }

    return api.post<
      ApiResponse<{
        settlement:
          CollegeSettlementItem;

        college:
          CollegeSettlementCollege;

        summary:
          CollegeSettlementSummary;
      }>
    >(
      `/admin/college-payments/${collegeId}`,
      formData,
    );
  },




dashboard: () =>
  api.get<
    ApiResponse<AdminDashboardData>
  >(
    "/admin/dashboard",
  ),
report: (params: AdminReportParams) =>
  api.get<ApiResponse<AdminReportData>>(
    "/admin/reports",
    { params },
  ),

exportReport: (
  format: "excel" | "pdf",
  params: AdminReportParams,
) =>
  api.get<Blob>(
    "/admin/reports/export",
    {
      params: {
        ...params,
        format,
      },
      responseType: "blob",
    },
  ),

payments: (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) =>
  api.get<ApiResponse<AdminPaymentsData>>(
    "/admin/payments",
    { params },
  ),

liveClasses: (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    domain_id?: number | string;
    module_id?: number | string;
    chapter_id?: number | string;
    status?: LiveClassStatus | "";
  },
) =>
  api.get<
    ApiResponse<LiveClassListData>
  >(
    "/admin/live-classes",
    { params },
  ),

createLiveClass: (
  data: CreateLiveClassPayload,
) =>
  api.post<
    ApiResponse<LiveClassItem>
  >(
    "/admin/live-classes",
    data,
  ),

updateLiveClass: (
  id: number,
  data:
    Partial<CreateLiveClassPayload> & {
      status?: LiveClassStatus;
    },
) =>
  api.put<
    ApiResponse<LiveClassItem>
  >(
    `/admin/live-classes/${id}`,
    data,
  ),

deleteLiveClass: (
  id: number,
) =>
  api.delete<
    ApiResponse<Record<string, never>>
  >(
    `/admin/live-classes/${id}`,
  ),

  /*
|--------------------------------------------------------------------------
| Admin Messages
|--------------------------------------------------------------------------
*/

messagePaidStudents: (
  search = "",
) =>
  api.get<
    ApiResponse<AdminMessageStudentsData>
  >(
    "/admin/messages/paid-students",
    {
      params: {
        search:
          search || undefined,
      },
    },
  ),

sendStudentMessage: (
  data: SendAdminMessagePayload,
) =>
  api.post<
    ApiResponse<SendAdminMessageResponse>
  >(
    "/admin/messages/send",
    data,
  ),

markPaymentSuccessful: (
  paymentId: number,
  reason: string,
) =>
  api.patch<
    ApiResponse<{
      payment_id: number;
      transaction_id: string;
      payment_status: string;
      student: AdminPaymentStudent;
    }>
  >(
    `/admin/payments/${paymentId}/mark-success`,
    { reason },
  ),

updatePayment: (
  paymentId: number,
  data: Partial<Omit<AdminPaymentRow, "id" | "student_id" | "student" | "can_mark_success">>,
) =>
  api.patch<ApiResponse<AdminPaymentRow>>(
    `/admin/payments/${paymentId}`,
    data,
  ),

generatePaymentReceipt: (paymentId: number) =>
  api.post<
    ApiResponse<{
      payment_id: number;
      transaction_id?: string | null;
      receipt_number: string;
      receipt_file_name: string;
    }>
  >(
    `/admin/payments/${paymentId}/generate-receipt`,
  ),

downloadPaymentReceipt: (paymentId: number) =>
  api.get<Blob>(
    `/admin/payments/${paymentId}/receipt`,
    { responseType: "blob" },
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

 createCollege: (
  data: FormData,
) =>
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
  >(
    "/admin/colleges",
    data,
  ),

  updateCollege: (
  id: number,
  data: FormData,
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
  >(
    `/admin/colleges/${id}`,
    data,
  ),

  approveCollege: (id: number) =>
    api.patch<ApiResponse<College>>(
      `/admin/colleges/${id}/approve`,
    ),

  deleteCollege: (id: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/admin/colleges/${id}`,
    ),

  collegeDomainFees: (
  collegeId: number,
) =>
  api.get<
    ApiResponse<CollegeDomainFeesData>
  >(
    `/admin/colleges/${collegeId}/domain-fees`,
  ),

saveCollegeDomainFees: (
  collegeId: number,
  data: SaveCollegeDomainFeesPayload,
) =>
  api.put<
    ApiResponse<{
      college_id: number;
      saved_count: number;
      default_count: number;
    }>
  >(
    `/admin/colleges/${collegeId}/domain-fees`,
    data,
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

  updateStudent: (
    id: number,
    data: FormData | Record<string, unknown>,
  ) =>
    api.put<ApiResponse<Student>>(
      `/admin/students/${id}`,
      data,
    ),

  deleteStudent: (id: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/admin/students/${id}`,
    ),
  resetStudentPassword: (
    id: number,
    newPassword: string,
  ) =>
    api.patch<
      ApiResponse<{
        student_id: number;
        registration_number: string;
        name?: string | null;
      }>
    >(
      `/admin/students/${id}/password`,
      {
        new_password: newPassword,
      },
    ),
    startStudentInternship: (
  id: number,
  startDate: string,
) =>
  api.patch<
    ApiResponse<{
      student_id: number;
      name: string;
      portal_registration_number?: string | null;
      payment_status: string;
      internship_status: string;
      internship_start_date: string | null;
    }>
  >(
    `/admin/students/${id}/start-internship`,
    {
      start_date: startDate,
    },
  ),
  startStudentInternshipsBulk: (
    studentIds: number[],
    startDate: string,
  ) =>
    api.patch<
      ApiResponse<{
        requested_count: number;
        started_count: number;
        failed_count: number;
        started_ids: number[];
        errors: Array<{
          student_id: number;
          name?: string;
          message: string;
        }>;
      }>
    >(
      "/admin/students/start-internship/bulk",
      {
        student_ids: studentIds,
        start_date: startDate,
      },
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

  chapterResources: (
  chapterId: number,
) =>
  api.get<
    ApiResponse<ChapterResourcesResponse>
  >(
    `/admin/chapters/${chapterId}/resources`,
  ),

createChapterResource: (
  chapterId: number,
  data: CreateChapterResourcePayload,
) =>
  api.post<
    ApiResponse<AdminChapterResource>
  >(
    `/admin/chapters/${chapterId}/resources`,
    createChapterResourceFormData(data),
  ),

updateChapterResource: (
  resourceId: number,
  data: CreateChapterResourcePayload,
) =>
  api.put<
    ApiResponse<AdminChapterResource>
  >(
    `/admin/chapter-resources/${resourceId}`,
    createChapterResourceFormData(data),
  ),

deleteChapterResource: (
  resourceId: number,
) =>
  api.delete<
    ApiResponse<Record<string, never>>
  >(
    `/admin/chapter-resources/${resourceId}`,
  ),

reorderChapterResources: (
  chapterId: number,
  items: Array<{
    id: number;
    sort_order: number;
  }>,
) =>
  api.put<
    ApiResponse<AdminChapterResource[]>
  >(
    `/admin/chapters/${chapterId}/resources/reorder`,
    {
      items,
    },
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

  /*
|--------------------------------------------------------------------------
| Bulk Automation
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Preview
|--------------------------------------------------------------------------
*/

bulkPreview: (
  type: BulkJobType,
  payload: BulkProcessPayload,
) =>
  api.post<
    ApiResponse<BulkPreviewData>
  >(
    "/admin/bulk/preview",
    {
      type,
      payload,
    },
  ),

/*
|--------------------------------------------------------------------------
| Process
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

/*
|--------------------------------------------------------------------------
| Single Job Status
|--------------------------------------------------------------------------
*/

bulkStatus: (
  jobUuid: string,
) =>
  api.get<
    ApiResponse<BulkJob>
  >(
    `/admin/bulk/status/${jobUuid}`,
  ),

/*
|--------------------------------------------------------------------------
| Job History
|--------------------------------------------------------------------------
*/

bulkJobs: (
  params?: {
    page?: number;
    limit?: number;

    type?:
      | BulkJobType
      | "";

    status?:
      | "queued"
      | "running"
      | "completed"
      | "failed"
      | "cancelled"
      | "";
  },
) =>
  api.get<
    ApiResponse<
      PaginatedData<BulkJob>
    >
  >(
    "/admin/bulk/jobs",
    {
      params,
    },
  ),

/*
|--------------------------------------------------------------------------
| Cancel
|--------------------------------------------------------------------------
*/

cancelBulk: (
  jobUuid: string,
) =>
  api.post<
    ApiResponse<BulkJob>
  >(
    `/admin/bulk/${jobUuid}/cancel`,
  ),

/*
|--------------------------------------------------------------------------
| Retry
|--------------------------------------------------------------------------
*/

retryBulk: (
  jobUuid: string,
) =>
  api.post<
    ApiResponse<BulkProcessResponse>
  >(
    `/admin/bulk/${jobUuid}/retry`,
  ),

  quizzes: (
  params?: QuizListParams,
) =>
  api.get<
    ApiResponse<
      PaginatedData<AdminQuiz>
    >
  >("/admin/quizzes", {
    params,
  }),

quizById: (
  id: number,
) =>
  api.get<
    ApiResponse<AdminQuiz>
  >(`/admin/quizzes/${id}`),

createQuiz: (
  data: CreateQuizPayload,
) =>
  api.post<
    ApiResponse<AdminQuiz>
  >("/admin/quizzes", data),

updateQuiz: (
  id: number,
  data: UpdateQuizPayload,
) =>
  api.put<
    ApiResponse<AdminQuiz>
  >(`/admin/quizzes/${id}`, data),

deleteQuiz: (
  id: number,
) =>
  api.delete<
    ApiResponse<{
      id: number;
    }>
  >(`/admin/quizzes/${id}`),


  importQuizFromExcel: (
  chapterId: number,
  data: {
    file: File;
    title: string;
    description?: string;
    passing_score?: number;
    attempts_allowed?: number;
    time_limit_minutes?: number;
    randomize_questions?: boolean;
    show_result_immediately?: boolean;
    status?: QuizStatus;
  },
) => {
  const formData = new FormData();

  formData.append("file", data.file);
  formData.append("chapter_id", String(chapterId));
  formData.append("title", data.title);

  if (data.description)
    formData.append("description", data.description);

  if (data.passing_score !== undefined)
    formData.append("passing_score", String(data.passing_score));

  if (data.attempts_allowed !== undefined)
    formData.append("attempts_allowed", String(data.attempts_allowed));

  if (
    data.time_limit_minutes !== undefined &&
    data.time_limit_minutes !== null
  )
    formData.append("time_limit_minutes", String(data.time_limit_minutes));

  if (data.randomize_questions !== undefined)
    formData.append("randomize_questions", String(data.randomize_questions));

  if (data.show_result_immediately !== undefined)
    formData.append("show_result_immediately", String(data.show_result_immediately));

  if (data.status)
    formData.append("status", data.status);

  return api.post<ApiResponse<{ quiz: AdminQuiz; import_summary: any }>>(
    "/admin/quizzes/import",
    formData,
  );
},

quizReattempts: () =>
  api.get<
    ApiResponse<QuizReattemptListData>
  >("/admin/quiz-reattempts"),

grantQuizReattempt: (
  studentId: number,
  quizId: number,
  data: {
    extra_attempts?: number;
    reason?: string;
  },
) =>
  api.post(
    `/admin/students/${studentId}/quizzes/${quizId}/reattempt`,
    data,
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

    // Backward-compatible alias. Backend now fills this from actual successful payments.
    estimated_revenue: number;

    // Actual successful payment revenue.
    gross_revenue: number;
    successful_payments: number;
    revenue_source: string;

    college_share_percentage: number;
    rknexora_share_percentage: number;

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

  // Actual revenue grouped by internship domain.
  domain_revenue_distribution: Array<{
    domain_id: number;
    domain_name: string;
    student_count: number;
    paid_students: number;
    gross_revenue: number;
    college_share_amount: number;
    rknexora_share_amount: number;
  }>;

  // Last 12 months actual successful payment revenue.
  monthly_revenue: Array<{
    key: string;
    month: string;
    year: number;
    label: string;
    successful_payments: number;
    gross_revenue: number;
    college_share_amount: number;
    rknexora_share_amount: number;
  }>;

  session_distribution: Array<{
    session: string;
    student_count: number;
  }>;

  recent_students:
    CollegeDashboardStudent[];
}

export const collegeService = {

  payments: () =>
    api.get<
      ApiResponse<CollegeSettlementDetailData>
    >(
      "/college/payments",
    ),


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

  resetStudentPassword: (
    studentId: number,
    newPassword: string,
  ) =>
    api.patch<
      ApiResponse<{
        student_id: number;
        registration_number: string;
        name?: string | null;
      }>
    >(
      `/college/students/${studentId}/password`,
      {
        new_password: newPassword,
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

export interface MentorDashboardData {
  mentor: {
    id: number;
    name: string;
    employee_id: string;
    designation?: string | null;
    department?: string | null;
    domain_id?: number | null;
    college_id?: number | null;
  };
  summary: {
    total_students: number;
    active_students: number;
    completed_students: number;
    average_progress: number;
    pending_reviews: number;
    assessments_submitted: number;
    assessments_pending: number;
    failed_quiz_exhausted: number;
  };
  recent_students: Array<{
    id: number;
    name: string;
    registration_number: string;
    internship_status: string;
    total_progress?: number | string | null;
    college?: { id: number; name: string; code?: string | null } | null;
    domain?: { id: number; domain_name: string } | null;
  }>;
}

export interface QuizReattemptItem {
  student: {
    id: number;
    name: string;
    registration_number: string;
    internship_status?: string;
  };
  quiz: {
    id: number;
    chapter_id: number;
    title: string;
    passing_score: number;
    attempts_allowed: number;
  };
  attempts_used: number;
  extra_attempts: number;
  total_attempts_allowed: number;
  latest_score: number;
  latest_attempt_id?: number | null;
  latest_attempt_number?: number | null;
}

export interface QuizReattemptListData {
  items: QuizReattemptItem[];
  total: number;
}

export interface MentorQuizChapterOption {
  id: number;
  module_id: number;
  chapter_number: number;
  chapter_name: string;
  status: string;
  module?: {
    id: number;
    domain_id: number;
    module_number: number;
    module_name: string;
  } | null;
  quiz?: {
    id: number;
    chapter_id: number;
    title: string;
    status: string;
  } | null;
}


export interface MentorResourceChapterOption {
  id: number;
  module_id: number;
  chapter_number: number;
  chapter_name: string;
  status: string;
  module?: {
    id: number;
    domain_id: number;
    module_number: number;
    module_name: string;
  } | null;
}

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
  dashboard: () =>
    api.get<
      ApiResponse<MentorDashboardData>
    >("/mentor/dashboard"),

  students: (
    params?: MentorStudentParams,
  ) =>
    api.get<
      ApiResponse<MentorAssignedStudentsData>
    >(
      "/mentor/students",
      { params },
    ),

  review: (
    submissionId: number,
    data: MentorReviewPayload,
  ) =>
    api.patch(
      `/mentor/submissions/${submissionId}/review`,
      data,
    ),

  assessment: (
    studentId: number,
    data: MentorAssessmentPayload & { assessment_type?: "midterm" | "final" },
  ) =>
    api.post(
      `/mentor/students/${studentId}/assessment`,
      data,
    ),


  resourceChapters: () =>
    api.get<
      ApiResponse<{ items: MentorResourceChapterOption[] }>
    >("/mentor/resource-chapters"),

  chapterResources: (chapterId: number) =>
    api.get<
      ApiResponse<ChapterResourcesResponse>
    >(`/mentor/chapters/${chapterId}/resources`),

  createChapterResource: (
    chapterId: number,
    data: CreateChapterResourcePayload,
  ) =>
    api.post<ApiResponse<AdminChapterResource>>(
      `/mentor/chapters/${chapterId}/resources`,
      createChapterResourceFormData(data),
    ),

  updateChapterResource: (
    resourceId: number,
    data: CreateChapterResourcePayload,
  ) =>
    api.put<ApiResponse<AdminChapterResource>>(
      `/mentor/chapter-resources/${resourceId}`,
      createChapterResourceFormData(data),
    ),

  deleteChapterResource: (resourceId: number) =>
    api.delete<ApiResponse<Record<string, never>>>(
      `/mentor/chapter-resources/${resourceId}`,
    ),

  reorderChapterResources: (
    chapterId: number,
    items: Array<{ id: number; sort_order: number }>,
  ) =>
    api.put<ApiResponse<AdminChapterResource[]>>(
      `/mentor/chapters/${chapterId}/resources/reorder`,
      { items },
    ),

  quizzes: (params?: QuizListParams) =>
    api.get<
      ApiResponse<PaginatedData<AdminQuiz>>
    >(
      "/mentor/quizzes",
      { params },
    ),

  quizById: (id: number) =>
    api.get<ApiResponse<AdminQuiz>>(
      `/mentor/quizzes/${id}`,
    ),

  quizChapters: () =>
    api.get<
      ApiResponse<{ items: MentorQuizChapterOption[] }>
    >("/mentor/quiz-chapters"),

  createQuiz: (data: CreateQuizPayload) =>
    api.post<ApiResponse<AdminQuiz>>(
      "/mentor/quizzes",
      data,
    ),

  updateQuiz: (
    id: number,
    data: UpdateQuizPayload,
  ) =>
    api.put<ApiResponse<AdminQuiz>>(
      `/mentor/quizzes/${id}`,
      data,
    ),

  deleteQuiz: (id: number) =>
    api.delete(
      `/mentor/quizzes/${id}`,
    ),

  quizReattempts: () =>
    api.get<
      ApiResponse<QuizReattemptListData>
    >("/mentor/quiz-reattempts"),

  grantQuizReattempt: (
    studentId: number,
    quizId: number,
    data: {
      extra_attempts?: number;
      reason?: string;
    },
  ) =>
    api.post(
      `/mentor/students/${studentId}/quizzes/${quizId}/reattempt`,
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

internship_start_date?:
  string | null;

internship_end_date?:
  string | null;
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

    completed_chapters: number;
    total_chapters: number;
    remaining_chapters: number;

    learning_hours: number;
    required_hours: number;
    hours_remaining: number;

    logbook_hours: number;
    logbook_entries: number;

    assignments_total: number;
    assignments_submitted: number;
    assignments_completed: number;
    assignment_progress: number;

    total_quizzes: number;
    quizzes_passed: number;
    quizzes_remaining: number;
    quiz_progress: number;
    quiz_average: number;
    total_quiz_attempts: number;
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

  eligibility: {
  eligible: boolean;

  checks: {
     chapters_completed: boolean;
  quizzes_passed: boolean;
  assignments_completed: boolean;

  required_hours_completed: boolean;
  attendance_completed: boolean;

  project_approved: boolean;
  report_approved: boolean;
  };

  progress: {
    chapters: {
      total: number;
      completed: number;
      percentage: number;
    };

    quizzes: {
      total: number;
      passed: number;
      percentage: number;
    };

    assignments: {
      total: number;
      approved: number;
      percentage: number;
    };

    learning_hours: {
  required: number;
  completed: number;
  remaining: number;
  percentage: number;
};

attendance: {
  total_days: number;
  effective_present_days: number;
  percentage: number;
  minimum_required: number;
};
  };
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

export interface StudentChapterResource {
  id: number;
  chapter_id: number;

  title: string;

  resource_type:
    | "video"
    | "pdf"
    | "ppt"
    | "document"
    | "image"
    | "audio"
    | "text"
    | "link"
    | "zip"
    | "source_code"
    | "other";

  file_url?: string | null;
  external_url?: string | null;
  text_content?: string | null;

  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | string | null;

  duration_seconds?: number | null;

  sort_order: number;

  is_downloadable: boolean;
  is_primary: boolean;

  status: "active" | "inactive";
}

export interface StudentChapterQuiz {
  id: number;
  chapter_id: number;

  title: string;
  description?: string | null;

  passing_score: number;
  total_marks: number;

  attempts_allowed: number;
  attempts_used: number;
  attempts_remaining: number;

  time_limit_minutes?: number | null;

  randomize_questions: boolean;
  show_result_immediately: boolean;

  status:
    | "draft"
    | "active"
    | "inactive";

  passed: boolean;

  can_start: boolean;

  active_attempt_id:
    | number
    | null;

  best_score:
    | number
    | null;

  best_attempt_id:
    | number
    | null;

  latest_attempt:
    | {
        id: number;
        attempt_number: number;
        percentage: number;
        passed: boolean;
        status:
          | "in_progress"
          | "submitted"
          | "expired";
      }
    | null;
}

export interface StudentChapter {
  id: number;
  module_id: number;

  chapter_number: number;
  chapter_name: string;

  description?: string | null;

  duration_minutes?: number;

  is_preview?: boolean;

  status?: string;

  unlocked: boolean;
  completed: boolean;

  resources: StudentChapterResource[];

  resource_count: number;

  quiz?: StudentChapterQuiz | null;

  has_quiz?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface StudentQuizOption {
  id: string;
  text: string;
}

export interface StudentQuizQuestion {
  id: string;
  question: string;
  options: StudentQuizOption[];
  marks: number;
}

export interface StudentQuizSummary {
  id: number;
  chapter_id: number;
  title: string;
  description?: string | null;
  passing_score: number;
  total_marks: number;
  attempts_allowed: number;
  time_limit_minutes?: number | null;
  question_count: number;
}

export interface StudentQuizAttemptInfo {
  id: number;
  attempt_number: number;
  started_at: string;
  expires_at?: string | null;
  status: "in_progress" | "submitted" | "expired";
}

export interface StudentQuizStartData {
  attempt: StudentQuizAttemptInfo;
  quiz: StudentQuizSummary;
  questions: StudentQuizQuestion[];
}

export interface StudentQuizSubmitPayload {
  answers: Array<{
    question_id: string;
    selected_option_id: string | null;
  }>;
}

export interface StudentQuizResultAnswer {
  question_id: string;
  question: string;
  options: StudentQuizOption[];
  selected_option_id: string | null;
  correct_option_id: string;
  is_correct: boolean;
  marks_allocated: number;
  marks_obtained: number;
  explanation?: string | null;
}

export interface StudentQuizResultData {
  attempt: {
    id: number;
    attempt_number: number;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    passing_score: number;
    passed: boolean;
    status: "submitted" | "expired";
    started_at: string;
    submitted_at?: string | null;
    expires_at?: string | null;
    time_taken_seconds?: number | null;
  };
  quiz: {
    id: number;
    title: string;
    description?: string | null;
    chapter_id: number;
  };
  answers?: StudentQuizResultAnswer[];
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
    total_modules: number;

    total_chapters: number;
    completed_chapters: number;
    remaining_chapters: number;

    progress_percentage: number;

    total_quizzes: number;
    quizzes_passed: number;
    quizzes_remaining: number;

    quiz_progress_percentage: number;

    average_quiz_score: number;
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
  currency: string;

  transaction_id: string;

  cashfree_order_id?: string | null;
  cf_payment_id?: string | null;

  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;

  gateway?: string | null;
  status: string;

  paid_at?: string | null;
  created_at?: string | null;

  receipt_number?: string | null;
  receipt_generated_at?: string | null;
  receipt_available: boolean;
  receipt_download_url?: string | null;
}

export interface StudentPaymentsData {
  payments: StudentPayment[];

  summary: {
    total_transactions: number;
    successful_transactions: number;
    total_paid: number;
    payment_status: string;
  };
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

export interface StudentVideoProgress {
  resource_id: number;
  chapter_id: number;
  duration_seconds: number;
  watched_seconds: number;
  last_position_seconds: number;
  progress_percentage: number;
  completion_required_percentage: number;
  is_completed: boolean;
}

export interface StudentChapterRequirements {
  can_mark_complete: boolean;
  is_empty_chapter(is_empty_chapter: any): import("react").SetStateAction<boolean>;
  chapter_id: number;
  video_completion_required_percentage: number;
  live_attendance_required_percentage: number;
  videos: Array<{
    resource_id: number; title: string; duration_seconds: number;
    watched_seconds: number; last_position_seconds: number;
    progress_percentage: number; is_completed: boolean;
  }>;
  live_classes: Array<{
    live_class_id: number; title: string; scheduled_at: string;
    duration_seconds: number; attended_seconds: number;
    attendance_percentage: number; is_completed: boolean;
  }>;
  summary: {
    total_video_resources: number; completed_video_resources: number;
    total_live_classes: number; completed_live_classes: number;
    videos_complete: boolean; live_classes_complete: boolean;
    learning_requirements_complete: boolean;
  };
  chapter_engagement?: {
  required?: boolean;

  required_seconds?: number;

  // Backend/UI compatibility
  engaged_seconds?: number;
  completed_seconds?: number;

  remaining_seconds?: number;

  is_completed?: boolean;
  completed?: boolean;
};
}



export const studentService = {
  routines: () =>
    api.get<ApiResponse<RoutineListData>>(
      "/student/routines",
    ),


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

    upcomingLiveClasses: () =>
  api.get<
    ApiResponse<StudentUpcomingLiveClasses>
  >(
    "/student/live-classes/upcoming",
  ),

  videoProgress: (resourceId: number) =>
  api.get<ApiResponse<StudentVideoProgress>>(`/student/learning/resources/${resourceId}/progress`),

videoHeartbeat: (resourceId: number, payload: {
  position_seconds: number; duration_seconds: number; playing: boolean; visible: boolean;
}) => api.post<ApiResponse<StudentVideoProgress>>(
  `/student/learning/resources/${resourceId}/heartbeat`, payload,
),

chapterRequirements: (chapterId: number) =>
  api.get<ApiResponse<StudentChapterRequirements>>(`/student/chapters/${chapterId}/requirements`),

chapterEngagementHeartbeat: (
  chapterId: number,
  visible: boolean,
) =>
  api.post(
    `/student/chapters/${chapterId}/engagement/heartbeat`,
    {
      visible,
    },
  ),


joinLiveClass: (liveClassId: number) =>
  api.post(`/student/live-classes/${liveClassId}/join`),

liveClassHeartbeat: (liveClassId: number, sessionToken: string) =>
  api.post(`/student/live-classes/${liveClassId}/heartbeat`, { session_token: sessionToken }),

leaveLiveClass: (liveClassId: number, sessionToken: string) =>
  api.post(`/student/live-classes/${liveClassId}/leave`, { session_token: sessionToken }),


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

  quizDetails: (quizId: number) =>
  api.get(`/student/quizzes/${quizId}`),

startQuiz: (quizId: number) =>
  api.post<ApiResponse<StudentQuizStartData>>(
    `/student/quizzes/${quizId}/start`,
  ),

submitQuiz: (
  attemptId: number,
  payload: StudentQuizSubmitPayload,
) =>
  api.post<ApiResponse<StudentQuizResultData>>(
    `/student/quiz-attempts/${attemptId}/submit`,
    payload,
  ),

quizAttemptResult: (attemptId: number) =>
  api.get<ApiResponse<StudentQuizResultData>>(
    `/student/quiz-attempts/${attemptId}/result`,
  ),

quizAttempts: (quizId: number) =>
  api.get(
    `/student/quizzes/${quizId}/attempts`,
  ),


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
    ApiResponse<StudentPaymentsData>
  >(
    "/student/payments",
  ),

paymentById: (
  paymentId: number,
) =>
  api.get<
    ApiResponse<{
      payment: StudentPayment;
    }>
  >(
    `/student/payments/${paymentId}`,
  ),

downloadPaymentReceipt: (
  paymentId: number,
) =>
  api.get(
    `/student/payments/${paymentId}/receipt`,
    {
      responseType: "blob",
    },
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
  portal_registration_number?: string | null;


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
  portal_registration_number?: string | null;
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
  portal_registration_number?: string | null;
  registration_locked: boolean;
  payment_status?: string;
  next_step:
    | "payment"
    | "login";
}

export interface PaymentOrderStudent {
  id: number;
  name: string;
  email?: string | null;
  mobile?: string | null;
  registration_number: string;
  portal_registration_number?: string | null;
}

export interface PaymentOrderDomain {
  id: number;
  domain_name: string;
}

export interface CashfreeOrderResponse {
  gateway: "cashfree";
  order_id: string;
  cf_order_id?: string | number | null;
  payment_session_id: string;
  transaction_id?: string | null;
  amount: number;
  currency: string;
  student: PaymentOrderStudent;
  domain: PaymentOrderDomain;
}

export interface RazorpayOrderResponse {
  gateway: "razorpay";
  key_id: string;
  order_id: string;
  razorpay_order_id: string;
  transaction_id?: string | null;

  /*
   * Razorpay Checkout receives amount
   * in currency subunits (paise).
   */
  amount: number;
  amount_rupees: number;
  currency: string;

  student: PaymentOrderStudent;
  domain: PaymentOrderDomain;
}

export type PaymentOrderResponse =
  | CashfreeOrderResponse
  | RazorpayOrderResponse;

export interface CashfreeVerificationPayload {
  gateway?: "cashfree";
  order_id: string;
}

export interface RazorpayVerificationPayload {
  gateway: "razorpay";
  student_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type PaymentVerificationPayload =
  | CashfreeVerificationPayload
  | RazorpayVerificationPayload;

export interface PaymentVerificationResponse {
  cf_payment_id: string | null | undefined;
  gateway?: "cashfree" | "razorpay";
  order_id: string;
  cf_order_id?: string | number | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;

  transaction_id?: string | null;

  portal_registration_number?:
    | string
    | null;

  order_status?: string;

  payment_status:
    | "paid"
    | "pending"
    | "processing"
    | "failed";

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

  domains: (
    registrationNumber: string,
  ) =>
    publicApi.get<
      ApiResponse<Domain[]>
    >(
      "/registration/domains",
      {
        params: {
          registration_number:
            registrationNumber,
        },
      },
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
    publicApi.post<
      ApiResponse<PaymentOrderResponse>
    >(
      "/registration/payment/order",
      {
        student_id:
          studentId,
      },
    ),

  /*
   * Backward compatible:
   * - Existing Cashfree status page can still call:
   *     verifyPayment(orderId)
   * - Razorpay registration page calls:
   *     verifyPayment({ gateway: "razorpay", ... })
   */
  verifyPayment: async (
    payload:
      | string
      | PaymentVerificationPayload,
  ) => {
    const requestPayload =
      typeof payload === "string"
        ? {
            order_id: payload,
          }
        : payload;

    const isRazorpayRequest =
      typeof payload !== "string" &&
      payload.gateway === "razorpay";

    /*
     * Cashfree ka existing flow same rahega.
     * Retry sirf Razorpay ke liye hai because
     * callback ke turant baad payment kabhi
     * authorized hota hai aur thodi der baad
     * captured hota hai.
     */
    if (!isRazorpayRequest) {
      return publicApi.post<
        ApiResponse<PaymentVerificationResponse>
      >(
        "/registration/payment/verify",
        requestPayload,
      );
    }

    const maxAttempts = 5;
    const retryDelayMs = 2000;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(
          resolve,
          ms,
        );
      });

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt += 1
    ) {
      try {
        const response =
          await publicApi.post<
            ApiResponse<PaymentVerificationResponse>
          >(
            "/registration/payment/verify",
            requestPayload,
          );

        const paymentStatus =
          String(
            response.data?.data
              ?.payment_status ||
              "",
          ).toLowerCase();

        if (
          paymentStatus === "paid" ||
          paymentStatus === "failed" ||
          attempt === maxAttempts
        ) {
          return response;
        }

        await wait(
          retryDelayMs,
        );
      } catch (error: unknown) {
        const status =
          (
            error as {
              response?: {
                status?: number;
              };
            }
          ).response?.status;

        const retryable =
          !status ||
          status === 408 ||
          status === 429 ||
          status >= 500;

        if (
          !retryable ||
          attempt === maxAttempts
        ) {
          throw error;
        }

        await wait(
          retryDelayMs,
        );
      }
    }

    throw new Error(
      "Unable to verify Razorpay payment",
    );
  },

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
