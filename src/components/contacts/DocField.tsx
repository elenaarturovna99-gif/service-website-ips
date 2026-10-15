import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { ACCEPT } from "@/lib/uploadLeadFile";

type Props = {
  label: string;
  hint?: string;
  file: File | null;
  error?: string;
  attachText: string;
  replaceText: string;
  removeText: string;
  onPick: (f: File | null) => void;
};

const formatSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} КБ` : `${(b / 1024 / 1024).toFixed(1)} МБ`);

const DocField = ({ label, hint, file, error, attachText, replaceText, removeText, onPick }: Props) => {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="grid gap-2">
      {label && (
        <div className="mono-cap text-muted-foreground">
          {label} <span className="text-destructive">*</span>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="flex items-center gap-3 rounded-[6px] border border-input bg-card px-3 py-2.5">
          <Icon name="FileText" size={20} className="shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.95rem]">{file.name}</div>
            <div className="text-xs text-muted-foreground">{formatSize(file.size)}</div>
          </div>
          <button type="button" onClick={() => input.current?.click()} className="mono-cap shrink-0 text-muted-foreground hover:text-foreground">
            {replaceText}
          </button>
          <button
            type="button"
            onClick={() => onPick(null)}
            aria-label={removeText}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`flex h-12 items-center justify-center gap-2 rounded-[6px] border border-dashed bg-card text-[0.95rem] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <Icon name="Paperclip" size={18} />
          {attachText}
        </button>
      )}
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
};

export default DocField;
