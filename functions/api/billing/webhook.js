import {handleBillingWebhook} from '../../_shared/billing-webhook-handler.js';
export const onRequestPost=({request,env})=>handleBillingWebhook(request,env);
