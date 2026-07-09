"use client";
import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setPct(total > 0 ? (scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div aria-hidden="true" className="fixed top-0 start-0 end-0 z-[60] h-[3px] bg-slate-100/60">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-[width] duration-75 ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
