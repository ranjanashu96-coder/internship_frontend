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
  FileText,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRoundCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  // marksheet?: string | null;
};

type SelectedFiles = {
  photo?: File;
  identity_document?: File;
  // marksheet?: File;
};

const steps = [
  "Verify",
  "Details",
  "Domain",
  "Documents",
  "Review",
  "Payment",
];


type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (
    response: RazorpaySuccessResponse,
  ) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (
      response: RazorpayFailedResponse,
    ) => void,
  ) => void;
};

type RazorpayConstructor =
  new (
    options: RazorpayCheckoutOptions,
  ) => RazorpayInstance;

const getRazorpayConstructor =
  (): RazorpayConstructor | undefined => {
    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

    return (
      window as typeof window & {
        Razorpay?: RazorpayConstructor;
      }
    ).Razorpay;
  };

const loadRazorpayScript =
  async (): Promise<boolean> => {
    if (typeof window === "undefined") {
      return false;
    }

    if (getRazorpayConstructor()) {
      return true;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

    if (existingScript) {
      return new Promise<boolean>(
        (resolve) => {
          existingScript.addEventListener(
            "load",
            () => resolve(true),
            { once: true },
          );

          existingScript.addEventListener(
            "error",
            () => resolve(false),
            { once: true },
          );
        },
      );
    }

    return new Promise<boolean>(
      (resolve) => {
        const script =
          document.createElement(
            "script",
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload =
          () => resolve(true);

        script.onerror =
          () => resolve(false);

        document.body.appendChild(
          script,
        );
      },
    );
  };

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

  const [
    completed,
    setCompleted,
  ] = useState(false);

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
  portalRegistrationNumber,
  setPortalRegistrationNumber,
] = useState<string | null>(
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

        const domainResponse =
          await registrationService
            .domains(
              student.registration_number,
            );

        setDomains(
          domainResponse.data.data,
        );

        setPortalRegistrationNumber(
  student.portal_registration_number ||
    null,
);

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
        ) 
       
      ) {
        toast.error(
          "Passport photo and latest semester admit card are required",
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

        setPortalRegistrationNumber(
  response.data.data
    .portal_registration_number ||
    null,
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
      toast.error(
        "Student ID is missing",
      );
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
        await registrationService
          .createPaymentOrder(
            studentId,
          );

      const order =
        response.data.data;

      if (
        order.student
          ?.portal_registration_number
      ) {
        setPortalRegistrationNumber(
          order.student
            .portal_registration_number,
        );

        sessionStorage.setItem(
          "portal_registration_number",
          order.student
            .portal_registration_number,
        );
      }

      /*
       * -------------------------------------------------
       * RAZORPAY
       * -------------------------------------------------
       */
      if (
        order.gateway ===
        "razorpay"
      ) {
        if (
          !order.key_id ||
          !order.order_id
        ) {
          throw new Error(
            "Razorpay order details are missing",
          );
        }

        const scriptLoaded =
          await loadRazorpayScript();

        const RazorpayCheckout =
          getRazorpayConstructor();

        if (
          !scriptLoaded ||
          !RazorpayCheckout
        ) {
          throw new Error(
            "Unable to load Razorpay Checkout",
          );
        }

        sessionStorage.setItem(
          "razorpay_order_id",
          order.order_id,
        );

        sessionStorage.removeItem(
          "razorpay_transaction_id",
        );

        let checkoutCompleted =
          false;

        const razorpay =
          new RazorpayCheckout({
            key:
              order.key_id,

            amount:
              order.amount,

            currency:
              order.currency,

            name:
              "RK NEXORA PRIVATE LIMITED",

            description:
              `Internship Registration - ${
                order.domain
                  ?.domain_name ||
                "Programme"
              }`,

            order_id:
              order.order_id,

            prefill: {
              name:
                order.student
                  ?.name ||
                "",

              email:
                order.student
                  ?.email ||
                "",

              contact:
                order.student
                  ?.mobile ||
                "",
            },

            notes: {
              student_id:
                String(
                  studentId,
                ),

              registration_number:
                String(
                  order.student
                    ?.registration_number ||
                  getValues(
                    "registration_number",
                  ),
                ),
            },

            theme: {
              color:
                "#0d5ea6",
            },

            handler:
              async (
                paymentResult,
              ) => {
                checkoutCompleted =
                  true;

                try {
                  const verifyResponse =
                    await registrationService
                      .verifyPayment({
                        gateway:
                          "razorpay",

                        student_id:
                          studentId,

                        razorpay_order_id:
                          paymentResult
                            .razorpay_order_id,

                        razorpay_payment_id:
                          paymentResult
                            .razorpay_payment_id,

                        razorpay_signature:
                          paymentResult
                            .razorpay_signature,
                      });

                  const verifiedPayment =
                    verifyResponse
                      .data.data;

                  if (
                    verifiedPayment
                      .portal_registration_number
                  ) {
                    setPortalRegistrationNumber(
                      verifiedPayment
                        .portal_registration_number,
                    );

                    sessionStorage.setItem(
                      "portal_registration_number",
                      verifiedPayment
                        .portal_registration_number,
                    );
                  }

                  const receiptReference =
                    verifiedPayment
                      .transaction_id ||
                    verifiedPayment
                      .razorpay_payment_id ||
                    verifiedPayment
                      .razorpay_order_id ||
                    null;

                  if (
                    receiptReference
                  ) {
                    setSuccessfulTransactionId(
                      receiptReference,
                    );

                    sessionStorage.setItem(
                      "razorpay_transaction_id",
                      receiptReference,
                    );
                  }

                  if (
                    verifiedPayment
                      .payment_status ===
                    "paid"
                  ) {
                    toast.success(
                      "Payment verified successfully. Your internship account is active.",
                    );

                    setBusy(false);
                    setCompleted(true);

                    return;
                  }

                  toast.info(
                    "Payment received and is awaiting final confirmation.",
                  );

                  setBusy(false);
                } catch (
                  verifyError
                ) {
                  console.error(
                    "RAZORPAY VERIFY ERROR:",
                    verifyError,
                  );

                  toast.error(
                    getErrorMessage(
                      verifyError,
                      "Payment was made but verification failed. Please contact support with your payment ID.",
                    ),
                  );

                  setBusy(false);
                }
              },

            modal: {
              ondismiss: () => {
                if (
                  !checkoutCompleted
                ) {
                  setBusy(false);
                }
              },
            },
          });

        razorpay.on(
          "payment.failed",
          (
            failedResponse,
          ) => {
            console.error(
              "RAZORPAY PAYMENT FAILED:",
              failedResponse,
            );

            toast.error(
              failedResponse
                .error
                ?.description ||
                "Razorpay payment failed. Please try again.",
            );

            setBusy(false);
          },
        );

        razorpay.open();

        return;
      }

      /*
       * -------------------------------------------------
       * CASHFREE
       * -------------------------------------------------
       */
      if (
        order.gateway ===
        "cashfree"
      ) {
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

          redirectTarget:
            "_self",
        });

        return;
      }

      throw new Error(
        "Unsupported payment gateway returned by server",
      );
    } catch (error) {
      console.error(
        "PAYMENT CHECKOUT ERROR:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Unable to start payment",
        ),
      );

      setBusy(false);
    }
  };

  const downloadReceipt =
    async () => {
      if (
        !successfulTransactionId
      ) {
        toast.error(
          "Payment receipt reference is missing",
        );
        return;
      }

      setBusy(true);

      try {
        const response =
          await registrationService
            .downloadPaymentReceipt(
              successfulTransactionId,
            );

        const blob =
          new Blob(
            [response.data],
            {
              type:
                "application/pdf",
            },
          );

        const url =
          window.URL
            .createObjectURL(
              blob,
            );

        const anchor =
          document.createElement(
            "a",
          );

        anchor.href = url;
        anchor.download =
          `RK-Nexora-Payment-Receipt-${successfulTransactionId}.pdf`;

        document.body
          .appendChild(
            anchor,
          );

        anchor.click();
        anchor.remove();

        window.URL
          .revokeObjectURL(
            url,
          );

        toast.success(
          "Payment receipt downloaded",
        );
      } catch (error) {
        console.error(
          "RECEIPT DOWNLOAD ERROR:",
          error,
        );

        toast.error(
          getErrorMessage(
            error,
            "Unable to download payment receipt",
          ),
        );
      } finally {
        setBusy(false);
      }
    };


  if (completed) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071a2f] p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.22),transparent_32%),linear-gradient(135deg,#061426_0%,#0a2848_55%,#0d3761_100%)]" />

        <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white/15 bg-white p-7 text-center shadow-2xl shadow-black/30 sm:p-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
            Payment Successful
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#071a2f]">
            Registration Complete
          </h1>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            पंजीकरण और भुगतान सफलतापूर्वक पूरा हुआ
          </p>

          <p className="mx-auto mt-4 max-w-md leading-7 text-slate-500">
            Your payment has been verified and your internship account is now active.
            Please download and keep your payment receipt for future reference.
          </p>

          {portalRegistrationNumber && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                RK Nexora Registration Number
              </p>

              <p className="mt-2 text-xl font-black tracking-wide text-[#071a2f]">
                {portalRegistrationNumber}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

              <div>
                <p className="font-bold text-emerald-900">
                  Payment and registration verified
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  Your receipt is generated from the verified server-side payment record.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="h-12 rounded-xl"
              onClick={downloadReceipt}
              disabled={
                busy ||
                !successfulTransactionId
              }
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Download Receipt
                </>
              )}
            </Button>

            <Button
              className="h-12 rounded-xl bg-[#071a2f] hover:bg-[#0b294b]"
              onClick={() =>
                router.push(
                  "/login",
                )
              }
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top navigation */}
      <div className="bg-[#071a2f]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-black text-white"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#071a2f] shadow-lg shadow-cyan-400/20">
              <Sparkles className="h-5 w-5" />
            </span>

            <span>
              RK<span className="text-cyan-300">Nexora</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Login / लॉगिन
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page heading */}
        <div className="mb-5">
          <p className="text-sm font-bold text-blue-600">
            Student Internship Registration
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Complete Your Registration
          </h1>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            अपना इंटर्नशिप पंजीकरण पूरा करें
          </p>

         
        </div>

        {/* Main registration card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Step progress */}
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
            <div className="grid grid-cols-6 gap-1 sm:gap-3">
              {steps.map((name, index) => {
                const active = index <= step;
                const completedStep = index < step;

                const hindiLabels = [
                  "सत्यापन",
                  "विवरण",
                  "डोमेन",
                  "दस्तावेज़",
                  "जाँच",
                  "भुगतान",
                ];

                return (
                  <div
                    key={name}
                    className="flex min-w-0 flex-col items-center text-center"
                  >
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                        active
                          ? "bg-[#071a2f] text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {completedStep ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <p
                      className={`mt-1.5 hidden text-[11px] font-bold sm:block ${
                        active ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {name}
                    </p>

                    <p
                      className={`hidden text-[10px] sm:block ${
                        active ? "text-blue-600" : "text-slate-300"
                      }`}
                    >
                      {hindiLabels[index]}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                style={{
                  width: `${((step + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* STEP 1 - VERIFY */}
          {step === 0 && (
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="bg-[#071a2f] p-6 text-white sm:p-8">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-cyan-300">
                  <UserRoundCheck className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  Step 1 of 6
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Verify Your Student Record
                </h2>

                <p className="mt-1 text-sm font-semibold text-cyan-200">
                  अपना छात्र रिकॉर्ड सत्यापित करें
                </p>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  Enter the Registration Number printed on your
                  University/College Admit Card.
                </p>

                <p className="mt-1 text-sm leading-6 text-white/55">
                  अपने University/College Admit Card पर दिया गया Registration
                  Number दर्ज करें।
                </p>

                <div className="mt-6 space-y-3">
                  <InfoCheck>
                    Use your official University/College Registration Number.
                  </InfoCheck>

                  <InfoCheck>
                    Do not enter Roll Number, Mobile Number or RK Nexora
                    Registration Number.
                  </InfoCheck>

                  <InfoCheck>
                    Your record will be matched securely with the data provided
                    by your college.
                  </InfoCheck>
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs leading-5 text-white/70">
                    <strong className="text-white">ध्यान दें:</strong> Roll
                    Number, Mobile Number या RK Nexora Registration Number दर्ज
                    न करें।
                  </p>
                </div>
              </div>

              <div className="flex items-center p-6 sm:p-8 lg:p-10">
                <div className="w-full">
                  <p className="text-sm font-bold text-blue-600">
                    Registration Verification
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-[#071a2f]">
                    Enter Registration Number
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    Registration Number दर्ज करें
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    We will find your student record and continue from the last
                    saved registration step.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    हम आपका छात्र रिकॉर्ड खोजकर पंजीकरण की पिछली स्थिति से आगे
                    बढ़ेंगे।
                  </p>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Registration Number
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <Input
                      {...register("registration_number")}
                      className="h-12 rounded-xl border-slate-300 bg-white px-4 text-base font-semibold uppercase"
                      placeholder="e.g. 24392097661"
                      autoComplete="off"
                    />

                    <FormError
                      text={errors.registration_number?.message}
                    />
                  </div>

                  <Button
                    className="mt-4 h-12 w-full rounded-xl bg-[#071a2f] font-bold hover:bg-[#0b294b]"
                    onClick={verify}
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue / सत्यापित करें
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Secure Student Verification / सुरक्षित सत्यापन
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - DETAILS */}
          {step === 1 && (
            <div className="mx-auto max-w-5xl p-5 sm:p-7">
              <StepIntro
                step="Step 2 of 6"
                title="Academic & Account Details"
                hindiTitle="शैक्षणिक एवं खाता विवरण"
                description="Review your academic information and provide an active mobile number, email address and login credentials."
                hindiDescription="अपनी शैक्षणिक जानकारी की जाँच करें तथा सक्रिय मोबाइल नंबर, ईमेल और लॉगिन विवरण दर्ज करें।"
              />

              {verified && (
                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <UserRoundCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#071a2f]">
                      {verified.name}
                    </p>

                    <p className="mt-0.5 text-sm text-slate-500">
                      College Registration: {verified.registration_number}
                    </p>

                    {verified.portal_registration_number && (
                      <p className="mt-1 text-sm font-bold text-blue-700">
                        RK Nexora Registration:{" "}
                        {verified.portal_registration_number}
                      </p>
                    )}
                  </div>

                  <span className="ml-auto hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                    Verified / सत्यापित
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <FormSection
                  title="Academic Information"
                  hindiTitle="शैक्षणिक जानकारी"
                  description="Review the information and keep it consistent with your college record."
                  hindiDescription="जानकारी की जाँच करें और इसे अपने कॉलेज रिकॉर्ड के अनुसार रखें।"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Father Name / पिता का नाम"
                      error={errors.father_name?.message}
                    >
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4"
                        placeholder="Enter father name"
                        {...register("father_name")}
                      />
                    </Field>

                    <Field
                      label="Gender / लिंग"
                      error={errors.gender?.message}
                    >
                      <select
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        {...register("gender")}
                      >
                        <option value="male">Male / पुरुष</option>
                        <option value="female">Female / महिला</option>
                        <option value="other">Other / अन्य</option>
                      </select>
                    </Field>

                    <Field
                      label="Date of Birth / जन्म तिथि"
                      error={errors.dob?.message}
                    >
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4"
                        type="date"
                        {...register("dob")}
                      />
                    </Field>

                    <Field
                      label="Programme / पाठ्यक्रम"
                      error={errors.programme?.message}
                    >
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4"
                        placeholder="e.g. B.A., B.Sc, B.Com"
                        {...register("programme")}
                      />
                    </Field>

                    <Field
                      label="Major Subject / मुख्य विषय"
                      error={errors.major_subject?.message}
                    >
                      <Input
                        className="h-12 rounded-xl border-slate-200 bg-white px-4"
                        placeholder="Enter major subject"
                        {...register("major_subject")}
                      />
                    </Field>

                    <Field
                      label="Session / सत्र"
                      error={errors.session?.message}
                    >
                      <select
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        {...register("session")}
                      >
                        <option value="">Select Session / सत्र चुनें</option>
                        <option value="2023-27">2023-27</option>
                        <option value="2024-28">2024-28</option>
                      </select>
                    </Field>

                    <Field
                      label="Semester / सेमेस्टर"
                      error={errors.semester?.message}
                    >
                      <select
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        {...register("semester")}
                      >
                        <option value="">
                          Select Semester / सेमेस्टर चुनें
                        </option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                      
                      </select>
                    </Field>
                  </div>
                </FormSection>

                <FormSection
                  title="Contact & Login Credentials"
                  hindiTitle="संपर्क एवं लॉगिन विवरण"
                  description="Use an active mobile number and email. Create credentials that you will use to login."
                  hindiDescription="सक्रिय मोबाइल नंबर और ईमेल दर्ज करें। यही Username और Password आगे लॉगिन करने के लिए उपयोग होंगे।"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Mobile Number / मोबाइल नंबर"
                      error={errors.mobile?.message}
                    >
                      <Input
                        className="h-12 rounded-xl px-4"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        {...register("mobile")}
                      />
                    </Field>

                    <Field
                      label="Email Address / ईमेल"
                      error={errors.email?.message}
                    >
                      <Input
                        className="h-12 rounded-xl px-4"
                        type="email"
                        placeholder="name@example.com"
                        {...register("email")}
                      />
                    </Field>

                    <Field
                      label="Username / यूज़रनेम"
                      error={errors.username?.message}
                    >
                      <Input
                        className="h-12 rounded-xl px-4"
                        autoComplete="username"
                        placeholder="Create username"
                        {...register("username")}
                      />
                    </Field>

                    <div className="hidden sm:block" />

                    <Field
                      label="Password / पासवर्ड"
                      error={errors.password?.message}
                    >
                      <Input
                        className="h-12 rounded-xl px-4"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        {...register("password")}
                      />
                    </Field>

                    <Field
                      label="Confirm Password / पासवर्ड की पुष्टि"
                      error={errors.confirm_password?.message}
                    >
                      <Input
                        className="h-12 rounded-xl px-4"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        {...register("confirm_password")}
                      />
                    </Field>
                  </div>
                </FormSection>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                <Button
                  className="h-11 rounded-xl px-6"
                  variant="secondary"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back / वापस
                </Button>

                <Button
                  className="h-11 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
                  onClick={goToDomain}
                >
                  Continue to Domain / डोमेन चुनें
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 - DOMAIN */}
          {step === 2 && (
            <div className="mx-auto max-w-5xl p-5 sm:p-7">
              <StepIntro
                step="Step 3 of 6"
                title="Select Internship Domain"
                hindiTitle="इंटर्नशिप डोमेन चुनें"
                description="Choose an internship domain based on your interests and career goals. Students from any course or stream may select any available domain."
                hindiDescription="अपनी रुचि और करियर लक्ष्य के अनुसार कोई भी उपलब्ध इंटर्नशिप डोमेन चुनें। किसी भी पाठ्यक्रम या स्ट्रीम के विद्यार्थी उपलब्ध डोमेन में से चयन कर सकते हैं।"
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="grid gap-3 lg:grid-cols-2">
                  {domains.map((domain) => {
                    const isSelected =
                      Number(selectedDomainId) === Number(domain.id);

                    return (
                      <label
                        key={domain.id}
                        className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-4 transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/10"
                            : "border-slate-200 hover:border-blue-300"
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

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {domain.duration_hours} Learning Hours / प्रशिक्षण
                            घंटे
                          </p>

                          <p className="text-xs leading-5 text-slate-400">
                            Certificate Included / प्रमाणपत्र शामिल
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Fee / शुल्क
                          </p>

                          <p className="font-black text-[#071a2f]">
                            ₹{domain.fee}
                          </p>
                        </div>

                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <FormError text={errors.domain_id?.message} />

              {selectedDomain && (
                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                      Selected Domain / चयनित डोमेन
                    </p>

                    <p className="mt-1 font-black text-emerald-950">
                      {selectedDomain.domain_name}
                    </p>
                  </div>

                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-emerald-700">Duration / अवधि</p>
                      <p className="font-bold text-emerald-950">
                        {selectedDomain.duration_hours} hours
                      </p>
                    </div>

                    <div>
                      <p className="text-emerald-700">Payable Fee / शुल्क</p>
                      <p className="font-bold text-emerald-950">
                        ₹{selectedDomain.fee}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                <Button
                  className="h-11 rounded-xl px-6"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back / वापस
                </Button>

                <Button
                  className="h-11 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
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
                      Save & Continue / सेव करें
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 - DOCUMENTS */}
          {step === 3 && (
            <div className="mx-auto max-w-4xl p-5 sm:p-7">
              <StepIntro
                step="Step 4 of 6"
                title="Upload Required Documents"
                hindiTitle="आवश्यक दस्तावेज़ अपलोड करें"
                description="Upload a clear passport-size photograph and your latest semester admit card."
                hindiDescription="अपना साफ पासपोर्ट आकार का फोटो और नवीनतम सेमेस्टर का Admit Card अपलोड करें।"
              />

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Document Guidelines / दस्तावेज़ निर्देश
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Upload clear and readable files. Your photo should clearly
                      show your face and the admit card details must be readable.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      सभी दस्तावेज़ साफ और पढ़ने योग्य होने चाहिए। फोटो में चेहरा
                      और Admit Card की जानकारी स्पष्ट दिखाई देनी चाहिए।
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <FileField
  label="Passport Photo / पासपोर्ट फोटो"
  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
  hint="Only JPG, JPEG, PNG or WEBP image, maximum 5 MB"
  existingFile={savedDocuments.photo}
  selectedFile={files.photo}
  onChange={(file) => {
    if (!file) {
      setFiles((current) => ({
        ...current,
        photo: undefined,
      }));

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedExtension =
      /\.(jpg|jpeg|png|webp)$/i;

    const validMimeType =
      allowedTypes.includes(
        file.type,
      );

    const validExtension =
      allowedExtension.test(
        file.name,
      );

    if (
      !validMimeType ||
      !validExtension
    ) {
      toast.error(
        "Passport photo must be a JPG, JPEG, PNG or WEBP image. PDF, Word and Excel files are not allowed.",
      );

      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (
      file.size > maximumSize
    ) {
      toast.error(
        "Passport photo must be smaller than 5 MB.",
      );

      return;
    }

    setFiles((current) => ({
      ...current,
      photo: file,
    }));
  }}
/>

                <FileField
  label="Latest Semester Admit Card / नवीनतम सेमेस्टर Admit Card"
  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/png,image/jpeg"
  hint="PDF, JPG, JPEG or PNG, maximum 5 MB"
  existingFile={
    savedDocuments.identity_document
  }
  selectedFile={
    files.identity_document
  }
  onChange={(file) =>
    setFiles((current) => ({
      ...current,
      identity_document:
        file,
    }))
  }
/>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                <Button
                  className="h-11 rounded-xl px-6"
                  variant="secondary"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back / वापस
                </Button>

                <Button
                  className="h-11 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
                  onClick={uploadDocuments}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload & Review / अपलोड करके जाँचें
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5 - REVIEW */}
          {step === 4 && (
            <div className="mx-auto max-w-5xl p-5 sm:p-7">
              <StepIntro
                step="Step 5 of 6"
                title="Review Your Registration"
                hindiTitle="अपने पंजीकरण की जाँच करें"
                description="Carefully review all information before confirming. After confirmation, your details and uploaded documents will be locked."
                hindiDescription="पुष्टि करने से पहले सभी जानकारी ध्यान से जाँच लें। पुष्टि के बाद विवरण और अपलोड किए गए दस्तावेज़ लॉक हो जाएंगे।"
              />

              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <ReviewItem label="Name / नाम" value={verified?.name} />

                <ReviewItem
                  label="Registration Number"
                  value={getValues("registration_number")}
                />

                <ReviewItem
                  label="Father Name / पिता का नाम"
                  value={getValues("father_name")}
                />

                <ReviewItem
                  label="Gender / लिंग"
                  value={getValues("gender")}
                />

                <ReviewItem
                  label="Date of Birth / जन्म तिथि"
                  value={getValues("dob")}
                />

                <ReviewItem
                  label="Programme / पाठ्यक्रम"
                  value={getValues("programme")}
                />

                <ReviewItem
                  label="Major Subject / मुख्य विषय"
                  value={getValues("major_subject")}
                />

                <ReviewItem
                  label="Session / सत्र"
                  value={getValues("session")}
                />

                <ReviewItem
                  label="Semester / सेमेस्टर"
                  value={getValues("semester")}
                />

                <ReviewItem
                  label="Mobile / मोबाइल"
                  value={getValues("mobile")}
                />

                <ReviewItem
                  label="Email / ईमेल"
                  value={getValues("email")}
                />

                <ReviewItem
                  label="Username / यूज़रनेम"
                  value={getValues("username")}
                />

                <ReviewItem
                  label="Domain / डोमेन"
                  value={selectedDomain?.domain_name}
                />

                <ReviewItem
                  label="Fee / शुल्क"
                  value={selectedDomain ? `₹${selectedDomain.fee}` : "-"}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-[#071a2f]">
                  Uploaded Documents / अपलोड किए गए दस्तावेज़
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <DocumentStatus
                    label="Passport Photo / पासपोर्ट फोटो"
                    available={hasDocument("photo")}
                  />

                  <DocumentStatus
                    label="Latest Semester Admit Card / Admit Card"
                    available={hasDocument("identity_document")}
                  />
                </div>
              </div>

              {!registrationLocked && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Please Review Carefully / कृपया ध्यान से जाँच करें
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        After you proceed to payment, registration details and
                        documents cannot be edited.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        भुगतान के लिए आगे बढ़ने के बाद पंजीकरण विवरण और
                        दस्तावेज़ों में बदलाव नहीं किया जा सकेगा।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                {!registrationLocked ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="h-11 rounded-xl"
                      variant="secondary"
                      onClick={() => setStep(3)}
                    >
                      Edit Documents / दस्तावेज़ बदलें
                    </Button>

                    <Button
                      className="h-11 rounded-xl"
                      variant="secondary"
                      onClick={() => setStep(1)}
                    >
                      Edit Details / विवरण बदलें
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-emerald-700">
                    Registration Locked / पंजीकरण लॉक है
                  </div>
                )}

                <Button
                  className="h-11 rounded-xl bg-[#071a2f] px-6 hover:bg-[#0b294b]"
                  onClick={
                    registrationLocked ? () => setStep(5) : lockAndProceed
                  }
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="mr-2 h-4 w-4" />
                      Proceed to Payment / भुगतान करें
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6 - PAYMENT */}
          {step === 5 && (
            <div className="mx-auto max-w-4xl p-5 sm:p-7">
              <StepIntro
                step="Step 6 of 6"
                title="Complete Your Payment"
                hindiTitle="भुगतान पूरा करें"
                description="Your registration has been confirmed and locked. Complete the secure online payment to activate your internship account."
                hindiDescription="आपका पंजीकरण पुष्टि करके लॉक कर दिया गया है। इंटर्नशिप खाता सक्रिय करने के लिए सुरक्षित ऑनलाइन भुगतान पूरा करें।"
              />

              {portalRegistrationNumber && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        RK Nexora Registration Number
                      </p>

                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        आरके नेक्सोरा पंजीकरण संख्या
                      </p>

                      <p className="mt-2 text-xl font-black tracking-wide text-[#071a2f]">
                        {portalRegistrationNumber}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        This registration number will become active after
                        successful payment.
                        <br />
                        सफल भुगतान के बाद यह पंजीकरण संख्या सक्रिय हो जाएगी।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid sm:grid-cols-[1fr_auto]">
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                      Selected Domain / चयनित डोमेन
                    </p>

                    <h3 className="mt-2 text-xl font-black text-[#071a2f]">
                      {selectedDomain?.domain_name || "-"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedDomain?.duration_hours || 0} Learning Hours /
                      प्रशिक्षण घंटे
                    </p>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-5 sm:min-w-[190px] sm:border-l sm:border-t-0 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                      Payable Fee / शुल्क
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#071a2f]">
                      ₹{selectedDomain?.fee ?? 0}
                    </p>
                  </div>
                </div>

                <div className="border-t border-emerald-100 bg-emerald-50 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        Secure Online Payment / सुरक्षित ऑनलाइन भुगतान
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        You will be redirected to our secure payment gateway.
                        Your account will activate only after server-side
                        payment verification.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-600">
                        आपको सुरक्षित ऑनलाइन भुगतान पेज पर भेजा जाएगा।
                        भुगतान सत्यापित होने के बाद ही आपका खाता सक्रिय होगा।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="mt-5 h-12 w-full rounded-xl bg-[#071a2f] text-base font-bold hover:bg-[#0b294b]"
                onClick={pay}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Pay & Activate Account / भुगतान करें
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                Do not refresh or close the page while payment is processing.
                <br />
                भुगतान प्रक्रिया के दौरान पेज को Refresh या Close न करें।
              </p>
            </div>
          )}
        </section>

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          Your information is protected with secure role-based access. /
          आपकी जानकारी सुरक्षित है।
        </div>
      </div>
    </main>
  );
}

function StepIntro({
  step,
  title,
  hindiTitle,
  description,
  hindiDescription,
}: {
  step: string;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
}) {
  return (
    <div className="mb-6 border-b border-slate-100 pb-5">
      <p className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
        {step}
      </p>

      <h2 className="mt-3 text-2xl font-black tracking-tight text-[#071a2f] sm:text-3xl">
        {title}
      </h2>

      <p className="mt-1 text-sm font-semibold text-blue-700">
        {hindiTitle}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-400">
        {hindiDescription}
      </p>
    </div>
  );
}

function InfoCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
      <p className="text-sm leading-6 text-white/80">{children}</p>
    </div>
  );
}

function FormSection({
  title,
  hindiTitle,
  description,
  hindiDescription,
  children,
}: {
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="font-black text-[#071a2f]">{title}</h3>
        <p className="mt-0.5 text-sm font-semibold text-blue-700">
          {hindiTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          {hindiDescription}
        </p>
      </div>

      {children}
    </div>
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
  children: React.ReactNode;
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
  hint,
  existingFile,
  selectedFile,
  onChange,
}: {
  label: string;
  accept: string;
  hint?: string;
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
              Already uploaded / पहले से अपलोड
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              {hint || "Click to select PDF, PNG or JPG / फ़ाइल चुनें"}
            </p>
          )}
        </div>

        <span className="hidden rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:block">
          Browse / चुनें
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
  value?: string | number | null;
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
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <CheckCircle2
        className={`h-5 w-5 ${
          available ? "text-green-600" : "text-slate-300"
        }`}
      />

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>
    </div>
  );
}