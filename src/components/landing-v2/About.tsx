"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { reveal } from "./motion";

export default function About() {
  return (
    <section id="about" className="px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-2">
        <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d5ea6]">About Us</p>
          <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            Building Skills.
            <br />
            Building Futures.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-slate-600">
            RK NEXORA is an internship platform committed to delivering quality practical education. We bridge the gap between academics and industry through structured internships, expert mentorship and digital learning solutions.
          </p>
          <Link href="/register" className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d5ea6] px-5 py-3 font-bold text-white transition hover:-translate-y-1">
            Know More About Us
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-xl"
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <img src="/logo.png" alt="RK Nexora" className="mx-auto h-[280px] w-full object-contain" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
