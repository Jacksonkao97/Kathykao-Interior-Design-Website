"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fades elements marked `data-reveal` in as they scroll into view and out as
 * they leave, by toggling `data-shown`. The styles live in globals.css and
 * only apply once this script has run, so content is visible without it.
 */
export function ScrollFades() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    // Mark what is already on screen first, so it doesn't blink out and back.
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.toggleAttribute("data-shown", r.top < innerHeight && r.bottom > 0);
    });
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-shown", entry.isIntersecting);
        }
      },
      { rootMargin: "-8% 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
