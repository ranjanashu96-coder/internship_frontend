"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  IndianRupee,
  Loader2,
  Save,
} from "lucide-react";

import { Button, PageHeader } from "@/components/ui";
import { adminService } from "@/lib/services";

type LateFineSettings = {
  id: number | null;
  start_date: string | null;
  late_fine_amount: number;
  is_active: boolean;
  updated_at: string | null;
};

export default function LateFineSettingsPage() {
  const [startDate, setStartDate] =
    useState("");
  const [fineAmount, setFineAmount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [existing, setExisting] =
    useState<LateFineSettings | null>(
      null,
    );

  /* Load settings on mount */
  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response =
        await adminService.getLateFineSettings();

      const data = response.data.data;

      setExisting(data);
      setStartDate(data.start_date || "");
      setFineAmount(
        Number(data.late_fine_amount) || 0,
      );
    } catch (error) {
      console.error(
        "Failed to load late fine settings:",
        error,
      );

      toast.error(
        "Failed to load late fine settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    /* Validation */
    if (!startDate) {
      toast.error(
        "Please select a start date",
      );
      return;
    }

    if (
      !Number.isFinite(fineAmount) ||
      fineAmount < 0
    ) {
      toast.error(
        "Fine amount must be a valid positive number",
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await adminService.updateLateFineSettings({
          start_date: startDate,
          late_fine_amount: fineAmount,
        });

      const data = response.data.data;

      setExisting(data);

      toast.success(
        "Late fine settings saved successfully",
      );
    } catch (error) {
      console.error(
        "Failed to save late fine settings:",
        error,
      );

      toast.error(
        "Failed to save late fine settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2
          size={32}
          className="animate-spin text-slate-400"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Late Fine Settings" />

      {/* Info box */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="text-sm font-bold text-blue-900">
              How it works / यह कैसे काम करता है
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              After the start date, all new
              registrations and payments will
              include the late fine amount.
              The late fine is added on top of
              the domain fee.
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Start date के बाद होने वाले सभी
              registration और payment में late
              fine जुड़ जाएगी। यह domain fee के
              ऊपर अलग से add होगी।
            </p>

            <p className="mt-2 text-xs font-semibold text-blue-700">
              ⚠️ Late fine college share में
              नहीं जुड़ेगी।
            </p>
          </div>
        </div>
      </div>

      {/* Settings form */}
      <div className="card max-w-2xl space-y-6">
        {/* Start Date */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Calendar
              size={16}
              className="text-blue-600"
            />
            Late Fine Start Date
            <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            इस date के बाद होने वाले सभी
            registration / payment में late
            fine automatically लगेगी।
          </p>
        </div>

        {/* Fine Amount */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <IndianRupee
              size={16}
              className="text-blue-600"
            />
            Late Fine Amount (₹)
            <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            min="0"
            step="1"
            value={fineAmount}
            onChange={(e) =>
              setFineAmount(
                Number(e.target.value),
              )
            }
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            यह amount हर उस student से ली
            जाएगी जो start date के बाद
            registration/payment करेगा।
          </p>
        </div>

        {/* Current active settings summary */}
        {existing?.start_date && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Current Active Setting
            </p>

            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-emerald-700">
                  Start Date:
                </span>{" "}
                <strong className="text-emerald-900">
                  {existing.start_date}
                </strong>
              </div>

              <div>
                <span className="text-emerald-700">
                  Fine Amount:
                </span>{" "}
                <strong className="text-emerald-900">
                  ₹{existing.late_fine_amount}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end border-t border-slate-200 pt-5">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-xl px-6"
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="mr-2 animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save
                  size={16}
                  className="mr-2"
                />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}