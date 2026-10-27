"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { assetUrl } from "@/lib/assets";
import { HERO_ID, type HeroSlide } from "@/lib/home";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;

/**
 * Full-screen crossfading slideshow with a centred caption and dots. Every
 * slide is in the HTML, so the captions are indexed; only the visible one is
 * exposed to assistive tech.
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  // Bumped when a dot is pressed, so the timer restarts from the new slide.
  const [restart, setRestart] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setCurrent((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, restart]);

  return (
    <section
      id={HERO_ID}
      aria-roledescription="carousel"
      aria-label="Featured projects"
      className="relative h-svh min-h-[520px] overflow-hidden bg-[#8d8172] text-white"
    >
      {slides.map((slide, i) => (
        <figure
          key={slide.image}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}`}
          aria-hidden={i !== current}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
            i === current ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={assetUrl(slide.image)}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,rgb(20_16_12/0.38),transparent_42%),linear-gradient(180deg,rgb(20_16_12/0.25),transparent_22%)]"
          />
          <figcaption className="absolute inset-x-0 bottom-[86px] grid justify-items-center gap-3.5 px-5 text-center">
            <h2 className="title-caps tracking-[0.6em] text-light">{slide.title}</h2>
            <p className="max-w-[64ch] text-xs leading-[1.6] tracking-[0.02em]">{slide.caption}</p>
          </figcaption>
        </figure>
      ))}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-[26px] flex justify-center gap-1">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Show ${slide.title}`}
              aria-current={i === current || undefined}
              onClick={() => {
                setCurrent(i);
                setRestart((n) => n + 1);
              }}
              className="group grid size-[18px] place-items-center rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-current"
            >
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-current opacity-45 transition-opacity duration-400 group-aria-[current=true]:opacity-100"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
