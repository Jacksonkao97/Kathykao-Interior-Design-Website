import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { contactCopy, navItems, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer>
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="page-inner grid scroll-mt-20 gap-7 pt-[clamp(80px,9vw,130px)] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] min-[900px]:gap-12"
      >
        <div>
          <h2 id="contact-heading" className="text-[clamp(26px,2.4vw,34px)] leading-[1.25]">
            {contactCopy.heading}
          </h2>
          <p className="mt-4 max-w-[34ch] text-muted-foreground">{contactCopy.lede}</p>
          <p className="mt-8 text-muted-foreground">
            <a href={`mailto:${siteConfig.email}`} className="underline-offset-4 hover:underline">
              {siteConfig.email}
            </a>
            <br />
            {siteConfig.location.city}, working across {siteConfig.areaServed.slice(1).join(" & ")}
          </p>
        </div>
        <ContactForm />
      </section>

      <div className="page-inner caps mt-[clamp(110px,12vw,170px)] flex flex-wrap justify-between gap-x-6 gap-y-2.5 border-t border-border pt-7 pb-[calc(48px+env(safe-area-inset-bottom))] text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <a href={siteConfig.social.instagram} rel="me noopener" target="_blank" className="hover:text-foreground">
            Instagram
          </a>
          <a href={siteConfig.social.linkedin} rel="me noopener" target="_blank" className="hover:text-foreground">
            LinkedIn
          </a>
        </nav>
      </div>
    </footer>
  );
}
