import { useEffect } from "react";
import { SITE_URL, setJsonLd } from "@/lib/jsonld";

const setMeta = (selector: string, value: string) => {
  const el = document.querySelector(selector);
  if (!el) return "";
  const prev = el.getAttribute("content") ?? "";
  el.setAttribute("content", value);
  return prev;
};

interface PageMeta {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown>[];
}

const usePageMeta = ({ title, description, path, jsonLd = [] }: PageMeta) => {
  const ldKey = JSON.stringify(jsonLd);

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const prevTitle = document.title;
    document.title = title;
    document.documentElement.lang = "ru";
    const prev = {
      desc: setMeta('meta[name="description"]', description),
      ogTitle: setMeta('meta[property="og:title"]', title),
      ogDesc: setMeta('meta[property="og:description"]', description),
      ogUrl: setMeta('meta[property="og:url"]', url),
    };
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const prevCanonical = canonical.href;
    canonical.href = url;
    const removers = (JSON.parse(ldKey) as Record<string, unknown>[]).map((d, i) => setJsonLd(`ld-page-${i}`, d));
    window.scrollTo(0, 0);
    return () => {
      document.title = prevTitle;
      setMeta('meta[name="description"]', prev.desc);
      setMeta('meta[property="og:title"]', prev.ogTitle);
      setMeta('meta[property="og:description"]', prev.ogDesc);
      setMeta('meta[property="og:url"]', prev.ogUrl);
      if (canonical) canonical.href = prevCanonical;
      removers.forEach((r) => r());
    };
  }, [title, description, path, ldKey]);
};

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: `${SITE_URL}${it.path}`,
  })),
});

export default usePageMeta;
