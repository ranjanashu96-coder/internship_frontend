"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const links = [
  ["Home", "#home"],
  ["About Us", "#about"],
  ["Domains", "#domains"],
  ["Process", "#process"],
  ["Why Us", "#why-us"],
  ["Recognition", "#recognition"],
  ["Contact", "#contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-[100] border-b backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,.10)]"
            : "border-white/10 bg-white/90 shadow-[0_8px_25px_rgba(15,23,42,.06)]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
            scrolled ? "h-[72px]" : "h-[86px]"
          }`}
        >
          <Link href="/" className="flex items-center">
            <img
              src="/rknexora_logo.png"
              alt="RK Nexora"
              className={`w-auto object-contain transition-all duration-300 ${
                scrolled ? "h-[58px]" : "h-[68px]"
              }`}
            />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="group relative rounded-lg px-4 py-3 text-sm font-bold text-slate-700 transition hover:text-[#0d5ea6]"
              >
                {label}
                <span className="absolute inset-x-4 bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-[#c79a24] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-extrabold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Student Login
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#10295f] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Apply Now
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
            >
              <div className="px-5 py-4">
                {links.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {label}
                  </a>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link href="/login" className="rounded-xl border px-4 py-3 text-center font-bold">
                    Student Login
                  </Link>
                  <Link href="/register" className="rounded-xl bg-[#10295f] px-4 py-3 text-center font-black text-white">
                    Apply Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="h-[86px]" />
    </>
  );
}
