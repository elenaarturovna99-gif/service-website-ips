import { useState } from "react";
import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";
import { useLang } from "@/i18n/LanguageContext";

const Experience = () => {
  const ref = useReveal<HTMLElement>();
  const { t } = useLang();
  const { types, objects, permits } = t.experience;
  const [tab, setTab] = useState("all");
  const list = tab === "all" ? objects : objects.filter((o) => o.typeId === tab);
  const typeLabel = (id: string) => types.find((x) => x.id === id)?.label ?? "";

  return (
    <section id="experience" ref={ref} className="bg-hero-fog px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          index="04"
          label={t.experience.label}
          title={t.experience.title}
          lead={t.experience.lead}
        />

        <div className="reveal mb-8 flex flex-wrap gap-2">
          {types.map((ty) => (
            <button
              key={ty.id}
              onClick={() => setTab(ty.id)}
              className={`rounded-[6px] border px-4 py-2 text-[0.95rem] transition-colors ${
                tab === ty.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:border-foreground/50"
              }`}
            >
              {ty.label}
            </button>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <ul className="reveal overflow-hidden rounded-[6px] border border-border bg-card lg:col-span-8">
            {list.map((o) => (
              <li
                key={o.title}
                className="grid animate-fade-in grid-cols-12 items-center gap-4 border-b border-border px-6 py-5 transition-colors last:border-b-0 hover:bg-muted md:px-8"
              >
                <div className="col-span-12 md:col-span-7">
                  <div className="mono-cap text-muted-foreground">{typeLabel(o.typeId)}</div>
                  <div className="mt-1.5 text-[1.1rem] tracking-[-0.02em]">{o.title}</div>
                  <div className="mt-1 text-[0.9rem] text-muted-foreground">{o.task}</div>
                </div>
                <div className="col-span-6 text-[1.05rem] md:col-span-3 md:text-right">{o.area}</div>
                <div className="mono-cap col-span-6 text-right text-muted-foreground md:col-span-2">{o.year}</div>
              </li>
            ))}
          </ul>

          <aside className="reveal lg:col-span-4">
            <div className="rounded-[6px] border border-border bg-card p-7">
              <div className="mono-cap text-muted-foreground">{t.experience.permitsLabel}</div>
              <ul className="mt-5 space-y-4">
                {permits.map((p) => (
                  <li key={p} className="flex gap-3 text-[0.98rem] leading-snug">
                    <Icon name="FileCheck2" size={18} className="mt-0.5 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-[6px] bg-primary p-7 text-primary-foreground">
              <div className="mono-cap text-primary-foreground/70">{t.experience.normsLabel}</div>
              <p className="mt-4 text-[1.05rem] leading-relaxed">
                {t.experience.norms}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Experience;