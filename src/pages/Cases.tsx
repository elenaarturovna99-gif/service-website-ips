import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import PageShell, { CtaBand, Crumbs } from "@/components/PageShell";
import { getPublishedCases } from "@/data/cases";
import usePageMeta, { breadcrumbs } from "@/lib/usePageMeta";

const Cases = () => {
  const list = getPublishedCases();

  usePageMeta({
    title: "Кейсы: исполнительная документация на промышленных объектах — ХэвиПром",
    description:
      "Реальные проекты ХэвиПром: разработка, восстановление и аудит исполнительной документации на газохимических, горно-обогатительных и социальных объектах.",
    path: "/kejsy",
    jsonLd: [
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Кейсы", path: "/kejsy" },
      ]),
    ],
  });

  return (
    <PageShell>
      <section className="bg-hero-fog px-5 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Crumbs items={[{ label: "Главная", to: "/" }, { label: "Кейсы" }]} />
          <h1 className="mt-8 max-w-4xl text-[2.25rem] font-normal leading-[1.05] tracking-[-0.03em] md:text-[3.5rem]">
            Кейсы
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
            Объекты, на которых мы вели, восстанавливали и проверяли исполнительную документацию: задача, что сделали и в каких объёмах.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
          {list.map((c) => (
            <Link
              key={c.slug}
              to={`/kejsy/${c.slug}`}
              className="group flex flex-col rounded-[6px] border border-border bg-card p-6 transition-colors hover:border-foreground/30 md:p-8"
            >
              <div className="mono-cap flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span>{c.year}</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><Icon name="MapPin" size={13} />{c.place}</span>
                <span>·</span>
                <span>{c.industry}</span>
              </div>
              <h2 className="mt-4 text-[1.35rem] leading-tight tracking-[-0.03em] md:text-[1.6rem]">{c.title}</h2>
              <div
                className="mt-6 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border"
                style={{ gridTemplateColumns: `repeat(${c.facts.length}, minmax(0, 1fr))` }}
              >
                {c.facts.map((f) => (
                  <div key={f.label} className="bg-muted/60 p-4">
                    <div className="text-[1.15rem] leading-tight tracking-[-0.02em] md:text-[1.35rem]">{f.value}</div>
                    <div className="mt-1 text-[0.8rem] leading-snug text-muted-foreground">{f.label}</div>
                  </div>
                ))}
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-primary">
                Подробнее
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

export default Cases;
