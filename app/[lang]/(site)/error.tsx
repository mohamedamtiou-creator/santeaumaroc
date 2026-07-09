"use client";

import { useEffect } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service when available
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">

      {/* Icône erreur */}
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="w-10 h-10 text-red-400" aria-hidden="true"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>

      {/* Message */}
      <div className="text-center max-w-sm mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Un problème inattendu s&apos;est produit. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-300 font-mono">
            ref: {error.digest}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4" aria-hidden="true">
            <path d="M2 8a6 6 0 1 0 6-6 6 6 0 0 0-4.24 1.76L2 6" strokeLinecap="round"/>
            <path d="M2 2v4h4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Réessayer
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>

    </div>
  );
}
