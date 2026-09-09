const zlib = require('zlib');

const payload =
  require('../payload/part01') +
  require('../payload/part02') +
  require('../payload/part03') +
  require('../payload/part04');

let cachedHtml = null;

function upgradeTo294(html) {
  const css = `.calsubrow{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:6px 0}.calsubrow a,.calsubrow button{min-height:32px;border:1px solid #38505d;border-radius:5px;background:#071017;color:#eef2f4;font-size:.4rem;font-weight:850;text-decoration:none;display:grid;place-items:center;padding:6px}.calsubrow .feed{border-color:#23a96d}.calsubrow .sub{border-color:#ff3941;background:#2c090c}.calfeednote{min-height:13px;text-align:center;font-size:.32rem;color:#8f9ba2;margin:2px 0 5px}.calfeednote.ok{color:#23ed83}`;
  const js = `
function agendaFeedUrl(){return location.origin+'/api/agenda.ics'}
async function subscribeAgenda(){let u=agendaFeedUrl(),n=$('#calFeedNote');try{if(location.hostname.endsWith('.vercel.app')){if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(u);if(n){n.textContent='PREVIEW: ENLACE DE SUSCRIPCIÓN COPIADO · SE ACTIVARÁ DIRECTO AL PUBLICAR';n.classList.add('ok')}}else{location.href=u}return}location.href='webcal://'+location.host+'/api/agenda.ics'}catch(e){if(n)n.textContent='USÁ “DESCARGAR AGENDA” O COPIÁ: '+u}}
const calendarView293=calendarView;
calendarView=function(mode){calendarView293(mode);let cp=$('.calpanel'),notice=cp&&cp.querySelector('.calnotice');if(notice&&!$('#calSub')){notice.insertAdjacentHTML('beforebegin','<div class="calsubrow"><a class="feed" href="/api/agenda.ics" download="HHV-Agenda-CultuRap.ics">DESCARGAR AGENDA HHV</a><button class="sub" id="calSub">SUSCRIBIR AGENDA</button></div><div id="calFeedNote" class="calfeednote">FEED DINÁMICO · ACTUALIZACIÓN DESDE SUPABASE</div>');let sub=$('#calSub');if(sub)sub.onclick=subscribeAgenda}}
`;
  return html
    .replace(/v2\.9\.3/g, 'v2.9.4')
    .replace('</style>', css + '</style>')
    .replace('load();\n</script>', js + 'load();\n</script>');
}

function getHtml() {
  if (!cachedHtml) {
    const raw = zlib
      .brotliDecompressSync(Buffer.from(payload, 'base64'))
      .toString('utf8');
    cachedHtml = upgradeTo294(raw);
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
    res.setHeader('X-HHV-Version', '2.9.4-preview');
    return res.end(html);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('HHV v2.9.4 render error');
  }
};
