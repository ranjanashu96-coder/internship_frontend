"use client";

import { Globe2, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#f1f3f7] px-5 py-10 sm:px-8">
      <div className="mx-auto grid max-w-[1340px] gap-8 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <img src="/rknexora_logo.png" alt="RK Nexora" className="h-16 w-auto object-contain" />
          <p className="mt-4 text-xs leading-6 text-slate-500">Empowering students with practical learning, internships and career-focused digital solutions.</p>
        </div>

        <FooterColumn title="Quick Links" items={[["Home", "#home"], ["About Us", "#about"], ["Domains", "#domains"], ["Process", "#process"]]} />
        <FooterColumn title="For Students" items={[["Student Login", "/login"], ["Apply Now", "/register"], ["Track Application", "/login"], ["Dashboard", "/login"]]} />
        <FooterColumn title="For Colleges" items={[["College Login", "/login"], ["Register College", "/login"], ["Upload Students", "/login"], ["Resources", "#domains"]]} />

        <div>
          <h3 className="text-sm font-black">Contact Us</h3>
          <div className="mt-4 space-y-3 text-xs text-slate-500">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#0d5ea6]" />+91 9693275424</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#0d5ea6]" />helpdesk@rknexora.org</p>
            <p className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-[#0d5ea6]" />www.rknexora.org</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-black">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map(([label, href]) => (
          <a key={label} href={href} className="block text-xs text-slate-500 transition hover:text-[#0d5ea6]">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
