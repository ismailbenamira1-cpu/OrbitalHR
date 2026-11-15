import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/early-access.js';

const env={SUPABASE_URL:'https://demo.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_local_test',TURNSTILE_SECRET:'turnstile-local-test',TURNSTILE_EXPECTED_HOSTNAME:'orbitalhr.pages.dev'};
const payload={work_email:'person@example.com',company_name:'Synthetic Company',company_size:'50-100',target_countries:'United Kingdom',consent:true,turnstile_token:'synthetic-test-token'};
const req=(p=payload,headers={})=>new Request('https://orbitalhr.pages.dev/api/early-access',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://orbitalhr.pages.dev',...headers},body:JSON.stringify(p)});

test('Gate 4 rejects cross-origin, invalid submissions, missing challenge and missing server secrets without network access',async()=>{
 const original=globalThis.fetch;
 try{
   let calls=0;globalThis.fetch=()=>{calls++;throw Error('unexpected fetch');};
   let res=await onRequest({request:req(payload,{Origin:'https://evil.example'}),env});assert.equal(res.status,403);
   res=await onRequest({request:req({...payload,work_email:'bad'}),env});assert.equal(res.status,400);
   res=await onRequest({request:req({...payload,turnstile_token:''}),env});assert.equal(res.status,400);
   res=await onRequest({request:req(payload),env:{}});assert.equal(res.status,503);
   assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test('Gate 4 only inserts after Turnstile success with correct hostname and action, and does not leak backend secrets',async()=>{
 const original=globalThis.fetch;const calls=[];
 try{
   globalThis.fetch=async(url,init)=>{
     calls.push({url:String(url),init});
     if(String(url).includes('/siteverify'))return Response.json({success:true,hostname:'orbitalhr.pages.dev',action:'early_access'});
     if(String(url).includes('/rest/v1/early_access_leads'))return new Response(null,{status:201});
     throw Error('Unexpected request');
   };
   const res=await onRequest({request:req(),env});
   assert.equal(res.status,201);assert.equal((await res.json()).success,true);
   assert.equal(calls.length,2);
   const verification=JSON.parse(calls[0].init.body);
   assert.equal(verification.secret,env.TURNSTILE_SECRET);
   const dbBody=JSON.parse(calls[1].init.body);
   assert.equal(dbBody.work_email,payload.work_email);
   assert.equal(dbBody.turnstile_token,undefined);
   assert.equal(calls[1].init.headers.apikey,env.SUPABASE_SECRET_KEY);
   assert.equal(calls[1].init.headers.Authorization,undefined);
 }finally{globalThis.fetch=original;}
});
test('Gate 4 rejects failed or mismatched Turnstile tokens before database write',async()=>{
 const original=globalThis.fetch;
 try{
  for(const result of [
    {success:false,hostname:'orbitalhr.pages.dev',action:'early_access'},
    {success:true,hostname:'untrusted.example',action:'early_access'},
    {success:true,hostname:'orbitalhr.pages.dev',action:'other_action'},
  ]){
    let writes=0;
    globalThis.fetch=async(url)=>{if(String(url).includes('/siteverify'))return Response.json(result);writes++;throw Error('DB should not be reached');};
    const res=await onRequest({request:req(),env});
    assert.equal(res.status,403);
    assert.equal(writes,0);
  }
 }finally{globalThis.fetch=original;}
});
