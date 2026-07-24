"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const mapMenu = (
  items: Array<[string, string, React.ElementType]>,
): MenuItem[] =>
  items.map(([label, href, icon]) => ({
    label,
    href,
    icon,
  }));

const adminMenu = mapMenu([
  ["Dashboard", "/admin", LayoutDashboard],
  ["Colleges", "/admin/colleges", Building2],
  ["Mentors", "/admin/mentors", Users],
  ["Students", "/admin/students", GraduationCap],
  ["Learning Setup", "/admin/learning", BookOpen],
  ["Internships", "/admin/internships", ClipboardCheck],
  ["Bulk Automation", "/admin/bulk", Zap],
  ["Reports", "/admin/reports", FileText],
]);

const collegeMenu = mapMenu([
  ["Dashboard", "/college", LayoutDashboard],
  ["Profile", "/college/profile", Settings],
  ["Upload Students", "/college/upload", Upload],
   [
    "Students & Certificates",
    "/college/students",
    GraduationCap,
  ],
  ["Registrations", "/college/registrations", Users],
  ["Progress", "/college/progress", ClipboardCheck],
]);

const menus: Record<Role, MenuItem[]> = {
  super_admin: adminMenu,
  admin: adminMenu,
  college_admin: collegeMenu,
  mentor: mapMenu([
    ["Dashboard", "/mentor", LayoutDashboard],
    ["Assigned Students", "/mentor/students", Users],
    ["Reviews", "/mentor/reviews", ClipboardCheck],
    ["Assessments", "/mentor/assessments", FileText],
  ]),
  student: mapMenu([
    ["Dashboard", "/student", LayoutDashboard],
    ["Profile", "/student/profile", Settings],
    ["Learning", "/student/learning", BookOpen],
    ["Log Book", "/student/logbook", FileText],
    ["Assigments", "/student/assignments", FileText],
    ["Attendece", "/student/attendance", FileText],
    ["Live Project", "/student/live-project", Upload],
    ["Final Report", "/student/report", FileText],
    ["Downloads", "/student/downloads", GraduationCap],
  ]),
};

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const currentMenu = menus[role] ?? [];

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r bg-slate-950 text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="text-xl font-black">
            RK<span className="text-blue-400">Nexora</span>
          </div>

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {currentMenu.map((menu) => {
            const Icon = menu.icon;

            const isActive =
              path === menu.href ||
              (menu.href !== "/admin" &&
                menu.href !== "/college" &&
                menu.href !== "/mentor" &&
                menu.href !== "/student" &&
                path.startsWith(`${menu.href}/`));

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/10",
                )}
              >
                <Icon size={18} />
                {menu.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div className="hidden text-sm text-slate-500 sm:block">
            Internship ERP Management System
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-2 hover:bg-slate-100"
            >
              <Bell size={19} />
            </button>

            <div className="text-right">
              <p className="text-sm font-semibold">
                {user?.name ?? user?.username}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {role.replaceAll("_", " ")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="rounded-full p-2 text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}