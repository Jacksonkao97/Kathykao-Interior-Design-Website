import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60svh] flex-col items-start justify-center py-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl md:text-5xl">This room isn&apos;t on the plan.</h1>
      <p className="mt-4 text-muted-foreground">The page you were looking for doesn&apos;t exist or has moved.</p>
      <Button asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
