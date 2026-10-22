import { useLang } from "@/i18n/LanguageContext";

const PHOTO =
  "https://cdn.poehali.dev/projects/98062dde-2a15-4d2a-9e82-9b366094add5/files/15afb911-c961-46c8-8ed4-c503078ca6c7.jpg";

const Hero = () => {
  const { t } = useLang();
  return (
    <section
      id="top"
      className="relative h-screen min-h-[640px] max-h-[1100px] w-full overflow-hidden bg-hero text-hero-text"
    >
      <div
        className="absolute inset-0 bg-hero bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${PHOTO})`, backgroundPosition: "center 70%" }}
      />
      <div className="hero-haze absolute inset-0" />
      <div className="hero-grain absolute inset-0" />

      <div className="absolute inset-x-0 top-[24vh] z-[2] animate-hero-in px-5 text-center md:top-[250px]">
        <h1
          className="hero-brand font-semibold leading-[1.08] tight"
          style={{ fontSize: "clamp(52px, 9vw, 112px)" }}
        >
          <span className="hero-brand-text">{t.hero.title}</span>
        </h1>
        <p
          className="mx-auto mt-8 max-w-[620px] leading-[1.45] text-hero-muted md:mt-11"
          style={{ fontSize: "clamp(16px, 1.6vw, var(--hero-size-body))" }}
        >
          {t.hero.text}
        </p>
      </div>

      <a
        href="#services"
        aria-label={t.hero.scrollLabel}
        className="absolute left-1/2 top-[calc(24vh+330px)] z-[2] -translate-x-1/2 animate-bob md:top-[600px]"
      >
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M11 0v26M2 17l9 9 9-9" />
        </svg>
      </a>

      <div className="mono-cap absolute bottom-[30px] left-5 z-[2] text-hero-text md:left-9">
        {t.hero.caption}
      </div>
    </section>
  );
};

export default Hero;