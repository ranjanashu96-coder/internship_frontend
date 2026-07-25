"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  FileText,
  GraduationCap,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRoundCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { load } from "@cashfreepayments/cashfree-js";

import { Button, Input } from "@/components/ui";
import {
  registrationService,
  type RegistrationVerification,
} from "@/lib/services";
import type { Domain } from "@/types";

const schema = z
  .object({
    registration_number: z
      .string()
      .min(3, "Registration number required"),

    father_name: z
      .string()
      .min(2, "Father name required"),

    gender: z.enum([
      "male",
      "female",
      "other",
    ]),

    dob: z
      .string()
      .min(1, "DOB required"),

    programme: z
      .string()
      .min(2, "Programme required"),

    major_subject: z
      .string()
      .min(2, "Major subject required"),

    session: z
      .string()
      .min(4, "Session required"),

    semester: z
      .string()
      .min(1, "Semester required"),

    mobile: z
      .string()
      .regex(
        /^\d{10,15}$/,
        "Enter valid mobile number",
      ),

    email: z
      .string()
      .email("Enter valid email"),

    username: z
      .string()
      .min(
        4,
        "Username must contain at least 4 characters",
      ),

    password: z.string().optional(),

confirm_password: z.string().optional(),

    domain_id: z
      .coerce
      .number()
      .int()
      .positive(
        "Select a domain",
      ),
  })
  .refine(
  (values) =>
    !values.password ||
    values.password.length >= 8,
  {
    path: ["password"],
    message:
      "Password must contain at least 8 characters",
  },
)
.refine(
  (values) =>
    values.password ===
    values.confirm_password,
  {
    path: ["confirm_password"],
    message: "Passwords do not match",
  },
);

type FormValues =
  z.infer<typeof schema>;

type RegistrationDocuments = {
  photo?: string | null;
  identity_document?: string | null;
  marksheet?: string | null;
};

type SelectedFiles = {
  photo?: File;
  identity_document?: File;
  marksheet?: File;
};

const steps = [
  "Verify",
  "Details",
  "Domain",
  "Documents",
  "Review",
  "Payment",
];

const getErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const responseError =
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

    return (
      responseError.response
        ?.data?.message ||
      fallback
    );
  }

  return fallback;
};

export default function RegistrationPage() {
  const router = useRouter();

  const [
  successfulTransactionId,
  setSuccessfulTransactionId,
] = useState<string | null>(null);

  const [step, setStep] =
    useState(0);

  const [
    verified,
    setVerified,
  ] =
    useState<RegistrationVerification | null>(
      null,
    );

  const [
    domains,
    setDomains,
  ] =
    useState<Domain[]>([]);

  const [
    studentId,
    setStudentId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    files,
    setFiles,
  ] =
    useState<SelectedFiles>(
      {},
    );

  const [
    savedDocuments,
    setSavedDocuments,
  ] =
    useState<RegistrationDocuments>(
      {},
    );

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    completed,
    setCompleted,
  ] =
    useState(false);

  const [
    registrationLocked,
    setRegistrationLocked,
  ] =
    useState(false);

  const {
    register,
    getValues,
    setValue,
    trigger,
     watch,
    formState: {
      errors,
    },
  } =
    useForm<FormValues>({
      resolver:
        zodResolver(schema),

      defaultValues: {
        registration_number:
          "",

        father_name:
          "",

        gender:
          "male",

        dob:
          "",

        programme:
          "",

        major_subject:
          "",

        session:
          "",

        semester:
          "",

        mobile:
          "",

        email:
          "",

        username:
          "",

        password:
          "",

        confirm_password:
          "",

        domain_id:
          0,
      },
    });

  useEffect(() => {
    const loadDomains =
      async () => {
        try {
          const response =
            await registrationService
              .domains();

          setDomains(
            response.data.data,
          );
        } catch (error) {
          toast.error(
            getErrorMessage(
              error,
              "Domains could not be loaded",
            ),
          );
        }
      };

    void loadDomains();
  }, []);

 const selectedDomainId = watch("domain_id");

const selectedDomain = useMemo(
  () =>
    domains.find(
      (domain) =>
        Number(domain.id) ===
        Number(selectedDomainId),
    ),
  [domains, selectedDomainId],
);

  const fillStudentValues = (
    student: RegistrationVerification,
  ) => {
    setValue(
      "registration_number",
      student.registration_number,
    );

    setValue(
      "father_name",
      student.father_name ||
        "",
    );

    if (
      student.gender ===
        "male" ||
      student.gender ===
        "female" ||
      student.gender ===
        "other"
    ) {
      setValue(
        "gender",
        student.gender,
      );
    }

    setValue(
      "dob",
      student.dob
        ? String(
            student.dob,
          ).slice(
            0,
            10,
          )
        : "",
    );

    setValue(
      "programme",
      student.programme ||
        "",
    );

    setValue(
      "major_subject",
      student.major_subject ||
        "",
    );

    setValue(
      "session",
      student.session ||
        "",
    );

    setValue(
      "semester",
      student.semester ||
        "",
    );

    setValue(
      "mobile",
      student.mobile ||
        "",
    );

    setValue(
      "email",
      student.email ||
        "",
    );

    setValue(
      "username",
      student.username ||
        student.registration_number,
    );

    if (
      student.domain_id
    ) {
      setValue(
        "domain_id",
        Number(
          student.domain_id,
        ),
      );
    }
  };

  const verify =
    async () => {
      const valid =
        await trigger(
          "registration_number",
        );

      if (!valid) {
        return;
      }

      setBusy(true);

      try {
        const response =
          await registrationService
            .verify(
              getValues(
                "registration_number",
              ),
            );

        const student =
          response.data.data;

        setVerified(
          student,
        );

        setStudentId(
          Number(
            student.student_id ||
              student.id,
          ),
        );

        setRegistrationLocked(
          Boolean(
            student.registration_locked,
          ),
        );

        fillStudentValues(
          student,
        );

        setSavedDocuments(
          student.documents ||
            {},
        );

        switch (
          student.next_step
        ) {
          case "login": {
            toast.info(
              "Registration and payment are completed. Please login.",
            );

            router.push(
              "/login",
            );

            return;
          }

          case "payment": {
            toast.info(
              "Registration is locked. Continue to payment.",
            );

            setStep(5);
            return;
          }

          case "review": {
            toast.info(
              "Review your registration before payment.",
            );

            setStep(4);
            return;
          }

          case "documents": {
            toast.info(
              "Complete your document upload.",
            );

            setStep(3);
            return;
          }

          case "details":
          default: {
            toast.success(
              "Registration number verified",
            );

            setStep(1);
          }
        }
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Registration verification failed",
          ),
        );
      } finally {
        setBusy(false);
      }
    };

  const goToDomain =
    async () => {
      const fields: Array<
        keyof FormValues
      > = [
        "father_name",
        "gender",
        "dob",
        "programme",
        "major_subject",
        "session",
        "semester",
        "mobile",
        "email",
        "username",
        "password",
        "confirm_password",
      ];

      const valid =
        await trigger(
          fields,
        );

      if (!valid) {
        return;
      }

      setStep(2);
    };

  const saveDetails =
    async () => {
      if (
        registrationLocked
      ) {
        toast.error(
          "Registration is locked and cannot be edited",
        );
        return;
      }

      const fields: Array<
        keyof FormValues
      > = [
        "father_name",
        "gender",
        "dob",
        "programme",
        "major_subject",
        "session",
        "semester",
        "mobile",
        "email",
        "username",
        "password",
        "confirm_password",
        "domain_id",
      ];
       
      const password = getValues("password");

if (
  verified?.internship_status === "preloaded" &&
  !password
) {
  toast.error("Password is required");
  return;
}

      const valid =
        await trigger(
          fields,
        );

      if (!valid) {
        return;
      }

      setBusy(true);

      try {
        const values =
          getValues();

        const {
          confirm_password:
            _confirmPassword,
          ...payload
        } = values;

        const response =
          await registrationService
            .saveDetails(
              payload,
            );

        setStudentId(
          response.data.data
            .student_id,
        );

        setRegistrationLocked(
          false,
        );

        toast.success(
          "Registration details saved",
        );

        setStep(3);
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Registration details could not be saved",
          ),
        );
      } finally {
        setBusy(false);
      }
    };

  const hasDocument = (
    key:
      | "photo"
      | "identity_document"
      | "marksheet",
  ) =>
    Boolean(
      files[key] ||
        savedDocuments[
          key
        ],
    );

  const uploadDocuments =
    async () => {
      if (
        registrationLocked
      ) {
        toast.error(
          "Registration is locked and documents cannot be changed",
        );
        return;
      }

      if (
        !hasDocument(
          "photo",
        ) ||
        !hasDocument(
          "identity_document",
        ) ||
        !hasDocument(
          "marksheet",
        )
      ) {
        toast.error(
          "Photo, identity proof and marksheet are required",
        );
        return;
      }

      setBusy(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "registration_number",
          getValues(
            "registration_number",
          ),
        );

        Object.entries(
          files,
        ).forEach(
          ([
            key,
            file,
          ]) => {
            if (file) {
              formData.append(
                key,
                file,
              );
            }
          },
        );

        const response =
          await registrationService
            .uploadDocuments(
              formData,
            );

        const documents =
          response.data.data;

        setSavedDocuments({
          photo:
            documents.photo,

          identity_document:
            documents.identity_document,

          marksheet:
            documents.marksheet,
        });

        setFiles({});

        toast.success(
          "Documents uploaded successfully",
        );

        setStep(4);
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Documents could not be uploaded",
          ),
        );
      } finally {
        setBusy(false);
      }
    };

  const lockAndProceed =
    async () => {
      if (!studentId) {
        toast.error(
          "Student ID is missing. Verify registration again.",
        );
        return;
      }

      setBusy(true);

      try {
        const response =
          await registrationService
            .lockRegistration(
              studentId,
            );

        setRegistrationLocked(
          response.data.data
            .registration_locked,
        );

        toast.success(
          "Registration confirmed and locked",
        );

        setStep(5);
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Registration could not be locked",
          ),
        );
      } finally {
        setBusy(false);
      }
    };

  const pay = async () => {
    if (!studentId) {
      toast.error("Student ID is missing");
      return;
    }

    if (!registrationLocked) {
      toast.error(
        "Confirm and lock registration before payment",
      );
      return;
    }

    if (busy) {
      return;
    }

    setBusy(true);

    try {
      const response =
        await registrationService.createPaymentOrder(
          studentId,
        );

      const order =
  response.data.data;

if (
  !order.payment_session_id
) {
  throw new Error(
    "Cashfree payment session ID is missing",
  );
}

sessionStorage.setItem(
  "cashfree_order_id",
  order.order_id,
);

sessionStorage.removeItem(
  "cashfree_transaction_id",
);

      const cashfree =
  await load({
    mode:
      process.env
        .NEXT_PUBLIC_CASHFREE_MODE ===
      "production"
        ? "production"
        : "sandbox",
  });

await cashfree.checkout({
  paymentSessionId:
    order.payment_session_id,
  redirectTarget: "_self",
});
      await cashfree.checkout({
        paymentSessionId:
          order.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error(
        "CASHFREE CHECKOUT ERROR:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Unable to start Cashfree payment",
        ),
      );

      setBusy(false);
    }
  };

 

  // if (completed) {
  //   return (
  //     <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071a2f] p-5">
  //       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.22),transparent_32%),linear-gradient(135deg,#061426_0%,#0a2848_55%,#0d3761_100%)]" />

  //       <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white/15 bg-white p-7 text-center shadow-2xl shadow-black/30 sm:p-10">
  //         <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
  //           <CheckCircle2 className="h-11 w-11" />
  //         </div>

  //         <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
  //           Account Activated
  //         </p>

  //         <h1 className="mt-3 text-3xl font-black tracking-tight text-[#071a2f]">
  //           Registration Complete
  //         </h1>

  //         <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
  //           Your internship account is now active. Login using username{" "}
  //           <strong className="text-[#071a2f]">
  //             {getValues("username")}
  //           </strong>
  //           .
  //         </p>

  //         <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left">
  //           <div className="flex items-start gap-3">
  //             <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
  //             <div>
  //               <p className="font-bold text-emerald-900">
  //                 Payment and registration verified
  //               </p>
  //               <p className="mt-1 text-sm leading-6 text-emerald-700">
  //                 Keep your payment receipt for future reference.
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="mt-7 grid gap-3 sm:grid-cols-2">
  //           {/* <Button
  //             variant="secondary"
  //             className="h-12 rounded-xl"
  //             onClick={downloadReceipt}
  //             disabled={busy || !successfulTransactionId}
  //           >
  //             {busy ? (
  //               <>
  //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //                 Downloading...
  //               </>
  //             ) : (
  //               <>
  //                 <FileText className="mr-2 h-4 w-4" />
  //                 Download Receipt
  //               </>
  //             )}
  //           </Button> */}

  //           <Button
  //             className="h-12 rounded-xl bg-[#071a2f] hover:bg-[#0b294b]"
  //             onClick={() => router.push("/login")}
  //           >
  //             Go to Login
  //             <ArrowRight className="ml-2 h-4 w-4" />
  //           </Button>
  //         </div>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[#071a2f]" />
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(59,130,246,0.22),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-black text-white"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#071a2f] shadow-lg shadow-cyan-400/20">
              <Sparkles className="h-5 w-5" />
            </span>

            <span>
              RK<span className="text-cyan-300">Nexora</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Login
          </Link>
        </header>

        <section className="pb-8 pt-12 text-center text-white sm:pt-16">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-cyan-300 backdrop-blur">
            <GraduationCap className="h-7 w-7" />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            Student Onboarding
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Complete Your Registration
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/65">
            Verify your college-uploaded registration number, complete your
            profile, select an internship domain and activate your account.
          </p>
        </section>

        <section className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-6">
          <div className="grid grid-cols-6 gap-2 sm:gap-4">
            {steps.map((name, index) => {
              const active = index <= step;
              const current = index === step;

              return (
                <div key={name} className="min-w-0 text-center">
                  <div className="flex items-center">
                    <div
                      className={`mx-auto grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black transition sm:h-10 sm:w-10 ${
                        active
                          ? "bg-[#071a2f] text-white"
                          : "bg-slate-100 text-slate-400"
                      } ${current ? "ring-4 ring-cyan-100" : ""}`}
                    >
                      {index < step ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>

                  <p
                    className={`mt-2 hidden truncate text-xs font-bold sm:block ${
                      active ? "text-[#071a2f]" : "text-slate-400"
                    }`}
                  >
                    {name}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </section>

       <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] sm:p-8">
          {step === 0 && (
            <>
              <div className="mx-auto max-w-2xl text-center">
  <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
    <UserRoundCheck className="h-7 w-7" />
  </div>
  <h2 className="text-2xl font-black tracking-tight text-[#071a2f]">
    Verify Registration Number
  </h2>
</div>

              <p className="mx-auto mb-7 mt-2 max-w-xl text-center text-sm leading-6 text-slate-500">
                Enter the registration
                number uploaded by your
                college.
              </p>

              <label className="label">
                Registration Number
              </label>

              <Input
                {...register(
                  "registration_number",
                )}
                placeholder="e.g. RKN20260001"
              />

              <FormError
                text={
                  errors
                    .registration_number
                    ?.message
                }
              />

              <Button
                className="mt-6 h-12 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
                onClick={verify}
                disabled={busy}
              >
                {busy && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Verify & Continue
              </Button>
            </>
          )}

          {step === 1 && (
            <div className="mx-auto max-w-4xl rounded-[1.75rem] bg-white">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <p className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Step 2 of 6
                </p>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#071a2f] sm:text-3xl">
                  Academic & Account Details
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete your academic information and create the credentials
                  you will use to access the student portal.
                </p>
              </div>

              {verified && (
                <div className="mb-7 flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <UserRoundCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#071a2f]">
                      {verified.name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Registration: {verified.registration_number}
                    </p>
                  </div>

                  <span className="ml-auto hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                    Verified
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h3 className="font-black text-[#071a2f]">
                      Academic information
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Details must match your college record.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Father Name" error={errors.father_name?.message}>
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        placeholder="Enter father name"
                        {...register("father_name")}
                      />
                    </Field>

                    <Field label="Gender" error={errors.gender?.message}>
                      <select
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        {...register("gender")}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>

                    <Field label="Date of Birth" error={errors.dob?.message}>
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        type="date"
                        {...register("dob")}
                      />
                    </Field>

                    <Field label="Programme" error={errors.programme?.message}>
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        placeholder="e.g. BCA, B.Sc, B.Com"
                        {...register("programme")}
                      />
                    </Field>

                    <Field
                      label="Major Subject"
                      error={errors.major_subject?.message}
                    >
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        placeholder="Enter major subject"
                        {...register("major_subject")}
                      />
                    </Field>

                    <Field label="Session" error={errors.session?.message}>
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        placeholder="e.g. 2026-29"
                        {...register("session")}
                      />
                    </Field>

                    <Field label="Semester" error={errors.semester?.message}>
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        placeholder="e.g. 1"
                        {...register("semester")}
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.35)] sm:p-6">
                  <div className="mb-5">
                    <h3 className="font-black text-[#071a2f]">
                      Contact & login credentials
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Use an active mobile number and email address.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Mobile Number" error={errors.mobile?.message}>
                      <Input
                        className="h-12 rounded-xl px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        {...register("mobile")}
                      />
                    </Field>

                    <Field label="Email Address" error={errors.email?.message}>
                      <Input
                        className="h-12 rounded-xl px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        type="email"
                        placeholder="name@example.com"
                        {...register("email")}
                      />
                    </Field>

                    <Field label="Username" error={errors.username?.message}>
                      <Input
                        className="h-12 rounded-xl px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        autoComplete="username"
                        placeholder="Create username"
                        {...register("username")}
                      />
                    </Field>

                    <div className="hidden sm:block" />

                    <Field label="Password" error={errors.password?.message}>
                      <Input
                        className="h-12 rounded-xl px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        {...register("password")}
                      />
                    </Field>

                    <Field
                      label="Confirm Password"
                      error={errors.confirm_password?.message}
                    >
                      <Input
                        className="h-12 rounded-xl px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-blue-500/10"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        {...register("confirm_password")}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
                <Button
                  className="h-12 rounded-xl px-6"
                  variant="secondary"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  className="h-12 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
                  onClick={goToDomain}
                >
                  Continue to Domain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-4xl rounded-[1.75rem] bg-white">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <p className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Step 3 of 6
                </p>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#071a2f] sm:text-3xl">
                  Select Internship Domain
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose one domain carefully. Your learning modules, duration
                  and payment amount will be based on this selection.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 shadow-inner sm:p-4">
                <div className="space-y-3">
                  {domains.map((domain) => {
                    const isSelected =
                      Number(selectedDomainId) === Number(domain.id);

                    return (
                      <label
                        key={domain.id}
                        className={`group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 sm:p-5 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-900/5 ring-2 ring-blue-500/10"
                            : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          value={domain.id}
                          {...register("domain_id", {
                            valueAsNumber: true,
                          })}
                        />

                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <BookOpenCheck className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="font-black text-[#071a2f]">
                            {domain.domain_name}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            <span>{domain.duration_hours} learning hours</span>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                            <span>Certificate included</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Fee
                            </p>
                            <p className="font-black text-[#071a2f]">
                              ₹{domain.fee}
                            </p>
                          </div>

                          <span
                            className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <FormError text={errors.domain_id?.message} />

              {selectedDomain && (
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                      Selected Domain
                    </p>
                    <p className="mt-1 font-black text-emerald-950">
                      {selectedDomain.domain_name}
                    </p>
                  </div>

                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-emerald-700">Duration</p>
                      <p className="font-bold text-emerald-950">
                        {selectedDomain.duration_hours} hours
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Payable</p>
                      <p className="font-bold text-emerald-950">
                        ₹{selectedDomain.fee}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
                <Button
                  className="h-12 rounded-xl px-6"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  className="h-12 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
                  onClick={saveDetails}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-black tracking-tight text-[#071a2f]">
                Upload Documents
              </h2>

              <div className="mt-7 grid gap-4">
                <FileField
                  label="Passport Photo"
                  accept="image/png,image/jpeg"
                  existingFile={
                    savedDocuments.photo
                  }
                  selectedFile={
                    files.photo
                  }
                  onChange={(
                    file,
                  ) =>
                    setFiles(
                      (
                        current,
                      ) => ({
                        ...current,
                        photo:
                          file,
                      }),
                    )
                  }
                />

                <FileField
                  label="Identity Proof"
                  accept="application/pdf,image/png,image/jpeg"
                  existingFile={
                    savedDocuments.identity_document
                  }
                  selectedFile={
                    files.identity_document
                  }
                  onChange={(
                    file,
                  ) =>
                    setFiles(
                      (
                        current,
                      ) => ({
                        ...current,
                        identity_document:
                          file,
                      }),
                    )
                  }
                />

                <FileField
                  label="Latest Marksheet"
                  accept="application/pdf,image/png,image/jpeg"
                  existingFile={
                    savedDocuments.marksheet
                  }
                  selectedFile={
                    files.marksheet
                  }
                  onChange={(
                    file,
                  ) =>
                    setFiles(
                      (
                        current,
                      ) => ({
                        ...current,
                        marksheet:
                          file,
                      }),
                    )
                  }
                />
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  className="rounded-xl"
                  variant="secondary"
                  onClick={() =>
                    setStep(
                      2,
                    )
                  }
                >
                  Back
                </Button>

                <Button
                  className="rounded-xl bg-[#071a2f] hover:bg-[#0b294b]"
                  onClick={
                    uploadDocuments
                  }
                  disabled={
                    busy
                  }
                >
                  {busy
                    ? "Uploading..."
                    : "Upload & Review"}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#071a2f]">
                    Review Registration
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Verify all details
                    before proceeding to
                    payment.
                  </p>
                </div>

                <FileCheck2 className="h-8 w-8 text-blue-600" />
              </div>

              <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:grid-cols-2 sm:p-5">
                <ReviewItem
                  label="Name"
                  value={
                    verified?.name
                  }
                />

                <ReviewItem
                  label="Registration Number"
                  value={getValues(
                    "registration_number",
                  )}
                />

                <ReviewItem
                  label="Father Name"
                  value={getValues(
                    "father_name",
                  )}
                />

                <ReviewItem
                  label="Gender"
                  value={getValues(
                    "gender",
                  )}
                />

                <ReviewItem
                  label="Date of Birth"
                  value={getValues(
                    "dob",
                  )}
                />

                <ReviewItem
                  label="Programme"
                  value={getValues(
                    "programme",
                  )}
                />

                <ReviewItem
                  label="Major Subject"
                  value={getValues(
                    "major_subject",
                  )}
                />

                <ReviewItem
                  label="Session"
                  value={getValues(
                    "session",
                  )}
                />

                <ReviewItem
                  label="Semester"
                  value={getValues(
                    "semester",
                  )}
                />

                <ReviewItem
                  label="Mobile"
                  value={getValues(
                    "mobile",
                  )}
                />

                <ReviewItem
                  label="Email"
                  value={getValues(
                    "email",
                  )}
                />

                <ReviewItem
                  label="Username"
                  value={getValues(
                    "username",
                  )}
                />

                <ReviewItem
                  label="Domain"
                  value={
                    selectedDomain?.domain_name
                  }
                />

                <ReviewItem
                  label="Fee"
                  value={
                    selectedDomain
                      ? `₹${selectedDomain.fee}`
                      : "-"
                  }
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  Uploaded Documents
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <DocumentStatus
                    label="Passport Photo"
                    available={hasDocument(
                      "photo",
                    )}
                  />

                  <DocumentStatus
                    label="Identity Proof"
                    available={hasDocument(
                      "identity_document",
                    )}
                  />

                  <DocumentStatus
                    label="Marksheet"
                    available={hasDocument(
                      "marksheet",
                    )}
                  />
                </div>
              </div>

              {!registrationLocked && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  After clicking
                  Proceed to Payment,
                  registration details
                  and documents cannot
                  be edited.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                {!registrationLocked && (
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setStep(
                          3,
                        )
                      }
                    >
                      Edit Documents
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() =>
                        setStep(
                          1,
                        )
                      }
                    >
                      Edit Details
                    </Button>
                  </div>
                )}

                <Button
                  className="rounded-xl bg-[#071a2f] hover:bg-[#0b294b]"
                  onClick={
                    registrationLocked
                      ? () =>
                          setStep(
                            5,
                          )
                      : lockAndProceed
                  }
                  disabled={
                    busy
                  }
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#071a2f]">
                    Payment Confirmation
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Registration is
                    locked. Complete the
                    payment to activate
                    your account.
                  </p>
                </div>

                <LockKeyhole className="h-8 w-8 text-blue-600" />
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-7 shadow-lg shadow-blue-900/5">
                <p className="text-sm text-slate-600">
                  Selected Domain
                </p>

                <h3 className="text-lg font-bold text-slate-900">
                  {
                    selectedDomain?.domain_name
                  }
                </h3>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  ₹
                  {
                    selectedDomain?.fee ??
                    0
                  }
                </p>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
  <div className="flex items-start gap-3">
    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

    <div>
      <p className="text-sm font-bold text-emerald-900">
        Secure online payment
      </p>

      <p className="mt-1 text-xs leading-5 text-emerald-700">
        You will be redirected to Cashfree&apos;s secure checkout.
        Your account will activate only after server-side payment
        verification.
      </p>
    </div>
  </div>
</div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  className="rounded-xl bg-[#071a2f] hover:bg-[#0b294b]"
                  onClick={
                    pay
                  }
                  disabled={
                    busy
                  }
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay & Activate Account"
                  )}
                </Button>
              </div>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Your information is protected with secure role-based access.
        </p>
      </div>
    </main>
  );
}

function FormError({
  text,
}: {
  text?: string;
}) {
  if (!text) {
    return null;
  }

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      {text}
    </p>
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
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      {children}

      <FormError text={error} />
    </label>
  );
}

function FileField({
  label,
  accept,
  existingFile,
  selectedFile,
  onChange,
}: {
  label: string;
  accept: string;
  existingFile?: string | null;
  selectedFile?: File;
  onChange: (file?: File) => void;
}) {
  const uploaded = Boolean(selectedFile || existingFile);

  return (
    <label
      className={`group cursor-pointer rounded-2xl border-2 border-dashed p-5 transition ${
        uploaded
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
      }`}
    >
      <Input
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0])}
      />

      <div className="flex items-center gap-4">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            uploaded
              ? "bg-emerald-100 text-emerald-600"
              : "bg-white text-blue-600 shadow-sm"
          }`}
        >
          {uploaded ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#071a2f]">{label}</p>

          {selectedFile ? (
            <p className="mt-1 truncate text-sm text-blue-600">
              Selected: {selectedFile.name}
            </p>
          ) : existingFile ? (
            <p className="mt-1 text-sm font-medium text-emerald-600">
              Already uploaded
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Click to select PDF, PNG or JPG
            </p>
          )}
        </div>

        <span className="hidden rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:block">
          Browse
        </span>
      </div>
    </label>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?:
    | string
    | number
    | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-bold text-[#071a2f]">
        {value || "-"}
      </p>
    </div>
  );
}

function DocumentStatus({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${available ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
      <CheckCircle2
        className={`h-5 w-5 ${
          available
            ? "text-green-600"
            : "text-slate-300"
        }`}
      />

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>
    </div>
  );
}