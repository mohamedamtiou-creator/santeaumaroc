import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { canContribute } from "@/lib/contributor";
import { OnboardingForm } from "@/components/contributor/OnboardingForm";
import { OnboardingSteps } from "@/components/contributor/OnboardingSteps";

export const metadata: Metadata = {
  title: "Devenir auteur — SantéauMaroc",
  robots: { index: false, follow: true },
};

export default async function DevenirAuteurPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const isAr = locale === "ar";
  const session = await verifySession(); // redirige vers /connexion si non connecté
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, professionKind: true },
  });

  if (user?.role === "ADMIN") redirect("/admin");
  if (user && canContribute(user.role) && user.professionKind) redirect("/espace-auteur");

  const trust = isAr
    ? ["مجاني", "هويتك محمية", "تحتفظ بالتحكّم"]
    : ["Gratuit", "Votre identité protégée", "Vous gardez le contrôle"];

  return (
    <main className="page-outer">
      <div className="max-w-2xl mx-auto">
        <OnboardingSteps current={1} locale={locale} />

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-1.5" dir="auto">
            {isAr ? "الانضمام إلى الكتّاب" : "Rejoindre les auteurs"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" dir="auto">
            {isAr ? "كن كاتباً على SantéauMaroc" : "Devenez auteur sur SantéauMaroc"}
          </h1>
          <p className="text-slate-600 leading-relaxed" dir="auto">
            {isAr
              ? "ابدأ بتحديد مهنتك. يمكنك تحضير مسودّاتك فوراً ؛ ويُطلب التحقق من شهاداتك قبل النشر فقط."
              : "Commencez par déclarer votre profession. Vous préparez vos brouillons immédiatement ; la vérification de vos diplômes n'est requise qu'avant publication."}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label={isAr ? "ضمانات" : "Garanties"}>
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-sm text-slate-600">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8" /></svg>
                <span dir="auto">{t}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="card p-5 sm:p-6">
          <OnboardingForm locale={locale} />
        </div>

        <p className="mt-4 text-center text-sm text-slate-500" dir="auto">
          {isAr
            ? "الخطوة التالية : التحقق من الهوية، ثم تحرير أول مقال."
            : "Étape suivante : la vérification d'identité, puis la rédaction de votre premier article."}
        </p>
      </div>
    </main>
  );
}
