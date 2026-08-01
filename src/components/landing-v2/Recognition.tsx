"use client";

import { motion } from "framer-motion";
import { stagger, cardReveal } from "./motion";

const items = [
  { image: "/recognitions/aicte.jpeg", title: "AICTE Approved", text: "Aligned with applicable AICTE standards and requirements." },
  { image: "/recognitions/iso.jpeg", title: "ISO 9001:2015 Certified", text: "Quality Management System certification." },
  { image: "/recognitions/msme.jpeg", title: "MSME Registered", text: "Registered under Micro, Small & Medium Enterprises." },
  { image: "/recognitions/mca.jpeg", title: "MCA Incorporated", text: "Incorporated under Ministry of Corporate Affairs, Government of India." },
];

export default function Recognition() {
  return (
    <section id="recognition" className="bg-[#f6f8fc] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-[1340px]">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d5ea6]">Recognitions & Compliances</p>
          <h2 className="mt-3 text-4xl font-black">Committed to Quality & Standards</h2>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item) => (
            <motion.article
              key={item.title}
              variants={cardReveal}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:shadow-xl"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <div className="flex h-40 items-center justify-center">
                <img src={item.image} alt={item.title} className="max-h-36 max-w-full object-contain transition duration-300 group-hover:scale-110" />
              </div>
              <h3 className="mt-4 text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
