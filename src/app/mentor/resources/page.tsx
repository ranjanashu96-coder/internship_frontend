"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  FileText,
  Files,
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
  mentorService,
  type AdminChapterResource,
  type ChapterResourceType,
  type CreateChapterResourcePayload,
  type MentorResourceChapterOption,
} from "@/lib/services";

const RESOURCE_TYPES: Array<{ value: ChapterResourceType; label: string }> = [
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "ppt", label: "PowerPoint" },
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "text", label: "Text / Notes" },
  { value: "link", label: "External Link" },
  { value: "zip", label: "ZIP" },
  { value: "source_code", label: "Source Code" },
  { value: "other", label: "Other" },
];

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const resolveResourceUrl = (value?: string | null) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return value.response?.data?.message || value.message || "Something went wrong";
};

type FormState = {
  title: string;
  resource_type: ChapterResourceType;
  external_url: string;
  text_content: string;
  sort_order: string;
  is_downloadable: boolean;
  is_primary: boolean;
  status: "active" | "inactive";
};

const initialForm = (): FormState => ({
  title: "",
  resource_type: "pdf",
  external_url: "",
  text_content: "",
  sort_order: "1",
  is_downloadable: true,
  is_primary: false,
  status: "active",
});

export default function MentorResourcesPage() {
  const [chapters, setChapters] = useState<MentorResourceChapterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [resources, setResources] = useState<AdminChapterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminChapterResource | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<FormState>(initialForm());

  const loadChapters = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await mentorService.resourceChapters();
      const items = response.data.data?.items || [];
      setChapters(items);

      setSelectedChapterId((current) => {
        if (current && items.some((item) => String(item.id) === current)) return current;
        return items.length > 0 ? String(items[0].id) : "";
      });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadResources = useCallback(async (chapterId: number) => {
    try {
      setResourceLoading(true);
      const response = await mentorService.chapterResources(chapterId);
      setResources(response.data.data?.resources || []);
    } catch (error) {
      setResources([]);
      toast.error(errorMessage(error));
    } finally {
      setResourceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChapters();
  }, [loadChapters]);

  useEffect(() => {
    const chapterId = Number(selectedChapterId);
    if (Number.isInteger(chapterId) && chapterId > 0) {
      void loadResources(chapterId);
    } else {
      setResources([]);
    }
  }, [selectedChapterId, loadResources]);

  const selectedChapter = useMemo(
    () => chapters.find((chapter) => String(chapter.id) === selectedChapterId) || null,
    [chapters, selectedChapterId],
  );

  const openCreate = () => {
    if (!selectedChapterId) {
      toast.error("Select a chapter first");
      return;
    }
    setEditing(null);
    setFile(null);
    setForm({
      ...initialForm(),
      sort_order: String(resources.length + 1),
    });
    setModalOpen(true);
  };

  const openEdit = (resource: AdminChapterResource) => {
    setEditing(resource);
    setFile(null);
    setForm({
      title: resource.title || "",
      resource_type: resource.resource_type,
      external_url: resource.external_url || "",
      text_content: resource.text_content || "",
      sort_order: String(resource.sort_order || 1),
      is_downloadable: Boolean(resource.is_downloadable),
      is_primary: Boolean(resource.is_primary),
      status: resource.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setFile(null);
  };

  const save = async () => {
    try {
      const chapterId = Number(selectedChapterId);
      if (!Number.isInteger(chapterId) || chapterId <= 0) {
        throw new Error("Select a chapter");
      }

      const title = form.title.trim();
      if (!title) throw new Error("Resource title is required");

      if (form.resource_type === "link" && !form.external_url.trim()) {
        throw new Error("External URL is required for link resources");
      }

      if (
        form.resource_type === "text" &&
        !form.text_content.trim() &&
        !file &&
        !editing?.file_url
      ) {
        throw new Error("Text content or a text file is required");
      }

      if (
        !["link", "text"].includes(form.resource_type) &&
        !file &&
        !editing?.file_url
      ) {
        throw new Error("Select a file for this resource");
      }

      const sortOrder = Number(form.sort_order);
      if (!Number.isInteger(sortOrder) || sortOrder < 1) {
        throw new Error("Sort order must be at least 1");
      }

      const payload: CreateChapterResourcePayload = {
        title,
        resource_type: form.resource_type,
        file: file || undefined,
        external_url: form.external_url.trim(),
        text_content: form.text_content.trim(),
        sort_order: sortOrder,
        is_downloadable: form.is_downloadable,
        is_primary: form.is_primary,
        status: form.status,
      };

      setSaving(true);

      if (editing) {
        await mentorService.updateChapterResource(editing.id, payload);
        toast.success("Resource updated successfully");
      } else {
        await mentorService.createChapterResource(chapterId, payload);
        toast.success("Resource added successfully");
      }

      setModalOpen(false);
      setEditing(null);
      setFile(null);
      await loadResources(chapterId);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (resource: AdminChapterResource) => {
    if (!window.confirm(`Delete \"${resource.title}\"?`)) return;

    try {
      setDeletingId(resource.id);
      await mentorService.deleteChapterResource(resource.id);
      toast.success("Resource deleted successfully");

      const chapterId = Number(selectedChapterId);
      if (chapterId > 0) await loadResources(chapterId);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Resources"
        description="Add and manage resources only for chapters in your assigned domain."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => void loadChapters(true)}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh
            </Button>
            <Button onClick={openCreate} disabled={!selectedChapterId}>
              <Plus size={16} />
              Add Resource
            </Button>
          </div>
        }
      />

      <div className="card">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Chapter</label>
            {loading ? (
              <div className="flex h-11 items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" /> Loading chapters...
              </div>
            ) : (
              <select
                value={selectedChapterId}
                onChange={(event) => setSelectedChapterId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {chapters.length === 0 ? <option value="">No chapters available</option> : null}
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.module?.module_name || `Module ${chapter.module_id}`} — Chapter {chapter.chapter_number}: {chapter.chapter_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{resources.length}</span> resource{resources.length === 1 ? "" : "s"}
          </div>
        </div>

        {selectedChapter ? (
          <div className="mt-4 text-sm text-slate-500">
            {selectedChapter.module?.module_name || "Module"} / {selectedChapter.chapter_name}
          </div>
        ) : null}
      </div>

      <div className="card overflow-hidden p-0">
        {resourceLoading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <Files size={36} className="text-slate-300" />
            <h2 className="mt-3 font-bold text-slate-900">No resources added</h2>
            <p className="mt-1 text-sm text-slate-500">Add video, PDF, notes, links, code, or other learning files for this chapter.</p>
            <Button className="mt-4" onClick={openCreate} disabled={!selectedChapterId}>
              <Plus size={16} /> Add Resource
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Flags</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {resources.map((resource) => {
                  const resourceUrl =
                    resource.resource_type === "link"
                      ? resource.external_url || ""
                      : resolveResourceUrl(resource.file_url);

                  return (
                    <tr key={resource.id} className="align-top">
                      <td className="px-5 py-4 font-semibold text-slate-600">{resource.sort_order}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{resource.title}</div>
                        {resource.file_name ? <div className="mt-1 max-w-sm truncate text-xs text-slate-500">{resource.file_name}</div> : null}
                        {resource.resource_type === "text" && resource.text_content ? (
                          <div className="mt-1 max-w-md line-clamp-2 text-xs text-slate-500">{resource.text_content}</div>
                        ) : null}
                      </td>
                      <td className="px-5 py-4"><Badge>{resource.resource_type}</Badge></td>
                      <td className="px-5 py-4">
                        <Badge>{resource.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        <div>{resource.is_primary ? "Primary" : "Standard"}</div>
                        <div>{resource.is_downloadable ? "Downloadable" : "View only"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {resourceUrl ? (
                            <a
                              href={resourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                              title="Open resource"
                            >
                              <ExternalLink size={16} />
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openEdit(resource)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                            title="Edit resource"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(resource)}
                            disabled={deletingId === resource.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            title="Delete resource"
                          >
                            {deletingId === resource.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Resource" : "Add Resource"}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedChapter?.chapter_name || "Selected chapter"}</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Resource title" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Resource Type</label>
                  <select
                    value={form.resource_type}
                    onChange={(event) => setForm((current) => ({ ...current, resource_type: event.target.value as ChapterResourceType }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {RESOURCE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Sort Order</label>
                  <Input type="number" min={1} value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} />
                </div>
              </div>

              {form.resource_type === "link" ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">External URL</label>
                  <Input value={form.external_url} onChange={(event) => setForm((current) => ({ ...current, external_url: event.target.value }))} placeholder="https://..." />
                </div>
              ) : null}

              {form.resource_type === "text" ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Text / Notes</label>
                  <textarea
                    value={form.text_content}
                    onChange={(event) => setForm((current) => ({ ...current, text_content: event.target.value }))}
                    rows={7}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter chapter notes..."
                  />
                </div>
              ) : null}

              {form.resource_type !== "link" ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {editing?.file_url ? "Replace File (optional)" : form.resource_type === "text" ? "Attach File (optional)" : "File"}
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 hover:bg-slate-100">
                    <Upload size={18} />
                    <span className="min-w-0 flex-1 truncate">{file?.name || editing?.file_name || "Choose file"}</span>
                    <input type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                  </label>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.is_downloadable} onChange={(event) => setForm((current) => ({ ...current, is_downloadable: event.target.checked }))} />
                  Downloadable
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.is_primary} onChange={(event) => setForm((current) => ({ ...current, is_primary: event.target.checked }))} />
                  Primary Resource
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "active" | "inactive" }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : editing ? <FileText size={16} /> : <Plus size={16} />}
                {editing ? "Update Resource" : "Add Resource"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
