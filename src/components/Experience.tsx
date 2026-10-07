import { useState } from "react";
import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";

const types = ["Все", "Газо- и нефтехимия", "Энергетика", "Заводы и цеха", "Сети и эстакады"] as const;

const objects = [
  { type: "Газо- и нефтехимия", title: "Газохимический комплекс на побережье Балтики", task: "Разработка ИД по металлоконструкциям и технологическим трубопроводам", area: "ОПО I класса", year: "2025" },
  { type: "Сети и эстакады", title: "Межцеховые эстакады технологических трубопроводов", task: "Исполнительные схемы, геодезический контроль", area: "4,2 км", year: "2025" },
  { type: "Газо- и нефтехимия", title: "Резервуарный парк хранения СУГ", task: "Аудит комплекта перед Ростехнадзором", area: "12 резервуаров", year: "2024" },
  { type: "Энергетика", title: "Подстанция 110/10 кВ", task: "Строительный контроль заказчика", area: "1,8 га", year: "2024" },
  { type: "Заводы и цеха", title: "Производственный корпус с крановым оборудованием", task: "Восстановление ИД по завершённым работам", area: "18 400 м²", year: "2024" },
  { type: "Энергетика", title: "Котельная и тепловые сети промплощадки", task: "Контроль качества, приёмка этапов", area: "3,1 км", year: "2023" },
  { type: "Сети и эстакады", title: "Газопровод высокого давления", task: "Восстановление ИД, аудит", area: "9,6 км", year: "2023" },
  { type: "Заводы и цеха", title: "Складской и логистический комплекс завода", task: "Ведение ИД, технадзор", area: "22 500 м²", year: "2023" },
];

const permits = [
  "Членство в СРО в области строительства",
  "Специалист в Национальном реестре (НРС)",
  "Аттестация Ростехнадзора по промышленной безопасности",
  "Опыт работы на опасных производственных объектах",
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
          title="Промышленные объекты — наша основная специализация"
          lead="Газохимические и нефтехимические комплексы, энергетика, заводские корпуса, эстакады и трубопроводы. Знаем требования Ростехнадзора и крупных заказчиков."
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
                Приказ Минстроя № 344/пр, РД-11-02-2006, РД-11-05-2007, СП 48.13330, ГОСТ Р 51872, СП 75.13330, ГОСТ 32569, ФНП в области промышленной безопасности
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Experience;