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
.hhv-hq808{border-color:#2d7452!important;color:#9af3c4!important}
.hhv-hq808.active{background:#0d2c20!important;box-shadow:0 0 16px #2d745255!important}
.hhv-hq-state{font-size:9px;color:#88d9ad;text-align:center;margin-top:4px}
html[data-hhv-hq-audio="loading"] .hhv-hq808{opacity:.72}
</style>`;

      const js = `
<script>
(function HHVAudioHQ(){
  const HQ={
    slug:'hq-808',name:'HQ 808',source:'0x808 · royalty-free / no attribution required',
    labels:['Kick','Cowbell','Closed Hat','Clave','Clap','Cymbal','High Conga','High Tom','Low Conga','Low Tom','Maracas','Mid Conga','Mid Tom','Open Hat','Rimshot','Snare'],
    urls:[
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.BD.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.CB.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.CH.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.CL.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.CP.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.CY.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.HC.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.HT.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.LC.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.LT.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.MA.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.MC.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.MT.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.OH.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.RS.808.wav',
      'https://raw.githubusercontent.com/averagenative/0x808/main/samples/808/01.SD5.808.wav'
    ]
  };
  let hqActive=false,ctx=null,buffers=new Array(16),loading=null;
  function padNodes(){let x=Array.from(document.querySelectorAll('.pad,[data-pad],[data-pad-index]')).filter(n=>n instanceof HTMLElement);if(x.length<16)x=Array.from(document.querySelectorAll('button')).filter(b=>/^PAD\\s*\\d+/i.test(String(b.textContent||''))||b.closest('.pads,.padgrid,[class*="pads"]'));return x.slice(0,16)}
  function ensureCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
  function setState(s,t){document.documentElement.setAttribute('data-hhv-hq-audio',s);document.querySelectorAll('.hhv-hq-state').forEach(e=>e.textContent=t)}
  async function preload(){if(loading)return loading;setState('loading','HQ 808 · CARGANDO 16 WAV…');loading=Promise.all(HQ.urls.map(async(u,i)=>{const r=await fetch(u,{cache:'force-cache'});if(!r.ok)throw new Error('audio '+i);const ab=await r.arrayBuffer();buffers[i]=await ensureCtx().decodeAudioData(ab.slice(0));return true})).then(()=>{setState('ready','HQ 808 · 16/16 LISTOS · POLY');return true}).catch(()=>{setState('error','HQ 808 · ERROR DE CARGA');return false});return loading}
  function play(i){if(!buffers[i])return;const c=ensureCtx(),s=c.createBufferSource(),g=c.createGain();g.gain.value=.92;s.buffer=buffers[i];s.connect(g).connect(c.destination);s.start(0)}
  function relabel(){padNodes().forEach((p,i)=>{p.dataset.hhvKit='hq-808';p.dataset.hhvPadLabel=HQ.labels[i];p.title=HQ.labels[i]+' · HQ 808';let badge=p.querySelector('.hhv-kit-indicator');if(badge)badge.textContent=HQ.labels[i]})}
  function activate(){hqActive=true;try{localStorage.setItem('hhvKit','hq-808')}catch(e){};document.documentElement.setAttribute('data-hhv-kit','hq-808');relabel();document.querySelectorAll('.hhv-hq808').forEach(b=>b.classList.add('active'));document.querySelectorAll('[data-screen-kit],[data-kit]').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.hhv-kits-status').forEach(s=>s.textContent='KIT ACTUAL · HQ 808 · 16 PADS');preload()}
  function deactivate(){if(!hqActive)return;hqActive=false;document.querySelectorAll('.hhv-hq808').forEach(b=>b.classList.remove('active'))}
  function injectButtons(){document.querySelectorAll('.hhv-screen-kit-grid').forEach(g=>{if(!g.querySelector('.hhv-hq808')){const b=document.createElement('button');b.type='button';b.className='hhv-hq808';b.innerHTML='HQ 808 · 16<br><small>WAV · POLY</small>';b.onclick=activate;g.appendChild(b)}if(!g.parentElement.querySelector('.hhv-hq-state')){const s=document.createElement('div');s.className='hhv-hq-state';s.textContent='HQ 808 · LISTO PARA CARGAR';g.parentElement.appendChild(s)}});document.querySelectorAll('#hhvKitGrid').forEach(g=>{if(!g.querySelector('.hhv-hq808')){const b=document.createElement('button');b.type='button';b.className='hhv-hq808';b.innerHTML='HQ 808<br><small>16 PADS · WAV</small>';b.onclick=()=>{activate();document.getElementById('hhvKitPicker')?.classList.remove('open')};g.appendChild(b)}})}
  function bindPads(){padNodes().forEach((p,i)=>{if(p.dataset.hhvHqBound)return;p.dataset.hhvHqBound='1';p.addEventListener('pointerdown',function(e){if(!hqActive)return;e.preventDefault();e.stopImmediatePropagation();play(i)},{capture:true})})}
  function bindOriginalKitButtons(){document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-screen-kit],[data-kit]'):null;if(b&&hqActive)deactivate()},true)}
  bindOriginalKitButtons();
  let tries=0;const timer=setInterval(()=>{tries++;injectButtons();bindPads();let saved='';try{saved=localStorage.getItem('hhvKit')||''}catch(e){};if(saved==='hq-808'&&!hqActive)activate();if((document.querySelector('.hhv-hq808')&&padNodes().length>=16)||tries>40)clearInterval(timer)},300);
  document.documentElement.setAttribute('data-hhv-audio-engine','hq-poly-preview');
})();
</script>`;
      body = body.replace('</head>', css + '</head>').replace('</body>', js + '</body>');
    }
    res.statusCode = statusCode;
    for (const [k,v] of Object.entries(headers)) res.setHeader(k,v);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-HHV-Version','2.9.4-recovery-kits-radio-hq808');
    return res.end(body);
  } catch (err) {
    console.error('HHV HQ audio renderer error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag','noindex');
    return res.end('HHV HQ audio renderer error');
  }
};
