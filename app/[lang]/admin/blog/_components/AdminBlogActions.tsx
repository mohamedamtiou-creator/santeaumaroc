"use client";
import { publishPost, unpublishPost, deletePost } from "@/features/blog/actions";

export function PublishToggle({ id, status }: { id: string; status: string }) {
  if (status === "PUBLISHED") {
    return (
      <form action={unpublishPost.bind(null, id)}>
        <button
          type="submit"
          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          title="Dépublier"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/>
          </svg>
        </button>
      </form>
    );
  }
  return (
    <form action={publishPost.bind(null, id)}>
      <button
        type="submit"
        className="p-1.5 rounded-lg text-slate-500 hover:text-secondary-600 hover:bg-secondary-50 transition-colors"
        title="Publier"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6"/><path d="m5.5 8 1.5 1.5 3.5-3.5"/>
        </svg>
      </button>
    </form>
  );
}

export function DeleteBtn({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePost.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Supprimer l'article "${title}" ? Cette action est irréversible.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Supprimer"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h12M5 4V2h6v2M6 8v4M10 8v4M4 4l.5 9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1L12 4"/>
        </svg>
      </button>
    </form>
  );
}
