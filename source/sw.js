const staticCacheName = 'static-cache-v3'
const dynamicCacheName = 'dynamic-cache-v3'

const assetUrls = [
    // css
    '/source/css/500.min.css',
    '/source/css/auth.css',
    '/source/css/dark.css',
    // '/source/css/main.css',
    // css libs
    '/source/css/lib/bootstrap.min.css',
    '/source/css/lib/bootstrap.min.css.map',
    '/source/css/lib/dropzone.min.css',
    //fonts
    '/source/fonts/inter.css',
    // js
    '/source/main.js',
    '/source/auth.js',
    // js libs
    '/source/lib/bootstrap.bundle.min.js',
    '/source/lib/bootstrap.bundle.min.js.map',
    '/source/lib/bootstrap.min.js',
    '/source/lib/bootstrap.min.js.map',
    '/source/lib/cookie.min.js',
    '/source/lib/jplayer.playlist.min.js',
    '/source/lib/jquery.jplayer.min.js',
    '/source/lib/jquery.jplayer.swf',
    '/source/lib/jQuery.min.js',
    '/source/lib/jquery-ui.min.js',
    // images
    '/source/images/default.svg',
    '/source/images/failed.svg',
    '/source/images/music.svg',
    // pages
    '/index.html',
    '/403.html',
    '/404.html',
    '/500.html',
    '/offline',
    '/offline/index.html',
    // player
    '/source/images/player/slider.png',
    // icons
    '/source/images/144.png',
    '/source/images/256.png',
    '/source/images/512.png',
    '/source/images/android-launchericon-48-48.png',
    '/source/images/android-launchericon-72-72.png',
    '/source/images/android-launchericon-96-96.png',
    '/source/images/android-launchericon-144-144.png',
    '/source/images/android-launchericon-192-192.png',
    '/source/images/android-launchericon-512-512.png',
]

self.addEventListener('install', async event => {
    const cache = await caches.open(staticCacheName);
    await cache.addAll(assetUrls);
})

self.addEventListener('activate', async event => {
    const cacheNames = await caches.keys()
    await Promise.all(
        cacheNames
            .filter(name => name !== staticCacheName)
            .filter(name => name !== dynamicCacheName)
            .map(name => caches.delete(name))
    )
})

self.addEventListener('fetch', event => {
    const {request} = event;
    const url = new URL(request.url);
    try{
        if (url.origin === location.origin) {
            event.respondWith(cacheFirst(request));
        } else {
            event.respondWith(networkFirst(request));
        }
    } catch (e) {
        event.respondWith(offline());
    }
})

async function cacheFirst(request) {
    const cached = await caches.match(request);
    return cached ?? await fetch(request);
}

async function networkFirst(request) {
    const cache = await caches.open(dynamicCacheName);
    try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
        return response;
    } catch (e) {
        const cached = await cache.match(request);
        return cached ?? await caches.match('/offline');
    }
}

async function offline(){
    return await caches.match('/offline');
}