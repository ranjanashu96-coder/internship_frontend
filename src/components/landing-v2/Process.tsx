"use client";

import {
  Award,
  BrainCircuit,
  CalendarCheck2,
  ClipboardCheck,
  FileCheck2,
  Laptop2,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { stagger, cardReveal } from "./motion";

const steps = [
  { number: "01", title: "Online Registration", description: "Register through the RK NEXORA Internship Portal.", icon: UserPlus, accent: "text-blue-600" },
  { number: "02", title: "Document Verification", description: "Verify academic details and complete profile verification.", icon: FileCheck2, accent: "text-emerald-600" },
  { number: "03", title: "Domain Selection", description: "Choose your internship domain according to your course and interests.", icon: BrainCircuit, accent: "text-amber-500" },
  { number: "04", title: "Mentor Allocation", description: "Industry mentors are assigned to guide you throughout the internship.", icon: Users, accent: "text-rose-500" },
  { number: "05", title: "Training & Live Projects", description: "Attend training sessions and work on practical industry projects.", icon: Laptop2, accent: "text-cyan-500" },
  { number: "06", title: "Attendance & Logbook", description: "Maintain attendance, daily tasks, internship diary and logbook.", icon: CalendarCheck2, accent: "text-blue-600" },
  { number: "07", title: "Report & Evaluation", description: "Submit internship report, presentation and complete final evaluation.", icon: ClipboardCheck, accent: "text-emerald-600" },
  { number: "08", title: "Certificate Issued", description: "Receive Internship Completion Certificate and Performance Assessment.", icon: Award, accent: "text-amber-500" },
];

export default function Process() {
  return (
    <section id="process" className="bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-black sm:text-5xl">Simple 8-Step Internship Process</h2>
          <p className="mt-4 text-lg text-slate-500">From Registration to Certification – Your Complete Internship Journey with RK NEXORA.</p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.article key={step.number} variants={cardReveal} whileHover={{ y: -6 }}>
                <p className="text-sm font-medium text-slate-500">{step.number}</p>
                <motion.div whileHover={{ rotate: 6, scale: 1.08 }}>
                  <Icon className={`mt-4 h-12 w-12 ${step.accent}`} />
                </motion.div>
                <h3 className="mt-6 text-2xl font-black">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{step.description}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
