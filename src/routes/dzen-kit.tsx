import { createFileRoute } from "@tanstack/react-router";
import DzenKit from "@/pages/DzenKit";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/dzen-kit")({
  head: () => pageHead({ title: "Материалы для Дзена — ХэвиПром", path: "/dzen-kit", robots: "noindex, nofollow" }),
  component: DzenKit,
});
