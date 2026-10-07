import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";

const IMG =
  "https://cdn.poehali.dev/projects/98062dde-2a15-4d2a-9e82-9b366094add5/files/67f44d5e-b032-4482-a69d-1fe9b5b64234.jpg";

const stats = [
  { value: "12+", label: "лет в строительстве" },
  { value: "180+", label: "объектов сдано" },
  { value: "0", label: "возвратов комплектов на доработку в 2025" },
];

const reasons = [
  {
    icon: "Scale",
    title: "Строго по нормативам",
    text: "Приказ Минстроя № 344/пр, РД-11-02-2006, РД-11-05-2007, актуальные СП. Следим за изменениями и обновляем формы.",
  },
  {
    icon: "ShieldCheck",
    title: "Сдача без замечаний",
    text: "Каждый комплект проходит внутреннюю проверку перед передачей заказчику и технадзору.",
  },
  {
    icon: "Award",
    title: "Допуски и квалификация",
    text: "Членство в СРО, специалист в НРС, аттестация по строительному контролю. Документы предоставляем по запросу.",
  },
  {
    icon: "Timer",
    title: "Сроки в договоре",
    text: "Фиксируем сроки и состав работ. Не тянем — понимаем, что от комплекта зависит ввод объекта.",
  },
];

const WhyUs = () => {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="why" ref={ref} className="bg-background px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          index="02"
          label="Почему мы"
          title="Спокойствие заказчика — в правильно собранных бумагах"
        />

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="reveal relative overflow-hidden rounded-[6px] lg:col-span-6">
            <img src={IMG} alt="Рабочее место инженера на строительном объекте" className="h-full min-h-[320px] w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(0deg, color-mix(in srgb, var(--hero-accent-contrast) 85%, transparent) 0%, color-mix(in srgb, var(--hero-bg) 20%, transparent) 55%, transparent 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-px text-white">
              {stats.map((s) => (
                <div key={s.label} className="p-5 md:p-6">
                  <div className="text-[2.25rem] font-light leading-none tight md:text-[3rem]">{s.value}</div>
                  <div className="mono-cap mt-3 !text-[0.62rem] leading-snug text-white/80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[6px] border border-border bg-border sm:grid-cols-2 lg:col-span-6">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className="reveal group bg-card p-7 transition-colors hover:bg-muted"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <Icon name={r.icon} size={22} className="text-primary" />
                <h3 className="mt-6 text-[1.2rem] tracking-[-0.02em]">{r.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;