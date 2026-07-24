"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import {
  adminService,
  type CreateMentorPayload,
} from "@/lib/services";
import type { College, Domain } from "@/types";
import { Button, Input, PageHeader } from "@/components/ui";

const mentorSchema = z
  .object({
    name: z.string().trim().min(2, "Mentor name is required"),
    employee_id: z
      .string()
      .trim()
      .min(2, "Employee ID is required"),
    designation: z.string().trim().optional(),
    department: z.string().trim().optional(),
    specialization: z.string().trim().optional(),
    mobile: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          !value || /^[6-9]\d{9}$/.test(value),
        "Enter a valid 10 digit mobile number",
      ),
    email: z
      .string()
      .trim()
      .email("Valid email is required"),
    qualification: z.string().trim().optional(),
    profile_photo: z.string().trim().optional(),
    username: z.string().trim().optional(),
    domain_id: z.coerce
      .number()
      .min(1, "Domain is required"),
    college_id: z.union([
      z.coerce.number().min(1),
      z.literal(""),
    ]),
    status: z.enum(["active", "inactive"]),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters"),
    confirm_password: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine(
    (data) => data.password === data.confirm_password,
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    },
  );

type MentorFormValues = z.infer<typeof mentorSchema>;

export default function AddMentorPage() {
  const router = useRouter();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [optionsLoading, setOptionsLoading] =
    useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema),
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
      confirm_password: "",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true);

        const [domainsResponse, collegesResponse] =
          await Promise.all([
            adminService.domains({
              page: 1,
              limit: 100,
            }),
            adminService.colleges({
              page: 1,
              limit: 100,
            }),
          ]);

        const domainData: any =
          domainsResponse.data.data;

        const collegeData =
          collegesResponse.data.data;

        setDomains(
          Array.isArray(domainData)
            ? domainData
            : domainData.items || [],
        );

        setColleges(collegeData.items || []);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ??
            "Form options could not be loaded",
        );
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

  const onSubmit = async (
    values: MentorFormValues,
  ) => {
    try {
      const {
        confirm_password,
        college_id,
        profile_photo,
        ...rest
      } = values;

      const payload: CreateMentorPayload = {
        ...rest,
        domain_id: Number(values.domain_id),
        college_id:
          college_id === ""
            ? null
            : Number(college_id),
        profile_photo: profile_photo || null,
      };

      await adminService.createMentor(payload);

      toast.success(
        "Mentor profile and login account created successfully",
      );

      router.push("/admin/mentors");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to create mentor",
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Mentor"
        description="Create mentor profile and login account."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Mentor information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Mentor name"
              error={errors.name?.message}
            >
              <Input {...register("name")} />
            </Field>

            <Field
              label="Employee ID"
              error={errors.employee_id?.message}
            >
              <Input {...register("employee_id")} />
            </Field>

            <Field
              label="Designation"
              error={errors.designation?.message}
            >
              <Input {...register("designation")} />
            </Field>

            <Field
              label="Department"
              error={errors.department?.message}
            >
              <Input {...register("department")} />
            </Field>

            <Field
              label="Specialization"
              error={errors.specialization?.message}
            >
              <Input {...register("specialization")} />
            </Field>

            <Field
              label="Qualification"
              error={errors.qualification?.message}
            >
              <Input {...register("qualification")} />
            </Field>

            <Field
              label="Mobile"
              error={errors.mobile?.message}
            >
              <Input
                maxLength={10}
                {...register("mobile")}
              />
            </Field>

            <Field
              label="Email"
              error={errors.email?.message}
            >
              <Input
                type="email"
                {...register("email")}
              />
            </Field>

            <Field
              label="Domain"
              error={errors.domain_id?.message}
            >
              <select
                {...register("domain_id")}
                className="input"
                disabled={optionsLoading}
              >
                <option value={0}>
                  Select domain
                </option>

                {domains.map((domain: any) => (
                  <option
                    key={domain.id}
                    value={domain.id}
                  >
                    {domain.domain_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="College"
              error={errors.college_id?.message}
            >
              <select
                {...register("college_id")}
                className="input"
                disabled={optionsLoading}
              >
                <option value="">
                  No college
                </option>

                {colleges.map((college) => (
                  <option
                    key={college.id}
                    value={college.id}
                  >
                    {college.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Profile photo URL"
              error={errors.profile_photo?.message}
            >
              <Input {...register("profile_photo")} />
            </Field>

            <Field
              label="Status"
              error={errors.status?.message}
            >
              <select
                {...register("status")}
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
              error={errors.username?.message}
            >
              <Input
                autoComplete="username"
                placeholder="Leave blank to use employee ID"
                {...register("username")}
              />
            </Field>

            <Field
              label="Password"
              error={errors.password?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </Field>

            <Field
              label="Confirm password"
              error={errors.confirm_password?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("confirm_password")}
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting || optionsLoading
            }
          >
            {isSubmitting
              ? "Creating..."
              : "Create Mentor"}
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
  children: React.ReactNode;
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