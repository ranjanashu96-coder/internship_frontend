"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  WalletCards,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import {
  collegeService,
  type CollegeSettlementDetailData,
  type CollegeSettlementPaymentMode,
} from "@/lib/services";

const currency =
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    },
  );

const formatCurrency = (
  value?: number | string | null,
) =>
  currency.format(
    Number(value || 0),
  );

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toLocaleDateString(
        "en-IN",
      );
};

const modeLabel:
  Record<
    CollegeSettlementPaymentMode,
    string
  > = {
    bank_transfer:
      "Bank Transfer",
    upi: "UPI",
    cheque: "Cheque",
    cash: "Cash",
    other: "Other",
  };


const getFileUrl = (
  filePath?: string | null,
) => {
  if (!filePath) {
    return "";
  }

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const backendBaseUrl =
    apiUrl.replace(/\/api\/?$/, "");

  return `${backendBaseUrl}${
    filePath.startsWith("/")
      ? filePath
      : `/${filePath}`
  }`;
};

const getErrorMessage = (
  error: any,
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  "Unable to load payments";

export default function CollegePaymentsPage() {
  const [
    data,
    setData,
  ] =
    useState<CollegeSettlementDetailData | null>(
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
    error,
    setError,
  ] = useState("");

  const load =
    useCallback(
      async (
        refresh = false,
      ) => {
        refresh
          ? setRefreshing(
              true,
            )
          : setLoading(true);

        setError("");

        try {
          const response =
            await collegeService
              .payments();

          setData(
            response.data.data,
          );
        } catch (
          requestError
        ) {
          setError(
            getErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const progress =
    useMemo(
      () =>
        Math.max(
          0,
          Math.min(
            100,
            Number(
              data?.summary
                .settlement_percentage ||
                0,
            ),
          ),
        ),
      [
        data?.summary
          .settlement_percentage,
      ],
    );

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !data
  ) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />

          <h2 className="mt-3 text-lg font-black text-slate-900">
            Payments could not be loaded
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={() => {
              void load();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const summary =
    data?.summary;

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-[28px] bg-[#071a2f] px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              College Settlement
            </div>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              My Payments
            </h1>

            <p className="mt-2 text-sm text-white/65">
              {data
                ?.college
                .name ||
                "College"}
              {" • "}
              {Number(
                summary
                  ?.college_share_percentage ||
                  0,
              ).toFixed(
                2,
              )}
              % college share
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={
              refreshing
            }
            onClick={() => {
              void load(true);
            }}
            className="border-white/10 bg-white/10 text-white hover:bg-white/15"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Student Collection"
          value={formatCurrency(
            summary?.gross_revenue,
          )}
          helper={`${Number(
            summary?.successful_payments ||
              0,
          )} successful payments`}
          icon={
            BadgeIndianRupee
          }
        />

        <Metric
          label="My Earned Share"
          value={formatCurrency(
            summary?.earned_share,
          )}
          helper={`${Number(
            summary?.college_share_percentage ||
              0,
          ).toFixed(
            2,
          )}% of successful collection`}
          icon={
            WalletCards
          }
        />

        <Metric
          label="Amount Received"
          value={formatCurrency(
            summary?.total_paid,
          )}
          helper="Total settlement received"
          icon={
            CheckCircle2
          }
        />

        <Metric
          label="Pending Amount"
          value={formatCurrency(
            summary?.remaining_payable,
          )}
          helper="Balance yet to be paid"
          icon={
            Clock3
          }
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-900">
              Settlement Progress
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Received amount against your earned share
            </p>
          </div>

          <div className="text-lg font-black text-slate-900">
            {progress.toFixed(
              1,
            )}
            %
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
          <span>
            Received:{" "}
            <strong className="text-slate-800">
              {formatCurrency(
                summary?.total_paid,
              )}
            </strong>
          </span>

          <span>
            Earned:{" "}
            <strong className="text-slate-800">
              {formatCurrency(
                summary?.earned_share,
              )}
            </strong>
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-black text-slate-900">
            Payment History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Payments recorded by administrator
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Payment Date
                </th>

                <th className="px-4 py-3">
                  Amount Received
                </th>

                <th className="px-4 py-3">
                  Mode
                </th>

                <th className="px-4 py-3">
                  Transaction No.
                </th>

                <th className="px-4 py-3">
                  Remarks
                </th>

                <th className="px-4 py-3">
                  Receipt
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(data
                ?.history ||
                []).map(
                (
                  payment,
                ) => (
                  <tr
                    key={
                      payment.id
                    }
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      {formatDate(
                        payment.payment_date,
                      )}
                    </td>

                    <td className="px-4 py-3 font-black text-emerald-700">
                      {formatCurrency(
                        payment.amount,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {modeLabel[
                        payment.payment_mode
                      ] ||
                        payment.payment_mode}
                    </td>

                    <td className="px-4 py-3">
                      {payment.transaction_reference ||
                        "-"}
                    </td>

                    <td className="max-w-sm px-4 py-3 text-slate-600">
                      {payment.remarks ||
                        "-"}
                    </td>

                    <td className="px-4 py-3">
                      {payment.receipt_file ? (
                        <a
                          href={getFileUrl(
                            payment.receipt_file,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                        >
                          <FileText
                            size={
                              15
                            }
                          />

                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ),
              )}

              {(data
                ?.history
                ?.length ||
                0) ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      6
                    }
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No payment has been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon:
    React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-black text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {helper}
          </p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
