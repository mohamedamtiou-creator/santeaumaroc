"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleFollow } from "@/features/qa/follow-actions";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

export function FollowButton({
  questionId, following, isAuthed, t,
}: {
  questionId: string;
  following: boolean;
  isAuthed: boolean;
  t: QaT;
}) {
  const [isFollowing, setIsFollowing] = useState(following);
  const [, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function onClick() {
    if (!isAuthed) {
      router.push(`/connexion?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const next = !isFollowing;
    setIsFollowing(next);
    start(async () => {
      const res = await toggleFollow(questionId);
      if (res.ok) setIsFollowing(res.following);
      else setIsFollowing(following);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFollowing}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold border transition-colors ${
        isFollowing
          ? "bg-primary-50 text-primary-700 border-primary-200"
          : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700"
      }`}
    >
      <svg viewBox="0 0 16 16" fill={isFollowing ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2.5c-2.5 0-4 1.6-4 4 0 3 4 6.5 4 6.5s4-3.5 4-6.5c0-2.4-1.5-4-4-4z" />
        <path d="M8 4.5v4M6 6.5h4" />
      </svg>
      {isFollowing ? t.following : t.follow}
    </button>
  );
}

export function ShareButton({ title, t }: { title: string; t: QaT }) {
  const [copied, setCopied] = useState(false);

  function onClick() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold border bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 transition-colors"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="3.5" r="1.6" /><circle cx="4" cy="8" r="1.6" /><circle cx="12" cy="12.5" r="1.6" />
        <path d="M10.6 4.3 5.4 7.2M5.4 8.8l5.2 2.9" />
      </svg>
      {copied ? "✓" : t.share}
    </button>
  );
}
