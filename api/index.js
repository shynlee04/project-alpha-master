import entry from '../dist/server/server.js';

export default async function handler(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const webReq = new Request(url, {
            method: req.method,
            headers: req.headers,
            // @ts-ignore - streams are compatible
            body: req.method === 'GET' || req.method === 'HEAD' ? null : req,
            duplex: 'half'
        });

        const webRes = await entry.fetch(webReq);

        res.status(webRes.status);
        webRes.headers.forEach((value, key) => res.setHeader(key, value));

        if (webRes.body) {
            const reader = webRes.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
        }
        res.end();
    } catch (error) {
        console.error('Vercel Adapter Error:', error);
        res.status(500).send('Internal Server Error');
    }
}
