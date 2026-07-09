import Image from "next/image";
import type { Dictionary } from "@/lib/i18n";

export type AuthorData = {
  name: string;
  avatar: string | null;
  jobTitle: string | null;
  credentials: string | null;
  bio: string | null;
  registrationNumber: string | null;
};

/**
 * Encadré « À propos de l'auteur » en bas d'article.
 * Renforce l'E-E-A-T (Expertise, Experience, Authoritativeness, Trust) —
 * critère majeur pour le contenu santé YMYL.
 */
export function AuthorBio({ author, t }: { author: AuthorData; t: Dictionary["blog"] }) {
  if (!author.bio && !author.credentials) return null;
  const initial = author.name.charAt(0).toUpperCase();

  return (
    <aside
      aria-label={t.authorAboutTitle}
      className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        {author.avatar ? (
          <Image src={author.avatar} alt={author.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="text-xl font-bold text-primary-700">{initial}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t.authorAboutTitle}</p>
          <p className="text-base font-bold text-slate-900" dir="auto">{author.name}</p>
          {author.jobTitle && <p className="text-sm font-medium text-primary-700" dir="auto">{author.jobTitle}</p>}
          {author.credentials && <p className="text-sm text-slate-500 mt-1" dir="auto">{author.credentials}</p>}
          {author.bio && <p className="text-sm text-slate-600 leading-relaxed mt-2.5" dir="auto">{author.bio}</p>}
          {author.registrationNumber && (
            <p className="text-xs text-slate-400 mt-2">INPE : {author.registrationNumber}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
