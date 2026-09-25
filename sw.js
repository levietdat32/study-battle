const CACHE_NAME =
    "firebase-sync-test-v1";


const FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache =>
                        cache.addAll(
                            FILES
                        )
                )

        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    keys =>
                        Promise.all(

                            keys
                                .filter(
                                    key =>
                                        key !==
                                        CACHE_NAME
                                )
                                .map(
                                    key =>
                                        caches.delete(
                                            key
                                        )
                                )

                        )
                )

        );

        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        const url =
            new URL(
                event.request.url
            );


        /*
           KHÔNG CACHE FIREBASE.

           Firebase phải luôn lấy dữ liệu
           trực tiếp từ server.
        */

        if (
            url.hostname.includes(
                "firebaseio.com"
            ) ||
            url.hostname.includes(
                "googleapis.com"
            )
        ) {

            event.respondWith(
                fetch(
                    event.request
                )
            );

            return;

        }


        /*
           File app:
           ưu tiên mạng.

           Mất mạng thì lấy cache.
        */

        event.respondWith(

            fetch(
                event.request
            )
            .then(
                response => {

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const copy =
                            response.clone();

                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache =>
                                    cache.put(
                                        event.request,
                                        copy
                                    )
                            );

                    }

                    return response;

                }
            )
            .catch(
                () =>
                    caches.match(
                        event.request
                    )
            )

        );

    }
);