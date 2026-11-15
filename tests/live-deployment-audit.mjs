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
    const body = (await response.text()).slice(0, 1200000);
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
      const frontendSupabaseConfigured = js.body.includes('https://icqxruzjlnykxvpgzoyh.supabase.co');
      note('Frontend Supabase URL embedded in production bundle',frontendSupabaseConfigured,frontendSupabaseConfigured?'Project URL configured':'Frontend build has no recognizable Supabase project URL');
      // Gate 6: Verify the actual PUBLIC JS bundle contains the current safe-screening release.
      // A successful API probe alone can pass against an older deployment.
      const releaseMarkers=[
        'Screen cross-border mobility risks before making HR decisions.',
        '7 Modeled Destinations',
        'Pre-launch evaluation: use fictional employee records only.',
        'Screening only — not legal advice'
      ];
      for(const marker of releaseMarkers)note('Live frontend release marker: '+marker,js.body.includes(marker));
      note('Legacy unverified-rules advertising absent',!js.body.includes('Verified 2026 Global Tax & Visa Rules'));
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
    // Gate 3: Check authentication failures without supplying a real user or incurring AI usage.
    const validBody=path.includes('compliance')?data:JSON.stringify({employeeId:'123e4567-e89b-12d3-a456-426614174000'});
    const badToken=await probe(path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer invalid-gate3-token'},body:validBody});
    note(path+' rejects forged bearer',badToken.response?.status===401,'status '+(badToken.response?.status??badToken.error));
    const crossSite=await probe(path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer invalid-gate3-token',Origin:'https://untrusted.invalid'},body:validBody});
    note(path+' rejects cross-origin POST',crossSite.response?.status===403,'status '+(crossSite.response?.status??crossSite.error));
  }
  // Gate 6: Read-only / harmless probes for the early-access path.
  // Never submit a valid lead or exhaust rate limits in this audit.
  const invalidLead=await probe('/api/early-access',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({work_email:'invalid',company_name:'',consent:false})
  });
  note('/api/early-access rejects invalid input',invalidLead.response?.status===400,'status '+(invalidLead.response?.status??invalidLead.error));
  const foreignLead=await probe('/api/early-access',{
    method:'POST',
    headers:{'Content-Type':'application/json',Origin:'https://untrusted.invalid'},
    body:JSON.stringify({work_email:'invalid',company_name:'',consent:false})
  });
  note('/api/early-access rejects cross-origin',foreignLead.response?.status===403,'status '+(foreignLead.response?.status??foreignLead.error));
  const invalidChallenge=await probe('/api/early-access',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({work_email:'gate6@example.invalid',company_name:'Fictional Gate Six',company_size:'50-100',target_countries:'Canada',consent:true,turnstile_token:''})
  });
  note('/api/early-access rejects missing human challenge',invalidChallenge.response?.status===400,'status '+(invalidChallenge.response?.status??invalidChallenge.error));
  // No auth token: the Gemini diagnostics endpoint must remain unavailable to visitors.
  const health=await probe('/api/ai-diagnostic');
  note('/api/ai-diagnostic requires authentication',health.response?.status===401,'status '+(health.response?.status??health.error));
  console.log(JSON.stringify({verdict,checks:rows},null,2));
  if(verdict!=='PASS')process.exitCode=1;
}
