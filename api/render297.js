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

      const recovery = `
<script>
(function HHVFlyerRailRecovery(){
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
    res.setHeader('X-HHV-Version', '2.9.7-preview-drive-first-effective');
    return res.end(body);
  } catch (error) {
    console.error('HHV render297 wrapper error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end('HHV render297 wrapper error');
  }
};
