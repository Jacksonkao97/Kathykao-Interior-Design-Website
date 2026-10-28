"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

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

/** Catches a crash inside the 3D canvas so the page keeps working. */
class ModelBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("The 3D model stopped working", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The featured project as a turning white clay model. A still render shows
 * first (and stays for browsers without WebGL, or if the model fails or the
 * phone drops the 3D canvas); three.js only loads once the section comes
 * near the screen, and stops rendering when it leaves.
 */
export function FeaturedModel({
  still,
  alt,
  label,
  modelUrl,
}: {
  still: string;
  alt: string;
  label: string;
  /** A .glb uploaded for the project; without one the study apartment shows. */
  modelUrl?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

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
        className={cn("object-contain transition-opacity duration-700", ready && !failed && "opacity-0")}
      />
      {mount && !failed && (
        <div
          role="img"
          aria-label={label}
          className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        >
          <ModelBoundary onError={onError}>
            <ClayModel active={visible} still={reduceMotion} modelUrl={modelUrl} onReady={onReady} onError={onError} />
          </ModelBoundary>
        </div>
      )}
    </div>
  );
}
