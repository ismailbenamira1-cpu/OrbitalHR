import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
test('Staged legal content matches the approved-source drafts exactly, without invented changes',async()=>{
  const legal=await import('../src/legal/legalDraftContent.js');
  assert.equal(legal.LEGAL_APPROVED,false);
  assert.equal(legal.LEGAL_DRAFTS.privacy,read('../docs/GATE5_PRIVACY_NOTICE_DRAFT.md'));
  assert.equal(legal.LEGAL_DRAFTS.terms,read('../docs/GATE5_TERMS_OF_SERVICE_DRAFT.md'));
});
test('Legal draft pages are not imported by the public site entrypoints',()=>{
  for(const path of ['../src/App.jsx','../src/main.jsx']){
    const code=read(path);
    assert.doesNotMatch(code,/from\s*['"][^'"]*legal\/LegalPages(?:\.jsx)?['"]/);
    assert.doesNotMatch(code,/import\s*\(['"][^'"]*legal\/LegalPages(?:\.jsx)?['"]\)/);
  }
  const component=read('../src/legal/LegalPages.jsx');
  assert.match(component,/if\(!LEGAL_APPROVED\)/);
  assert.match(component,/if\(!LEGAL_APPROVED\) return null/);
});
test('Current MVP footer offers contact rather than links to unpublished legal pages',()=>{
  const app=read('../src/App.jsx');
  assert.match(app,/Privacy Policy and Terms of Service: in preparation/);
  assert.match(app,/mailto:ismailbenamira1@gmail.com/);
  assert.doesNotMatch(app,/href=["']\/(?:privacy|terms)["']/);
});
