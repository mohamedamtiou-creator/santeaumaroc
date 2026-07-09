"use client";

import { useState, useActionState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";
import {
  computeOrder,
  formatAmount,
  cycleFromBilling,
  type Billing,
} from "@/features/subscription/plans";
import {
  createSubscriptionOrder,
  type CreateOrderResult,
} from "@/features/subscription/order-actions";

type Sub = Dictionary["dashboard"]["praticien"]["sub"];

export function SubscribeForm({
  mode,
  initialBilling,
  initialFeatured,
  currency,
  sub,
  inscriptionHref,
}: {
  mode: "guest" | "doctor" | "notdoctor";
  initialBilling: Billing;
  initialFeatured: boolean;
  currency: string;
  sub: Sub;
  inscriptionHref: string;
}) {
  const [billing, setBilling] = useState<Billing>(initialBilling);
  const [featured, setFeatured] = useState(initialFeatured);
  const [state, formAction, pending] = useActionState<CreateOrderResult, FormData>(
    createSubscriptionOrder,
    {},
  );

  const quote = computeOrder({ billing, featured });
  const periodLabel = billing === "ANNUAL" ? sub.perYear : sub.perMonth;

  const loginHref =
    "/connexion?callbackUrl=" +
    encodeURIComponent(
      `/tarifs/souscrire?cycle=${cycleFromBilling(billing)}${featured ? "&featured=1" : ""}`,
    );

  return (
    <div className="flex flex-col gap-5">
      {/* Cycle de facturation */}
      <div className="inline-flex self-center bg-slate-100 rounded-full p-1" role="group">
        {(["MONTHLY", "ANNUAL"] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBilling(b)}
            aria-pressed={billing === b}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors ${
              billing === b ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {b === "MONTHLY" ? sub.cycleMonthly : sub.cycleAnnual}
          </button>
        ))}
      </div>

      {/* Récapitulatif */}
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-slate-800">{sub.planPro}</span>
          <span className="text-sm font-semibold text-slate-900 tabular-nums" dir="ltr">
            {formatAmount(quote.proAmount, currency)}
          </span>
        </div>

        {/* Add-on Premium */}
        <label className="flex items-start gap-3 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500"
          />
          <span className="flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-800">{sub.addonFeatured}</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums" dir="ltr">
                + {formatAmount(quote.featured ? quote.featuredAmount : computeOrder({ billing, featured: true }).featuredAmount, currency)}
              </span>
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">{sub.addonFeaturedDesc}</span>
          </span>
        </label>

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-b-xl">
          <span className="text-sm font-bold text-slate-900">{sub.total}</span>
          <span className="text-lg font-extrabold text-secondary-700 tabular-nums" dir="ltr">
            {formatAmount(quote.amount, currency)}
            <span className="text-xs font-medium text-slate-500 ms-1">{periodLabel}</span>
          </span>
        </div>
      </div>

      {/* Erreur éventuelle */}
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {state.error}
        </p>
      )}

      {/* CTA selon l'état d'authentification */}
      {mode === "doctor" && (
        <form action={formAction}>
          <input type="hidden" name="billing" value={billing} />
          <input type="hidden" name="featured" value={featured ? "1" : "0"} />
          <button type="submit" disabled={pending} className="btn-secondary w-full justify-center py-3">
            {pending ? "…" : sub.confirmCta}
          </button>
        </form>
      )}

      {mode === "guest" && (
        <div className="flex flex-col gap-2">
          <Link href={loginHref} className="btn-secondary w-full justify-center py-3">
            {sub.loginToContinue}
          </Link>
          <p className="text-xs text-slate-500 text-center">{sub.loginNote}</p>
        </div>
      )}

      {mode === "notdoctor" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-sm font-semibold text-amber-800">{sub.notDoctorTitle}</p>
          <p className="text-xs text-amber-700 mt-1 mb-3">{sub.notDoctorDesc}</p>
          <Link href={inscriptionHref} className="btn-primary justify-center py-2.5">
            {sub.notDoctorCta}
          </Link>
        </div>
      )}
    </div>
  );
}
