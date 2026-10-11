import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ru from "@/i18n/ru";

const nav = [
  { to: "/#services", label: "Услуги" },
  { to: "/kejsy", label: "Кейсы" },
  { to: "/stati", label: "Статьи" },
  { to: "/#contacts", label: "Контакты" },
];

export const CtaBand = ({ href = "/#contacts" }: { href?: string }) => (
  <section className="bg-hero px-5 py-16 text-hero-text md:px-12 md:py-20">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] md:text-[2.25rem]">Обсудим ваш объект?</h2>
        <p className="mt-3 max-w-xl text-hero-muted">
          Оставьте заявку или позвоните — уточним задачу, сроки и стоимость в тот же день.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={href} className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-white px-6 py-4 text-hero-ink transition-opacity hover:opacity-85">
          {ru.services.order}
          <Icon name="ArrowUpRight" size={16} />
        </a>
        <a href="tel:+79049413669" className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/40 px-6 py-4 transition-colors hover:bg-white/10">
          <Icon name="Phone" size={16} />
          +7 (904) 941-36-69
        </a>
      </div>
    </div>
  </section>
);

export const Crumbs = ({ items }: { items: { label: string; to?: string }[] }) => (
  <nav className="mono-cap flex flex-wrap items-center gap-2 text-muted-foreground">
    {items.map((it, i) => (
      <span key={it.label} className="flex items-center gap-2">
        {i > 0 && <Icon name="ChevronRight" size={14} />}
        {it.to ? (
          <Link to={it.to} className="hover:text-foreground">{it.label}</Link>
        ) : (
          <span className="text-foreground">{it.label}</span>
        )}
      </span>
    ))}
  </nav>
);

const PageShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src="/favicon.svg?v=2" alt="" className="h-8 w-8 rounded-[6px] md:h-9 md:w-9" />
          <span className="text-[1.2rem] font-medium tracking-[-0.02em] md:text-[1.45rem]">{ru.brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `mono-cap transition-opacity hover:opacity-60 ${isActive && !n.to.includes("#") ? "underline underline-offset-4" : ""}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <a
          href="/#contacts"
          className="shrink-0 rounded-[6px] border border-foreground/40 px-4 py-2.5 transition-colors hover:bg-foreground hover:text-background"
        >
          {ru.header.cta}
        </a>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-border px-5 py-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="mono-cap whitespace-nowrap">{n.label}</Link>
        ))}
      </nav>
    </header>

    <main>{children}</main>

    <footer className="border-t border-border px-5 py-8 md:px-12">
      <div className="mono-cap mx-auto flex max-w-7xl flex-col gap-3 text-muted-foreground md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} {ru.brand.name} · {ru.brand.legal}</span>
        <span>{ru.brand.requisites}</span>
        <Link to="/privacy" className="hover:text-foreground">{ru.brand.privacy}</Link>
      </div>
    </footer>
  </div>
);

export default PageShell;
