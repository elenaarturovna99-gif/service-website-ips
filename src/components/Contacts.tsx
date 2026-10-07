import { useEffect, useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { services } from "@/components/Services";
import { useReveal } from "@/hooks/use-reveal";

type Errors = Partial<Record<"name" | "phone" | "object" | "service", string>>;

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
  const [form, setForm] = useState({ name: "", phone: "", object: "", service: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onPick = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      setForm((f) => ({ ...f, service: title }));
      setErrors((er) => ({ ...er, service: undefined }));
    };
    window.addEventListener("pick-service", onPick);
    return () => window.removeEventListener("pick-service", onPick);
  }, []);

  const validate = () => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Укажите имя";
    if (form.phone.replace(/\D/g, "").length !== 11) e.phone = "Введите номер полностью";
    if (form.object.trim().length < 3) e.object = "Опишите объект в паре слов";
    if (!form.service) e.service = "Выберите услугу";
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSent(true);
    toast.success("Заявка принята", { description: "Свяжемся с вами в течение рабочего дня." });
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
            Контакты
          </div>
          <h2 className="mt-6 text-[2.25rem] font-normal leading-[1.05] tight md:text-[3.5rem]">
            Обсудим ваш объект
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
            Оставьте заявку — перезвоним, зададим пару вопросов и предложим решение. Первичная консультация бесплатна.
          </p>

          <ul className="mt-12 space-y-6">
            {[
              { icon: "Phone", label: "Телефон", value: "+7 (900) 000-00-00", href: "tel:+79000000000" },
              { icon: "Mail", label: "Почта", value: "info@id-control.ru", href: "mailto:info@id-control.ru" },
              { icon: "Clock", label: "Режим работы", value: "Пн–Пт, 9:00–19:00" },
            ].map((c) => (
              <li key={c.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-border bg-card">
                  <Icon name={c.icon} size={18} className="text-primary" />
                </div>
                <div>
                  <div className="mono-cap text-muted-foreground">{c.label}</div>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block text-[1.15rem] tracking-[-0.02em] hover:text-accent">
                      {c.value}
                    </a>
                  ) : (
                    <div className="mt-1 text-[1.15rem] tracking-[-0.02em]">{c.value}</div>
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
                <h3 className="mt-6 text-[1.75rem] font-normal tight">Спасибо, {form.name.split(" ")[0]}!</h3>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  Заявка принята. Перезвоним на {form.phone} в течение рабочего дня.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", phone: "", object: "", service: "" });
                  }}
                  className="mono-cap mt-8 text-muted-foreground underline-offset-4 hover:underline"
                >
                  Отправить ещё одну
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="mono-cap text-muted-foreground">Имя</Label>
                    <Input id="name" placeholder="Как к вам обращаться" className={inputCls("name")} {...field("name")} />
                    {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="mono-cap text-muted-foreground">Телефон</Label>
                    <Input id="phone" type="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" className={inputCls("phone")} {...field("phone")} />
                    {errors.phone && <span className="text-sm text-destructive">{errors.phone}</span>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="object" className="mono-cap text-muted-foreground">Объект</Label>
                  <Input id="object" placeholder="Например: ЖК, 17 этажей, монолит, стадия отделки" className={inputCls("object")} {...field("object")} />
                  {errors.object && <span className="text-sm text-destructive">{errors.object}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="service" className="mono-cap text-muted-foreground">Нужная услуга</Label>
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
                      <option value="" disabled>Выберите из списка</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                      <option value="Комплекс услуг / пока не знаю">Комплекс услуг / пока не знаю</option>
                    </select>
                    <Icon name="ChevronDown" size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {errors.service && <span className="text-sm text-destructive">{errors.service}</span>}
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-[6px] bg-foreground text-[1.05rem] text-background transition-opacity hover:opacity-85"
                >
                  Отправить заявку
                  <Icon name="ArrowRight" size={18} />
                </button>
                <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;