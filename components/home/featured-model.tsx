"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { assetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

const ClayModel = dynamic(() => import("@/components/three/clay-model"), {
  ssr: false,
});

/** The GPU's name, "" when WebGL works but hides it, or null without WebGL. */
function probeGpu() {
  try {
    const gl =
      document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return null;
  }
}

// PowerVR GPUs (the Pixel 10 and some other phones) crash the browser a few
// seconds into showing the model, with or without shadows, and the page
// reloads; they get the still image.
const NO_3D_GPU = /PowerVR|Imagination/i;

// A device whose 3D crashed shows the still image for a week instead of
// crashing again on every visit. "running" is set while the model shows and
// cleared when the page is hidden, so finding it on load means the page died
// with the model on screen (some phones reload the page when the GPU fails).
const CRASHED_KEY = "clay-model-crashed";
const RUNNING_KEY = "clay-model-running";
const CRASH_MEMORY_MS = 7 * 24 * 60 * 60 * 1000;

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function crashedRecently() {
  const store = storage();
  if (!store) return false;
  try {
    if (store.getItem(RUNNING_KEY)) {
      store.removeItem(RUNNING_KEY);
      store.setItem(CRASHED_KEY, String(Date.now()));
    }
    return Date.now() - Number(store.getItem(CRASHED_KEY) ?? 0) < CRASH_MEMORY_MS;
  } catch {
    return false;
  }
}

function remember(key: string, on: boolean) {
  try {
    if (on) storage()?.setItem(key, String(Date.now()));
    else storage()?.removeItem(key);
  } catch {
    // Private mode or storage turned off: nothing to remember.
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
  /** Shown until the model is ready, and instead of it when 3D can't run. */
  still?: string;
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
  const onLost = useCallback(() => {
    remember(CRASHED_KEY, true);
    setReady(false);
  }, []);
  const onError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        const gpu = probeGpu();
        if (gpu === null || NO_3D_GPU.test(gpu) || crashedRecently()) return;
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

  // Marks the model as running while it is on a visible page; see RUNNING_KEY.
  useEffect(() => {
    if (!ready || failed) return;
    const mark = () => remember(RUNNING_KEY, document.visibilityState === "visible");
    const clear = () => remember(RUNNING_KEY, false);
    mark();
    document.addEventListener("visibilitychange", mark);
    window.addEventListener("pagehide", clear);
    return () => {
      document.removeEventListener("visibilitychange", mark);
      window.removeEventListener("pagehide", clear);
      clear();
    };
  }, [ready, failed]);

  return (
    <div
      ref={ref}
      data-reveal
      className="relative aspect-square w-full max-w-[1100px] min-[900px]:aspect-video min-[900px]:max-h-[64vh]"
    >
      {still && (
        <Image
          src={assetUrl(still)}
          alt={alt}
          fill
          sizes="(min-width: 1254px) 1100px, 100vw"
          className={cn("object-contain transition-opacity duration-700", ready && !failed && "opacity-0")}
        />
      )}
      {mount && !failed && (
        <div
          role="img"
          aria-label={label}
          className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        >
          <ModelBoundary onError={onError}>
            <ClayModel
              active={visible}
              still={reduceMotion}
              modelUrl={modelUrl && assetUrl(modelUrl)}
              onReady={onReady}
              onLost={onLost}
              onError={onError}
            />
          </ModelBoundary>
        </div>
      )}
    </div>
  );
}
