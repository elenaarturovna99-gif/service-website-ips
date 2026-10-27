import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ru, { type Dict } from "./ru";
import en from "./en";

export type Lang = "ru" | "en";

const dicts: Record<Lang, Dict> = { ru, en };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getInitialLang = (): Lang => {
  if (typeof window === "undefined") return "ru";
  try {
    const stored = window.localStorage.getItem("lang");
    if (stored === "ru" || stored === "en") return stored;
  } catch {
    return "ru";
  }
  const param = new URLSearchParams(window.location.search).get("lang");
  return param === "en" ? "en" : "ru";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("ru");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLangState(getInitialLang());
    setLoaded(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem("lang", next);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.lang = lang;
    document.title = dicts[lang].meta.title;
  }, [lang, loaded]);

  const value = useMemo(() => ({ lang, setLang, t: dicts[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};