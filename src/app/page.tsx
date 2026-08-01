"use client";

import {
  About,
  CTA,
  Domains,
  Footer,
  Hero,
  Navbar,
  Process,
  Recognition,
  TrustStrip,
  WhyChoose,
  WhyInternship,
} from "@/components/landing-v2";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fd] text-slate-900">
      <Navbar />
      <Hero />
      <TrustStrip />
      <About />
      <Domains />
      <Process />
      <WhyInternship />
      <WhyChoose />
      <Recognition />
      <CTA />
      <Footer />
    </main>
  );
}
