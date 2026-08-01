"use client";

import { Award, BarChart3, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import { stagger, cardReveal } from "./motion";

const items = [
  { icon: ShieldCheck, title: "Trusted by Students & Colleges", text: "Structured internship management" },
  { icon: Users, title: "Industry Mentors", text: "Expert guidance throughout learning" },
  { icon: Award, title: "Verified Certificates", text: "Digital documentation & verification" },
  { icon: BarChart3, title: "Practical Learning", text: "Built for real-world outcomes" },
];

export default function TrustStrip() {
  return (
    <section className="px-5 py-6 sm:px-8">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto grid max-w-[1290px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              variants={cardReveal}
              whileHover={{ y: -4 }}
              key={item.title}
              className={`flex items-start gap-4 p-5 ${index !== items.length - 1 ? "lg:border-r lg:border-slate-200" : ""}`}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef6ff] text-[#4a90d9]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
