"use client";

import {
  Bell,
  CheckCheck,
  Inbox,
  Loader2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  notificationService,
} from "@/lib/services";

import type {
  Notification as AppNotification,
} from "@/types";

function formatNotificationTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference /
        60_000,
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 7) {
    return `${days} day${
      days > 1
        ? "s"
        : ""
    } ago`;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export function NotificationBell() {
  const router =
    useRouter();

  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<
    AppNotification[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    readingId,
    setReadingId,
  ] = useState<
    number | null
  >(null);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const loadNotifications =
    useCallback(
      async (
        showLoader = false,
      ) => {
        if (showLoader) {
          setLoading(true);
        }

        try {
          const [
            listResponse,
            countResponse,
          ] =
            await Promise.all([
              notificationService
                .list(
                  1,
                  20,
                ),

              notificationService
                .unreadCount(),
            ]);

          setNotifications(
            listResponse
              .data
              .data
              .items ??
              [],
          );

          setUnreadCount(
            Number(
              countResponse
                .data
                .data
                .unread_count ??
                0,
            ),
          );
        } catch (error) {
          console.error(
            "NOTIFICATION LOAD ERROR:",
            error,
          );
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [],
    );

  useEffect(() => {
    void loadNotifications(
      true,
    );

    const timer =
      window.setInterval(
        () => {
          void loadNotifications();
        },
        30_000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [loadNotifications]);

  useEffect(() => {
    const handleOutsideClick =
      (
        event: MouseEvent,
      ) => {
        if (
          containerRef
            .current &&
          !containerRef
            .current
            .contains(
              event.target as Node,
            )
        ) {
          setOpen(false);
        }
      };

    const handleEscape =
      (
        event: KeyboardEvent,
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          setOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const handleToggle =
    () => {
      const nextOpen =
        !open;

      setOpen(nextOpen);

      if (nextOpen) {
        void loadNotifications(
          notifications.length ===
            0,
        );
      }
    };

  const handleNotificationClick =
    async (
      notification:
        AppNotification,
    ) => {
      if (
        readingId !== null
      ) {
        return;
      }

      setReadingId(
        notification.id,
      );

      try {
        if (
          !notification.is_read
        ) {
          await notificationService
            .markAsRead(
              notification.id,
            );

          setNotifications(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  notification.id
                    ? {
                        ...item,
                        is_read:
                          true,
                        read_at:
                          new Date()
                            .toISOString(),
                      }
                    : item,
              ),
          );

          setUnreadCount(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        }

        setOpen(false);

        if (
          notification
            .action_url
        ) {
          router.push(
            notification
              .action_url,
          );
        }
      } catch (error) {
        console.error(
          "NOTIFICATION READ ERROR:",
          error,
        );

        toast.error(
          "Notification could not be opened",
        );
      } finally {
        setReadingId(
          null,
        );
      }
    };

  const handleMarkAll =
    async () => {
      if (
        markingAll ||
        unreadCount === 0
      ) {
        return;
      }

      setMarkingAll(true);

      try {
        await notificationService
          .markAllAsRead();

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                is_read:
                  true,
                read_at:
                  item.read_at ??
                  new Date()
                    .toISOString(),
              }),
            ),
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "MARK ALL NOTIFICATIONS ERROR:",
          error,
        );

        toast.error(
          "Notifications could not be marked as read",
        );
      } finally {
        setMarkingAll(false);
      }
    };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        aria-expanded={open}
        onClick={
          handleToggle
        }
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount >
            99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="font-bold text-slate-900">
                Notifications
              </h3>

              <p className="text-xs text-slate-500">
                {unreadCount >
                0
                  ? `${unreadCount} unread notification${
                      unreadCount >
                      1
                        ? "s"
                        : ""
                    }`
                  : "You are all caught up"}
              </p>
            </div>

            <button
              type="button"
              disabled={
                markingAll ||
                unreadCount ===
                  0
              }
              onClick={() => {
                void handleMarkAll();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck
                  size={14}
                />
              )}

              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="grid min-h-48 place-items-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

                  <p className="mt-2 text-sm text-slate-500">
                    Loading notifications...
                  </p>
                </div>
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="grid min-h-52 place-items-center px-6 text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <Inbox size={22} />
                  </div>

                  <p className="mt-3 font-semibold text-slate-900">
                    No notifications
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    New updates will appear here.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map(
                (
                  notification,
                ) => (
                  <button
                    type="button"
                    key={
                      notification.id
                    }
                    disabled={
                      readingId !==
                      null
                    }
                    onClick={() => {
                      void handleNotificationClick(
                        notification,
                      );
                    }}
                    className={`relative flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-slate-50 ${
                      notification.is_read
                        ? "bg-white"
                        : "bg-blue-50/60"
                    }`}
                  >
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.is_read
                          ? "bg-slate-300"
                          : "bg-blue-600"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm text-slate-900 ${
                            notification.is_read
                              ? "font-medium"
                              : "font-bold"
                          }`}
                        >
                          {
                            notification.title
                          }
                        </p>

                        {readingId ===
                          notification.id && (
                          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                        {
                          notification.message
                        }
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {formatNotificationTime(
                          notification.created_at,
                        )}
                      </p>
                    </div>
                  </button>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}