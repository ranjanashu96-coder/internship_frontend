"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  FileText,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { stagger, cardReveal } from "./motion";

const items = [
  { icon: BookOpen, title: "Mandatory under NEP 2020", description: "Internship is a compulsory component of the Four-Year CBCS Undergraduate Programme, designed to provide experiential learning and industry exposure." },
  { icon: Award, title: "Earn 4 Academic Credits", description: "Students receive 4 academic credits after successfully completing the internship as per the university curriculum." },
  { icon: CalendarCheck2, title: "120 Hours Practical Training", description: "Complete a structured internship of approximately 120 hours with an approved Internship Providing Organization." },
  { icon: BriefcaseBusiness, title: "Real Industry Experience", description: "Gain hands-on experience by working with industries, government organizations, MSMEs, NGOs, educational institutions and registered companies." },
  { icon: Sparkles, title: "Skill Development", description: "Develop technical knowledge, communication, leadership, teamwork, critical thinking and problem-solving skills required by employers." },
  { icon: BarChart3, title: "Career Readiness", description: "Improve employability through practical work, professional mentoring and workplace exposure." },
  { icon: FileText, title: "Internship Report", description: "Prepare internship reports, logbooks, attendance records and presentations as part of the academic evaluation." },
  { icon: UserRoundCheck, title: "Professional Mentorship", description: "Learn directly from industry experts, supervisors and professional mentors during the internship programme." },
  { icon: ShieldCheck, title: "Internship Certificate", description: "Receive Internship Completion Certificate, Performance Assessment and practical experience to strengthen your resume." },
];

export default function WhyInternship() {
  return (
    <section className="bg-[#f8f9fb] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="mx-auto mb-16 max-w-5xl text-center">
          <p className="text-base font-medium text-slate-600">CBCS | NEP 2020 Internship</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">Why Internship is Important for CBCS & NEP 2020 Students?</h2>
          <p className="mt-5 text-lg leading-8 text-slate-500">Internships are an integral part of the Four-Year Undergraduate Programme under NEP 2020, enabling students to gain practical knowledge, industry exposure, professional skills, and academic credits.</p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid gap-x-14 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article key={item.title} variants={cardReveal} whileHover={{ x: 4 }}>
                <Icon className="h-5 w-5 text-slate-800" />
                <h3 className="mt-3 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{item.description}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
