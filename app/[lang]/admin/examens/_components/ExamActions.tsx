"use client";
import { deleteExam } from "@/features/medical-exam/actions";

export function DeleteBtn({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteExam.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Supprimer l'examen "${name}" ? Cette action est irréversible.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h12M5 4V2h6v2M6 8v4M10 8v4M4 4l.5 9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1L12 4"/>
        </svg>
      </button>
    </form>
  );
}
