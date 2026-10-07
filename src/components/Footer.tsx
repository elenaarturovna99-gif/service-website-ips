const Footer = () => (
  <footer className="bg-hero px-5 py-12 text-hero-text md:px-12">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-[1.3rem] font-medium tracking-[-0.02em]">Исполнительная документация</div>
        <div className="mono-cap mt-3 text-hero-muted">ИП · Строительный контроль на каждом этапе</div>
      </div>
      <nav className="mono-cap flex flex-wrap gap-6 text-hero-muted">
        <a href="#services" className="hover:text-hero-text">Услуги</a>
        <a href="#process" className="hover:text-hero-text">Этапы</a>
        <a href="#faq" className="hover:text-hero-text">Вопросы</a>
        <a href="#contacts" className="hover:text-hero-text">Контакты</a>
      </nav>
      <div className="mono-cap text-hero-muted">© {new Date().getFullYear()}</div>
    </div>
  </footer>
);

export default Footer;
