import aboutContent from "@/content/about.json";

// The About page (/experience/): intro, résumé and skills. Kathy edits
// content/about.json as "About page" in Pages CMS (.pages.yml). Empty rows
// are dropped and empty sections are hidden, so half-filled CMS entries
// don't show as blanks.

export type Job = {
  role: string;
  company: string;
  location?: string;
  period: string;
  points: string[];
};

export type Education = { qualification: string; school: string; period?: string };

export type SkillGroup = { group: string; items: string[] };

export type Recognition = { title: string; year?: number };

type AboutContent = {
  headline: string;
  intro: string;
  bio?: string[];
  experience?: Partial<Job>[];
  education?: Partial<Education>[];
  skills?: Partial<SkillGroup>[];
  recognition?: Partial<Recognition>[];
};

// Typed by hand: TypeScript would otherwise infer the type from whatever the
// file holds today (an emptied list becomes never[]).
const content = aboutContent as unknown as AboutContent;

const isText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";
const textList = (value: unknown) => (Array.isArray(value) ? value.filter(isText) : []);

// The CMS marks these as required; fail the build with a clear message if a
// hand edit removes them anyway.
for (const key of ["headline", "intro"] as const) {
  if (!isText(content[key])) throw new Error(`content/about.json: "${key}" is missing`);
}

export const about = {
  headline: content.headline,
  /** Shown under the headline and used as the page's meta description. */
  intro: content.intro,
  bio: textList(content.bio),
};

export const experience: Job[] = (content.experience ?? [])
  .filter((job) => isText(job?.role) && isText(job.company) && isText(job.period))
  .map((job) => ({
    role: job.role!,
    company: job.company!,
    location: isText(job.location) ? job.location : undefined,
    period: job.period!,
    points: textList(job.points),
  }));

export const education: Education[] = (content.education ?? [])
  .filter((item) => isText(item?.qualification) && isText(item.school))
  .map((item) => ({
    qualification: item.qualification!,
    school: item.school!,
    period: isText(item.period) ? item.period : undefined,
  }));

export const skills: SkillGroup[] = (content.skills ?? [])
  .map((group) => ({ group: group?.group ?? "", items: textList(group?.items) }))
  .filter((group) => isText(group.group) && group.items.length > 0);

export const recognition: Recognition[] = (content.recognition ?? [])
  .filter((item) => isText(item?.title))
  .map((item) => ({ title: item.title!, year: typeof item.year === "number" ? item.year : undefined }));
