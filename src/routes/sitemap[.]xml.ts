import { createFileRoute } from "@tanstack/react-router";
import servicePages from "@/data/servicePages";
import { getPublishedArticles } from "@/data/articles";
import { getPublishedCases } from "@/data/cases";
import { todayIso } from "@/data/content";

const SITE = "https://heavyprom.ru";

type Entry = { path: string; lastmod: string; changefreq: string; priority: string };

const buildSitemap = () => {
  const today = todayIso();
  const articles = getPublishedArticles();
  const cases = getPublishedCases();
  const latestArticle = articles[0]?.date ?? today;
  const latestCase = cases.reduce((m, c) => (c.date > m ? c.date : m), "2026-10-11");

  const entries: Entry[] = [
    { path: "/", lastmod: latestArticle, changefreq: "weekly", priority: "1.0" },
    ...servicePages.map((p) => ({ path: `/uslugi/${p.slug}`, lastmod: "2026-10-11", changefreq: "monthly", priority: "0.9" })),
    { path: "/kejsy", lastmod: latestCase, changefreq: "monthly", priority: "0.7" },
    ...cases.map((c) => ({ path: `/kejsy/${c.slug}`, lastmod: c.date, changefreq: "monthly", priority: "0.7" })),
    { path: "/stati", lastmod: latestArticle, changefreq: "weekly", priority: "0.8" },
    ...articles.map((a) => ({ path: `/stati/${a.slug}`, lastmod: a.date, changefreq: "monthly", priority: "0.7" })),
    { path: "/privacy", lastmod: "2026-10-09", changefreq: "yearly", priority: "0.2" },
  ];

  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${SITE}${e.path}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
