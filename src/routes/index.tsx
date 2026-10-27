import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import ru from "@/i18n/ru";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead({ title: ru.meta.title, path: "/" }),
  component: Index,
});
