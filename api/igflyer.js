const ALLOWED_IMAGE_HOST = /(^|\.)((cdninstagram|fbcdn)\.net|instagram\.com)$/i;

function cleanInstagramUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim());
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    if (!m) return null;
    return { kind: m[1].toLowerCase(), code: m[2], canonical: `https://www.instagram.com/${m[1]}/${m[2]}/` };
  } catch (_) {
    return null;
  }
}

function decodeHtml(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function safeImageUrl(raw) {
  try {
    const u = new URL(decodeHtml(raw));
    return ALLOWED_IMAGE_HOST.test(u.hostname) ? u.toString() : '';
  } catch (_) {
    return '';
  }
}

async function fetchWithUA(url, accept = '*/*') {
  return fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36 HHV/2.9.5',
      'Accept': accept,
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.7'
    }
  });
}

async function resolveOriginal(info) {
  const mediaCandidates = [
    `https://www.instagram.com/${info.kind}/${info.code}/media/?size=l`,
    `https://www.instagram.com/p/${info.code}/media/?size=l`
  ];

  for (const url of mediaCandidates) {
    try {
      const r = await fetchWithUA(url, 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
      const type = (r.headers.get('content-type') || '').toLowerCase();
      if (r.ok && type.startsWith('image/')) {
        return { response: r, imageUrl: r.url, method: 'media' };
      }
    } catch (_) {}
  }

  try {
    const page = await fetchWithUA(info.canonical, 'text/html,application/xhtml+xml');
    if (page.ok) {
      const html = await page.text();
      const patterns = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
        /"display_url"\s*:\s*"([^"]+)"/i
      ];
      let direct = '';
      for (const re of patterns) {
        const m = html.match(re);
        if (m) {
          direct = safeImageUrl(m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/'));
          if (direct) break;
        }
      }
      if (direct) {
        const r = await fetchWithUA(direct, 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8');
        const type = (r.headers.get('content-type') || '').toLowerCase();
        if (r.ok && type.startsWith('image/')) return { response: r, imageUrl: direct, method: 'og' };
      }
    }
  } catch (_) {}

  return null;
}

module.exports = async function handler(req, res) {
  const info = cleanInstagramUrl(req.query && req.query.url);
  if (!info) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, error: 'invalid_instagram_url' }));
  }

  try {
    const found = await resolveOriginal(info);
    if (!found) {
      res.statusCode = 404;
      res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ ok: false, code: info.code, error: 'original_not_resolved' }));
    }

    if (String(req.query && req.query.meta || '') === '1') {
      res.statusCode = 200;
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ ok: true, code: info.code, canonical: info.canonical, image_url: found.imageUrl, method: found.method }));
    }

    const r = found.response;
    const type = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
    const body = Buffer.from(await r.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', String(body.length));
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-HHV-Flyer-Source', `instagram-${found.method}`);
    return res.end(body);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, code: info.code, error: 'instagram_fetch_failed' }));
  }
};
