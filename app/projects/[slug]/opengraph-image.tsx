import { ImageResponse } from "next/og";

import { capsStyle, ogColors, ogFonts, ogPhoto, shareImageSize, titleCapsStyle } from "@/lib/og";
import { getProject, projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

// The link preview for a project: its name and details on cream paper beside
// the cover photo, or beside its plan colours until a photo is added.

// The project page links to this image itself (with the cover's alt text),
// because its metadata would otherwise replace the tags Next adds for it.
export const dynamic = "force-static";
export const size = shareImageSize;
export const contentType = "image/png";

// Static export needs the slugs here as well as on the page.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const PHOTO_WIDTH = 720;

export default async function ProjectOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug)!;
  const photo = await ogPhoto(project.cover, PHOTO_WIDTH, shareImageSize.height);
  const [base, light, mid] = project.palette;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: ogColors.paper }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 56px 60px",
          }}
        >
          <div style={capsStyle}>{`${siteConfig.shortName} Interiors`}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={capsStyle}>{`${project.category} · ${project.year}`}</div>
            <div style={{ ...titleCapsStyle, fontSize: 40, letterSpacing: 10, lineHeight: 1.4, marginTop: 20 }}>
              {project.title}
            </div>
            <div style={{ ...capsStyle, marginTop: 20 }}>{project.location}</div>
          </div>
        </div>
        {photo ? (
          <img src={photo} alt="" width={PHOTO_WIDTH} height={shareImageSize.height} />
        ) : (
          <div style={{ width: PHOTO_WIDTH, display: "flex", background: base, padding: 48, gap: 24 }}>
            <div style={{ flex: 3, display: "flex", background: light }} />
            <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ flex: 2, display: "flex", background: mid }} />
              <div style={{ flex: 3, display: "flex", background: light }} />
            </div>
          </div>
        )}
      </div>
    ),
    { ...shareImageSize, fonts: await ogFonts() },
  );
}
