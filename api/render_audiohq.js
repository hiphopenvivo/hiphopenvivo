const renderRecovery = require('./render_recovery');

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
    renderRecovery(req, capture);
    if (statusCode === 200 && body.includes('</body>')) {
      const css = `
<style id="hhv-audiohq-css">
.hhv-hq-bank{border-color:#2d7452!important;color:#9af3c4!important}
.hhv-hq-bank.active{background:#0d2c20!important;box-shadow:0 0 16px #2d745255!important}
.hhv-hq-state{font-size:9px;color:#88d9ad;text-align:center;margin-top:4px}
html[data-hhv-hq-audio="loading"] .hhv-hq-bank{opacity:.72}
</style>`;

      const js = `
<script>
(function HHVAudioHQ(){
  const RAW='https://raw.githubusercontent.com/averagenative/0x808/main/samples/';
  const BANKS={
    'hq-808':{
      slug:'hq-808',name:'HQ 808',source:'0x808 · royalty-free / no attribution required',
      labels:['Kick','Cowbell','Closed Hat','Clave','Clap','Cymbal','High Conga','High Tom','Low Conga','Low Tom','Maracas','Mid Conga','Mid Tom','Open Hat','Rimshot','Snare'],
      files:['808/01.BD.808.wav','808/01.CB.808.wav','808/01.CH.808.wav','808/01.CL.808.wav','808/01.CP.808.wav','808/01.CY.808.wav','808/01.HC.808.wav','808/01.HT.808.wav','808/01.LC.808.wav','808/01.LT.808.wav','808/01.MA.808.wav','808/01.MC.808.wav','808/01.MT.808.wav','808/01.OH.808.wav','808/01.RS.808.wav','808/01.SD5.808.wav']
    },
    'boom-bap-hq':{
      slug:'boom-bap-hq',name:'BOOM BAP HQ',source:'0x808 royalty-free library · curated HHV bank',
      labels:['Heavy Kick','Dust Kick','Hard Snare','Dry Snare','Closed Hat','Open Hat','Clap','Rim','Perc','Bongo','Clave','Tom','Crash','Cowbell','Low Conga','Accent'],
      files:['kicks/kick.wav','mrk2/kick.wav','808/01.SD5.808.wav','mrk2/snare.wav','mrk2/hihat-closed.wav','mrk2/hihat-open.wav','808/01.CP.808.wav','808/01.RS.808.wav','percussion/perc1.wav','mrk2/bongo.wav','mrk2/clave.wav','mrk2/tom.wav','mrk2/cymball-short.wav','808/01.CB.808.wav','808/01.LC.808.wav','mrk2/block.wav']
    }
  };
  let activeSlug='',ctx=null,bufferSets={},loadingSets={};
  function padNodes(){let x=Array.from(document.querySelectorAll('.pad,[data-pad],[data-pad-index]')).filter(n=>n instanceof HTMLElement);if(x.length<16)x=Array.from(document.querySelectorAll('button')).filter(b=>/^PAD\\s*\\d+/i.test(String(b.textContent||''))||b.closest('.pads,.padgrid,[class*="pads"]'));return x.slice(0,16)}
  function ensureCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
  function setState(s,t){document.documentElement.setAttribute('data-hhv-hq-audio',s);document.querySelectorAll('.hhv-hq-state').forEach(e=>e.textContent=t)}
  async function preload(slug){const bank=BANKS[slug];if(!bank)return false;if(loadingSets[slug])return loadingSets[slug];bufferSets[slug]=new Array(16);setState('loading',bank.name+' · CARGANDO 16 WAV…');loadingSets[slug]=Promise.all(bank.files.map(async(f,i)=>{const r=await fetch(RAW+f,{cache:'force-cache'});if(!r.ok)throw new Error('audio '+i+' '+f);const ab=await r.arrayBuffer();bufferSets[slug][i]=await ensureCtx().decodeAudioData(ab.slice(0));return true})).then(()=>{setState('ready',bank.name+' · 16/16 LISTOS · POLY');return true}).catch((err)=>{console.warn('HHV HQ bank load error',err);setState('error',bank.name+' · ERROR DE CARGA');return false});return loadingSets[slug]}
  function play(i){const set=bufferSets[activeSlug];if(!set||!set[i])return;const c=ensureCtx(),s=c.createBufferSource(),g=c.createGain();g.gain.value=.92;s.buffer=set[i];s.connect(g).connect(c.destination);s.start(0)}
  function relabel(bank){padNodes().forEach((p,i)=>{p.dataset.hhvKit=bank.slug;p.dataset.hhvPadLabel=bank.labels[i];p.title=bank.labels[i]+' · '+bank.name;let badge=p.querySelector('.hhv-kit-indicator');if(badge)badge.textContent=bank.labels[i]})}
  function activate(slug){const bank=BANKS[slug];if(!bank)return;activeSlug=slug;try{localStorage.setItem('hhvKit',slug)}catch(e){};document.documentElement.setAttribute('data-hhv-kit',slug);relabel(bank);document.querySelectorAll('.hhv-hq-bank').forEach(b=>b.classList.toggle('active',b.dataset.hqBank===slug));document.querySelectorAll('[data-screen-kit],[data-kit]').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.hhv-kits-status').forEach(s=>s.textContent='KIT ACTUAL · '+bank.name+' · 16 PADS');preload(slug)}
  function deactivate(){if(!activeSlug)return;activeSlug='';document.querySelectorAll('.hhv-hq-bank').forEach(b=>b.classList.remove('active'))}
  function makeBankButton(slug,modal){const bank=BANKS[slug],b=document.createElement('button');b.type='button';b.className='hhv-hq-bank';b.dataset.hqBank=slug;b.innerHTML=bank.name+(modal?'<br><small>16 PADS · WAV</small>':' · 16<br><small>WAV · POLY</small>');b.onclick=()=>{activate(slug);if(modal)document.getElementById('hhvKitPicker')?.classList.remove('open')};return b}
  function injectButtons(){document.querySelectorAll('.hhv-screen-kit-grid').forEach(g=>{Object.keys(BANKS).forEach(slug=>{if(!g.querySelector('[data-hq-bank="'+slug+'"]'))g.appendChild(makeBankButton(slug,false))});if(!g.parentElement.querySelector('.hhv-hq-state')){const s=document.createElement('div');s.className='hhv-hq-state';s.textContent='HQ AUDIO · LISTO PARA CARGAR';g.parentElement.appendChild(s)}});document.querySelectorAll('#hhvKitGrid').forEach(g=>{Object.keys(BANKS).forEach(slug=>{if(!g.querySelector('[data-hq-bank="'+slug+'"]'))g.appendChild(makeBankButton(slug,true))})})}
  function bindPads(){padNodes().forEach((p,i)=>{if(p.dataset.hhvHqBound)return;p.dataset.hhvHqBound='1';p.addEventListener('pointerdown',function(e){if(!activeSlug)return;e.preventDefault();e.stopImmediatePropagation();play(i)},{capture:true})})}
  function bindOriginalKitButtons(){document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-screen-kit],[data-kit]'):null;if(b&&activeSlug)deactivate()},true)}
  bindOriginalKitButtons();
  let tries=0;const timer=setInterval(()=>{tries++;injectButtons();bindPads();let saved='';try{saved=localStorage.getItem('hhvKit')||''}catch(e){};if(BANKS[saved]&&activeSlug!==saved)activate(saved);if((document.querySelectorAll('.hhv-hq-bank').length>=2&&padNodes().length>=16)||tries>40)clearInterval(timer)},300);
  document.documentElement.setAttribute('data-hhv-audio-engine','hq-poly-preview-v2');
})();
</script>`;
      body = body.replace('</head>', css + '</head>').replace('</body>', js + '</body>');
    }
    res.statusCode = statusCode;
    for (const [k,v] of Object.entries(headers)) res.setHeader(k,v);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-HHV-Version','2.9.4-recovery-kits-radio-hq808-boombap');
    return res.end(body);
  } catch (err) {
    console.error('HHV HQ audio renderer error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag','noindex');
    return res.end('HHV HQ audio renderer error');
  }
};
