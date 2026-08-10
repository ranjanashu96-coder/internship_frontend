"use client";

import Link from "next/link";
import {
  Globe2,
  Mail,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link
              href="/"
              className="text-xl font-black text-slate-900"
            >
              RK NEXORA
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              Empowering students with practical learning,
              internships and career-focused digital
              solutions.
            </p>
          </div>

          {/* Quick Links */}
          <FooterColumn
            title="Quick Links"
            items={[
              ["Home", "#home"],
              ["About Us", "#about"],
              ["Domains", "#domains"],
              ["Process", "#process"],
            ]}
          />

          {/* Students */}
          <FooterColumn
            title="For Students"
            items={[
              ["Student Login", "/login"],
              ["Apply Now", "/register"],
              ["Track Application", "/login"],
              ["Dashboard", "/login"],
            ]}
          />

          {/* Colleges */}
          <FooterColumn
            title="For Colleges"
            items={[
              ["College Login", "/login"],
              ["Register College", "/login"],
              ["Upload Students", "/login"],
              ["Resources", "#domains"],
            ]}
          />

          {/* Legal */}
          <FooterColumn
            title="Legal"
            items={[
              [
                "Terms & Conditions",
                "/terms-and-conditions",
              ],
              [
                "Privacy Policy",
                "/privacy-policy",
              ],
              [
                "Refund & Cancellation",
                "/refund-cancellation-policy",
              ],
            ]}
          />

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Contact Us
            </h3>

            <div className="mt-4 space-y-3 text-xs text-slate-500">
              <a
                href="tel:+919693275424"
                className="flex items-center gap-2 transition hover:text-[#0d5ea6]"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#0d5ea6]" />
                +91 9693275424
              </a>

              <a
                href="mailto:helpdesk@rknexora.org"
                className="flex items-center gap-2 transition hover:text-[#0d5ea6]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#0d5ea6]" />
                helpdesk@rknexora.org
              </a>

              <a
                href="https://www.rknexora.org"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:text-[#0d5ea6]"
              >
                <Globe2 className="h-4 w-4 shrink-0 text-[#0d5ea6]" />
                www.rknexora.org
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} RK NEXORA PRIVATE
            LIMITED. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/terms-and-conditions"
              className="transition hover:text-[#0d5ea6]"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/privacy-policy"
              className="transition hover:text-[#0d5ea6]"
            >
              Privacy Policy
            </Link>

            <Link
              href="/refund-cancellation-policy"
              className="transition hover:text-[#0d5ea6]"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <div>
      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {items.map(([label, href]) => (
          <Link
            key={`${label}-${href}`}
            href={href}
            className="block text-xs text-slate-500 transition hover:text-[#0d5ea6]"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}