// Test-only lifecycle reconciliation. Fetch current Stripe state rather than trusting event snapshots.
const STAGING='https://clijflnmtyqjexocbjqq.supabase.co';
const valid=(x,p)=>typeof x==='string'&&new RegExp('^'+p+'_[A-Za-z0-9]+$').test(x);
export const lifecycleTypes=['customer.subscription.updated','customer.subscription.deleted','invoice.payment_failed','charge.refunded','charge.dispute.created'];
export async function reconcileLifecycle(event,env,fetcher=fetch){
 if(env.BILLING_STAGING_SUPABASE_URL!==STAGING||!/^sk_test_/.test(env.STRIPE_SECRET_KEY||'')||!env.BILLING_STAGING_SERVICE_ROLE_KEY||event.livemode!==false||!lifecycleTypes.includes(event.type))throw Error('Invalid lifecycle context');
 const headers={apikey:env.BILLING_STAGING_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.BILLING_STAGING_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
 async function get(url,options){const r=await fetcher(url,{...options,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Upstream unavailable');return r.json();}
 const stripe=path=>get('https://api.stripe.com/v1/'+path,{headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Stripe-Version':'2024-10-28.acacia'}});
 const obj=event.data?.object;
 let customer=obj?.customer,sub=event.type.startsWith('customer.subscription.')?obj?.id:obj?.subscription;
 let charge=null;
 if(event.type==='charge.refunded'||event.type==='charge.dispute.created'){
 const id=event.type==='charge.refunded'?obj?.id:obj?.charge;
 if(!valid(id,'ch'))throw Error('Invalid charge');
 charge=await stripe('charges/'+id);
 if(charge.id!==id||charge.livemode!==false||!valid(charge.invoice,'in'))throw Error('Unbound charge');
 const invoice=await stripe('invoices/'+charge.invoice);
 if(invoice.livemode!==false||invoice.id!==charge.invoice||invoice.customer!==charge.customer||invoice.charge!==id)throw Error('Invoice mismatch');
 customer=invoice.customer;sub=invoice.subscription;
 }
 if(!valid(customer,'cus')||!valid(sub,'sub'))throw Error('Invalid references');
 const rows=await get(STAGING+'/rest/v1/billing_accounts?stripe_customer_id=eq.'+customer,{headers});
 if(!Array.isArray(rows)||rows.length!==1||rows[0].stripe_subscription_id!==sub)throw Error('Missing subscription binding');
 const a=rows[0];
 const current=await stripe('subscriptions/'+sub);
 if(current.id!==sub||current.customer!==customer||current.livemode!==false)throw Error('Subscription mismatch');
 let status=current.status;
 if(charge){
 // Re-fetch after capturing optimistic version; conservative hold on any refund/dispute.
 const latest=await stripe('charges/'+charge.id);
 if(latest.id!==charge.id||latest.customer!==customer||latest.livemode!==false)throw Error('Charge mismatch');
 if(latest.disputed===true||latest.amount_refunded>0)status='paused';
 }
 if(!['past_due','unpaid','canceled','paused'].includes(status))return 'no_suspension';
 if(a.subscription_status===status&&a.paid_through===null)return 'already_suspended';
 const result=await get(STAGING+'/rest/v1/rpc/suspend_billing_access',{method:'POST',headers,body:JSON.stringify({p_user:a.user_id,p_subscription:sub,p_version:a.reconciliation_version,p_status:status})});
 if(result!=='suspended')throw Error('Unexpected suspension result');
 return result;
}
