import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/metrika";
import { SITE_URL } from "@/lib/jsonld";

const setCanonical = (pathname: string) => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = clean === "/" ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
};

const RouteTracker = () => {
  const { pathname, search } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    setCanonical(pathname);
  }, [pathname]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => trackPageView(window.location.href), 100);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return null;
};

export default RouteTracker;
