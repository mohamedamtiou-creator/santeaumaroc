"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { startProTrial } from "@/features/subscription/order-actions";

export function StartTrialButton({
  label,
  redirectTo,
  className = "btn-secondary py-2.5 text-sm disabled:opacity-60",
}: {
  label: string;
  /** Si fourni, navigue vers cette URL après succès ; sinon rafraîchit la page. */
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await startProTrial();
            if (r.error) setError(r.error);
            else if (redirectTo) router.push(redirectTo);
            else router.refresh();
          })
        }
        className={className}
      >
        {pending ? "…" : label}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
