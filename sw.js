/*
 * Service Worker - Supervisão de Instrutoria SENAR
 * Cache version: v3
 *
 * Guarda no aparelho: a página, o manifesto, os ícones e cópias do Tailwind CSS
 * e do html2pdf.js (baixados dos CDNs na instalação, com internet).
 * Depois disso o aplicativo abre sem conexão, com o visual normal.
 *
 * Para forçar a atualização dos arquivos guardados (inclusive os CDNs),
 * aumente CACHE_NAME (ex.: v4).
 */

const CACHE_NAME = "supervisao-senar-v3";
const APP_PREFIX = "supervisao-senar-";

const APP_URL = new URL("index.html", self.registration.scope).href;
const MANIFEST_URL = new URL("manifest.json", self.registration.scope).href;

// Opcionais: se algum faltar ou falhar, a instalação continua.
const ICON_URLS = ["icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]
    .map((nome) => new URL(nome, self.registration.scope).href);

const CDN_URLS = [
    "https://cdn.tailwindcss.com",
    "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.3/html2pdf.bundle.min.js"
].map((url) => new URL(url).href);

async function guardarCDN(cache, url) {
    try {
        // no-cors: a resposta é "opaca" (não legível), mas pode ser usada por <script>.
        const resposta = await fetch(new Request(url, { mode: "no-cors" }));
        if (resposta && (resposta.ok || resposta.type === "opaque")) {
            await cache.put(url, resposta);
        }
    } catch (erro) {
        // Sem internet na instalação: será tentado de novo no primeiro uso online.
    }
}

async function responderCDN(request) {
    const cache = await caches.open(CACHE_NAME);
    const guardada = await cache.match(request.url, { ignoreVary: true });
    if (guardada) return guardada;

    try {
        const resposta = await fetch(request);
        if (resposta && (resposta.ok || resposta.type === "opaque")) {
            await cache.put(request.url, resposta.clone());
        }
        return resposta;
    } catch (erro) {
        return new Response("", { status: 503 });
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Essenciais: a instalação só ocorre se estes arquivos locais forem guardados.
            await cache.addAll([APP_URL, MANIFEST_URL]);

            await Promise.all(ICON_URLS.map((url) => cache.add(url).catch(() => {})));
            await Promise.all(CDN_URLS.map((url) => guardarCDN(cache, url)));

            await self.skipWaiting();
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const nomes = await caches.keys();

            await Promise.all(
                nomes
                    .filter((nome) => nome.startsWith(APP_PREFIX) && nome !== CACHE_NAME)
                    .map((nome) => caches.delete(nome))
            );

            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    const requestUrl = new URL(request.url);

    // Bibliotecas dos CDNs usadas pelo aplicativo: cache primeiro.
    if (CDN_URLS.includes(requestUrl.href)) {
        event.respondWith(responderCDN(request));
        return;
    }

    // Demais domínios (e-mail, IA etc.) não são interceptados.
    if (requestUrl.origin !== self.location.origin) return;

    // Navegação: tenta a versão atual pela rede; sem internet, usa o index em cache.
    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    const response = await fetch(request);

                    if (response && response.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(APP_URL, response.clone());
                    }

                    return response;
                } catch (error) {
                    const cachedPage = await caches.match(APP_URL);

                    if (cachedPage) return cachedPage;

                    return new Response(
                        "O aplicativo ainda não foi armazenado neste dispositivo. Abra-o uma vez com conexão à internet e tente novamente.",
                        {
                            status: 503,
                            headers: { "Content-Type": "text/plain; charset=utf-8" }
                        }
                    );
                }
            })()
        );

        return;
    }

    // Recursos locais: cache primeiro; se não houver, busca na rede e armazena.
    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(request);

            if (cachedResponse) return cachedResponse;

            try {
                const networkResponse = await fetch(request);

                if (networkResponse && networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                return new Response("", { status: 503 });
            }
        })()
    );
});
