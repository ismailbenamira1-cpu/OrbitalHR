// Privacy-preserving projection for third-party AI requests.
// Never send database IDs or stored employee names to the AI provider.
const TRACK_KEYS=['level','reviewRequired','screeningLimitDays','action','detail'];
const pick=(source,keys)=>Object.fromEntries(keys.map(k=>[k,source?.[k]??null]));
const track=(source,more=[])=>pick(source,[...TRACK_KEYS,...more]);
function safeEmployee(e,alias){
  return {
    name:alias,
    homeCountry:e.homeCountry,hostRegion:e.hostRegion,role:e.role,
    daysUsed:e.daysUsed,currentSetup:e.currentSetup,
    regionalPlaceholder:e.regionalPlaceholder,
    visa:track(e.visa,['actualInitialGrantDays','activeScreeningLimitDays','extensionStatus','approvedTotalDays','extensionApproved','rollingWindowDays']),
    employerPE:track(e.employerPE),
    individualTaxResidency:track(e.individualTaxResidency),
    socialSecurity:track(e.socialSecurity,['agreementCovered','certificateApplicable','certificateStatus','form','policyOnly']),
    complianceActions:Array.isArray(e.complianceActions)?e.complianceActions.map(a=>pick(a,['level','risk','text'])):[],
    payrollReviewEligible:e.payrollReviewEligible,
    payrollReview:e.payrollReview,
    potentialAnnualEorSavingsUSD:e.potentialAnnualEorSavingsUSD
  };
}
export function makePrivateAiRoster(employees){
  const aliases=employees.map((e,i)=>({name:e.name,alias:`Employee ${i+1}`}));
  return {roster:employees.map((e,i)=>safeEmployee(e,aliases[i].alias)),aliases};
}
function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
export function anonymizeUserText(text,aliases){
  let clean=String(text||'');
  for(const {name,alias} of aliases.filter(x=>x.name&&x.name.trim().length>1).sort((a,b)=>b.name.length-a.name.length)){
    clean=clean.replace(new RegExp(escapeRegExp(name),'gi'),alias);
  }
  clean=clean
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email omitted]')
    .replace(/\b(?:\+?\d[\d ()-]{7,}\d)\b/g,'[number omitted]')
    .replace(/\b(?:passport|social security number|ssn|SIN|national id|national identity|date of birth|dob)\s*[:#-]?\s*[^,;\n.!?]{2,50}/gi,'[identifier omitted]');
  return clean;
}
export function restoreNames(text,aliases){
  let result=String(text||'');
  // Replace long aliases first so Employee 1 is not a substring of Employee 10.
  for(const {name,alias} of [...aliases].sort((a,b)=>b.alias.length-a.alias.length)){
    result=result.replace(new RegExp('\\b'+escapeRegExp(alias)+'\\b','gi'),()=>name);
  }
  return result;
}
