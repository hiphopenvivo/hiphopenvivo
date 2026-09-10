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
<style id="hhv-v299-hq-css">
#hhvHQBankDock{position:fixed;right:12px;bottom:12px;z-index:10021;width:min(340px,calc(100vw - 24px));background:linear-gradient(180deg,#0b1014,#050709);border:1px solid #37444c;border-radius:12px;box-shadow:0 16px 46px #000d;color:#fff;padding:9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
#hhvHQBankDock .head{display:flex;align-items:center;justify-content:space-between;gap:8px}.hhvhq-title{font-size:11px;font-weight:900;letter-spacing:.08em}.hhvhq-state{font-size:9px;color:#7ef1b5;border:1px solid #2a6549;border-radius:999px;padding:3px 6px;background:#07150f}.hhvhq-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.hhvhq-bank{min-height:38px;border:1px solid #38464f;border-radius:6px;background:#090d10;color:#cbd3d8;font-weight:900;cursor:pointer}.hhvhq-bank.active{border-color:#2d7452;color:#9af3c4;background:#0d2c20;box-shadow:0 0 14px #2d745255}.hhvhq-note{margin-top:7px;font-size:8px;line-height:1.3;color:#8f9aa2}.hhvhq-pad-label{display:block;font-size:8px;opacity:.8;margin-top:2px}
html[data-hhv-mode="radio"] #hhvHQBankDock{opacity:.55;pointer-events:none}
@media(max-width:760px){#hhvHQBankDock{right:8px;left:8px;bottom:118px;width:auto}}
</style>`;

      const html = `
<section id="hhvHQBankDock" aria-label="Bancos HQ de pads">
  <div class="head"><b class="hhvhq-title">KITS / BANKS · HQ</b><span id="hhvHQState" class="hhvhq-state">PADS</span></div>
  <div class="hhvhq-grid">
    <button type="button" class="hhvhq-bank" data-hhv-hq-bank="boom-bap-hq">BOOM BAP HQ<br><small>16 PADS · WAV</small></button>
    <button type="button" class="hhvhq-bank" data-hhv-hq-bank="hq-808">HQ 808<br><small>16 PADS · WAV</small></button>
  </div>
  <div class="hhvhq-note">Audio precargado y polifónico. Solo funciona en modo PADS; RADIO mantiene prioridad exclusiva.</div>
</section>`;

      const js = `
<script>
(function HHVV299HQ(){
  const RAW='https://raw.githubusercontent.com/averagenative/0x808/main/samples/';
  const BANKS={
    'boom-bap-hq':{name:'BOOM BAP HQ',labels:['Heavy Kick','Dust Kick','Hard Snare','Dry Snare','Closed Hat','Open Hat','Clap','Rim','Perc','Bongo','Clave','Tom','Crash','Cowbell','Low Conga','Accent'],files:['kicks/kick.wav','mrk2/kick.wav','808/01.SD5.808.wav','mrk2/snare.wav','mrk2/hihat-closed.wav','mrk2/hihat-open.wav','808/01.CP.808.wav','808/01.RS.808.wav','percussion/perc1.wav','mrk2/bongo.wav','mrk2/clave.wav','mrk2/tom.wav','mrk2/cymball-short.wav','808/01.CB.808.wav','808/01.LC.808.wav','mrk2/block.wav']},
    'hq-808':{name:'HQ 808',labels:['Kick','Cowbell','Closed Hat','Clave','Clap','Cymbal','High Conga','High Tom','Low Conga','Low Tom','Maracas','Mid Conga','Mid Tom','Open Hat','Rimshot','Snare'],files:['808/01.BD.808.wav','808/01.CB.808.wav','808/01.CH.808.wav','808/01.CL.808.wav','808/01.CP.808.wav','808/01.CY.808.wav','808/01.HC.808.wav','808/01.HT.808.wav','808/01.LC.808.wav','808/01.LT.808.wav','808/01.MA.808.wav','808/01.MC.808.wav','808/01.MT.808.wav','808/01.OH.808.wav','808/01.RS.808.wav','808/01.SD5.808.wav']}
  };
  let active='',ctx=null,buffers={},loading={};
  const state=document.getElementById('hhvHQState');
  function currentMode(){return document.documentElement.getAttribute('data-hhv-mode')||'pads'}
  function pads(){let x=Array.from(document.querySelectorAll('.pad,[data-pad],[data-pad-index]')).filter(n=>n instanceof HTMLElement);if(x.length<16)x=Array.from(document.querySelectorAll('button')).filter(b=>/^PAD\\s*\\d+/i.test(String(b.textContent||''))||b.closest('.pads,.padgrid,[class*="pads"]'));return x.slice(0,16)}
  function ensureCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
  function setState(txt){if(state)state.textContent=txt}
  async function preload(slug){if(buffers[slug]&&buffers[slug].every(Boolean))return true;if(loading[slug])return loading[slug];const b=BANKS[slug];buffers[slug]=new Array(16);setState('CARGANDO');loading[slug]=Promise.all(b.files.map(async(f,i)=>{const r=await fetch(RAW+f,{cache:'force-cache'});if(!r.ok)throw new Error('audio '+i);const ab=await r.arrayBuffer();buffers[slug][i]=await ensureCtx().decodeAudioData(ab.slice(0));return true})).then(()=>{setState(b.name+' · LISTO');return true}).catch(err=>{console.warn('HHV v2.9.9 HQ load',err);setState('ERROR AUDIO');return false});return loading[slug]}
  function relabel(slug){const b=BANKS[slug];pads().forEach((p,i)=>{p.dataset.hhvHqBank=slug;p.dataset.hhvPadLabel=b.labels[i]||('PAD '+(i+1));p.title=(b.labels[i]||('PAD '+(i+1)))+' · '+b.name})}
  function activate(slug){if(currentMode()==='radio')return;active=slug;try{localStorage.setItem('hhvHQBank',slug)}catch(e){};document.documentElement.setAttribute('data-hhv-hq-bank',slug);document.querySelectorAll('[data-hhv-hq-bank]').forEach(b=>b.classList.toggle('active',b.dataset.hhvHqBank===slug));relabel(slug);preload(slug)}
  function play(i){if(currentMode()==='radio'||!active)return;const set=buffers[active];if(!set||!set[i])return;const c=ensureCtx(),s=c.createBufferSource(),g=c.createGain();g.gain.value=.92;s.buffer=set[i];s.connect(g).connect(c.destination);s.start(0)}
  document.querySelectorAll('[data-hhv-hq-bank]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.hhvHqBank)));
  function bind(){pads().forEach((p,i)=>{if(p.dataset.hhvV299Bound)return;p.dataset.hhvV299Bound='1';p.addEventListener('pointerdown',function(e){if(currentMode()==='radio'||!active)return;e.preventDefault();e.stopImmediatePropagation();play(i)},{capture:true})})}
  const observer=new MutationObserver(bind);observer.observe(document.documentElement,{subtree:true,childList:true});bind();
  let saved='boom-bap-hq';try{saved=localStorage.getItem('hhvHQBank')||saved}catch(e){};if(BANKS[saved])activate(saved);
  document.addEventListener('click',function(){if(currentMode()==='radio')setState('RADIO');else if(active)setState((BANKS[active]||{}).name+' · LISTO')},true);
  document.documentElement.setAttribute('data-hhv-audio-engine','v2.9.9-hq-poly');
})();
</script>`;
      body = body.replace('</head>', css + '</head>').replace('</body>', html + js + '</body>');
    }
    res.statusCode = statusCode;
    for (const [k,v] of Object.entries(headers)) res.setHeader(k,v);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-HHV-Version','2.9.9-unified-hq-banks');
    return res.end(body);
  } catch (err) {
    console.error('HHV v2.9.9 renderer error',err);
    res.statusCode=500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag','noindex');
    return res.end('HHV v2.9.9 renderer error');
  }
};
