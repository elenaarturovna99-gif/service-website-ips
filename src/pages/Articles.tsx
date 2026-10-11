import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import PageShell, { CtaBand, Crumbs } from "@/components/PageShell";
import { getPublishedArticles } from "@/data/articles";
import { formatDate } from "@/data/content";
import usePageMeta, { breadcrumbs } from "@/lib/usePageMeta";

const Articles = () => {
  const list = getPublishedArticles();

  usePageMeta({
    title: "Статьи об исполнительной документации и стройконтроле — ХэвиПром",
    description:
      "Практические статьи об исполнительной документации, приказе 344/пр, строительном контроле, сметах и ВОР на промышленных объектах.",
    path: "/stati",
    jsonLd: [
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Статьи", path: "/stati" },
      ]),
    ],
  });

  return (
    <PageShell>
      <section className="bg-hero-fog px-5 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Crumbs items={[{ label: "Главная", to: "/" }, { label: "Статьи" }]} />
          <h1 className="mt-8 max-w-4xl text-[2.25rem] font-normal leading-[1.05] tracking-[-0.03em] md:text-[3.5rem]">
            Статьи
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
            Разбираем нормативы, частые ошибки и практику ведения исполнительной документации на промышленных объектах.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
          {list.map((a) => (
            <Link
              key={a.slug}
              to={`/stati/${a.slug}`}
              className="group flex flex-col rounded-[6px] border border-border bg-card p-6 transition-colors hover:border-foreground/30 md:p-8"
            >
              <div className="mono-cap flex items-center gap-3 text-muted-foreground">
                <span>{formatDate(a.date)}</span>
                <span>·</span>
                <span>{a.readTime} мин чтения</span>
              </div>
              <h2 className="mt-4 text-[1.35rem] leading-tight tracking-[-0.03em] md:text-[1.6rem]">{a.title}</h2>
              <p className="mt-3 flex-1 text-muted-foreground">{a.lead}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-primary">
                Читать
                <Icon name="ArrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand />
    </PageShell>
  );
};

export default Articles;
