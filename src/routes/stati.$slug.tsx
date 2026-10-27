import { createFileRoute, redirect } from "@tanstack/react-router";
import ArticlePage from "@/pages/ArticlePage";
import { getArticle } from "@/data/articles";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/stati/$slug")({
  loader: ({ params }) => {
    const a = getArticle(params.slug);
    if (!a) throw redirect({ to: "/stati", replace: true });
    return { title: a.seoTitle, description: a.description };
  },
  head: ({ loaderData, params }) =>
    pageHead({
      title: loaderData?.title ?? "Статьи — ХэвиПром",
      description: loaderData?.description,
      path: `/stati/${params.slug}`,
    }),
  component: ArticlePage,
});
