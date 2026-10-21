"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/site";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildWhatsAppUrl(name: string, email: string, message: string) {
  const text = `Hi Kathy, I'm ${name} (${email}).\n\n${message}`;
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Please tell me your name.";
    if (!EMAIL_RE.test(email)) next.email = "Please enter a valid email address.";
    if (message.length < 10) next.message = "A sentence or two about your project helps a lot.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    window.open(buildWhatsAppUrl(name, email, message), "_blank", "noopener,noreferrer");
  }

  const field = "border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/40";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6" aria-describedby="contact-note">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={field}
          />
          {errors.name && (
            <p id="contact-name-error" className="text-sm text-[#f3b7a0]">
              {errors.name}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={field}
          />
          {errors.email && (
            <p id="contact-email-error" className="text-sm text-[#f3b7a0]">
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-message">About your project</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="The space, rough size, timing and what you'd love it to feel like."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={field}
        />
        {errors.message && (
          <p id="contact-message-error" className="text-sm text-[#f3b7a0]">
            {errors.message}
          </p>
        )}
      </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="contact-note" className="text-xs text-primary-foreground/50">
          Sending opens WhatsApp with your message ready to go.
        </p>
        <Button type="submit" variant="accent" size="lg">
          <MessageCircle />
          Send via WhatsApp
        </Button>
      </div>
    </form>
  );
}
