import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { tryGetSession } from "@/lib/dal";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { billingFromCycle } from "@/features/subscription/plans";
import { SubscribeForm } from "./_components/SubscribeForm";

export const metadata: Metadata = {
  title: "Souscrire à l'offre Pro — SantéauMaroc",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ cycle?: string; featured?: string; renew?: string }>;

export default async function SouscrirePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { cycle, featured, renew } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const sub = dict.dashboard.praticien.sub;
  const currency = dict.tarifs.currency;

  const billing = billingFromCycle(cycle);
  const initialFeatured = ["1", "true", "on"].includes(String(featured ?? ""));

  const session = await tryGetSession();
  const mode: "guest" | "doctor" | "notdoctor" = !session?.userId
    ? "guest"
    : session.role === "DOCTOR"
      ? "doctor"
      : "notdoctor";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-14">
        <header className="mb-6 text-center">
          <p className="section-eyebrow mb-1">{sub.checkoutEyebrow}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {renew ? sub.renew : sub.checkoutTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">{sub.checkoutSubtitle}</p>
        </header>

        <div className="card overflow-hidden p-0">
          <div
            className="h-1.5"
            style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }}
          />
          <div className="p-5 sm:p-7">
            <SubscribeForm
              mode={mode}
              initialBilling={billing}
              initialFeatured={initialFeatured}
              currency={currency}
              sub={sub}
              inscriptionHref="/inscription-praticien"
            />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          <Link href="/tarifs" className="hover:text-slate-600 underline underline-offset-2">
            ← {dict.tarifs.plansEyebrow}
          </Link>
        </p>
      </div>
    </div>
  );
}
