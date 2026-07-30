export type Role =
  | "super_admin"
  | "admin"
  | "college_admin"
  | "mentor"
  | "student";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  status: "active" | "inactive" | "blocked" | "pending";
  college_id?: number | null;
  collegeId?: number | null;
  name?: string;
}

export interface College {
  id: number;
  name: string;
  code: string;
  university: string;
  principal_name: string;
  coordinator_name: string;
  email?: string;
  mobile?: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  logo?: string | null;
  college_share: number;
  rknexora_share: number;
  status: "active" | "inactive";
}

export interface Student {
  id: number;
  college_id: number;
  registration_number: string;
  student_id: string;
  name: string;
  father_name: string;
  gender: "male" | "female" | "other";
  dob: string;
  programme: string;
  major_subject: string;
  session: string;
  semester: string;
  mobile: string;
  email: string;
  photo?: string;
  registration_date: string;
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
  domain_id?: number;
  progress?: number;
  attendance?: number;
  batch_id?: number | null;
mentor_id?: number | null;

internship_start_date?: string | null;
internship_end_date?: string | null;

total_progress?: number | string;

certificate_generated?: boolean;
certificate_url?: string | null;
}

export interface Mentor {
  id: number;
  name: string;
  employee_id: string;
  designation: string;
  department: string;
  specialization: string;
  mobile: string;
  email: string;
  qualification: string;
  profile_photo?: string;
  status?: "active" | "inactive";
  domain_id?: number | null;
college_id?: number | null;
}

export interface Domain {
  id: number;
  sector_id: number;
  domain_name: string;
  fee: number;
  duration_hours: number;
}

export interface LearningModule {
  id: number;
  domain_id: number;
  module_number: number;
  module_name: string;
  progress: number;
  locked: boolean;
  chapters: Chapter[];
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

export interface ChapterResource {
  id: number;
  chapter_id: number;

  title: string;

  resource_type: ChapterResourceType;

  file_url?: string | null;
  external_url?: string | null;
  text_content?: string | null;

  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;

  sort_order: number;

  is_downloadable: boolean;
  is_primary: boolean;

  status: "active" | "inactive";
}

export interface Chapter {
  id: number;
  module_id: number;
  chapter_number: number;
  chapter_name: string;
  content_type: "video" | "pdf" | "text" | "link";
  resources?: ChapterResource[];
  content_url: string;
  completed: boolean;
  locked: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeInternships: number;
  pendingTasks: number;
  completionRate: number;
}

export type BulkJobType =
  | "attendance"
  | "complete_learning"
  | "complete_internship"
  | "assessment"
  | "publish_results"
  | "acceptance_letters"
  | "internship_reports"
  | "attendance_sheets"
  | "log_books"
  | "certificates"
  | "zip_documents"
  | "full_internship_process";


export type BulkJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";


export interface BulkProcessPayload {
  college_id?: number;
  sector_id?: number;
  domain_id?: number;

  session?: string;
  semester?: string;

  batch_id?: number;
  mentor_id?: number;

  student_ids?: number[];

  start_date?: string;
  end_date?: string;

  login_time?: string;
  logout_time?: string;

  learning_hours?: number;

  status?:
    | "present"
    | "absent"
    | "leave"
    | "half_day";

  excluded_days?: number[];

  holidays?: string[];

  completed_at?: string;

  assessed_at?: string;

  published_at?: string;

  generated_at?: string;

  issued_date?: string;

  assessment_type?:
    | "midterm"
    | "final";

  technical_knowledge?: number;

  quality_of_work?: number;

  initiative?: number;

  communication?: number;

  professional_conduct?: number;

  pass_percentage?: number;

  supervisor_remarks?: string;

  result_remarks?: string;

  certificate_prefix?: string;

  daily_activity?: string;

  skills?: string;

  report_summary?: string;

  module_ids?: number[];

  chapter_ids?: number[];

  stop_on_error?: boolean;
}


export interface BulkProcessResponse {
  job_uuid: string;

  type: BulkJobType;

  status: BulkJobStatus;
}


export interface BulkPreviewStudent {
  id: number;

  registration_number: string;

  student_id?:
    | string
    | null;

  name: string;

  college_id?:
    | number
    | null;

  domain_id?:
    | number
    | null;

  batch_id?:
    | number
    | null;

  mentor_id?:
    | number
    | null;

  internship_status?:
    string;

  payment_status?:
    string;

  college?: {
    id: number;
    name: string;
  } | null;

  domain?: {
    id: number;
    name: string;
  } | null;
}


export interface BulkPreviewData {
  type: BulkJobType;

  matched_students: number;

  working_days:
    | number
    | null;

  estimated_records: number;

  sample:
    BulkPreviewStudent[];
}


export interface BulkJobResult {
  zip_url?:
    | string
    | null;

  completed_steps?: number;

  failed_steps?: number;

  completed?: Array<{
    name: string;
    result?: unknown;
  }>;

  failed?: Array<{
    name: string;
    error?: string;
  }>;

  [key: string]:
    unknown;
}


export interface BulkJob {
  id?: number;

  job_uuid: string;

  type: BulkJobType;

  status: BulkJobStatus;

  current_step?:
    | string
    | null;

  progress:
    | number
    | string;

  processed?: number;

  total?: number;

  success_count?: number;

  failed_count?: number;

  cancel_requested?: boolean;

  payload?:
    | BulkProcessPayload
    | null;

  result?:
    | BulkJobResult
    | null;

  error_message?:
    | string
    | null;

  created_by?:
    | number
    | null;

  started_at?:
    | string
    | null;

  finished_at?:
    | string
    | null;

  created_at?: string;

  updated_at?: string;
}