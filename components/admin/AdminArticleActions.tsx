"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignReview, publishApproved } from "@/features/review/actions";

/** Actions rapides dans la file : prendre en revue (SUBMITTED), publier (APPROVED). */
export function AdminArticleActions({ postId, status }: { postId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ errors?: Record<string, string> } | undefined>) {
    startTransition(async () => {
      const res = await fn();
      if (res?.errors) alert(Object.values(res.errors).join(" "));
      else router.refresh();
    });
  }

  if (status === "SUBMITTED") {
    return (
      <button type="button" disabled={pending} onClick={() => run(() => assignReview(postId))} className="text-sm text-blue-700 font-medium hover:underline disabled:opacity-50">
        Prendre en revue
      </button>
    );
  }
  if (status === "APPROVED") {
    return (
      <button type="button" disabled={pending} onClick={() => run(() => publishApproved(postId))} className="text-sm text-secondary-700 font-medium hover:underline disabled:opacity-50">
        Publier
      </button>
    );
  }
  return null;
}
