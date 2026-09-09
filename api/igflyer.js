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

function cleanDriveId(raw) {
  const id = String(raw || '').trim();
  return /^[A-Za-z0-9_-]{10,}$/.test(id) ? id : '';
}

function decodeHtml(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function cleanText(s, max = 1200) {
  return decodeHtml(String(s || ''))
    .replace(/\\u0026/g, '&')
    .replace(/\\n/g, ' ')
    .replace(/\\\//g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function metaValue(html, key, attr = 'property') {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const a = new RegExp(`<meta[^>]+${attr}=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i');
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${escaped}["']`, 'i');
  const m = html.match(a) || html.match(b);
  return m ? cleanText(m[1]) : '';
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
      'User-Agent': 'Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36 HHV/2.9.7',
      'Accept': accept,
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.7'
    }
  });
}

async function readPostPage(info) {
  try {
    const page = await fetchWithUA(info.canonical, 'text/html,application/xhtml+xml');
    if (!page.ok) return null;
    const html = await page.text();
    const title = metaValue(html, 'og:title');
    const description = metaValue(html, 'og:description') || metaValue(html, 'description', 'name');
    const imageRaw = metaValue(html, 'og:image');
    let username = '';
    const usernameMatch = html.match(/"username"\s*:\s*"([^"]+)"/i);
    if (usernameMatch) username = cleanText(usernameMatch[1], 120);
    return {
      html,
      meta: {
        title,
        description,
        username,
        image_url: safeImageUrl(imageRaw)
      }
    };
  } catch (_) {
    return null;
  }
}

async function resolveOriginal(info, pageData = null) {
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

  const page = pageData || await readPostPage(info);
  if (page && page.meta && page.meta.image_url) {
    try {
      const direct = page.meta.image_url;
      const r = await fetchWithUA(direct, 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8');
      const type = (r.headers.get('content-type') || '').toLowerCase();
      if (r.ok && type.startsWith('image/')) return { response: r, imageUrl: direct, method: 'og' };
    } catch (_) {}
  }

  if (page && page.html) {
    const m = page.html.match(/"display_url"\s*:\s*"([^"]+)"/i);
    if (m) {
      const direct = safeImageUrl(m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/'));
      if (direct) {
        try {
          const r = await fetchWithUA(direct, 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8');
          const type = (r.headers.get('content-type') || '').toLowerCase();
          if (r.ok && type.startsWith('image/')) return { response: r, imageUrl: direct, method: 'json' };
        } catch (_) {}
      }
    }
  }

  return null;
}

async function resolveDriveFallback(id) {
  const clean = cleanDriveId(id);
  if (!clean) return null;
  const candidates = [
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(clean)}`,
    `https://drive.usercontent.google.com/download?id=${encodeURIComponent(clean)}&export=view&confirm=t`,
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(clean)}&sz=w2000`
  ];
  for (const url of candidates) {
    try {
      const r = await fetchWithUA(url, 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8');
      const type = (r.headers.get('content-type') || '').toLowerCase();
      if (r.ok && type.startsWith('image/')) return { response: r, imageUrl: r.url, method: 'drive-fallback' };
    } catch (_) {}
  }
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
    const wantsMeta = String(req.query && req.query.meta || '') === '1';
    const pageData = wantsMeta ? await readPostPage(info) : null;
    let found = await resolveOriginal(info, pageData);
    if (!found) found = await resolveDriveFallback(req.query && req.query.fallbackId);

    if (wantsMeta) {
      res.statusCode = found || pageData ? 200 : 404;
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({
        ok: Boolean(found || pageData),
        code: info.code,
        canonical: info.canonical,
        title: pageData?.meta?.title || '',
        description: pageData?.meta?.description || '',
        username: pageData?.meta?.username || '',
        image_url: found?.imageUrl || pageData?.meta?.image_url || '',
        method: found?.method || (pageData ? 'page-meta' : '')
      }));
    }

    if (!found) {
      res.statusCode = 404;
      res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ ok: false, code: info.code, error: 'original_not_resolved' }));
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
    res.setHeader('X-HHV-Flyer-Source', found.method.startsWith('drive') ? 'drive-fallback' : `instagram-${found.method}`);
    return res.end(body);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, code: info.code, error: 'instagram_fetch_failed' }));
  }
};
