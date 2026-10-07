import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";

const faq = [
  {
    q: "Можно ли восстановить документацию, если объект уже построен?",
    a: "Да. Мы анализируем имеющиеся документы, проводим обмеры и геодезическую съёмку, сверяем фактическое исполнение с проектом и восстанавливаем акты, схемы и журналы. Срок зависит от объёма — обычно от двух недель.",
  },
  {
    q: "По каким нормативам вы оформляете исполнительную документацию?",
    a: "Основной документ — Приказ Минстроя России № 344/пр, а также РД-11-02-2006, РД-11-05-2007, СП 48.13330 и отраслевые требования заказчика. Формы обновляем при каждом изменении законодательства.",
  },
  {
    q: "Вы гарантируете сдачу без замечаний?",
    a: "Каждый комплект проходит внутреннюю проверку перед передачей. Если технадзор или стройнадзор выдаёт замечания по нашей части работ — устраняем их бесплатно и в согласованный срок.",
  },
  {
    q: "Как рассчитывается стоимость?",
    a: "Стоимость зависит от типа объекта, объёма работ и стадии строительства. После анализа объекта мы фиксируем цену и сроки в договоре — без доплат в процессе.",
  },
  {
    q: "Работаете ли вы с другими регионами?",
    a: "Да. Аудит и часть работ по разработке документации выполняем удалённо, на объект выезжаем по согласованному графику.",
  },
  {
    q: "Какие документы нужны от заказчика для старта?",
    a: "Проектная и рабочая документация, договор подряда, имеющиеся акты и журналы. Если чего-то нет — подскажем, как восполнить.",
  },
];

const Faq = () => {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="faq" ref={ref} className="bg-background px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="05" label="Вопросы и ответы" title="Отвечаем на частые вопросы" />
        <div className="reveal md:ml-[25%]">
          <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-border">
            {faq.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="py-6 text-left text-[1.1rem] font-normal tracking-[-0.02em] hover:no-underline md:text-[1.3rem]">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-6 text-[1rem] leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faq;
