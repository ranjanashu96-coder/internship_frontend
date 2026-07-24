"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button, Input, PageHeader } from "@/components/ui";
import {
  adminService,
  type CreateCollegePayload,
} from "@/lib/services";

const collegeSchema = z
  .object({
    name: z.string().trim().min(2, "College name is required"),
    code: z.string().trim().min(2, "College code is required"),
    university: z.string().trim().min(2, "University is required"),
    principal_name: z.string().trim().min(2, "Principal name is required"),
    coordinator_name: z
      .string()
      .trim()
      .min(2, "Coordinator name is required"),
    email: z.string().trim().email("Valid email is required"),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),
    address: z.string().trim().min(5, "Address is required"),
    state: z.string().trim().min(2, "State is required"),
    district: z.string().trim().min(2, "District is required"),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Pincode must be 6 digits"),
    college_share: z.coerce
      .number()
      .min(0, "Share cannot be negative")
      .max(100, "Share cannot exceed 100"),
    rknexora_share: z.coerce
      .number()
      .min(0, "Share cannot be negative")
      .max(100, "Share cannot exceed 100"),
    status: z.enum(["active", "inactive", "pending"]),
    admin_username: z.string().trim().min(3, "Admin username is required"),
    admin_email: z.string().trim().email("Valid admin email is required"),
    admin_password: z
      .string()
      .min(8, "Password must contain at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .refine(
    (data) => data.college_share + data.rknexora_share === 100,
    {
      message: "College share and RKNexora share total must be 100",
      path: ["rknexora_share"],
    },
  )
  .refine((data) => data.admin_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type CollegeFormValues = z.infer<typeof collegeSchema>;

export default function AddCollegePage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CollegeFormValues>({
    resolver: zodResolver(collegeSchema),
    defaultValues: {
      name: "",
      code: "",
      university: "",
      principal_name: "",
      coordinator_name: "",
      email: "",
      mobile: "",
      address: "",
      state: "Bihar",
      district: "",
      pincode: "",
      college_share: 70,
      rknexora_share: 30,
      status: "active",
      admin_username: "",
      admin_email: "",
      admin_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values: CollegeFormValues) => {
  try {
    const { confirm_password, ...formData } = values;

    const payload: CreateCollegePayload = {
      ...formData,
      college_share: Number(formData.college_share),
      rknexora_share: Number(formData.rknexora_share),
    };

    await adminService.createCollege(payload);

    toast.success("College and college admin created successfully");

    router.push("/admin/colleges");
    router.refresh();
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ??
        "Unable to create college",
    );
  }
};

  return (
    <div>
      <PageHeader
        title="Add College"
        description="Create a college and its login account."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <section>
          <h2 className="mb-4 text-lg font-semibold">College information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="College name"
              error={errors.name?.message}
            >
              <Input {...register("name")} />
            </Field>

            <Field
              label="College code"
              error={errors.code?.message}
            >
              <Input {...register("code")} />
            </Field>

            <Field
              label="University"
              error={errors.university?.message}
            >
              <Input {...register("university")} />
            </Field>

            <Field
              label="Principal name"
              error={errors.principal_name?.message}
            >
              <Input {...register("principal_name")} />
            </Field>

            <Field
              label="Coordinator name"
              error={errors.coordinator_name?.message}
            >
              <Input {...register("coordinator_name")} />
            </Field>

            <Field
              label="College email"
              error={errors.email?.message}
            >
              <Input type="email" {...register("email")} />
            </Field>

            <Field
              label="College mobile"
              error={errors.mobile?.message}
            >
              <Input maxLength={10} {...register("mobile")} />
            </Field>

            <Field
              label="State"
              error={errors.state?.message}
            >
              <Input {...register("state")} />
            </Field>

            <Field
              label="District"
              error={errors.district?.message}
            >
              <Input {...register("district")} />
            </Field>

            <Field
              label="Pincode"
              error={errors.pincode?.message}
            >
              <Input maxLength={6} {...register("pincode")} />
            </Field>
          </div>

          <Field
            label="Address"
            error={errors.address?.message}
            className="mt-4"
          >
            <textarea
              {...register("address")}
              rows={4}
              className="input min-h-28 resize-y"
            />
          </Field>
        </section>

        <section className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">Revenue share</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="College share (%)"
              error={errors.college_share?.message}
            >
              <Input
                type="number"
                step="0.01"
                {...register("college_share")}
              />
            </Field>

            <Field
              label="RKNexora share (%)"
              error={errors.rknexora_share?.message}
            >
              <Input
                type="number"
                step="0.01"
                {...register("rknexora_share")}
              />
            </Field>
          </div>
        </section>

        <section className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            College admin account
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Admin username"
              error={errors.admin_username?.message}
            >
              <Input
                autoComplete="username"
                {...register("admin_username")}
              />
            </Field>

            <Field
              label="Admin email"
              error={errors.admin_email?.message}
            >
              <Input
                type="email"
                autoComplete="email"
                {...register("admin_email")}
              />
            </Field>

            <Field
              label="Admin password"
              error={errors.admin_password?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("admin_password")}
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

            <Field label="Status" error={errors.status?.message}>
              <select {...register("status")} className="input">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create College"}
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
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}