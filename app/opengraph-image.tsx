import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f5f0e8",
          color: "#1f1d1a",
          backgroundImage:
            "linear-gradient(rgba(44,74,107,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(44,74,107,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#6b6359" }}>
          Interior Design
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, lineHeight: 1 }}>{siteConfig.designer}</div>
          <div style={{ fontSize: 40, marginTop: 24, color: "#b5643c" }}>From paper plan to finished room.</div>
        </div>
      </div>
    ),
    size,
  );
}
