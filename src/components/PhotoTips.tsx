const shots = [
  {
    title: "1. Full length, from the front",
    text: "Head to toe, standing naturally, arms relaxed.",
  },
  {
    title: "2. Full length, from the side",
    text: "Turn sideways so brands can see how clothes fall.",
  },
  {
    title: "3. A smiling close-up",
    text: "Head and shoulders. Just be yourself.",
  },
];

const tips = [
  "Stand near a window in daylight. Avoid flash.",
  "Use a plain wall or door behind you.",
  "Ask a friend to take it, or prop your phone at waist height.",
  "Wear something you love that fits well.",
  "No filters, please. Brands want the real you.",
];

export function PhotoTips() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section aria-labelledby="shots-heading">
        <h3 id="shots-heading" className="text-2xl font-semibold">
          The three photos
        </h3>
        <ol className="mt-4 space-y-4">
          {shots.map((s) => (
            <li key={s.title} className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-silver-200">
              <p className="text-lg font-semibold">{s.title}</p>
              <p className="text-lg text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="tips-heading">
        <h3 id="tips-heading" className="text-2xl font-semibold">
          Tips for great photos
        </h3>
        <ul className="mt-4 space-y-3 text-lg">
          {tips.map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-plum" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
