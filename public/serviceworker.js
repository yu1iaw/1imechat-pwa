const staticCacheName = 'static-app-v1';

const assetUrls = [
    '/',
    '/index.html',
    '/manifest.json',
    '/config.js',
    '/app.js',
    '/app.css',
    '/happy-pop.mp3',
    '/logo.svg',
    '/icons/icons8-chat-32.png',
    '/icons/icons8-chat-144.png',
    '/icons/lime_icon.png',
    'https://fonts.googleapis.com/css2?family=Gasoek+One&family=Righteous&display=swap',
    'https://unpkg.com/aos@next/dist/aos.css',
    'https://unpkg.com/aos@next/dist/aos.js',
    'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
    '/pages/404.html'
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(staticCacheName);
            await cache.addAll(assetUrls);
        })()
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(name => name !== staticCacheName)
                    .map(name => caches.delete(name))
            )
        })()
    )
})

self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request))
})

async function cacheFirst(request) {
    try {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        // const cache = await caches.open(staticCacheName);
        // cache.put(request, response.clone());
        return response;
    } catch (e) {
        if (request.headers.get("accept").includes("text/html")) {
            return await caches.match('/pages/404.html');
        }
        return new Response("Resource not available", {
            status: 503,
            statusText: "Service Unavailable" 
        })
    }
}