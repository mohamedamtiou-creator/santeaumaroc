import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { CallbackActions } from "./_components/CallbackActions";
import { DashHeader } from "../_components/DashHeader";
import { Pagination } from "@/components/ui/Pagination";
import { parsePage, totalPages, buildPageUrl } from "@/lib/pagination";

const PER_PAGE = 20;

export const metadata = {
  title: "Demandes de rappel — SantéauMaroc",
  robots: { index: false, follow: false },
};

export default async function RappelsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await verifySession();
  const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
  if (!doctor) return null;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dash = dict.dashboard;
  const tp = dash.praticien;

  // Les demandes EN ATTENTE restent toutes visibles (actionnables) ;
  // seules les demandes traitées (archive, qui grandit) sont paginées.
  const { page, skip, take } = parsePage((await searchParams).page, PER_PAGE);

  const [pending, done, doneTotal] = await Promise.all([
    prisma.callbackRequest.findMany({
      where: { doctorId: doctor.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.callbackRequest.findMany({
      where: { doctorId: doctor.id, status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.callbackRequest.count({ where: { doctorId: doctor.id, status: { not: "PENDING" } } }),
  ]);

  const donePages = totalPages(doneTotal, PER_PAGE);
  const isEmpty = pending.length === 0 && doneTotal === 0;

  const slotLabel: Record<string, string> = {
    asap: tp.rappelsSlotAsap,
    morning: tp.rappelsSlotMorning,
    afternoon: tp.rappelsSlotAfternoon,
  };

  const labels = { markDone: tp.rappelsMarkDone, reopen: tp.rappelsReopen };

  function fmtDate(d: Date): string {
    const dt = new Date(d);
    return `${dt.getDate()} ${dash.monthShort[dt.getMonth()]}`;
  }

  function Row({ r }: { r: (typeof pending)[number] }) {
    const isPending = r.status === "PENDING";
    return (
      <div className="card p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
          isPending ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
        }`}>
          {(r.name?.[0] ?? "?").toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-slate-900 truncate">{r.name}</p>
            {!isPending && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-700 bg-secondary-50 border border-secondary-100 rounded-full px-2 py-0.5">
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {tp.rappelsDoneBadge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
            <span className="tabular-nums"><bdi dir="ltr">{r.phone}</bdi></span>
            {r.preferredSlot && slotLabel[r.preferredSlot] && (
              <>
                <span aria-hidden="true">·</span>
                <span>{slotLabel[r.preferredSlot]}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{fmtDate(r.createdAt)}</span>
          </div>
          {r.reason && (
            <p className="text-xs text-slate-600 mt-1 leading-snug line-clamp-2">
              <span className="text-slate-400">{tp.rappelsReasonLabel} </span>{r.reason}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${r.phone}`}
            aria-label={tp.rappelsCall}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z" />
            </svg>
          </a>
          <CallbackActions id={r.id} status={isPending ? "PENDING" : "CONTACTED"} labels={labels} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.rappelsTitle} subtitle={tp.rappelsSubtitle} />

      {isEmpty ? (
        <div className="empty-state py-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" className="w-8 h-8" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5a1 1 0 0 1 1-1h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1 1 0 0 1-1 1A14 14 0 0 1 4 5z" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">{tp.rappelsEmpty}</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {tp.rappelsPending} ({pending.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {pending.map((r) => <Row key={r.id} r={r} />)}
              </div>
            </section>
          )}

          {doneTotal > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {tp.rappelsDone} ({doneTotal})
              </p>
              <div className="flex flex-col gap-2.5 opacity-80">
                {done.map((r) => <Row key={r.id} r={r} />)}
              </div>
              <Pagination
                page={page}
                totalPages={donePages}
                buildUrl={buildPageUrl("/praticien/tableau-de-bord/rappels", { page: String(page) })}
                t={dict.pagination}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
