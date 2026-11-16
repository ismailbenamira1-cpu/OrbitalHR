import {runBillingMaintenance} from '../../functions/_shared/billing-maintenance.js';
export default {
 async scheduled(controller,env,ctx){
  if(controller.cron!=='*/15 * * * *')throw Error('Unexpected schedule');
  ctx.waitUntil((async()=>{
   const report=await runBillingMaintenance(env);
   console.log('billing-maintenance',JSON.stringify(report));
   if(report.errors||report.needsReview||report.needsNotice)throw Error('Billing maintenance requires operator review');
  })());
 }
};
