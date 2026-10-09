import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionHead from "@/components/SectionHead";
import { useReveal } from "@/hooks/use-reveal";
import { useLang } from "@/i18n/LanguageContext";

const Faq = () => {
  const ref = useReveal<HTMLElement>();
  const { t } = useLang();
  const faq = t.faq.items;
  return (
    <section id="faq" ref={ref} className="bg-background px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="05" label={t.faq.label} title={t.faq.title} />
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
