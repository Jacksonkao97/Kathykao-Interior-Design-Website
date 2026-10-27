import { cn } from "@/lib/utils";

/** A word set one letter per line down both page edges, as on Norm's site. */
function SideLabel({ word, side }: { word: string; side: "left" | "right" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-1/2 hidden -translate-y-1/2 flex-col items-center font-serif text-[11px] leading-[1.65] uppercase min-[900px]:flex",
        side === "left" ? "left-[31px]" : "right-[31px]",
      )}
    >
      {[...word].map((letter, i) => (
        <span key={i}>{letter}</span>
      ))}
    </span>
  );
}

/** Home page section: centred letter-spaced title with side labels. */
export function HomeSection({
  id,
  title,
  sideLabel,
  children,
}: {
  id: string;
  title: string;
  sideLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="relative scroll-mt-16 pt-[clamp(80px,9vw,130px)]">
      <SideLabel word={sideLabel} side="left" />
      <SideLabel word={sideLabel} side="right" />
      <h2 data-reveal id={`${id}-heading`} className="title-caps mb-[clamp(48px,6vw,84px)] text-center">
        {title}
      </h2>
      <div className="page-inner">{children}</div>
    </section>
  );
}
