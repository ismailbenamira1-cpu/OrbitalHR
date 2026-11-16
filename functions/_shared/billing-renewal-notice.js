// Pure template; delivery and verified delivery evidence are separate operations.
export function renewalNotice({dueAt,origin}){
 const date=new Date(dueAt);
 if(!Number.isFinite(date.getTime())||typeof origin!=='string')throw Error('Invalid notice');
 const url=new URL(origin);
 if(url.protocol!=='https:'||url.origin!==origin||url.username||url.password)throw Error('Invalid origin');
 const day=date.toISOString().slice(0,10);
 return {subject:'OrbitalHR: upcoming subscription price change',text:[
 'Your 12 paid founding months at CAD $99/month are ending.',
 'Your next scheduled renewal is '+day+' (UTC). The standard subscription price is CAD $149/month, plus applicable taxes.',
 'You can cancel before renewal through the billing panel at '+origin+'/.',
 'If you have questions, contact OrbitalHR support before renewal.',
 'This notice does not confirm that a payment has been taken.'
 ].join('\n\n')};
}
