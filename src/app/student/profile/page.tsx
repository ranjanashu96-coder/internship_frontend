"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  BadgeIndianRupee,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Edit3,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  University,
  User,
  UserCircle2,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import {
  studentService,
  type StudentProfileData,
  type StudentProfileUpdatePayload,
} from "@/lib/services";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const getFileUrl = (path?: string | null) => {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

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
    requestError.response?.data?.message ||
    requestError.message ||
    "Something went wrong."
  );
};

const formatDate = (
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
};

const formatCurrency = (
  value?: number | null,
) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
};

const getStatusClasses = (
  status?: string | null,
) => {
  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "paid" ||
    normalizedStatus === "completed"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    normalizedStatus === "pending" ||
    normalizedStatus === "registered" ||
    normalizedStatus === "preloaded"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    normalizedStatus === "blocked" ||
    normalizedStatus === "failed"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
};

function ProfileStatusBadge({
  value,
}: {
  value?: string | null;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
        value,
      )}`}
    >
      <CheckCircle2
        size={14}
        className="mr-1.5"
      />

      {value || "Not available"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[65vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2
          size={36}
          className="animate-spin text-blue-600"
        />

        <p className="text-sm">
          Loading profile...
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
    <div className="grid min-h-[65vh] place-items-center">
      <div className="card w-full max-w-lg text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={24} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Profile could not be loaded
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

function InformationRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  icon: typeof User;
}) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "Not available"
      : String(value);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-900">
          {displayValue}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function ProfileAvatar({
  name,
  photo,
}: {
  name?: string | null;
  photo?: string | null;
}) {
  const initials = String(name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const photoUrl = getFileUrl(photo);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || "Student"}
        className="h-24 w-24 rounded-2xl border-4 border-white/20 object-cover shadow-lg"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-white/20 bg-white/10 text-2xl font-bold text-white shadow-lg">
      {initials || "ST"}
    </div>
  );
}

function EditProfileModal({
  profile,
  onClose,
  onUpdated,
}: {
  profile: StudentProfileData;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [
    form,
    setForm,
  ] =
    useState<StudentProfileUpdatePayload>({
      mobile: profile.mobile || "",
      email: profile.email || "",
      photo: profile.photo || "",
    });

  const [
    saving,
    setSaving,
  ] = useState(false);

  const handleChange = (
    field:
      | "mobile"
      | "email"
      | "photo",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const mobile =
      String(form.mobile || "").trim();

    const email =
      String(form.email || "")
        .trim()
        .toLowerCase();

    const photo =
      String(form.photo || "").trim();

    if (
      mobile &&
      !/^[0-9]{10,15}$/.test(mobile)
    ) {
      toast.error(
        "Mobile number must contain 10 to 15 digits",
      );

      return;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      toast.error(
        "Please enter a valid email address",
      );

      return;
    }

    try {
      setSaving(true);

      await studentService.updateProfile({
        mobile,
        email,
        photo: photo || null,
      });

      toast.success(
        "Profile updated successfully",
      );

      await onUpdated();
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Student Profile
            </p>
{/* 
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Edit Profile
            </h2> */}

            <p className="mt-1 text-sm text-slate-500">
              Only contact details and
              profile photo can be
              updated.
            </p>
          </div>
{/* 
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button> */}
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mobile Number
            </label>

            <div className="relative">
              <Phone
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                value={form.mobile || ""}
                onChange={(event) =>
                  handleChange(
                    "mobile",
                    event.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
                placeholder="Enter mobile number"
                maxLength={15}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                type="email"
                value={form.email || ""}
                onChange={(event) =>
                  handleChange(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="Enter email address"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Profile Photo URL
            </label>

            <div className="relative">
              <UserCircle2
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                value={form.photo || ""}
                onChange={(event) =>
                  handleChange(
                    "photo",
                    event.target.value,
                  )
                }
                placeholder="Enter profile photo URL"
                className="pl-10"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              File upload is not available
              in the current profile API.
            </p>
          </div>

         {form.photo && (
  <div className="rounded-xl bg-slate-50 p-4">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
      Photo Preview
    </p>

    <img
      src={getFileUrl(form.photo) || ""}
      alt="Profile preview"
      className="h-20 w-20 rounded-xl object-cover"
    />
  </div>
)}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <Loader2
                size={17}
                className="mr-2 animate-spin"
              />
            ) : (
              <Save
                size={17}
                className="mr-2"
              />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function StudentProfilePage() {
  const [
    profile,
    setProfile,
  ] =
    useState<StudentProfileData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadProfile =
    useCallback(
      async (
        showPageLoader = true,
      ) => {
        try {
          if (showPageLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const response =
            await studentService.profile();

          setProfile(
            response.data.data,
          );
        } catch (requestError) {
          const message =
            getErrorMessage(requestError);

          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        message={
          error ||
          "Profile data was not returned."
        }
        onRetry={() => {
          void loadProfile();
        }}
      />
    );
  }

 const academics =
  profile.academics || {};

const academicDocuments =
  academics.documents &&
  typeof academics.documents === "object" &&
  !Array.isArray(academics.documents)
    ? (academics.documents as {
        photo?: string | null;
        marksheet?: string | null;
        identity_document?: string | null;
      })
    : {};

const academicEntries =
  Object.entries(academics).filter(
    ([key, value]) =>
      key !== "documents" &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" />

      <section className="overflow-hidden rounded-2xl bg-slate-950 text-white">
        <div className="relative p-6 md:p-8">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <ProfileAvatar
                name={profile.name}
                photo={profile.photo}
              />

              <div>
                <p className="text-sm font-medium text-blue-300">
                  Student Profile
                </p>

                <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                  {profile.name ||
                    "Student"}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                  <span>
                    {
                      profile.registration_number
                    }
                  </span>

                  {profile.domain
                    ?.domain_name && (
                    <>
                      <span>•</span>

                      <span>
                        {
                          profile.domain
                            .domain_name
                        }
                      </span>
                    </>
                  )}

                  {profile.college
                    ?.name && (
                    <>
                      <span>•</span>

                      <span>
                        {
                          profile.college
                            .name
                        }
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ProfileStatusBadge
                    value={
                      profile.internship_status
                    }
                  />

                  <ProfileStatusBadge
                    value={
                      profile.payment_status
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={refreshing}
                onClick={() => {
                  void loadProfile(false);
                }}
              >
                <RefreshCw
                  size={17}
                  className={`mr-2 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </Button>

              {/* <Button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
              >
                <Edit3
                  size={17}
                  className="mr-2"
                />

                Edit Profile
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Hash size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Student ID
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {profile.student_id ||
                  "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Programme
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {profile.programme ||
                  "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Clock3 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Domain Hours
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {profile.domain
                  ?.duration_hours ?? 0}{" "}
                Hours
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Registered On
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {formatDate(
                  profile.registration_date,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Personal Information"
          description="Basic student and contact details."
          icon={CircleUserRound}
        >
          <InformationRow
            label="Full Name"
            value={profile.name}
            icon={User}
          />

          <InformationRow
            label="Father Name"
            value={profile.father_name}
            icon={UserCircle2}
          />

          <InformationRow
            label="Gender"
            value={profile.gender}
            icon={User}
          />

          <InformationRow
            label="Date of Birth"
            value={formatDate(profile.dob)}
            icon={CalendarDays}
          />

          <InformationRow
            label="Mobile"
            value={profile.mobile}
            icon={Phone}
          />

          <InformationRow
            label="Email"
            value={profile.email}
            icon={Mail}
          />
        </SectionCard>

        <SectionCard
          title="Academic Information"
          description="Programme and academic session details."
          icon={GraduationCap}
        >
          <InformationRow
            label="Programme"
            value={profile.programme}
            icon={BookOpen}
          />

          <InformationRow
            label="Major Subject"
            value={profile.major_subject}
            icon={GraduationCap}
          />

          <InformationRow
            label="Session"
            value={profile.session}
            icon={CalendarDays}
          />

          <InformationRow
            label="Semester"
            value={profile.semester}
            icon={BookOpen}
          />

          <InformationRow
            label="Username"
            value={profile.username}
            icon={UserCircle2}
          />

          <InformationRow
            label="Registration Number"
            value={
              profile.registration_number
            }
            icon={Hash}
          />
        </SectionCard>
      </div>
{/* 
      <SectionCard
        title="College Information"
        description="College and university contact information."
        icon={Building2}
      >
        <InformationRow
          label="College Name"
          value={profile.college?.name}
          icon={Building2}
        />

        <InformationRow
          label="College Code"
          value={profile.college?.code}
          icon={Hash}
        />

        <InformationRow
          label="University"
          value={
            profile.college?.university
          }
          icon={University}
        />

        <InformationRow
          label="Principal"
          value={
            profile.college
              ?.principal_name
          }
          icon={User}
        />

        <InformationRow
          label="Coordinator"
          value={
            profile.college
              ?.coordinator_name
          }
          icon={UserCircle2}
        />

        <InformationRow
          label="College Email"
          value={profile.college?.email}
          icon={Mail}
        />

        <InformationRow
          label="College Mobile"
          value={profile.college?.mobile}
          icon={Phone}
        />

        <InformationRow
          label="Address"
          value={[
            profile.college?.address,
            profile.college?.district,
            profile.college?.state,
            profile.college?.pincode,
          ]
            .filter(Boolean)
            .join(", ")}
          icon={MapPin}
        />
      </SectionCard> */}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Internship Information"
          description="Domain, payment and internship status."
          icon={ShieldCheck}
        >
          <InformationRow
            label="Domain"
            value={
              profile.domain?.domain_name
            }
            icon={BookOpen}
          />

          <InformationRow
            label="Duration"
            value={
              profile.domain
                ?.duration_hours
                ? `${profile.domain.duration_hours} Hours`
                : null
            }
            icon={Clock3}
          />

          <InformationRow
            label="Domain Fee"
            value={formatCurrency(
              profile.domain?.fee,
            )}
            icon={BadgeIndianRupee}
          />

          <InformationRow
            label="Internship Status"
            value={
              profile.internship_status
            }
            icon={ShieldCheck}
          />

          <InformationRow
            label="Payment Status"
            value={
              profile.payment_status
            }
            icon={BadgeIndianRupee}
          />

          <InformationRow
            label="Registration Date"
            value={formatDate(
              profile.registration_date,
            )}
            icon={CalendarDays}
          />
        </SectionCard>
<section className="card">
  <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
      <BookOpen size={21} />
    </div>

    <div>
      <h2 className="text-lg font-bold text-slate-900">
        Additional Academics
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Academic information submitted during registration.
      </p>
    </div>
  </div>

  <div className="mt-5 space-y-6">
    {academicEntries.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2">
        {academicEntries.map(([key, value]) => (
          <InformationRow
            key={key}
            label={key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (letter) =>
                letter.toUpperCase(),
              )}
            value={
              typeof value === "object"
                ? JSON.stringify(value)
                : String(value)
            }
            icon={GraduationCap}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
        <GraduationCap
          size={38}
          className="mx-auto text-slate-300"
        />

        <p className="mt-3 text-sm font-medium text-slate-500">
          No additional academic information available.
        </p>
      </div>
    )}

    {(academicDocuments.photo ||
      academicDocuments.marksheet ||
      academicDocuments.identity_document) && (
      <div>
        <h3 className="mb-4 text-sm font-bold text-slate-900">
          Uploaded Documents
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {academicDocuments.photo && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Student Photo
              </p>

              <img
                src={
                  getFileUrl(
                    academicDocuments.photo,
                  ) || ""
                }
                alt="Student"
                className="h-40 w-full rounded-xl object-cover"
              />
            </div>
          )}

          {academicDocuments.marksheet && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Marksheet
              </p>

              <iframe
                src={
                  getFileUrl(
                    academicDocuments.marksheet,
                  ) || ""
                }
                title="Student marksheet"
                className="h-40 w-full rounded-xl border"
              />

              <a
                href={
                  getFileUrl(
                    academicDocuments.marksheet,
                  ) || "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Marksheet
              </a>
            </div>
          )}

          {academicDocuments.identity_document && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Identity Document
              </p>

              <iframe
                src={
                  getFileUrl(
                    academicDocuments.identity_document,
                  ) || ""
                }
                title="Student identity document"
                className="h-40 w-full rounded-xl border"
              />

              <a
                href={
                  getFileUrl(
                    academicDocuments.identity_document,
                  ) || "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Identity Document
              </a>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</section>
      </div>

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() =>
            setEditing(false)
          }
          onUpdated={async () => {
            await loadProfile(false);
          }}
        />
      )}
    </div>
  );
}