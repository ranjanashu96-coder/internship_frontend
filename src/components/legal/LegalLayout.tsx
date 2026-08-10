import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  Footer,
} from "@/components/landing-v2";

type LegalLayoutProps = {
  title: string;
  description: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export default function LegalLayout({
  title,
  description,
  lastUpdated = "10/08/2026",
  children,
}: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f7f9fd] text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d5ea6] text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="font-black tracking-tight text-slate-950">
                RK NEXORA
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Private Limited
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0d5ea6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#071a2f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.24),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,0.24),transparent_32%)]" />

        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:py-18 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
            <ShieldCheck className="h-4 w-4" />
            Legal Information
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-white/80">
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              Last Updated: {lastUpdated}
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-white/80">
              <Building2 className="h-4 w-4 text-cyan-300" />
              RK NEXORA PRIVATE LIMITED
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <article
          className="
            rounded-[28px]
            border border-slate-200
            bg-white
            p-6
            shadow-sm
            sm:p-9
            lg:p-12

            [&_h2]:mt-10
            [&_h2]:scroll-mt-28
            [&_h2]:border-b
            [&_h2]:border-slate-100
            [&_h2]:pb-3
            [&_h2]:text-xl
            [&_h2]:font-black
            [&_h2]:tracking-tight
            [&_h2]:text-slate-950

            [&_h2:first-child]:mt-0

            [&_h3]:mb-2
            [&_h3]:mt-6
            [&_h3]:text-base
            [&_h3]:font-extrabold
            [&_h3]:text-slate-900

            [&_p]:my-4
            [&_p]:text-sm
            [&_p]:leading-7
            [&_p]:text-slate-600
            sm:[&_p]:text-[15px]

            [&_ul]:my-4
            [&_ul]:list-disc
            [&_ul]:space-y-2
            [&_ul]:pl-6
            [&_ul]:text-sm
            [&_ul]:leading-7
            [&_ul]:text-slate-600

            [&_strong]:font-extrabold
            [&_strong]:text-slate-900

            [&_a]:font-bold
            [&_a]:text-[#0d5ea6]
            [&_a]:transition
            hover:[&_a]:underline
          "
        >
          {children}
        </article>

     
      </section>

      <Footer />
    </main>
  );
}