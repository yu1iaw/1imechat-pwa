import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: 'https://unpkg.com/aos@next/dist/aos.css',
                        handler: "CacheFirst",
                        options: {
                            cacheName: "animation styles",
                            expiration: {
                                maxAgeSeconds: 60*60*24*365
                            }
                        }
                    },
                    {
                        urlPattern: 'https://unpkg.com/aos@next/dist/aos.js',
                        handler: "CacheFirst",
                        options: {
                            cacheName: "animation script",
                            expiration: {
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            }
                        }
                    },
                    {
                        urlPattern: 'https://fonts.googleapis.com/css2?family=Gasoek+One&family=Righteous&display=swap',
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google fonts",
                            expiration: {
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.js',
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "socket.io",
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60*60*24
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/www.gstatic.com\/firebasejs\/.*/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "firebase-cdn",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60*60*24*60
                            }
                        }
                    }
                ],
                globPatterns: [
                    '**/*.{js,css,html,png,svg}',
                ]
            },
            manifest: {
                name: "lime chat",
                short_name: "lime chat",
                start_url: "/",
                orientation: "portrait",
                display: "minimal-ui",
                background_color: "#CFD8DC",
                theme_color: "#CDDC39",
                icons: [
                    {
                        "src": "/icons/icons8-chat-48.png",
                        "sizes": "48x48",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/icons8-chat-96.png",
                        "sizes": "96x96",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/icons8-chat-144.png",
                        "sizes": "144x144",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/icons8-chat-240.png",
                        "sizes": "240x240",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/icons8-chat-480.png",
                        "sizes": "480x480",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/free-icon-chat-512.png",
                        "sizes": "512x512",
                        "type": "image/png"
                    }
                ]
            }
        }),
    ]
})

