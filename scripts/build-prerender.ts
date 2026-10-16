import { getPublishedArticles } from "../src/data/articles";
import { getPublishedCases } from "../src/data/cases";
import servicePages from "../src/data/servicePages";
import { formatDate, type Block } from "../src/data/content";

const SITE = "https://heavyprom.ru";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const svc = (slug?: string) => servicePages.find((s) => s.slug === slug);

const blocks = (list: Block[]) =>
  list
    .map((b) => {
      if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
      if (b.type === "p") return `<p>${esc(b.text)}</p>`;
      if (b.type === "note") return `<blockquote>${esc(b.text)}</blockquote>`;
      return `<${b.type}>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</${b.type}>`;
    })
    .join("");

const nav = (crumbs: [string, string?][]) =>
  `<nav>${crumbs.map(([label, href]) => (href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`)).join(" / ")}</nav>`;

export type Page = { path: string; title: string; description: string; image?: string; html: string };

export const buildPrerender = () => {
const articles = getPublishedArticles();
const cases = getPublishedCases();

const pages: Page[] = [
  ...articles.map((a) => {
    const s = svc(a.service);
    return {
      path: `/stati/${a.slug}`,
      title: a.seoTitle,
      description: a.description,
      image: `${SITE}/covers/${a.slug}.jpg`,
      html:
        `<article>${nav([["Главная", "/"], ["Статьи", "/stati"], ["Статья"]])}` +
        `<h1>${esc(a.title)}</h1><p><time datetime="${a.date}">${formatDate(a.date)}</time> · ${a.readTime} мин чтения</p>` +
        `<p>${esc(a.lead)}</p>${blocks(a.body)}` +
        (s ? `<p>Подробнее по теме: <a href="/uslugi/${s.slug}">${esc(s.h1)}</a></p>` : "") +
        `</article>`,
    };
  }),
  ...cases.map((c) => ({
    path: `/kejsy/${c.slug}`,
    title: c.seoTitle,
    description: c.description,
    image: `${SITE}/covers/${c.slug}.jpg`,
    html:
      `<article>${nav([["Главная", "/"], ["Кейсы", "/kejsy"], ["Кейс"]])}` +
      `<h1>${esc(c.title)}</h1><p>${esc(c.year)} · ${esc(c.place)} · ${esc(c.industry)}</p>` +
      `<h2>Объект</h2><p>${esc(c.object)}</p><h2>Задача</h2><p>${esc(c.task)}</p>` +
      `<h2>Что сделали</h2><ul>${c.done.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` +
      (c.facts.length ? `<h2>В цифрах</h2><ul>${c.facts.map((f) => `<li>${esc(f.value)} — ${esc(f.label)}</li>`).join("")}</ul>` : "") +
      `</article>`,
  })),
  ...servicePages.map((s) => ({
    path: `/uslugi/${s.slug}`,
    title: s.seoTitle,
    description: s.description,
    html:
      `<article>${nav([["Главная", "/"], ["Услуги"]])}<h1>${esc(s.h1)}</h1>` +
      s.intro.map((p) => `<p>${esc(p)}</p>`).join("") +
      `<h2>Что входит</h2><ul>${s.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` +
      `<h2>Кому подходит</h2><ul>${s.forWhom.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` +
      `<h2>Частые вопросы</h2>${s.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}` +
      `</article>`,
  })),
  {
    path: "/stati",
    title: "Статьи об исполнительной документации и стройконтроле — ХэвиПром",
    description: "Практические статьи об исполнительной документации, приказе 344/пр, строительном контроле, сметах и ВОР на промышленных объектах.",
    html:
      `<section>${nav([["Главная", "/"], ["Статьи"]])}<h1>Статьи</h1><ul>` +
      articles.map((a) => `<li><a href="/stati/${a.slug}">${esc(a.title)}</a> — ${esc(a.description)}</li>`).join("") +
      `</ul></section>`,
  },
  {
    path: "/kejsy",
    title: "Кейсы: исполнительная документация на промышленных объектах — ХэвиПром",
    description: "Реальные проекты ХэвиПром: разработка, восстановление и аудит исполнительной документации на газохимических, горно-обогатительных и социальных объектах.",
    html:
      `<section>${nav([["Главная", "/"], ["Кейсы"]])}<h1>Кейсы</h1><ul>` +
      cases.map((c) => `<li><a href="/kejsy/${c.slug}">${esc(c.title)}</a> — ${esc(c.description)}</li>`).join("") +
      `</ul></section>`,
  },
];

return pages;
};
