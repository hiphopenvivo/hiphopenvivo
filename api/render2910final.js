const render2910 = require('./render2910');

module.exports = function handler(req, res) {
  let statusCode = 200;
  const headers = {};
  let body = '';
  const capture = {
    get statusCode(){ return statusCode; },
    set statusCode(v){ statusCode = v; },
    setHeader(k,v){ headers[String(k).toLowerCase()] = v; },
    end(chunk){ body = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || ''); return body; }
  };
  try {
    render2910(req, capture);
    if (statusCode === 200 && body.includes('</head>')) {
      body = body.replace('SAMPLERA HHV <em>v2.9.7 PREVIEW</em>', 'SAMPLERA HHV <em>v2.9.10 PREVIEW</em>');
      body = body.replace('</head>', `<style id="hhv-v2910-final-css">
/* Las vistas elegidas por el usuario pueden ocupar la pantalla; PADS/RADIO restauran flyers desde render2910. */
html[data-hhv-mode="pads"] #panel.on{display:block!important}
html[data-hhv-mode="pads"] #track.off{display:none!important}
</style></head>`);
    }
    res.statusCode = statusCode;
    for (const [k,v] of Object.entries(headers)) res.setHeader(k,v);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-HHV-Version','2.9.10-flyers-radio-distinct-banks-final');
    return res.end(body);
  } catch (err) {
    console.error('HHV v2.9.10 final wrapper error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag','noindex');
    return res.end('HHV v2.9.10 final wrapper error');
  }
};
