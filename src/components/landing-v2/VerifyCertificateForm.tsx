"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyCertificateForm() {
  const router = useRouter();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = certificateNumber.trim();

    if (!trimmed) {
      setError("Please enter a certificate number");
      return;
    }

    setError("");
    router.push(
      `/verify-certificate/${encodeURIComponent(trimmed)}`,
    );
  };

  return (
    <section
      id="verify-certificate"
      className="relative overflow-hidden bg-gradient-to-br from-[#0b2a63] via-[#17408a] to-[#1d4fa3] py-20 text-white"
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#d4af37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#1d4fa3]/40 blur-3xl" />

      {/* Gold top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center md:gap-16">
        {/* LEFT — Content */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
              Certificate Verification
            </span>
          </div>

          <h2 className="mt-6 font-serif text-4xl leading-tight font-bold md:text-5xl">
            Verify the{" "}
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
              authenticity
            </span>{" "}
            of any certificate.
          </h2>

          <p className="mt-5 max-w-lg text-blue-100/90">
            Every certificate issued by RK Nexora carries a unique number.
            Enter it here to instantly confirm it was genuinely issued by us.
          </p>

          {/* Trust bullets */}
          <ul className="mt-8 space-y-3 text-sm">
            <Feature text="Instant verification against our official records" />
            <Feature text="Scan the QR code on your certificate for one-click verify" />
            <Feature text="Secure, tamper-proof, and updated in real time" />
          </ul>
        </div>

        {/* RIGHT — Card */}
        <div className="relative">
          {/* Gold corner accent */}
          <div className="absolute -top-3 -right-3 h-24 w-24 rounded-tr-3xl border-t-4 border-r-4 border-[#d4af37]" />
          <div className="absolute -bottom-3 -left-3 h-24 w-24 rounded-bl-3xl border-b-4 border-l-4 border-[#d4af37]" />

          <div className="relative rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d4fa3] to-[#17408a] shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-[#d4af37]"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <h3 className="mt-5 text-center text-xl font-bold text-[#0b2a63]">
              Enter Certificate Number
            </h3>

            <p className="mt-1 text-center text-xs text-slate-500">
              Format: RKN-YYYY-XXXXXXX
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => {
                    setCertificateNumber(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="RKN-2026-0000043"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 font-mono text-base tracking-wide text-slate-900 outline-none transition focus:border-[#1d4fa3] focus:bg-white focus:ring-4 focus:ring-[#1d4fa3]/10"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1d4fa3] to-[#17408a] px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:from-[#17408a] hover:to-[#0b2a63] hover:shadow-xl"
              >
                Verify Certificate
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 transition group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Scan the QR code printed on your certificate to verify instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 text-[#d4af37]"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span className="text-blue-100/90">{text}</span>
    </li>
  );
}