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

    if (!html.includes(oldFns)) throw new Error('HHV v2.9.7 patch target not found');
    html = html.replace(oldFns, newFns);
    html = html.replace('ORIGINAL IG · AGENDA LIVE ICS', 'DRIVE LINKS ONLY · IG ORIGINAL · DRIVE FALLBACK · AGENDA LIVE ICS');

    const railCss = `
/* v2.9.7 — DRIVE-SOURCED INSTAGRAM FLYER RAIL */
.flyerSideHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.flyerSideHead h3{margin:0!important}.flyerSideHead span{font:800 .34rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#23ed83;border:1px solid #245b43;border-radius:999px;padding:3px 6px;background:#06140e}.flyerSideList{display:grid;gap:6px;max-height:590px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding-right:2px}.flyerRailCard{width:100%;display:grid;grid-template-columns:64px minmax(0,1fr);gap:7px;align-items:center;border:1px solid #29363e;border-radius:7px;background:linear-gradient(145deg,#0d1418,#05080a);padding:5px;color:inherit;transition:border-color .12s,box-shadow .12s}.flyerRailCard:hover,.flyerRailCard:focus-within{border-color:#704047;box-shadow:0 0 14px #ff2c351d}.flyerRailImg{width:64px;height:86px;display:grid;place-items:center;border:1px solid #33414a;border-radius:5px;background:#020304;overflow:hidden;text-decoration:none;cursor:pointer}.flyerRailImg img{width:100%;height:100%;display:block;object-fit:contain;object-position:center;background:#020304}.flyerRailImg i{font-style:normal;font-size:.3rem;color:#78848c}.flyerRailCopy{min-width:0}.flyerRailCopy b{display:block;font-size:.46rem;line-height:1.2;max-height:2.4em;overflow:hidden}.flyerRailCopy small{display:block;font-size:.34rem;color:#8f9aa2;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.flyerRailBadge{display:inline-block;margin-top:5px;padding:2px 4px;border-radius:3px;border:1px solid #743239;color:#ff858b;font:800 .28rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em}.flyerRailActions{display:flex;gap:4px;margin-top:5px}.flyerRailActions button,.flyerRailActions a{min-height:24px;padding:4px 6px;border:1px solid #354149;border-radius:4px;background:#080c0f;color:#eef2f4;text-decoration:none;font-size:.29rem;font-weight:850;display:inline-grid;place-items:center;cursor:pointer}.flyerRailActions .flyerRailOpen{border-color:#733139;color:#ff9297}.flyerRailActions .flyerRailZoom{border-color:#315d48;color:#72efad}.mobileFlyerRail{display:none}.mobileFlyerRailHead{display:flex;justify-content:space-between;align-items:center;margin:9px 2px 5px}.mobileFlyerRailHead b{font-size:.48rem;letter-spacing:.05em}.mobileFlyerRailHead span{font-size:.34rem;color:#23ed83}.mobileFlyerTrack{display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;padding:1px 1px 6px;scrollbar-width:none}.mobileFlyerTrack::-webkit-scrollbar{display:none}.mobileFlyerTrack .flyerRailCard{flex:0 0 142px;display:block;scroll-snap-align:start;padding:5px}.mobileFlyerTrack .flyerRailImg{width:100%;height:174px}.mobileFlyerTrack .flyerRailCopy{padding:5px 2px 1px}.mobileFlyerTrack .flyerRailCopy b{font-size:.42rem}.mobileFlyerTrack .flyerRailCopy small{font-size:.32rem}.mobileFlyerTrack .flyerRailActions{display:grid;grid-template-columns:1fr}.fm .origlink{display:inline-grid;place-items:center;margin-top:8px;min-height:30px;padding:5px 9px;border:1px solid #7a3038;border-radius:5px;background:#26080b;color:#fff;text-decoration:none;font-size:.46rem;font-weight:900}.fanCard.main img.linkedFlyer{cursor:pointer}
@media(max-width:760px){.mobileFlyerRail{display:block}.flyerSideList{max-height:none}.mobileFlyerTrack .flyerRailBadge{font-size:.27rem}}
`;
    html = html.replace('</style>', railCss + '</style>');

    const sideRail = '<div class="sidec"><div class="flyerSideHead"><h3>FLYERS ACTUALIZADOS</h3><span id="flyerSideCount">0</span></div><div id="flyerSide" class="flyerSideList"></div></div>';
    html = html.replace('<div class="sidec"><h3>MOTOR</h3>', sideRail + '<div class="sidec"><h3>MOTOR</h3>');
    html = html.replace('<section class="strip">', '<section id="mobileFlyerRail" class="mobileFlyerRail"></section><section class="strip">');

    const oldUpdateFan = "function updateFan(){let e=fanEvent(0);if(!e)return;setFanImg('#fimg',e);setFanImg('#fprev',fanEvent(-1));setFanImg('#fnext',fanEvent(1));$('#fm').innerHTML='<b>'+esc(e.name)+'</b>'+esc([e.date,e.venue||e.city,e.province].filter(Boolean).join(' · '));let m=$('#fmain');if(m){m.classList.remove('bump');requestAnimationFrame(()=>m.classList.add('bump'));setTimeout(()=>m.classList.remove('bump'),180)}}";
    const newUpdateFan = "function updateFan(){let e=fanEvent(0);if(!e)return;setFanImg('#fimg',e);setFanImg('#fprev',fanEvent(-1));setFanImg('#fnext',fanEvent(1));let src=http(e.source_url),orig=igSource(src)?'<a class=\\\"origlink\\\" target=\\\"_blank\\\" rel=\\\"noopener\\\" href=\\\"'+esc(src)+'\\\">PUBLICACIÓN ORIGINAL EN INSTAGRAM ↗</a>':'';$('#fm').innerHTML='<b>'+esc(e.name)+'</b>'+esc([e.date,e.venue||e.city,e.province].filter(Boolean).join(' · '))+orig;let f=$('#fimg');if(f){f.classList.toggle('linkedFlyer',igSource(src));f.onclick=igSource(src)?()=>window.open(src,'_blank','noopener'):null}let m=$('#fmain');if(m){m.classList.remove('bump');requestAnimationFrame(()=>m.classList.add('bump'));setTimeout(()=>m.classList.remove('bump'),180)}}";
    if (!html.includes(oldUpdateFan)) throw new Error('HHV v2.9.7 fan patch target not found');
    html = html.replace(oldUpdateFan, newUpdateFan);

    const railFns = `function flyerRailRows(){let today=ymd(new Date()),all=E.filter(e=>igSource(e.source_url)&&img(e)),future=all.filter(e=>String(e.date||'').slice(0,10)>=today);return (future.length?future:all).slice(0,30)}function flyerRailCard(e,i,scope){let im=img(e),src=http(e.source_url);return '<article class="flyerRailCard"><a class="flyerRailImg" target="_blank" rel="noopener" href="'+esc(src)+'" aria-label="Abrir publicación original de '+esc(e.name)+'">'+(im?'<img loading="eager" referrerpolicy="no-referrer" src="'+esc(im)+'" alt="'+esc(e.flyer_alt||e.name)+'" onerror="this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'grid\\'"><i style="display:none">FLYER</i>':'<i>FLYER</i>')+'</a><div class="flyerRailCopy"><b>'+esc(e.name)+'</b><small>'+esc([e.date,e.venue||e.city].filter(Boolean).join(' · '))+'</small><em class="flyerRailBadge">LINK DE DRIVE · IG</em><div class="flyerRailActions"><button class="flyerRailZoom" data-railzoom="'+esc(scope+'|'+i)+'">AMPLIAR</button><a class="flyerRailOpen" target="_blank" rel="noopener" href="'+esc(src)+'">INSTAGRAM ↗</a></div></div></article>'}function bindFlyerRail(rows){$$('[data-railzoom]').forEach(x=>x.onclick=()=>{let parts=String(x.dataset.railzoom||'').split('|'),i=Number(parts[1]),e=rows[i];if(!e)return;S=rows;fi=i;focus(e.id)})}function renderFlyerRail(){let rows=flyerRailRows(),side=$('#flyerSide'),count=$('#flyerSideCount'),mob=$('#mobileFlyerRail');if(count)count.textContent=rows.length+' LINK';if(side)side.innerHTML=rows.map((e,i)=>flyerRailCard(e,i,'s')).join('');if(mob)mob.innerHTML='<div class="mobileFlyerRailHead"><b>FLYERS · LINKS DE DRIVE</b><span>'+rows.length+' · DESLIZÁ ↔</span></div><div class="mobileFlyerTrack">'+rows.map((e,i)=>flyerRailCard(e,i,'m')).join('')+'</div>';bindFlyerRail(rows)}\n`;
    html = html.replace('function assistantView(){', railFns + 'function assistantView(){');
    html = html.split('renderUpcoming();').join('renderUpcoming();renderFlyerRail();');

    html = html.replace('<title>HHV · Samplera v2.9.4 Preview</title>', '<title>HHV · Samplera v2.9.7 Preview · Drive Links</title>');
    html = html.replace('SAMPLERA HHV <em>v2.9.5</em>', 'SAMPLERA HHV <em>v2.9.7 PREVIEW</em>');
    cachedHtml = html;
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
    res.setHeader('X-HHV-Version', '2.9.7-preview-drive-links');
    return res.end(html);
  } catch (error) {
    console.error('HHV v2.9.7 render error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('HHV v2.9.7 render error');
  }
};
