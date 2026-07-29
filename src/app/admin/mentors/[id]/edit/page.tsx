"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Save,
  UserRoundCog,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import {
  adminService,
  type UpdateMentorPayload,
} from "@/lib/services";

import type {
  College,
  Domain,
} from "@/types";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

const editMentorSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Mentor name is required",
      ),

    employee_id: z
      .string()
      .trim()
      .min(
        2,
        "Employee ID is required",
      ),

    designation: z
      .string()
      .trim()
      .optional(),

    department: z
      .string()
      .trim()
      .optional(),

    specialization: z
      .string()
      .trim()
      .optional(),

    mobile: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^[6-9]\d{9}$/.test(
            value,
          ),
        "Enter a valid 10 digit mobile number",
      ),

    email: z
      .string()
      .trim()
      .email(
        "Valid email is required",
      ),

    qualification: z
      .string()
      .trim()
      .optional(),

    profile_photo: z
      .string()
      .trim()
      .optional(),

    username: z
      .string()
      .trim()
      .optional(),

    domain_id: z.coerce
      .number()
      .min(
        1,
        "Domain is required",
      ),

    college_id: z.union([
      z.coerce
        .number()
        .min(1),
      z.literal(""),
    ]),

    status: z.enum([
      "active",
      "inactive",
    ]),

    password: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          value.length >= 8,
        "Password must contain at least 8 characters",
      ),

    confirm_password: z
      .string()
      .optional(),
  })
  .refine(
    (data) =>
      !data.password ||
      data.password ===
        data.confirm_password,
    {
      message:
        "Passwords do not match",
      path: [
        "confirm_password",
      ],
    },
  );

type EditMentorFormValues =
  z.infer<
    typeof editMentorSchema
  >;

export default function EditMentorPage() {
  const router =
    useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const mentorId =
    Number(params.id);

  const [
    domains,
    setDomains,
  ] =
    useState<Domain[]>(
      [],
    );

  const [
    colleges,
    setColleges,
  ] =
    useState<College[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    optionsLoading,
    setOptionsLoading,
  ] =
    useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<EditMentorFormValues>({
      resolver:
        zodResolver(
          editMentorSchema,
        ),

      defaultValues: {
        name: "",
        employee_id: "",
        designation: "",
        department: "",
        specialization: "",
        mobile: "",
        email: "",
        qualification: "",
        profile_photo: "",
        username: "",
        domain_id: 0,
        college_id: "",
        status: "active",
        password: "",
        confirm_password:
          "",
      },
    });

  useEffect(() => {
    if (
      !Number.isInteger(
        mentorId,
      ) ||
      mentorId <= 0
    ) {
      toast.error(
        "Invalid mentor ID",
      );

      router.replace(
        "/admin/mentors",
      );

      return;
    }

    const loadData =
      async () => {
        try {
          setLoading(true);
          setOptionsLoading(
            true,
          );

          const [
            mentorResponse,
            domainsResponse,
            collegesResponse,
          ] =
            await Promise.all([
              adminService
                .mentorById(
                  mentorId,
                ),

              adminService
                .domains({
                  page: 1,
                  limit: 100,
                }),

              adminService
                .colleges({
                  page: 1,
                  limit: 100,
                }),
            ]);

          const mentor =
            mentorResponse
              .data.data;

          const domainData:
            any =
            domainsResponse
              .data.data;

          const collegeData =
            collegesResponse
              .data.data;

          setDomains(
            Array.isArray(
              domainData,
            )
              ? domainData
              : domainData
                  .items ||
                  [],
          );

          setColleges(
            collegeData
              .items || [],
          );

          reset({
            name:
              mentor.name ??
              "",

            employee_id:
              mentor.employee_id ??
              "",

            designation:
              mentor.designation ??
              "",

            department:
              mentor.department ??
              "",

            specialization:
              mentor.specialization ??
              "",

            mobile:
              mentor.mobile ??
              "",

            email:
              mentor.email ??
              "",

            qualification:
              mentor.qualification ??
              "",

            profile_photo:
              mentor.profile_photo ??
              "",

            username:
              mentor.name ??
              "",

            domain_id:
              Number(
                mentor.domain_id ??
                  0,
              ),

            college_id:
              mentor.college_id
                ? Number(
                    mentor.college_id,
                  )
                : "",

            status:
              mentor.status ===
              "inactive"
                ? "inactive"
                : "active",

            password: "",
            confirm_password:
              "",
          });
        } catch (
          error: any
        ) {
          toast.error(
            error?.response
              ?.data
              ?.message ??
              "Unable to load mentor",
          );

          router.replace(
            "/admin/mentors",
          );
        } finally {
          setLoading(
            false,
          );

          setOptionsLoading(
            false,
          );
        }
      };

    void loadData();
  }, [
    mentorId,
    reset,
    router,
  ]);

  const onSubmit =
    async (
      values:
        EditMentorFormValues,
    ) => {
      try {
        const {
          confirm_password,
          college_id,
          password,
          profile_photo,
          ...rest
        } =
          values;

        const payload:
          UpdateMentorPayload =
          {
            ...rest,

            domain_id:
              Number(
                values.domain_id,
              ),

            college_id:
              college_id ===
              ""
                ? null
                : Number(
                    college_id,
                  ),

            profile_photo:
              profile_photo ||
              null,
          };

        if (
          password &&
          password.trim()
        ) {
          payload.password =
            password;
        }

        await adminService
          .updateMentor(
            mentorId,
            payload,
          );

        toast.success(
          "Mentor updated successfully",
        );

        router.push(
          "/admin/mentors",
        );

        router.refresh();
      } catch (
        error: any
      ) {
        toast.error(
          error?.response
            ?.data
            ?.message ??
            "Unable to update mentor",
        );
      }
    };

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-2xl border bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading mentor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Mentor"
        description="Update mentor profile, assignment and login details."
      />

      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="grid gap-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UserRoundCog className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-lg font-semibold">
                Mentor information
              </h2>

              <p className="text-sm text-slate-500">
                Update mentor profile and assignment details.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Mentor name"
              error={
                errors.name
                  ?.message
              }
            >
              <Input
                {...register(
                  "name",
                )}
              />
            </Field>

            <Field
              label="Employee ID"
              error={
                errors
                  .employee_id
                  ?.message
              }
            >
              <Input
                {...register(
                  "employee_id",
                )}
              />
            </Field>

            <Field
              label="Designation"
              error={
                errors
                  .designation
                  ?.message
              }
            >
              <Input
                {...register(
                  "designation",
                )}
              />
            </Field>

            <Field
              label="Department"
              error={
                errors
                  .department
                  ?.message
              }
            >
              <Input
                {...register(
                  "department",
                )}
              />
            </Field>

            <Field
              label="Specialization"
              error={
                errors
                  .specialization
                  ?.message
              }
            >
              <Input
                {...register(
                  "specialization",
                )}
              />
            </Field>

            <Field
              label="Qualification"
              error={
                errors
                  .qualification
                  ?.message
              }
            >
              <Input
                {...register(
                  "qualification",
                )}
              />
            </Field>

            <Field
              label="Mobile"
              error={
                errors.mobile
                  ?.message
              }
            >
              <Input
                inputMode="numeric"
                maxLength={10}
                {...register(
                  "mobile",
                )}
              />
            </Field>

            <Field
              label="Email"
              error={
                errors.email
                  ?.message
              }
            >
              <Input
                type="email"
                {...register(
                  "email",
                )}
              />
            </Field>

            <Field
              label="Domain"
              error={
                errors
                  .domain_id
                  ?.message
              }
            >
              <select
                {...register(
                  "domain_id",
                )}
                className="input"
                disabled={
                  optionsLoading
                }
              >
                <option value={0}>
                  Select domain
                </option>

                {domains.map(
                  (
                    domain:
                      any,
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
            </Field>

            <Field
              label="College"
              error={
                errors
                  .college_id
                  ?.message
              }
            >
              <select
                {...register(
                  "college_id",
                )}
                className="input"
                disabled={
                  optionsLoading
                }
              >
                <option value="">
                  No college
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
            </Field>

            <Field
              label="Profile photo URL"
              error={
                errors
                  .profile_photo
                  ?.message
              }
            >
              <Input
                placeholder="https://..."
                {...register(
                  "profile_photo",
                )}
              />
            </Field>

            <Field
              label="Status"
              error={
                errors.status
                  ?.message
              }
            >
              <select
                {...register(
                  "status",
                )}
                className="input"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </Field>
          </div>
        </section>

        <section className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            Login account
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Username"
              error={
                errors
                  .username
                  ?.message
              }
            >
              <Input
                autoComplete="username"
                {...register(
                  "username",
                )}
              />
            </Field>

            <div className="hidden md:block" />

            <Field
              label="New password"
              error={
                errors.password
                  ?.message
              }
            >
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
                {...register(
                  "password",
                )}
              />
            </Field>

            <Field
              label="Confirm new password"
              error={
                errors
                  .confirm_password
                  ?.message
              }
            >
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                {...register(
                  "confirm_password",
                )}
              />
            </Field>
          </div>

          <p className="mt-3 text-xs text-slate-500">
           Leave blank to keep current password
          </p>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.back()
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              optionsLoading
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Mentor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}