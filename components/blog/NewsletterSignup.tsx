"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/features/blog/actions";
import type { Dictionary } from "@/lib/i18n";

/**
 * Capture lead « conseils santé » (CRO). Server Action idempotente.
 * Variante `compact` pour insertion en milieu/bas d'article.
 */
export function NewsletterSignup({
  t,
  locale = "fr",
  source = "blog",
  compact = false,
}: {
  t: Dictionary["blog"];
  locale?: string;
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "invalid" | "server">("idle");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await subscribeNewsletter(email, { locale, source });
      if (res.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus(res.error === "invalid" ? "invalid" : "server");
      }
    });
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className={
        compact
          ? "rounded-2xl border border-primary-100 bg-primary-50/60 p-5 sm:p-6"
          : "rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 p-6 sm:p-8 text-white"
      }
    >
      <div className={compact ? "" : "max-w-xl mx-auto text-center"}>
        <p id="newsletter-title" className={`font-extrabold ${compact ? "text-lg text-slate-900" : "text-xl sm:text-2xl"}`}>
          {t.newsletterTitle}
        </p>
        <p className={`mt-1.5 text-sm leading-relaxed ${compact ? "text-slate-600" : "text-white/85"}`}>
          {t.newsletterSubtitle}
        </p>

        {status === "ok" ? (
          <p
            role="status"
            className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${compact ? "text-secondary-700" : "text-white"}`}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8 3.5 3.5L13 4"/>
            </svg>
            {t.newsletterSuccess}
          </p>
        ) : (
          <form onSubmit={onSubmit} className={`mt-4 flex flex-col sm:flex-row gap-2.5 ${compact ? "" : "max-w-md mx-auto"}`} noValidate>
            <label htmlFor="newsletter-email" className="sr-only">{t.newsletterPlaceholder}</label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
              placeholder={t.newsletterPlaceholder}
              aria-invalid={status === "invalid"}
              aria-describedby={status === "invalid" || status === "server" ? "newsletter-error" : undefined}
              className="flex-1 rounded-xl border-0 px-4 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary-500 outline-none"
            />
            <button
              type="submit"
              disabled={pending}
              className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                compact
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-white text-primary-700 hover:bg-white/90"
              }`}
            >
              {pending ? "…" : t.newsletterCta}
            </button>
          </form>
        )}

        {(status === "invalid" || status === "server") && (
          <p id="newsletter-error" role="alert" className={`mt-2 text-xs font-medium ${compact ? "text-rose-600" : "text-rose-100"}`}>
            {status === "invalid" ? t.newsletterInvalid : t.newsletterError}
          </p>
        )}

        {status !== "ok" && (
          <p className={`mt-2.5 text-xs ${compact ? "text-slate-400" : "text-white/70"}`}>{t.newsletterConsent}</p>
        )}
      </div>
    </section>
  );
}
