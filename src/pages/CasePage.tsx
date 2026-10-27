import { Link, Navigate, useParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import PageShell, { CtaBand, Crumbs } from "@/components/PageShell";
import { getCase, getPublishedCases } from "@/data/cases";
import servicePages from "@/data/servicePages";
import { SITE_URL } from "@/lib/jsonld";
import usePageMeta, { breadcrumbs } from "@/lib/usePageMeta";

const CasePage = () => {
  const { slug } = useParams();
  const c = getCase(slug);
  const path = `/kejsy/${slug}`;

  usePageMeta({
    title: c?.seoTitle ?? "Кейсы — ХэвиПром",
    description: c?.description ?? "",
    path,
    jsonLd: c
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: c.title,
            description: c.description,
            datePublished: c.date,
            inLanguage: "ru-RU",
            mainEntityOfPage: `${SITE_URL}${path}`,
            image: `${SITE_URL}/og-image.jpg`,
            author: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbs([
            { name: "Главная", path: "/" },
            { name: "Кейсы", path: "/kejsy" },
            { name: c.title, path },
          ]),
        ]
      : [],
  });

  if (!c) return <Navigate to="/kejsy" replace />;

  const service = servicePages.find((s) => s.slug === c.service);
  const others = getPublishedCases().filter((x) => x.slug !== c.slug).slice(0, 3);

  return (
    <PageShell>
      <section className="bg-hero-fog px-5 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Crumbs items={[{ label: "Главная", to: "/" }, { label: "Кейсы", to: "/kejsy" }, { label: "Кейс" }]} />
          <div className="mono-cap mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
            <span>{c.year}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Icon name="MapPin" size={13} />{c.place}</span>
            <span>·</span>
            <span>{c.industry}</span>
          </div>
          <h1 className="mt-5 text-[2rem] font-normal leading-[1.1] tracking-[-0.03em] md:text-[2.9rem]">{c.title}</h1>
          <div
            className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border"
            style={{ gridTemplateColumns: `repeat(${c.facts.length}, minmax(0, 1fr))` }}
          >
            {c.facts.map((f) => (
              <div key={f.label} className="bg-card p-5">
                <div className="text-[1.3rem] leading-tight tracking-[-0.02em] md:text-[1.8rem]">{f.value}</div>
                <div className="mt-1 text-[0.85rem] leading-snug text-muted-foreground">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-4xl gap-12">
          <div>
            <div className="mono-cap text-muted-foreground">Объект</div>
            <p className="mt-3 text-[1.1rem] leading-relaxed">{c.object}</p>
          </div>
          <div>
            <div className="mono-cap text-muted-foreground">Задача</div>
            <p className="mt-3 text-[1.1rem] leading-relaxed">{c.task}</p>
          </div>
          <div>
            <div className="mono-cap text-muted-foreground">Что сделали</div>
            <ul className="mt-4 space-y-4">
              {c.done.map((d) => (
                <li key={d} className="flex gap-3 border-b border-border pb-4 text-[1.05rem]">
                  <Icon name="Check" size={18} className="mt-1 shrink-0 text-accent" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          {service && (
            <Link
              to={`/uslugi/${service.slug}`}
              className="group flex items-center gap-4 rounded-[6px] border border-border bg-card p-6 transition-colors hover:border-foreground/30"
            >
              <Icon name="Briefcase" size={22} className="shrink-0 text-primary" />
              <span className="flex-1">
                <span className="mono-cap block text-muted-foreground">Услуга</span>
                <span className="mt-1 block text-[1.1rem] tracking-[-0.02em]">{service.h1}</span>
              </span>
              <Icon name="ArrowRight" size={18} className="opacity-50 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </section>

      <CtaBand />

      {others.length > 0 && (
        <section className="px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-[1.5rem] font-normal tracking-[-0.03em] md:text-[1.9rem]">Другие кейсы</h2>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} to={`/kejsy/${o.slug}`} className="rounded-[6px] border border-border bg-card p-5 transition-colors hover:bg-muted">
                  <div className="mono-cap text-muted-foreground">{o.year} · {o.place}</div>
                  <div className="mt-2 leading-snug">{o.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
};

export default CasePage;
