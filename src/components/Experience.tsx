import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";
import { useLang } from "@/i18n/LanguageContext";

const Experience = () => {
  const ref = useReveal<HTMLElement>();
  const { t } = useLang();
  const { projects, permits } = t.experience;

  return (
    <section id="experience" ref={ref} className="bg-hero-fog px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          index="04"
          label={t.experience.label}
          title={t.experience.title}
          lead={t.experience.lead}
        />

        <div className="grid gap-12 lg:grid-cols-12">
          <ol className="relative lg:col-span-8">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border md:left-[111px]" />
            {projects.map((p, i) => (
              <li
                key={`${p.year}-${p.title}-${i}`}
                className="reveal relative grid gap-4 pb-10 pl-8 last:pb-0 md:grid-cols-[96px_1fr] md:gap-8 md:pl-0"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="md:pt-6 md:text-right">
                  <div className="text-[1.75rem] font-light leading-none tight text-foreground">{p.year}</div>
                </div>
                <span className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-hero-fog bg-primary md:left-[104px] md:top-7" />

                <div className="rounded-[6px] border border-border bg-card p-6 transition-colors hover:border-foreground/30 md:ml-6 md:p-8">
                  <div className="mono-cap flex items-center gap-2 text-muted-foreground">
                    <Icon name="MapPin" size={14} />
                    {p.place}
                  </div>
                  <h3 className="mt-3 text-[1.4rem] leading-tight tracking-[-0.03em] md:text-[1.6rem]">{p.title}</h3>
                  <p className="mt-2 text-[0.98rem] text-muted-foreground">{p.task}</p>

                  {p.facts.length > 0 && (
                    <div
                      className="mt-6 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border"
                      style={{ gridTemplateColumns: `repeat(${p.facts.length}, minmax(0, 1fr))` }}
                    >
                      {p.facts.map((f) => (
                        <div key={f.label} className="bg-muted/60 p-4">
                          <div className="text-[1.15rem] leading-tight tracking-[-0.02em] md:text-[1.4rem]">{f.value}</div>
                          <div className="mt-1 text-[0.8rem] leading-snug text-muted-foreground">{f.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.works.map((w) => (
                      <li
                        key={w}
                        className="flex items-center gap-2 rounded-[6px] border border-border px-3 py-1.5 text-[0.9rem]"
                      >
                        <Icon name="Check" size={14} className="text-accent" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
            <li className="pl-8 pt-2 md:pl-[134px]">
              <Link to="/kejsy" className="inline-flex items-center gap-2 rounded-[6px] border border-foreground/40 px-5 py-3 transition-colors hover:bg-foreground hover:text-background">
                {t.nav.cases}
                <Icon name="ArrowRight" size={16} />
              </Link>
            </li>
          </ol>

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
              <p className="mt-4 text-[1.05rem] leading-relaxed">{t.experience.norms}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Experience;