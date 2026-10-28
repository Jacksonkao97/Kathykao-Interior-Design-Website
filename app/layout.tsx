import type { Metadata, Viewport } from "next";
import { Jost, Libre_Caslon_Text } from "next/font/google";

import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/json-ld";
import { ScrollFades } from "@/components/scroll-fades";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { businessSchema } from "@/lib/structured-data";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  ...pageMetadata({
    title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.designer, url: siteConfig.url }],
  creator: siteConfig.designer,
  keywords: [...siteConfig.keywords],
  appleWebApp: { title: siteConfig.shortName },
  // Pages are indexed by default; this lets search show large photo previews.
  robots: { "max-image-preview": "large" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jost.variable} ${caslon.variable} antialiased`}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="sr-only z-50 bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ScrollFades />
        <JsonLd data={businessSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
