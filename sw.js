const CACHE_NAME = 'inav-gs-v5';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './msp.js',
    './crsf.js',
    './instruments.js',
    './usb-camera.js',
    './icon-192.png',
    './icon-512.png',
    'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
