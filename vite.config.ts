import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import {componentTagger} from "pp-tagger";

// HMR-сокет превью рвёт инфраструктура: ingress-nginx на каждом reload
// конфига (захват/освобождение любого dev-пода) через 30 с закрывает все
// соединения старых воркеров; DDoS Guard режет «тихие» соединения. Сам vite
// на любой обрыв перезагружает страницу. Плагин держит превью живым:
// - сервер шлёт состояние «boot:seq» сразу после каждой рассылки клиентам
//   (update, full-reload, error...) и раз в 5-9 с — это и двусторонний
//   keepalive для DDoS Guard (рандом — чтобы не ловить его фильтр одинаковых
//   интервалов). boot меняется на рестарте vite, seq — на каждой рассылке;
// - клиент (скрипт в index.html) подменяет сокет vite-hmr «вечным»: на
//   обрыве тихо переподключается и перезагружает страницу, только если за
//   время разрыва сервер рестартовал или что-то разослал. Не переподключился
//   с трёх попыток — отдаёт обрыв vite, дальше как раньше (ждёт сервер и
//   перезагружает).
// Клиентский ping понижен до 7 с через server.hmr.timeout ниже.
const hmrClient = `(() => {
    const NativeWebSocket = WebSocket;
    class HmrSocket extends EventTarget {
        OPEN = 1;
        readyState = 0;
        state = "";
        queue = [];
        constructor(url, protocols) {
            super();
            this.url = url;
            this.protocols = protocols;
            this.connect(0);
        }
        connect(attempt) {
            const ws = this.ws = new NativeWebSocket(this.url, this.protocols);
            let fresh = true;
            ws.onopen = () => {
                attempt = 0;
                this.queue.splice(0).forEach((data) => ws.send(data));
                if (this.readyState === 0) {
                    this.readyState = 1;
                    this.dispatchEvent(new Event("open"));
                }
            };
            ws.onmessage = (event) => {
                if (event.data.includes('"ezst:hmr"')) {
                    const state = JSON.parse(event.data).data;
                    if (fresh && this.state && this.state !== state) return location.reload();
                    fresh = false;
                    this.state = state;
                }
                this.dispatchEvent(new MessageEvent("message", {data: event.data}));
            };
            ws.onclose = (event) => {
                if (this.readyState === 3) return;
                if (!this.state || attempt === 3) {
                    this.readyState = 3;
                    return this.dispatchEvent(new CloseEvent("close", event));
                }
                setTimeout(() => this.connect(attempt + 1), attempt * 1000);
            };
        }
        send(data) {
            if (this.ws.readyState === 1) this.ws.send(data);
            else this.queue.push(data);
        }
        close(code, reason) {
            this.readyState = 3;
            this.ws.close(code, reason);
        }
    }
    window.WebSocket = new Proxy(NativeWebSocket, {
        construct: (target, args) => args[1] === "vite-hmr" ? new HmrSocket(...args) : new target(...args),
    });
})();`;

const hmrKeepalive = {
    name: 'hmr-ws-keepalive',
    apply: 'serve' as const,
    configureServer(server: any) {
        const boot = Date.now().toString(36);
        let seq = 0;
        const state = () => ({type: 'custom', event: 'ezst:hmr', data: `${boot}:${seq}`});
        const broadcast = server.ws.send.bind(server.ws);
        server.ws.send = (...args: any[]) => {
            seq++;
            broadcast(...args);
            broadcast(state());
        };
        server.ws.on('connection', (socket: any) => socket.send(JSON.stringify(state())));
        let timer: ReturnType<typeof setTimeout> | null = null;
        const tick = () => {
            broadcast(state());
            timer = setTimeout(tick, 5000 + Math.floor(Math.random() * 4000));
        };
        timer = setTimeout(tick, 5000 + Math.floor(Math.random() * 4000));
        server.httpServer?.on('close', () => {
            if (timer) clearTimeout(timer);
        });
    },
    transformIndexHtml: () => [{tag: 'script', children: hmrClient, injectTo: 'head-prepend' as const}],
};

const escAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const prerender = {
    name: 'heavyprom-prerender',
    apply: 'build' as const,
    writeBundle(options: any) {
        const dir = options.dir || path.resolve(__dirname, 'dist');
        const source = path.resolve(__dirname, 'scripts/prerender.json');
        const template = path.join(dir, 'index.html');
        if (!fs.existsSync(source) || !fs.existsSync(template)) return;
        const base = fs.readFileSync(template, 'utf-8');
        const pages: {path: string; title: string; description: string; image?: string; html: string}[] =
            JSON.parse(fs.readFileSync(source, 'utf-8'));
        for (const page of pages) {
            const url = `https://heavyprom.ru${page.path}`;
            const title = escAttr(page.title);
            const desc = escAttr(page.description);
            let html = base
                .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
                .replace(/(<meta name="description" content=")[^"]*"/, `$1${desc}"`)
                .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
                .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`)
                .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
                .replace(/(<meta property="og:type" content=")[^"]*"/, `$1article"`)
                .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
                .replace('<div id="root"></div>', `<div id="root"><div style="max-width:760px;margin:0 auto;padding:32px 20px;font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f2937">${page.html}</div></div>`);
            if (page.image) {
                html = html
                    .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${page.image}"`)
                    .replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${page.image}"`);
            }
            const target = path.join(dir, page.path.replace(/^\//, ''));
            fs.mkdirSync(target, {recursive: true});
            fs.writeFileSync(path.join(target, 'index.html'), html);
        }
    },
};

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
    plugins: [
        react(),
        hmrKeepalive,
        prerender,
        mode === 'development' &&
        componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: true,
        hmr: {
            overlay: false, // Disables the error overlay if you only want console errors
            timeout: 7000, // pingInterval @vite/client — нужен <30s для DDoS Guard
        }
    },
}));
