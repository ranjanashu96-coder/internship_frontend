"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#10295f] to-[#174b8c] px-5 py-16 text-white sm:px-8">
      <motion.div
        className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-8 lg:flex-row">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f3c55d]">Student Platform</p>
          <h2 className="mt-3 text-4xl font-black">All Your Internship Activities in One Powerful Platform</h2>
        </div>

        <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl bg-[#f3c55d] px-7 py-4 font-black text-[#10295f] transition hover:-translate-y-1 hover:shadow-xl">
          Login to Your Account
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
