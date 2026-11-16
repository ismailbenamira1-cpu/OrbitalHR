import {handleCheckout} from '../../_shared/checkout-preview-handler.js';
export const onRequestPost=({request,env})=>handleCheckout(request,env);
