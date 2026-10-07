import { useState } from "react";
import Icon from "@/components/ui/icon";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";

export const services = [
  {
    id: "dev",
    icon: "FilePlus2",
    title: "Разработка исполнительной документации",
    text: "Ведём комплект ИД параллельно со строительством: акты скрытых работ, исполнительные схемы, журналы, реестры — по актуальным требованиям РД-11-02-2006 и Приказа Минстроя № 344/пр.",
    result: "Комплект, готовый к приёмке, без задержки ввода объекта",
    points: ["Акты на металлоконструкции и фундаменты", "ИД на технологические трубопроводы", "Сварочные и специальные журналы", "Реестры для Ростехнадзора"],
  },
  {
    id: "restore",
    icon: "History",
    title: "Восстановление исполнительной документации",
    text: "Восстанавливаем утерянную или не оформленную вовремя документацию по завершённым работам: собираем данные, проводим обмеры и сверку с проектом.",
    result: "Полный комплект ИД даже для объектов, сданных «без бумаг»",
    points: ["Анализ имеющихся документов", "Обмеры и геосъёмка", "Восстановление актов и схем", "Согласование с участниками"],
  },
  {
    id: "audit",
    icon: "ScanSearch",
    title: "Аудит документации",
    text: "Проверяем готовый или текущий комплект на полноту и соответствие нормативам до того, как его увидит технадзор, заказчик или ГСН.",
    result: "Перечень замечаний и план исправлений до сдачи",
    points: ["Проверка комплектности", "Сверка с проектом", "Соответствие нормам", "Письменное заключение"],
  },
  {
    id: "quality",
    icon: "BadgeCheck",
    title: "Контроль качества",
    text: "Входной, операционный и приёмочный контроль работ и материалов. Фиксируем отклонения и сопровождаем их устранение.",
    result: "Работы, принятые без переделок и споров с подрядчиком",
    points: ["Входной контроль материалов", "Операционный контроль", "Фотофиксация", "Предписания и их закрытие"],
  },
  {
    id: "control",
    icon: "HardHat",
    title: "Строительный контроль",
    text: "Осуществляем строительный контроль со стороны заказчика: объёмы, сроки, качество, соответствие проекту и требованиям СП.",
    result: "Независимый взгляд и защита интересов заказчика на площадке",
    points: ["Контроль объёмов и сроков", "Приёмка этапов", "Отчёты заказчику", "Участие в комиссиях"],
  },
];

const Services = () => {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(services[0].id);
  const current = services.find((s) => s.id === active) ?? services[0];

  return (
    <section id="services" ref={ref} className="bg-hero-fog px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          index="01"
          label="Услуги"
          title={<>Пять направлений —<br className="hidden md:block" /> одна цель: сдача без замечаний</>}
          lead="Специализируемся на промышленном строительстве. Работаем по действующим нормативам и требованиям промбезопасности: документация проходит технадзор заказчика и Ростехнадзор с первого раза."
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
              <div className="mono-cap text-muted-foreground">Результат для заказчика</div>
              <div className="mt-2 text-[1.1rem] tracking-[-0.02em]">{current.result}</div>
            </div>

            <a
              href={`#contacts`}
              onClick={() => window.dispatchEvent(new CustomEvent("pick-service", { detail: current.title }))}
              className="mt-8 inline-flex items-center gap-2 rounded-[6px] bg-foreground px-5 py-3 text-background transition-opacity hover:opacity-85"
            >
              Заказать услугу
              <Icon name="ArrowUpRight" size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;