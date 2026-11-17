import { PHOTO_KINDS } from "@/lib/member-options";
import { getI18n } from "@/i18n/server";

export async function PhotoTips() {
  const { t } = await getI18n();
  const shots = PHOTO_KINDS.map((k, i) => ({
    title: `${i + 1}. ${t.options.photoKinds[k.value].label}`,
    text: t.options.photoKinds[k.value].hint,
  }));
  const tips = t.photoTips.tips;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section aria-labelledby="shots-heading">
        <h3 id="shots-heading" className="text-2xl font-semibold">
          {t.photoTips.shotsHeading}
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
          {t.photoTips.tipsHeading}
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
