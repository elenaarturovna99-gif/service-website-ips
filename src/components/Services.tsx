import { useState } from "react";
import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";
import { useLang } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { getServiceSlug } from "@/data/servicePages";

const Services = () => {
  const ref = useReveal<HTMLElement>();
  const { t, lang } = useLang();
  const services = t.services.items;
  const [active, setActive] = useState(services[0].id);
  const current = services.find((s) => s.id === active) ?? services[0];
  const slug = getServiceSlug(current.id);

  return (
    <section id="services" ref={ref} className="bg-hero-fog px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          index="01"
          label={t.services.label}
          title={<>{t.services.titleA}<br className="hidden md:block" />{t.services.titleB}</>}
          lead={t.services.lead}
        />

        <div className="reveal grid gap-px overflow-hidden rounded-[6px] border border-border bg-border lg:grid-cols-12">
          <ul className="bg-card lg:col-span-5">
            {services.map((s, i) => {
              const on = s.id === active;
              return (
                <li key={s.id} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => setActive(s.id)}
                    className={`group flex w-full items-center gap-5 px-6 py-6 text-left transition-colors md:px-8 ${
                      on ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <span className={`mono-cap ${on ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      0{i + 1}
                    </span>
                    <span className="flex-1 text-[1.1rem] leading-snug tracking-[-0.02em] md:text-[1.2rem]">
                      {s.title}
                    </span>
                    <Icon
                      name="ArrowRight"
                      size={18}
                      className={`transition-transform ${on ? "translate-x-0" : "-translate-x-1 opacity-40 group-hover:translate-x-0 group-hover:opacity-100"}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div key={current.id} className="animate-fade-in bg-card p-8 md:p-12 lg:col-span-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-[6px] border border-border text-primary">
              <Icon name={current.icon} size={22} />
            </div>
            <h3 className="mt-8 text-[1.75rem] font-normal leading-tight tight md:text-[2.25rem]">
              {current.title}
            </h3>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{current.text}</p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[0.95rem]">
                  <Icon name="Check" size={16} className="text-accent" />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-[6px] border border-border bg-muted/60 p-5">
              <div className="mono-cap text-muted-foreground">{t.services.resultLabel}</div>
              <div className="mt-2 text-[1.1rem] tracking-[-0.02em]">{current.result}</div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`#contacts`}
                onClick={() => window.dispatchEvent(new CustomEvent("pick-service", { detail: current.title }))}
                className="inline-flex items-center gap-2 rounded-[6px] bg-foreground px-5 py-3 text-background transition-opacity hover:opacity-85"
              >
                {t.services.order}
                <Icon name="ArrowUpRight" size={16} />
              </a>
              {slug && (
                <Link
                  to={`/uslugi/${slug}`}
                  className="inline-flex items-center gap-2 rounded-[6px] border border-foreground/30 px-5 py-3 transition-colors hover:bg-muted"
                >
                  {lang === "ru" ? "Подробнее об услуге" : "Learn more"}
                  <Icon name="ArrowRight" size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;