export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header data-reveal className="container-page pt-20 pb-14 md:pt-28 md:pb-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-[1.15] md:text-6xl">{title}</h1>
      {children && <div className="mt-6 max-w-2xl text-base text-muted-foreground">{children}</div>}
    </header>
  );
}
