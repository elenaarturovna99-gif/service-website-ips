import { writeFileSync } from "fs";
import { buildRss } from "./build-rss";
import { buildSitemap } from "./build-sitemap";
import { buildPrerender } from "./build-prerender";

const rss = buildRss();
writeFileSync("public/rss.xml", rss.xml);
writeFileSync("public/sitemap.xml", buildSitemap());
console.log(`rss.xml: ${rss.count} items`);
const pages = buildPrerender();
writeFileSync("scripts/prerender.json", JSON.stringify(pages, null, 1));
console.log(`prerender: ${pages.length} pages`);
