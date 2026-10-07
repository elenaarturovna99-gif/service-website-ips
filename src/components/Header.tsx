import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const links = [
  { href: "#services", label: "Услуги" },
  { href: "#why", label: "Почему мы" },
  { href: "#process", label: "Этапы" },
  { href: "#experience", label: "Опыт" },
  { href: "#faq", label: "Вопросы" },
  { href: "#contacts", label: "Контакты" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "border-b border-border bg-background/85 text-foreground backdrop-blur-md"
          : "border-b border-transparent text-white"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-3 md:pl-12 md:pr-10 md:pt-4 md:pb-3">
        <a href="#top" className="text-[1.2rem] font-medium tracking-[-0.02em] md:text-[1.45rem]">
          Исполнительная&nbsp;документация
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="mono-cap opacity-90 transition-opacity hover:opacity-60"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacts"
            className={`rounded-[6px] border px-4 py-3 text-[1.05rem] transition-colors ${
              solid
                ? "border-foreground/40 hover:bg-foreground hover:text-background"
                : "border-white/60 hover:bg-white hover:text-hero-ink"
            }`}
          >
            Обсудить объект
          </a>
        </nav>

        <button
          aria-label="Меню"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-current/30 lg:hidden"
        >
          <Icon name={open ? "X" : "Menu"} size={20} />
        </button>
      </div>

      {open && (
        <div className="h-[calc(100vh-64px)] animate-fade-in border-t border-border bg-background px-5 pb-10 pt-6 lg:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-border">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 text-2xl tracking-[-0.03em]"
                >
                  {l.label}
                  <Icon name="ArrowUpRight" size={18} className="text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contacts"
            onClick={() => setOpen(false)}
            className="mt-8 flex justify-center rounded-[6px] bg-foreground py-4 text-lg text-background"
          >
            Обсудить объект
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
