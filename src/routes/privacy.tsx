import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/Privacy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead({ title: "Политика конфиденциальности — ХэвиПром", path: "/privacy" }),
  component: Privacy,
});
