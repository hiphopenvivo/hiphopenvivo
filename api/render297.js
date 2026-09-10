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
      const recovery = `
<script>
(function HHVFlyerRailRecovery(){
  try{
    window.img=function(e){
      var u=(typeof F!=='undefined'&&F[e.id])||e.flyer_url||'';
      var id=typeof driveId==='function'?driveId(u):'';
      if(id)return '/api/flyer?id='+encodeURIComponent(id);
      if(u)return u;
      var src=typeof http==='function'?http(e.source_url):String(e.source_url||'');
      return (typeof igSource==='function'&&igSource(src))?('/api/igflyer?url='+encodeURIComponent(src)):'';
    };
    window.sourceKind=function(e){
      var u=(typeof F!=='undefined'&&F[e.id])||e.flyer_url||'';
      var id=typeof driveId==='function'?driveId(u):'';
      if(id||u)return 'drive';
      var src=typeof http==='function'?http(e.source_url):String(e.source_url||'');
      return (typeof igSource==='function'&&igSource(src))?'ig':'';
    };
    window.flyerRailRows=function(){
      var today=typeof ymd==='function'?ymd(new Date()):'';
      var all=(typeof E!=='undefined'?E:[]).filter(function(e){return typeof igSource==='function'&&igSource(e.source_url)&&img(e)});
      var future=all.filter(function(e){return String(e.date||'').slice(0,10)>=today});
      var rows=(future.length?future:all).slice();
      var pin='rxnde-akozta-la-plata-2026-09-24';
      rows.sort(function(a,b){if(a.id===pin)return -1;if(b.id===pin)return 1;return String(a.date||'').localeCompare(String(b.date||''))});
      return rows.slice(0,30);
    };
  }catch(_err){}

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
      if(tries>=40){
        clearInterval(timer);
        document.documentElement.setAttribute('data-hhv-flyer-rail','error');
      }
    }
  },500);
})();
</script>`;
      body = body.replace('</body>', recovery + '</body>');
    }

    res.statusCode = statusCode;
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-HHV-Version', '2.9.7-preview-hhv-doc-rxnde');
    return res.end(body);
  } catch (error) {
    console.error('HHV render297 wrapper error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end('HHV render297 wrapper error');
  }
};
