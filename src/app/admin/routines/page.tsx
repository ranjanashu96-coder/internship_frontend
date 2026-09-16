"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  CalendarDays,
  ExternalLink,
  FileImage,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Input, PageHeader } from "@/components/ui";
import {
  adminService,
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

  return (
    value.response?.data?.message ||
    value.message ||
    "Something went wrong"
  );
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const toLocalInputValue = (value?: string | null) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16);
};

type FormState = {
  title: string;
  description: string;
  status: "active" | "inactive";
  published_at: string;
};

const initialForm = (): FormState => ({
  title: "",
  description: "",
  status: "active",
  published_at: toLocalInputValue(),
});

export default function AdminRoutinesPage() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm());
  const [file, setFile] = useState<File | null>(null);

 const load = useCallback(async (showRefresh = false) => {
  try {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const response =
      await adminService.routines();

    setItems(
      response.data.data?.routines ?? [],
    );
  } catch (error) {
    setItems([]);
    toast.error(errorMessage(error));
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCount = useMemo(
    () => items.filter((item) => item.status === "active").length,
    [items],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm());
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: RoutineItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      status: item.status,
      published_at: toLocalInputValue(item.published_at),
    });
    setFile(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setFile(null);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) {
      setFile(null);
      return;
    }

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(selected.type)) {
      toast.error("Only PDF, JPG, PNG or WEBP files are allowed");
      event.target.value = "";
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("Routine file must be 10 MB or smaller");
      event.target.value = "";
      return;
    }

    setFile(selected);
  };

const save = async () => {
  const title = form.title.trim();

  if (!title) {
    toast.error("Routine title is required");
    return;
  }

  if (!editing && !file) {
    toast.error("Please select a routine file");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      title,
      description: form.description.trim(),
      status: form.status,

      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : "",

       routine_file: file,  
    };

    if (editing) {
      await adminService.updateRoutine(
        editing.id,
        payload,
      );

      toast.success(
        "Routine updated successfully",
      );
    } else {
      await adminService.createRoutine(
        payload,
      );

      toast.success(
        "Routine uploaded successfully",
      );
    }

    setModalOpen(false);
    setEditing(null);
    setFile(null);

    await load(true);
  } catch (error) {
    toast.error(errorMessage(error));
  } finally {
    setSaving(false);
  }
};

  const remove = async (item: RoutineItem) => {
    const confirmed = window.confirm(
      `Delete routine “${item.title}”? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await adminService.deleteRoutine(item.id);
      toast.success("Routine deleted successfully");
      setItems((current) => current.filter((row) => row.id !== item.id));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routine Management"
        description="Upload and publish routine files for all students."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => void load(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Routine
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Total Routines</p>
          <p className="mt-2 text-2xl font-bold">{items.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Published / Active</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-slate-600">
            {Math.max(0, items.length - activeCount)}
          </p>
        </div>
      </div>

      <section className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading routines...
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <CalendarDays className="h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold">No routine uploaded yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload the first routine and publish it for students.
            </p>
            <Button className="mt-4" onClick={openCreate}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Routine
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Routine</th>
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Published</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const url = resolveFileUrl(item.file_url || item.file_path);
                  const isImage = item.mime_type?.startsWith("image/");

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            {isImage ? (
                              <FileImage className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 max-w-md text-xs text-slate-500">
                              {item.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <p className="max-w-48 truncate" title={item.original_name || undefined}>
                          {item.original_name || "Routine file"}
                        </p>
                        {item.file_size ? (
                          <p className="mt-1 text-xs text-slate-400">
                            {(Number(item.file_size) / 1024 / 1024).toFixed(2)} MB
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(item.published_at)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={item.status === "active" ? "green" : "slate"}>
                          {item.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary inline-flex items-center"
                          >
                            <ExternalLink className="mr-1.5 h-4 w-4" />
                            View
                          </a>
                          <Button variant="secondary" onClick={() => openEdit(item)}>
                            <Pencil className="mr-1.5 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            disabled={deletingId === item.id}
                            onClick={() => void remove(item)}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1.5 h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "Edit Routine" : "Upload Routine"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Published active routines are visible to every student.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                onClick={closeModal}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Routine Title *</label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="e.g. September 2026 Internship Routine"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Description</label>
                <textarea
                  className="input min-h-24 resize-y"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional details about this routine"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <option value="active">Active / Published</option>
                    <option value="inactive">Inactive / Hidden</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Publish Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        published_at: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Routine File {editing ? "(optional replacement)" : "*"}
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center hover:border-blue-400 hover:bg-blue-50/40">
                  <Upload className="h-7 w-7 text-slate-400" />
                  <span className="mt-2 text-sm font-semibold text-slate-700">
                    {file
                      ? file.name
                      : editing
                        ? itemFileName(editing)
                        : "Choose PDF or image"}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    PDF, JPG, PNG, WEBP · Maximum 10 MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFile}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t bg-slate-50 px-6 py-4">
              <Button variant="secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {editing ? "Save Changes" : "Upload Routine"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function itemFileName(item: RoutineItem) {
  return item.original_name || "Keep current file";
}
