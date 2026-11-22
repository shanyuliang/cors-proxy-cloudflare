const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
};

export default {
    async fetch(request) {
        console.info(`Proxying request: ${request.method} ${request.url}`)

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: CORS_HEADERS,
            });
        }

        const reqUrl = new URL(request.url);
        const targetUrl = reqUrl.searchParams.get("url");

        if (!targetUrl) {
            return new Response("Missing 'url' query parameter", {status: 400});
        }

        const headers = new Headers(request.headers);
        headers.delete("Origin");

        const proxyRequest = new Request(targetUrl, {
            method: request.method,
            headers,
            body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
            redirect: "follow",
        });

        const response = await fetch(proxyRequest);
        const newHeaders = new Headers(response.headers);

        for (const [key, value] of Object.entries(CORS_HEADERS)) {
            newHeaders.set(key, value);
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    },
};
