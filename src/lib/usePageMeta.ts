import { useEffect } from "react";
import { SITE_URL, setJsonLd } from "@/lib/jsonld";

interface PageMeta {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown>[];
}

const usePageMeta = ({ title, description, path, jsonLd = [] }: PageMeta) => {
  const ldKey = JSON.stringify(jsonLd);

  useEffect(() => {
    const removers = (JSON.parse(ldKey) as Record<string, unknown>[]).map((d, i) => setJsonLd(`ld-page-${i}`, d));
    window.scrollTo(0, 0);
    return () => {
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