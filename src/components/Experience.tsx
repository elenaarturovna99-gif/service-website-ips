import { useState } from "react";
import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";

const types = ["Все", "Жилые", "Коммерческие", "Промышленные", "Инфраструктура"] as const;

const objects = [
  { type: "Жилые", title: "Жилой комплекс, 3 корпуса по 17 этажей", task: "Ведение ИД, строительный контроль", area: "48 000 м²", year: "2025" },
  { type: "Промышленные", title: "Складской комплекс класса А", task: "Восстановление ИД по завершённым работам", area: "22 500 м²", year: "2025" },
  { type: "Коммерческие", title: "Торгово-офисный центр", task: "Аудит комплекта перед вводом", area: "15 800 м²", year: "2024" },
  { type: "Инфраструктура", title: "Наружные сети водоснабжения и канализации", task: "Исполнительные схемы, геосъёмка", area: "6,4 км", year: "2024" },
  { type: "Жилые", title: "Малоэтажный жилой квартал", task: "Контроль качества, приёмка этапов", area: "31 000 м²", year: "2024" },
  { type: "Промышленные", title: "Производственный корпус пищевого предприятия", task: "Разработка ИД, технадзор", area: "9 200 м²", year: "2023" },
  { type: "Инфраструктура", title: "Реконструкция участка автодороги", task: "Восстановление ИД, аудит", area: "3,8 км", year: "2023" },
  { type: "Коммерческие", title: "Медицинский центр", task: "Строительный контроль заказчика", area: "7 600 м²", year: "2023" },
];

const permits = [
  "Членство в СРО в области строительства",
  "Специалист в Национальном реестре (НРС)",
  "Аттестация по строительному контролю",
  "Повышение квалификации — ежегодно",
];

const Experience = () => {
  const ref = useReveal<HTMLElement>();
  const [tab, setTab] = useState<(typeof types)[number]>("Все");
  const list = tab === "Все" ? objects : objects.filter((o) => o.type === tab);

  return (
    <section id="experience" ref={ref} className="bg-hero-fog px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          index="04"
          label="Объекты и опыт"
          title="Жильё, склады, сети, дороги — знаем специфику каждого"
          lead="Работали на объектах разного масштаба: от частного малоэтажного строительства до промышленных комплексов и линейных сооружений."
        />

        <div className="reveal mb-8 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[6px] border px-4 py-2 text-[0.95rem] transition-colors ${
                tab === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:border-foreground/50"
              }`}
            >
              {t}
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
                  <div className="mono-cap text-muted-foreground">{o.type}</div>
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
              <div className="mono-cap text-muted-foreground">Допуски</div>
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
              <div className="mono-cap text-primary-foreground/70">Нормативная база</div>
              <p className="mt-4 text-[1.05rem] leading-relaxed">
                Приказ Минстроя № 344/пр, РД-11-02-2006, РД-11-05-2007, СП 48.13330, ГОСТ Р 51872
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Experience;
