import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { navItems, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <section id="contact" aria-labelledby="contact-heading" className="container-page scroll-mt-16 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div>
            <p className="eyebrow text-primary-foreground/60">Enquiries</p>
            <h2 id="contact-heading" className="mt-4 text-4xl leading-tight md:text-5xl">
              Let&apos;s shape your space together.
            </h2>
            <p className="mt-6 max-w-md text-primary-foreground/70">
              Tell me a little about your home or project. Your message opens in WhatsApp so we can start the
              conversation straight away, and I usually reply within one working day.
            </p>
            <dl className="mt-10 space-y-4 text-sm">
              <div>
                <dt className="text-primary-foreground/50">Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.email}`} className="underline-offset-4 hover:underline">
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-primary-foreground/50">Studio</dt>
                <dd>
                  {siteConfig.location.city}, working across {siteConfig.areaServed.slice(1).join(" & ")}
                </dd>
              </div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </section>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col gap-4 py-8 text-sm text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <nav aria-label="Footer" className="flex gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-primary-foreground">
                {item.label}
              </Link>
            ))}
            <a href={siteConfig.social.instagram} rel="me noopener" target="_blank" className="hover:text-primary-foreground">
              Instagram
            </a>
            <a href={siteConfig.social.linkedin} rel="me noopener" target="_blank" className="hover:text-primary-foreground">
              LinkedIn
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
