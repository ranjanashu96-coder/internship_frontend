"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import {
  BookOpen,
  ExternalLink,
  FileQuestion,
  FileUp,
  Layers3,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
  type CreateChapterPayload,
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
  content_type: "pdf",
  content_url: "",
  chapter_id: "",
  question_text: "",
};

const tabs: Array<{ key: Tab; label: string; icon: ElementType }> = [
  { key: "sectors", label: "Sectors", icon: Layers3 },
  { key: "domains", label: "Domains", icon: BookOpen },
  { key: "modules", label: "Modules", icon: Layers3 },
  { key: "chapters", label: "Chapters", icon: BookOpen },
  { key: "assignments", label: "Assignments", icon: FileQuestion },
];

const contentLabels: Record<ChapterContentType, string> = {
  video: "Video",
  pdf: "PDF",
  text: "Text",
  link: "Link",
};

const contentAccept: Record<Exclude<ChapterContentType, "link">, string> = {
  video: "video/mp4,video/webm,video/quicktime",
  pdf: "application/pdf",
  text: "text/plain",
};

const errorMessage = (error: unknown) => {
  const value = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return value.response?.data?.message || value.message || "Something went wrong";
};

const resolveContentUrl = (
  contentUrl?: string | null,
) => {
  const safeContentUrl =
    String(contentUrl || "").trim();

  if (!safeContentUrl) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      safeContentUrl,
    )
  ) {
    return safeContentUrl;
  }

  const apiUrl =
    process.env
      .NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const backendOrigin =
    apiUrl.replace(
      /\/api\/?$/,
      "",
    );

  return `${backendOrigin}${
    safeContentUrl.startsWith("/")
      ? ""
      : "/"
  }${safeContentUrl}`;
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
  const [chapterDomainFilter, setChapterDomainFilter] = useState("");
  const [chapterModuleFilter, setChapterModuleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [sectors, setSectors] = useState<AdminSector[]>([]);
  const [domains, setDomains] = useState<AdminDomain[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [chapterFile, setChapterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const title = useMemo(
    () => tabs.find((item) => item.key === tab)?.label || "Learning Setup",
    [tab],
  );

  const chapterFilterModules = useMemo(
    () =>
      modules.filter(
        (module) =>
          !chapterDomainFilter ||
          Number(module.domain_id) === Number(chapterDomainFilter),
      ),
    [modules, chapterDomainFilter],
  );

  const chapterFormModules = useMemo(
    () =>
      modules.filter(
        (module) =>
          !form.domain_id || Number(module.domain_id) === Number(form.domain_id),
      ),
    [modules, form.domain_id],
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

      if (tab === "sectors") {
        params.status = secondaryFilter as "active" | "inactive" | "";
      }

      if (tab === "domains" && filterId) params.sector_id = filterId;
      if (tab === "modules" && filterId) params.domain_id = filterId;

      if (tab === "chapters" && chapterDomainFilter) {
        params.domain_id = chapterDomainFilter;
      }

      if (tab === "chapters" && chapterModuleFilter) {
        params.module_id = chapterModuleFilter;
      }

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
  }, [
    chapterDomainFilter,
    chapterModuleFilter,
    filterId,
    page,
    search,
    secondaryFilter,
    tab,
  ]);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadRows(), 250);
    return () => window.clearTimeout(timeout);
  }, [loadRows]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    setPage(1);
    setSearch("");
    setFilterId("");
    setSecondaryFilter("");
    setChapterDomainFilter("");
    setChapterModuleFilter("");
    setChapterFile(null);
    setEditing(null);
    setModal(false);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setChapterFile(null);
    setModal(true);
  };

  const openEdit = (row: RecordItem) => {
    setEditing(row);
    setChapterFile(null);

    if (tab === "sectors") {
      const value = row as AdminSector;
      setForm({
        ...emptyForm,
        sector_name: value.sector_name,
        status: value.status,
      });
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
      const includedModule = value.Module || value.module;
      const selectedModule = modules.find(
        (module) => Number(module.id) === Number(value.module_id),
      );
      const domainId = selectedModule?.domain_id || includedModule?.domain_id || "";

      setForm({
        ...emptyForm,
        domain_id: domainId ? String(domainId) : "",
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

  const saveChapter = async () => {
    const domainId = Number(form.domain_id);
    const moduleId = Number(form.module_id);
    const chapterNumber = Number(form.chapter_number);
    const chapterName = form.chapter_name.trim();

    if (!domainId) throw new Error("Domain is required");
    if (!moduleId) throw new Error("Module is required");
    if (!chapterNumber || chapterNumber <= 0) {
      throw new Error("Valid chapter number is required");
    }
    if (!chapterName) throw new Error("Chapter name is required");

    const selectedModule = modules.find((module) => Number(module.id) === moduleId);

    if (!selectedModule) throw new Error("Selected module was not found");

    if (Number(selectedModule.domain_id) !== domainId) {
      throw new Error("Selected module does not belong to the selected domain");
    }

    const isLink = form.content_type === "link";
    const existingChapter = editing as AdminChapter | null;

    if (isLink) {
      const contentUrl = form.content_url.trim();

      if (!contentUrl) throw new Error("Content link is required");

      try {
        const parsedUrl = new URL(contentUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        throw new Error("Enter a valid HTTP or HTTPS link");
      }
    } else {
      const fileRequired =
        !editing ||
        existingChapter?.content_type === "link" ||
        existingChapter?.content_type !== form.content_type;

      if (fileRequired && !chapterFile) {
        throw new Error(`${contentLabels[form.content_type]} file is required`);
      }
    }

    const payload: CreateChapterPayload = {
      domain_id: domainId,
      module_id: moduleId,
      chapter_number: chapterNumber,
      chapter_name: chapterName,
      content_type: form.content_type,
      file: isLink ? undefined : chapterFile || undefined,
      content_url: isLink ? form.content_url.trim() : undefined,
    };

    if (editing) {
      await adminService.updateChapter(editing.id, payload);
    } else {
      await adminService.createChapter(payload);
    }
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

        if (editing) await adminService.updateSector(editing.id, payload);
        else await adminService.createSector(payload);
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

        if (editing) await adminService.updateDomain(editing.id, payload);
        else await adminService.createDomain(payload);
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

        if (editing) await adminService.updateModule(editing.id, payload);
        else await adminService.createModule(payload);
      }

      if (tab === "chapters") await saveChapter();

      if (tab === "assignments") {
        const payload = {
          chapter_id: Number(form.chapter_id),
          question_text: form.question_text.trim(),
        };

        if (!payload.chapter_id || !payload.question_text) {
          throw new Error("Chapter and question text are required");
        }

        if (editing) await adminService.updateAssignment(editing.id, payload);
        else await adminService.createAssignment(payload);
      }

      toast.success(editing ? "Updated successfully" : "Created successfully");

      setModal(false);
      setEditing(null);
      setForm(emptyForm);
      setChapterFile(null);

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

    if (tab === "chapters") {
      return (
        <>
          <select
            value={chapterDomainFilter}
            onChange={(event) => {
              setChapterDomainFilter(event.target.value);
              setChapterModuleFilter("");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.domain_name}
              </option>
            ))}
          </select>

          <select
            value={chapterModuleFilter}
            disabled={!chapterDomainFilter}
            onChange={(event) => {
              setChapterModuleFilter(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">All modules</option>
            {chapterFilterModules.map((module) => (
              <option key={module.id} value={module.id}>
                Module {module.module_number} - {module.module_name}
              </option>
            ))}
          </select>

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
        </>
      );
    }

    const options =
      tab === "domains"
        ? sectors.map((item) => ({ id: item.id, label: item.sector_name }))
        : tab === "modules"
          ? domains.map((item) => ({ id: item.id, label: item.domain_name }))
          : chapters.map((item) => ({ id: item.id, label: item.chapter_name }));

    return (
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
      const domain = module?.Domain || module?.domain;

      return (
        <>
          <td className="px-4 py-4 font-semibold">{value.chapter_name}</td>
          <td className="px-4 py-4">{value.chapter_number}</td>
          <td className="px-4 py-4">{domain?.domain_name || "-"}</td>
          <td className="px-4 py-4">{module?.module_name || "-"}</td>
          <td className="px-4 py-4 capitalize">{value.content_type}</td>
          <td className="max-w-64 px-4 py-4">
            <a
              href={resolveContentUrl(value.content_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex max-w-full items-center gap-2 text-blue-600 hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="truncate">Open content</span>
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
            ? ["Chapter", "Number", "Domain", "Module", "Type", "Content"]
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
                  <td
                    colSpan={headerCells.length + 1}
                    className="px-4 py-16 text-center"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-slate-500">Loading...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={headerCells.length + 1}
                    className="px-4 py-16 text-center text-slate-500"
                  >
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
                          className="rounded-lg border p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
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
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              {page} / {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={totalPages === 0 || page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">
                {editing ? "Edit" : "Create"} {title.slice(0, -1)}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                  setChapterFile(null);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {tab === "sectors" && (
                <>
                  <FieldLabel label="Sector Name" required>
                    <Input
                      value={form.sector_name}
                      onChange={(event) => updateForm("sector_name", event.target.value)}
                      placeholder="Sector name"
                    />
                  </FieldLabel>

                  <FieldLabel label="Status" required>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target.value as "active" | "inactive",
                        )
                      }
                      className="h-10 w-full rounded-lg border px-3 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </FieldLabel>
                </>
              )}

              {tab === "domains" && (
                <>
                  <FieldLabel label="Sector" required>
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
                  </FieldLabel>

                  <FieldLabel label="Domain Name" required>
                    <Input
                      value={form.domain_name}
                      onChange={(event) => updateForm("domain_name", event.target.value)}
                      placeholder="Domain name"
                    />
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Fee" required>
                      <Input
                        type="number"
                        min={0}
                        value={form.fee}
                        onChange={(event) => updateForm("fee", event.target.value)}
                        placeholder="Fee"
                      />
                    </FieldLabel>
                    <FieldLabel label="Duration Hours" required>
                      <Input
                        type="number"
                        min={0}
                        value={form.duration_hours}
                        onChange={(event) =>
                          updateForm("duration_hours", event.target.value)
                        }
                        placeholder="Duration hours"
                      />
                    </FieldLabel>
                  </div>
                </>
              )}

              {tab === "modules" && (
                <>
                  <FieldLabel label="Domain" required>
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
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Module Number" required>
                      <Input
                        type="number"
                        min={1}
                        value={form.module_number}
                        onChange={(event) =>
                          updateForm("module_number", event.target.value)
                        }
                        placeholder="Module number"
                      />
                    </FieldLabel>
                    <FieldLabel label="Module Name" required>
                      <Input
                        value={form.module_name}
                        onChange={(event) => updateForm("module_name", event.target.value)}
                        placeholder="Module name"
                      />
                    </FieldLabel>
                  </div>
                </>
              )}

              {tab === "chapters" && (
                <div className="space-y-5">
                  <FieldLabel label="Domain" required>
                    <select
                      value={form.domain_id}
                      onChange={(event) => {
                        updateForm("domain_id", event.target.value);
                        updateForm("module_id", "");
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Select domain</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.domain_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Module" required>
                    <select
                      value={form.module_id}
                      disabled={!form.domain_id}
                      onChange={(event) => updateForm("module_id", event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {form.domain_id ? "Select module" : "Select domain first"}
                      </option>
                      {chapterFormModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          Module {module.module_number} - {module.module_name}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Chapter Number" required>
                      <Input
                        type="number"
                        min={1}
                        value={form.chapter_number}
                        onChange={(event) =>
                          updateForm("chapter_number", event.target.value)
                        }
                        placeholder="e.g. 1"
                      />
                    </FieldLabel>

                    <FieldLabel label="Content Type" required>
                      <select
                        value={form.content_type}
                        onChange={(event) => {
                          const nextType = event.target.value as ChapterContentType;
                          setForm((current) => ({
                            ...current,
                            content_type: nextType,
                            content_url:
                              current.content_type === nextType ? current.content_url : "",
                          }));
                          setChapterFile(null);
                        }}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="video">Video File</option>
                        <option value="pdf">PDF File</option>
                        <option value="text">Text File</option>
                        <option value="link">External Link</option>
                      </select>
                    </FieldLabel>
                  </div>

                  <FieldLabel label="Chapter Name" required>
                    <Input
                      value={form.chapter_name}
                      onChange={(event) => updateForm("chapter_name", event.target.value)}
                      placeholder="Enter chapter name"
                    />
                  </FieldLabel>

                  {form.content_type === "link" ? (
                    <FieldLabel label="Content Link" required>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="url"
                          value={form.content_url}
                          onChange={(event) =>
                            updateForm("content_url", event.target.value)
                          }
                          className="pl-10"
                          placeholder="https://example.com/content"
                        />
                      </div>
                    </FieldLabel>
                  ) : (
                    <FieldLabel
                      label={`Upload ${contentLabels[form.content_type]} File`}
                      required={!editing}
                    >
                      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 transition hover:border-blue-400 hover:bg-blue-50/40">
                        <input
                          type="file"
                          className="sr-only"
                          accept={
                            contentAccept[
                              form.content_type as Exclude<ChapterContentType, "link">
                            ]
                          }
                          onChange={(event) =>
                            setChapterFile(event.target.files?.[0] || null)
                          }
                        />

                        <div className="flex items-center gap-4">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                            <FileUp className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {chapterFile ? chapterFile.name : "Choose file"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {editing && !chapterFile
                                ? "Leave empty to keep the existing file"
                                : form.content_type === "pdf"
                                  ? "Only PDF files are allowed"
                                  : form.content_type === "video"
                                    ? "MP4, WebM or MOV files are allowed"
                                    : "Only TXT files are allowed"}
                            </p>
                          </div>
                        </div>
                      </label>

                      {editing && form.content_url && !chapterFile && (
                        <a
                          href={resolveContentUrl(form.content_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open current content
                        </a>
                      )}
                    </FieldLabel>
                  )}
                </div>
              )}

              {tab === "assignments" && (
                <>
                  <FieldLabel label="Chapter" required>
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
                  </FieldLabel>

                  <FieldLabel label="Question Text" required>
                    <textarea
                      value={form.question_text}
                      onChange={(event) => updateForm("question_text", event.target.value)}
                      rows={6}
                      placeholder="Question text"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </FieldLabel>
                </>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModal(false);
                    setChapterFile(null);
                  }}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <Button type="button" disabled={saving} onClick={() => void save()}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editing ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}