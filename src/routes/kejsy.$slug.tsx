import { createFileRoute, redirect } from "@tanstack/react-router";
import CasePage from "@/pages/CasePage";
import { getCase } from "@/data/cases";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/kejsy/$slug")({
  loader: ({ params }) => {
    const c = getCase(params.slug);
    if (!c) throw redirect({ to: "/kejsy", replace: true });
    return { title: c.seoTitle, description: c.description };
  },
  head: ({ loaderData, params }) =>
    pageHead({
      title: loaderData?.title ?? "Кейсы — ХэвиПром",
      description: loaderData?.description,
      path: `/kejsy/${params.slug}`,
    }),
  component: CasePage,
});
