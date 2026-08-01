"use client";

import {
  BarChart3,
  BrainCircuit,
  Building2,
  ClipboardCheck,
  Code2,
  GraduationCap,
  Megaphone,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { stagger, cardReveal } from "./motion";

const items = [
  { title: "Web Development", icon: Code2 },
  { title: "AI & ML", icon: BrainCircuit },
  { title: "Data Analytics", icon: BarChart3 },
  { title: "Digital Marketing", icon: Megaphone },
  { title: "Business Management", icon: Building2 },
  { title: "Human Resources", icon: Users },
  { title: "Project Management", icon: ClipboardCheck },
  { title: "Agri-Business", icon: GraduationCap },
];

export default function Domains() {
  return (
    <section id="domains" className="bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d5ea6]">Top Internship Domains</p>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">Explore. Learn. Grow.</h2>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={cardReveal}
                whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:shadow-xl"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-600 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[#eef6ff] text-[#4a90d9] transition group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-base font-black">{item.title}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
