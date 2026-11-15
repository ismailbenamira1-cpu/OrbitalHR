// Read-only live deployment audit. No credentials or production data are used.
import assert from 'node:assert/strict';

const base = process.env.ORBITAL_LIVE_URL || 'https://orbitalhr.pages.dev';
const rows = [];
async function probe(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(new URL(path, base), { ...init, redirect: 'follow', signal: controller.signal, headers: { ...(init.headers || {}), 'Cache-Control': 'no-cache' } });
    const contentType = response.headers.get('content-type') || '';
    const body = (await response.text()).slice(0, 150000);
    rows.push({ path, status: response.status, contentType, redirected: response.redirected, url: response.url });
    return { response, body, contentType };
  } catch (e) {
    rows.push({ path, error: e.message });
    return { error: e.message };
  } finally { clearTimeout(timer); }
}
const home = await probe('/');
if (!home.response) {
  console.log(JSON.stringify({ verdict:'UNREACHABLE', checks:rows },null,2));
  process.exitCode=1;
} else {
  let verdict='PASS';
  function note(name, pass, detail='') {
    console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
    if (!pass) verdict='FAIL';
  }
  note('HTTPS and successful index',home.response.status===200 && home.response.url.startsWith('https://'),String(home.response.status));
  note('HTML shell',home.contentType.includes('text/html')&&home.body.includes('<div id="root"></div>'));
  const scripts=[...home.body.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m=>m[1]);
  const asset=scripts.find(s=>s.includes('/assets/')&&s.includes('.js'));
  note('Built JS script referenced',!!asset,asset||'No Vite JS script');
  if(asset) {
    const js=await probe(asset);
    note('JS bundle exists',js.response?.status===200 && js.contentType.includes('javascript'));
    if(js.body){
      const screens=['Cross-Border Mobility Screening','Screening-only MVP','sign in to save'];
      for(const marker of screens)note('Latest MVP text: '+marker,js.body.includes(marker));
    }
  }
  const data=JSON.stringify({query:'Anonymous verification only'});
  for (const path of ['/api/compliance-assistant','/api/employee-summary']) {
    const get=await probe(path);
    note(path+' GET should reject',get.response?.status===405,'status '+(get.response?.status??get.error));
    const post=await probe(path,{method:'POST',headers:{'Content-Type':'application/json'},body:path.includes('compliance')?data:JSON.stringify({employeeId:'123e4567-e89b-12d3-a456-426614174000'})});
    const status=post.response?.status;
    note(path+' anonymous POST rejects',status===401||status===503,'status '+(status??post.error));
    if(post.contentType)note(path+' returns JSON not static fallback',post.contentType.includes('application/json'),post.contentType);
    if(status===503)console.log('CONFIG: Endpoint fail-closed with 503; check Cloudflare Functions SUPABASE_URL and SUPABASE_ANON_KEY bindings');
  }
  console.log(JSON.stringify({verdict,checks:rows},null,2));
  if(verdict!=='PASS')process.exitCode=1;
}
