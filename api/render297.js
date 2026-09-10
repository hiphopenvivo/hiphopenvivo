const render295 = require('./render295');

module.exports = function handler(req, res) {
  let statusCode = 200;
  const headers = {};
  let body = '';

  const capture = {
    get statusCode() { return statusCode; },
    set statusCode(value) { statusCode = value; },
    setHeader(name, value) { headers[String(name).toLowerCase()] = value; },
    end(chunk) {
      body = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || '');
      return body;
    }
  };

  try {
    render295(req, capture);

    if (statusCode === 200 && body.includes('</body>')) {
      const igFirstFns = "function img(e){let src=http(e.source_url),u=F[e.id]||e.flyer_url||'',id=driveId(u);if(igSource(src))return '/api/igflyer?url='+encodeURIComponent(src)+(id?'&fallbackId='+encodeURIComponent(id):'');if(id)return '/api/flyer?id='+encodeURIComponent(id);if(u)return u;return''}function sourceKind(e){let src=http(e.source_url),u=F[e.id]||e.flyer_url||'';if(igSource(src))return'ig';return driveId(u)?'drive':u?'web':''}";
      const driveFirstFns = "function img(e){let u=F[e.id]||e.flyer_url||'',id=driveId(u);if(id)return '/api/flyer?id='+encodeURIComponent(id);if(u)return u;let src=http(e.source_url);return igSource(src)?('/api/igflyer?url='+encodeURIComponent(src)):''}function sourceKind(e){let u=F[e.id]||e.flyer_url||'';if(driveId(u)||u)return'drive';let src=http(e.source_url);return igSource(src)?'ig':''}";
      if (body.includes(igFirstFns)) body = body.replace(igFirstFns, driveFirstFns);

      const defaultRailRows = "function flyerRailRows(){let today=ymd(new Date()),all=E.filter(e=>igSource(e.source_url)&&img(e)),future=all.filter(e=>String(e.date||'').slice(0,10)>=today);return (future.length?future:all).slice(0,30)}";
      const pinnedRailRows = "function flyerRailRows(){let today=ymd(new Date()),all=E.filter(e=>igSource(e.source_url)&&img(e)),future=all.filter(e=>String(e.date||'').slice(0,10)>=today),rows=(future.length?future:all).slice();let pin='rxnde-akozta-la-plata-2026-09-24';rows.sort((a,b)=>a.id===pin?-1:b.id===pin?1:String(a.date||'').localeCompare(String(b.date||'')));return rows.slice(0,30)}";
      if (body.includes(defaultRailRows)) body = body.replace(defaultRailRows, pinnedRailRows);

      const drawerCss = `
<style id="hhv-flyer-drawer-css">
#hhvFlyerToggle{position:fixed;right:0;top:46%;z-index:10002;border:1px solid #8d303a;border-right:0;background:#14080a;color:#fff;padding:11px 7px;border-radius:8px 0 0 8px;font:900 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;writing-mode:vertical-rl;cursor:pointer;box-shadow:0 0 18px #0009}
#hhvFlyerDrawer{position:fixed;right:12px;top:76px;bottom:14px;width:min(330px,88vw);z-index:10001;background:linear-gradient(180deg,#0c1115,#050709);border:1px solid #37444c;border-radius:12px;box-shadow:0 18px 50px #000c;overflow:auto;padding:10px;color:#f5f7f8}
#hhvFlyerDrawer .hhvfd-head{display:flex;align-items:center;justify-content:space-between;gap:8px;position:sticky;top:-10px;background:#0c1115;padding:10px 2px 8px;z-index:2}
#hhvFlyerDrawer .hhvfd-head b{font:900 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
#hhvFlyerDrawer .hhvfd-close{border:1px solid #39454d;background:#090d10;color:#fff;border-radius:6px;padding:5px 8px;cursor:pointer}
#hhvFlyerDrawer .hhvfd-image{display:block;width:100%;aspect-ratio:4/5;background:#020304;border:1px solid #38464f;border-radius:9px;overflow:hidden;text-decoration:none}
#hhvFlyerDrawer .hhvfd-image img{width:100%;height:100%;display:block;object-fit:contain;object-position:center;background:#020304}
#hhvFlyerDrawer .hhvfd-body{padding:10px 2px 2px}
#hhvFlyerDrawer h2{margin:0 0 8px;font-size:18px;line-height:1.05}
#hhvFlyerDrawer .hhvfd-meta{display:grid;gap:5px;font-size:12px;line-height:1.35;color:#c8d0d5}
#hhvFlyerDrawer .hhvfd-meta strong{color:#fff}
#hhvFlyerDrawer .hhvfd-lineup{margin-top:9px;padding:8px;border:1px solid #29353d;border-radius:7px;background:#080c0f;font-size:11px;line-height:1.4}
#hhvFlyerDrawer .hhvfd-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}
#hhvFlyerDrawer .hhvfd-actions button,#hhvFlyerDrawer .hhvfd-actions a{min-height:38px;border:1px solid #3b4952;border-radius:6px;background:#090d10;color:#fff;text-decoration:none;display:grid;place-items:center;font-size:10px;font-weight:900;cursor:pointer}
#hhvFlyerDrawer .hhvfd-actions .hhvfd-zoom{border-color:#2e7453;color:#78efb2}
#hhvFlyerDrawer .hhvfd-actions .hhvfd-ig{border-color:#7e3038;color:#ff9aa0}
#hhvFlyerDrawer .hhvfd-note{margin-top:8px;font-size:9px;line-height:1.35;color:#8e9aa2}
#hhvFlyerModal{position:fixed;inset:0;z-index:10005;background:#000e;display:none;align-items:center;justify-content:center;padding:18px}
#hhvFlyerModal.open{display:flex}
#hhvFlyerModal .hhvfm-card{width:min(760px,96vw);max-height:94vh;overflow:auto;background:#090d10;border:1px solid #41515c;border-radius:12px;padding:10px;box-shadow:0 20px 70px #000}
#hhvFlyerModal .hhvfm-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#fff}
#hhvFlyerModal img{width:100%;max-height:78vh;object-fit:contain;display:block;background:#020304;border-radius:8px}
#hhvFlyerModal .hhvfm-close{border:1px solid #45535d;background:#11181d;color:#fff;border-radius:6px;padding:6px 9px;cursor:pointer}
@media(max-width:760px){#hhvFlyerDrawer{right:8px;top:58px;width:min(320px,90vw);transform:translateX(calc(100% + 22px));transition:transform .18s ease}#hhvFlyerDrawer.open{transform:translateX(0)}#hhvFlyerDrawer .hhvfd-image{aspect-ratio:4/5}#hhvFlyerToggle{display:block}}
@media(min-width:761px){#hhvFlyerToggle{display:none}}
</style>`;

      const ig = 'https://www.instagram.com/p/DcCYm5EGLaV/';
      const driveImg = '/api/flyer?id=1TOhdGtQWmD2l3aOu5mFExTBZTycHIDur';
      const igFallback = '/api/igflyer?url=' + encodeURIComponent(ig);
      const drawerHtml = `
<button id="hhvFlyerToggle" type="button" aria-label="Abrir flyers">FLYERS</button>
<aside id="hhvFlyerDrawer" aria-label="Flyer y datos del evento RXNDE Akozta">
  <div class="hhvfd-head"><b>FLYER / EVENTO</b><button class="hhvfd-close" id="hhvFlyerClose" type="button">✕</button></div>
  <a class="hhvfd-image" href="${ig}" target="_blank" rel="noopener" title="Abrir publicación original en Instagram">
    <img id="hhvRxndeImg" src="${driveImg}" alt="Flyer RXNDE AKOZTA EN LA PLATA" data-fallback="${igFallback}">
  </a>
  <div class="hhvfd-body">
    <h2>RXNDE AKOZTA EN LA PLATA</h2>
    <div class="hhvfd-meta">
      <div>📅 <strong>24 de septiembre de 2026</strong></div>
      <div>🕗 <strong>20:00</strong></div>
      <div>📍 <strong>Ciudad de Gatos</strong> · Calle 17 y 71 · La Plata</div>
      <div>🎟️ <strong>Entradas por Catpass</strong> · precio no informado en el flyer</div>
      <div>🎤 <strong>RXNDE Akozta + DJ Destroy Arms</strong></div>
    </div>
    <div class="hhvfd-lineup"><strong>Invitados:</strong> REI ALL’A · Pol Zuco & DJ Perro · Bera No Duerme · Alessvndra<br><strong>DJ sets:</strong> Lombo Set · Santouno<br><strong>Expo feria:</strong> La Plata Sport</div>
    <div class="hhvfd-actions"><button class="hhvfd-zoom" id="hhvFlyerZoom" type="button">AMPLIAR</button><a class="hhvfd-ig" href="${ig}" target="_blank" rel="noopener">INSTAGRAM ORIGINAL ↗</a></div>
    <div class="hhvfd-note">Imagen completa, sin recorte. La publicación de Instagram se conserva como fuente y atribución del flyer.</div>
  </div>
</aside>
<div id="hhvFlyerModal" role="dialog" aria-modal="true" aria-label="Flyer ampliado RXNDE Akozta"><div class="hhvfm-card"><div class="hhvfm-top"><b>RXNDE AKOZTA · 24/09 · LA PLATA</b><button id="hhvFlyerModalClose" class="hhvfm-close" type="button">CERRAR ✕</button></div><a href="${ig}" target="_blank" rel="noopener"><img id="hhvRxndeModalImg" src="${driveImg}" alt="Flyer ampliado RXNDE AKOZTA EN LA PLATA"></a></div></div>`;

      const recovery = `
<script>
(function HHVFlyerRailRecovery(){
  var main=document.getElementById('hhvRxndeImg');
  var modalImg=document.getElementById('hhvRxndeModalImg');
  if(main){main.onerror=function(){if(this.dataset.fallback&&this.src.indexOf('/api/igflyer')<0){this.src=this.dataset.fallback; if(modalImg) modalImg.src=this.dataset.fallback;}}}
  var drawer=document.getElementById('hhvFlyerDrawer');
  var toggle=document.getElementById('hhvFlyerToggle');
  var close=document.getElementById('hhvFlyerClose');
  var modal=document.getElementById('hhvFlyerModal');
  var zoom=document.getElementById('hhvFlyerZoom');
  var modalClose=document.getElementById('hhvFlyerModalClose');
  if(toggle)toggle.onclick=function(){drawer&&drawer.classList.toggle('open')};
  if(close)close.onclick=function(){drawer&&drawer.classList.remove('open')};
  if(zoom)zoom.onclick=function(){modal&&modal.classList.add('open')};
  if(modalClose)modalClose.onclick=function(){modal&&modal.classList.remove('open')};
  if(modal)modal.onclick=function(e){if(e.target===modal)modal.classList.remove('open')};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal)modal.classList.remove('open')});

  var tries=0;
  var timer=setInterval(function(){
    tries++;
    try{
      if(typeof renderFlyerRail==='function'){
        renderFlyerRail();
        var side=document.getElementById('flyerSide');
        var mobile=document.getElementById('mobileFlyerRail');
        var count=side?side.querySelectorAll('.flyerRailCard').length:0;
        if(!count&&mobile) count=mobile.querySelectorAll('.flyerRailCard').length;
        if(count>0||tries>=40){
          clearInterval(timer);
          document.documentElement.setAttribute('data-hhv-flyer-rail',count>0?'ready':'empty');
          document.documentElement.setAttribute('data-hhv-doc-feature','rxnde-akozta-la-plata-2026-09-24');
        }
      }
    }catch(err){
      if(tries>=40){clearInterval(timer);document.documentElement.setAttribute('data-hhv-flyer-rail','error');}
    }
  },500);
})();
</script>`;

      body = body.replace('</head>', drawerCss + '</head>');
      body = body.replace('</body>', drawerHtml + recovery + '</body>');
    }

    res.statusCode = statusCode;
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-HHV-Version', '2.9.7-preview-vertical-flyer-drawer');
    return res.end(body);
  } catch (error) {
    console.error('HHV render297 wrapper error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end('HHV render297 wrapper error');
  }
};
