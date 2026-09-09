const zlib = require('zlib');

const payload =
  require('../payload295/part01_1') +
  require('../payload295/part01_2') +
  require('../payload295/part01_3') +
  require('../payload295/part02_1') +
  require('../payload295/part02_2') +
  require('../payload295/part02_3') +
  require('../payload295/part03_1') +
  require('../payload295/part03_2') +
  require('../payload295/part03_3') +
  require('../payload295/part04_1') +
  require('../payload295/part04_2') +
  require('../payload295/part04_3');

let cachedHtml = null;

function getHtml() {
  if (!cachedHtml) {
    let html = zlib
      .brotliDecompressSync(Buffer.from(payload, 'base64'))
      .toString('utf8');

    const oldFns = "function img(e){let u=F[e.id]||e.flyer_url||'',id=driveId(u);if(id)return '/api/flyer?id='+encodeURIComponent(id);if(u)return u;let src=http(e.source_url);return igSource(src)?('/api/igflyer?url='+encodeURIComponent(src)):''}function sourceKind(e){let u=F[e.id]||e.flyer_url||'';return driveId(u)?'drive':igSource(e.source_url)?'ig':''}";
    const newFns = "function img(e){let src=http(e.source_url),u=F[e.id]||e.flyer_url||'',id=driveId(u);if(igSource(src))return '/api/igflyer?url='+encodeURIComponent(src)+(id?'&fallbackId='+encodeURIComponent(id):'');if(id)return '/api/flyer?id='+encodeURIComponent(id);if(u)return u;return''}function sourceKind(e){let src=http(e.source_url),u=F[e.id]||e.flyer_url||'';if(igSource(src))return'ig';return driveId(u)?'drive':u?'web':''}";

    if (!html.includes(oldFns)) throw new Error('HHV public patch target not found');
    html = html.replace(oldFns, newFns);
    html = html.replace('ORIGINAL IG · AGENDA LIVE ICS', 'IG ORIGINAL PRIORITARIO · DRIVE FALLBACK · AGENDA LIVE ICS');
    html = html.replace(
      '<title>HHV · Samplera v2.9.4 Preview</title>',
      '<title>HHV · Hip Hop en Vivo — Agenda CultuRap</title><meta name="description" content="Hip Hop en Vivo: Agenda CultuRap, eventos, radio y Samplera HHV en Argentina."><meta property="og:type" content="website"><meta property="og:title" content="HHV · Hip Hop en Vivo — Agenda CultuRap"><meta property="og:description" content="Agenda de cultura Hip Hop, eventos, radio y Samplera HHV en Argentina."><meta property="og:url" content="https://agenda-culturap-hhv.vercel.app/"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="HHV · Hip Hop en Vivo — Agenda CultuRap"><meta name="twitter:description" content="Agenda de cultura Hip Hop, eventos, radio y Samplera HHV en Argentina.">'
    );
    cachedHtml = html;
  }
  return cachedHtml;
}

module.exports = function handler(req, res) {
  try {
    const html = getHtml();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('X-HHV-Version', '2.9.6-public');
    return res.end(html);
  } catch (error) {
    console.error('HHV public render error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('HHV public render error');
  }
};
