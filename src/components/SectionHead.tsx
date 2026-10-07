interface Props {
  index: string;
  label: string;
  title: React.ReactNode;
  lead?: string;
}

const SectionHead = ({ index, label, title, lead }: Props) => (
  <div className="reveal mb-14 grid gap-6 md:mb-20 md:grid-cols-12">
    <div className="mono-cap flex items-center gap-3 text-muted-foreground md:col-span-3">
      <span className="text-foreground">{index}</span>
      <span className="h-px w-8 bg-border" />
      {label}
    </div>
    <div className="md:col-span-9">
      <h2 className="text-[2.25rem] font-normal leading-[1.05] tight text-foreground md:text-[3.5rem]">
        {title}
      </h2>
      {lead && (
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground md:text-lg">
          {lead}
        </p>
      )}
    </div>
  </div>
);

export default SectionHead;
