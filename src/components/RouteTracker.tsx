import { useEffect, useRef } from "react";
import { useLocation } from "@/lib/router-compat";
import { trackPageView } from "@/lib/metrika";

const RouteTracker = () => {
  const { pathname, search } = useLocation();
  const first = useRef(true);

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