const render297 = require('./render297');

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
    render297(req, capture);

    if (statusCode === 200 && body.includes('</body>')) {
      const modeCss = `
<style id="hhv-mode-radio-css">
#hhvModeDock{position:fixed;left:12px;bottom:12px;z-index:10020;width:min(360px,calc(100vw - 24px));background:linear-gradient(180deg,#0b1014,#050709);border:1px solid #37444c;border-radius:12px;box-shadow:0 16px 46px #000d;color:#fff;padding:9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
#hhvModeDock .hhvmd-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.hhvmd-title{font-size:11px;font-weight:900;letter-spacing:.08em}.hhvmd-state{font-size:9px;color:#7ef1b5;border:1px solid #2a6549;border-radius:999px;padding:3px 6px;background:#07150f}
#hhvModeDock .hhvmd-modes{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.hhvmd-mode{min-height:34px;border:1px solid #38464f;border-radius:6px;background:#090d10;color:#cbd3d8;font-weight:900;cursor:pointer}.hhvmd-mode.active{border-color:#8d303a;color:#fff;background:#2a0b0f;box-shadow:0 0 12px #ff3b451f}
#hhvModeDock .hhvmd-radio{display:none;margin-top:8px;padding-top:8px;border-top:1px solid #28343b}.hhvmd-radio.open{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center}.hhvmd-radio select{min-width:0;height:34px;background:#080c0f;color:#fff;border:1px solid #36444c;border-radius:6px;padding:0 7px}.hhvmd-radio button{height:34px;min-width:56px;border:1px solid #3a4952;border-radius:6px;background:#0a0f12;color:#fff;font-weight:900;cursor:pointer}.hhvmd-radio button.playing{border-color:#2d7552;color:#7df0b7}.hhvmd-note{grid-column:1/-1;font-size:8px;color:#8f9aa2;line-height:1.3}
html[data-hhv-mode="radio"] .pad,html[data-hhv-mode="radio"] [data-pad]{filter:saturate(.55);opacity:.82}
@media(max-width:760px){#hhvModeDock{left:8px;right:8px;bottom:8px;width:auto;padding:8px}.hhvmd-radio.open{grid-template-columns:1fr auto}.hhvmd-radio #hhvRadioStop{display:none}}
</style>`;

      const modeHtml = `
<section id="hhvModeDock" aria-label="Modo de samplera HHV">
  <div class="hhvmd-top"><b class="hhvmd-title">SAMPLERA · MODO</b><span id="hhvModeState" class="hhvmd-state">PADS</span></div>
  <div class="hhvmd-modes">
    <button id="hhvPadsMode" class="hhvmd-mode active" type="button" aria-pressed="true">PADS</button>
    <button id="hhvRadioMode" class="hhvmd-mode" type="button" aria-pressed="false">RADIO</button>
  </div>
  <div id="hhvRadioPanel" class="hhvmd-radio" aria-hidden="true">
    <select id="hhvRadioStation" aria-label="Estación 181.FM">
      <option value="https://listen.181fm.com/181-beat_128k.mp3">181.FM · The Beat · HipHop/R&B</option>
      <option value="https://listen.181fm.com/181-oldschool_128k.mp3">181.FM · Old School HipHop/RnB</option>
      <option value="https://listen.181fm.com/181-soul_128k.mp3">181.FM · Soul</option>
      <option value="https://listen.181fm.com/181-classicrnb_128k.mp3">181.FM · Classic R&B</option>
      <option value="https://listen.181fm.com/181-thebox_128k.mp3">181.FM · The Box · Urban</option>
      <option value="https://listen.181fm.com/181-rnb_128k.mp3">181.FM · True R&B</option>
    </select>
    <button id="hhvRadioPlay" type="button">PLAY</button>
    <button id="hhvRadioStop" type="button">STOP</button>
    <small class="hhvmd-note">RADIO y PADS son excluyentes. En modo RADIO los pads musicales quedan bloqueados; al volver a PADS la radio se detiene.</small>
  </div>
  <audio id="hhvRadioAudio" preload="none"></audio>
</section>`;

      const modeScript = `
<script>
(function HHVExclusivePadRadioMode(){
  var root=document.documentElement;
  var padsBtn=document.getElementById('hhvPadsMode');
  var radioBtn=document.getElementById('hhvRadioMode');
  var state=document.getElementById('hhvModeState');
  var panel=document.getElementById('hhvRadioPanel');
  var station=document.getElementById('hhvRadioStation');
  var play=document.getElementById('hhvRadioPlay');
  var stop=document.getElementById('hhvRadioStop');
  var audio=document.getElementById('hhvRadioAudio');
  var mode='pads';

  function mark(next){
    mode=next;
    root.setAttribute('data-hhv-mode',mode);
    var isRadio=mode==='radio';
    padsBtn.classList.toggle('active',!isRadio); radioBtn.classList.toggle('active',isRadio);
    padsBtn.setAttribute('aria-pressed',String(!isRadio)); radioBtn.setAttribute('aria-pressed',String(isRadio));
    panel.classList.toggle('open',isRadio); panel.setAttribute('aria-hidden',String(!isRadio));
    state.textContent=isRadio?'RADIO · 181.FM':'PADS';
    if(!isRadio){audio.pause();audio.removeAttribute('src');audio.load();play.textContent='PLAY';play.classList.remove('playing');}
    try{localStorage.setItem('hhvMode',mode)}catch(e){}
  }

  function playRadio(){
    if(mode!=='radio') mark('radio');
    if(audio.src!==station.value) audio.src=station.value;
    var p=audio.play();
    if(p&&p.catch)p.catch(function(){play.textContent='REINTENTAR'});
  }
  function stopRadio(){audio.pause();play.textContent='PLAY';play.classList.remove('playing')}

  padsBtn.onclick=function(){mark('pads')};
  radioBtn.onclick=function(){mark('radio')};
  play.onclick=function(){if(audio.paused)playRadio();else stopRadio()};
  stop.onclick=stopRadio;
  station.onchange=function(){if(!audio.paused){audio.src=station.value;playRadio()}};
  audio.onplay=function(){play.textContent='PAUSA';play.classList.add('playing');state.textContent='RADIO · 181.FM · ON AIR'};
  audio.onpause=function(){if(mode==='radio'){play.textContent='PLAY';play.classList.remove('playing');state.textContent='RADIO · 181.FM'}};

  function isPadTarget(target){
    if(!target||!target.closest)return false;
    return !!target.closest('.pad,[data-pad],[data-pad-index],[data-sample],[id^="pad"],[class*=" pad-"]');
  }
  ['pointerdown','mousedown','touchstart','click'].forEach(function(type){
    document.addEventListener(type,function(ev){
      if(mode==='radio'&&isPadTarget(ev.target)){
        ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
      }
    },true);
  });
  document.addEventListener('keydown',function(ev){
    if(mode==='radio'&&!ev.ctrlKey&&!ev.metaKey&&!ev.altKey){
      var tag=(ev.target&&ev.target.tagName||'').toLowerCase();
      if(tag!=='input'&&tag!=='select'&&tag!=='textarea'&&tag!=='button'&&/^[0-9qwertyuiopasdfghjklzxcvbnm ]$/i.test(ev.key)){
        ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
      }
    }
  },true);

  mark('pads');
  root.setAttribute('data-hhv-radio-provider','181.fm');
  root.setAttribute('data-hhv-mode-exclusive','true');
})();
</script>`;

      body = body.replace('</head>', modeCss + '</head>');
      body = body.replace('</body>', modeHtml + modeScript + '</body>');
    }

    res.statusCode = statusCode;
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-HHV-Version', '2.9.8-preview-exclusive-radio-pads');
    return res.end(body);
  } catch (error) {
    console.error('HHV render298 wrapper error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end('HHV render298 wrapper error');
  }
};
