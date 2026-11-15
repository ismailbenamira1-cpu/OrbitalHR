import { evaluateEmployee } from './data/evaluateEmployee.js';
import TurnstileWidget from './TurnstileWidget.jsx';
import { reportingEmployee, buildComplianceCsv } from './data/reporting.js';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  Globe,
  Users,
  DollarSign,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  LogIn,
  LogOut,
  Database,
  Building2,
  Clock,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { HOMES, HOSTS, PILLARS, PILLAR_TITLES, evaluatePillars, hostSummary, worstLevel, buildMatrix } from './data/corridors';

const DEFAULT_EMPLOYEES = [
  {
    id: 'demo-1',
    certificateStatus: 'Filed',
    name: 'Maya Lin',
    homeCountry: 'United States',
    hostRegion: 'Schengen Area',
    role: 'Sales / Revenue',
    daysUsed: 74,
    currentSetup: 'Home Payroll',
  },
  {
    id: 'demo-2',
    name: "Liam O'Connor",
    homeCountry: 'Canada',
    hostRegion: 'India',
    role: 'Manager / Team Lead',
    daysUsed: 162,
    currentSetup: 'Home Payroll',
  },
  {
    id: 'demo-3',
    name: 'Sofia Martinez',
    homeCountry: 'United States',
    hostRegion: 'Mexico',
    role: 'Individual Contributor',
    daysUsed: 210,
    currentSetup: 'EOR ($599/mo)',
  },
  {
    id: 'demo-4',
    certificateStatus: 'Issued',
    name: 'David Park',
    homeCountry: 'Canada',
    hostRegion: 'United Kingdom',
    role: 'Individual Contributor',
    daysUsed: 42,
    currentSetup: 'Home Payroll',
  },
  {
    id: 'demo-5',
    name: 'Priya Nair',
    homeCountry: 'United States',
    hostRegion: 'Thailand',
    role: 'Individual Contributor',
    daysUsed: 158,
    currentSetup: 'Home Payroll',
  },
  {
    id: 'demo-6',
    name: 'Lucas Vance',
    homeCountry: 'Canada',
    hostRegion: 'Philippines',
    role: 'Manager / Team Lead',
    daysUsed: 195,
    currentSetup: 'EOR ($599/mo)',
  },
];

const LEVEL_STYLE = {
  OK: 'bg-emerald-100 text-emerald-800',
  WATCH: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
  BREACH: 'bg-rose-700 text-white',
};

function LevelBadge({ level }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[level] || LEVEL_STYLE.OK}`}>
      {level === 'BREACH' ? 'ESCALATE' : level}
    </span>
  );
}

function ConfidenceBadge({ conf }) {
  const label = { verified: 'Source reference identified · legal review pending', secondary: 'Secondary reference · legal review pending', verify: 'Source/legal review required' };
  return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-800">{label[conf] || label.verify}</span>;
}

function PillarMeter({ p }) {
  if (p.reviewRequired) return <div className="mt-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900"><strong>{p.pillar === 'visa' ? 'Authorised stay review required' : 'Country-specific review required'}</strong><p>{p.action}</p></div>;
  return (
    <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
      <div className="flex items-center justify-between">
        <LevelBadge level={p.level} />
        <span className="text-slate-500">
          {p.days}d · Watch {p.watchAt} · Critical {p.criticalAt} · Limit {p.limit}
        </span>
      </div>
      <p className="mt-1.5 font-medium text-slate-800">{p.action}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
        Internal source category: {p.conf} · Review status: {p.lastVerified} · No legal clearance
      </p>
    </div>
  );
}

function MatrixPanel() {
  const [home, setHome] = useState('United States');
  const cells = useMemo(() => buildMatrix().filter((c) => c.home === home), [home]);
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer text-sm font-bold text-slate-900">
        Compliance rules matrix: 2 home countries × 7 hosts × 3 pillars (42 cells)
      </summary>
      <div className="mt-3 flex gap-2">
        {HOMES.map((h) => (
          <button
            key={h}
            onClick={() => setHome(h)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${home === h ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Home: {h}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Host</th>
              {PILLARS.map((p) => (
                <th key={p} className="px-3 py-2">{PILLAR_TITLES[p]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {HOSTS.map((host) => (
              <tr key={host} className="align-top">
                <td className="px-3 py-2 font-semibold text-slate-900">{host}</td>
                {PILLARS.map((p) => {
                  const c = cells.find((x) => x.host === host && x.pillar === p);
                  return (
                    <td key={p} className="px-3 py-2">
                      <div className="text-slate-700">{c.rule}</div>
                      <div className="mt-1 font-semibold text-indigo-700">
                        {c.reviewRequired ? (p === 'visa' ? (c.host === 'Schengen Area' ? 'Rolling travel history required' : 'Actual entry grant required') : 'No regional legal limit — review required') : `Watch ${c.watchAt} · Critical ${c.criticalAt} · Limit ${c.limit}d`}
                      </div>
                      <div className="text-[10px] uppercase text-slate-400"><ConfidenceBadge conf={c.conf} /></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Alert days are Orbital policy settings built on the stay or residency limit (watch at about 67%, critical about 17% before the limit). Social security days
        depend on the certificate status. PE alerts use the host's dedicated PE alert base where one is configured (which can differ from the tax-residency threshold); role factors then apply. Verify each cell with local counsel.
      </p>
    </details>
  );
}

function CopilotPanel({ session, onSignIn }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [testingGeneration, setTestingGeneration] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi, I’m OrbitalCopilot. Ask me about your roster: visa screening, employer PE, individual tax residency, social security, or payroll feasibility.',
    },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    if (!session) { onSignIn(); return; }
    const history = messages.slice(1).slice(-8).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setBusy(true);
    try {
      const { data: refreshed, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !refreshed.session?.access_token) throw new Error('Sign in again to use Copilot.');
      const res = await fetch('/api/compliance-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshed.session.access_token}` },
        body: JSON.stringify({ query: q, history }),
      });
      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch (e) {}
      const answer = data
        ? data.success
          ? data.answer
          : data.error || 'Something went wrong.'
        : `Server replied ${res.status} (${res.headers.get('content-type') || 'no content type'}) instead of JSON: ${raw.slice(0, 120) || '(empty body)'}`;
      setMessages((m) => [...m, { role: 'assistant', content: data?.success && data?.mode === 'offline-screening' ? `${data.notice}\n\n${answer}` : data?.success && data?.mode === 'structured-screening' ? `Structured screening overview (AI response was incomplete).\n\n${answer}` : answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Network problem: ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  async function checkAiConnection() {
    if (diagnosing || busy) return;
    if(!session){onSignIn();return;}
    setDiagnosing(true);
    try {
      const {data: refreshed,error: sessionError}=await supabase.auth.getSession();
      if(sessionError || !refreshed.session?.access_token)throw new Error('Sign in again.');
      const response=await fetch(alt ? '/api/ai-diagnostic?model=gemini-3.5-flash-lite' : '/api/ai-diagnostic',{
        method:'GET',headers:{Authorization:`Bearer ${refreshed.session.access_token}`}
      });
      const result=await response.json();
      const details=result.success
        ? `Gemini model metadata reachable: ${result.model}; HTTP ${result.httpStatus}; ${result.elapsedMs} ms. This does not prove AI generation will succeed.`
        : `Gemini diagnostic: stage=${result.stage || 'unknown'}, category=${result.category || result.error || 'unknown'}, HTTP=${result.httpStatus ?? response.status}, elapsed=${result.elapsedMs ?? 'unknown'} ms. Please share only this status text, not your API key.`;
      setMessages(m=>[...m,{role:'assistant',content:details}]);
    }catch(err) {
      setMessages(m=>[...m,{role:'assistant',content:'AI connectivity test failed: '+err.message}]);
    }finally{setDiagnosing(false);}
  }

  async function checkAiGeneration(alt = false) {
    if (busy || diagnosing || testingGeneration) return;
    if(!session){onSignIn();return;}
    setTestingGeneration(true);
    try{
      const {data: refreshed,error: sessionError}=await supabase.auth.getSession();
      if(sessionError || !refreshed.session?.access_token)throw new Error('Sign in again.');
      const response=await fetch(alt ? '/api/ai-diagnostic?model=gemini-3.5-flash-lite' : '/api/ai-diagnostic',{
        method:'POST',headers:{Authorization:`Bearer ${refreshed.session.access_token}`}
      });
      const result=await response.json();
      const description=result.success
        ? `Minimal Gemini generation succeeded: model=${result.model}, HTTP ${result.httpStatus}, elapsed=${result.elapsedMs} ms, outputChars=${result.outputChars}, finishReason=${result.finishReason}. No employee data was sent.`
        : `Minimal Gemini generation failed: model=${result.model||'unknown'}, stage=${result.stage||'unknown'}, category=${result.category||result.error||'unknown'}, HTTP=${result.httpStatus??response.status}, elapsed=${result.elapsedMs??'unknown'} ms. No employee data was sent.`;
      setMessages(m=>[...m,{role:'assistant',content:description}]);
    }catch(err){
      setMessages(m=>[...m,{role:'assistant',content:'Minimal Gemini generation diagnostic failed: '+err.message}]);
    }finally{setTestingGeneration(false);}
  }

  const starters = ['Who is closest to a visa limit?', 'Who has the highest PE risk?', 'Who needs individual tax review?', 'Who is eligible for payroll feasibility review?'];

  if (!open) {
    return (
      <button
        onClick={() => session ? setOpen(true) : onSignIn()}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
      >
        <MessageSquare className="h-4 w-4" /> Ask Copilot
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[min(42rem,calc(100vh-3rem))] w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
        <span className="text-sm font-semibold">OrbitalCopilot</span>
        <button onClick={() => setOpen(false)} aria-label="Close copilot">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                'max-w-[95%] whitespace-pre-wrap break-words leading-relaxed rounded-xl px-4 py-3 ' +
                (m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800')
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-slate-400">Thinking…</div>}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-indigo-200 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-3 py-2">
        <button type="button" onClick={checkAiConnection} disabled={diagnosing || busy} className="text-xs font-medium text-indigo-700 hover:underline disabled:opacity-50">
          {diagnosing ? 'Checking Gemini connection…' : 'Test Gemini connection (no AI generation)'}
        </button>
        <button type="button" onClick={checkAiGeneration} disabled={testingGeneration || diagnosing || busy} className="ml-3 text-xs font-medium text-indigo-700 hover:underline disabled:opacity-50">
          {testingGeneration ? 'Testing minimal Gemini generation…' : 'Test Gemini generation (one small AI request)'}
        </button>
        <button type="button" onClick={() => checkAiGeneration(true)} disabled={testingGeneration || diagnosing || busy} className="ml-3 text-xs font-medium text-indigo-700 hover:underline disabled:opacity-50">
          {testingGeneration ? 'Testing Gemini…' : 'Test alternative: Gemini 3.5 Flash-Lite'}
        </button>
        <p className="mt-1 text-[10px] text-slate-500">Generation test uses a fixed one-word prompt, sends no employee data, and counts as one AI request.</p>
      </div>
      <div className="border-t border-slate-200 p-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            maxLength={1000}
            placeholder="Ask about your roster…"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => send()}
            disabled={busy}
            aria-label="Send"
            className="rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 px-1 text-[10px] text-slate-400">Relevant roster screening fields and your question/history may be sent to an external AI provider. Stored names are replaced with aliases in structured prompts, but free text and travel details may still identify people. Do not enter unnecessary personal information. AI output is not legal advice.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [selectedId, setSelectedId] = useState(DEFAULT_EMPLOYEES[0].id);
  const [filterMode, setFilterMode] = useState('ALL');
  const [eorFee, setEorFee] = useState(599);
  const [orbitalFee, setOrbitalFee] = useState(55);

  const [showEmpForm, setShowEmpForm] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [empForm, setEmpForm] = useState({
    name: '',
    homeCountry: 'United States',
    hostRegion: 'Schengen Area',
    role: 'Individual Contributor',
    daysUsed: 45,
    currentSetup: 'Home Payroll',
  });

  const [leadForm, setLeadForm] = useState({
    work_email: '',
    company_name: '',
    company_size: '50-100',
    target_countries: '',
  });
  const [leadMessage, setLeadMessage] = useState('');
  const [leadConsent, setLeadConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileAttempt, setTurnstileAttempt] = useState(0);
  const [leadBusy, setLeadBusy] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
  const [rosterLoadError, setRosterLoadError] = useState('');
  const lastSessionUser = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const nextSession=data.session;
      if (nextSession?.user?.id && lastSessionUser.current !== nextSession.user.id) {
        lastSessionUser.current=nextSession.user.id;
        setEmployees([]); setSelectedId(null);
      }
      setSession(nextSession);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUser=nextSession?.user?.id ?? null;
      if (lastSessionUser.current !== nextUser) {
        lastSessionUser.current=nextUser;
        setEmployees(nextUser ? [] : DEFAULT_EMPLOYEES);
        setSelectedId(nextUser ? null : DEFAULT_EMPLOYEES[0].id);
        setAiSummaries({});
        setRosterLoadError('');
      }
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) return;
    let active=true;
    const userId=session.user.id;
    setRosterLoadError('');
    supabase
      .from('employee_rosters')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!active || lastSessionUser.current !== userId) return;
        if (error) { setRosterLoadError('Could not load saved roster. Please refresh or sign in again.'); return; }
        if (data) {
          const mapped = data.map((row) => ({
            id: row.id,
            name: row.employee_name,
            homeCountry: row.home_country,
            hostRegion: row.host_region,
            role: row.role_level,
            daysUsed: row.days_used,
            currentSetup: row.current_setup,
            certificateStatus: row.certificate_status || 'Not filed',
            visaAuthorizedDays: row.visa_authorized_days ?? null,
            visaExtensionStatus: row.visa_extension_status || 'Not approved',
            visaExtendedDays: row.visa_extended_days ?? null,
          }));
          setEmployees(mapped);
          setSelectedId(mapped[0]?.id ?? null);
        }
      });
    return () => { active=false; };
  }, [session?.user?.id]);

  const evaluated = useMemo(
    () => employees.map((e) => evaluateEmployee(e, employees, eorFee, orbitalFee)),
    [employees, eorFee, orbitalFee]
  );

  const filteredEmployees = useMemo(() => {
    if (filterMode === 'CLIFF') return evaluated.filter((e) => e.isCliffAlert);
    if (filterMode === 'GRADUATE') return evaluated.filter((e) => e.payrollReviewEligible);
    if (filterMode === 'PE') return evaluated.filter((e) => e.peRisk !== 'LOW');
    if (filterMode === 'TAX') return evaluated.filter((e) => e.taxResidencyRisk !== 'LOW');
    return evaluated;
  }, [evaluated, filterMode]);

  const kpis = useMemo(() => {
    const cliffCount = evaluated.filter((e) => e.isCliffAlert).length;
    const peHighCount = evaluated.filter((e) => e.peRisk !== 'LOW').length;
    const taxHighCount = evaluated.filter((e) => e.taxResidencyRisk !== 'LOW').length;
    const graduateCount = evaluated.filter((e) => e.payrollReviewEligible).length;
    const totalAnnualSavings = evaluated.reduce((sum, e) => sum + e.annualSavingsVsEor, 0);
    return { cliffCount, peHighCount, taxHighCount, graduateCount, totalAnnualSavings };
  }, [evaluated]);

  const selectedEmployee = useMemo(
    () => evaluated.find((e) => e.id === selectedId) || evaluated[0],
    [evaluated, selectedId]
  );

  async function handleMagicLinkLogin(e) {
    e.preventDefault();
    if (!supabase) {
      setAuthStatus('Connect your Supabase URL & Anon Key in .env first.');
      return;
    }
    setAuthStatus('Sending magic sign-in link...');
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setAuthStatus(`Error: ${error.message}`);
    } else {
      setAuthStatus('Check your email for the instant sign-in link!');
    }
  }

  async function handleLeadSubmit(e) {
    e.preventDefault();
    if (!leadForm.work_email || !leadForm.company_name || !leadConsent || leadBusy) return;
    setLeadBusy(true);
    setLeadMessage('');
    try {
      if (turnstileSiteKey) {
        if (!turnstileToken) { setLeadMessage('Complete the human verification first.'); return; }
        const response=await fetch('/api/early-access',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({...leadForm,consent:true,turnstile_token:turnstileToken})
        });
        const body=await response.json();
        if(!response.ok || !body.success) { setLeadMessage(body.error || 'Registration unavailable. Please retry.'); return; }
      } else {
        // LEGACY PATH (Gate 4 not activated). Remove this once Cloudflare is configured
        // and the database revocation migration has been applied.
        if (!supabase) { setLeadMessage('Early access registration is not configured yet.'); return; }
        const {error}=await supabase.from('early_access_leads').insert([leadForm]);
        if(error) { setLeadMessage('Could not save your request. Please retry later.'); return; }
      }
      setLeadMessage('Thanks. Your early-access request was submitted.');
      setLeadForm({work_email:'',company_name:'',company_size:'50-100',target_countries:''});
      setLeadConsent(false);
    } catch {
      setLeadMessage('Registration temporarily unavailable. Please retry.');
    } finally {
      setLeadBusy(false);
      setTurnstileToken('');
      setTurnstileAttempt(n => n+1); // Tokens are single-use: re-create widget after every submission.
    }
  }

  async function handleSaveEmployee(e) {
    e.preventDefault();
    if (!empForm.name.trim()) return;
    const visaFields = { visa_authorized_days: empForm.visaAuthorizedDays || null, visa_extension_status: empForm.visaExtensionStatus || 'Not approved', visa_extended_days: empForm.visaExtendedDays || null };
    if (visaFields.visa_extension_status === 'Approved' && (!visaFields.visa_extended_days || !['Thailand','Philippines','Indonesia'].includes(empForm.hostRegion))) { alert('Enter the approved total stay for a supported extension route.'); return; }
    const visaCheck = evaluatePillars(empForm).visa;
    if (visaFields.visa_extension_status === 'Approved' && !visaCheck.extensionApproved) { alert('Approved total must exceed the initial grant and be within the modeled extension ceiling.'); return; }

    if (editingEmpId) {
      if (supabase && session?.user && !String(editingEmpId).startsWith('demo-')) {
        const { error } = await supabase
          .from('employee_rosters')
          .update({
            ...visaFields,
            employee_name: empForm.name,
            home_country: empForm.homeCountry,
            host_region: empForm.hostRegion,
            role_level: empForm.role,
            days_used: Number(empForm.daysUsed),
            current_setup: empForm.currentSetup,
            certificate_status: empForm.certificateStatus || 'Not filed',
          })
          .eq('id', editingEmpId)
          .select('id').single();
        if (error) { alert('Employee save failed: ' + error.message); return; }
      }
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === editingEmpId ? { ...empForm, id: editingEmpId, daysUsed: Number(empForm.daysUsed) } : item
        )
      );
    } else {
      let newId = `local-${Date.now()}`;
      if (supabase && session?.user) {
        const { data, error } = await supabase
          .from('employee_rosters')
          .insert([
            {
              ...visaFields,
              user_id: session.user.id,
              employee_name: empForm.name,
              home_country: empForm.homeCountry,
              host_region: empForm.hostRegion,
              role_level: empForm.role,
              days_used: Number(empForm.daysUsed),
              current_setup: empForm.currentSetup,
            certificate_status: empForm.certificateStatus || 'Not filed',
            },
          ])
          .select()
          .single();
        if (error || !data?.id) { alert('Employee save failed: ' + (error?.message || 'No record returned')); return; }
        newId = data.id;
      }
      const created = { ...empForm, id: newId, daysUsed: Number(empForm.daysUsed) };
      setEmployees((prev) => [...prev, created]);
      setSelectedId(newId);
    }

    setShowEmpForm(false);
    setEditingEmpId(null);
  }

  async function handleDeleteEmployee(id) {
    if (supabase && session?.user && !String(id).startsWith('demo-')) {
      const { data, error } = await supabase.from('employee_rosters').delete().eq('id', id).select('id');
      if (error || !data?.length) { alert('Could not delete saved employee. Your roster was not changed.'); return; }
    }
    setEmployees((prev) => prev.filter((item) => item.id !== id));
  }
  const [aiSummaries, setAiSummaries] = useState({});
const [loadingId, setLoadingId] = useState(null);

const generateAiBrief = async (employee) => {
  if (!session) { setShowAuthModal(true); return; }
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(String(employee.id))) { alert('Save this employee to your signed-in roster before requesting an AI brief.'); return; }
  setLoadingId(employee.id);
  try {
    const { data: refreshed, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !refreshed.session?.access_token) throw new Error('Sign in again to request a brief.');
    const response = await fetch('/api/employee-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshed.session.access_token}` },
      body: JSON.stringify({ employeeId: employee.id }),
    });

    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (e) {}
    if (!data) {
      throw new Error(`Server replied ${response.status} (${response.headers.get('content-type') || 'no content type'}) instead of JSON: ${raw.slice(0, 120) || '(empty body)'}`);
    }

    if (data.success && (data.summary || data.brief)) {
      setAiSummaries(prev => ({ ...prev, [employee.id]: data.mode === 'offline-screening' ? `${data.notice}\n\n${data.summary || data.brief}` : data.mode === 'structured-screening' ? `Structured screening brief (AI response was incomplete).\n\n${data.summary || data.brief}` : data.summary || data.brief }));
    } else {
      alert("AI Brief Error: " + (data.error || "No summary returned"));
    }
  } catch (err) {
    console.error('AI summary failed:', err);
    alert('AI Brief Failed: ' + err.message);
  } finally {
    setLoadingId(null);
  }
};

  function exportCsvReport() {
    const csv = buildComplianceCsv(evaluated);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orbital-hr-compliance-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              OH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">Orbital HR</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  US & Canada Edition
                </span>
              </div>
              <p className="text-xs text-slate-500">Cross-Border Mobility Screening & Risk Alerts · MVP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {session?.user ? 'Private Roster' : isSupabaseConfigured ? 'Guest Demo — sign in to save' : 'Demo Mode (Connect Supabase)'}
            </span>

            <button
              onClick={exportCsvReport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            {session ? (
              <button
                onClick={() => supabase?.auth.signOut()}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <LogIn className="h-4 w-4" />
                Company Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero + Early Access Lead Capture */}
      <section className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Built for 50–500 Employee US & Canadian Companies
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Screen cross-border mobility risks before making HR decisions.
            </h1>
            <p className="text-base text-slate-300 max-w-2xl">
              Review employee mobility exposure across 7 modeled destinations, with immigration, tax, social-security and payroll alerts that require country-specific professional verification.
            </p>
            <p className="rounded-lg border border-amber-300/40 bg-amber-100/10 px-3 py-2 text-sm text-amber-100" role="note">
              Screening only — not legal advice, immigration/work authorization, a tax determination, or confirmation of social-security compliance. Country-specific facts and qualified adviser review are required before decisions.
            </p>
          </div>

          <form
            onSubmit={handleLeadSubmit}
            className="lg:col-span-5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Building2 className="h-4 w-4 text-indigo-300" />
              Request Early Access & Country Screening
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input
                type="email"
                required
                maxLength={254}
                placeholder="Work email (CFO / HR)"
                value={leadForm.work_email}
                onChange={(e) => setLeadForm({ ...leadForm, work_email: e.target.value })}
                className="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-400"
              />
              <input
                type="text"
                required
                maxLength={120}
                placeholder="Company name"
                value={leadForm.company_name}
                onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })}
                className="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-400"
              />
              <select
                value={leadForm.company_size}
                onChange={(e) => setLeadForm({ ...leadForm, company_size: e.target.value })}
                className="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white"
              >
                <option value="50-100">50–100 employees</option>
                <option value="101-250">101–250 employees</option>
                <option value="251-500">251–500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
              <input
                type="text"
                maxLength={200}
                placeholder="Host countries (e.g. UK, India)"
                value={leadForm.target_countries}
                onChange={(e) => setLeadForm({ ...leadForm, target_countries: e.target.value })}
                className="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-400"
              />
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-200"><input type="checkbox" required checked={leadConsent} onChange={(e) => setLeadConsent(e.target.checked)} className="mt-1" /> I agree to be contacted about OrbitalHR early access. My work email, company details and requested countries will be stored for that purpose. Do not enter employee personal information in this form.</label>
            {turnstileSiteKey && <TurnstileWidget key={turnstileAttempt} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />}
            <button
              type="submit"
              disabled={leadBusy || (!!turnstileSiteKey && !turnstileToken)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Get Early Access <ArrowRight className="h-4 w-4" />
            </button>
            {leadMessage && <p className="text-xs text-emerald-300">{leadMessage}</p>}
          </form>
        </div>
      </section>

      {/* Enterprise Trust & Verification Bar */}
      <div className="border-b border-slate-200 bg-white py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-6 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>7 Modeled Destinations · Rules Require Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-indigo-600" />
            <span>Social-Security Agreement & Certificate Screening</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Employer PE Screening Alerts — Not a Legal Determination</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-700" />
            <span>Signed-in User Roster Isolation</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {rosterLoadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{rosterLoadError}</div>}
        {/* Dynamic ROI Marketing Callout */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                Illustrative cost scenario
              </span>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                EOR vs. Local Payroll — Simplified, Non-binding Example
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Example only: 5 hires at ${eorFee}/month EOR fees represent <strong className="text-white">${(eorFee * 5 * 12).toLocaleString()}/year</strong>. An illustrative software-plus-payroll scenario at ${orbitalFee + 110}/month per hire would be <strong className="text-white">${((orbitalFee + 110) * 5 * 12).toLocaleString()}/year</strong>, excluding entity setup, tax, permits, advisers and local costs. Changing payroll requires separate legal review.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">Illustrative Savings Scenario</p>
                <p className="text-2xl font-black text-emerald-400">${kpis.totalAnnualSavings.toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">Payroll feasibility reviews</p>
                <p className="text-2xl font-black text-white">{kpis.graduateCount} Hires</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase">Tracked Roster</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{employees.length} Employees</p>
            <p className="mt-1 text-xs text-slate-500">Across 7 modeled host options; legal review required</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium uppercase">Compliance Escalations</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-950">{kpis.cliffCount} Approaching Limit</p>
            <p className="mt-1 text-xs text-amber-800">Critical or internal escalation alerts across compliance tracks</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-medium uppercase">Employer PE Exposure</span>
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-950">{kpis.peHighCount} Elevated / Critical</p>
            <p className="mt-1 text-xs text-rose-800">Employer PE policy alerts; includes jurisdiction review</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium uppercase">Individual Tax Residency</span>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-950">{kpis.taxHighCount} Elevated / Critical</p>
            <p className="mt-1 text-xs text-amber-800">Individual tax review alerts; not a residency determination</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-medium uppercase">Illustrative EOR Cost Difference</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-950">
              ${kpis.totalAnnualSavings.toLocaleString()}/yr
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              {kpis.graduateCount} feasibility reviews; savings are illustrative
            </p>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All (${evaluated.length})` },
              { id: 'CLIFF', label: `Compliance Alerts (${kpis.cliffCount})` },
              { id: 'GRADUATE', label: `Payroll Review (${kpis.graduateCount})` },
              { id: 'PE', label: `Employer PE (${kpis.peHighCount})` },
              { id: 'TAX', label: `Tax Residency (${kpis.taxHighCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterMode === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              EOR Benchmark ($/mo):
              <input
                type="number"
                value={eorFee}
                onChange={(e) => setEorFee(Number(e.target.value) || 0)}
                className="w-20 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              Orbital HR ($/mo):
              <input
                type="number"
                value={orbitalFee}
                onChange={(e) => setOrbitalFee(Number(e.target.value) || 0)}
                className="w-16 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900"
              />
            </label>
            <button
              onClick={() => {
                setEditingEmpId(null);
                setEmpForm({
                  name: '',
                  homeCountry: 'United States',
                  hostRegion: 'Schengen Area',
                  role: 'Individual Contributor',
                  daysUsed: 45,
                  currentSetup: 'Home Payroll',
                });
                setShowEmpForm(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add Employee
            </button>
          </div>
        </div>

        {/* Inline Add/Edit Employee Drawer */}
        {showEmpForm && (
          <form
            onSubmit={handleSaveEmployee}
            className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEmpId ? 'Edit Remote / Traveling Employee' : 'Add Employee to Compliance Tracker'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEmpForm(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              <input
                type="text"
                required
                placeholder="Employee full name"
                value={empForm.name}
                onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <select
                value={empForm.homeCountry}
                onChange={(e) => setEmpForm({ ...empForm, homeCountry: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="United States">Home: United States</option>
                <option value="Canada">Home: Canada</option>
              </select>
              <select
                value={empForm.hostRegion}
                onChange={(e) => setEmpForm({ ...empForm, hostRegion: e.target.value, visaAuthorizedDays: null, visaExtensionStatus: 'Not approved', visaExtendedDays: null })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {HOSTS.map((region) => (
                  <option key={region} value={region}>
                    Host: {region}
                  </option>
                ))}
              </select>
              <select
                value={empForm.role}
                onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="Individual Contributor">Individual Contributor</option>
                <option value="Manager / Team Lead">Manager / Team Lead</option>
                <option value="Sales / Revenue">Sales / Revenue</option>
                <option value="Executive">Executive</option>
              </select>
              <input
                type="number"
                min={0}
                max={365}
                required
                placeholder="Days abroad"
                value={empForm.daysUsed}
                onChange={(e) => setEmpForm({ ...empForm, daysUsed: Number(e.target.value) })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <label className="text-xs text-slate-700">Actual initial authorised stay (days; blank if unknown)
                <input type="number" min={1} max={365} step={1} value={empForm.visaAuthorizedDays ?? ''} onChange={(e) => setEmpForm({ ...empForm, visaAuthorizedDays: e.target.value === '' ? null : Number(e.target.value) })} className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
              {['Thailand','Philippines','Indonesia'].includes(empForm.hostRegion) && <>
                <label className="text-xs text-slate-700">Extension decision
                  <select value={empForm.visaExtensionStatus || 'Not approved'} onChange={(e) => setEmpForm({ ...empForm, visaExtensionStatus: e.target.value, visaExtendedDays: null })} className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    {['Not approved','Pending','Approved','Denied'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                {empForm.visaExtensionStatus === 'Approved' && <label className="text-xs text-slate-700">Approved total stay (including initial days)
                  <input required type="number" min={1} max={empForm.hostRegion === 'Philippines' ? 59 : 60} step={1} value={empForm.visaExtendedDays ?? ''} onChange={(e) => setEmpForm({ ...empForm, visaExtendedDays: e.target.value === '' ? null : Number(e.target.value) })} className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </label>}
              </>}
              <select
                value={empForm.currentSetup}
                onChange={(e) => setEmpForm({ ...empForm, currentSetup: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="Home Payroll">Home Payroll</option>
                <option value="EOR ($599/mo)">EOR ($599/mo)</option>
                <option value="Local Payroll">Local Payroll</option>
              </select>
              <select
                value={empForm.certificateStatus || 'Not filed'}
                onChange={(e) => setEmpForm({ ...empForm, certificateStatus: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="Not filed">Certificate: Not filed</option>
                <option value="Filed">Certificate: Filed</option>
                <option value="Issued">Certificate: Issued</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              {editingEmpId ? 'Save Changes' : 'Save to Roster'}
            </button>
          </form>
        )}

        {/* Live Employee Risk Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee & Home</th>
                <th className="px-4 py-3">Host Destination</th>
                <th className="px-4 py-3">Pillar 6: Visa & Stay</th>
                <th className="px-4 py-3">Pillar 2: PE / Tax Residency</th>
                <th className="px-4 py-3">Pillar 1: Social Security</th>
                <th className="px-4 py-3">Screening Alerts / Payroll Review</th>
                <th className="px-4 py-3 text-right">Manage</th>
              </tr>
            </thead>
         <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} onClick={() => setSelectedId(emp.id)} className={`cursor-pointer transition ${selectedEmployee?.id === emp.id ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.homeCountry} · {emp.role}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{emp.hostRegion}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{emp.daysUsed} / {emp.rule.visaLimitDays === null ? 'unknown' : emp.rule.visaLimitDays + 'd'}</span>
                        <LevelBadge level={emp.pillars.visa.level} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2"><span className="text-xs text-slate-600">PE</span><LevelBadge level={emp.peLevel} /></div>
                        <div className="flex items-center gap-2"><span className="text-xs text-slate-600">Tax residency</span><LevelBadge level={emp.taxResidencyLevel} /></div>
                        {emp.pillars.pe.reviewRequired && <span className="text-[11px] text-amber-800">Country review required</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <LevelBadge level={emp.pillars.ss.level} />
                      <div className="mt-1 max-w-[11rem] text-[11px] text-slate-600">{emp.ssInfo.form}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white">
                        {emp.recommendation}
                      </span>
                      {emp.complianceActions.length > 1 && <ul className="mt-2 space-y-1 text-xs text-slate-700">{emp.complianceActions.slice(1).map(a => <li key={a.risk}>{a.text}</li>)}</ul>}
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-end gap-2">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => generateAiBrief(emp)} disabled={loadingId === emp.id} className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                            {loadingId === emp.id ? 'Analyzing...' : '✨ AI Brief'}
                          </button>
                          <button onClick={() => { setEditingEmpId(emp.id); setEmpForm(emp); setShowEmpForm(true); }} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600" title="Edit">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600" title="Remove">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {aiSummaries[emp.id] && (
                          <div className="w-[min(38rem,calc(100vw-3rem))] max-h-[34rem] overflow-auto text-left p-4 bg-indigo-50/95 border border-indigo-200 rounded-lg text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words shadow-lg">
                            <strong className="text-indigo-900 block mb-2 font-semibold">Employee Screening Brief (AI-assisted):</strong>
                            <p>{aiSummaries[emp.id]}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Selected Employee Deep-Dive Compliance Inspector */}
        {selectedEmployee && (
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 lg:grid-cols-3">
            <div className="space-y-2 border-b border-slate-100 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-600">
                <Globe className="h-4 w-4" /> Pillar 6: Visa & Right-to-Work Tracking
              </div>
              <p className="text-sm font-semibold text-slate-900">{selectedEmployee.rule.visaRuleShort}</p>
              <p className="text-xs text-slate-600">Pathway: {selectedEmployee.rule.visaPathway}</p>{selectedEmployee.rule.regionalPlaceholder && <p className="text-xs text-amber-800">90/180 short-stay screening only; verify rolling travel history and national work permission.</p>}
              <p className="text-xs text-slate-600">{selectedEmployee.pillars.visa.detail} Extension status: {selectedEmployee.pillars.visa.visaExtensionStatus}.</p><PillarMeter p={selectedEmployee.pillars.visa} />
            </div>

            <div className="space-y-2 border-b border-slate-100 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-rose-600">
                <ShieldAlert className="h-4 w-4" /> Pillar 2: Employer PE & Individual Tax Screening
              </div>
              <p className="text-sm font-semibold text-slate-900">{selectedEmployee.rule.taxRuleShort}</p>
              {selectedEmployee.rule.regionalPlaceholder && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><strong>{selectedEmployee.rule.jurisdictionNotice}</strong>{Object.entries(selectedEmployee.rule.countryReview).map(([country, note]) => <p key={country} className="mt-1"><strong>{country}:</strong> {note}</p>)}</div>}
              <div className="grid gap-2">
                <div className="rounded-lg bg-rose-50 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-rose-900">PE / employer-presence risk</strong>
                    <LevelBadge level={selectedEmployee.peLevel} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{selectedEmployee.pillars.pe.subRisks.pe.detail}</p><p className="mt-1 text-xs font-medium text-slate-800">{selectedEmployee.pillars.pe.subRisks.pe.action}</p>
                  <p className="mt-1 text-[11px] font-semibold text-rose-800">
                    {selectedEmployee.pillars.pe.reviewRequired ? 'No regional PE threshold' : `Orbital PE policy threshold: ${selectedEmployee.pillars.pe.subRisks?.pe?.limit || selectedEmployee.pillars.pe.limit} days`}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-amber-900">Individual tax-residency risk</strong>
                    <LevelBadge level={selectedEmployee.taxResidencyLevel} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{selectedEmployee.pillars.pe.subRisks.taxResidency.detail}</p><p className="mt-1 text-xs font-medium text-slate-800">{selectedEmployee.pillars.pe.subRisks.taxResidency.action}</p>
                  <p className="mt-1 text-[11px] font-semibold text-amber-800">
                    {selectedEmployee.pillars.pe.subRisks.taxResidency.limit == null ? 'No single residency day threshold modeled; review applicable criteria' : `Day-count screening reference: ${selectedEmployee.pillars.pe.subRisks.taxResidency.limit} days (not a legal determination)`}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">The overall Pillar 2 status uses the higher-risk result of these two separate tracks.</p>
              {selectedEmployee.rule.taxPrompt && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                  <strong>Review prompt:</strong> {selectedEmployee.rule.taxPrompt}
                </div>
              )}
              {selectedEmployee.rule.sources && (
                <p className="text-[11px] text-slate-500"><strong>Evidence:</strong> {selectedEmployee.rule.sources}</p>
              )}
              <div className="text-xs text-slate-600">Combined Pillar 2 alert: <LevelBadge level={selectedEmployee.pillars.pe.level} /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700">
                <FileCheck2 className="h-4 w-4" /> Pillar 1: Social-Security & Certificate Screening
              </div>
              <p className="text-sm font-semibold text-slate-900">{selectedEmployee.ssInfo.form}</p>
              <p className="text-xs text-slate-600">{selectedEmployee.ssInfo.note}</p>
              <PillarMeter p={selectedEmployee.pillars.ss} />
            </div>
          </div>
        )}

        <MatrixPanel />

        {/* Upcoming Enterprise Compliance Pillars Roadmap (Pillars 3, 4, 5, 7) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                <Clock className="h-3.5 w-3.5" /> Illustrative Future Product Roadmap
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Upcoming Enterprise Compliance Pillars
              </h2>
              <p className="text-xs text-slate-500">
                Future concepts only; these modules are not part of the current MVP and have no committed release date.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase">Pillar 3</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">Not released</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Dual Income Tax Withholding & Shadow Payroll</h3>
              <p className="text-xs text-slate-600">
                Potential future tools for payroll reporting; no tax calculation or ADP/Workday integration is available today.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase">Pillar 4</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">Not released</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Posted Worker Notifications (PWN)</h3>
              <p className="text-xs text-slate-600">
                Potential future assistance with country-specific posted-worker requirements; availability and legal review are pending.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase">Pillar 5</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">Not released</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Local Labor & Wage Rules</h3>
              <p className="text-xs text-slate-600">
                Potential future prompts for local wage and working-time review; no labor-law audit is currently offered.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase">Pillar 7</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">Not released</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">GDPR Data Sovereignty Guardrail</h3>
              <p className="text-xs text-slate-600">
                Potential future privacy and transfer review tools; no geolocation-based GDPR monitoring is currently offered.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <footer className="rounded-xl border border-slate-200 bg-slate-100/80 px-5 py-4 text-xs text-slate-500">
          <strong>Screening-only MVP:</strong> OrbitalHR produces internal policy alerts for triage, not findings of legal breach, residence, employer PE, social-security liability or visa/work authorization. Underlying assumptions are incomplete and jurisdiction-specific verification is required. The model's ESCALATE label is an operational intervention trigger, not confirmation of a legal violation. Do not rely on these outputs to decide travel, payroll or tax filings without qualified professional review.
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 pt-3">
            <span>Privacy Policy and Terms of Service: in preparation</span>
            <a className="font-medium text-indigo-700 underline hover:text-indigo-900" href="mailto:ismailbenamira1@gmail.com">Privacy inquiries: ismailbenamira1@gmail.com</a>
          </div>
        </footer>
      </main>

      {/* Supabase Magic Link Login Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Sign In to Save Your Roster</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-sm text-slate-400 hover:text-slate-700">
                Close
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Enter your work email to receive a passwordless magic sign-in link powered by Supabase Auth.
            </p>
            <form onSubmit={handleMagicLinkLogin} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <CheckCircle2 className="h-4 w-4" /> Send Magic Link
              </button>
            </form>
            {authStatus && <p className="text-xs font-medium text-indigo-700">{authStatus}</p>}
          </div>
        </div>
      )}
      <CopilotPanel session={session} onSignIn={() => setShowAuthModal(true)} />
    </div>
  );
}
