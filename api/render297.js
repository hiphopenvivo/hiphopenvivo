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
    res.setHeader('X-HHV-Version', '2.9.7-preview-drive-links-recovery');
    return res.end(body);
  } catch (error) {
    console.error('HHV render297 wrapper error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end('HHV render297 wrapper error');
  }
};
