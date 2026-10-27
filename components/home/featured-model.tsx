"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { assetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

const ClayModel = dynamic(() => import("@/components/three/clay-model"), {
  ssr: false,
});

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The featured project as a turning white clay model. A still render shows
 * first (and stays for browsers without WebGL); three.js only loads once the
 * section comes near the screen, and stops rendering when it leaves.
 */
export function FeaturedModel({ still, alt, label }: { still: string; alt: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        if (!hasWebGL()) return;
        setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        setMount(true);
      },
      { rootMargin: "400px 0px" },
    );
    const onScreen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    near.observe(el);
    onScreen.observe(el);
    return () => {
      near.disconnect();
      onScreen.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className="relative aspect-square w-full max-w-[1100px] min-[900px]:aspect-video min-[900px]:max-h-[64vh]"
    >
      <Image
        src={assetUrl(still)}
        alt={alt}
        fill
        sizes="(min-width: 1254px) 1100px, 100vw"
        className={cn("object-contain transition-opacity duration-700", ready && "opacity-0")}
      />
      {mount && (
        <div
          role="img"
          aria-label={label}
          className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        >
          <ClayModel active={visible} still={reduceMotion} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
