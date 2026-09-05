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
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui";

import {
  adminService,
  type AdminCollegeSettlementRow,
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

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
  );
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
  "Something went wrong";

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

export default function AdminCollegePaymentsPage() {
  const [
    items,
    setItems,
  ] =
    useState<
      AdminCollegeSettlementRow[]
    >([]);

  const [
    summary,
    setSummary,
  ] = useState({
    total_colleges: 0,
    gross_revenue: 0,
    total_college_share: 0,
    total_paid: 0,
    remaining_payable: 0,
    pending_colleges: 0,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selected,
    setSelected,
  ] =
    useState<AdminCollegeSettlementRow | null>(
      null,
    );

  const [
    detail,
    setDetail,
  ] =
    useState<CollegeSettlementDetailData | null>(
      null,
    );

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    payOpen,
    setPayOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    paymentDate,
    setPaymentDate,
  ] = useState(
    new Date()
      .toISOString()
      .slice(0, 10),
  );

  const [
    paymentMode,
    setPaymentMode,
  ] =
    useState<CollegeSettlementPaymentMode>(
      "bank_transfer",
    );

  const [
    transactionReference,
    setTransactionReference,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    receipt,
    setReceipt,
  ] =
    useState<File | null>(
      null,
    );

  const load = useCallback(
    async (
      refresh = false,
    ) => {
      refresh
        ? setRefreshing(true)
        : setLoading(true);

      try {
        const response =
          await adminService
            .collegeSettlements({
              search:
                search.trim() ||
                undefined,
            });

        setItems(
          response.data.data
            .items || [],
        );

        setSummary(
          response.data.data
            .summary,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void load();
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [load]);

  const loadDetail =
    async (
      college:
        AdminCollegeSettlementRow,
    ) => {
      try {
        setSelected(
          college,
        );

        setDetailLoading(
          true,
        );

        const response =
          await adminService
            .collegeSettlementDetail(
              college.id,
            );

        setDetail(
          response.data.data,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setDetailLoading(
          false,
        );
      }
    };

  const openPayment =
    async (
      college:
        AdminCollegeSettlementRow,
    ) => {
      await loadDetail(
        college,
      );

      setAmount("");
      setTransactionReference(
        "",
      );
      setRemarks("");
      setReceipt(null);
      setPaymentDate(
        new Date()
          .toISOString()
          .slice(0, 10),
      );
      setPaymentMode(
        "bank_transfer",
      );
      setPayOpen(true);
    };

  const remaining =
    Number(
      detail?.summary
        .remaining_payable ??
        selected?.remaining_payable ??
        0,
    );

  const numericAmount =
    Number(amount || 0);

  const canSubmit =
    numericAmount > 0 &&
    numericAmount <=
      remaining &&
    Boolean(paymentDate) &&
    !saving;

  const savePayment =
    async () => {
      if (!selected) {
        return;
      }

      if (
        numericAmount <= 0
      ) {
        toast.error(
          "Enter payment amount",
        );
        return;
      }

      if (
        numericAmount >
        remaining
      ) {
        toast.error(
          `Amount cannot exceed ${formatCurrency(
            remaining,
          )}`,
        );
        return;
      }

      try {
        setSaving(true);

        await adminService
          .createCollegeSettlement(
            selected.id,
            {
              amount:
                numericAmount,

              payment_date:
                paymentDate,

              payment_mode:
                paymentMode,

              transaction_reference:
                transactionReference.trim(),

              remarks:
                remarks.trim(),

              receipt,
            },
          );

        toast.success(
          "College payment saved",
        );

        setPayOpen(false);

        await Promise.all([
          load(true),
          loadDetail(
            selected,
          ),
        ]);
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const cards =
    useMemo(
      () => [
        {
          label:
            "Gross Collection",
          value:
            formatCurrency(
              summary.gross_revenue,
            ),
          icon:
            BadgeIndianRupee,
        },
        {
          label:
            "College Share",
          value:
            formatCurrency(
              summary.total_college_share,
            ),
          icon:
            Building2,
        },
        {
          label:
            "Total Paid",
          value:
            formatCurrency(
              summary.total_paid,
            ),
          icon:
            CheckCircle2,
        },
        {
          label:
            "Remaining",
          value:
            formatCurrency(
              summary.remaining_payable,
            ),
          icon:
            WalletCards,
        },
        {
          label:
            "Pending Colleges",
          value:
            String(
              summary.pending_colleges,
            ),
          icon:
            Clock3,
        },
      ],
      [summary],
    );

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading college payments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            College Payments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Record college settlements and track earned, paid and pending share.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>

                  <p className="mt-2 text-xl font-black text-slate-900">
                    {value}
                  </p>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon
                    size={
                      19
                    }
                  />
                </div>
              </div>
            </div>
          ),
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Search college, code or university..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  College
                </th>
                <th className="px-4 py-3 text-right">
                  Collection
                </th>
                <th className="px-4 py-3 text-right">
                  Share %
                </th>
                <th className="px-4 py-3 text-right">
                  Earned
                </th>
                <th className="px-4 py-3 text-right">
                  Paid
                </th>
                <th className="px-4 py-3 text-right">
                  Remaining
                </th>
                <th className="px-4 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map(
                (
                  college,
                ) => (
                  <tr
                    key={
                      college.id
                    }
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {
                          college.name
                        }
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        {
                          college.code ||
                          "-"
                        }
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(
                        college.gross_revenue,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {Number(
                        college.college_share_percentage ||
                          0,
                      ).toFixed(
                        2,
                      )}
                      %
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(
                        college.earned_share,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right text-emerald-700">
                      {formatCurrency(
                        college.total_paid,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-amber-700">
                      {formatCurrency(
                        college.remaining_payable,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="View"
                          onClick={() => {
                            void loadDetail(
                              college,
                            );
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        >
                          <Eye
                            size={
                              16
                            }
                          />
                        </button>

                        <button
                          type="button"
                          disabled={
                            Number(
                              college.remaining_payable,
                            ) <=
                            0
                          }
                          onClick={() => {
                            void openPayment(
                              college,
                            );
                          }}
                          className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Plus
                            size={
                              15
                            }
                            className="mr-1"
                          />

                          Pay
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {items.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      7
                    }
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No colleges found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-black text-slate-900">
                {
                  selected.name
                }
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Settlement history and current balance
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelected(
                  null,
                );
                setDetail(
                  null,
                );
              }}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X
                size={
                  18
                }
              />
            </button>
          </div>

          {detailLoading ? (
            <div className="grid min-h-40 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : detail ? (
            <>
              <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-3">
                <SmallStat
                  label="Earned Share"
                  value={formatCurrency(
                    detail
                      .summary
                      .earned_share,
                  )}
                />

                <SmallStat
                  label="Paid"
                  value={formatCurrency(
                    detail
                      .summary
                      .total_paid,
                  )}
                />

                <SmallStat
                  label="Remaining"
                  value={formatCurrency(
                    detail
                      .summary
                      .remaining_payable,
                  )}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">
                        Date
                      </th>
                      <th className="px-4 py-3">
                        Amount
                      </th>
                      <th className="px-4 py-3">
                        Mode
                      </th>
                      <th className="px-4 py-3">
                        Transaction
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
                    {detail.history.map(
                      (
                        payment,
                      ) => (
                        <tr
                          key={
                            payment.id
                          }
                        >
                          <td className="px-4 py-3">
                            {formatDate(
                              payment.payment_date,
                            )}
                          </td>

                          <td className="px-4 py-3 font-bold text-emerald-700">
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

                          <td className="max-w-xs px-4 py-3">
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

                    {detail
                      .history
                      .length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={
                            6
                          }
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No settlement history yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 p-5 text-sm text-red-600">
              <AlertCircle
                size={
                  17
                }
              />
              Unable to load detail.
            </div>
          )}
        </section>
      )}

      {payOpen &&
        selected && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-black text-slate-900">
                    Add College Payment
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      selected.name
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPayOpen(
                      false,
                    )
                  }
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X
                    size={
                      18
                    }
                  />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <SmallStat
                    label="Earned"
                    value={formatCurrency(
                      detail
                        ?.summary
                        .earned_share ||
                        selected.earned_share,
                    )}
                  />

                  <SmallStat
                    label="Already Paid"
                    value={formatCurrency(
                      detail
                        ?.summary
                        .total_paid ||
                        selected.total_paid,
                    )}
                  />

                  <SmallStat
                    label="Balance"
                    value={formatCurrency(
                      remaining,
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Payment Amount *"
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={
                        remaining
                      }
                      value={
                        amount
                      }
                      onChange={(
                        event,
                      ) =>
                        setAmount(
                          event
                            .target
                            .value,
                        )
                      }
                      className="input"
                      placeholder="0.00"
                    />
                  </Field>

                  <Field
                    label="Payment Date *"
                  >
                    <input
                      type="date"
                      value={
                        paymentDate
                      }
                      onChange={(
                        event,
                      ) =>
                        setPaymentDate(
                          event
                            .target
                            .value,
                        )
                      }
                      className="input"
                    />
                  </Field>

                  <Field
                    label="Payment Mode *"
                  >
                    <select
                      value={
                        paymentMode
                      }
                      onChange={(
                        event,
                      ) =>
                        setPaymentMode(
                          event
                            .target
                            .value as CollegeSettlementPaymentMode,
                        )
                      }
                      className="input"
                    >
                      {Object.entries(
                        modeLabel,
                      ).map(
                        ([
                          value,
                          label,
                        ]) => (
                          <option
                            key={
                              value
                            }
                            value={
                              value
                            }
                          >
                            {
                              label
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field
                    label="Transaction / UTR No."
                  >
                    <input
                      value={
                        transactionReference
                      }
                      onChange={(
                        event,
                      ) =>
                        setTransactionReference(
                          event
                            .target
                            .value,
                        )
                      }
                      className="input"
                      placeholder="UTR / cheque / reference no."
                    />
                  </Field>
                </div>

                <Field label="Remarks">
                  <textarea
                    rows={
                      3
                    }
                    value={
                      remarks
                    }
                    onChange={(
                      event,
                    ) =>
                      setRemarks(
                        event
                          .target
                          .value,
                      )
                    }
                    className="input min-h-24 py-2"
                    placeholder="Optional remarks"
                  />
                </Field>

                <Field label="Receipt / Payment Proof">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(
                      event,
                    ) =>
                      setReceipt(
                        event
                          .target
                          .files?.[0] ||
                          null,
                      )
                    }
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-bold file:text-blue-700"
                  />
                </Field>

                {numericAmount >
                  remaining && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    Payment cannot exceed remaining balance of{" "}
                    {formatCurrency(
                      remaining,
                    )}
                    .
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setPayOpen(
                      false,
                    )
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={
                    !canSubmit
                  }
                  onClick={() => {
                    void savePayment();
                  }}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}

                  Save Payment
                </Button>
              </div>
            </div>

            <style jsx>{`
              .input {
                height: 42px;
                width: 100%;
                border-radius: 12px;
                border: 1px solid rgb(226 232 240);
                background: white;
                padding-left: 12px;
                padding-right: 12px;
                font-size: 14px;
                outline: none;
              }

              .input:focus {
                border-color: rgb(96 165 250);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
              }
            `}</style>
          </div>
        )}
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}
