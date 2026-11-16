import React,{useState,useEffect,useRef} from 'react';
const enabled=import.meta.env.VITE_BILLING_PREVIEW_ENABLED==='true'&&import.meta.env.VITE_SUPABASE_URL==='https://clijflnmtyqjexocbjqq.supabase.co';
export default function BillingPanel({session}){
 if(!enabled||!session?.user?.id)return null;
 return <BillingAccount key={session.user.id} session={session}/>;
}
function BillingAccount({session}){
 const [account,setAccount]=useState(null),[offer,setOffer]=useState(null),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef(false);
 const token=session.access_token;
 async function call(path,body,signal){
 const res=await fetch('/api/billing/'+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body||{}),signal});
 const data=await res.json();
 if(!res.ok)throw Error(data.error||'Billing unavailable');
 return data;
 }
 useEffect(()=>{const controller=new AbortController();setAccount(null);setOffer(null);setAccepted(false);call('trial',{},controller.signal).then(setAccount).catch(e=>{if(!controller.signal.aborted)setError(e.message)});return()=>controller.abort();},[token]);
 async function action(kind){
 if(pending.current)return;pending.current=true;setBusy(true);setError('');
 try{
 if(kind==='offer'){setAccepted(false);setOffer(await call('offer'));}
 else {
 const data=await call(kind,kind==='checkout'?{plan:offer.plan,accepted:true,termsVersion:'founding-12-standard-v1'}:{});
 const url=new URL(data.url);
 if(url.origin!==(kind==='checkout'?'https://checkout.stripe.com':'https://billing.stripe.com')||url.username||url.password)throw Error('Invalid billing link');
 window.location.assign(url.href);
 }
 }catch(e){setError(e.message);}finally{pending.current=false;setBusy(false);}
 }
 const days=account?Math.max(0,Math.ceil((Date.parse(account.trial_ends_at)-Date.now())/86400000)):0;
 return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Billing preview">
 <p className="text-xs font-semibold uppercase text-indigo-700">Billing · Test preview</p>
 <h2 className="mt-1 text-lg font-bold text-slate-900">{!account?'Subscription':account.entitlement==='trial'?'Free trial — '+days+' days remaining':account.entitlement==='paid'?'Active subscription':'Subscription inactive'}</h2>
 <p className="mt-2 text-sm text-slate-600">10-day free trial. No card required or automatic conversion. Monthly subscription in CAD; cancel before renewal.</p>
 {account?.subscription_status==='none'&&<button disabled={busy} onClick={()=>action('offer')} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">View subscription offer</button>}
 {offer?.plan==='waitlist'&&<p className="mt-3 text-sm">Founding offers are temporarily reserved. Please check again later.</p>}
 {['founding','standard'].includes(offer?.plan)&&<div className="mt-3 space-y-3 rounded-lg border p-4">
 <p className="font-semibold">{offer.plan==='founding'?'CAD $99/month for the first 12 paid months, then CAD $149/month':'CAD $149/month'}</p>
 <label className="flex gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>I agree to this recurring monthly price, including the stated price transition where applicable, and understand that taxes may apply.</label>
 <button disabled={!accepted||busy} onClick={()=>action('checkout')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Continue to test checkout</button>
 </div>}
 {account&&account.subscription_status!=='none'&&<button disabled={busy} onClick={()=>action('portal')} className="mt-3 rounded-lg border px-4 py-2 text-sm font-semibold">Manage billing</button>}
 {error&&<p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
 </section>;
}
