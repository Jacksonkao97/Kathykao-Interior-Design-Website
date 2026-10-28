import { ImageResponse } from "next/og";

import { capsStyle, ogColors, ogFonts, ogPhoto, shareImageSize, titleCapsStyle } from "@/lib/og";
import { featuredProject } from "@/lib/projects";
import { defaultShareImage } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

// The link preview for the site: Kathy's name on cream paper beside the cover
// of the featured project, so a new featured project in the CMS shows here too.

export const dynamic = "force-static";
export const alt = defaultShareImage.alt;
export const size = shareImageSize;
export const contentType = "image/png";

const PHOTO_WIDTH = 560;

export default async function OpengraphImage() {
  const photo = await ogPhoto(featuredProject.cover, PHOTO_WIDTH, size.height);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: ogColors.paper }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          }}
        >
          <div style={capsStyle}>Interior designer</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ ...titleCapsStyle, fontSize: 64, letterSpacing: 18, lineHeight: 1.2 }}>
              {siteConfig.designer}
            </div>
            <div style={{ fontFamily: "Caslon", fontSize: 28, marginTop: 28, color: ogColors.muted }}>
              {siteConfig.tagline}
            </div>
          </div>
          <div style={capsStyle}>{siteConfig.areaServed.join(" · ")}</div>
        </div>
        {photo && <img src={photo} alt="" width={PHOTO_WIDTH} height={size.height} />}
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
