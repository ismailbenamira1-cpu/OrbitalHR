import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest as copilot } from '../functions/api/compliance-assistant.js';
import { onRequest as brief } from '../functions/api/employee-summary.js';
import { onRequest as diagnostic } from '../functions/api/ai-diagnostic.js';

const ID='123e4567-e89b-12d3-a456-426614174000';
const API='https://demo.supabase.co';
const env={SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',ANTHROPIC_API_KEY:'mock'};
const row={id:ID,employee_name:'Server-owned employee',home_country:'United States',host_region:'United Kingdom',role_level:'Individual Contributor',days_used:46,current_setup:'Home Payroll',certificate_status:'Issued',visa_authorized_days:180,visa_extension_status:'Not approved',visa_extended_days:null};
function req(body,{token=true,origin=null,method='POST'}={}){
  const headers={'Content-Type':'application/json'};
  if(token)headers.Authorization='Bearer valid-token';
  if(origin)headers.Origin=origin;
  return new Request('https://app.example.test/api/ai',{method,headers,body:JSON.stringify(body)});
}
function mockNetwork({approved=true,valid=true}={}){
  const requested=[];
  const fake=async (url,options={})=>{
    requested.push({url,options});
    if(url.endsWith('/auth/v1/user')) return Response.json(valid?{id:'user-1',aud:'authenticated'}:{}, {status:valid?200:401});
    if(url.includes('consume_ai_daily_quota'))return Response.json(approved);
    if(url.includes('employee_rosters'))return Response.json([row]);
    if(url.includes('api.anthropic.com'))return Response.json({content:[{type:'text',text:'Mock compliance guidance'}]});
    throw Error('Unexpected network call: '+url);
  };
  return {fake,requested};
}
test('server-owned roster and authenticated AI contract',async()=>{
  const previous=globalThis.fetch;
  try {
    for(const [handler,body] of [
      [copilot,{query:'What are my risks?',roster:[{name:'Forged employee',hostRegion:'Mexico'}]}],
      [brief,{employeeId:ID,employee:{name:'Forged employee'}}],
    ]){
      const net=mockNetwork();
      globalThis.fetch=net.fake;
      const result=await handler({request:req(body),env});
      const json=await result.json();
      assert.equal(json.success,true);
      assert.equal(net.requested.filter(x=>x.url.includes('/auth/v1/user')).length,1);
      assert.equal(net.requested.filter(x=>x.url.includes('consume_ai_daily_quota')).length,1);
      const ai=net.requested.find(x=>x.url.includes('api.anthropic.com'));
      assert.ok(ai);
      const prompt=JSON.parse(ai.options.body);
      const payload=JSON.parse(prompt.messages.at(-1).content);
      assert.equal(payload.employee?.name ?? payload.roster[0].name,'Server-owned employee');
      assert.ok(!JSON.stringify(payload).includes('Forged employee'));
      assert.match(prompt.system,/tax (?:residence|residency) is not a breach/i);
    }
  }finally{globalThis.fetch=previous;}
});
test('unauthenticated, cross-site, expired, quota denied and wrong employee fail closed',async()=>{
  const previous=globalThis.fetch;
  try{
    const net=mockNetwork();globalThis.fetch=net.fake;
    let r=await copilot({request:req({query:'hello'},{token:false}),env});
    assert.equal(r.status,401);assert.equal(net.requested.length,0);
    r=await copilot({request:req({query:'hello'},{origin:'https://evil.example'}),env});
    assert.equal(r.status,403);assert.equal(net.requested.length,0);
    globalThis.fetch=mockNetwork({valid:false}).fake;
    r=await copilot({request:req({query:'hello'}),env});assert.equal(r.status,401);
    globalThis.fetch=mockNetwork({approved:false}).fake;
    r=await copilot({request:req({query:'hello'}),env});assert.equal(r.status,429);
    globalThis.fetch=mockNetwork().fake;
    r=await brief({request:req({employeeId:'123e4567-e89b-12d3-a456-426614174999'}),env});
    assert.equal(r.status,404);
    r=await copilot({request:req({query:'hello'}),env:{}});assert.equal(r.status,503);
    r=await brief({request:req({employeeId:'demo-1'}),env});assert.equal(r.status,400);
  }finally{globalThis.fetch=previous;}
});

test('incomplete employee AI output falls back to a comprehensive, source-grounded brief',async()=>{
  const previous=globalThis.fetch;
  try{
    const net=mockNetwork();globalThis.fetch=net.fake;
    const response=await brief({request:req({employeeId:ID}),env});
    assert.equal(response.status,200);
    const data=await response.json();
    assert.equal(data.mode,'structured-screening');
    assert.equal(data.success,true);
    for(const heading of ['IMMIGRATION & WORK PERMISSION','EMPLOYER PERMANENT ESTABLISHMENT','INDIVIDUAL TAX RESIDENCY','SOCIAL SECURITY','PRIORITIZED NEXT STEPS','PAYROLL & EOR FEASIBILITY','INFORMATION STILL NEEDED']){
      assert.ok(data.summary.includes(heading),'Missing '+heading);
    }
    assert.match(data.summary,/Server-owned employee/);
    assert.match(data.summary,/Certificate status:/);
    assert.match(data.summary,/HOLD:/);
    assert.doesNotMatch(data.summary,/forged employee/i);
  }finally{globalThis.fetch=previous;}
});
test('a generic roster answer is replaced with each saved employee and all four screening tracks',async()=>{
  const previous=globalThis.fetch;
  try{
    const net=mockNetwork();globalThis.fetch=net.fake;
    const response=await copilot({request:req({query:'Which employees in my saved roster require compliance review? Explain immigration, employer PE, individual tax residency and social security separately.'}),env});
    const data=await response.json();
    assert.equal(data.success,true);
    assert.equal(data.mode,'structured-screening');
    for(const label of ['Server-owned employee','Immigration:','Employer PE:','Individual tax residency:','Social security:','Next action:','Payroll:','MISSING INFORMATION']){
      assert.ok(data.answer.includes(label),'Missing '+label);
    }
    assert.ok(data.answer.length>1200,'Roster assessment should be substantive');
    assert.doesNotMatch(data.answer,/forged employee/i);
  }finally{globalThis.fetch=previous;}
});

test('Gemini 3.8 Flash is default for both authenticated AI endpoints',async()=>{
  const prev=globalThis.fetch;
  const geminiEnv={SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'gemini-mock-key'};
  try {
    for(const [handler,body] of [[copilot,{query:'What do I review next?'}],[brief,{employeeId:ID}]]){
      const requested=[];
      globalThis.fetch=async(url,options={})=>{
        requested.push(url);
        if(url.endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
        if(url.includes('consume_ai_daily_quota'))return Response.json(true);
        if(url.includes('employee_rosters'))return Response.json([row]);
        if(url.includes('generativelanguage.googleapis.com'))return Response.json({candidates:[{content:{parts:[{text:'Relevant evidence-based answer with next steps.'}]}}]});
        throw Error('Unexpected '+url);
      };
      const result=await handler({request:req(body),env:geminiEnv});
      assert.equal(result.status,200);
      const output=await result.json();
      assert.equal(output.success,true);
      assert.equal(requested.filter(url=>url.includes('generativelanguage.googleapis.com')).length,1);
      assert.match(requested.find(url=>url.includes('generativelanguage.googleapis.com')),/models\/gemini-3\.8-flash:generateContent/);
      assert.ok(!requested.some(url=>url.includes('gemini-2.5')));
    }
  }finally{globalThis.fetch=prev;}
});
test('Gemini legacy override 404 falls back to supported Flash, not another retired model',async()=>{
  const prev=globalThis.fetch;
  const configured={SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'gemini-mock-key',GEMINI_MODEL:'gemini-2.5-flash'};
  const attempted=[];
  try {
    globalThis.fetch=async(url,options={})=>{
      if(url.endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
      if(url.includes('consume_ai_daily_quota'))return Response.json(true);
      if(url.includes('employee_rosters'))return Response.json([row]);
      if(url.includes('generativelanguage.googleapis.com')){
        attempted.push(url);
        if(url.includes('gemini-2.5-flash'))return Response.json({error:{message:'No longer available to new users'}},{status:404});
        return Response.json({candidates:[{content:{parts:[{text:'Success with current Gemini.'}]}}]});
      }
      throw Error('Unexpected '+url);
    };
    const result=await copilot({request:req({query:'Who needs attention?'}),env:configured});
    assert.equal(result.status,200);
    assert.equal((await result.json()).success,true);
    assert.equal(attempted.length,2);
    assert.match(attempted[0],/gemini-2\.5-flash/);
    assert.match(attempted[1],/gemini-3\.8-flash/);
  }finally{globalThis.fetch=prev;}
});
test('Gemini 401 fails fast instead of trying additional paid models',async()=>{
  const prev=globalThis.fetch;
  const attempted=[];
  try {
    globalThis.fetch=async(url,options={})=>{
      if(url.endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
      if(url.includes('consume_ai_daily_quota'))return Response.json(true);
      if(url.includes('employee_rosters'))return Response.json([row]);
      if(url.includes('generativelanguage.googleapis.com')){
        attempted.push(url);
        return Response.json({error:{message:'Invalid API key'}},{status:401});
      }
      throw Error('Unexpected '+url);
    };
    const r=await copilot({request:req({query:'Who needs attention?'}),env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'invalid'}});
    assert.equal(r.status,503);
    assert.equal(attempted.length,1);
  }finally{globalThis.fetch=prev;}
});

test('Gemini 3.8 request uses supported low thinking config without deprecated temperature',async()=>{
  const previous=globalThis.fetch;
  try{
    const upstream=[];
    globalThis.fetch=async(url,options={})=>{
      if(url.endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
      if(url.includes('consume_ai_daily_quota'))return Response.json(true);
      if(url.includes('employee_rosters'))return Response.json([row]);
      if(url.includes('generativelanguage.googleapis.com')){
        upstream.push(JSON.parse(options.body));
        return Response.json({candidates:[{content:{parts:[{text:'Good response.'}]}}]});
      }
      throw Error('Unexpected '+url);
    };
    const r=await copilot({request:req({query:'What requires review?'}),env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'mock'}});
    assert.equal(r.status,200);
    assert.equal(upstream.length,1);
    assert.equal(upstream[0].generationConfig.thinkingConfig.thinkingLevel,'low');
    assert.equal('temperature' in upstream[0].generationConfig,false);
  }finally{globalThis.fetch=previous;}
});
test('Gemini network outage provides a transparently labeled source-based overview and employee brief',async()=>{
 const previous=globalThis.fetch;
 try{
   globalThis.fetch=async(url,options={})=>{
     if(url.endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
     if(url.includes('consume_ai_daily_quota'))return Response.json(true);
     if(url.includes('employee_rosters'))return Response.json([row]);
     if(url.includes('generativelanguage.googleapis.com'))throw new TypeError('fetch failed');
     throw Error('Unexpected '+url);
   };
   const e={SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'mock'};
   const r=await copilot({request:req({query:'Which employees in my saved roster require compliance review?'}),env:e});
   assert.equal(r.status,200);
   const report=await r.json();
   assert.equal(report.mode,'offline-screening');
   assert.equal(report.providerAvailable,false);
   assert.match(report.notice,/not by the AI provider/);
   assert.match(report.answer,/Social security:/);
   const b=await brief({request:req({employeeId:ID}),env:e});
   assert.equal(b.status,200);
   const bp=await b.json();
   assert.equal(bp.mode,'offline-screening');
   assert.equal(bp.providerAvailable,false);
   assert.match(bp.brief,/SOCIAL SECURITY/);
   assert.match(bp.brief,/PAYROLL & EOR FEASIBILITY/);
   const narrow=await copilot({request:req({query:'hello'}),env:e});
   assert.equal(narrow.status,503);
   assert.match((await narrow.json()).error,/could not be reached/);
 }finally{globalThis.fetch=previous;}
});

test('non-generating Gemini connectivity probe authenticates and returns model metadata status',async()=>{
 const previous=globalThis.fetch;
 try {
   const requests=[];
   globalThis.fetch=async(url,options={})=>{
     requests.push(String(url));
     if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'user-1',aud:'authenticated'});
     if(String(url).includes('generativelanguage.googleapis.com/v1beta/models/'))return Response.json({name:'models/gemini-3.8-flash'});
     throw Error('Unexpected '+url);
   };
   const request=new Request('https://app.example.test/api/ai-diagnostic',{headers:{authorization:'Bearer valid-token'}});
   const res=await diagnostic({request,env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'test',GEMINI_API_KEY:'mock'}});
   assert.equal(res.status,200);
   const body=await res.json();
   assert.equal(body.success,true);
   assert.equal(body.httpStatus,200);
   assert.equal(body.model,'gemini-3.8-flash');
   assert.equal(requests.length,2);
   assert.ok(!requests.some(x=>x.includes('generateContent')));
   assert.ok(!requests.some(x=>x.includes('consume_ai_daily_quota')));
   const noAuth=await diagnostic({request:new Request('https://app.example.test/api/ai-diagnostic'),env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'test',GEMINI_API_KEY:'mock'}});
   assert.equal(noAuth.status,401);
 } finally {globalThis.fetch=previous;}
});
test('Gemini diagnostic does not disclose provider response or credentials on failure',async()=>{
 const previous=globalThis.fetch;
 try{
  globalThis.fetch=async(url)=>{
    if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'user-1',aud:'authenticated'});
    if(String(url).includes('generativelanguage.googleapis.com'))return Response.json({error:{message:'private diagnostic secret'}},{status:403});
    throw Error('Unexpected '+url);
  };
  const request=new Request('https://app.example.test/api/ai-diagnostic',{headers:{authorization:'Bearer valid-token'}});
  const res=await diagnostic({request,env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'test',GEMINI_API_KEY:'never-expose-this'}});
  assert.equal(res.status,502);
  const text=await res.text();
  assert.match(text,/credential-or-permission/);
  assert.doesNotMatch(text,/private diagnostic secret|never-expose-this/);
 }finally{globalThis.fetch=previous;}
});

test('minimal generation diagnostic sends only fixed prompt and consumes quota once',async()=>{
 const prev=globalThis.fetch;const requested=[];
 try{
   globalThis.fetch=async(url,options={})=>{
     requested.push({url:String(url),options});
     if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
     if(String(url).includes('consume_ai_daily_quota'))return Response.json(true);
     if(String(url).includes('generateContent'))return Response.json({candidates:[{content:{parts:[{text:'READY'}]},finishReason:'STOP'}]});
     throw Error('Unexpected '+url);
   };
   const request=new Request('https://app.example.test/api/ai-diagnostic',{method:'POST',headers:{authorization:'Bearer valid-token'}});
   const response=await diagnostic({request,env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'mock'}});
   assert.equal(response.status,200);
   const data=await response.json();
   assert.equal(data.stage,'generation');
   assert.equal(data.success,true);
   assert.equal(data.outputChars,5);
   assert.equal(requested.filter(x=>x.url.includes('consume_ai_daily_quota')).length,1);
   assert.equal(requested.filter(x=>x.url.includes('generateContent')).length,1);
   const content=JSON.stringify(JSON.parse(requested.at(-1).options.body));
   assert.match(content,/Reply with the single word READY/);
   assert.doesNotMatch(content,/Server-owned employee/);
   assert.equal(JSON.parse(requested.at(-1).options.body).generationConfig.maxOutputTokens,48);
 }finally{globalThis.fetch=prev;}
});
test('minimal generation diagnostic maps upstream provider failures without leaking secrets',async()=>{
 const prev=globalThis.fetch;
 try{
   globalThis.fetch=async(url)=>{
     if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'test',aud:'authenticated'});
     if(String(url).includes('consume_ai_daily_quota'))return Response.json(true);
     if(String(url).includes('generateContent'))return Response.json({error:{message:'private google account information'}},{status:400});
     throw Error('Unexpected '+url);
   };
   const request=new Request('https://app.example.test/api/ai-diagnostic',{method:'POST',headers:{authorization:'Bearer valid-token'}});
   const response=await diagnostic({request,env:{SUPABASE_URL:API,SUPABASE_ANON_KEY:'public-test-key',GEMINI_API_KEY:'do-not-expose'}});
   assert.equal(response.status,502);
   const raw=await response.text();
   assert.match(raw,/request-invalid/);
   assert.doesNotMatch(raw,/private google account information|do-not-expose/);
 }finally{globalThis.fetch=prev;}
});
