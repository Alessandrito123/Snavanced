var cacheName = 'super-snap-worker',
    filesToCache = [
    'index.html',
    'loading.svg',
    'src/certificate.svg',
    'src/morphic.js',
    'src/threads.js',
    'src/objects.js',
    'src/blocks.js',
    'src/byob.js',
    'src/widgets.js',
    'src/midi.js',
    'src/gui.js',
    'src/desktop.js',
    'src/scenes.js',
    'src/charts.js',
    'src/bpmn.js',
    'src/lists.js',
    'src/tables.js',
    'src/FileSaver.js',
    'src/math.js',
    'src/symbols.js',
    'src/api.js',
    'src/store.js',
    'src/console.js',
    'src/ypr.js',
    'src/locale.js',
    'src/joke.js',
    'src/sketch.js',
    'src/paint.js',
    'src/xmlToJson.js',
    'src/extensions.js',
    'src/motors.js',
    'src/maps.js',
    'src/sha512.js',
    'src/video.js',
    'src/xml.js',
    'src/locale/lang-es.js',
    'src/locale/lang-tok.js',
    'src/compilers.js',
    'src/beep.waw',
    'src/click.waw'
    ];

console.log('service worker executed');
/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function(e) {
        return caches.open(cacheName).then(function(cache) {
          return cache.match(event.request, {'ignoreSearch' : true }).then(response => response);
        });
    }));
});
