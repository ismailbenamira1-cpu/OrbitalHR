import {handleBillingPortal} from '../../_shared/billing-portal-handler.js';
export const onRequestPost=({request,env})=>handleBillingPortal(request,env);
