import type { ReactNode } from "react";

/** Simple wrapper for text pages (About, Privacy, Terms, Contact…). */
export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-xl text-muted">{intro}</p>}
      <div className="mt-8 space-y-5 text-lg [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold">
        {children}
      </div>
    </div>
  );
}

/** Clearly marked text the site owner still needs to write. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border-2 border-dashed border-silver-300 bg-silver-50 p-4 text-muted">
      <span className="font-semibold text-ink">Placeholder text: </span>
      {children}
    </p>
  );
}
