"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Edit3,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import {
  adminService,
  type AdminDomain,
} from "@/lib/services";

import type {
  College,
  Student,
} from "@/types";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface StudentWithRelations {
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
  semester?: string | number | null;

  mobile?: string | null;
  email?: string | null;
  photo?: string | null;

  college_id?: number | null;
  domain_id?: number | null;
  batch_id?: number | null;
  mentor_id?: number | null;

  internship_status: string;
  payment_status: string;

  internship_start_date?: string | null;
  internship_end_date?: string | null;

  college?: {
    id: number;
    name: string;
    code?: string | null;
    university?: string | null;
  } | null;

  domain?: {
    id: number;
    domain_name: string;
    fee?: number | string;
    duration_hours?: number;
  } | null;
}

interface StudentFormData {
  registration_number: string;
  student_id: string;

  name: string;
  father_name: string;
  gender: string;
  dob: string;

  programme: string;
  major_subject: string;
  session: string;
  semester: string;

  mobile: string;
  email: string;

  college_id: string;
  domain_id: string;

  internship_status: string;
  payment_status: string;

  internship_start_date: string;
  internship_end_date: string;
}

/*
|--------------------------------------------------------------------------
| Initial state
|--------------------------------------------------------------------------
*/

const initialFormData: StudentFormData = {
  registration_number: "",
  student_id: "",

  name: "",
  father_name: "",
  gender: "",
  dob: "",

  programme: "",
  major_subject: "",
  session: "",
  semester: "",

  mobile: "",
  email: "",

  college_id: "",
  domain_id: "",

  internship_status: "preloaded",
  payment_status: "pending",

  internship_start_date: "",
  internship_end_date: "",
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getStudentPhotoUrl = (
  photo?: string | null,
) => {
  if (!photo) {
    return null;
  }

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://")
  ) {
    return photo;
  }

  const backendBaseUrl = String(
    process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api",
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  return `${backendBaseUrl}${
    photo.startsWith("/")
      ? photo
      : `/${photo}`
  }`;
};

const formatDateForInput = (
  value?: string | null,
) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

const createFormData = (
  student: StudentWithRelations,
): StudentFormData => ({
  registration_number:
    student.registration_number || "",

  student_id:
    student.student_id || "",

  name:
    student.name || "",

  father_name:
    student.father_name || "",

  gender:
    student.gender || "",

  dob:
    formatDateForInput(
      student.dob,
    ),

  programme:
    student.programme || "",

  major_subject:
    student.major_subject || "",

  session:
    student.session || "",

  semester:
    student.semester !== null &&
    student.semester !== undefined
      ? String(student.semester)
      : "",

  mobile:
    student.mobile || "",

  email:
    student.email || "",

  college_id:
    student.college_id
      ? String(student.college_id)
      : student.college?.id
        ? String(student.college.id)
        : "",

  domain_id:
    student.domain_id
      ? String(student.domain_id)
      : student.domain?.id
        ? String(student.domain.id)
        : "",

  internship_status:
    student.internship_status ||
    "preloaded",

  payment_status:
    student.payment_status ||
    "pending",

  internship_start_date:
    formatDateForInput(
      student.internship_start_date,
    ),

  internship_end_date:
    formatDateForInput(
      student.internship_end_date,
    ),
});

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function StudentDetailsPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router = useRouter();

  const studentId =
    Number(params.id);

  const [
    student,
    setStudent,
  ] =
    useState<StudentWithRelations | null>(
      null,
    );

  const [
    formData,
    setFormData,
  ] =
    useState<StudentFormData>(
      initialFormData,
    );

  const [
    colleges,
    setColleges,
  ] = useState<College[]>([]);

  const [
    domains,
    setDomains,
  ] = useState<AdminDomain[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load student and dropdown data
  |--------------------------------------------------------------------------
  */

  const loadData =
    useCallback(
      async () => {
        if (
          !studentId ||
          Number.isNaN(studentId)
        ) {
          toast.error(
            "Invalid student ID",
          );

          router.push(
            "/admin/students",
          );

          return;
        }

        try {
          setLoading(true);

          const [
            studentResponse,
            collegesResponse,
            domainsResponse,
          ] = await Promise.all([
            adminService.studentById(
              studentId,
            ),

            adminService.colleges({
              page: 1,
              limit: 100,
            }),

            adminService.domains({
              page: 1,
              limit: 100,
            }),
          ]);

          const studentData =
            studentResponse.data
              .data as StudentWithRelations;

          setStudent(studentData);

          setFormData(
            createFormData(
              studentData,
            ),
          );

          setColleges(
            collegesResponse.data.data
              .items || [],
          );

          setDomains(
            domainsResponse.data.data
              .items || [],
          );
        } catch (error: any) {
          toast.error(
            error?.response?.data
              ?.message ??
              "Unable to load student",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        router,
        studentId,
      ],
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /*
  |--------------------------------------------------------------------------
  | Form helpers
  |--------------------------------------------------------------------------
  */

  const updateField = (
    field:
      keyof StudentFormData,
    value: string,
  ) => {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  const handleCancel = () => {
    if (student) {
      setFormData(
        createFormData(student),
      );
    }

    setEditMode(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(
        "Student name is required",
      );

      return false;
    }

    if (
      !formData
        .registration_number
        .trim()
    ) {
      toast.error(
        "Registration number is required",
      );

      return false;
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email,
      )
    ) {
      toast.error(
        "Enter a valid email address",
      );

      return false;
    }

    if (
      formData.mobile &&
      !/^[0-9]{10}$/.test(
        formData.mobile,
      )
    ) {
      toast.error(
        "Mobile number must contain 10 digits",
      );

      return false;
    }

    if (
      formData
        .internship_start_date &&
      formData
        .internship_end_date &&
      formData
        .internship_end_date <
        formData
          .internship_start_date
    ) {
      toast.error(
        "Internship end date cannot be before start date",
      );

      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Save changes
  |--------------------------------------------------------------------------
  */

  const handleSave =
    async () => {
      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);

        const payload = {
          registration_number:
            formData
              .registration_number
              .trim(),

          student_id:
            formData.student_id
              .trim() || null,

          name:
            formData.name.trim(),

          father_name:
            formData.father_name
              .trim() || null,

          gender:
            formData.gender ||
            null,

          dob:
            formData.dob ||
            null,

          programme:
            formData.programme
              .trim() || null,

          major_subject:
            formData.major_subject
              .trim() || null,

          session:
            formData.session
              .trim() || null,

          semester:
            formData.semester
              .trim() || null,

          mobile:
            formData.mobile
              .trim() || null,

          email:
            formData.email
              .trim() || null,

          college_id:
            formData.college_id
              ? Number(
                  formData.college_id,
                )
              : null,

          domain_id:
            formData.domain_id
              ? Number(
                  formData.domain_id,
                )
              : null,

          internship_status:
            formData
              .internship_status,

          payment_status:
            formData
              .payment_status,

          internship_start_date:
            formData
              .internship_start_date ||
            null,

          internship_end_date:
            formData
              .internship_end_date ||
            null,
        };

        const response =
          await adminService.updateStudent(
            studentId,
            payload,
          );

        const updatedStudent =
          response.data
            .data as StudentWithRelations;

        /*
         * Backend generic update response me
         * relations nahi ho sakte, isliye
         * details dobara load karenge.
         */

        setStudent(
          updatedStudent,
        );

        toast.success(
          response.data.message ||
            "Student updated successfully",
        );

        setEditMode(false);

        await loadData();
      } catch (error: any) {
        toast.error(
          error?.response?.data
            ?.message ??
            "Unable to update student",
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Selected relations
  |--------------------------------------------------------------------------
  */

  const selectedCollege =
    useMemo(
      () =>
        colleges.find(
          (college) =>
            String(college.id) ===
            formData.college_id,
        ),
      [
        colleges,
        formData.college_id,
      ],
    );

  const selectedDomain =
    useMemo(
      () =>
        domains.find(
          (domain) =>
            String(domain.id) ===
            formData.domain_id,
        ),
      [
        domains,
        formData.domain_id,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading student details...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Not found
  |--------------------------------------------------------------------------
  */

  if (!student) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <UserRound className="mx-auto h-12 w-12 text-slate-300" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Student not found
          </h2>

          <Button
            type="button"
            className="mt-5"
            onClick={() =>
              router.push(
                "/admin/students",
              )
            }
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Details"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/admin/students",
                )
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {!editMode ? (
              <Button
                type="button"
                onClick={() =>
                  setEditMode(true)
                }
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Student
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={
                    handleCancel
                  }
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void handleSave()
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Student summary */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <StudentPhoto
  photo={student.photo}
  name={student.name}
/>

              <div>
                <h1 className="text-2xl font-bold">
                  {student.name}
                </h1>

                <p className="mt-1 text-sm text-slate-200">
                  {
                    student.registration_number
                  }
                </p>

                {student.student_id && (
                  <p className="mt-1 text-xs text-slate-300">
                    Student ID:{" "}
                    {
                      student.student_id
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <InternshipStatusBadge
                status={
                  student.internship_status
                }
              />

              <PaymentStatusBadge
                status={
                  student.payment_status
                }
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryItem
            icon={
              <Building2 className="h-5 w-5" />
            }
            label="College"
            value={
              student.college?.name ||
              "Not assigned"
            }
          />

          <SummaryItem
            icon={
              <GraduationCap className="h-5 w-5" />
            }
            label="Domain"
            value={
              student.domain
                ?.domain_name ||
              "Not assigned"
            }
          />

          <SummaryItem
            icon={
              <Mail className="h-5 w-5" />
            }
            label="Email"
            value={
              student.email ||
              "Not provided"
            }
          />

          <SummaryItem
            icon={
              <Phone className="h-5 w-5" />
            }
            label="Mobile"
            value={
              student.mobile ||
              "Not provided"
            }
          />
        </div>
      </section>

      {/* Personal details */}

      <FormSection
        title="Personal Details"
        description="Student identity and personal information."
        icon={
          <UserRound className="h-5 w-5" />
        }
      >
        <FormField
          label="Registration Number"
          required
        >
          <Input
            value={
              formData.registration_number
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "registration_number",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Student ID">
          <Input
            value={
              formData.student_id
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "student_id",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Student Name"
          required
        >
          <Input
            value={formData.name}
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Father Name">
          <Input
            value={
              formData.father_name
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "father_name",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Gender">
          <select
            value={
              formData.gender
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "gender",
                event.target.value,
              )
            }
            className={selectClassName}
          >
            <option value="">
              Select gender
            </option>

            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </FormField>

        <FormField label="Date of Birth">
          <Input
            type="date"
            value={formData.dob}
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "dob",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Email">
          <Input
            type="email"
            value={formData.email}
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Mobile">
          <Input
            value={formData.mobile}
            disabled={!editMode}
            maxLength={10}
            onChange={(event) =>
              updateField(
                "mobile",
                event.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
          />
        </FormField>
      </FormSection>

      {/* Academic details */}

      <FormSection
        title="Academic Details"
        description="Programme, subject, session and semester."
        icon={
          <GraduationCap className="h-5 w-5" />
        }
      >
        <FormField label="Programme">
          <Input
            value={
              formData.programme
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "programme",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Major Subject">
          <Input
            value={
              formData.major_subject
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "major_subject",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Session">
          <Input
            value={
              formData.session
            }
            disabled={!editMode}
            placeholder="Example: 2024-27"
            onChange={(event) =>
              updateField(
                "session",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Semester">
          <Input
            value={
              formData.semester
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "semester",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="College">
          <select
            value={
              formData.college_id
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "college_id",
                event.target.value,
              )
            }
            className={selectClassName}
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

          {selectedCollege && (
            <p className="mt-1 text-xs text-slate-500">
              {
                selectedCollege.university
              }
            </p>
          )}
        </FormField>

        <FormField label="Domain">
          <select
            value={
              formData.domain_id
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "domain_id",
                event.target.value,
              )
            }
            className={selectClassName}
          >
            <option value="">
              Select domain
            </option>

            {domains.map(
              (domain) => (
                <option
                  key={domain.id}
                  value={domain.id}
                >
                  {
                    domain.domain_name
                  }
                </option>
              ),
            )}
          </select>

          {selectedDomain && (
            <p className="mt-1 text-xs text-slate-500">
              Duration:{" "}
              {
                selectedDomain.duration_hours
              }{" "}
              hours
            </p>
          )}
        </FormField>
      </FormSection>

      {/* Internship and payment */}

      <FormSection
        title="Internship & Payment"
        description="Manage internship dates and administrative statuses."
        icon={
          <CalendarDays className="h-5 w-5" />
        }
      >
        <FormField label="Internship Status">
          <select
            value={
              formData
                .internship_status
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "internship_status",
                event.target.value,
              )
            }
            className={selectClassName}
          >
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
        </FormField>

        <FormField label="Payment Status">
          <select
            value={
              formData.payment_status
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "payment_status",
                event.target.value,
              )
            }
            className={selectClassName}
          >
            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>
        </FormField>

        <FormField label="Internship Start Date">
          <Input
            type="date"
            value={
              formData
                .internship_start_date
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "internship_start_date",
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Internship End Date">
          <Input
            type="date"
            value={
              formData
                .internship_end_date
            }
            disabled={!editMode}
            onChange={(event) =>
              updateField(
                "internship_end_date",
                event.target.value,
              )
            }
          />
        </FormField>
      </FormSection>

      {editMode && (
        <div className="sticky bottom-4 z-20 flex justify-end">
          <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={handleCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() =>
                void handleSave()
              }
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

const selectClassName =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600";

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 px-6 py-5">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate font-semibold text-slate-900">
          {value}
        </p>
      </div>
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

    default:
      return (
        <Badge>
          Preloaded
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

function StudentPhoto({
  photo,
  name,
}: {
  photo?: string | null;
  name: string;
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const photoUrl =
    getStudentPhotoUrl(photo);

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
          alt={`${name} photo`}
          className="h-full w-full object-cover"
          onError={() =>
            setImageFailed(true)
          }
        />
      ) : (
        <UserRound className="h-8 w-8" />
      )}
    </div>
  );
}