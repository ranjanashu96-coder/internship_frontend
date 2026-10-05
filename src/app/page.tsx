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
import LateFineTicker from "@/components/landing-v2/LateFineTicker";
import VerifyCertificateForm from "@/components/landing-v2/VerifyCertificateForm";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fd] text-slate-900">
       
      <Navbar />
       <LateFineTicker /> 
      <Hero />
      <TrustStrip />
      <About />
      <Domains />
      <Process />
      <WhyInternship />
      <WhyChoose />
      <Recognition />
      <VerifyCertificateForm />
      <CTA />
      <Footer />
    </main>
  );
}
