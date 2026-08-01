"use client";

import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Globe2,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { stagger, cardReveal } from "./motion";

const items = [
  { icon: BriefcaseBusiness, title: "Practical Learning", description: "Work on real industry projects instead of theoretical assignments." },
  { icon: Users, title: "Expert Mentorship", description: "Learn directly from experienced professionals." },
  { icon: Globe2, title: "Flexible Learning", description: "Online, hybrid and flexible internship opportunities." },
  { icon: BarChart3, title: "Career Development", description: "Build technical and professional skills for future success." },
  { icon: Award, title: "Professional Certification", description: "Receive internship certificates after successful completion." },
  { icon: Sparkles, title: "Career Ready", description: "Bridge the gap between academics and industry expectations." },
];

export default function WhyChoose() {
  return (
    <section id="why-us" className="bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-base font-medium text-slate-600">Why Choose RK NEXORA</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">Learn Beyond The Classroom</h2>
          <p className="mt-4 text-lg text-slate-500">Practical learning experiences designed to prepare students for successful careers.</p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-x-16 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article key={item.title} variants={cardReveal} whileHover={{ y: -5 }}>
                <motion.div whileHover={{ rotate: 8, scale: 1.08 }}>
                  <Icon className="h-5 w-5 text-slate-800" />
                </motion.div>
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
