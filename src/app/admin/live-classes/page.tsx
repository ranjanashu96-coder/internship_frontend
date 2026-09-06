"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CalendarClock,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
  Input,
} from "@/components/ui";

import {
  adminService,
  type AdminDomain,
  type AdminModule,
  type AdminChapter,
  type LiveClassItem,
  type LiveClassStatus,
} from "@/lib/services";

type FormState = {
  domain_id: string;
  module_id: string;
  chapter_id: string;

  title: string;
  description: string;
  instructor_name: string;

  meeting_url: string;
  scheduled_at: string;

  duration_minutes: string;
  popup_minutes_before: string;

  status: LiveClassStatus;
};

const emptyForm: FormState = {
  domain_id: "",
  module_id: "",
  chapter_id: "",

  title: "",
  description: "",
  instructor_name: "",

  meeting_url: "",
  scheduled_at: "",

  duration_minutes: "60",
  popup_minutes_before: "1440",

  status: "scheduled",
};

const errorMessage = (
  error: unknown,
) => {
  const value =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

  return (
    value.response?.data?.message ||
    value.message ||
    "Something went wrong"
  );
};

const formatDateTime = (
  value: string,
) =>
  new Date(value)
    .toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

const toLocalInputValue = (
  value: string,
) => {
  const date =
    new Date(value);

  const offset =
    date.getTimezoneOffset();

  return new Date(
    date.getTime() -
      offset * 60000,
  )
    .toISOString()
    .slice(0, 16);
};

export default function AdminLiveClassesPage() {
  const [
    items,
    setItems,
  ] = useState<LiveClassItem[]>([]);

  const [
    domains,
    setDomains,
  ] = useState<AdminDomain[]>([]);

  const [
    modules,
    setModules,
  ] = useState<AdminModule[]>([]);

  const [
    chapters,
    setChapters,
  ] = useState<AdminChapter[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    modal,
    setModal,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<LiveClassItem | null>(
      null,
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState<FormState>(
    emptyForm,
  );

  const loadReferences =
    useCallback(
      async () => {
        try {
          const [
            domainResponse,
            moduleResponse,
            chapterResponse,
          ] =
            await Promise.all([
              adminService.domains({
                page: 1,
                limit: 100,
              }),

              adminService.modules({
                page: 1,
                limit: 100,
              }),

              adminService.chapters({
                page: 1,
                limit: 100,
              }),
            ]);

          setDomains(
            domainResponse
              .data.data.items ||
              [],
          );

          setModules(
            moduleResponse
              .data.data.items ||
              [],
          );

          setChapters(
            chapterResponse
              .data.data.items ||
              [],
          );
        } catch (error) {
          toast.error(
            errorMessage(error),
          );
        }
      },
      [],
    );

  const loadClasses =
    useCallback(
      async (
        refresh = false,
      ) => {
        refresh
          ? setRefreshing(true)
          : setLoading(true);

        try {
          const response =
            await adminService
              .liveClasses({
                page: 1,
                limit: 100,
              });

          setItems(
            response.data.data
              .items || [],
          );
        } catch (error) {
          toast.error(
            errorMessage(error),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void Promise.all([
      loadReferences(),
      loadClasses(),
    ]);
  }, [
    loadReferences,
    loadClasses,
  ]);

  const filteredModules =
    useMemo(
      () =>
        modules.filter(
          (module) =>
            !form.domain_id ||
            Number(
              module.domain_id,
            ) ===
              Number(
                form.domain_id,
              ),
        ),
      [
        modules,
        form.domain_id,
      ],
    );

  const filteredChapters =
    useMemo(
      () =>
        chapters.filter(
          (chapter) =>
            !form.module_id ||
            Number(
              chapter.module_id,
            ) ===
              Number(
                form.module_id,
              ),
        ),
      [
        chapters,
        form.module_id,
      ],
    );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (
    item: LiveClassItem,
  ) => {
    setEditing(item);

    setForm({
      domain_id:
        String(
          item.domain_id,
        ),

      module_id:
        item.module_id
          ? String(
              item.module_id,
            )
          : "",

      chapter_id:
        item.chapter_id
          ? String(
              item.chapter_id,
            )
          : "",

      title:
        item.title,

      description:
        item.description || "",

      instructor_name:
        item.instructor_name ||
        "",

      meeting_url:
        item.meeting_url,

      scheduled_at:
        toLocalInputValue(
          item.scheduled_at,
        ),

      duration_minutes:
        String(
          item.duration_minutes ||
            60,
        ),

      popup_minutes_before:
        String(
          item.popup_minutes_before ||
            1440,
        ),

      status:
        item.status,
    });

    setModal(true);
  };

  const save = async () => {
    const domainId =
      Number(
        form.domain_id,
      );

    if (!domainId) {
      toast.error(
        "Domain is required",
      );
      return;
    }

    if (
      !form.title.trim()
    ) {
      toast.error(
        "Class title is required",
      );
      return;
    }

    if (
      !form.meeting_url.trim()
    ) {
      toast.error(
        "Meeting link is required",
      );
      return;
    }

    if (
      !form.scheduled_at
    ) {
      toast.error(
        "Date and time is required",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        domain_id:
          domainId,

        module_id:
          form.module_id
            ? Number(
                form.module_id,
              )
            : null,

        chapter_id:
          form.chapter_id
            ? Number(
                form.chapter_id,
              )
            : null,

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        instructor_name:
          form.instructor_name
            .trim(),

        meeting_url:
          form.meeting_url.trim(),

        scheduled_at:
          new Date(
            form.scheduled_at,
          ).toISOString(),

        duration_minutes:
          Number(
            form.duration_minutes ||
              60,
          ),

        popup_minutes_before:
          Number(
            form.popup_minutes_before ||
              1440,
          ),

        status:
          form.status,
      };

      if (editing) {
        await adminService
          .updateLiveClass(
            editing.id,
            payload,
          );

        toast.success(
          "Live class updated",
        );
      } else {
        await adminService
          .createLiveClass(
            payload,
          );

        toast.success(
          "Live class scheduled",
        );
      }

      setModal(false);
      setEditing(null);

      await loadClasses(true);
    } catch (error) {
      toast.error(
        errorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (
    item: LiveClassItem,
  ) => {
    if (
      !window.confirm(
        `Delete "${item.title}"?`,
      )
    ) {
      return;
    }

    try {
      await adminService
        .deleteLiveClass(
          item.id,
        );

      toast.success(
        "Live class deleted",
      );

      await loadClasses(true);
    } catch (error) {
      toast.error(
        errorMessage(error),
      );
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Live Classes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Schedule domain, module or chapter based live classes.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              void loadClasses(
                true,
              );
            }}
            disabled={
              refreshing
            }
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

          <Button
            onClick={
              openCreate
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Class
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Class
                </th>
                <th className="px-4 py-3">
                  Domain / Module
                </th>
                <th className="px-4 py-3">
                  Faculty
                </th>
                <th className="px-4 py-3">
                  Date & Time
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {item.title}
                      </div>

                      {item.chapter && (
                        <div className="mt-1 text-xs text-slate-500">
                          Chapter{" "}
                          {
                            item
                              .chapter
                              .chapter_number
                          }
                          :{" "}
                          {
                            item
                              .chapter
                              .chapter_name
                          }
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        {
                          item.domain
                            ?.domain_name ||
                          "-"
                        }
                      </div>

                      <div className="text-xs text-slate-500">
                        {
                          item.module
                            ?.module_name ||
                          "All modules"
                        }
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {item.instructor_name ||
                        "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CalendarClock
                          size={
                            15
                          }
                        />
                        {formatDateTime(
                          item.scheduled_at,
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {
                          item.duration_minutes
                        }{" "}
                        minutes
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {
                          item.status
                        }
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <a
                          href={
                            item.meeting_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-blue-600"
                          title="Open meeting"
                        >
                          <ExternalLink
                            size={
                              16
                            }
                          />
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              item,
                            )
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200"
                        >
                          <Pencil
                            size={
                              16
                            }
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void remove(
                              item,
                            );
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600"
                        >
                          <Trash2
                            size={
                              16
                            }
                          />
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
                      6
                    }
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No live classes scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="font-black">
                  {editing
                    ? "Edit Live Class"
                    : "Schedule Live Class"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Students of selected domain will see this class.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModal(
                    false,
                  )
                }
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X
                  size={
                    18
                  }
                />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Domain *">
                <select
                  className="field"
                  value={
                    form.domain_id
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        domain_id:
                          event.target.value,
                        module_id:
                          "",
                        chapter_id:
                          "",
                      }),
                    )
                  }
                >
                  <option value="">
                    Select domain
                  </option>

                  {domains.map(
                    (domain) => (
                      <option
                        key={
                          domain.id
                        }
                        value={
                          domain.id
                        }
                      >
                        {
                          domain.domain_name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Module">
                <select
                  className="field"
                  value={
                    form.module_id
                  }
                  disabled={
                    !form.domain_id
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        module_id:
                          event.target.value,
                        chapter_id:
                          "",
                      }),
                    )
                  }
                >
                  <option value="">
                    All modules
                  </option>

                  {filteredModules.map(
                    (module) => (
                      <option
                        key={
                          module.id
                        }
                        value={
                          module.id
                        }
                      >
                        {
                          module.module_number
                        }
                        .{" "}
                        {
                          module.module_name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Chapter">
                <select
                  className="field"
                  value={
                    form.chapter_id
                  }
                  disabled={
                    !form.module_id
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        chapter_id:
                          event.target.value,
                      }),
                    )
                  }
                >
                  <option value="">
                    All chapters
                  </option>

                  {filteredChapters.map(
                    (chapter) => (
                      <option
                        key={
                          chapter.id
                        }
                        value={
                          chapter.id
                        }
                      >
                        {
                          chapter.chapter_number
                        }
                        .{" "}
                        {
                          chapter.chapter_name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Class Title *">
                <Input
                  value={
                    form.title
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        title:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="React Live Session"
                />
              </Field>

              <Field label="Faculty / Trainer">
                <Input
                  value={
                    form.instructor_name
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        instructor_name:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Trainer name"
                />
              </Field>

              <Field label="Date & Time *">
                <Input
                  type="datetime-local"
                  value={
                    form.scheduled_at
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        scheduled_at:
                          event.target.value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="Duration (minutes)">
                <Input
                  type="number"
                  min={
                    1
                  }
                  value={
                    form.duration_minutes
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        duration_minutes:
                          event.target.value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="Popup Before (minutes)">
                <Input
                  type="number"
                  min={
                    1
                  }
                  value={
                    form.popup_minutes_before
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        popup_minutes_before:
                          event.target.value,
                      }),
                    )
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Meeting Link *">
                  <Input
                    value={
                      form.meeting_url
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          meeting_url:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="https://meet.google.com/..."
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    rows={
                      3
                    }
                    className="field min-h-24 py-2"
                    value={
                      form.description
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target.value,
                        }),
                      )
                    }
                  />
                </Field>
              </div>

              {editing && (
                <Field label="Status">
                  <select
                    className="field"
                    value={
                      form.status
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target.value as LiveClassStatus,
                        }),
                      )
                    }
                  >
                    <option value="scheduled">
                      Scheduled
                    </option>
                    <option value="completed">
                      Completed
                    </option>
                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </Field>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <Button
                variant="secondary"
                onClick={() =>
                  setModal(
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
                onClick={() => {
                  void save();
                }}
                disabled={
                  saving
                }
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Video className="mr-2 h-4 w-4" />
                )}

                {editing
                  ? "Update Class"
                  : "Schedule Class"}
              </Button>
            </div>

            <style jsx>{`
              .field {
                width: 100%;
                min-height: 40px;
                border: 1px solid rgb(226 232 240);
                border-radius: 10px;
                padding-left: 12px;
                padding-right: 12px;
                font-size: 14px;
                outline: none;
                background: white;
              }
              .field:focus {
                border-color: rgb(96 165 250);
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
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
