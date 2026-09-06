"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Bell,
  BadgeIndianRupee,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  Upload,
  Users,
  X,
  Zap,
  Video,
} from "lucide-react";

import {
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import { toast } from "sonner";

import { authService } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  NotificationBell,
} from "@/components/notification-bell";
import StudentLiveClassPopup from "@/components/student/StudentLiveClassPopup";

import type { Role } from "@/types";

type MenuItem = {
  label: string;
  href: string;
  icon: ElementType;
};

const mapMenu = (
  items: Array<
    [string, string, ElementType]
  >,
): MenuItem[] =>
  items.map(
    ([label, href, icon]) => ({
      label,
      href,
      icon,
    }),
  );

const adminMenu = mapMenu([
  [
    "Dashboard",
    "/admin",
    LayoutDashboard,
  ],
  [
    "Colleges",
    "/admin/colleges",
    Building2,
  ],
  [
    "Mentors",
    "/admin/mentors",
    Users,
  ],
  [
    "Students",
    "/admin/students",
    GraduationCap,
  ],
  [
    "Learning Setup",
    "/admin/learning",
    BookOpen,
  ],
  [
  "Live Classes",
  "/admin/live-classes",
  Video,
],
  [
    "Internships",
    "/admin/internships",
    ClipboardCheck,
  ],
  [
    "Bulk Automation",
    "/admin/bulk",
    Zap,
  ],
  [
    "Reports",
    "/admin/reports",
    FileText,
  ],
  [
    "Payment Reconciliation",
    "/admin/payments",
    FileText,
  ],
  [
    "College Payments",
    "/admin/college-payments",
    BadgeIndianRupee,
  ],
]);

const collegeMenu = mapMenu([
  [
    "Dashboard",
    "/college",
    LayoutDashboard,
  ],
  [
    "Profile",
    "/college/profile",
    Settings,
  ],
  [
    "Upload Students",
    "/college/upload",
    Upload,
  ],
  [
    "Students & Certificates",
    "/college/students",
    GraduationCap,
  ],
  [
    "Registrations",
    "/college/registrations",
    Users,
  ],
  [
    "Progress",
    "/college/progress",
    ClipboardCheck,
  ],
  [
    "My Payments",
    "/college/payments",
    BadgeIndianRupee,
  ],
]);

const menus: Record<
  Role,
  MenuItem[]
> = {
  super_admin: adminMenu,
  admin: adminMenu,

  college_admin:
    collegeMenu,

  mentor: mapMenu([
    [
      "Dashboard",
      "/mentor",
      LayoutDashboard,
    ],
    [
      "Assigned Students",
      "/mentor/students",
      Users,
    ],
    [
      "Reviews",
      "/mentor/reviews",
      ClipboardCheck,
    ],
    [
      "Assessments",
      "/mentor/assessments",
      FileText,
    ],
  ]),

  student: mapMenu([
    [
      "Dashboard",
      "/student",
      LayoutDashboard,
    ],
    [
      "Profile",
      "/student/profile",
      Settings,
    ],
    [
      "Learning",
      "/student/learning",
      BookOpen,
    ],
    [
      "Log Book",
      "/student/logbook",
      FileText,
    ],
    [
      "Assignments",
      "/student/assignments",
      FileText,
    ],
    [
      "Attendance",
      "/student/attendance",
      ClipboardCheck,
    ],
    [
      "Live Project",
      "/student/live-project",
      Upload,
    ],
    [
      "Final Report",
      "/student/report",
      FileText,
    ],
    [
      "Downloads",
      "/student/downloads",
      GraduationCap,
    ],
  ]),
};

const dashboardRoutes: Record<
  Role,
  string
> = {
  super_admin: "/admin",
  admin: "/admin",
  college_admin:
    "/college",
  mentor: "/mentor",
  student: "/student",
};

export function AppShell({
  children,
  role,
}: {
  children: ReactNode;
  role: Role;
}) {
  const path =
    usePathname();

  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const user =
    useAuthStore(
      (state) =>
        state.user,
    );

  const clearAuth = useAuthStore(
  (state) => state.clearAuth,
);

  const currentMenu =
    menus[role] ?? [];

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      setLoggingOut(true);

      try {
        /*
         * Revoke the refresh token
         * and clear the HttpOnly cookie.
         */
        await authService.logout();

        toast.success(
          "Logged out successfully",
        );
      } catch (error) {
        console.error(
          "LOGOUT ERROR:",
          error,
        );

        /*
         * Local session is still cleared
         * so protected pages cannot be used.
         */
        toast.error(
          "Server logout failed, but your local session was cleared",
        );
      } finally {
  clearAuth();

  setOpen(false);
  setLoggingOut(false);

  // toast.success(
  //   "Logged out successfully",
  // );

  router.replace("/login");
  router.refresh();
}
    };

  const homeRoute =
    dashboardRoutes[role];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setOpen(false)
          }
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0",
          open
            ? "translate-x-0"
            : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href={homeRoute}
            onClick={() =>
              setOpen(false)
            }
            className="text-xl font-black tracking-tight"
          >
            RK
            <span className="text-blue-400">
              Nexora
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() =>
              setOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {currentMenu.map(
            (menu) => {
              const Icon =
                menu.icon;

              const isDashboard =
                menu.href ===
                  "/admin" ||
                menu.href ===
                  "/college" ||
                menu.href ===
                  "/mentor" ||
                menu.href ===
                  "/student";

              const isActive =
                path ===
                  menu.href ||
                (!isDashboard &&
                  path.startsWith(
                    `${menu.href}/`,
                  ));

              return (
                <Link
                  key={
                    menu.href
                  }
                  href={
                    menu.href
                  }
                  onClick={() =>
                    setOpen(
                      false,
                    )
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  <span>
                    {
                      menu.label
                    }
                  </span>
                </Link>
              );
            },
          )}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name ??
                user?.username ??
                "User"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-400">
              {user?.email ??
                role
                  .replaceAll(
                    "_",
                    " ",
                  )}
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              onClick={() =>
                setOpen(true)
              }
            >
              <Menu size={21} />
            </button>

            <div className="hidden text-sm font-medium text-slate-500 sm:block">
              Student Internship & 
              Learning Portal
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
           <NotificationBell />

            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
                {user?.name ??
                  user?.username ??
                  "User"}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {role.replaceAll(
                  "_",
                  " ",
                )}
              </p>
            </div>

            <button
              type="button"
              aria-label="Logout"
              title="Logout"
              disabled={
                loggingOut
              }
              onClick={() => {
                void handleLogout();
              }}
              className="grid h-9 w-9 place-items-center rounded-full text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LogOut
                  size={18}
                />
              )}
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      {role === "student" && (
  <StudentLiveClassPopup />
)}
    </div>
  );
}