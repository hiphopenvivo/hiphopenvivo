const zlib = require('zlib');

const payload =
  require('../payload295/part01') +
  require('../payload295/part02') +
  require('../payload295/part03') +
  require('../payload295/part04');

let cachedHtml = null;

function getHtml() {
  if (!cachedHtml) {
    cachedHtml = zlib
      .brotliDecompressSync(Buffer.from(payload, 'base64'))
      .toString('utf8');
  }
  return cachedHtml;
}

module.exports = function handler(req, res) {
  try {
    const html = getHtml();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-HHV-Version', '2.9.5-preview');
    return res.end(html);
  } catch (error) {
    console.error('HHV v2.9.5 render error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('HHV v2.9.5 render error');
  }
};
