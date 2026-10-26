from pathlib import Path

content = r'''/*
 * Service Worker - Supervisão de Instrutoria SENAR
 * Cache version: v2
 *
 * Observação:
 * Este arquivo armazena os arquivos locais principais do PWA.
 * As bibliotecas Tailwind CSS e html2pdf.js ainda são carregadas por CDN
 * no index.html; por isso, seus recursos não ficam garantidos offline
 * até serem disponibilizados localmente em uma etapa posterior.
 */

const CACHE_NAME = "supervisao-senar-v2";
const APP_PREFIX = "supervisao-senar-";

const APP_URL = new URL("index.html", self.registration.scope).href;
const MANIFEST_URL = new URL("manifest.json", self.registration.scope).href;

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // O Service Worker só é instalado se os arquivos essenciais
            // locais puderem ser armazenados.
            await cache.addAll([APP_URL, MANIFEST_URL]);

            // Solicita ativação da nova versão sem esperar todas as abas fecharem.
            await self.skipWaiting();
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();

            await Promise.all(
                cacheNames
                    .filter(
                        (name) =>
                            name.startsWith(APP_PREFIX) &&
                            name !== CACHE_NAME
                    )
                    .map((name) => caches.delete(name))
            );

            // Faz a versão ativa controlar as páginas abertas deste escopo.
            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    // Não intercepta requisições que não sejam GET.
    if (request.method !== "GET") return;

    const requestUrl = new URL(request.url);

    // Não intercepta CDNs ou outros domínios.
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
                // Não fabrica uma resposta para recursos desconhecidos.
                return new Response("", { status: 503 });
            }
        })()
    );
});
'''
path = Path("/mnt/data/sw.js")
path.write_text(content, encoding="utf-8")
print(f"Arquivo criado: {path} ({path.stat().st_size} bytes)")
