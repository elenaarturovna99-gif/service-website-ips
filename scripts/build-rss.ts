import { writeFileSync } from "fs";
import articles from "../src/data/articles";
import cases from "../src/data/cases";
import servicePages from "../src/data/servicePages";
import type { Block } from "../src/data/content";

const SITE = "https://heavyprom.ru";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const rfc822 = (iso: string) => {
  const d = new Date(`${iso}T10:00:00+03:00`);
  const m = new Date(d.getTime() + 3 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${days[m.getUTCDay()]}, ${p(m.getUTCDate())} ${months[m.getUTCMonth()]} ${m.getUTCFullYear()} 10:00:00 +0300`;
};
const svc = (slug?: string) => servicePages.find((s) => s.slug === slug);

const blocksHtml = (blocks: Block[]) =>
  blocks
    .map((b) => {
      if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
      if (b.type === "p") return `<p>${esc(b.text)}</p>`;
      if (b.type === "note") return `<blockquote>${esc(b.text)}</blockquote>`;
      const tag = b.type;
      return `<${tag}>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;
    })
    .join("");

const footer = (url: string, serviceSlug?: string) => {
  const s = svc(serviceSlug);
  return [
    s ? `<p>Подробнее об услуге: <a href="${SITE}/uslugi/${s.slug}">${esc(s.h1)}</a>.</p>` : "",
    `<p>Оригинал материала — на сайте <a href="${url}">heavyprom.ru</a>. Обсудить ваш объект: <a href="${SITE}/#contacts">оставить заявку</a> или позвонить +7 (904) 941-36-69.</p>`,
  ].join("");
};

type Item = { url: string; title: string; description: string; date: string; cover: string; html: string };

const items: Item[] = [
  ...articles.map((a) => {
    const url = `${SITE}/stati/${a.slug}`;
    return {
      url,
      title: a.title,
      description: a.description,
      date: a.date,
      cover: `${SITE}/covers/${a.slug}.jpg`,
      html: `<p>${esc(a.lead)}</p>${blocksHtml(a.body)}${footer(url, a.service)}`,
    };
  }),
  ...cases.map((c) => {
    const url = `${SITE}/kejsy/${c.slug}`;
    const facts = c.facts.map((f) => `<li>${esc(f.value)} — ${esc(f.label)}</li>`).join("");
    return {
      url,
      title: c.title,
      description: c.description,
      date: c.date,
      cover: `${SITE}/covers/${c.slug}.jpg`,
      html:
        `<p>${esc(c.year)} · ${esc(c.place)} · ${esc(c.industry)}</p>` +
        `<h2>Объект</h2><p>${esc(c.object)}</p>` +
        `<h2>Задача</h2><p>${esc(c.task)}</p>` +
        `<h2>Что сделали</h2><ul>${c.done.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` +
        (facts ? `<h2>В цифрах</h2><ul>${facts}</ul>` : "") +
        footer(url, c.service),
    };
  }),
].sort((a, b) => b.date.localeCompare(a.date));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:georss="http://www.georss.org/georss">
<channel>
<title>ХэвиПром — статьи об исполнительной документации</title>
<link>${SITE}/stati</link>
<description>Исполнительная документация, строительный контроль, сметы и ВОР на промышленных объектах</description>
<language>ru</language>
${items
  .map(
    (i) => `<item>
<title>${esc(i.title)}</title>
<link>${i.url}</link>
<pdalink>${i.url}</pdalink>
<guid isPermaLink="true">${i.url}</guid>
<pubDate>${rfc822(i.date)}</pubDate>
<category>format-article</category>
<category>noindex</category>
<category>comment-all</category>
<description>${cdata(i.description)}</description>
<enclosure url="${i.cover}" type="image/jpeg"/>
<content:encoded>${cdata(`<figure><img src="${i.cover}" width="1360" height="768"/></figure>${i.html}`)}</content:encoded>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
writeFileSync("public/rss.xml", xml);
console.log(`rss.xml: ${items.length} items`);
