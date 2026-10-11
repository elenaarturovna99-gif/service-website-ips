import { useLang } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLang();
  const links = [
    { href: "#services", label: t.nav.services },
    { href: "/kejsy", label: t.nav.cases },
    { href: "/stati", label: t.nav.articles },
    { href: "#faq", label: t.nav.faq },
    { href: "#contacts", label: t.nav.contacts },
  ];

  return (
    <footer className="bg-hero px-5 py-12 text-hero-text md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <a href="#top" className="flex items-center gap-3">
            <img src="/favicon.svg?v=2" alt="" className="h-9 w-9 shrink-0 rounded-[6px]" />
            <span className="text-[1.3rem] font-medium tracking-[-0.02em]">{t.brand.name}</span>
          </a>
          <div className="mono-cap mt-4 text-hero-muted">{t.brand.slogan}</div>
          <div className="mono-cap mt-2 text-hero-muted">{t.brand.legal}</div>
          <div className="mono-cap mt-1 text-hero-muted">{t.brand.requisites}</div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
            <a href="tel:+79049413669" className="hover:text-hero-muted">+7 (904) 941-36-69</a>
            <a href="mailto:heavyprom.ru@yandex.ru" className="hover:text-hero-muted">heavyprom.ru@yandex.ru</a>
          </div>
        </div>
        <nav className="mono-cap flex flex-wrap gap-6 text-hero-muted">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-hero-text">{l.label}</a>
          ))}
        </nav>
        <div className="mono-cap flex flex-col gap-2 text-hero-muted md:items-end">
          <a href="/privacy" className="hover:text-hero-text">{t.brand.privacy}</a>
          <span>© {new Date().getFullYear()} {t.brand.name}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;