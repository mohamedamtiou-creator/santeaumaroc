import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";
import { markAllNotificationsRead } from "@/features/notifications/actions";

export default async function NotificationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = espaceContent(locale);
  const session = await verifySession();
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, kind: true, title: true, body: true, href: true, readAt: true, createdAt: true } }),
    prisma.notification.count({ where: { userId: session.userId, readAt: null } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900" dir="auto">
          {t.notifTitle} {unread > 0 && <span className="text-sm font-normal text-slate-500">({unread} {t.unread})</span>}
        </h2>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <button type="submit" className="text-sm text-primary-700 font-medium hover:underline">{t.markAll}</button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm" dir="auto">{t.notifEmpty}</div>
      ) : (
        <ul className="space-y-2 list-none m-0 p-0">
          {items.map((n) => {
            const inner = (
              <div className={`card p-4 ${n.readAt ? "" : "border-primary-200 bg-primary-50/30"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900" dir="auto">{n.title}</p>
                    {n.body && <p className="text-sm text-slate-500 mt-0.5" dir="auto">{n.body}</p>}
                  </div>
                  {!n.readAt && <span className="shrink-0 h-2 w-2 rounded-full bg-primary-500 mt-1.5" aria-label={t.unreadDot} />}
                </div>
                <p className="text-xs text-slate-400 mt-1 tabular-nums">{n.createdAt.toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}</p>
              </div>
            );
            return <li key={n.id}>{n.href ? <Link href={n.href}>{inner}</Link> : inner}</li>;
          })}
        </ul>
      )}
    </div>
  );
}
