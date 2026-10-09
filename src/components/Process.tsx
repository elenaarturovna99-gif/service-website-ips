import Icon from "@/components/ui/icon";
import { useReveal } from "@/hooks/use-reveal";
import { useLang } from "@/i18n/LanguageContext";

const Process = () => {
  const ref = useReveal<HTMLElement>();
  const { t } = useLang();
  const steps = t.process.steps;
  return (
    <section
      id="process"
      ref={ref}
      className="relative overflow-hidden bg-hero px-5 py-24 text-hero-text md:px-12 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 80% 0%, color-mix(in srgb, var(--hero-x-haze) 90%, transparent), transparent 70%)",
        }}
      />
      <div className="hero-grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl">
        <div className="reveal mb-16 grid gap-6 md:mb-24 md:grid-cols-12">
          <div className="mono-cap flex items-center gap-3 text-hero-muted md:col-span-3">
            <span className="text-hero-text">03</span>
            <span className="h-px w-8 bg-white/30" />
            {t.process.label}
          </div>
          <h2 className="text-[2.25rem] font-normal leading-[1.05] tight md:col-span-9 md:text-[3.5rem]">
            {t.process.title}
          </h2>
        </div>

        <ol className="relative grid gap-12 md:grid-cols-4 md:gap-8">
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-white/25 md:block" />
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="reveal relative"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-hero">
                <Icon name={s.icon} size={18} />
              </div>
              <div className="mono-cap mt-8 text-hero-muted">{t.process.stepLabel} {s.n}</div>
              <h3 className="mt-3 text-[1.5rem] font-normal leading-tight tracking-[-0.03em]">{s.title}</h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-hero-muted">{s.text}</p>
              <div className="mono-cap mt-6 inline-block rounded-[6px] border border-white/30 px-3 py-1.5">
                {s.time}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Process;
