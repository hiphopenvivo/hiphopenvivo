module.exports = async function handler(req, res) {
  try {
    const id = String((req.query && req.query.id) || '').trim();
    if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Missing or invalid flyer id');
    }

    const candidates = [
      `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`,
      `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=view&confirm=t`,
      `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2000`
    ];

    let lastStatus = 502;
    for (const url of candidates) {
      const r = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 HHV-Flyer-Proxy/2.9.2' }
      });
      lastStatus = r.status;
      const type = (r.headers.get('content-type') || '').toLowerCase();
      if (r.ok && type.startsWith('image/')) {
        const body = Buffer.from(await r.arrayBuffer());
        res.statusCode = 200;
        res.setHeader('Content-Type', type.split(';')[0]);
        res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.end(body);
      }
    }

    res.statusCode = lastStatus || 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Flyer unavailable');
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Flyer proxy error');
  }
};
