import React from 'react';
import { LEGAL_DRAFTS, LEGAL_APPROVED } from './legalDraftContent.js';

// STAGING COMPONENT: not imported by src/App.jsx or src/main.jsx.
// Do not enable public URLs before the legal owner approves the source documents.
function inlineParts(text){
  return String(text).split(/(\*\*[^*]+\*\*)/g).map((part,i)=>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold">{part.slice(2,-2)}</strong>
      : part
  );
}
function MarkdownSections({source}){
  const sections=source.replace(/\r\n/g,'\n').split(/\n\s*\n/).filter(Boolean);
  return <div className="space-y-5 text-sm leading-7 text-slate-700">
    {sections.map((block,i)=>{
      const heading=/^(#{1,3}) (.*)$/.exec(block);
      if(heading){
        const rest=block.slice(heading[0].length).trim();
        return <section key={i} className="space-y-2">
          {heading[1].length===1
            ? <h1 className="text-3xl font-bold text-slate-950">{heading[2]}</h1>
            : <h2 className="text-xl font-semibold text-slate-900">{heading[2]}</h2>}
          {rest && <p className="whitespace-pre-line">{inlineParts(rest)}</p>}
        </section>;
      }
      if(block.split('\n').every(line=>/^[-*] /.test(line))){
        return <ul key={i} className="list-disc space-y-1 pl-6">{block.split('\n').map((line,j)=><li key={j}>{inlineParts(line.slice(2))}</li>)}</ul>;
      }
      return <p key={i} className="whitespace-pre-line">{inlineParts(block)}</p>;
    })}
  </div>;
}

export function LegalPage({type='privacy'}){
  // Fail closed even if a developer accidentally mounts this component prematurely.
  if(!LEGAL_APPROVED) return <main className="mx-auto max-w-3xl px-5 py-16">
    <h1 className="text-2xl font-bold text-slate-900">Legal information is being prepared</h1>
    <p className="mt-3 text-slate-600">The Privacy Policy and Terms of Service are not yet published.</p>
    <p className="mt-3 text-slate-600">Privacy inquiries: <a className="text-indigo-700 underline" href="mailto:ismailbenamira1@gmail.com">ismailbenamira1@gmail.com</a></p>
    <a className="mt-7 inline-block text-indigo-700 underline" href="/">Return to OrbitalHR</a>
  </main>;
  const source=LEGAL_DRAFTS[type];
  if(!source) return <p>Page not found.</p>;
  return <main className="mx-auto max-w-4xl px-5 py-12">
    <nav className="mb-7 flex gap-5 text-sm text-indigo-700">
      <a href="/">OrbitalHR</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a>
    </nav>
    <MarkdownSections source={source}/>
  </main>;
}

export function StagedLegalFooterLinks(){
  // Hidden until source approval AND page route wiring, to avoid broken policy links.
  if(!LEGAL_APPROVED) return null;
  return <nav aria-label="Legal" className="flex flex-wrap gap-4 text-xs">
    <a className="underline hover:text-indigo-700" href="/privacy">Privacy Policy</a>
    <a className="underline hover:text-indigo-700" href="/terms">Terms of Service</a>
  </nav>;
}
