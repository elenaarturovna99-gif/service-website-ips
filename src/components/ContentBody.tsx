import Icon from "@/components/ui/icon";
import type { Block } from "@/data/content";

const ContentBody = ({ blocks }: { blocks: Block[] }) => (
  <div className="space-y-5 text-[1.06rem] leading-[1.75]">
    {blocks.map((b, i) => {
      switch (b.type) {
        case "h2":
          return (
            <h2 key={i} className="pt-6 text-[1.5rem] font-normal leading-tight tracking-[-0.03em] md:text-[1.85rem]">
              {b.text}
            </h2>
          );
        case "p":
          return <p key={i} className="text-foreground/85">{b.text}</p>;
        case "ul":
          return (
            <ul key={i} className="space-y-3">
              {b.items.map((it) => (
                <li key={it} className="flex gap-3 text-foreground/85">
                  <Icon name="Check" size={18} className="mt-1.5 shrink-0 text-accent" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        case "ol":
          return (
            <ol key={i} className="space-y-3">
              {b.items.map((it, n) => (
                <li key={it} className="flex gap-4 border-b border-border pb-3 text-foreground/85">
                  <span className="mono-cap mt-1.5 w-6 shrink-0 text-primary">{String(n + 1).padStart(2, "0")}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ol>
          );
        case "note":
          return (
            <div key={i} className="flex gap-4 rounded-[6px] border border-border bg-hero-fog p-5">
              <Icon name="Info" size={20} className="mt-1 shrink-0 text-primary" />
              <p>{b.text}</p>
            </div>
          );
        default:
          return null;
      }
    })}
  </div>
);

export default ContentBody;
