"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };

function FaqRow({
  q, a, isOpen, onToggle,
}: {
  q: string; a: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-start justify-between gap-3 w-full text-start text-sm font-semibold text-slate-800 hover:text-primary-700 transition-colors"
      >
        <span>{q}</span>
        <svg
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 shrink-0 mt-0.5 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* CSS grid trick : smooth height animation sans JS de mesure */}
      <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="mt-2 pb-1 text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-100">
      {faqs.map(({ q, a }, i) => (
        <FaqRow
          key={q}
          q={q}
          a={a}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
