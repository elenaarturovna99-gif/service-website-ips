import { Link, Navigate, useParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import PageShell, { CtaBand, Crumbs } from "@/components/PageShell";
import ContentBody from "@/components/ContentBody";
import { getArticle, getPublishedArticles } from "@/data/articles";
import { formatDate } from "@/data/content";
import servicePages from "@/data/servicePages";
import { SITE_URL } from "@/lib/jsonld";
import usePageMeta, { breadcrumbs } from "@/lib/usePageMeta";

const ArticlePage = () => {
  const { slug } = useParams();
  const a = getArticle(slug);
  const path = `/stati/${slug}`;

  usePageMeta({
    title: a?.seoTitle ?? "Статьи — ХэвиПром",
    description: a?.description ?? "",
    path,
    jsonLd: a
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.description,
            datePublished: a.date,
            dateModified: a.date,
            inLanguage: "ru-RU",
            mainEntityOfPage: `${SITE_URL}${path}`,
            image: `${SITE_URL}/og-image.jpg`,
            author: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbs([
            { name: "Главная", path: "/" },
            { name: "Статьи", path: "/stati" },
            { name: a.title, path },
          ]),
        ]
      : [],
  });

  if (!a) return <Navigate to="/stati" replace />;

  const service = servicePages.find((s) => s.slug === a.service);
  const more = getPublishedArticles().filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <PageShell>
      <article>
        <header className="bg-hero-fog px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-3xl">
            <Crumbs items={[{ label: "Главная", to: "/" }, { label: "Статьи", to: "/stati" }, { label: "Статья" }]} />
            <h1 className="mt-8 text-[2rem] font-normal leading-[1.1] tracking-[-0.03em] md:text-[2.9rem]">{a.title}</h1>
            <div className="mono-cap mt-6 flex items-center gap-3 text-muted-foreground">
              <time dateTime={a.date}>{formatDate(a.date)}</time>
              <span>·</span>
              <span>{a.readTime} мин чтения</span>
            </div>
            <p className="mt-6 text-[1.15rem] leading-relaxed text-muted-foreground">{a.lead}</p>
          </div>
        </header>

        <div className="px-5 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <ContentBody blocks={a.body} />

            {service && (
              <Link
                to={`/uslugi/${service.slug}`}
                className="group mt-12 flex items-center gap-4 rounded-[6px] border border-border bg-card p-6 transition-colors hover:border-foreground/30"
              >
                <Icon name="Briefcase" size={22} className="shrink-0 text-primary" />
                <span className="flex-1">
                  <span className="mono-cap block text-muted-foreground">Услуга по теме</span>
                  <span className="mt-1 block text-[1.1rem] tracking-[-0.02em]">{service.h1}</span>
                </span>
                <Icon name="ArrowRight" size={18} className="opacity-50 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </article>

      <CtaBand />

      {more.length > 0 && (
        <section className="px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-[1.5rem] font-normal tracking-[-0.03em] md:text-[1.9rem]">Читайте также</h2>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {more.map((m) => (
                <Link key={m.slug} to={`/stati/${m.slug}`} className="rounded-[6px] border border-border bg-card p-5 transition-colors hover:bg-muted">
                  <div className="mono-cap text-muted-foreground">{formatDate(m.date)}</div>
                  <div className="mt-2 leading-snug">{m.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
};

export default ArticlePage;
