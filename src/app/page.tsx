"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers3,
  Menu,
  QrCode,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const features = [
  { icon: ShieldCheck, title: "Role-Based ERP", description: "Separate dashboards and secure permissions for admins, colleges, mentors and students." },
  { icon: Building2, title: "College Management", description: "Manage colleges, student uploads, registrations and institutional reports from one place." },
  { icon: BookOpen, title: "Learning Management", description: "Organize domains, modules, chapters, assignments, projects and student progress." },
  { icon: CalendarCheck2, title: "Attendance Tracking", description: "Generate and monitor attendance, working hours and internship duration automatically." },
  { icon: ClipboardCheck, title: "Assessment Workflow", description: "Evaluate assignments, projects, internship reports and final student performance." },
  { icon: QrCode, title: "Verified Certificates", description: "Generate internship certificates, marksheets and documents with QR verification." },
];

const stats = [
  { value: "12K+", label: "Students" },
  { value: "48+", label: "Colleges" },
  { value: "156+", label: "Mentors" },
  { value: "92%", label: "Completion Rate" },
];

const steps = [
  { number: "01", title: "College Uploads Student", description: "College administrators preload verified student registration records." },
  { number: "02", title: "Student Registers", description: "Student verifies registration, completes details, uploads documents and selects a domain." },
  { number: "03", title: "Learn & Submit", description: "Students complete modules, attendance, assignments, projects and internship reports." },
  { number: "04", title: "Assessment & Certificate", description: "Mentors assess performance and the platform generates verified final documents." },
];

const domains = [
  { title: "Web Development", icon: Layers3 },
  { title: "Data Analytics", icon: BarChart3 },
  { title: "Artificial Intelligence", icon: Sparkles },
  { title: "Digital Marketing", icon: Rocket },
  { title: "Business Management", icon: Building2 },
  { title: "Human Resources", icon: Users },
  { title: "Project Management", icon: ClipboardCheck },
  { title: "Agri-Business", icon: GraduationCap },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071a2f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#071a2f] shadow-lg shadow-cyan-400/20">
              <Layers3 className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight text-white">RK<span className="text-cyan-300">Nexora</span></span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#home" className="text-sm font-semibold text-white/70 transition hover:text-white">Home</a>
            <a href="#features" className="text-sm font-semibold text-white/70 transition hover:text-white">Features</a>
            <a href="#workflow" className="text-sm font-semibold text-white/70 transition hover:text-white">How It Works</a>
            <a href="#domains" className="text-sm font-semibold text-white/70 transition hover:text-white">Domains</a>
            <Link href="/login" className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">Login</Link>
            <Link href="/register" className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-black text-[#071a2f] transition hover:bg-cyan-200">Register</Link>
          </nav>

          <button type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white lg:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#071a2f] px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-2">
              {[['Home','#home'],['Features','#features'],['How It Works','#workflow'],['Domains','#domains']].map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">{label}</a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-2 rounded-xl border border-white/15 px-4 py-3 text-center font-bold text-white">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-cyan-300 px-4 py-3 text-center font-black text-[#071a2f]">Register</Link>
            </div>
          </div>
        )}
      </header>

      <section id="home" className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#071a2f] pt-28 text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_15%,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_15%_82%,rgba(59,130,246,0.22),transparent_32%),linear-gradient(135deg,#061426_0%,#0a2848_55%,#0d3761_100%)]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-100">
              <Sparkles className="h-4 w-4 text-amber-300" /> Smart Internship Management Platform
            </div>
            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Internship Management
              <span className="mt-3 block text-cyan-300">Reimagined.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg lg:mx-0">
              One complete platform for managing colleges, mentors, students, learning, attendance, assessments, payments, reports and verified certificates.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-200 px-6 py-4 font-black text-[#071a2f] shadow-xl shadow-cyan-400/20 transition hover:-translate-y-1">
                Start Registration <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-bold text-white transition hover:bg-white/10">Login to Portal</Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm font-semibold text-white/70 lg:justify-start">
              {["Secure role-based access", "Simple registration flow", "Verified certificates"].map((item) => (
                <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" />{item}</span>
              ))}
            </div>
          </div>

          <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-100 text-slate-900">
              <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
                <div className="flex gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /></div>
                <div className="font-black text-[#071a2f]">RK<span className="text-blue-500">Nexora</span></div>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#071a2f] text-xs font-bold text-white">AR</div>
              </div>
              <div className="grid min-h-[440px] grid-cols-[72px_1fr]">
                <aside className="bg-[#071a2f] p-3">
                  {[BarChart3, GraduationCap, Building2, FileText, QrCode].map((Icon, index) => (
                    <div key={index} className={`mb-3 grid h-11 place-items-center rounded-xl ${index === 0 ? 'bg-cyan-300/15 text-cyan-300' : 'text-white/40'}`}><Icon className="h-5 w-5" /></div>
                  ))}
                </aside>
                <div className="p-5">
                  <div className="mb-5 flex items-center justify-between"><h3 className="font-black text-[#071a2f]">Dashboard Overview</h3><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">Live</span></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[['Students','12,540'],['Colleges','48'],['Completion','92%'],['Certificates','8,460']].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{label}</p><strong className="mt-1 block text-2xl text-[#071a2f]">{value}</strong></div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-4 text-sm font-bold text-[#071a2f]">Monthly Internship Completion</p>
                    <div className="flex h-32 items-end gap-3">{[42,58,49,72,66,86,96].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-300" style={{ height: `${height}%` }} />)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 px-5">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => <div key={item.label} className="border-b border-slate-200 p-8 text-center last:border-b-0 sm:border-r lg:border-b-0"><strong className="block text-3xl font-black text-[#071a2f]">{item.value}</strong><span className="mt-2 block text-sm text-slate-500">{item.label}</span></div>)}
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Everything You Need" title="One unified platform for every internship stakeholder" description="A modern ERP designed for administrators, colleges, mentors and students." />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => { const Icon = feature.icon; return <article key={feature.title} className="group rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-900/10"><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon className="h-6 w-6" /></div><h3 className="text-xl font-black text-[#071a2f]">{feature.title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{feature.description}</p></article>; })}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Simple Workflow" title="From college upload to verified certification" description="Every step is organized, transparent and easy to track." />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => <article key={step.number} className="text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#071a2f] text-xl font-black text-white shadow-xl shadow-slate-900/15">{step.number}</div><h3 className="mt-6 text-xl font-black text-[#071a2f]">{step.title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{step.description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="domains" className="bg-[#071a2f] px-5 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <SectionHeading light eyebrow="Career Domains" title="Industry-relevant internship pathways" description="Students can select practical domains aligned with their academic and career goals." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {domains.map((domain) => { const Icon = domain.icon; return <article key={domain.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300"><Icon className="h-5 w-5" /></span><span className="font-bold">{domain.title}</span></article>; })}
          </div>
        </div>
      </section>

      <section className="px-5 py-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><UserRoundCheck className="h-6 w-6" /></div>
            <h2 className="mt-6 text-2xl font-black text-[#071a2f]">Already registered?</h2>
            <p className="mt-3 leading-7 text-slate-500">Access your role-based dashboard using username, email, employee ID or registration number.</p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#071a2f] px-5 py-3 font-bold text-white transition hover:bg-[#0b294b]">Open Login Page <ArrowRight className="h-4 w-4" /></Link>
          </article>
          <article className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-8 shadow-xl shadow-cyan-900/5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-200 text-[#071a2f]"><GraduationCap className="h-6 w-6" /></div>
            <h2 className="mt-6 text-2xl font-black text-[#071a2f]">New student registration</h2>
            <p className="mt-3 leading-7 text-slate-600">Verify the registration number uploaded by your college and complete the registration and payment process.</p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-black text-[#071a2f] transition hover:bg-cyan-200">Open Registration Page <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </div>
      </section>

      <footer className="bg-[#061426] px-5 py-10 text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 text-center text-sm sm:flex-row sm:text-left">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-[#071a2f]"><Layers3 className="h-5 w-5" /></span><span className="font-black text-white">RK<span className="text-cyan-300">Nexora</span></span></div>
          <p>© 2026 RKNexora Internship ERP. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

type SectionHeadingProps = { eyebrow: string; title: string; description: string; light?: boolean };

function SectionHeading({ eyebrow, title, description, light = false }: SectionHeadingProps) {
  return <div className="mx-auto mb-14 max-w-3xl text-center"><p className={`text-xs font-black uppercase tracking-[0.25em] ${light ? 'text-cyan-300' : 'text-blue-600'}`}>{eyebrow}</p><h2 className={`mt-4 text-3xl font-black tracking-tight sm:text-5xl ${light ? 'text-white' : 'text-[#071a2f]'}`}>{title}</h2><p className={`mx-auto mt-4 max-w-2xl leading-7 ${light ? 'text-white/60' : 'text-slate-500'}`}>{description}</p></div>;
}