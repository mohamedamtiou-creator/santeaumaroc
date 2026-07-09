// Skeleton unique de la carte praticien — partagé par app/praticiens/loading.tsx
// (chargement de route) et le fallback Suspense de la liste, pour éviter le « saut »
// visuel entre deux squelettes divergents. Reflète la vraie carte : avatar rond,
// lignes d'info, et l'emplacement du bouton « Prendre RDV ».
// L'animation `animate-pulse` est portée par le conteneur parent.
export function PraticienCardSkeleton() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4 items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-4 bg-slate-200 rounded-full w-40" />
          <div className="h-3 bg-slate-100 rounded-full w-20" />
          <div className="h-3 bg-slate-100 rounded-full w-36" />
          <div className="h-3 bg-slate-100 rounded-full w-32" />
          <div className="h-3 bg-slate-100 rounded-full w-28" />
          <div className="flex justify-end pt-1">
            <div className="h-9 w-28 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
