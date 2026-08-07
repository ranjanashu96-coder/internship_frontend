"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  IndianRupee,
  Loader2,
  RotateCcw,
  Save,
  Search,
} from "lucide-react";
import {
  useParams,
} from "next/navigation";
import {
  toast,
} from "sonner";

import {
  adminService,
} from "@/lib/services";

import type {
  CollegeDomainFeeItem,
} from "@/lib/services";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

const getErrorMessage = (
  error: unknown,
) => {
  const apiError =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

  return (
    apiError.response
      ?.data
      ?.message ||
    apiError.message ||
    "Something went wrong"
  );
};

export default function CollegeDomainFeesPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const collegeId =
    Number(
      params.id,
    );

  const [
    college,
    setCollege,
  ] =
    useState<{
      id: number;
      name: string;
      code: string;
    } | null>(
      null,
    );

  const [
    domains,
    setDomains,
  ] =
    useState<
      CollegeDomainFeeItem[]
    >([]);

  const [
    feeValues,
    setFeeValues,
  ] =
    useState<
      Record<number, string>
    >({});

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      "",
    );

  const [
    selectedDomainIds,
    setSelectedDomainIds,
  ] = useState<number[]>([]);

  const [
    bulkFee,
    setBulkFee,
  ] = useState("");

  const loadFees =
    async () => {
      if (!collegeId) {
        toast.error(
          "Invalid college ID",
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        const response =
          await adminService
            .collegeDomainFees(
              collegeId,
            );

        const data =
          response.data.data;

        setCollege(
          data.college,
        );

        setDomains(
          data.items ||
          [],
        );

        const nextFeeValues:
          Record<
            number,
            string
          > = {};

        for (
          const domain of
          data.items || []
        ) {
          nextFeeValues[
            domain.id
          ] =
            domain.custom_fee !==
              null &&
            domain.custom_fee !==
              undefined
              ? String(
                  domain.custom_fee,
                )
              : "";
        }

        setFeeValues(
          nextFeeValues,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  useEffect(
    () => {
      void loadFees();
    },
    [collegeId],
  );

  const filteredDomains =
    useMemo(
      () => {
        const keyword =
          search
            .trim()
            .toLowerCase();

        if (!keyword) {
          return domains;
        }

        return domains.filter(
          (domain) =>
            domain.domain_name
              .toLowerCase()
              .includes(
                keyword,
              ),
        );
      },
      [
        domains,
        search,
      ],
    );

  const selectedDomainCount =
    selectedDomainIds.length;

  const allDomainsSelected =
    domains.length > 0 &&
    selectedDomainIds.length ===
      domains.length;

  const toggleDomainSelection = (
    domainId: number,
  ) => {
    setSelectedDomainIds(
      (current) =>
        current.includes(domainId)
          ? current.filter(
              (id) =>
                id !== domainId,
            )
          : [
              ...current,
              domainId,
            ],
    );
  };

  const toggleSelectAllDomains =
    () => {
      setSelectedDomainIds(
        allDomainsSelected
          ? []
          : domains.map(
              (domain) =>
                domain.id,
            ),
      );
    };

  const setBulkFeeValue = (
    value: string,
  ) => {
    if (
      value &&
      !/^\d*\.?\d{0,2}$/.test(
        value,
      )
    ) {
      return;
    }

    setBulkFee(value);
  };

  const saveBulkFee =
    async () => {
      if (
        selectedDomainIds.length ===
        0
      ) {
        toast.error(
          "Pehle kam se kam ek domain select karein",
        );
        return;
      }

      const fee =
        Number(
          bulkFee,
        );

      if (
        !Number.isFinite(fee) ||
        fee <= 0
      ) {
        toast.error(
          "Valid bulk fee enter karein",
        );
        return;
      }

      try {
        setSaving(true);

        await adminService
          .saveCollegeDomainFees(
            collegeId,
            {
              fees:
                selectedDomainIds.map(
                  (domainId) => ({
                    domain_id:
                      domainId,
                    fee,
                    status:
                      "active" as const,
                  }),
                ),
            },
          );

        toast.success(
          `${selectedDomainIds.length} domains ki fee ₹${fee.toLocaleString(
            "en-IN",
          )} set ho gayi`,
        );

        setSelectedDomainIds([]);
        setBulkFee("");

        await loadFees();
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

  const resetSelectedToDefault =
    async () => {
      if (
        selectedDomainIds.length ===
        0
      ) {
        toast.error(
          "Pehle domains select karein",
        );
        return;
      }

      try {
        setSaving(true);

        await adminService
          .saveCollegeDomainFees(
            collegeId,
            {
              fees:
                selectedDomainIds.map(
                  (domainId) => ({
                    domain_id:
                      domainId,
                    use_default:
                      true,
                  }),
                ),
            },
          );

        toast.success(
          `${selectedDomainIds.length} domains default fee par reset ho gaye`,
        );

        setSelectedDomainIds([]);
        setBulkFee("");

        await loadFees();
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

  const setDomainFee = (
    domainId: number,
    value: string,
  ) => {
    if (
      value &&
      !/^\d*\.?\d{0,2}$/.test(
        value,
      )
    ) {
      return;
    }

    setFeeValues(
      (current) => ({
        ...current,
        [domainId]:
          value,
      }),
    );
  };

  const useDefaultFee = (
    domainId: number,
  ) => {
    setFeeValues(
      (current) => ({
        ...current,
        [domainId]:
          "",
      }),
    );
  };

  const saveFees =
    async () => {
      const fees =
        domains.map(
          (domain) => {
            const rawValue =
              (
                feeValues[
                  domain.id
                ] ||
                ""
              ).trim();

            if (!rawValue) {
              return {
                domain_id:
                  domain.id,

                use_default:
                  true,
              };
            }

            const fee =
              Number(
                rawValue,
              );

            return {
              domain_id:
                domain.id,

              fee,

              status:
                "active" as const,
            };
          },
        );

      const invalidFee =
        fees.find(
          (item) =>
            !item.use_default &&
            (
              !Number.isFinite(
                item.fee,
              ) ||
              Number(
                item.fee,
              ) <= 0
            ),
        );

      if (invalidFee) {
        toast.error(
          "College fee must be greater than zero",
        );

        return;
      }

      try {
        setSaving(
          true,
        );

        const response =
          await adminService
            .saveCollegeDomainFees(
              collegeId,
              {
                fees,
              },
            );

        toast.success(
          response.data
            .message ||
            "Domain fees saved successfully",
        );

        await loadFees();
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  const customFeeCount =
    domains.filter(
      (domain) => {
        const value =
          feeValues[
            domain.id
          ];

        return Boolean(
          value &&
          Number(value) >
            0,
        );
      },
    ).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading domain fees...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Domain Fees"
        description={
          college
            ? `Set domain-wise fees for ${college.name} (${college.code}). Empty fee will use the default domain fee.`
            : "Set college-wise domain fees."
        }
        action={
          <Link href="/admin/colleges">
            <Button
              type="button"
              variant="secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Colleges
            </Button>
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Domains
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {domains.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Custom Fees
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {customFeeCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Default Fees
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {domains.length -
              customFeeCount}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Domain Fee Configuration
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter a custom fee or leave it empty to use the global domain fee.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              placeholder="Search domain..."
              className="pl-9"
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
            />
          </div>
        </div>

        {domains.length > 0 && (
          <div className="border-b bg-slate-50/70 p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={
                      allDomainsSelected
                    }
                    onChange={
                      toggleSelectAllDomains
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  Select All Domains
                </label>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {selectedDomainCount} selected
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-52">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    type="text"
                    inputMode="decimal"
                    value={bulkFee}
                    placeholder="Same fee for selected"
                    className="pl-9"
                    onChange={(event) =>
                      setBulkFeeValue(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <Button
                  type="button"
                  disabled={
                    saving ||
                    selectedDomainCount === 0 ||
                    !bulkFee
                  }
                  onClick={() =>
                    void saveBulkFee()
                  }
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  Update Selected
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    saving ||
                    selectedDomainCount === 0
                  }
                  onClick={() =>
                    void resetSelectedToDefault()
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Default Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredDomains.length ===
        0 ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-slate-500">
            No domains found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="w-12 px-5 py-3 text-left text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={
                        allDomainsSelected
                      }
                      onChange={
                        toggleSelectAllDomains
                      }
                      aria-label="Select all domains"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Domain
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Duration
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Default Fee
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    College Fee
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Effective Fee
                  </th>

                  <th className="px-5 py-3 text-right text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredDomains.map(
                  (domain) => {
                    const customValue =
                      feeValues[
                        domain.id
                      ] ||
                      "";

                    const effectiveFee =
                      customValue &&
                      Number(
                        customValue,
                      ) >
                        0
                        ? Number(
                            customValue,
                          )
                        : Number(
                            domain.default_fee,
                          );

                    return (
                      <tr
                        key={
                          domain.id
                        }
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={
                              selectedDomainIds.includes(
                                domain.id,
                              )
                            }
                            onChange={() =>
                              toggleDomainSelection(
                                domain.id,
                              )
                            }
                            aria-label={`Select ${domain.domain_name}`}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {
                              domain.domain_name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Domain ID:{" "}
                            {domain.id}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {
                            domain.duration_hours
                          }{" "}
                          hours
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-700">
                            ₹
                            {Number(
                              domain.default_fee,
                            ).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="relative w-44">
                            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              type="text"
                              inputMode="decimal"
                              value={
                                customValue
                              }
                              placeholder={`Default ₹${Number(
                                domain.default_fee,
                              ).toLocaleString(
                                "en-IN",
                              )}`}
                              className="pl-9"
                              onChange={(
                                event,
                              ) =>
                                setDomainFee(
                                  domain.id,
                                  event
                                    .target
                                    .value,
                                )
                              }
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-emerald-700">
                            ₹
                            {effectiveFee.toLocaleString(
                              "en-IN",
                            )}
                          </p>

                          <span
                            className={
                              customValue
                                ? "mt-1 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                                : "mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                            }
                          >
                            {customValue
                              ? "College fee"
                              : "Default fee"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={
                              !customValue
                            }
                            onClick={() =>
                              useDefaultFee(
                                domain.id,
                              )
                            }
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Use Default
                          </Button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col justify-between gap-4 border-t bg-slate-50 p-5 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            Empty college fee means the global default domain fee will be used.
          </p>

          <Button
            type="button"
            disabled={
              saving ||
              domains.length ===
                0
            }
            onClick={() =>
              void saveFees()
            }
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}

            {saving
              ? "Saving..."
              : "Save Domain Fees"}
          </Button>
        </div>
      </section>
    </div>
  );
}