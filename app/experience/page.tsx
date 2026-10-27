import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { PageIntro } from "@/components/page-intro";
import { education, experience, recognition, skills } from "@/lib/experience";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { breadcrumbSchema, personId } from "@/lib/structured-data";

const description =
  "Kathy Kao's experience as an interior designer: studio leadership, residential and hospitality projects, education and tools.";

export const metadata: Metadata = {
  title: "Experience",
  description,
  alternates: { canonical: "/experience/" },
  openGraph: { type: "profile", title: `${siteConfig.designer} — Experience`, description, url: "/experience/" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageIntro eyebrow="Résumé" title="A decade of turning plans into places.">
        <p>{description}</p>
      </PageIntro>

      <div className="container-page grid gap-16 md:grid-cols-[2fr_1fr] md:gap-20">
        <div className="space-y-16">
          <section aria-labelledby="work-heading">
            <h2 id="work-heading" className="text-3xl">
              Experience
            </h2>
            <ol className="mt-8 space-y-10">
              {experience.map((job) => (
                <li key={`${job.company}-${job.period}`} className="grid gap-2 border-t border-border pt-6 sm:grid-cols-[10rem_1fr]">
                  <p className="text-sm text-muted-foreground">{job.period}</p>
                  <div>
                    <h3 className="text-2xl">{job.role}</h3>
                    <p className="text-muted-foreground">
                      {job.company} · {job.location}
                    </p>
                    <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-muted-foreground">
                      {job.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="education-heading">
            <h2 id="education-heading" className="text-3xl">
              Education
            </h2>
            <ul className="mt-8 space-y-6">
              {education.map((item) => (
                <li key={item.qualification} className="grid gap-2 border-t border-border pt-6 sm:grid-cols-[10rem_1fr]">
                  <p className="text-sm text-muted-foreground">{item.period}</p>
                  <div>
                    <h3 className="text-2xl">{item.qualification}</h3>
                    <p className="text-muted-foreground">{item.school}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-12">
          {Object.entries(skills).map(([group, items]) => (
            <section key={group} aria-labelledby={`skills-${group}`}>
              <h2 id={`skills-${group}`} className="eyebrow">
                {group}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {items.map((skill) => (
                  <li key={skill} className="border border-border px-3 py-1 text-sm">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section aria-labelledby="recognition-heading">
            <h2 id="recognition-heading" className="eyebrow">
              Recognition
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {recognition.map((item) => (
                <li key={item.title} className="flex justify-between gap-4">
                  <span>{item.title}</span>
                  <span className="text-muted-foreground">{item.year}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/experience/"),
          mainEntity: {
            "@type": "Person",
            "@id": personId,
            name: siteConfig.designer,
            jobTitle: "Interior Designer",
            alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.school })),
            knowsAbout: Object.values(skills).flat(),
            hasOccupation: {
              "@type": "Occupation",
              name: "Interior Designer",
              skills: skills.Design.join(", "),
            },
          },
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Experience", path: "/experience/" },
        ])}
      />
    </>
  );
}
