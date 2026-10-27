import { createFileRoute, redirect } from "@tanstack/react-router";
import ServicePage from "@/pages/ServicePage";
import { getServicePage } from "@/data/servicePages";
import ru from "@/i18n/ru";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/uslugi/$slug")({
  loader: ({ params }) => {
    const page = getServicePage(params.slug);
    const base = ru.services.items.find((s) => s.id === page?.id);
    if (!page || !base) throw redirect({ to: "/", replace: true });
    return { title: page.seoTitle, description: page.description, slug: page.slug };
  },
  head: ({ loaderData, params }) =>
    pageHead({
      title: loaderData?.title ?? "ХэвиПром",
      description: loaderData?.description,
      path: `/uslugi/${loaderData?.slug ?? params.slug}`,
    }),
  component: ServicePage,
});
