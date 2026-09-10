const render = require('./render');

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
    render(req, capture);
    if (statusCode === 200 && body.includes('</body>')) {
      const css = `
<style id="hhv-recovery-kits-radio-css">
#hhvKitPicker{position:fixed;inset:0;z-index:12000;background:#000d;display:none;align-items:center;justify-content:center;padding:16px}
#hhvKitPicker.open{display:flex}.hhvkp-card{width:min(520px,94vw);background:#090d10;border:1px solid #3a474f;border-radius:12px;padding:12px;color:#fff;box-shadow:0 20px 70px #000}.hhvkp-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.hhvkp-head b{font:900 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}.hhvkp-close{border:1px solid #46535b;background:#11171b;color:#fff;border-radius:6px;padding:6px 9px}.hhvkp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.hhvkp-grid button{min-height:48px;border:1px solid #3b4952;background:#0b1115;color:#fff;border-radius:8px;font-weight:900}.hhvkp-grid button.active{border-color:#8c3039;background:#2a0a0e;box-shadow:0 0 14px #ff38411f}.hhvkp-note{margin-top:10px;color:#8f9aa2;font:700 10px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}
.hhv-screen-tools{position:absolute;left:8px;right:8px;bottom:8px;z-index:50;border:1px solid #39464f;border-radius:8px;background:#061015f2;color:#fff;padding:7px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 8px 30px #0009}.hhv-screen-tools .tabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}.hhv-screen-tools .tabs button{min-height:30px;border:1px solid #3c4850;background:#0a0f12;color:#c8d0d5;border-radius:5px;font-size:9px;font-weight:900;padding:4px}.hhv-screen-tools .tabs button.active{border-color:#8d303a;background:#2b0a0e;color:#fff}.hhv-radio-pane,.hhv-kits-pane{display:none;margin-top:6px;gap:5px}.hhv-radio-pane.open,.hhv-kits-pane.open{display:grid}.hhv-radio-pane select,.hhv-radio-pane button{min-height:32px;border:1px solid #3b4850;border-radius:5px;background:#080d10;color:#fff;font-size:10px}.hhv-radio-pane button.playing{border-color:#2d7452;color:#77efb2}.hhv-radio-status,.hhv-kits-status{font-size:9px;color:#8f9aa2;text-align:center}.hhv-screen-kit-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;max-height:132px;overflow:auto}.hhv-screen-kit-grid button{min-height:35px;border:1px solid #3b4850;border-radius:5px;background:#080d10;color:#fff;font-size:9px;font-weight:900}.hhv-screen-kit-grid button.active{border-color:#8d303a;background:#2b0a0e;color:#fff}.hhv-kit-indicator{display:inline-block;margin-left:5px;padding:2px 5px;border:1px solid #7c3037;border-radius:999px;color:#ff9aa0;font:900 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;vertical-align:middle}
@media(max-width:760px){.hhvkp-grid{grid-template-columns:1fr}.hhv-screen-tools{left:5px;right:5px;bottom:5px;padding:5px}.hhv-screen-tools .tabs button{font-size:8px}.hhv-screen-kit-grid{max-height:116px}}
</style>`;

      const html = `
<div id="hhvKitPicker" role="dialog" aria-modal="true" aria-label="Elegir kit de pads">
  <div class="hhvkp-card">
    <div class="hhvkp-head"><b>KITS · 16 PADS</b><button id="hhvKitClose" class="hhvkp-close" type="button">CERRAR ✕</button></div>
    <div id="hhvKitGrid" class="hhvkp-grid"></div>
    <div class="hhvkp-note">Selector alternativo. La selección principal también está disponible dentro de la pantalla digital en KITS / BANKS.</div>
  </div>
</div>
<audio id="hhvTouchRadio" preload="none"></audio>`;

      const js = `
<script>
(function HHVRecoveryKitsRadio(){
  const kits=[
    {slug:'boom-bap',name:'BOOM BAP',labels:['Kick','Snare','Hi-Hat','Open Hat','Clap','Perc','Rim','Shaker','Bass','Chords','Vox','FX','Texture','Fill','Crash','Sample']},
    {slug:'jazz',name:'JAZZ',labels:['Kick','Brush Snare','Ride','Hi-Hat','Brush','Conga','Rim','Shaker','Upright Bass','Piano','Horn','Sax','Vinyl','Fill','Crash','Jazz Chop']},
    {slug:'soul',name:'SOUL',labels:['Kick','Snare','Hat','Tamb','Clap','Perc','Rim','Shaker','Bass','Rhodes','Vocal','Horn','Texture','Fill','Crash','Soul Chop']},
    {slug:'rnb',name:'R&B',labels:['Kick','Snare','Hat','Open Hat','Clap','Perc','Snap','Shaker','808 Bass','Keys','Vox','FX','Texture','Fill','Crash','R&B Chop']},
    {slug:'lofi',name:'LO-FI',labels:['Soft Kick','Dust Snare','Hat','Open Hat','Clap','Perc','Rim','Shaker','Bass','Keys','Vox','Tape FX','Rain','Fill','Crash','Lo-Fi Chop']}
  ];
  const stations=[
    ['OLD SCHOOL','https://listen.181fm.com/181-oldschool_128k.mp3'],['RAP / HIPHOP','https://listen.181fm.com/181-beat_128k.mp3'],['URBAN','https://listen.181fm.com/181-thebox_128k.mp3'],['TRUE R&B','https://listen.181fm.com/181-rnb_128k.mp3'],['SOUL','https://listen.181fm.com/181-soul_128k.mp3'],['CLASSIC R&B','https://listen.181fm.com/181-classicrnb_128k.mp3'],['JAMMIN','https://listen.181fm.com/181-jammin_128k.mp3'],['PARTY','https://listen.181fm.com/181-party_128k.mp3'],['80s R&B','https://listen.181fm.com/181-80srnb_128k.mp3'],['90s R&B','https://listen.181fm.com/181-90srnb_128k.mp3'],['ACID JAZZ','https://listen.181fm.com/181-acidjazz_128k.mp3'],['BEBOP JAZZ','https://listen.181fm.com/181-bebop_128k.mp3'],['FUSION JAZZ','https://listen.181fm.com/181-fusionjazz_128k.mp3']
  ];
  const picker=document.getElementById('hhvKitPicker'),grid=document.getElementById('hhvKitGrid'),close=document.getElementById('hhvKitClose'),audio=document.getElementById('hhvTouchRadio');
  let current='boom-bap';
  function norm(s){return String(s||'').replace(/\\s+/g,' ').trim().toUpperCase()}
  function allButtons(){return Array.from(document.querySelectorAll('button,[role="button"]'))}
  function boomButton(){return allButtons().find(b=>norm(b.textContent).includes('BOOMBAP KIT')||norm(b.textContent).includes('BOOM BAP KIT'))}
  function padNodes(){let x=Array.from(document.querySelectorAll('.pad,[data-pad],[data-pad-index]')).filter(n=>n instanceof HTMLElement);if(x.length<16){x=Array.from(document.querySelectorAll('button')).filter(b=>/^PAD\\s*\\d+/i.test(String(b.textContent||''))||b.closest('.pads,.padgrid,[class*="pads"]'))}return x.slice(0,16)}
  function addPadLabels(kit){const pads=padNodes();pads.forEach((p,i)=>{p.dataset.hhvKit=kit.slug;p.dataset.hhvPadLabel=kit.labels[i]||('PAD '+(i+1));p.title=(kit.labels[i]||('PAD '+(i+1)))+' · '+kit.name;let badge=p.querySelector('.hhv-kit-indicator');if(!badge){badge=document.createElement('span');badge.className='hhv-kit-indicator';p.appendChild(badge)}badge.textContent=kit.labels[i]||('PAD '+(i+1))})}
  function renderModalGrid(){if(!grid)return;grid.innerHTML=kits.map(k=>'<button type="button" data-kit="'+k.slug+'" class="'+(k.slug===current?'active':'')+'">'+k.name+'<br><small>16 PADS</small></button>').join('');grid.querySelectorAll('[data-kit]').forEach(b=>b.onclick=()=>{choose(b.dataset.kit);picker.classList.remove('open')})}
  function renderScreenGrid(){document.querySelectorAll('.hhv-screen-kit-grid').forEach(g=>{g.innerHTML=kits.map(k=>'<button type="button" data-screen-kit="'+k.slug+'" class="'+(k.slug===current?'active':'')+'">'+k.name+' · 16</button>').join('');g.querySelectorAll('[data-screen-kit]').forEach(b=>b.onclick=()=>choose(b.dataset.screenKit))});document.querySelectorAll('.hhv-kits-status').forEach(s=>{const k=kits.find(x=>x.slug===current)||kits[0];s.textContent='KIT ACTUAL · '+k.name+' · 16 PADS'})}
  function choose(slug){const kit=kits.find(k=>k.slug===slug)||kits[0];current=kit.slug;try{localStorage.setItem('hhvKit',current)}catch(e){};const b=boomButton();if(b){b.dataset.hhvKit=current;b.setAttribute('aria-label','Abrir selector de kits. Actual: '+kit.name)}addPadLabels(kit);renderModalGrid();renderScreenGrid();document.documentElement.setAttribute('data-hhv-kit',current)}
  function wireKit(){const b=boomButton();if(!b)return false;if(!b.dataset.hhvPickerBound){b.dataset.hhvPickerBound='1';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();picker.classList.add('open')})}let saved='';try{saved=localStorage.getItem('hhvKit')||''}catch(e){};choose(saved||current);return true}
  if(close)close.onclick=()=>picker.classList.remove('open');if(picker)picker.addEventListener('click',e=>{if(e.target===picker)picker.classList.remove('open')});

  function findScreen(){const sels=['#screen','.screen','.lcd','.display','.digital-screen','.fanCard.main','#fmain','[class*="screen"]','[class*="display"]'];for(const s of sels){const el=document.querySelector(s);if(el&&el instanceof HTMLElement)return el}return null}
  function installScreenTools(){
    const screen=findScreen();if(!screen||screen.querySelector('.hhv-screen-tools'))return !!screen;
    const cs=getComputedStyle(screen);if(cs.position==='static')screen.style.position='relative';
    const box=document.createElement('div');box.className='hhv-screen-tools';
    box.innerHTML='<div class="tabs"><button type="button" data-view="flyers" class="active">FLYERS</button><button type="button" data-view="radio">RADIO</button><button type="button" data-view="kits">KITS / BANKS</button></div><div class="hhv-radio-pane"><select aria-label="Radio 181.FM"></select><button type="button" class="hhv-radio-play">PLAY</button><div class="hhv-radio-status">181.FM · ELEGÍ ESTACIÓN</div></div><div class="hhv-kits-pane"><div class="hhv-screen-kit-grid"></div><div class="hhv-kits-status"></div></div>';
    screen.appendChild(box);
    const flyerBtn=box.querySelector('[data-view="flyers"]'),radioBtn=box.querySelector('[data-view="radio"]'),kitsBtn=box.querySelector('[data-view="kits"]'),radioPane=box.querySelector('.hhv-radio-pane'),kitsPane=box.querySelector('.hhv-kits-pane'),sel=box.querySelector('select'),play=box.querySelector('.hhv-radio-play'),status=box.querySelector('.hhv-radio-status');
    sel.innerHTML=stations.map(s=>'<option value="'+s[1]+'">181.FM · '+s[0]+'</option>').join('');
    function view(v){
      const r=v==='radio',k=v==='kits';
      flyerBtn.classList.toggle('active',!r&&!k);radioBtn.classList.toggle('active',r);kitsBtn.classList.toggle('active',k);
      radioPane.classList.toggle('open',r);kitsPane.classList.toggle('open',k);
      if(!r&& !audio.paused){audio.pause();play.textContent='PLAY';play.classList.remove('playing')}
      document.documentElement.setAttribute('data-hhv-screen-view',v);
    }
    flyerBtn.onclick=()=>view('flyers');radioBtn.onclick=()=>view('radio');kitsBtn.onclick=()=>view('kits');
    play.onclick=()=>{if(audio.paused){audio.src=sel.value;const p=audio.play();if(p&&p.catch)p.catch(()=>{status.textContent='NO SE PUDO INICIAR · TOCÁ PLAY OTRA VEZ'});}else audio.pause()};
    sel.onchange=()=>{if(!audio.paused){audio.src=sel.value;audio.play().catch(()=>{})}};
    audio.onplay=()=>{play.textContent='PAUSA';play.classList.add('playing');status.textContent=sel.options[sel.selectedIndex].text+' · ON AIR'};
    audio.onpause=()=>{play.textContent='PLAY';play.classList.remove('playing');if(radioPane.classList.contains('open'))status.textContent='RADIO EN PAUSA'};
    renderScreenGrid();view('flyers');return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;const a=wireKit(),b=installScreenTools();if((a&&b)||tries>30)clearInterval(timer)},300);
  document.documentElement.setAttribute('data-hhv-recovery','v2.9.4-kits-radio-touch-3tabs');
})();
</script>`;
      body = body.replace('</head>', css + '</head>').replace('</body>', html + js + '</body>');
    }
    res.statusCode = statusCode;
    for (const [k,v] of Object.entries(headers)) res.setHeader(k,v);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-HHV-Version','2.9.4-recovery-kits-radio-touch-3tabs');
    return res.end(body);
  } catch (err) {
    console.error('HHV recovery renderer error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag','noindex');
    return res.end('HHV recovery renderer error');
  }
};
