import { createFileRoute } from "@tanstack/react-router";
import Articles from "@/pages/Articles";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/stati/")({
  head: () =>
    pageHead({
      title: "Статьи об исполнительной документации и стройконтроле — ХэвиПром",
      description:
        "Практические статьи об исполнительной документации, приказе 344/пр, строительном контроле, сметах и ВОР на промышленных объектах.",
      path: "/stati",
    }),
  component: Articles,
});
