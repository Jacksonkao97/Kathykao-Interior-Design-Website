"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown } from "lucide-react";

import { PlanSketch } from "@/components/home/plan-sketch";
import { Button } from "@/components/ui/button";
import { STORY_STEPS, useStoryStore } from "@/lib/store";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// three.js only ever loads in the browser, after the HTML (and its text) is on screen.
const RoomScene = dynamic(() => import("@/components/three/room-scene"), { ssr: false });

const COPY = [
  {
    title: "Every room begins as a line on paper.",
    body: "I'm Kathy Kao, an interior designer. I turn flat drawings into homes and spaces that feel calm, personal and made to be lived in. Scroll to watch a plan become a room.",
  },
  {
    title: "Plan the way you live.",
    body: "We start with how you move through a day. Sightlines, light and storage shape the floor plan long before any finishes are chosen.",
  },
  {
    title: "Walls rise, proportions settle.",
    body: "The plan becomes volume. In 3D we test ceiling heights, openings and joinery together, so there are no surprises on site.",
  },
  {
    title: "Furnished with intention.",
    body: "Every piece earns its place: scaled to the room, chosen for comfort, and layered with materials that age well.",
  },
  {
    title: "Finished in light.",
    body: "Daylight by day, warm layers by night. The last step is the one you feel most, and it is planned from the very first sketch.",
  },
];

let webglSupport: boolean | undefined;

function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const noopSubscribe = () => () => {};

/** null while prerendering, then whether the browser can run the 3D scene. */
function useWebGL() {
  return useSyncExternalStore(noopSubscribe, hasWebGL, () => null);
}

function StepIndicator() {
  const step = useStoryStore((s) => s.step);
  return (
    <ol className="absolute top-1/2 right-5 hidden -translate-y-1/2 flex-col gap-3 text-xs md:flex lg:right-8" aria-hidden>
      {STORY_STEPS.map((s, i) => (
        <li
          key={s.id}
          className={cn(
            "flex items-center justify-end gap-3 transition-colors duration-500",
            i === step ? "text-foreground" : "text-muted-foreground/60",
          )}
        >
          <span className="tracking-[0.2em] uppercase">{s.label}</span>
          <span
            className={cn(
              "h-px transition-all duration-500",
              i === step ? "w-8 bg-accent" : "w-4 bg-muted-foreground/40",
            )}
          />
        </li>
      ))}
    </ol>
  );
}

export function BlueprintStory() {
  const section = useRef<HTMLElement>(null);
  const setProgress = useStoryStore((s) => s.setProgress);
  const webgl = useWebGL();
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    // Pause rendering whenever the story is off screen.
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
      });
      setProgress(trigger.progress);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-story-copy]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 48,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", end: "top 55%", scrub: true },
          });
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="story-heading" className="relative">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-700 md:pl-[38%]",
            ready ? "opacity-0" : "opacity-100",
          )}
        >
          <PlanSketch drawn={webgl === false} className="h-full max-h-[80svh] w-full" />
        </div>
        {webgl && (
          <div className="absolute inset-0">
            <RoomScene active={inView} onReady={() => setReady(true)} />
          </div>
        )}
        <StepIndicator />
      </div>

      <div className="relative -mt-[100svh]">
        {COPY.map((copy, i) => {
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div key={i} className="flex min-h-svh items-end pb-10 md:items-center md:pb-0">
              <div className="container-page">
                <div
                  data-story-copy={i === 0 ? undefined : ""}
                  className="max-w-md rounded-xl bg-background/85 p-6 shadow-sm backdrop-blur-sm md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
                >
                  <p className="eyebrow">
                    {String(i + 1).padStart(2, "0")} · {STORY_STEPS[i].label}
                  </p>
                  <Heading
                    id={i === 0 ? "story-heading" : undefined}
                    className={cn("mt-4 leading-[1.05]", i === 0 ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl")}
                  >
                    {copy.title}
                  </Heading>
                  <p className="mt-5 text-base text-muted-foreground md:text-lg">{copy.body}</p>
                  {i === 0 && (
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Button asChild size="lg">
                        <Link href="/projects/">View projects</Link>
                      </Button>
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowDown className="size-4 animate-bounce" />
                        Scroll the story
                      </span>
                    </div>
                  )}
                  {i === COPY.length - 1 && (
                    <div className="mt-8">
                      <Button asChild size="lg" variant="accent">
                        <a href="#contact">Start your project</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
