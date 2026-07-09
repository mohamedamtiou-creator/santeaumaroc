export default function GlobalLoading() {
  return (
    <div className="page-outer animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-24 bg-slate-200 rounded-full mb-3" />
        <div className="h-7 w-64 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-slate-100 rounded-full" />
        <div className="mt-4 h-px bg-slate-100" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-5"
            style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
          >
            <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-3" />
            <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-2" />
            <div className="h-3 bg-slate-100 rounded-full w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
