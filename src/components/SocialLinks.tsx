import Icon from "@/components/ui/icon";

export const GOOGLE_REVIEW_URL = "https://g.page/r/CZyYKbRKODklEAI/review";
export const DZEN_URL = "https://dzen.ru/heavyprom.ru";

type Props = {
  reviewLabel: string;
  dzenLabel: string;
  className?: string;
};

const DzenMark = () => (
  <svg viewBox="0 0 28 28" className="h-4 w-4" aria-hidden="true">
    <circle cx="14" cy="14" r="14" fill="#000" />
    <path
      d="M14 4c.2 4.6.6 6.9 2 8.4 1.5 1.4 3.8 1.8 8 1.6-4.2.2-6.5.6-8 2-1.4 1.5-1.8 3.8-2 8-.2-4.2-.6-6.5-2-8-1.5-1.4-3.8-1.8-8-2 4.2.2 6.5-.2 8-1.6 1.4-1.5 1.8-3.8 2-8.4Z"
      fill="#fff"
    />
  </svg>
);

const SocialLinks = ({ reviewLabel, dzenLabel, className = "" }: Props) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    <a
      href={GOOGLE_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3.5 py-1.5 text-[0.85rem] opacity-80 transition hover:opacity-100"
    >
      <Icon name="Star" size={14} />
      {reviewLabel}
    </a>
    <a
      href={DZEN_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={dzenLabel}
      title={dzenLabel}
      className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3.5 py-1.5 text-[0.85rem] opacity-80 transition hover:opacity-100"
    >
      <DzenMark />
      Дзен
    </a>
  </div>
);

export default SocialLinks;