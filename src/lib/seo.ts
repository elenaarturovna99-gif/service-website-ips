import { SITE_URL } from "@/lib/jsonld";

export const pageHead = (opts: { title: string; description?: string; path: string; robots?: string }) => {
  const url = opts.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${opts.path}`;
  const meta: Record<string, string>[] = [{ title: opts.title }, { property: "og:title", content: opts.title }, { property: "og:url", content: url }];
  if (opts.description) {
    meta.push({ name: "description", content: opts.description }, { property: "og:description", content: opts.description });
  }
  if (opts.robots) meta.push({ name: "robots", content: opts.robots });
  return { meta, links: [{ rel: "canonical", href: url }] };
};
