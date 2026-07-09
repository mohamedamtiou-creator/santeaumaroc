"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-outline py-2 text-sm print:hidden">
      {label}
    </button>
  );
}
