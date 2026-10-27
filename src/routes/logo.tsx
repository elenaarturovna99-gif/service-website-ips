import { createFileRoute } from "@tanstack/react-router";
import Brand from "@/pages/Brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/logo")({
  head: () => pageHead({ title: "Логотипы и брендовые материалы — ХэвиПром", path: "/logo", robots: "noindex, follow" }),
  component: Brand,
});
