import { writeFileSync } from "fs";
import { buildRss } from "./build-rss";
import { buildSitemap } from "./build-sitemap";

const rss = buildRss();
writeFileSync("public/rss.xml", rss.xml);
writeFileSync("public/sitemap.xml", buildSitemap());
console.log(`rss.xml: ${rss.count} items`);
