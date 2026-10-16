import { getPublishedArticles } from "../src/data/articles";
import { getPublishedCases } from "../src/data/cases";
import servicePages from "../src/data/servicePages";
import { todayIso } from "../src/data/content";

const SITE = "https://heavyprom.ru";
const START = "2026-10-11";

export const buildSitemap = (today = todayIso()) => {
  const articles = getPublishedArticles();
  const cases = getPublishedCases();
  const latest = [...articles, ...cases].reduce((m, x) => (x.date > m ? x.date : m), START);
  const urls: [string, string, string, string][] = [
    ["/", latest, "weekly", "1.0"],
    ...servicePages.map((s) => [`/uslugi/${s.slug}`, START, "monthly", "0.8"] as [string, string, string, string]),
    ["/kejsy", latest, "weekly", "0.7"],
    ...cases.map((c) => [`/kejsy/${c.slug}`, c.date, "monthly", "0.6"] as [string, string, string, string]),
    ["/stati", latest, "weekly", "0.7"],
    ...articles.map((a) => [`/stati/${a.slug}`, a.date, "monthly", "0.6"] as [string, string, string, string]),
    ["/privacy", START, "yearly", "0.2"],
  ];
  const body = urls
    .map(([p, d, f, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${d <= today ? d : today}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};
