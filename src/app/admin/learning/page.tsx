"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, FileQuestion, Layers3, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import {
  adminService,
  type AdminAssignment,
  type AdminChapter,
  type AdminDomain,
  type AdminModule,
  type AdminSector,
  type ChapterContentType,
  type LearningListParams,
} from "@/lib/services";

type Tab = "sectors" | "domains" | "modules" | "chapters" | "assignments";
type RecordItem = AdminSector | AdminDomain | AdminModule | AdminChapter | AdminAssignment;

type FormState = {
  sector_name: string;
  status: "active" | "inactive";
  sector_id: string;
  domain_name: string;
  fee: string;
  duration_hours: string;
  domain_id: string;
  module_number: string;
  module_name: string;
  module_id: string;
  chapter_number: string;
  chapter_name: string;
  content_type: ChapterContentType;
  content_url: string;
  chapter_id: string;
  question_text: string;
};

const emptyForm: FormState = {
  sector_name: "",
  status: "active",
  sector_id: "",
  domain_name: "",
  fee: "0",
  duration_hours: "0",
  domain_id: "",
  module_number: "",
  module_name: "",
  module_id: "",
  chapter_number: "",
  chapter_name: "",
  content_type: "video",
  content_url: "",
  chapter_id: "",
  question_text: "",
};

const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
  { key: "sectors", label: "Sectors", icon: Layers3 },
  { key: "domains", label: "Domains", icon: BookOpen },
  { key: "modules", label: "Modules", icon: Layers3 },
  { key: "chapters", label: "Chapters", icon: BookOpen },
  { key: "assignments", label: "Assignments", icon: FileQuestion },
];

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return value.response?.data?.message || value.message || "Something went wrong";
};

export default function AdminLearningPage() {
  const [tab, setTab] = useState<Tab>("sectors");
  const [items, setItems] = useState<RecordItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [sectors, setSectors] = useState<AdminSector[]>([]);
  const [domains, setDomains] = useState<AdminDomain[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const title = useMemo(
    () => tabs.find((item) => item.key === tab)?.label || "Learning Setup",
    [tab],
  );

  const loadReferences = useCallback(async () => {
    try {
      const [sectorResponse, domainResponse, moduleResponse, chapterResponse] =
        await Promise.all([
          adminService.sectors({ page: 1, limit: 100 }),
          adminService.domains({ page: 1, limit: 100 }),
          adminService.modules({ page: 1, limit: 100 }),
          adminService.chapters({ page: 1, limit: 100 }),
        ]);

      setSectors(sectorResponse.data.data.items);
      setDomains(domainResponse.data.data.items);
      setModules(moduleResponse.data.data.items);
      setChapters(chapterResponse.data.data.items);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);

    try {
      const params: LearningListParams = {
        page,
        limit: 20,
        search: search.trim() || undefined,
      };

      if (tab === "sectors") params.status = secondaryFilter as "active" | "inactive" | "";
      if (tab === "domains" && filterId) params.sector_id = filterId;
      if (tab === "modules" && filterId) params.domain_id = filterId;
      if (tab === "chapters" && filterId) params.module_id = filterId;
      if (tab === "chapters" && secondaryFilter) {
        params.content_type = secondaryFilter as ChapterContentType;
      }
      if (tab === "assignments" && filterId) params.chapter_id = filterId;

      const response =
        tab === "sectors"
          ? await adminService.sectors(params)
          : tab === "domains"
            ? await adminService.domains(params)
            : tab === "modules"
              ? await adminService.modules(params)
              : tab === "chapters"
                ? await adminService.chapters(params)
                : await adminService.assignments(params);

      setItems(response.data.data.items);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages ?? 0);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filterId, page, search, secondaryFilter, tab]);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadRows(), 250);
    return () => window.clearTimeout(timeout);
  }, [loadRows]);

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    setPage(1);
    setSearch("");
    setFilterId("");
    setSecondaryFilter("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (row: RecordItem) => {
    setEditing(row);

    if (tab === "sectors") {
      const value = row as AdminSector;
      setForm({ ...emptyForm, sector_name: value.sector_name, status: value.status });
    }

    if (tab === "domains") {
      const value = row as AdminDomain;
      setForm({
        ...emptyForm,
        sector_id: String(value.sector_id),
        domain_name: value.domain_name,
        fee: String(value.fee),
        duration_hours: String(value.duration_hours),
      });
    }

    if (tab === "modules") {
      const value = row as AdminModule;
      setForm({
        ...emptyForm,
        domain_id: String(value.domain_id),
        module_number: String(value.module_number),
        module_name: value.module_name,
      });
    }

    if (tab === "chapters") {
      const value = row as AdminChapter;
      setForm({
        ...emptyForm,
        module_id: String(value.module_id),
        chapter_number: String(value.chapter_number),
        chapter_name: value.chapter_name,
        content_type: value.content_type,
        content_url: value.content_url,
      });
    }

    if (tab === "assignments") {
      const value = row as AdminAssignment;
      setForm({
        ...emptyForm,
        chapter_id: String(value.chapter_id),
        question_text: value.question_text,
      });
    }

    setModal(true);
  };

  const save = async () => {
    setSaving(true);

    try {
      if (tab === "sectors") {
        const payload = {
          sector_name: form.sector_name.trim(),
          status: form.status,
        };

        if (!payload.sector_name) throw new Error("Sector name is required");

        editing
          ? await adminService.updateSector(editing.id, payload)
          : await adminService.createSector(payload);
      }

      if (tab === "domains") {
        const payload = {
          sector_id: Number(form.sector_id),
          domain_name: form.domain_name.trim(),
          fee: Number(form.fee),
          duration_hours: Number(form.duration_hours),
        };

        if (!payload.sector_id || !payload.domain_name) {
          throw new Error("Sector and domain name are required");
        }

        editing
          ? await adminService.updateDomain(editing.id, payload)
          : await adminService.createDomain(payload);
      }

      if (tab === "modules") {
        const payload = {
          domain_id: Number(form.domain_id),
          module_number: Number(form.module_number),
          module_name: form.module_name.trim(),
        };

        if (!payload.domain_id || !payload.module_number || !payload.module_name) {
          throw new Error("Domain, module number and module name are required");
        }

        editing
          ? await adminService.updateModule(editing.id, payload)
          : await adminService.createModule(payload);
      }

      if (tab === "chapters") {
        const payload = {
          module_id: Number(form.module_id),
          chapter_number: Number(form.chapter_number),
          chapter_name: form.chapter_name.trim(),
          content_type: form.content_type,
          content_url: form.content_url.trim(),
        };

        if (
          !payload.module_id ||
          !payload.chapter_number ||
          !payload.chapter_name ||
          !payload.content_url
        ) {
          throw new Error("All chapter fields are required");
        }

        editing
          ? await adminService.updateChapter(editing.id, payload)
          : await adminService.createChapter(payload);
      }

      if (tab === "assignments") {
        const payload = {
          chapter_id: Number(form.chapter_id),
          question_text: form.question_text.trim(),
        };

        if (!payload.chapter_id || !payload.question_text) {
          throw new Error("Chapter and question text are required");
        }

        editing
          ? await adminService.updateAssignment(editing.id, payload)
          : await adminService.createAssignment(payload);
      }

      toast.success(editing ? "Updated successfully" : "Created successfully");
      setModal(false);
      await Promise.all([loadRows(), loadReferences()]);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: RecordItem) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      if (tab === "sectors") await adminService.deleteSector(row.id);
      if (tab === "domains") await adminService.deleteDomain(row.id);
      if (tab === "modules") await adminService.deleteModule(row.id);
      if (tab === "chapters") await adminService.deleteChapter(row.id);
      if (tab === "assignments") await adminService.deleteAssignment(row.id);

      toast.success("Deleted successfully");
      await Promise.all([loadRows(), loadReferences()]);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const renderFilters = () => {
    if (tab === "sectors") {
      return (
        <select
          value={secondaryFilter}
          onChange={(event) => {
            setSecondaryFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      );
    }

    const options =
      tab === "domains"
        ? sectors.map((item) => ({ id: item.id, label: item.sector_name }))
        : tab === "modules"
          ? domains.map((item) => ({ id: item.id, label: item.domain_name }))
          : tab === "chapters"
            ? modules.map((item) => ({ id: item.id, label: item.module_name }))
            : chapters.map((item) => ({ id: item.id, label: item.chapter_name }));

    return (
      <>
        <select
          value={filterId}
          onChange={(event) => {
            setFilterId(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        {tab === "chapters" && (
          <select
            value={secondaryFilter}
            onChange={(event) => {
              setSecondaryFilter(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">All content types</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="text">Text</option>
            <option value="link">Link</option>
          </select>
        )}
      </>
    );
  };

  const renderCells = (row: RecordItem) => {
    if (tab === "sectors") {
      const value = row as AdminSector;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.sector_name}</td>
          <td className="px-4 py-4 capitalize">{value.status}</td>
        </>
      );
    }

    if (tab === "domains") {
      const value = row as AdminDomain;
      const sector = value.Sector || value.sector;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.domain_name}</td>
          <td className="px-4 py-4">{sector?.sector_name || "-"}</td>
          <td className="px-4 py-4">₹{Number(value.fee).toLocaleString("en-IN")}</td>
          <td className="px-4 py-4">{value.duration_hours} hours</td>
        </>
      );
    }

    if (tab === "modules") {
      const value = row as AdminModule;
      const domain = value.Domain || value.domain;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.module_name}</td>
          <td className="px-4 py-4">{value.module_number}</td>
          <td className="px-4 py-4">{domain?.domain_name || "-"}</td>
        </>
      );
    }

    if (tab === "chapters") {
      const value = row as AdminChapter;
      const module = value.Module || value.module;
      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.chapter_name}</td>
          <td className="px-4 py-4">{value.chapter_number}</td>
          <td className="px-4 py-4">{module?.module_name || "-"}</td>
          <td className="px-4 py-4 capitalize">{value.content_type}</td>
          <td className="max-w-64 px-4 py-4">
            <a
              href={value.content_url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-blue-600 hover:underline"
            >
              {value.content_url}
            </a>
          </td>
        </>
      );
    }

    const value = row as AdminAssignment;
    const chapter = value.Chapter || value.chapter;
    return (
      <>
        <td className="max-w-2xl px-4 py-4">{value.question_text}</td>
        <td className="px-4 py-4">{chapter?.chapter_name || "-"}</td>
      </>
    );
  };

  const headerCells =
    tab === "sectors"
      ? ["Sector", "Status"]
      : tab === "domains"
        ? ["Domain", "Sector", "Fee", "Duration"]
        : tab === "modules"
          ? ["Module", "Number", "Domain"]
          : tab === "chapters"
            ? ["Chapter", "Number", "Module", "Type", "Content"]
            : ["Question", "Chapter"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Setup</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage sectors, domains, modules, chapters and assignments.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2">
          <Plus size={17} />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-3">
        {tabs.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => changeTab(item.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                tab === item.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-5 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-10"
              placeholder={`Search ${title.toLowerCase()}`}
            />
          </div>

          <div className="flex flex-wrap gap-3">{renderFilters()}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {headerCells.map((header) => (
                  <th key={header} className="px-4 py-3">
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={headerCells.length + 1} className="px-4 py-16 text-center">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={headerCells.length + 1} className="px-4 py-16 text-center">
                    No records found
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {renderCells(row)}
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-lg border p-2 text-slate-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          className="rounded-lg border border-red-200 p-2 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <p className="text-sm text-slate-500">{total} records</p>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              {page} / {Math.max(totalPages, 1)}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">
                {editing ? "Edit" : "Create"} {title.slice(0, -1)}
              </h2>
              <button type="button" onClick={() => setModal(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {tab === "sectors" && (
                <>
                  <Input
                    value={form.sector_name}
                    onChange={(event) => updateForm("sector_name", event.target.value)}
                    placeholder="Sector name"
                  />
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value as "active" | "inactive")
                    }
                    className="h-10 w-full rounded-lg border px-3 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </>
              )}

              {tab === "domains" && (
                <>
                  <select
                    value={form.sector_id}
                    onChange={(event) => updateForm("sector_id", event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm"
                  >
                    <option value="">Select sector</option>
                    {sectors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.sector_name}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={form.domain_name}
                    onChange={(event) => updateForm("domain_name", event.target.value)}
                    placeholder="Domain name"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={form.fee}
                    onChange={(event) => updateForm("fee", event.target.value)}
                    placeholder="Fee"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={form.duration_hours}
                    onChange={(event) => updateForm("duration_hours", event.target.value)}
                    placeholder="Duration hours"
                  />
                </>
              )}

              {tab === "modules" && (
                <>
                  <select
                    value={form.domain_id}
                    onChange={(event) => updateForm("domain_id", event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm"
                  >
                    <option value="">Select domain</option>
                    {domains.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.domain_name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    value={form.module_number}
                    onChange={(event) => updateForm("module_number", event.target.value)}
                    placeholder="Module number"
                  />
                  <Input
                    value={form.module_name}
                    onChange={(event) => updateForm("module_name", event.target.value)}
                    placeholder="Module name"
                  />
                </>
              )}

              {tab === "chapters" && (
                <>
                  <select
                    value={form.module_id}
                    onChange={(event) => updateForm("module_id", event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm"
                  >
                    <option value="">Select module</option>
                    {modules.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.module_name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    value={form.chapter_number}
                    onChange={(event) => updateForm("chapter_number", event.target.value)}
                    placeholder="Chapter number"
                  />
                  <Input
                    value={form.chapter_name}
                    onChange={(event) => updateForm("chapter_name", event.target.value)}
                    placeholder="Chapter name"
                  />
                  <select
                    value={form.content_type}
                    onChange={(event) =>
                      updateForm("content_type", event.target.value as ChapterContentType)
                    }
                    className="h-10 w-full rounded-lg border px-3 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                  </select>
                  <Input
                    value={form.content_url}
                    onChange={(event) => updateForm("content_url", event.target.value)}
                    placeholder="Content URL"
                  />
                </>
              )}

              {tab === "assignments" && (
                <>
                  <select
                    value={form.chapter_id}
                    onChange={(event) => updateForm("chapter_id", event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm"
                  >
                    <option value="">Select chapter</option>
                    {chapters.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.chapter_name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={form.question_text}
                    onChange={(event) => updateForm("question_text", event.target.value)}
                    rows={6}
                    placeholder="Question text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <Button type="button" disabled={saving} onClick={() => void save()}>
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
