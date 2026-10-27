"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { HERO_ID } from "@/lib/home";
import { navItems, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const isHome = pathname === "/";
  const solid = !isHome || pastHero || open;

  useEffect(() => {
    const hero = document.getElementById(HERO_ID);
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
      rootMargin: "-80px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  const isActive = (href: string) => pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-colors duration-500",
          solid ? "bg-background text-foreground" : "text-light",
        )}
      >
        <div
          className={cn(
            "grid h-[76px] grid-cols-[1fr_auto] items-center px-5 transition-[height] duration-500 min-[900px]:grid-cols-[1fr_auto_1fr] min-[900px]:px-[38px]",
            solid ? "min-[900px]:h-[72px]" : "min-[900px]:h-[104px]",
          )}
        >
          <Link
            href="/"
            className="text-sm font-light tracking-[0.16em] whitespace-nowrap uppercase sm:text-base sm:tracking-[0.2em]"
          >
            {siteConfig.shortName} Interiors
          </Link>

          <nav aria-label="Main" className="caps hidden gap-[26px] min-[900px]:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="transition-opacity hover:opacity-60 aria-[current=page]:underline aria-[current=page]:underline-offset-[6px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="relative -mr-2 h-10 w-10 justify-self-end min-[900px]:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-2 h-px w-6 bg-current transition-transform duration-300",
                open ? "top-1/2 rotate-45" : "top-[13px]",
              )}
            />
            <span
              aria-hidden
              className={cn("absolute top-1/2 left-2 h-px w-6 bg-current transition-opacity", open && "opacity-0")}
            />
            <span
              aria-hidden
              className={cn(
                "absolute left-2 h-px w-6 bg-current transition-transform duration-300",
                open ? "top-1/2 -rotate-45" : "bottom-[13px]",
              )}
            />
          </button>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            aria-label="Main"
            className="flex h-[calc(100svh-76px)] flex-col items-center justify-center gap-8 bg-background pb-24 min-[900px]:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="title-caps text-base"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {/* Pages without a full-screen hero start below the fixed header. */}
      {!isHome && <div aria-hidden className="h-[76px] min-[900px]:h-[72px]" />}
    </>
  );
}
