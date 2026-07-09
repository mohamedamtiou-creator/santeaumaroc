"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

/**
 * Widget CAPTCHA Cloudflare Turnstile (rendu explicite — robuste à la navigation
 * client). Turnstile injecte un champ caché `cf-turnstile-response` dans le
 * conteneur, soumis avec le formulaire et vérifié par la Server Action.
 */
export function TurnstileWidget({ siteKey, locale }: { siteKey: string; locale?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const SID = "cf-turnstile-script";

    function renderWidget() {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "light",
        language: locale === "ar" ? "ar" : "fr",
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else if (!document.getElementById(SID)) {
      const s = document.createElement("script");
      s.id = SID;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = renderWidget;
      document.head.appendChild(s);
    } else {
      const poll = setInterval(() => {
        if (window.turnstile) {
          clearInterval(poll);
          renderWidget();
        }
      }, 200);
      setTimeout(() => clearInterval(poll), 5000);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* noop */ }
      }
    };
  }, [siteKey, locale]);

  return <div ref={ref} className="my-1" />;
}
