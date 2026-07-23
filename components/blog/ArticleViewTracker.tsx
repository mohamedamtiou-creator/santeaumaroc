"use client";

import { useEffect } from "react";

/**
 * Traceur de lecture (dashboard auteur). Émet en fire-and-forget :
 *   - « view » au montage,
 *   - « read » une seule fois quand ≥ 70 % de la page a défilé.
 * Aucune UI, aucun impact sur le rendu. cf /api/track/article-view.
 */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const send = (type: "view" | "read") => {
      const payload = JSON.stringify({ slug, type });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/track/article-view", new Blob([payload], { type: "application/json" }));
        } else {
          void fetch("/api/track/article-view", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } });
        }
      } catch {
        /* best-effort */
      }
    };

    send("view");

    let read = false;
    const onScroll = () => {
      if (read) return;
      const doc = document.documentElement;
      const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      if (scrolled >= 0.7) {
        read = true;
        send("read");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}
