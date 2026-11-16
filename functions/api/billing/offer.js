import {handleOffer} from '../../_shared/billing-offer-handler.js';
export const onRequestPost=({request,env})=>handleOffer(request,env);
