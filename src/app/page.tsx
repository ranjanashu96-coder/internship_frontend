"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileCheck2,
  FileText,
  Globe2,
  GraduationCap,
  Landmark,
  Laptop,
  Mail,
  Megaphone,
  Menu,
  Phone,
  QrCode,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

/* =========================================================
   DATA
========================================================= */

const stats = [
  {
    value: "10,000+",
    label: "Students",
  },
  {
    value: "200+",
    label: "Partner Colleges",
  },
  {
    value: "50+",
    label: "Internship Domains",
  },
  {
    value: "120+",
    label: "Practical Hours",
  },
];

const domains = [
  {
    title: "Web Development",
    description:
      "HTML, CSS, JavaScript, React and Full Stack Development.",
    icon: Code2,
  },
  {
    title: "Artificial Intelligence",
    description:
      "AI, Machine Learning, Prompt Engineering and modern AI tools.",
    icon: BrainCircuit,
  },
  {
    title: "Data Analytics",
    description:
      "Excel, SQL, Power BI, Tableau and Data Visualization.",
    icon: BarChart3,
  },
  {
    title: "Digital Marketing",
    description:
      "SEO, Social Media, Advertising, Branding and Analytics.",
    icon: Megaphone,
  },
  {
    title: "Business Management",
    description:
      "Business operations, management, strategy and leadership.",
    icon: Building2,
  },
  {
    title: "Human Resources",
    description:
      "HR operations, recruitment, employee relations and development.",
    icon: Users,
  },
  {
    title: "Project Management",
    description:
      "Planning, execution, monitoring and professional project delivery.",
    icon: ClipboardCheck,
  },
  {
    title: "Agri-Business",
    description:
      "Agriculture, entrepreneurship, business and market-oriented learning.",
    icon: GraduationCap,
  },
];

const whyChoose = [
  {
    icon: Briefcase,
    title: "Industry Exposure",
    description:
      "Gain practical experience through structured internship activities.",
  },
  {
    icon: Laptop,
    title: "Live Projects",
    description:
      "Work on practical assignments and real-world project scenarios.",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description:
      "Receive continuous guidance from assigned professional mentors.",
  },
  {
    icon: Award,
    title: "Verified Certificate",
    description:
      "Receive digitally managed internship completion documentation.",
  },
  {
    icon: FileText,
    title: "Report Assistance",
    description:
      "Maintain reports, logbooks and internship documentation digitally.",
  },
  {
    icon: CalendarCheck2,
    title: "Attendance Tracking",
    description:
      "Track daily attendance, learning hours and internship duration.",
  },
  {
    icon: BarChart3,
    title: "Performance Evaluation",
    description:
      "Structured assessment of internship learning and performance.",
  },
  {
    icon: Rocket,
    title: "Career Development",
    description:
      "Improve practical skills, confidence and career readiness.",
  },
];

const internshipImportance = [
  {
    icon: BookOpen,
    title: "CBCS & NEP 2020",
    description:
      "Designed to support experiential and practical learning requirements.",
  },
  {
    icon: Award,
    title: "Academic Credits",
    description:
      "Internship activities can support university academic requirements as applicable.",
  },
  {
    icon: CalendarCheck2,
    title: "Practical Training",
    description:
      "Structured practical training with attendance and learning-hour tracking.",
  },
  {
    icon: Briefcase,
    title: "Industry Experience",
    description:
      "Get exposure to professional working environments and practical tasks.",
  },
  {
    icon: Sparkles,
    title: "Skill Development",
    description:
      "Develop communication, technical, teamwork and problem-solving skills.",
  },
  {
    icon: Rocket,
    title: "Career Readiness",
    description:
      "Build workplace confidence and professional experience.",
  },
];

const internshipSteps = [
  {
    number: "01",
    title: "Registration",
    description:
      "Verify your college-uploaded registration number.",
  },
  {
    number: "02",
    title: "Profile Verification",
    description:
      "Complete personal and academic information.",
  },
  {
    number: "03",
    title: "Domain Selection",
    description:
      "Select an internship domain aligned with your goals.",
  },
  {
    number: "04",
    title: "Mentor Allocation",
    description:
      "Get assigned to an internship mentor.",
  },
  {
    number: "05",
    title: "Learning",
    description:
      "Complete modules, chapters and internship learning.",
  },
  {
    number: "06",
    title: "Attendance & Logbook",
    description:
      "Maintain attendance and daily internship records.",
  },
  {
    number: "07",
    title: "Assessment",
    description:
      "Complete project, report and performance evaluation.",
  },
  {
    number: "08",
    title: "Certification",
    description:
      "Receive final verified internship documents.",
  },
];

const compliances = [
  {
    icon: ShieldCheck,
    title: "AICTE Approved",
    description:
      "Approved under applicable AICTE standards and requirements.",
  },
  {
    icon: Award,
    title: "ISO 9001:2015 Certified",
    description:
      "Quality Management System certification.",
  },
  {
    icon: Building2,
    title: "MSME Registered",
    description:
      "Registered under Micro, Small & Medium Enterprises.",
  },
  {
    icon: Landmark,
    title: "MCA Incorporated",
    description:
      "Incorporated under the Ministry of Corporate Affairs (MCA), Government of India.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">

      {/* =====================================================
          TOP CONTACT BAR
      ===================================================== */}

      <div className="hidden bg-[#061426] text-xs text-white/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-cyan-300" />
              helpdesk@rknexora.org
            </span>

            <span className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-cyan-300" />
              9693275424 
            </span>
          </div>

          <span className="flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5 text-cyan-300" />
            www.rknexora.org
          </span>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

          <Link href="/">
            <img
              src="/logo.png"
              alt="RK Nexora"
              className="h-16 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <a
              href="#home"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              About
            </a>

            <a
              href="#domains"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              Internships
            </a>

            <a
              href="#process"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              Process
            </a>

            <a
              href="#recognitions"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              Recognition
            </a>

            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-[#071a2f] transition hover:bg-slate-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
            >
              Apply Now
            </Link>
          </nav>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
            className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t bg-white px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              {[
                ["Home", "#home"],
                ["About", "#about"],
                ["Internships", "#domains"],
                ["Process", "#process"],
                ["Recognition", "#recognitions"],
              ].map(
                ([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {label}
                  </a>
                ),
              )}

              <Link
                href="/login"
                className="rounded-xl border px-4 py-3 text-center font-bold"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
              >
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="relative isolate overflow-hidden bg-[#071a2f] text-white"
      >
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,.22),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,.25),transparent_35%),linear-gradient(135deg,#061426_0%,#0a2848_55%,#0d3761_100%)]" />

        <div className="mx-auto grid min-h-[700px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Campus to Career Internship Platform
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Transform Your Skills
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Into A Successful Career.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              RK NEXORA connects academic learning with
              structured internships, practical projects,
              professional mentorship and career-focused
              learning experiences.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-7 py-4 font-black text-[#071a2f] transition hover:-translate-y-1"
              >
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#domains"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10"
              >
                Explore Programs
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm text-white/65">
              {[
                "Practical Learning",
                "Expert Mentorship",
                "Verified Documentation",
              ].map(
                (item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* BRAND PANEL */}

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative rounded-[2.5rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

              <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl">
                <img
                  src="/logo.png"
                  alt="RK Nexora"
                  className="mx-auto max-h-64 w-full object-contain"
                />

                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <HeroMiniCard
                    icon={GraduationCap}
                    label="Students"
                    value="10,000+"
                  />

                  <HeroMiniCard
                    icon={Building2}
                    label="Institutions"
                    value="200+"
                  />

                  <HeroMiniCard
                    icon={BookOpen}
                    label="Domains"
                    value="50+"
                  />

                  <HeroMiniCard
                    icon={Award}
                    label="Certification"
                    value="Verified"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="relative z-10 -mt-10 px-5">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(
            (stat) => (
              <div
                key={stat.label}
                className="border-b p-7 text-center sm:border-r lg:border-b-0"
              >
                <strong className="text-3xl font-black text-blue-600">
                  {stat.value}
                </strong>

                <p className="mt-2 text-sm text-slate-500">
                  {stat.label}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        id="about"
        className="bg-white px-5 py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
            <img
              src="/logo.png"
              alt="About RK Nexora"
              className="mx-auto max-h-[350px] object-contain"
            />

            <div className="absolute bottom-6 right-6 rounded-2xl bg-[#071a2f] px-5 py-4 text-white shadow-xl">
              <p className="text-xs text-white/60">
                Our Mission
              </p>

              <strong>
                Campus to Career
              </strong>
            </div>
          </div>

          <div>
            <SectionBadge>
              About RK NEXORA
            </SectionBadge>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-[#071a2f] sm:text-5xl">
              Building Future Professionals
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              RK NEXORA is an internship and career
              development platform focused on helping students
              bridge the gap between academic learning and
              professional requirements.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              The platform combines structured learning,
              internship activities, mentoring, assessments,
              attendance, reporting and digital documentation
              through one integrated system.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Industry Projects",
                "Expert Mentors",
                "Career Guidance",
                "Professional Documentation",
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY INTERNSHIP
      ===================================================== */}

      <section className="px-5 py-24">
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="CBCS • NEP 2020"
            title="Why Internship Matters"
            description="Structured internship experience helps connect academic learning with practical skills and professional exposure."
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {internshipImportance.map(
              (item) => (
                <InfoCard
                  key={item.title}
                  {...item}
                />
              ),
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          DOMAINS
      ===================================================== */}

      <section
        id="domains"
        className="bg-[#071a2f] px-5 py-24 text-white"
      >
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            light
            eyebrow="Internship Programs"
            title="Industry-Focused Internship Domains"
            description="Choose an internship pathway aligned with your academic programme and career interests."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {domains.map(
              (domain) => {
                const Icon =
                  domain.icon;

                return (
                  <article
                    key={domain.title}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-2 hover:bg-white/10"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-5 text-lg font-black">
                      {domain.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-white/55">
                      {domain.description}
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE
      ===================================================== */}

      <section className="bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="Why RK NEXORA?"
            title="A Complete Internship Ecosystem"
            description="Everything students need throughout the internship lifecycle is managed through one structured platform."
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map(
              (item) => (
                <InfoCard
                  key={item.title}
                  {...item}
                />
              ),
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ===================================================== */}

      <section
        id="process"
        className="px-5 py-24"
      >
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="Internship Journey"
            title="Simple 8-Step Internship Process"
            description="From student registration to final internship certification."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {internshipSteps.map(
              (step) => (
                <article
                  key={step.number}
                  className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 font-black text-white shadow-lg">
                    {step.number}
                  </span>

                  <h3 className="mt-6 text-lg font-black text-[#071a2f]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>
                </article>
              ),
            )}
          </div>

          <div className="mt-10 rounded-3xl bg-emerald-50 p-7">
            <h3 className="text-xl font-black text-emerald-900">
              Internship Deliverables
            </h3>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Offer Letter",
                "Attendance Sheet",
                "Digital Logbook",
                "Assessment",
                "Internship Report",
                "Result / Marksheet",
                "Completion Certificate",
                "QR Verification",
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RECOGNITIONS & COMPLIANCES
      ===================================================== */}

      <section
        id="recognitions"
        className="relative overflow-hidden bg-white px-5 py-24"
      >
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <img
              src="/logo.png"
              alt="RK Nexora"
              className="mx-auto mb-5 h-28 w-auto object-contain sm:h-36"
            />

            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
              Trust • Recognition • Compliance
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#071a2f] sm:text-5xl">
              Recognitions & Compliances
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-500">
              Our registrations and certifications reflect
              our commitment to structured operations,
              quality and professional standards.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {compliances.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <article
                    key={item.title}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-lg shadow-slate-900/5 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 transition group-hover:scale-110">
                      <Icon className="h-9 w-9" />
                    </div>

                    <h3 className="mt-6 text-lg font-black text-[#071a2f]">
                      {item.title}
                    </h3>

                    <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-blue-500" />

                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      {item.description}
                    </p>

                    <div className="absolute right-4 top-4">
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                    </div>
                  </article>
                );
              },
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-[#071a2f] px-5 py-5 text-center text-sm font-semibold text-white">
            <ShieldCheck className="h-6 w-6 shrink-0 text-cyan-300" />

            Trusted • Compliant • Committed to Student Development
          </div>
        </div>
      </section>

      {/* =====================================================
          PLATFORM
      ===================================================== */}

      <section className="bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="Student Platform"
            title="Everything Managed Digitally"
            description="Students can track their complete internship from one secure portal."
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={UserRoundCheck}
              title="Student Profile"
              description="Manage academic and internship profile information."
            />

            <InfoCard
              icon={BookOpen}
              title="Learning Modules"
              description="Complete chapters, quizzes and structured learning."
            />

            <InfoCard
              icon={CalendarCheck2}
              title="Attendance"
              description="Track attendance and internship learning hours."
            />

            <InfoCard
              icon={ClipboardCheck}
              title="Assignments"
              description="Submit assignments and receive mentor evaluation."
            />

            <InfoCard
              icon={FileCheck2}
              title="Reports & Logbook"
              description="Maintain internship records and required reports."
            />

            <InfoCard
              icon={QrCode}
              title="Verified Documents"
              description="Access generated internship documents and certificates."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-5 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-100">
            Start Your Journey
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Ready To Launch Your Career?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/75">
            Start your structured internship journey through
            the RK NEXORA platform.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-black text-blue-700"
            >
              Apply Now
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-7 py-4 font-bold"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#061426] px-5 pb-8 pt-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <img
              src="/logo.png"
              alt="RK Nexora"
              className="h-20 rounded-xl bg-white p-2"
            />

            <p className="mt-5 text-sm leading-7 text-white/55">
              Bridging the gap between academic education and
              professional experience through structured
              internships and digital learning.
            </p>
          </div>

          <FooterColumn
            title="Quick Links"
            items={[
              ["Home", "#home"],
              ["About", "#about"],
              ["Internships", "#domains"],
              ["Process", "#process"],
              ["Recognitions", "#recognitions"],
            ]}
          />

          <div>
            <h3 className="font-black">
              Internship Domains
            </h3>

            <div className="mt-5 space-y-3 text-sm text-white/55">
              <p>Web Development</p>
              <p>Artificial Intelligence</p>
              <p>Data Analytics</p>
              <p>Digital Marketing</p>
              <p>Business Management</p>
            </div>
          </div>

          <div>
            <h3 className="font-black">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4 text-sm text-white/60">
              <p className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-cyan-300" />
                helpdesk@rknexora.org
              </p>

              <p className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-cyan-300" />
                +91 9693275424
              </p>

              <p className="flex gap-3">
                <Globe2 className="h-5 w-5 shrink-0 text-cyan-300" />
                www.rknexora.org
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-7 text-center text-sm text-white/40">
          © 2026 RK NEXORA Private Limited. All Rights Reserved.
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <p
        className={`text-xs font-black uppercase tracking-[0.25em] ${
          light
            ? "text-cyan-300"
            : "text-blue-600"
        }`}
      >
        {eyebrow}
      </p>

      <h2
        className={`mt-4 text-3xl font-black tracking-tight sm:text-5xl ${
          light
            ? "text-white"
            : "text-[#071a2f]"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mx-auto mt-4 max-w-2xl leading-7 ${
          light
            ? "text-white/60"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#071a2f]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function HeroMiniCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-blue-600" />

      <strong className="mt-3 block text-lg text-[#071a2f]">
        {value}
      </strong>

      <span className="text-xs text-slate-500">
        {label}
      </span>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: string[][];
}) {
  return (
    <div>
      <h3 className="font-black">
        {title}
      </h3>

      <div className="mt-5 space-y-3">
        {items.map(
          ([label, href]) => (
            <a
              key={label}
              href={href}
              className="block text-sm text-white/55 transition hover:translate-x-1 hover:text-cyan-300"
            >
              {label}
            </a>
          ),
        )}
      </div>
    </div>
  );
}