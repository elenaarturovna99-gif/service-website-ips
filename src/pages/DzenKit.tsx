import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

type Post = {
  date: string;
  kind: string;
  video?: string;
  title: string;
  text: string;
};

const SITE = "https://heavyprom.ru";

const posts: Post[] = [
  {
    date: "Сейчас",
    kind: "Пост о канале",
    title: "Добро пожаловать в канал ХэвиПром",
    text: `Здравствуйте! Мы — ХэвиПром, команда инженеров по исполнительной документации и строительному контролю.

Больше 14 лет работаем на промышленных объектах: газохимия, горнорудная отрасль, энергетика. Сдали более 8 объектов, среди них — Балтийский газохимический комплекс и ЗИФ-5 месторождения «Благодатное».

О чём будет канал:
— разборы АОСР, исполнительных схем и журналов работ;
— частые замечания технадзора и как их избежать;
— электронная ИД, приказ 344/пр, требования заказчиков;
— кейсы с реальных объектов.

Новая статья — каждое воскресенье. Подписывайтесь, чтобы не пропустить.

Если нужна помощь с документацией на вашем объекте — ${SITE} или +7 (904) 941-36-69.`,
  },
  {
    date: "Сейчас",
    kind: "Видео",
    video: "01-o-kanale",
    title: "Исполнительная документация без возвратов — о канале ХэвиПром",
    text: `Кто мы, чем занимаемся и о чём этот канал.

Каждое воскресенье — новый разбор по исполнительной документации и строительному контролю на промышленных объектах.

Сайт: ${SITE}
Телефон: +7 (904) 941-36-69`,
  },
  {
    date: "18 октября",
    kind: "Видео",
    video: "02-vosstanovlenie-id",
    title: "Подрядчик ушёл, а документов нет: как восстановить исполнительную документацию",
    text: `5 шагов восстановления ИД: от инвентаризации до подписания.

Подробный разбор: ${SITE}/stati/kak-vosstanovit-ispolnitelnuyu-dokumentaciyu
Восстановим ИД на вашем объекте: ${SITE}/uslugi/vosstanovlenie-ispolnitelnoj-dokumentacii`,
  },
  {
    date: "25 октября",
    kind: "Видео",
    video: "03-zamechaniya-tehnadzora",
    title: "За что технадзор возвращает исполнительную документацию: топ-5 ошибок",
    text: `Пять самых частых замечаний к ИД и как их избежать ещё до сдачи.

Все 10 ошибок — в статье: ${SITE}/stati/zamechaniya-k-ispolnitelnoj-dokumentacii
Аудит ИД перед сдачей: ${SITE}/uslugi/audit-ispolnitelnoj-dokumentacii`,
  },
  {
    date: "1 ноября",
    kind: "Видео",
    video: "04-elektronnaya-id",
    title: "Электронная исполнительная документация: подписи, форматы, советы",
    text: `Кто решает переходить на электронную ИД, какая нужна подпись и в каких форматах сдавать.

Подробнее: ${SITE}/stati/elektronnaya-ispolnitelnaya-dokumentaciya`,
  },
  {
    date: "8 ноября",
    kind: "Видео",
    video: "05-aosr",
    title: "АОСР, который не вернут: 5 ошибок в акте скрытых работ",
    text: `Чек-лист по акту освидетельствования скрытых работ.

Полный разбор по разделам: ${SITE}/stati/akt-osvidetelstvovaniya-skrytyh-rabot-aosr`,
  },
];

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
    >
      <Icon name={done ? "Check" : "Copy"} size={16} />
      {done ? "Скопировано" : label}
    </button>
  );
};

const DzenKit = () => {
  useEffect(() => {
    document.title = "Материалы для Дзена — ХэвиПром";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground md:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[2rem] font-normal tracking-[-0.03em]">Материалы для Дзена</h1>
        <p className="mt-3 text-muted-foreground">
          Служебная страница. Скачайте ролик, скопируйте заголовок и описание и опубликуйте в Студии Дзена в указанный день.
        </p>

        <div className="mt-10 space-y-8">
          {posts.map((p, i) => (
            <section key={i} className="rounded-xl border border-border p-5 md:p-6">
              <div className="mono-cap text-muted-foreground">
                {p.date} · {p.kind}
              </div>
              <div className="mt-4 flex flex-col gap-6 md:flex-row">
                {p.video && (
                  <video
                    src={`/dzen/${p.video}.mp4`}
                    poster={`/dzen/${p.video}.jpg`}
                    controls
                    preload="none"
                    className="w-full max-w-[220px] shrink-0 self-start rounded-lg bg-black"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-medium">{p.title}</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyButton value={p.title} label="Заголовок" />
                    <CopyButton value={p.text} label="Описание" />
                    {p.video && (
                      <a
                        href={`/dzen/${p.video}.mp4`}
                        download
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
                      >
                        <Icon name="Download" size={16} />
                        Скачать видео
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default DzenKit;
