import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const HOST_RULES = {
  'Schengen Area': {
    visaLimitDays: 90,
    visaRuleShort: '90/180 rolling days (EU EES biometric tracking live)',
    visaPathway: 'Visa-free short stay (90/180) or National Digital Nomad Visa (Type D)',
    taxResidencyDays: 183,
    taxRuleShort: '183 days in calendar/tax year across member state',
    peBaseRisk: 'High',
    usSocialSecurity: {
      covered: true,
      form: 'SSA Certificate (e.g., USA/DE 101, USA/FR 101)',
      note: 'Active US Totalization Agreements across major Schengen states (up to 5 yrs)',
    },
    caSocialSecurity: {
      covered: true,
      form: 'CRA CPT Form (e.g., CPT130 / CPT52 / CPT125)',
      note: 'Active Canadian agreements (36–60 months detached coverage)',
    },
    localPayrollMonthlyUSD: 145,
    entitySetupOneTimeUSD: 4500,
    lastVerified: 'November 2026',
  },
  'United Kingdom': {
    visaLimitDays: 180,
    visaRuleShort: '180 days/visit (remote work must remain incidental)',
    visaPathway: 'Standard Visitor (incidental remote work) or Global Business Mobility',
    taxResidencyDays: 183,
    taxRuleShort: '183 days in UK tax year (Apr 6–Apr 5) or Statutory Residence ties',
    peBaseRisk: 'High',
    usSocialSecurity: {
      covered: true,
      form: 'Form USA/UK 1',
      note: 'US-UK Totalization Agreement prevents dual Social Security / NIC up to 5 yrs',
    },
    caSocialSecurity: {
      covered: true,
      form: 'Form CPT71',
      note: 'Canada-UK Convention covers detached workers up to 60 months',
    },
    localPayrollMonthlyUSD: 130,
    entitySetupOneTimeUSD: 2800,
    lastVerified: 'November 2026',
  },
  Mexico: {
    visaLimitDays: 180,
    visaRuleShort: '180 days FMM visitor; Residente Temporal for 1–4 yrs',
    visaPathway: 'FMM Visitor (<180d) or Temporary Resident Visa (Residente Temporal)',
    taxResidencyDays: 183,
    taxRuleShort: 'Center of vital interests / permanent home test (or 183+ days)',
    peBaseRisk: 'High',
    usSocialSecurity: {
      covered: false,
      form: 'None (No US-Mexico Treaty)',
      note: 'Dual FICA + Mexican IMSS risk if local employment is triggered',
    },
    caSocialSecurity: {
      covered: true,
      form: 'Form CPT62',
      note: 'Canada-Mexico Social Security Agreement covers detached workers up to 60 months',
    },
    localPayrollMonthlyUSD: 110,
    entitySetupOneTimeUSD: 3200,
    lastVerified: 'November 2026',
  },
  India: {
    visaLimitDays: 180,
    visaRuleShort: '180 days/visit Business Visa (FRRO registration >180d)',
    visaPathway: 'e-Business Visa (no Digital Nomad Visa; Employment Visa for local hires)',
    taxResidencyDays: 182,
    taxRuleShort: '182+ days in Indian FY (Apr 1–Mar 31); service PE watch',
    peBaseRisk: 'High',
    usSocialSecurity: {
      covered: false,
      form: 'None (No US-India Treaty)',
      note: 'No bilateral exemption; dual FICA + Indian EPF exposure if locally employed',
    },
    caSocialSecurity: {
      covered: true,
      form: 'Form CPT169',
      note: 'Canada-India Agreement prevents dual CPP/EPF up to 60 months',
    },
    localPayrollMonthlyUSD: 95,
    entitySetupOneTimeUSD: 3800,
    lastVerified: 'November 2026',
  },
  Philippines: {
    visaLimitDays: 59,
    visaRuleShort: '30d visa-free (extendable to 59d+ via 9A; EO 86 DNV portal pending)',
    visaPathway: '9A Tourist Extension or 9G Pre-Arranged Employment Visa',
    taxResidencyDays: 180,
    taxRuleShort: '>180 days in calendar year triggers Resident Alien tax status',
    peBaseRisk: 'Moderate',
    usSocialSecurity: {
      covered: false,
      form: 'None (No US-Philippines Treaty)',
      note: 'No bilateral exemption from Philippine SSS/PhilHealth if locally hired',
    },
    caSocialSecurity: {
      covered: true,
      form: 'Form CPT64',
      note: 'Canada-Philippines Agreement covers detached workers up to 60 months',
    },
    localPayrollMonthlyUSD: 90,
    entitySetupOneTimeUSD: 3500,
    lastVerified: 'November 2026',
  },
  Thailand: {
    visaLimitDays: 180,
    visaRuleShort: '180 days/entry on DTV (500k THB savings + home residency/police cert)',
    visaPathway: 'Destination Thailand Visa (DTV) or Non-Immigrant B + Work Permit',
    taxResidencyDays: 180,
    taxRuleShort: '180+ days in calendar year triggers Thai tax residency',
    peBaseRisk: 'Moderate',
    usSocialSecurity: {
      covered: false,
      form: 'None (No US-Thailand Treaty)',
      note: 'No bilateral social security treaty; monitor Thai SSF rules',
    },
    caSocialSecurity: {
      covered: false,
      form: 'None (No Canada-Thailand Treaty)',
      note: 'No bilateral social security treaty; CPP continues while detached',
    },
    localPayrollMonthlyUSD: 100,
    entitySetupOneTimeUSD: 3600,
    lastVerified: 'November 2026',
  },
  Indonesia: {
    visaLimitDays: 60,
    visaRuleShort: '30–60d VoA; 1-yr E33G Remote Worker KITAS ($60k+ foreign income)',
    visaPathway: 'E33G Remote Worker KITAS or PT PMA + Work KITAS',
    taxResidencyDays: 183,
    taxRuleShort: '183+ days in 12 months (or stay permit >183d intent rule)',
    peBaseRisk: 'High',
    usSocialSecurity: {
      covered: false,
      form: 'None (No US-Indonesia Treaty)',
      note: 'No bilateral treaty; BPJS mandatory if locally employed',
    },
    caSocialSecurity: {
      covered: false,
      form: 'None (No Canada-Indonesia Treaty)',
      note: 'No bilateral treaty; BPJS mandatory if locally employed',
    },
    localPayrollMonthlyUSD: 95,
    entitySetupOneTimeUSD: 4200,
    lastVerified: 'November 2026',
  },
};

const DEFAULT_EMPLOYEES = [
  {
    id: 'demo-1',
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

function evaluateEmployee(emp, allEmployees, eorMonthlyFee, orbitalMonthlyFee) {
  const rule = HOST_RULES[emp.hostRegion] || HOST_RULES['Schengen Area'];

  // 1. Calculate aggregated regional headcount across all employees in this host region
  const regionalHeadcount = allEmployees.filter(
    (e) => e.hostRegion === emp.hostRegion
  ).length;

  const visaDaysLeft = rule.visaLimitDays - emp.daysUsed;
  const taxDaysLeft = rule.taxResidencyDays - emp.daysUsed;
  const minDaysToCliff = Math.min(visaDaysLeft, taxDaysLeft);
  const isCliffAlert = minDaysToCliff <= 30;

  const isRevenueOrExec = emp.role === 'Sales / Revenue' || emp.role === 'Executive';
  let peRisk = 'LOW';
  if (emp.daysUsed >= rule.taxResidencyDays || (isRevenueOrExec && emp.daysUsed >= 60)) {
    peRisk = 'CRITICAL';
  } else if (emp.daysUsed >= 90 || isRevenueOrExec || (rule.peBaseRisk === 'High' && emp.daysUsed >= 60)) {
    peRisk = 'ELEVATED';
  }

  const ssInfo = emp.homeCountry === 'Canada' ? rule.caSocialSecurity : rule.usSocialSecurity;

  // 2. Corporate EOR vs Entity Graduation Threshold (e.g. 5 hires break-even)
  const eorGraduationThreshold = 5; 
  const shouldGraduateToEntity = regionalHeadcount >= eorGraduationThreshold;

  let recommendation = 'Stay on Home Payroll';
  if (shouldGraduateToEntity || emp.daysUsed > rule.taxResidencyDays || emp.currentSetup === 'EOR ($599/mo)' || peRisk === 'CRITICAL') {
    recommendation = shouldGraduateToEntity && regionalHeadcount >= eorGraduationThreshold
      ? `Graduate to Local Entity (${regionalHeadcount} hires in region)`
      : 'Graduate to Local Payroll';
  } else if (isCliffAlert) {
    recommendation = 'Extend Visa / Prepare Graduation';
  }

  const annualEorCost = eorMonthlyFee * 12;
  const annualOrbitalLocalCost = (orbitalMonthlyFee + rule.localPayrollMonthlyUSD) * 12;
  const annualSavingsVsEor =
    recommendation.includes('Graduate') ? Math.max(0, annualEorCost - annualOrbitalLocalCost) : 0;

  return {
    ...emp,
    rule,
    regionalHeadcount,
    visaDaysLeft,
    taxDaysLeft,
    minDaysToCliff,
    isCliffAlert,
    peRisk,
    ssInfo,
    recommendation,
    annualEorCost,
    annualOrbitalLocalCost,
    annualSavingsVsEor,
  };
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

  // Add / Edit Employee Form
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

  // Early Access Lead Form
  const [leadForm, setLeadForm] = useState({
    work_email: '',
    company_name: '',
    company_size: '50-100',
    target_countries: '',
  });
  const [leadMessage, setLeadMessage] = useState('');

  // Listen to Supabase Auth
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load user's saved roster from Supabase when logged in
  useEffect(() => {
    if (!supabase || !session?.user) return;
    supabase
      .from('employee_rosters')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((row) => ({
            id: row.id,
            name: row.employee_name,
            homeCountry: row.home_country,
            hostRegion: row.host_region,
            role: row.role_level,
            daysUsed: row.days_used,
            currentSetup: row.current_setup,
          }));
          setEmployees(mapped);
          setSelectedId(mapped[0].id);
        }
      });
  }, [session]);

  const evaluated = useMemo(
    () => employees.map((e) => evaluateEmployee(e, employee, eorFee, orbitalFee)),
    [employees, eorFee, orbitalFee]
  );

  const filteredEmployees = useMemo(() => {
    if (filterMode === 'CLIFF') return evaluated.filter((e) => e.isCliffAlert);
    if (filterMode === 'GRADUATE') return evaluated.filter((e) => e.recommendation === 'Graduate to Local Payroll');
    if (filterMode === 'PE') return evaluated.filter((e) => e.peRisk !== 'LOW');
    return evaluated;
  }, [evaluated, filterMode]);

  const kpis = useMemo(() => {
    const cliffCount = evaluated.filter((e) => e.isCliffAlert).length;
    const peHighCount = evaluated.filter((e) => e.peRisk !== 'LOW').length;
    const graduateCount = evaluated.filter((e) => e.recommendation === 'Graduate to Local Payroll').length;
    const totalAnnualSavings = evaluated.reduce((sum, e) => sum + e.annualSavingsVsEor, 0);
    return { cliffCount, peHighCount, graduateCount, totalAnnualSavings };
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
    if (!leadForm.work_email || !leadForm.company_name) return;

    if (supabase) {
      const { error } = await supabase.from('early_access_leads').insert([
        {
          work_email: leadForm.work_email,
          company_name: leadForm.company_name,
          company_size: leadForm.company_size,
          target_countries: leadForm.target_countries,
        },
      ]);
      if (error) {
        setLeadMessage(`Could not save lead: ${error.message}`);
        return;
      }
    }
    setLeadMessage(`Saved! We'll reach out to ${leadForm.work_email} with early-access onboarding.`);
    setLeadForm({ work_email: '', company_name: '', company_size: '50-100', target_countries: '' });
  }

  async function handleSaveEmployee(e) {
    e.preventDefault();
    if (!empForm.name.trim()) return;

    if (editingEmpId) {
      if (supabase && session?.user && !String(editingEmpId).startsWith('demo-')) {
        await supabase
          .from('employee_rosters')
          .update({
            employee_name: empForm.name,
            home_country: empForm.homeCountry,
            host_region: empForm.hostRegion,
            role_level: empForm.role,
            days_used: Number(empForm.daysUsed),
            current_setup: empForm.currentSetup,
          })
          .eq('id', editingEmpId);
      }
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === editingEmpId ? { ...empForm, id: editingEmpId, daysUsed: Number(empForm.daysUsed) } : item
        )
      );
    } else {
      let newId = `local-${Date.now()}`;
      if (supabase && session?.user) {
        const { data } = await supabase
          .from('employee_rosters')
          .insert([
            {
              user_id: session.user.id,
              employee_name: empForm.name,
              home_country: empForm.homeCountry,
              host_region: empForm.hostRegion,
              role_level: empForm.role,
              days_used: Number(empForm.daysUsed),
              current_setup: empForm.currentSetup,
            },
          ])
          .select()
          .single();
        if (data?.id) newId = data.id;
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
      await supabase.from('employee_rosters').delete().eq('id', id);
    }
    setEmployees((prev) => prev.filter((item) => item.id !== id));
  }

  function exportCsvReport() {
    const headers = [
      'Employee Name',
      'Home Country',
      'Host Region',
      'Role',
      'Days Used',
      'Visa Limit (Days)',
      'Days to Nearest Cliff',
      'PE & Tax Risk',
      'Social Security Certificate',
      'Recommended Action',
      'Annual Savings vs EOR (USD)',
    ];
    const rows = evaluated.map((e) => [
      `"${e.name}"`,
      `"${e.homeCountry}"`,
      `"${e.hostRegion}"`,
      `"${e.role}"`,
      e.daysUsed,
      e.rule.visaLimitDays,
      e.minDaysToCliff,
      e.peRisk,
      `"${e.ssInfo.form}"`,
      `"${e.recommendation}"`,
      e.annualSavingsVsEor,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
              <p className="text-xs text-slate-500">Cross-Border Mobility Compliance & EOR Graduation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode (Connect Supabase)'}
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
              Stop paying $599/month per remote hire to an EOR.
            </h1>
            <p className="text-base text-slate-300 max-w-2xl">
              Keep traveling and remote employees compliant on your home payroll across 7 global destinations—and know
              the exact day to graduate long-term hires onto local payroll for ${orbitalFee}/employee/month.
            </p>
          </div>

          <form
            onSubmit={handleLeadSubmit}
            className="lg:col-span-5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Building2 className="h-4 w-4 text-indigo-300" />
              Request Early Access & Custom Country Audit
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input
                type="email"
                required
                placeholder="Work email (CFO / HR)"
                value={leadForm.work_email}
                onChange={(e) => setLeadForm({ ...leadForm, work_email: e.target.value })}
                className="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-400"
              />
              <input
                type="text"
                required
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
                placeholder="Host countries (e.g. UK, India)"
                value={leadForm.target_countries}
                onChange={(e) => setLeadForm({ ...leadForm, target_countries: e.target.value })}
                className="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Get Early Access <ArrowRight className="h-4 w-4" />
            </button>
            {leadMessage && <p className="text-xs text-emerald-300">{leadMessage}</p>}
          </form>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase">Tracked Roster</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{employees.length} Employees</p>
            <p className="mt-1 text-xs text-slate-500">Across 7 verified host regions</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium uppercase">30-Day Cliff Alerts</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-950">{kpis.cliffCount} Approaching Limit</p>
            <p className="mt-1 text-xs text-amber-800">Visa or tax residency within 30 days</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-medium uppercase">PE & Tax Exposure</span>
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-950">{kpis.peHighCount} Elevated / Critical</p>
            <p className="mt-1 text-xs text-rose-800">Requires local payroll or role guardrails</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-medium uppercase">Annual EOR Savings</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-950">
              ${kpis.totalAnnualSavings.toLocaleString()}/yr
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              {kpis.graduateCount} hires ready to graduate from ${eorFee}/mo EOR
            </p>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All (${evaluated.length})` },
              { id: 'CLIFF', label: `30-Day Cliff (${kpis.cliffCount})` },
              { id: 'GRADUATE', label: `Graduate to Local (${kpis.graduateCount})` },
              { id: 'PE', label: `PE / Tax Risk (${kpis.peHighCount})` },
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
                onChange={(e) => setEmpForm({ ...empForm, hostRegion: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {Object.keys(HOST_RULES).map((region) => (
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
              <select
                value={empForm.currentSetup}
                onChange={(e) => setEmpForm({ ...empForm, currentSetup: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="Home Payroll">Home Payroll</option>
                <option value="EOR ($599/mo)">EOR ($599/mo)</option>
                <option value="Local Payroll">Local Payroll</option>
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
                <th className="px-4 py-3">Feature #7: Stay & Visa</th>
                <th className="px-4 py-3">Feature #2: PE & Tax</th>
                <th className="px-4 py-3">Feature #1: Social Security</th>
                <th className="px-4 py-3">Graduation Action</th>
                <th className="px-4 py-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedId(emp.id)}
                  className={`cursor-pointer transition ${
                    selectedEmployee?.id === emp.id ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-500">
                      {emp.homeCountry} · {emp.role}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{emp.hostRegion}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {emp.daysUsed} / {emp.rule.visaLimitDays}d
                      </span>
                      {emp.isCliffAlert && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          {emp.minDaysToCliff <= 0 ? 'Limit Reached' : `${emp.minDaysToCliff}d to cliff`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        emp.peRisk === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : emp.peRisk === 'ELEVATED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {emp.peRisk}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <span className={emp.ssInfo.covered ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                      {emp.ssInfo.form}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        emp.recommendation === 'Graduate to Local Payroll'
                          ? 'bg-indigo-600 text-white'
                          : emp.recommendation === 'Extend Visa / Prepare Graduation'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {emp.recommendation}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingEmpId(emp.id);
                          setEmpForm({
                            name: emp.name,
                            homeCountry: emp.homeCountry,
                            hostRegion: emp.hostRegion,
                            role: emp.role,
                            daysUsed: emp.daysUsed,
                            currentSetup: emp.currentSetup,
                          });
                          setShowEmpForm(true);
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                <Globe className="h-4 w-4" /> Feature #7: Immigration & Stay Rule
              </div>
              <p className="text-sm font-semibold text-slate-900">{selectedEmployee.rule.visaRuleShort}</p>
              <p className="text-xs text-slate-600">Pathway: {selectedEmployee.rule.visaPathway}</p>
            </div>

            <div className="space-y-2 border-b border-slate-100 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-rose-600">
                <ShieldAlert className="h-4 w-4" /> Feature #2: Tax Residency & PE Trigger
              </div>
              <p className="text-sm font-semibold text-slate-900">{selectedEmployee.rule.taxRuleShort}</p>
              <p className="text-xs text-slate-600">
                Role sensitivity ({selectedEmployee.role}): {selectedEmployee.peRisk} PE risk.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700">
                <FileCheck2 className="h-4 w-4" /> Feature #1: Bilateral Social Security
              </div>
              <p className="text-sm font-semibold text-slate-900">{selectedEmployee.ssInfo.form}</p>
              <p className="text-xs text-slate-600">{selectedEmployee.ssInfo.note}</p>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <footer className="rounded-xl border border-slate-200 bg-slate-100/80 px-5 py-4 text-xs text-slate-500">
          <strong>Compliance Notice:</strong> Country thresholds verified as of November 2026. Orbital HR provides
          automated mobility risk flags and EOR cost modeling, not formal legal, immigration, or tax advice. Confirm
          entity setup and certificate filings with qualified local counsel.
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
    </div>
  );
}
