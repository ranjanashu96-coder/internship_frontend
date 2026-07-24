"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

interface CertificateData {
  id: number;
  student_id: number;
  certificate_number: string;
  certificate_url: string | null;
  qr_code_url: string | null;
  verification_url: string | null;
  issued_date: string;
  created_at: string;
  updated_at: string;
}

interface CertificateResponse {
  success: boolean;
  data: CertificateData;
  message: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const API_ORIGIN =
  API_BASE_URL.replace(
    /\/api\/?$/,
    "",
  );

const buildFileUrl = (
  fileUrl?: string | null,
) => {
  if (!fileUrl) {
    return null;
  }

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  return `${API_ORIGIN}${
    fileUrl.startsWith("/")
      ? fileUrl
      : `/${fileUrl}`
  }`;
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
};

export default function CertificateVerificationPage() {
  const params = useParams<{
    certificateNumber: string;
  }>();

  const certificateNumber =
    useMemo(
      () =>
        decodeURIComponent(
          params.certificateNumber ||
          "",
        ),
      [params.certificateNumber],
    );

  const [
    certificate,
    setCertificate,
  ] =
    useState<CertificateData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    const verifyCertificate =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/public/certificates/${encodeURIComponent(
                certificateNumber,
              )}`,
              {
                method: "GET",
                cache: "no-store",
              },
            );

          const result =
            (await response.json()) as CertificateResponse;

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
              "Certificate verification failed",
            );
          }

          setCertificate(
            result.data,
          );
        } catch (requestError) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Certificate verification failed";

          setError(message);
        } finally {
          setLoading(false);
        }
      };

    if (certificateNumber) {
      void verifyCertificate();
    }
  }, [certificateNumber]);

  const certificateUrl =
    buildFileUrl(
      certificate?.certificate_url,
    );

  const qrCodeUrl =
    buildFileUrl(
      certificate?.qr_code_url,
    );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-lg">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-600">
            Verifying certificate...
          </p>
        </div>
      </main>
    );
  }

  if (
    error ||
    !certificate
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
            ×
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Certificate Not Verified
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            {error ||
              "The certificate could not be found."}
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Certificate Number
            </p>

            <p className="mt-1 break-all font-semibold text-slate-900">
              {certificateNumber}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-10 text-center text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Certificate Verified
          </h1>

          <p className="mt-2 text-sm text-blue-100">
            This certificate is authentic and available in our official records.
          </p>
        </div>

        <div className="p-6 md:p-10">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Valid Certificate
            </p>

            <p className="mt-2 break-all text-xl font-bold text-emerald-900">
              {certificate.certificate_number}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Student ID
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {certificate.student_id}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Issue Date
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formatDate(
                  certificate.issued_date,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Verification Status
              </p>

              <p className="mt-2 font-semibold text-emerald-600">
                Verified
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Record Created
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {formatDate(
                  certificate.created_at,
                )}
              </p>
            </div>
          </div>

          {qrCodeUrl && (
            <div className="mt-8 text-center">
              <img
                src={qrCodeUrl}
                alt="Certificate verification QR code"
                className="mx-auto h-36 w-36 rounded-xl border border-slate-200 p-2"
              />
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {certificateUrl && (
              <a
                href={certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View Certificate
              </a>
            )}

            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Print Verification
            </button>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-slate-500">
            This verification page is generated from the official RKNexora internship records.
          </p>
        </div>
      </div>
    </main>
  );
}