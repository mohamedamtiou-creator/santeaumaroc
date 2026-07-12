import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { blogCardLocalized } from "@/lib/blog-content";

export type PostCardData = {
  title:       string;
  slug:        string;
  excerpt:     string;
  coverImage:  string | null;
  coverAlt:    string | null;
  readingTime: number | null;
  publishedAt: Date | null;
  category:    { name: string; slug: string; color: string };
  author:      { name: string; avatar: string | null };
  // Traduction AR (facultative) : servie sur la carte si le verrou est ouvert.
  titleAr?:      string | null;
  excerptAr?:    string | null;
  arReviewedAt?: Date | string | null;
};

const COLOR_MAP: Record<string, string> = {
  blue:  "bg-primary-50 text-primary-700 border-primary-200",
  green: "bg-secondary-50 text-secondary-700 border-secondary-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose:  "bg-rose-50 text-rose-700 border-rose-200",
};

// Gradient + icon per category color — visually distinct, no more identical placeholders
const COVER_VARIANTS: Record<string, { bg: string; iconColor: string; icon: React.ReactNode }> = {
  blue: {
    bg: "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)",
    iconColor: "#3b82f6",
    icon: (
      <>
        {/* Heart */}
        <path d="M8 13.5C5 11 2 9 2 6.5A3.5 3.5 0 0 1 8 4.2 3.5 3.5 0 0 1 14 6.5C14 9 11 11 8 13.5z" strokeWidth="1.25"/>
        {/* ECG pulse */}
        <path d="M2 8.5h2l1.5-2 2 4 1.5-2H14" strokeWidth="1.25"/>
      </>
    ),
  },
  green: {
    bg: "linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)",
    iconColor: "#10b981",
    icon: (
      <>
        {/* Leaf */}
        <path d="M12 3C8 3 3 7 3 12c0 0 3-1.5 5-3.5s5-2.5 4 3c1.5-3 2.5-7-2-9z" strokeWidth="1.25"/>
        <path d="M3 12c1.5 0 4-1 6-3" strokeWidth="1.25"/>
        {/* Apple stem */}
        <path d="M9 3.5C9 2 10 1.5 10 1.5" strokeWidth="1.25"/>
      </>
    ),
  },
  amber: {
    bg: "linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)",
    iconColor: "#f59e0b",
    icon: (
      <>
        {/* Shield */}
        <path d="M8 2 2 5v4c0 3 2.5 5.5 6 6.5C11.5 14.5 14 12 14 9V5L8 2z" strokeWidth="1.25"/>
        {/* Medical cross */}
        <path d="M8 6.5v3M6.5 8h3" strokeWidth="1.5"/>
      </>
    ),
  },
  rose: {
    bg: "linear-gradient(135deg,#ffe4e6 0%,#fecdd3 100%)",
    iconColor: "#fb7185",
    icon: (
      <>
        {/* Flower petals */}
        <circle cx="8" cy="8" r="2" strokeWidth="1.25"/>
        <ellipse cx="8" cy="4" rx="1.5" ry="2" strokeWidth="1.25"/>
        <ellipse cx="8" cy="12" rx="1.5" ry="2" strokeWidth="1.25"/>
        <ellipse cx="4" cy="8" rx="2" ry="1.5" strokeWidth="1.25"/>
        <ellipse cx="12" cy="8" rx="2" ry="1.5" strokeWidth="1.25"/>
      </>
    ),
  },
};

function fmtDate(d: Date, locale: string) {
  // ar-MA : noms de mois en arabe, chiffres latins (numérotation par défaut de l'arabe marocain)
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(d));
}

function DefaultCover({ color }: { color: string }) {
  const v = COVER_VARIANTS[color] ?? COVER_VARIANTS.blue;
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: v.bg }}>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke={v.iconColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-14 h-14 opacity-70"
        aria-hidden="true"
      >
        {v.icon}
      </svg>
    </div>
  );
}

export function PostCard({
  post,
  featured = false,
  t = getDictionary("fr").blog,
  locale = "fr",
}: {
  post: PostCardData;
  featured?: boolean;
  t?: Dictionary["blog"];
  locale?: string;
}) {
  const colorCls = COLOR_MAP[post.category.color] ?? COLOR_MAP.blue;
  const initial  = post.author.name.charAt(0).toUpperCase();
  // Localisation FR/AR de la carte (repli FR si verrou fermé — cf lib/blog-content)
  const { title, excerpt } = blogCardLocalized(post, locale);
  const readAria = t.readArticleAria.replace("{title}", title);

  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        aria-label={readAria}
        className="group grid md:grid-cols-2 gap-0 bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        <div className="aspect-[16/9] md:aspect-auto md:min-h-[240px] relative overflow-hidden">
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.coverAlt || title} fill priority quality={65} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <DefaultCover color={post.category.color} />
          )}
        </div>
        <div className="flex flex-col p-7 justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colorCls}`}>
              {post.category.name}
            </span>
            {post.readingTime && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                {t.readingTimeLong.replace("{n}", String(post.readingTime))}
              </span>
            )}
          </div>
          <h2 dir="auto" className="font-extrabold text-slate-900 text-xl sm:text-2xl leading-snug mb-3 group-hover:text-primary-700 transition-colors line-clamp-3">
            {title}
          </h2>
          <p dir="auto" className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-5">{excerpt}</p>
          <div className="flex items-center justify-between">
            <AuthorBadge author={post.author} initial={initial} />
            {post.publishedAt && (
              <time dateTime={new Date(post.publishedAt).toISOString()} className="text-xs text-slate-500">
                {fmtDate(post.publishedAt, locale)}
              </time>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      aria-label={readAria}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.coverAlt || title} fill quality={65} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <DefaultCover color={post.category.color} />
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colorCls}`}>
            {post.category.name}
          </span>
          {post.readingTime && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3 h-3 shrink-0" aria-hidden="true" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
              {t.readingTimeShort.replace("{n}", String(post.readingTime))}
            </span>
          )}
        </div>
        <h3 dir="auto" className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
          {title}
        </h3>
        <p dir="auto" className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">{excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <AuthorBadge author={post.author} initial={initial} />
          {post.publishedAt && (
            <time dateTime={new Date(post.publishedAt).toISOString()} className="text-xs text-slate-500">
              {fmtDate(post.publishedAt, locale)}
            </time>
          )}
        </div>
      </div>
    </Link>
  );
}

function AuthorBadge({ author, initial }: { author: PostCardData["author"]; initial: string }) {
  return (
    <div className="flex items-center gap-2">
      {author.avatar ? (
        <Image src={author.avatar} alt={author.name} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0" aria-hidden="true">
          <span className="text-xs font-bold text-primary-700">{initial}</span>
        </div>
      )}
      <span className="text-xs text-slate-500 truncate max-w-[120px]">{author.name}</span>
    </div>
  );
}
