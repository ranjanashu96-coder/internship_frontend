"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button, PageHeader } from "@/components/ui";
import {
  studentService,
  type RoutineItem,
} from "@/lib/services";

const API_ROOT =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const resolveFileUrl = (value?: string | null) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ROOT}/${value.replace(/^\/+/, "")}`;
};

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return value.response?.data?.message || value.message || "Unable to load routine";
};

const formatDate = (value?: string | null) => {
  if (!value) return "Published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function StudentRoutinePage() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await studentService.routines();
      const routines = response.data.data.routines || [];
      setItems(routines);
      setSelectedId((current) => {
        if (current && routines.some((item) => item.id === current)) return current;
        return routines[0]?.id ?? null;
      });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0] || null,
    [items, selectedId],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading routine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routine"
        description="View and download the latest routine published by the administration."
        action={
          <Button
            variant="secondary"
            disabled={refreshing}
            onClick={() => void load(true)}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      {items.length === 0 ? (
        <section className="card flex min-h-72 flex-col items-center justify-center text-center">
          <CalendarDays className="h-14 w-14 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold">Routine not published yet</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            The administration has not published an active routine yet. Please check again later.
          </p>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="card h-fit p-3">
            <div className="px-2 pb-3 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Published Routines
              </p>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const active = selected?.id === item.id;
                const isImage = item.mime_type?.startsWith("image/");

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isImage ? (
                          <FileImage className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="line-clamp-2 flex-1 text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          {index === 0 && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(item.published_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {selected && <RoutineViewer routine={selected} />}
        </div>
      )}
    </div>
  );
}

function RoutineViewer({ routine }: { routine: RoutineItem }) {
  const url = resolveFileUrl(routine.file_url || routine.file_path);
  const isPdf = routine.mime_type === "application/pdf" || url.toLowerCase().endsWith(".pdf");
  const isImage = routine.mime_type?.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(url);

  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Current Selection
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{routine.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{formatDate(routine.published_at)}</p>
            {routine.description && (
              <p className="mt-3 max-w-2xl text-sm text-slate-600">{routine.description}</p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary inline-flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </a>
            <a
              href={url}
              download={routine.original_name || undefined}
              className="btn-primary inline-flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-3 sm:p-5">
        {isPdf ? (
          <iframe
            title={routine.title}
            src={url}
            className="h-[72vh] min-h-[560px] w-full rounded-xl border bg-white"
          />
        ) : isImage ? (
          <div className="flex min-h-[520px] items-start justify-center rounded-xl border bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={routine.title}
              className="max-h-[72vh] max-w-full rounded-lg object-contain"
            />
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-white p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-semibold">Preview is not available</h3>
            <p className="mt-1 text-sm text-slate-500">
              Open or download the routine file using the buttons above.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
