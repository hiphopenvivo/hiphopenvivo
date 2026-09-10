const render298 = require('./render298');

module.exports = function handler(req, res) {
  let statusCode = 200;
  const headers = {};
  let body = '';
  const capture = {
    get statusCode() { return statusCode; },
    set statusCode(v) { statusCode = v; },
    setHeader(k, v) { headers[String(k).toLowerCase()] = v; },
    end(chunk) { body = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || ''); return body; }
  };

  try {
    render298(req, capture);
    if (statusCode === 200 && body.includes('</body>')) {
      const css = `
<style id="hhv-v2910-css">
/* v2.9.10: la pantalla digital vuelve a ser flyer-first. Los controles de modo dejan de flotar. */
#hhvModeDock,#hhvHQBankDock{display:none!important}
.screen #hhv2910ControlBar{margin-top:6px;border:1px solid #28343c;border-radius:6px;background:linear-gradient(180deg,#091015,#05080a);padding:6px;display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;gap:5px;align-items:center}
#hhv2910ControlBar button,#hhv2910ControlBar select{height:31px;border:1px solid #35424a;border-radius:5px;background:#080c0f;color:#eef2f4;font:800 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
#hhv2910ControlBar button{padding:0 10px;cursor:pointer}#hhv2910ControlBar select{min-width:0;padding:0 7px}
#hhv2910ControlBar button.active{border-color:#ff3941;background:#2a090c;box-shadow:0 0 10px #ff2c3530}
#hhv2910ControlBar #hhv2910RadioPlay.on{border-color:#2d7653;color:#7df1b7;background:#07170f}
#hhv2910Status{grid-column:1/-1;display:flex;justify-content:space-between;gap:8px;font:700 8px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8f9aa2;padding:1px 2px 0}
#hhv2910Status b{color:#7df1b7}html[data-hhv-mode="radio"] #hhv2910Status b{color:#ff7e84}
/* El carrusel queda visible tanto en PADS como en RADIO. */
html[data-hhv-mode="pads"] #track,html[data-hhv-mode="radio"] #track{display:flex!important}
html[data-hhv-mode="pads"] #panel,html[data-hhv-mode="radio"] #panel{display:none!important}
#vp{background:#020304}.fly>img{object-fit:contain!important;object-position:center!important;background:#020304!important}
#track .fly img[data-id]{cursor:zoom-in}
@media(max-width:760px){.screen #hhv2910ControlBar{grid-template-columns:1fr 1fr}.screen #hhv2910ControlBar select{grid-column:1/3}.screen #hhv2910ControlBar #hhv2910RadioPlay{grid-column:1/3}.screen #hhv2910ControlBar button,.screen #hhv2910ControlBar select{height:34px}#hhv2910Status{grid-column:1/3;font-size:7px}.vp{min-height:310px}}
@media(max-width:395px){.vp{min-height:260px}}
</style>`;

      const bar = `
<div id="hhv2910ControlBar" aria-label="Controles integrados HHV">
  <button id="hhv2910Pads" class="active" type="button">PADS</button>
  <button id="hhv2910Radio" type="button">RADIO · 181.FM</button>
  <select id="hhv2910Station" aria-label="Género / estación 181.FM"></select>
  <button id="hhv2910RadioPlay" type="button">PLAY</button>
  <div id="hhv2910Status"><span>FLYERS SIEMPRE VISIBLES · DESLIZÁ ↔ · TOCÁ PARA ABRIR</span><b id="hhv2910ModeLabel">PADS · 80 SAMPLES REALES</b></div>
</div>`;

      const js = `
<script>
(function HHVV2910(){
  var root=document.documentElement;
  var padsBtn=document.getElementById('hhv2910Pads');
  var radioBtn=document.getElementById('hhv2910Radio');
  var station=document.getElementById('hhv2910Station');
  var playBtn=document.getElementById('hhv2910RadioPlay');
  var modeLabel=document.getElementById('hhv2910ModeLabel');
  var hiddenPads=document.getElementById('hhvPadsMode');
  var hiddenRadio=document.getElementById('hhvRadioMode');
  var hiddenStation=document.getElementById('hhvRadioStation');
  var hiddenPlay=document.getElementById('hhvRadioPlay');
  var masterRadio=document.getElementById('hhvRadioAudio');
  var ready=false;
  var lastFlyerIndex=0;
  var fallbackStations=[
    ['OLD SCHOOL','181.fm — Old School HipHop/RnB','https://listen.181fm.com/181-oldschool_128k.mp3'],
    ['RAP / HIPHOP','181.fm — The Beat (HipHop/R&B)','https://listen.181fm.com/181-beat_128k.mp3'],
    ['URBAN','181.fm — The Box (Urban)','https://listen.181fm.com/181-thebox_128k.mp3'],
    ['TRUE R&B','181.fm — True R&B','https://listen.181fm.com/181-rnb_128k.mp3'],
    ['SOUL','181.fm — Soul','https://listen.181fm.com/181-soul_128k.mp3'],
    ['CLASSIC R&B','181.fm — Classic R&B','https://listen.181fm.com/181-classicrnb_128k.mp3'],
    ['JAMMIN','181.fm — Jammin 181','https://listen.181fm.com/181-jammin_128k.mp3'],
    ['PARTY','181.fm — Party 181','https://listen.181fm.com/181-party_128k.mp3'],
    ['80s R&B','181.fm — 80s R&B','https://listen.181fm.com/181-80srnb_128k.mp3'],
    ['80s LITE R&B','181.fm — 80s Lite R&B','https://listen.181fm.com/181-80sliternb_128k.mp3'],
    ['90s R&B','181.fm — 90s R&B','https://listen.181fm.com/181-90srnb_128k.mp3'],
    ['90s LITE R&B','181.fm — 90s Lite R&B','https://listen.181fm.com/181-90sliternb_128k.mp3'],
    ['FUNK / VIBE','181.fm — The Vibe of Vegas','https://listen.181fm.com/181-vibe_128k.mp3'],
    ['ACID JAZZ','181.fm — Acid Jazz','https://listen.181fm.com/181-acidjazz_128k.mp3'],
    ['BEBOP JAZZ','181.fm — BeBop Jazz','https://listen.181fm.com/181-bebop_128k.mp3'],
    ['FUSION JAZZ','181.fm — Fusion Jazz','https://listen.181fm.com/181-fusionjazz_128k.mp3']
  ];

  function rowsFromDb(){
    try{
      var rb=Array.isArray(B)&&B.find(function(x){return x.m==='radio'});
      if(rb&&Array.isArray(rb.p)&&rb.p.length){
        return rb.p.filter(function(p){return p.stream_url}).map(function(p){return [p.label||p.radio_genre||'181.FM',p.radio_station_name||p.radio_genre||'181.FM',p.stream_url]});
      }
    }catch(e){}
    return fallbackStations;
  }
  function buildStations(){
    var rows=rowsFromDb();
    var html=rows.map(function(r){return '<option value="'+String(r[2]).replace(/"/g,'&quot;')+'">'+String(r[0])+' · '+String(r[1]).replace(/^181\\.fm\\s*[—-]\\s*/i,'')+'</option>'}).join('');
    station.innerHTML=html;
    if(hiddenStation) hiddenStation.innerHTML=html;
    return rows.length;
  }
  function restoreFlyers(force){
    try{if(typeof fi==='number')lastFlyerIndex=fi}catch(e){}
    var panel=document.getElementById('panel'),track=document.getElementById('track');
    if(panel)panel.classList.remove('on');
    if(track)track.classList.remove('off');
    try{
      if(force&&typeof E!=='undefined'&&Array.isArray(E)&&E.length&&typeof screen==='function'){
        screen(E);
        if(typeof go==='function')setTimeout(function(){try{go(Math.min(lastFlyerIndex,E.length-1))}catch(e){}},0);
      }
      if(typeof setScreenLabel==='function')setScreenLabel('home','FLYERS · AGENDA');
    }catch(e){}
    var m=document.getElementById('screenMode');if(m)m.textContent='FLYERS · AGENDA';
  }
  function stopLegacyRadio(){
    try{if(typeof radioAudio!=='undefined'&&radioAudio&&radioAudio!==masterRadio){radioAudio.pause();radioAudio.removeAttribute('src');radioAudio.load()}}catch(e){}
    try{if(typeof stopall==='function')stopall()}catch(e){}
  }
  function syncMode(){
    var radio=root.getAttribute('data-hhv-mode')==='radio';
    padsBtn.classList.toggle('active',!radio);radioBtn.classList.toggle('active',radio);
    modeLabel.textContent=radio?'RADIO · PADS BLOQUEADOS':'PADS · 80 SAMPLES REALES';
    restoreFlyers(false);
  }
  function enterPads(){
    if(hiddenPads)hiddenPads.click(); else root.setAttribute('data-hhv-mode','pads');
    if(masterRadio){masterRadio.pause();masterRadio.removeAttribute('src');masterRadio.load()}
    playBtn.textContent='PLAY';playBtn.classList.remove('on');
    syncMode();restoreFlyers(true);
  }
  function enterRadio(){
    stopLegacyRadio();
    if(hiddenRadio)hiddenRadio.click(); else root.setAttribute('data-hhv-mode','radio');
    syncMode();restoreFlyers(true);
  }
  function toggleRadio(){
    enterRadio();
    if(!hiddenStation||!hiddenPlay||!masterRadio)return;
    hiddenStation.value=station.value;
    if(masterRadio.paused){hiddenPlay.click()}else{hiddenPlay.click()}
  }
  padsBtn.onclick=enterPads;
  radioBtn.onclick=enterRadio;
  playBtn.onclick=toggleRadio;
  station.onchange=function(){
    if(hiddenStation)hiddenStation.value=station.value;
    if(root.getAttribute('data-hhv-mode')!=='radio')enterRadio();
    if(masterRadio&&!masterRadio.paused&&hiddenStation&&typeof hiddenStation.onchange==='function')hiddenStation.onchange();
  };
  if(masterRadio){
    masterRadio.addEventListener('play',function(){playBtn.textContent='PAUSA';playBtn.classList.add('on');modeLabel.textContent='RADIO · '+(station.options[station.selectedIndex]||{}).text});
    masterRadio.addEventListener('pause',function(){playBtn.textContent='PLAY';playBtn.classList.remove('on');syncMode()});
    masterRadio.addEventListener('error',function(){playBtn.textContent='REINTENTAR';playBtn.classList.remove('on');modeLabel.textContent='RADIO · ERROR DE STREAM'});
  }

  /* Capturamos accesos viejos a RADIO para que no reemplacen el flyer por un panel distinto. */
  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('[data-v="radio"],#radioToggle,#cy'):null;
    if(!t)return;
    ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
    if(t.id==='radioToggle')toggleRadio();else enterRadio();
  },true);

  /* El selector KIT recorre solo los 5 bancos musicales; no salta a NAV/RADIO. */
  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('#kitSelector'):null;if(!t)return;
    if(root.getAttribute('data-hhv-mode')==='radio')return;
    ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
    try{
      var audioIdx=[];B.forEach(function(b,i){if(b.m==='audio')audioIdx.push(i)});
      var pos=audioIdx.indexOf(bi);bi=audioIdx[(pos+1+audioIdx.length)%audioIdx.length];
      if(typeof stopall==='function')stopall();if(typeof render==='function')render();restoreFlyers(false);
    }catch(e){}
  },true);

  /* Tocar el flyer central abre el original completo en el visor HHV. */
  document.addEventListener('click',function(ev){
    var im=ev.target&&ev.target.closest?ev.target.closest('#track .fly img[data-id]'):null;
    if(!im)return;
    ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
    try{if(typeof focus==='function')focus(im.dataset.id)}catch(e){}
  },true);

  function boot(){
    var hasData=false;try{hasData=typeof E!=='undefined'&&Array.isArray(E)&&E.length>0&&typeof B!=='undefined'&&Array.isArray(B)&&B.length>0}catch(e){}
    if(!hasData)return false;
    buildStations();
    try{var current=hiddenStation&&hiddenStation.value;if(current)station.value=current}catch(e){}
    enterPads();
    restoreFlyers(true);
    root.setAttribute('data-hhv-flyer-primary','true');
    root.setAttribute('data-hhv-radio-unified','181.fm');
    root.setAttribute('data-hhv-sample-banks','5x16-distinct');
    var eng=document.getElementById('eng');if(eng)eng.textContent='Supabase · 80 samples reales · 5 bancos x 16 · 181.FM 16 géneros · FLYER FIRST · v2.9.10';
    ready=true;return true;
  }
  var tries=0,t=setInterval(function(){tries++;if(boot()||tries>50)clearInterval(t)},200);
  setTimeout(function(){if(!ready)buildStations()},250);
})();
</script>`;

      body = body.replace('</head>', css + '</head>');
      body = body.replace('<div class="mods">', bar + '<div class="mods">');
      body = body.replace('</body>', js + '</body>');
    }
    res.statusCode = statusCode;
    for (const [k,v] of Object.entries(headers)) res.setHeader(k,v);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-HHV-Version','2.9.10-flyers-radio-distinct-banks');
    return res.end(body);
  } catch (err) {
    console.error('HHV v2.9.10 renderer error',err);
    res.statusCode=500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag','noindex');
    return res.end('HHV v2.9.10 renderer error');
  }
};
