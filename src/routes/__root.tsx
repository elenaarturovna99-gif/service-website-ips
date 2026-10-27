import type {ReactNode} from "react";
import {HeadContent, Outlet, Scripts, createRootRoute} from "@tanstack/react-router";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import RouteTracker from "@/components/RouteTracker";
import NotFound from "@/pages/NotFound";
import {ORG_JSONLD} from "@/lib/orgJsonLd";
import {PLATFORM_META, PLATFORM_SCRIPTS} from "@/platform/scripts.gen";
import {HMR_CLIENT} from "@/platform/dev-hmr";
import appCss from "@/index.css?url";

const TITLE = "ХэвиПром — исполнительная документация и строительный контроль";
const DESCRIPTION =
    "Исполнительная документация, аудит и строительный контроль на промышленных объектах: газохимия, нефтехимия, энергетика, заводы. Сдача без замечаний.";
const OG_IMAGE = "https://heavyprom.ru/og-image.jpg";

const METRIKA = `(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=113593674", "ym");
ym(113593674, "init", {ssr: true, webvisor: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, trackHash: true});`;

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {charSet: "utf-8"},
            {name: "viewport", content: "width=device-width, initial-scale=1.0"},
            {title: TITLE},
            {name: "description", content: DESCRIPTION},
            {name: "author", content: "ХэвиПром"},
            {name: "yandex-verification", content: "1f11c18c9bb33a13"},
            {name: "google-site-verification", content: "7cODKbRfoAh_lxX5XImseftzWCD_-jr_ZRIwG6gFYcw"},
            {name: "zen-verification", content: "QYVyJXx3ovLxXOSUkLE0EL7SJEClWK3vZ96zsI11efE7j1TSdsbL1kYbrWVvwiIl"},
            {property: "og:site_name", content: "ХэвиПром"},
            {property: "og:type", content: "website"},
            {property: "og:url", content: "https://heavyprom.ru"},
            {property: "og:title", content: TITLE},
            {property: "og:description", content: DESCRIPTION},
            {property: "og:image:width", content: "1360"},
            {property: "og:image:height", content: "768"},
            {property: "og:image", content: OG_IMAGE},
            {name: "twitter:card", content: "summary_large_image"},
            {name: "twitter:image", content: OG_IMAGE},
            ...PLATFORM_META,
        ],
        links: [
            {rel: "stylesheet", href: appCss},
            {rel: "preconnect", href: "https://fonts.googleapis.com"},
            {rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous"},
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap",
            },
            {rel: "icon", href: "/favicon.ico", sizes: "48x48"},
            {rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96.png"},
            {rel: "icon", type: "image/png", sizes: "120x120", href: "/favicon-120.png"},
            {rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=2"},
            {rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2"},
            {rel: "alternate", type: "application/rss+xml", title: "ХэвиПром — статьи", href: "https://heavyprom.ru/rss.xml"},
        ],
        // IMPORTANT: DO NOT REMOVE PLATFORM SCRIPTS AND THE DEV HMR CLIENT!
        scripts: [
            ...(import.meta.env.DEV ? [{children: HMR_CLIENT}] : []),
            ...PLATFORM_SCRIPTS,
            {type: "application/ld+json", children: JSON.stringify(ORG_JSONLD)},
            {children: METRIKA},
        ],
    }),
    component: RootComponent,
    notFoundComponent: NotFound,
});

function RootComponent() {
    return (
        <RootDocument>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <RouteTracker/>
                <Outlet/>
            </TooltipProvider>
        </RootDocument>
    );
}

function RootDocument({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <HeadContent/>
        </head>
        <body>
        {children}
        <noscript>
            <div><img src="https://mc.yandex.ru/watch/113593674" style={{position: "absolute", left: "-9999px"}} alt=""/></div>
        </noscript>
        <Scripts/>
        </body>
        </html>
    );
}
