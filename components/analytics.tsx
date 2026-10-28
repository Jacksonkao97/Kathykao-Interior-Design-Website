import Script from "next/script";

// Google Analytics 4. Only the live deploy sets the measurement ID (in
// .github/workflows/firebase-hosting-merge.yml), so local work and PR
// previews don't count as visits. The tag loads after the page is
// interactive; GA4's enhanced measurement counts client-side navigations as
// page views, so nothing else is needed per route.
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  if (!measurementId || process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config",${JSON.stringify(measurementId)});`}
      </Script>
    </>
  );
}
