import { handleTrial } from '../../_shared/billing-preview.js';
export const onRequestPost = ({request,env}) => handleTrial(request,env);
