import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { ACCEPT } from "@/lib/uploadLeadFile";

type Props = {
  label: string;
  files: File[];
  max: number;
  error?: string;
  attachText: string;
  addMoreText: string;
  removeText: string;
  onAdd: (f: File[]) => void;
  onRemove: (index: number) => void;
};

const formatSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} КБ` : `${(b / 1024 / 1024).toFixed(1)} МБ`);

const DocField = ({ label, files, max, error, attachText, addMoreText, removeText, onAdd, onRemove }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const canAdd = files.length < max;

  return (
    <div className="grid min-w-0 content-start gap-2">
      {label && (
        <div className="mono-cap text-muted-foreground">
          {label} <span className="text-destructive">*</span>
        </div>
      )}
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          onAdd(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {files.map((file, i) => (
        <div key={`${file.name}-${i}`} className="flex min-w-0 items-center gap-2 rounded-[6px] border border-input bg-card py-2 pl-3 pr-1.5">
          <Icon name="FileText" size={20} className="shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.95rem]" title={file.name}>{file.name}</div>
            <div className="text-xs text-muted-foreground">{formatSize(file.size)}</div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={removeText}
            title={removeText}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      ))}
      {canAdd && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`flex items-center justify-center gap-2 rounded-[6px] border border-dashed bg-card text-muted-foreground transition-colors hover:border-foreground hover:text-foreground ${
            files.length ? "h-10 text-[0.85rem]" : "h-12 text-[0.95rem]"
          } ${error ? "border-destructive" : "border-input"}`}
        >
          <Icon name={files.length ? "Plus" : "Paperclip"} size={files.length ? 16 : 18} />
          {files.length ? addMoreText : attachText}
        </button>
      )}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
};

export default DocField;
