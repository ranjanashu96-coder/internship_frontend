"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";
import { adminService } from "@/lib/services";

const MAX_LOGO_SIZE =
  2 * 1024 * 1024;

const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const editCollegeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "College name is required",
      ),

    code: z
      .string()
      .trim()
      .min(
        2,
        "College code is required",
      ),

    university: z
      .string()
      .trim()
      .min(
        2,
        "University is required",
      ),

    principal_name: z
      .string()
      .trim()
      .min(
        2,
        "Principal name is required",
      ),

    coordinator_name: z
      .string()
      .trim()
      .min(
        2,
        "Coordinator name is required",
      ),

    email: z
      .string()
      .trim()
      .email(
        "Valid email is required",
      ),

    mobile: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10 digit mobile number",
      ),

    address: z
      .string()
      .trim()
      .min(
        5,
        "Address is required",
      ),

    state: z
      .string()
      .trim()
      .min(
        2,
        "State is required",
      ),

    district: z
      .string()
      .trim()
      .min(
        2,
        "District is required",
      ),

    pincode: z
      .string()
      .trim()
      .regex(
        /^\d{6}$/,
        "Pincode must be 6 digits",
      ),

    college_share: z.coerce
      .number()
      .min(
        0,
        "Share cannot be negative",
      )
      .max(
        100,
        "Share cannot exceed 100",
      ),

    rknexora_share: z.coerce
      .number()
      .min(
        0,
        "Share cannot be negative",
      )
      .max(
        100,
        "Share cannot exceed 100",
      ),

    status: z.enum([
      "active",
      "inactive",
    ]),

    logo: z
      .preprocess(
        (value) => {
          if (
            value instanceof
            FileList
          ) {
            return (
              value.item(0) ??
              undefined
            );
          }

          return value;
        },
        z
          .instanceof(File)
          .optional(),
      )
      .refine(
        (file) =>
          !file ||
          file.size <=
            MAX_LOGO_SIZE,
        "Logo must be 2 MB or smaller",
      )
      .refine(
        (file) =>
          !file ||
          ALLOWED_LOGO_TYPES.includes(
            file.type,
          ),
        "Only JPG, PNG and WEBP files are allowed",
      ),
  })
  .refine(
    (data) =>
      Number(
        data.college_share,
      ) +
        Number(
          data.rknexora_share,
        ) ===
      100,
    {
      path: [
        "rknexora_share",
      ],
      message:
        "College share and RKNexora share total must be 100",
    },
  );

type EditCollegeFormValues =
  z.infer<
    typeof editCollegeSchema
  >;

const getFileUrl = (
  path?: string | null,
) => {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const apiBaseUrl =
    process.env
      .NEXT_PUBLIC_API_URL ??
    "";

  const backendBaseUrl =
    apiBaseUrl.replace(
      /\/api\/?$/,
      "",
    );

  return `${backendBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function EditCollegePage() {
  const router =
    useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const collegeId =
    Number(params.id);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    existingLogo,
    setExistingLogo,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectedLogo,
    setSelectedLogo,
  ] =
    useState<
      File | null
    >(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<EditCollegeFormValues>({
      resolver:
        zodResolver(
          editCollegeSchema,
        ),

      defaultValues: {
        name: "",
        code: "",
        university: "",
        principal_name:
          "",
        coordinator_name:
          "",
        email: "",
        mobile: "",
        address: "",
        state: "Bihar",
        district: "",
        pincode: "",
        college_share:
          70,
        rknexora_share:
          30,
        status: "active",
        logo: undefined,
      },
    });

  const collegeShare =
    watch(
      "college_share",
    );

  const logoPreview =
    useMemo(() => {
      if (
        selectedLogo
      ) {
        return URL.createObjectURL(
          selectedLogo,
        );
      }

      return getFileUrl(
        existingLogo,
      );
    }, [
      selectedLogo,
      existingLogo,
    ]);

  useEffect(() => {
    return () => {
      if (
        selectedLogo &&
        logoPreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          logoPreview,
        );
      }
    };
  }, [
    selectedLogo,
    logoPreview,
  ]);

  useEffect(() => {
    if (
      !Number.isInteger(
        collegeId,
      ) ||
      collegeId <= 0
    ) {
      toast.error(
        "Invalid college ID",
      );

      router.replace(
        "/admin/colleges",
      );

      return;
    }

    const loadCollege =
      async () => {
        setLoading(true);

        try {
          const response =
            await adminService
              .collegeById(
                collegeId,
              );

          const college =
            response.data
              .data;

          reset({
            name:
              college.name ??
              "",

            code:
              college.code ??
              "",

            university:
              college.university ??
              "",

            principal_name:
              college.principal_name ??
              "",

            coordinator_name:
              college.coordinator_name ??
              "",

            email:
              college.email ??
              "",

            mobile:
              college.mobile ??
              "",

            address:
              college.address ??
              "",

            state:
              college.state ??
              "Bihar",

            district:
              college.district ??
              "",

            pincode:
              college.pincode ??
              "",

            college_share:
              Number(
                college.college_share ??
                  70,
              ),

            rknexora_share:
              Number(
                college.rknexora_share ??
                  30,
              ),

            status:
              college.status ===
              "inactive"
                ? "inactive"
                : "active",

            logo:
              undefined,
          });

          setExistingLogo(
            college.logo ??
              null,
          );
        } catch (
          error: any
        ) {
          toast.error(
            error?.response
              ?.data
              ?.message ??
              "Unable to load college",
          );

          router.replace(
            "/admin/colleges",
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    void loadCollege();
  }, [
    collegeId,
    reset,
    router,
  ]);

  const onSubmit =
    async (
      values:
        EditCollegeFormValues,
    ) => {
      try {
        const {
          logo,
          ...collegeData
        } =
          values;

        const payload =
          new FormData();

        Object.entries(
          collegeData,
        ).forEach(
          ([
            key,
            value,
          ]) => {
            if (
              value !==
                undefined &&
              value !==
                null
            ) {
              payload.append(
                key,
                String(
                  value,
                ),
              );
            }
          },
        );

        if (logo) {
          payload.append(
            "logo",
            logo,
          );
        }

        await adminService
          .updateCollege(
            collegeId,
            payload,
          );

        toast.success(
          "College updated successfully",
        );

        router.push(
          "/admin/colleges",
        );

        router.refresh();
      } catch (
        error: any
      ) {
        toast.error(
          error?.response
            ?.data
            ?.message ??
            "Unable to update college",
        );
      }
    };

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-2xl border bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading college...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit College"
        description="Update college information, revenue share and status."
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
              <Building2 className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                College information
              </h2>

              <p className="text-sm text-slate-500">
                Update the college&apos;s basic details.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="College name"
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
              label="College code"
              error={
                errors.code
                  ?.message
              }
            >
              <Input
                {...register(
                  "code",
                )}
              />
            </Field>

            <Field
              label="University"
              error={
                errors
                  .university
                  ?.message
              }
            >
              <Input
                {...register(
                  "university",
                )}
              />
            </Field>

            <Field
              label="Principal name"
              error={
                errors
                  .principal_name
                  ?.message
              }
            >
              <Input
                {...register(
                  "principal_name",
                )}
              />
            </Field>

            <Field
              label="Coordinator name"
              error={
                errors
                  .coordinator_name
                  ?.message
              }
            >
              <Input
                {...register(
                  "coordinator_name",
                )}
              />
            </Field>

            <Field
              label="College email"
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
              label="College mobile"
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
              label="State"
              error={
                errors.state
                  ?.message
              }
            >
              <Input
                {...register(
                  "state",
                )}
              />
            </Field>

            <Field
              label="District"
              error={
                errors
                  .district
                  ?.message
              }
            >
              <Input
                {...register(
                  "district",
                )}
              />
            </Field>

            <Field
              label="Pincode"
              error={
                errors
                  .pincode
                  ?.message
              }
            >
              <Input
                inputMode="numeric"
                maxLength={6}
                {...register(
                  "pincode",
                )}
              />
            </Field>
          </div>

          <Field
            label="Address"
            error={
              errors.address
                ?.message
            }
            className="mt-4"
          >
            <textarea
              {...register(
                "address",
              )}
              rows={4}
              className="input min-h-28 resize-y"
            />
          </Field>
        </section>

        <section className="border-t pt-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <ImageIcon className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                College logo
              </h2>

              <p className="text-sm text-slate-500">
                Upload a new logo only when it needs to be changed.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[150px_minmax(0,1fr)] md:items-center">
            <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-2xl border bg-slate-50">
              {logoPreview ? (
                <Image
                  src={
                    logoPreview
                  }
                  alt="College logo"
                  width={128}
                  height={128}
                  unoptimized
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-slate-300" />
              )}
            </div>

            <div>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                {...register(
                  "logo",
                  {
                    onChange:
                      (
                        event,
                      ) => {
                        const file =
                          event
                            .target
                            .files?.[0];

                        setSelectedLogo(
                          file ??
                            null,
                        );
                      },
                  },
                )}
              />

              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG or WEBP. Maximum size 2 MB.
              </p>

              {errors.logo
                ?.message && (
                <p className="mt-1 text-xs text-red-600">
                  {
                    errors.logo
                      .message
                  }
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            Revenue share
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="College share (%)"
              error={
                errors
                  .college_share
                  ?.message
              }
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register(
                  "college_share",
                  {
                    valueAsNumber:
                      true,

                    onChange:
                      (
                        event,
                      ) => {
                        const value =
                          Number(
                            event
                              .target
                              .value,
                          );

                        if (
                          Number.isFinite(
                            value,
                          )
                        ) {
                          setValue(
                            "rknexora_share",
                            Math.max(
                              0,
                              100 -
                                value,
                            ),
                            {
                              shouldValidate:
                                true,
                            },
                          );
                        }
                      },
                  },
                )}
              />
            </Field>

            <Field
              label="RKNexora share (%)"
              error={
                errors
                  .rknexora_share
                  ?.message
              }
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register(
                  "rknexora_share",
                  {
                    valueAsNumber:
                      true,
                  },
                )}
              />
            </Field>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Current total:{" "}
            <strong>
              {Number(
                collegeShare ||
                  0,
              ) +
                Number(
                  watch(
                    "rknexora_share",
                  ) || 0,
                )}
              %
            </strong>
          </p>
        </section>

        <section className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            College status
          </h2>

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
              className="input w-full md:max-w-sm"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </Field>
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
              isSubmitting
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
                Update College
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
  className = "",
}: {
  label: string;
  error?: string;
  children:
    React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className
      }
    >
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