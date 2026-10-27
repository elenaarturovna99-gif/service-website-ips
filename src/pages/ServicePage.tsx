import { useEffect } from "react";
import SocialLinks from "@/components/SocialLinks";
import { Link, Navigate, useParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import servicePages, { getServicePage } from "@/data/servicePages";
import ru from "@/i18n/ru";
import { SITE_URL, faqSchema, setJsonLd } from "@/lib/jsonld";

const ServicePage = () => {
  const { slug } = useParams();
  const page = getServicePage(slug);
  const base = ru.services.items.find((s) => s.id === page?.id);

  useEffect(() => {
    if (!page) return;
    const url = `https://heavyprom.ru/uslugi/${page.slug}`;
    const removeService = setJsonLd("ld-service", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.h1,
      description: page.description,
      url,
      serviceType: page.h1,
      areaServed: { "@type": "Country", name: "Россия" },
      provider: { "@id": `${SITE_URL}/#organization` },
    });
    const removeCrumbs = setJsonLd("ld-breadcrumbs", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE_URL}/#services` },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ],
    });
    const removeFaq = page.faq.length ? setJsonLd("ld-faq", faqSchema(page.faq)) : () => {};
    window.scrollTo(0, 0);
    return () => {
      removeService();
      removeCrumbs();
      removeFaq();
    };
  }, [page]);

  if (!page || !base) return <Navigate to="/" replace />;

  const others = servicePages.filter((p) => p.id !== page.id);
  const orderHref = `/?service=${page.id}#contacts`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-12">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.svg?v=2" alt="" className="h-8 w-8 rounded-[6px] md:h-9 md:w-9" />
            <span className="text-[1.2rem] font-medium tracking-[-0.02em] md:text-[1.45rem]">{ru.brand.name}</span>
          </Link>
          <div className="flex items-center gap-5">
            <a href="tel:+79049413669" className="mono-cap hidden hover:opacity-60 md:block">
              +7 (904) 941-36-69
            </a>
            <a
              href={orderHref}
              className="rounded-[6px] border border-foreground/40 px-4 py-2.5 transition-colors hover:bg-foreground hover:text-background"
            >
              {ru.header.cta}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-hero-fog px-5 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <nav className="mono-cap flex flex-wrap items-center gap-2 text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Главная</Link>
              <Icon name="ChevronRight" size={14} />
              <Link to="/#services" className="hover:text-foreground">Услуги</Link>
              <Icon name="ChevronRight" size={14} />
              <span className="text-foreground">{base.title}</span>
            </nav>
            <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-[6px] border border-border bg-card text-primary">
              <Icon name={base.icon} size={26} />
            </div>
            <h1 className="mt-8 max-w-4xl text-[2.25rem] font-normal leading-[1.05] tracking-[-0.03em] md:text-[3.5rem]">
              {page.h1}
            </h1>
            <div className="mt-8 max-w-3xl space-y-4 text-[1.05rem] leading-relaxed text-muted-foreground">
              {page.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-10 inline-block rounded-[6px] border border-border bg-card p-5">
              <div className="mono-cap text-muted-foreground">{ru.services.resultLabel}</div>
              <div className="mt-2 text-[1.1rem] tracking-[-0.02em]">{base.result}</div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] md:text-[2.25rem]">Что входит в работу</h2>
              <ul className="mt-8 space-y-4">
                {page.includes.map((p) => (
                  <li key={p} className="flex gap-3 border-b border-border pb-4 text-[1.02rem]">
                    <Icon name="Check" size={18} className="mt-0.5 shrink-0 text-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5">
              <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] md:text-[2.25rem]">Кому подходит</h2>
              <ul className="mt-8 space-y-4">
                {page.forWhom.map((p) => (
                  <li key={p} className="flex gap-3 rounded-[6px] border border-border bg-card p-4 text-[1.02rem]">
                    <Icon name="ArrowRight" size={18} className="mt-0.5 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-hero-fog px-5 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] md:text-[2.25rem]">Как мы работаем</h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-4">
              {ru.process.steps.map((s) => (
                <div key={s.n} className="bg-card p-6">
                  <div className="mono-cap text-muted-foreground">{s.n} · {s.time}</div>
                  <div className="mt-4 text-[1.15rem] tracking-[-0.02em]">{s.title}</div>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] md:text-[2.25rem]">Частые вопросы</h2>
            <Accordion type="single" collapsible defaultValue="q-0" className="mt-8 border-t border-border">
              {page.faq.map((f, i) => (
                <AccordionItem key={f.q} value={`q-${i}`} className="border-border">
                  <AccordionTrigger className="py-5 text-left text-[1.1rem] font-normal tracking-[-0.02em] hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[1rem] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="bg-hero px-5 py-16 text-hero-text md:px-12 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] md:text-[2.25rem]">Обсудим ваш объект?</h2>
              <p className="mt-3 max-w-xl text-hero-muted">
                Оставьте заявку или позвоните — уточним задачу, сроки и стоимость в тот же день.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={orderHref} className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-white px-6 py-4 text-hero-ink transition-opacity hover:opacity-85">
                {ru.services.order}
                <Icon name="ArrowUpRight" size={16} />
              </a>
              <a href="tel:+79049413669" className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/40 px-6 py-4 transition-colors hover:bg-white/10">
                <Icon name="Phone" size={16} />
                +7 (904) 941-36-69
              </a>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-[1.5rem] font-normal tracking-[-0.03em] md:text-[1.9rem]">Другие услуги</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => {
                const s = ru.services.items.find((x) => x.id === o.id);
                if (!s) return null;
                return (
                  <Link
                    key={o.slug}
                    to={`/uslugi/${o.slug}`}
                    className="group flex items-center gap-4 rounded-[6px] border border-border bg-card p-5 transition-colors hover:bg-muted"
                  >
                    <Icon name={s.icon} size={20} className="shrink-0 text-primary" />
                    <span className="flex-1 leading-snug">{s.title}</span>
                    <Icon name="ArrowRight" size={16} className="opacity-40 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 md:px-12">
        <div className="mono-cap mx-auto flex max-w-7xl flex-col gap-3 text-muted-foreground md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} {ru.brand.name} · {ru.brand.legal}</span>
          <span>{ru.brand.requisites}</span>
          <SocialLinks reviewLabel={ru.brand.review} dzenLabel={ru.brand.dzen} className="normal-case tracking-normal" />
          <Link to="/privacy" className="hover:text-foreground">{ru.brand.privacy}</Link>
        </div>
      </footer>
    </div>
  );
};

export default ServicePage;