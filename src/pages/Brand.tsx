import Icon from "@/components/ui/icon";

const files = [
  { file: "heavyprom-znak-1000.png", title: "Знак, прозрачный фон", note: "Аватар для hh.ru, соцсетей, мессенджеров", dark: false },
  { file: "heavyprom-znak-1000.jpg", title: "Знак, белый фон", note: "Если сервис не принимает PNG", dark: false },
  { file: "heavyprom-logo-svetlyj.png", title: "Логотип для светлого фона", note: "Документы, письма, hh.ru", dark: false },
  { file: "heavyprom-logo-svetlyj.jpg", title: "Логотип для светлого фона, JPG", note: "Универсальный формат", dark: false },
  { file: "heavyprom-logo-temnyj.png", title: "Логотип для тёмного фона", note: "Презентации, тёмные макеты", dark: true },
  { file: "heavyprom-oblozhka-1920x640.jpg", title: "Обложка 1920×640", note: "Профиль на hh.ru, ВКонтакте, Telegram", dark: false },
  { file: "heavyprom-prevyu-1360x768.jpg", title: "Баннер 1360×768", note: "Посты и презентации", dark: false },
  { file: "heavyprom-znak.svg", title: "Знак, SVG", note: "Исходник для дизайнера и типографии", dark: false },
];

const Brand = () => {
  return (
  <div className="min-h-screen bg-background px-5 py-16 md:px-12">
    <div className="mx-auto max-w-6xl">
      <a href="/" className="mono-cap inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <Icon name="ArrowLeft" size={14} />
        На сайт
      </a>
      <h1 className="mt-6 text-[2.5rem] font-normal leading-tight tight md:text-[3.5rem]">Логотип ХэвиПром</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Нажмите «Скачать» под нужным файлом.</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => (
          <div key={f.file} className="overflow-hidden rounded-[6px] border border-border bg-card">
            <div className={`flex h-48 items-center justify-center p-6 ${f.dark ? "bg-hero-ink" : "bg-muted/60"}`}>
              <img src={`/brand/${f.file}`} alt={f.title} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-5">
              <div className="text-[1.05rem] tracking-[-0.02em]">{f.title}</div>
              <div className="mt-1 text-[0.9rem] text-muted-foreground">{f.note}</div>
              <a
                href={`/brand/${f.file}`}
                download={f.file}
                className="mt-4 inline-flex items-center gap-2 rounded-[6px] bg-foreground px-4 py-2.5 text-[0.95rem] text-background transition-opacity hover:opacity-85"
              >
                <Icon name="Download" size={16} />
                Скачать
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default Brand;