
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  LogIn,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui";
import { registrationService } from "@/lib/services";

type PageStatus =
  | "loading"
  | "success"
  | "pending"
  | "failed";

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
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
      responseError.response?.data?.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const getErrorStatus = (
  error: unknown,
): number | null => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    return (
      error as {
        response?: {
          status?: number;
        };
      }
    ).response?.status ?? null;
  }

  return null;
};

const getErrorData = (
  error: unknown,
): {
  message?: string;
  data?: {
    payment_status?: string;
    order_status?: string;
    transaction_id?: string | null;
    cf_payment_id?: string | null;
  };
} | null => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    return (
      error as {
        response?: {
          data?: {
            message?: string;
            data?: {
              payment_status?: string;
              order_status?: string;
              transaction_id?: string | null;
              cf_payment_id?: string | null;
            };
          };
        };
      }
    ).response?.data ?? null;
  }

  return null;
};

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const initialVerificationDone =
    useRef(false);

  const queryOrderId =
    searchParams.get(
      "order_id",
    );

  const [orderId, setOrderId] =
    useState(
      queryOrderId || "",
    );

  const [status, setStatus] =
    useState<PageStatus>(
      "loading",
    );

  const [message, setMessage] =
    useState(
      "Verifying payment...",
    );

  const [
    transactionId,
    setTransactionId,
  ] = useState<string | null>(
    null,
  );

  const [
    receiptLoading,
    setReceiptLoading,
  ] = useState(false);

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  useEffect(() => {
    const storedOrderId =
      sessionStorage.getItem(
        "cashfree_order_id",
      );

    const resolvedOrderId =
      queryOrderId ||
      storedOrderId ||
      "";

    setOrderId(
      resolvedOrderId,
    );

    const storedTransactionId =
      sessionStorage.getItem(
        "cashfree_transaction_id",
      );

    if (storedTransactionId) {
      setTransactionId(
        storedTransactionId,
      );
    }
  }, [queryOrderId]);

  const saveTransactionReference = (
    value:
      | string
      | null
      | undefined,
  ) => {
    const normalizedValue =
      String(value || "").trim();

    if (!normalizedValue) {
      return;
    }

    setTransactionId(
      normalizedValue,
    );

    sessionStorage.setItem(
      "cashfree_transaction_id",
      normalizedValue,
    );
  };

  const verifyPayment =
    useCallback(async () => {
      if (!orderId) {
        setStatus("failed");

        setMessage(
          "Order ID was not found. Please return to registration and start payment again.",
        );

        return;
      }

      if (verifying) {
        return;
      }

      setVerifying(true);
      setStatus("loading");

      setMessage(
        "Verifying your payment...",
      );

      try {
        const response =
          await registrationService
            .verifyPayment(
              orderId,
            );

        const responseData =
          response.data;

        const result =
          responseData.data;

        const paymentStatus =
          String(
            result?.payment_status ||
              "",
          ).toLowerCase();

        const orderStatus =
          String(
            result?.order_status ||
              "",
          ).toUpperCase();

        saveTransactionReference(
          result?.transaction_id ||
            result?.cf_payment_id,
        );

        if (
          paymentStatus ===
          "paid"
        ) {
          setStatus("success");

          setMessage(
            responseData.message ||
              "Payment verified successfully. Your account is now active.",
          );

          sessionStorage.removeItem(
            "cashfree_order_id",
          );

          return;
        }

        if (
          paymentStatus ===
            "pending" ||
          orderStatus ===
            "ACTIVE"
        ) {
          setStatus("pending");

          setMessage(
            responseData.message ||
              "Payment is still being processed.",
          );

          return;
        }

        setStatus("failed");

        setMessage(
          responseData.message ||
            "Payment could not be verified.",
        );
      } catch (error: unknown) {
        console.error(
          "Payment verification error:",
          error,
        );

        const errorData =
          getErrorData(error);

        const paymentStatus =
          String(
            errorData?.data
              ?.payment_status ||
              "",
          ).toLowerCase();

        const orderStatus =
          String(
            errorData?.data
              ?.order_status ||
              "",
          ).toUpperCase();

        saveTransactionReference(
          errorData?.data
            ?.transaction_id ||
            errorData?.data
              ?.cf_payment_id,
        );

        if (
          getErrorStatus(error) ===
            202 ||
          paymentStatus ===
            "pending" ||
          orderStatus ===
            "ACTIVE"
        ) {
          setStatus("pending");

          setMessage(
            errorData?.message ||
              "Payment is still processing.",
          );

          return;
        }

        setStatus("failed");

        setMessage(
          getErrorMessage(
            error,
            "Unable to verify payment.",
          ),
        );
      } finally {
        setVerifying(false);
      }
    }, [orderId, verifying]);

  useEffect(() => {
    if (
      !orderId ||
      initialVerificationDone.current
    ) {
      return;
    }

    initialVerificationDone.current =
      true;

    void verifyPayment();
  }, [
    orderId,
    verifyPayment,
  ]);

  const downloadReceipt =
    async () => {
      const storedTransactionId =
        sessionStorage.getItem(
          "cashfree_transaction_id",
        );

      const receiptReference =
        transactionId ||
        storedTransactionId;

      if (!receiptReference) {
        setMessage(
          "Transaction ID was not found. Verify the payment again before downloading the receipt.",
        );

        return;
      }

      try {
        setReceiptLoading(true);

        const response =
          await registrationService
            .downloadPaymentReceipt(
              receiptReference,
            );

        const blob =
          new Blob(
            [response.data],
            {
              type: "application/pdf",
            },
          );

        const downloadUrl =
          window.URL
            .createObjectURL(
              blob,
            );

        const disposition =
          String(
            response.headers[
              "content-disposition"
            ] || "",
          );

        const filenameMatch =
          disposition.match(
            /filename="?([^"]+)"?/i,
          );

        const filename =
          filenameMatch?.[1] ||
          `payment-receipt-${receiptReference}.pdf`;

        const anchor =
          document.createElement(
            "a",
          );

        anchor.href =
          downloadUrl;

        anchor.download =
          filename;

        document.body
          .appendChild(anchor);

        anchor.click();
        anchor.remove();

        window.URL
          .revokeObjectURL(
            downloadUrl,
          );
      } catch (
        error: unknown
      ) {
        console.error(
          "Receipt download error:",
          error,
        );

        setMessage(
          getErrorMessage(
            error,
            "Unable to download payment receipt.",
          ),
        );
      } finally {
        setReceiptLoading(
          false,
        );
      }
    };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {status ===
          "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Verifying Payment
            </h2>

            <p className="mt-2 text-slate-500">
              Please wait while we
              confirm your Cashfree
              payment.
            </p>
          </>
        )}

        {status ===
          "success" && (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Payment Successful
            </h2>

            <p className="mt-2 text-slate-600">
              {message}
            </p>

            {orderId && (
              <div className="mt-4 rounded-lg bg-slate-100 p-3 text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {orderId}
                </p>
              </div>
            )}

            {transactionId && (
              <div className="mt-3 rounded-lg bg-slate-100 p-3 text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Transaction ID
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {
                    transactionId
                  }
                </p>
              </div>
            )}

            <Button
              variant="secondary"
              className="mt-6 w-full"
              disabled={
                !transactionId ||
                receiptLoading
              }
              onClick={() =>
                void downloadReceipt()
              }
            >
              {receiptLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading Receipt...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Payment Receipt
                </>
              )}
            </Button>

            <Button
              className="mt-3 w-full"
              onClick={() =>
                router.replace(
                  "/login",
                )
              }
            >
              <LogIn className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </>
        )}

        {status ===
          "pending" && (
          <>
            <Clock3 className="mx-auto h-16 w-16 text-amber-500" />

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Payment Processing
            </h2>

            <p className="mt-2 text-slate-600">
              {message}
            </p>

            {orderId && (
              <div className="mt-4 rounded-lg bg-slate-100 p-3">
                <p className="text-xs text-slate-500">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {orderId}
                </p>
              </div>
            )}

            <Button
              className="mt-6 w-full"
              disabled={
                verifying
              }
              onClick={() =>
                void verifyPayment()
              }
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}

              {verifying
                ? "Verifying..."
                : "Verify Again"}
            </Button>
          </>
        )}

        {status ===
          "failed" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-600" />

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Payment Verification Failed
            </h2>

            <p className="mt-2 text-slate-600">
              {message}
            </p>

            {orderId && (
              <div className="mt-4 rounded-lg bg-slate-100 p-3">
                <p className="text-xs text-slate-500">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {orderId}
                </p>
              </div>
            )}

            <Button
              className="mt-6 w-full"
              disabled={
                verifying ||
                !orderId
              }
              onClick={() =>
                void verifyPayment()
              }
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}

              {verifying
                ? "Verifying..."
                : "Verify Again"}
            </Button>

            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() =>
                router.replace(
                  "/registration",
                )
              }
            >
              Back to Registration
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </main>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}

