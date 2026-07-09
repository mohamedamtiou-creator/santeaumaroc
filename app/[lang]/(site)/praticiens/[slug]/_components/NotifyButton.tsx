"use client";

import { useState } from "react";

type Props = { notifyMe: string; willNotify: string };

export function NotifyButton({ notifyMe, willNotify }: Props) {
  const [notified, setNotified] = useState(false);

  if (notified) {
    return (
      <p className="mt-3 text-xs text-secondary-600 font-medium flex items-center justify-center gap-1.5">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8l3.5 3.5L13 4"/>
        </svg>
        {willNotify}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setNotified(true)}
      className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl px-4 py-2.5 border border-slate-200 hover:border-primary-200 transition-colors"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1a5 5 0 0 1 5 5v3l1.5 2.5h-13L3 9V6a5 5 0 0 1 5-5zM6.5 13a1.5 1.5 0 0 0 3 0"/>
      </svg>
      {notifyMe}
    </button>
  );
}
