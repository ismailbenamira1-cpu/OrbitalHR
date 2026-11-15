// RLS-scoped roster loading: do not trust client-supplied employee assessments for AI output.
import { evaluateEmployee } from '../../src/data/evaluateEmployee.js';
import { reportingEmployee } from '../../src/data/reporting.js';
import { apiReply } from './security.js';
export async function loadOwnedRoster(request, env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const token = request.headers.get('authorization');
  try {
    const r = await fetch(url.replace(/\/$/,'') + '/rest/v1/employee_rosters?select=*&order=created_at.asc&limit=61', {
      headers: { apikey: key, authorization: token }, signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) return { error: apiReply({ success:false,error:'Unable to load your saved roster.' },503) };
    const rows = await r.json();
    if (!Array.isArray(rows)) throw Error('Invalid response');
    // Refuse incomplete dataset instead of presenting a partial roster as exhaustive.
    if (rows.length > 60) return { error: apiReply({ success:false,error:'The AI roster limit is 60 employees. Please contact support for a larger roster.' },422) };
    const employees = rows.map(row=>({
      id:row.id,name:row.employee_name,homeCountry:row.home_country,hostRegion:row.host_region,
      role:row.role_level,daysUsed:row.days_used,currentSetup:row.current_setup,
      certificateStatus:row.certificate_status,
      visaAuthorizedDays:row.visa_authorized_days,
      visaExtensionStatus:row.visa_extension_status,
      visaExtendedDays:row.visa_extended_days
    }));
    const evaluated=employees.map(e=>evaluateEmployee(e,employees,599,55));
    return { employees:evaluated.map(e=>({ id:e.id,...reportingEmployee(e) })) };
  } catch {
    return { error: apiReply({ success:false,error:'Unable to load your saved roster.' },503) };
  }
}
