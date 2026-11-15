import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest as copilot } from '../functions/api/compliance-assistant.js';
import { onRequest as brief } from '../functions/api/employee-summary.js';

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
      assert.match(prompt.system,/Tax residency is not a (violation|breach)/i);
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
