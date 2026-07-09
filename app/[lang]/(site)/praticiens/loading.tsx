import { PraticienCardSkeleton } from "@/components/PraticienCardSkeleton";

export default function PraticiensLoading() {
  return (
    <div className="page-outer animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-28 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-44 bg-slate-100 rounded-full" />
        <div className="mt-4 h-px bg-slate-100" />
      </div>
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 h-14"
        style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }} />
      {/* Doctor card skeletons */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }, (_, i) => (
          <PraticienCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
