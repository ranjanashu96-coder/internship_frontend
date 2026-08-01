"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CalendarCheck2,
  GraduationCap,
  LayoutDashboard,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "10,000+", label: "Students", icon: Users },
  { value: "200+", label: "Partner Colleges", icon: Building2 },
  { value: "50+", label: "Internship Domains", icon: GraduationCap },
  { value: "120+", label: "Practical Hours", icon: CalendarCheck2 },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#eef7ff] to-[#f9fcff]">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_60%_30%,rgba(57,173,255,.18),transparent_36%)]" />
      <motion.div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-12 top-12 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1b7e9f]">
            Industry Driven • Future Focused
          </p>

          <h1 className="mt-4 max-w-[690px] text-5xl font-black leading-[1.03] tracking-[-0.045em] text-[#102038] sm:text-6xl lg:text-[66px]">
            Empowering Students Through{" "}
            <span className="bg-gradient-to-r from-[#0f62b5] to-[#4bc5aa] bg-clip-text text-transparent">
              Practical Learning & Internships
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-8 text-slate-700">
            RK NEXORA connects students with practical learning, industry exposure,
            professional mentors and career-building opportunities.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#10295f] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
              Apply for Internship
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <a href="#domains" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-400 bg-white/70 px-6 py-4 font-bold text-slate-800 transition hover:-translate-y-1 hover:bg-white">
              <QrCode className="h-5 w-5" />
              Explore Domains
            </a>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          initial={{ opacity: 0, x: 50, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_85px_rgba(15,23,42,.18)]">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-auto text-xs font-bold text-slate-400">Internship Dashboard</span>
            </div>

            <div className="grid min-h-[460px] grid-cols-[165px_1fr]">
              <aside className="hidden bg-[#eaf3ff] p-4 sm:block">
                {["Overview", "My Learning", "Mentoring", "Assignments", "Reports", "Certificates", "Profiles", "Settings"].map((item, index) => (
                  <div key={item} className={`mb-2 rounded-xl px-3 py-3 text-xs font-semibold ${index === 0 ? "bg-[#dbeaff] text-[#0d5ea6]" : "text-slate-600"}`}>
                    {item}
                  </div>
                ))}
              </aside>

              <div className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400">Welcome back, Student!</p>
                    <h3 className="mt-1 text-xl font-black">Dashboard</h3>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    ["Modules Completed", "32/48", GraduationCap],
                    ["Practical Hours", "86/120", CalendarCheck2],
                    ["Assignments", "12/15", Award],
                    ["Attendance", "92%", ShieldCheck],
                  ].map(([label, value, Icon]) => {
                    const IconComponent = Icon as typeof GraduationCap;
                    return (
                      <motion.div whileHover={{ y: -4 }} key={String(label)} className="rounded-xl border border-slate-200 p-3 shadow-sm">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                        <p className="mt-2 text-[10px] font-bold text-slate-400">{String(label)}</p>
                        <strong className="mt-2 block text-lg text-slate-800">{String(value)}</strong>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-black text-slate-700">Learning Progress</p>
                    <div className="mt-5 flex h-44 items-end gap-2">
                      {[25, 34, 32, 45, 55, 48, 65, 74, 82].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.7, delay: 0.6 + index * 0.06 }}
                          className="flex-1 rounded-t-md bg-[#4a90d9]"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-black text-slate-700">Recent Activities</p>
                    <div className="mt-4 space-y-3">
                      {["Module 5 Completed", "Assignment Submitted", "Attendance Marked", "Certificate Unlocked"].map((item) => (
                        <div key={item} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-[#4a90d9]" />
                          <p className="text-[11px] font-semibold text-slate-500">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative mx-auto -mb-1 max-w-[1290px] px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_35px_rgba(15,23,42,.10)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                key={item.label}
                className={`flex items-center justify-center gap-4 px-5 py-5 ${index !== stats.length - 1 ? "lg:border-r lg:border-slate-200" : ""}`}
              >
                <Icon className="h-8 w-8 text-[#4a90d9]" />
                <div>
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
