const zlib = require('zlib');

const payload =
  require('../payload/part01') +
  require('../payload/part02') +
  require('../payload/part03') +
  require('../payload/part04');

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
    res.setHeader('X-HHV-Version', '2.9.3-preview');
    return res.end(html);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('HHV v2.9.3 render error');
  }
};
