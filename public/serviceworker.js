self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open('static')
            .then((cache) => {
                cache.addAll([
                    '/',
                    '/index.html',
                    '/app.js',
                    '/app.css',
                    '/little-boy-saying-hiya.wav',
                    '/logo.svg',
                    '/icons/icons8-chat-32.png',
                    'https://fonts.googleapis.com/css2?family=Gasoek+One&family=Righteous&display=swap',
                    'https://unpkg.com/aos@next/dist/aos.css',
                    'https://unpkg.com/aos@next/dist/aos.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.2/socket.io.js',
                    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js',
                    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js',
                    '/pages/404.html'
                ])
            })
    )
})

self.addEventListener("activate", () => {

})

self.addEventListener("fetch", (event) => {
    // console.log('fetch event', event);
    event.respondWith(
        caches.match(event.request)
            .then((res) => {
                return res || fetch(event.request)
                    // .then((fetchRes) => {
                    //     return caches.open('dynamic')
                    //         .then((cache) => {
                    //             if (event.request.url.indexOf("google.firestore") === -1 && event.request.url.indexOf("cleardot.gif") === -1) {

                    //                 cache.put(event.request.url, fetchRes.clone());
                    //                 return fetchRes;
                    //             }
                    //         })
                    // })
            }).catch((e) => {
                console.log(e);
                if (event.request.url.indexOf('.html') > -1) {
                    return caches.match('/pages/404.html');
                }
            })
    )
})