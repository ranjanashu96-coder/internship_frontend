"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  PageHeader,
} from "@/components/ui";

import {
  studentService,
  type StudentGeneratedDocument,
  type StudentPayment,
} from "@/lib/services";

const documentLabels:
  Record<string, string> = {
    acceptance_letter:
      "Acceptance Letter",

    certificate:
      "Internship Certificate",

    digital_logbook:
      "Digital Logbook",

    logbook:
      "Digital Logbook",

    attendance_sheet:
      "Attendance Sheet",

    internship_report:
      "Internship Report",

    assessment_marksheet:
      "Assessment Marksheet",

    offer_letter:
      "Internship Offer Letter",
  };

const getErrorMessage = (
  error: unknown,
) => {
  const requestError =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };

      message?: string;
    };

  return (
    requestError.response
      ?.data?.message ||
    requestError.message ||
    "Something went wrong"
  );
};

const getDownloadFileName = (
  contentDisposition:
    string | undefined,
  fallbackName: string,
) => {
  if (!contentDisposition) {
    return fallbackName;
  }

  const utf8Match =
    contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/i,
    );

  if (utf8Match?.[1]) {
    return decodeURIComponent(
      utf8Match[1],
    );
  }

  const normalMatch =
    contentDisposition.match(
      /filename="?([^"]+)"?/i,
    );

  return (
    normalMatch?.[1] ||
    fallbackName
  );
};

const downloadBlobResponse = (
  response: {
    data: BlobPart;

    headers: {
      [key: string]:
        | string
        | string[]
        | undefined;
    };
  },

  fallbackFileName: string,
) => {
  const contentTypeHeader =
    response.headers[
      "content-type"
    ];

  const contentType =
    typeof contentTypeHeader ===
    "string"
      ? contentTypeHeader
      : Array.isArray(
            contentTypeHeader,
          )
        ? contentTypeHeader[0]
        : "application/pdf";

  const dispositionHeader =
    response.headers[
      "content-disposition"
    ];

  const contentDisposition =
    typeof dispositionHeader ===
    "string"
      ? dispositionHeader
      : Array.isArray(
            dispositionHeader,
          )
        ? dispositionHeader[0]
        : undefined;

  const fileName =
    getDownloadFileName(
      contentDisposition,
      fallbackFileName,
    );

  const blob =
    new Blob(
      [response.data],
      {
        type: contentType,
      },
    );

  const blobUrl =
    window.URL.createObjectURL(
      blob,
    );

  const anchor =
    window.document.createElement(
      "a",
    );

  anchor.href = blobUrl;
  anchor.download =
    fileName;

  window.document.body
    .appendChild(anchor);

  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(
    blobUrl,
  );
};

export default function DownloadCenterPage() {
  const [
    documents,
    setDocuments,
  ] =
    useState<
      StudentGeneratedDocument[]
    >([]);

  const [
    payments,
    setPayments,
  ] =
    useState<
      StudentPayment[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    downloadingKey,
    setDownloadingKey,
  ] =
    useState<
      string | null
    >(null);

  const loadDownloadCenter =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const [
            documentsResponse,
            paymentsResponse,
          ] =
            await Promise.all(
              [
                studentService
                  .documents(),

                studentService
                  .payments(),
              ],
            );

          setDocuments(
            documentsResponse
              .data.data
              ?.documents ||
              [],
          );

          setPayments(
            paymentsResponse
              .data.data
              ?.payments ||
              [],
          );
        } catch (
          error
        ) {
          console.error(
            "DOWNLOAD CENTER FETCH ERROR:",
            error,
          );

          toast.error(
            getErrorMessage(
              error,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadDownloadCenter();
  }, [loadDownloadCenter]);

  const downloadDocument =
    async (
      document:
        StudentGeneratedDocument,
    ) => {
      const downloadKey =
        `document-${document.id}`;

      try {
        setDownloadingKey(
          downloadKey,
        );

        const response =
          await studentService
            .downloadDocument(
              document.id,
            );

        const label =
          documentLabels[
            document.type
          ] ||
          document.type;

        downloadBlobResponse(
          {
            data: response.data,
            headers: response.headers as {
              [key: string]:
                | string
                | string[]
                | undefined;
            },
          },
          `${label}.pdf`,
        );

        toast.success(
          "Document downloaded successfully",
        );
      } catch (
        error
      ) {
        console.error(
          "DOCUMENT DOWNLOAD ERROR:",
          error,
        );

        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setDownloadingKey(
          null,
        );
      }
    };

  const downloadPaymentReceipt =
    async (
      payment:
        StudentPayment,
    ) => {
      const downloadKey =
        `payment-${payment.id}`;

      try {
        setDownloadingKey(
          downloadKey,
        );

        const response =
          await studentService
            .downloadPaymentReceipt(
              payment.id,
            );

        downloadBlobResponse(
          {
            data: response.data,
            headers: response.headers as {
              [key: string]:
                | string
                | string[]
                | undefined;
            },
          },
          `payment-receipt-${payment.transaction_id}.pdf`,
        );

        toast.success(
          "Payment receipt downloaded successfully",
        );
      } catch (
        error
      ) {
        console.error(
          "PAYMENT RECEIPT DOWNLOAD ERROR:",
          error,
        );

        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setDownloadingKey(
          null,
        );
      }
    };

  const successfulPayments =
    payments.filter(
      (payment) =>
        [
          "success",
          "paid",
        ].includes(
          payment.status,
        ),
    );

  const totalItems =
    documents.length +
    successfulPayments.length;

  return (
    <>
      <PageHeader
        title="Download Center"
        description="Download your internship documents, certificates and payment receipts."
      />

      <div className="mb-5 flex justify-end">
        <Button
          variant="secondary"
          onClick={() =>
            void loadDownloadCenter()
          }
          disabled={
            loading
          }
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading download center...
            </p>
          </div>
        </div>
      ) : totalItems ===
        0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-800">
            No downloads available
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Documents and payment
            receipts will appear here
            when they become
            available.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Internship Documents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Documents generated
                by the admin or mentor.
              </p>
            </div>

            {documents.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No internship
                documents generated
                yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {documents.map(
                  (
                    document,
                  ) => {
                    const key =
                      `document-${document.id}`;

                    const isDownloading =
                      downloadingKey ===
                      key;

                    return (
                      <div
                        key={
                          document.id
                        }
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText className="h-6 w-6" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {documentLabels[
                                document.type
                              ] ??
                                document.type}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              PDF document
                            </p>

                            {document.generated_at && (
                              <p className="mt-1 text-xs text-slate-400">
                                Generated:{" "}
                                {new Date(
                                  document.generated_at,
                                ).toLocaleDateString(
                                  "en-IN",
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          onClick={() =>
                            void downloadDocument(
                              document,
                            )
                          }
                          disabled={
                            !document.file_url ||
                            downloadingKey !==
                              null
                          }
                        >
                          {isDownloading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}

                          {isDownloading
                            ? "Downloading..."
                            : "Download"}
                        </Button>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Payment Receipts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Receipts for
                successful internship
                registration payments.
              </p>
            </div>

            {successfulPayments.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No successful payment
                receipt is available.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {successfulPayments.map(
                  (
                    payment,
                  ) => {
                    const key =
                      `payment-${payment.id}`;

                    const isDownloading =
                      downloadingKey ===
                      key;

                    return (
                      <div
                        key={
                          payment.id
                        }
                        className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CreditCard className="h-6 w-6" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                Payment Receipt
                              </h3>

                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />

                                Paid
                              </span>
                            </div>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {new Intl.NumberFormat(
                                "en-IN",
                                {
                                  style:
                                    "currency",
                                  currency:
                                    payment.currency ||
                                    "INR",
                                },
                              ).format(
                                Number(
                                  payment.amount ||
                                    0,
                                ),
                              )}
                            </p>

                            {payment.receipt_number && (
                              <p className="mt-1 text-xs text-slate-500">
                                Receipt:{" "}
                                {
                                  payment.receipt_number
                                }
                              </p>
                            )}

                            <p className="mt-1 max-w-64 truncate text-xs text-slate-400">
                              Transaction:{" "}
                              {
                                payment.transaction_id
                              }
                            </p>

                            {(payment.paid_at ||
                              payment.created_at) && (
                              <p className="mt-1 text-xs text-slate-400">
                                Paid:{" "}
                                {new Date(
                                  payment.paid_at ||
                                    payment.created_at ||
                                    "",
                                ).toLocaleDateString(
                                  "en-IN",
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          onClick={() =>
                            void downloadPaymentReceipt(
                              payment,
                            )
                          }
                          disabled={
                            !payment.receipt_available ||
                            downloadingKey !==
                              null
                          }
                        >
                          {isDownloading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}

                          {!payment.receipt_available
                            ? "Not Generated"
                            : isDownloading
                              ? "Downloading..."
                              : "Download"}
                        </Button>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}