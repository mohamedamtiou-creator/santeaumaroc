import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { ContactForm } from "./_components/ContactForm";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Contact — SantéauMaroc",
    description:
      "Contactez l'équipe SantéauMaroc pour toute question, signalement ou demande de partenariat. Réponse sous 24h ouvrées.",
    alternates: localizedAlternates("/contact", locale),
    openGraph: {
      title: "Contact — SantéauMaroc",
      description: "Contactez notre équipe pour toute question ou demande de partenariat.",
      url: "/contact",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Contact — SantéauMaroc",
      description: "Contactez notre équipe. Réponse sous 24h ouvrées.",
    },
  };
}

/* ── Icônes ──────────────────────────────────────────────── */

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91A16 16 0 0 0 14 15.81l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3"/>
      <path d="m2 7 10 7 10-7"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-4 h-4 shrink-0 transition-transform duration-200" aria-hidden="true" strokeLinecap="round">
      <path d="m4 6 4 4 4-4"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5.5v6C4 16.24 7.5 20.5 12 22c4.5-1.5 8-5.76 8-10.5v-6L12 2z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const tc = getDictionary(locale).contact;

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

  // Téléphone / e-mail = données (jamais traduites) ; libellés & sous-titres = dict.
  const cards = [
    {
      icon: <PhoneIcon />,
      label: tc.cards.phoneLabel,
      value: "+212 661 44 63 34",
      sub: tc.cards.phoneSub,
      href: "tel:+212661446334",
      color: "bg-primary-50 text-primary-600",
      gradient: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
    },
    {
      icon: <EmailIcon />,
      label: tc.cards.emailLabel,
      value: "contact@santeaumaroc.com",
      sub: tc.cards.emailSub,
      href: "mailto:contact@santeaumaroc.com",
      color: "bg-secondary-50 text-secondary-600",
      gradient: "linear-gradient(90deg, #059669 0%, #10b981 100%)",
    },
    {
      icon: <ClockIcon />,
      label: tc.cards.hoursLabel,
      value: tc.cards.hoursValue,
      sub: tc.cards.hoursSub,
      href: null,
      color: "bg-amber-50 text-amber-600",
      gradient: "linear-gradient(90deg, #d97706 0%, #fbbf24 100%)",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": tc.faq.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${BASE}/contact` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden">
        {/* Motif de points décoratif */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="section-eyebrow text-secondary-300 mb-3">
              {tc.hero.eyebrow}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              {tc.hero.title}
            </h1>
            <p className="text-primary-200 text-base leading-relaxed max-w-lg">
              {tc.hero.subtitle}
            </p>

            {/* Pill de confiance */}
            <div className="mt-6 inline-flex items-center gap-2 badge-trust text-sm">
              <ShieldIcon />
              {tc.hero.badge}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">

        {/* ── Cartes de contact ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {cards.map((c) => {
            const inner = (
              <>
                <div className="h-1 w-full" style={{ background: c.gradient }} />
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center shrink-0`}>
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">
                      {c.label}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate"><bdi>{c.value}</bdi></p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
                  </div>
                </div>
              </>
            );

            return c.href ? (
              <a key={c.label} href={c.href}
                className="card overflow-hidden p-0 hover:shadow-md transition-shadow group">
                {inner}
              </a>
            ) : (
              <div key={c.label} className="card overflow-hidden p-0">
                {inner}
              </div>
            );
          })}
        </div>

        {/* ── Formulaire + FAQ ────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── Formulaire (3/5) ───────────────────── */}
          <div className="lg:col-span-3">
            <div className="card overflow-hidden p-0">
              {/* Bande dégradée */}
              <div className="h-1.5"
                style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />

              <div className="p-6 sm:p-7">
                <div className="mb-6">
                  <p className="section-eyebrow mb-1">{tc.form.eyebrow}</p>
                  <h2 className="text-lg font-bold text-slate-900">{tc.form.title}</h2>
                  <div className="mt-3 h-px"
                    style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
                </div>
                <ContactForm t={tc.form} subjects={tc.subjects} />
              </div>
            </div>
          </div>

          {/* ── FAQ (2/5) ───────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Card FAQ */}
            <div className="card overflow-hidden p-0">
              <div className="h-1.5"
                style={{ background: "linear-gradient(90deg, #059669 0%, #10b981 100%)" }} />
              <div className="p-5 sm:p-6">
                <div className="mb-5">
                  <p className="section-eyebrow mb-1">{tc.faqEyebrow}</p>
                  <h2 className="text-base font-bold text-slate-900">{tc.faqTitle}</h2>
                </div>

                <div className="space-y-1">
                  {tc.faq.map((item, i) => (
                    <details key={i} className="group border border-slate-100 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none
                        text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors
                        [&::-webkit-details-marker]:hidden
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500">
                        <span className="flex-1 leading-snug">{item.q}</span>
                        <span className="shrink-0 text-slate-500 group-open:rotate-180 transition-transform duration-200">
                          <ChevronIcon />
                        </span>
                      </summary>
                      <div className="px-4 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Adresse */}
            <div className="card overflow-hidden p-0">
              <div className="h-1.5"
                style={{ background: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)" }} />
              <div className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <LocationIcon />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">
                    {tc.addressLabel}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{tc.addressValue}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {tc.addressSub}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA bas de page ────────────────────────── */}
        <div className="mt-12 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #047857 100%)" }}>
          <div className="relative px-6 py-10 sm:px-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Cercles décoratifs */}
            <div className="absolute end-0 top-0 w-64 h-64 rounded-full opacity-10 translate-x-1/3 -translate-y-1/3"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
              aria-hidden="true"
            />
            <div>
              <p className="text-secondary-300 text-xs font-bold uppercase tracking-widest mb-1">
                {tc.cta.eyebrow}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {tc.cta.title}
              </h2>
              <p className="text-primary-300 text-sm mt-1.5">
                {tc.cta.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/praticiens" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 text-sm">
                {tc.cta.findDoctor}
              </Link>
              <Link href="/specialites" className="btn-ghost-white px-6 py-3 text-sm">
                {tc.cta.specialties}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
