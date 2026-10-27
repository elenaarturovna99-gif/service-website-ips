import { createFileRoute } from "@tanstack/react-router";
import Cases from "@/pages/Cases";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/kejsy/")({
  head: () =>
    pageHead({
      title: "Кейсы: исполнительная документация на промышленных объектах — ХэвиПром",
      description:
        "Реальные проекты ХэвиПром: разработка, восстановление и аудит исполнительной документации на газохимических, горно-обогатительных и социальных объектах.",
      path: "/kejsy",
    }),
  component: Cases,
});
