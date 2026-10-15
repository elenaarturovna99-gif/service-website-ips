import { useEffect, useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useReveal } from "@/hooks/use-reveal";
import { useLang } from "@/i18n/LanguageContext";
import { reachGoal } from "@/lib/metrika";
import { Textarea } from "@/components/ui/textarea";
import DocField from "@/components/contacts/DocField";
import { ALLOWED_EXT, LEAD_URL, MAX_FILE_SIZE, fileExt, uploadLeadFile } from "@/lib/uploadLeadFile";

type DocKey = "tz" | "contract" | "responsibility";
type Errors = Partial<Record<"name" | "phone" | "object" | "service" | "consent" | DocKey, string>>;
const emptyDocs: Record<DocKey, File | null> = { tz: null, contract: null, responsibility: null };

const formatPhone = (raw: string) => {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = d.slice(1);
  let out = "+7";
  if (p.length) out += " (" + p.slice(0, 3);
  if (p.length >= 3) out += ")";
  if (p.length > 3) out += " " + p.slice(3, 6);
  if (p.length > 6) out += "-" + p.slice(6, 8);
  if (p.length > 8) out += "-" + p.slice(8, 10);
  return out;
};

const Contacts = () => {
  const ref = useReveal<HTMLElement>();
  const { t } = useLang();
  const c = t.contacts;
  const services = t.services.items;
  const [form, setForm] = useState({ name: "", phone: "", object: "", service: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState(emptyDocs);
  const [respMode, setRespMode] = useState<"text" | "file">("text");
  const [respText, setRespText] = useState("");

  const pickDoc = (k: DocKey) => (f: File | null) => {
    if (f && f.size > MAX_FILE_SIZE) return setErrors((er) => ({ ...er, [k]: c.errors.fileSize }));
    if (f && !ALLOWED_EXT.includes(fileExt(f.name))) return setErrors((er) => ({ ...er, [k]: c.errors.fileType }));
    setDocs((d) => ({ ...d, [k]: f }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  useEffect(() => {
    const onPick = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      setForm((f) => ({ ...f, service: title }));
      setErrors((er) => ({ ...er, service: undefined }));
    };
    window.addEventListener("pick-service", onPick);
    return () => window.removeEventListener("pick-service", onPick);
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("service");
    const picked = services.find((s) => s.id === id);
    if (picked) setForm((f) => ({ ...f, service: picked.title }));
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [services]);

  const validate = () => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = c.errors.name;
    if (form.phone.replace(/\D/g, "").length !== 11) e.phone = c.errors.phone;
    if (form.object.trim().length < 3) e.object = c.errors.object;
    if (!form.service) e.service = c.errors.service;
    if (!docs.tz) e.tz = c.errors.tz;
    if (!docs.contract) e.contract = c.errors.contract;
    if (respMode === "text" ? respText.trim().length < 3 : !docs.responsibility) e.responsibility = c.errors.responsibility;
    if (!agree) e.consent = c.errors.consent;
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length || loading) return;
    setLoading(true);
    try {
      const toSend = (Object.keys(docs) as DocKey[]).filter(
        (k) => docs[k] && (k !== "responsibility" || respMode === "file"),
      );
      const files = [];
      for (const k of toSend) files.push({ kind: k, ...(await uploadLeadFile(docs[k]!)) });
      const res = await fetch(LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, responsibility: respMode === "text" ? respText.trim() : "", files }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      reachGoal("lead", { service: form.service });
      toast.success(c.toast.successTitle, { description: c.toast.successText });
    } catch {
      toast.error(c.toast.errorTitle, { description: c.toast.errorText });
    } finally {
      setLoading(false);
    }
  };

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = k === "phone" ? formatPhone(e.target.value) : e.target.value;
      setForm((f) => ({ ...f, [k]: v }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    },
  });

  const inputCls = (k: keyof Errors) =>
    `h-12 rounded-[6px] bg-card text-[1rem] ${errors[k] ? "border-destructive" : "border-input"}`;

  return (
    <section id="contacts" ref={ref} className="bg-hero-fog px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
        <div className="reveal lg:col-span-5">
          <div className="mono-cap flex items-center gap-3 text-muted-foreground">
            <span className="text-foreground">06</span>
            <span className="h-px w-8 bg-border" />
            {c.label}
          </div>
          <h2 className="mt-6 text-[2.25rem] font-normal leading-[1.05] tight md:text-[3.5rem]">
            {c.title}
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
            {c.lead}
          </p>

          <ul className="mt-12 space-y-6">
            {[
              { icon: "Phone", label: c.phoneLabel, value: "+7 (904) 941-36-69", href: "tel:+79049413669" },
              { icon: "Mail", label: c.emailLabel, value: "info@heavyprom.ru", href: "mailto:info@heavyprom.ru" },
              { icon: "Clock", label: c.hoursLabel, value: c.hours },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-border bg-card">
                  <Icon name={item.icon} size={18} className="text-primary" />
                </div>
                <div>
                  <div className="mono-cap text-muted-foreground">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="mt-1 block text-[1.15rem] tracking-[-0.02em] hover:text-accent">
                      {item.value}
                    </a>
                  ) : (
                    <div className="mt-1 text-[1.15rem] tracking-[-0.02em]">{item.value}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal lg:col-span-7">
          <div className="rounded-[6px] border border-border bg-card p-7 md:p-10">
            {sent ? (
              <div className="flex min-h-[420px] animate-scale-in flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-primary">
                  <Icon name="Check" size={26} />
                </div>
                <h3 className="mt-6 text-[1.75rem] font-normal tight">{c.success.thanks}, {form.name.split(" ")[0]}!</h3>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  {c.success.textBefore} {form.phone} {c.success.textAfter}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", phone: "", object: "", service: "" });
                    setDocs(emptyDocs);
                    setRespText("");
                    setAgree(false);
                  }}
                  className="mono-cap mt-8 text-muted-foreground underline-offset-4 hover:underline"
                >
                  {c.success.again}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="mono-cap text-muted-foreground">{c.form.name}</Label>
                    <Input id="name" placeholder={c.form.namePlaceholder} className={inputCls("name")} {...field("name")} />
                    {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="mono-cap text-muted-foreground">{c.form.phone}</Label>
                    <Input id="phone" type="tel" inputMode="tel" placeholder={c.form.phonePlaceholder} className={inputCls("phone")} {...field("phone")} />
                    {errors.phone && <span className="text-sm text-destructive">{errors.phone}</span>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="object" className="mono-cap text-muted-foreground">{c.form.object}</Label>
                  <Input id="object" placeholder={c.form.objectPlaceholder} className={inputCls("object")} {...field("object")} />
                  {errors.object && <span className="text-sm text-destructive">{errors.object}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="service" className="mono-cap text-muted-foreground">{c.form.service}</Label>
                  <div className="relative">
                    <select
                      id="service"
                      value={form.service}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((f) => ({ ...f, service: v }));
                        setErrors((er) => ({ ...er, service: undefined }));
                      }}
                      className={`${inputCls("service")} w-full appearance-none border px-3 pr-10 outline-none focus-visible:ring-2 focus-visible:ring-ring ${form.service ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      <option value="" disabled>{c.form.servicePlaceholder}</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                      <option value={c.form.serviceOther}>{c.form.serviceOther}</option>
                    </select>
                    <Icon name="ChevronDown" size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {errors.service && <span className="text-sm text-destructive">{errors.service}</span>}
                </div>

                <div className="grid min-w-0 gap-5 rounded-[6px] border border-border p-4 sm:p-5">
                  <div>
                    <div className="text-[1.05rem] tracking-[-0.01em]">{c.form.docsTitle}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.form.docsHint}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    {(["tz", "contract"] as const).map((k) => (
                      <DocField
                        key={k}
                        label={c.form[k]}
                        file={docs[k]}
                        error={errors[k]}
                        attachText={c.form.attach}
                        replaceText={c.form.replace}
                        removeText={c.form.remove}
                        onPick={pickDoc(k)}
                      />
                    ))}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="mono-cap text-muted-foreground">
                        {c.form.responsibility} <span className="text-destructive">*</span>
                      </div>
                      <div className="inline-flex rounded-[6px] border border-input bg-card p-0.5">
                        {(["text", "file"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setRespMode(m);
                              setErrors((er) => ({ ...er, responsibility: undefined }));
                            }}
                            className={`rounded-[4px] px-3 py-1.5 text-xs transition-colors ${
                              respMode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {m === "text" ? c.form.modeText : c.form.modeFile}
                          </button>
                        ))}
                      </div>
                    </div>
                    {respMode === "text" ? (
                      <>
                        <Textarea
                          value={respText}
                          onChange={(e) => {
                            setRespText(e.target.value);
                            if (errors.responsibility) setErrors((er) => ({ ...er, responsibility: undefined }));
                          }}
                          placeholder={c.form.responsibilityPlaceholder}
                          rows={3}
                          className={`rounded-[6px] bg-card text-[1rem] ${errors.responsibility ? "border-destructive" : "border-input"}`}
                        />
                        {errors.responsibility && <span className="text-sm text-destructive">{errors.responsibility}</span>}
                      </>
                    ) : (
                      <DocField
                        label=""
                        file={docs.responsibility}
                        error={errors.responsibility}
                        attachText={c.form.attach}
                        replaceText={c.form.replace}
                        removeText={c.form.remove}
                        onPick={pickDoc("responsibility")}
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed text-muted-foreground">
                    <Checkbox
                      checked={agree}
                      onCheckedChange={(v) => {
                        setAgree(v === true);
                        setErrors((er) => ({ ...er, consent: undefined }));
                      }}
                      className={`mt-0.5 ${errors.consent ? "border-destructive" : ""}`}
                    />
                    <span>
                      {c.form.consentPrefix}{" "}
                      <a href="/privacy#consent" target="_blank" rel="noopener" className="text-foreground underline underline-offset-4">
                        {c.form.consentLink}
                      </a>{" "}
                      {c.form.consentMiddle}{" "}
                      <a href="/privacy" target="_blank" rel="noopener" className="text-foreground underline underline-offset-4">
                        {c.form.policyLink}
                      </a>
                    </span>
                  </label>
                  {errors.consent && <span className="text-sm text-destructive">{errors.consent}</span>}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="text-destructive">*</span> {c.form.docsNote}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-[6px] bg-foreground text-[1.05rem] text-background transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {loading ? (Object.values(docs).some(Boolean) ? c.form.uploading : c.form.sending) : c.form.submit}
                  <Icon name={loading ? "Loader2" : "ArrowRight"} size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;