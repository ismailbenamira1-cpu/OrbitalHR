// Verify exact bytes before parsing; no entitlement mutation here.
export async function verifyStripeEvent(raw, header, secret, now = Date.now()) {
 if (!(raw instanceof Uint8Array) || raw.length > 262144 || !/^whsec_/.test(secret || '') || typeof header !== 'string' || header.length > 8192) throw Error('Invalid webhook');
 const fields = header.split(',').map(x=>x.trim().split('='));
 const timestamps = fields.filter(x=>x[0]==='t').map(x=>x[1]);
 const signatures = fields.filter(x=>x[0]==='v1').map(x=>x[1]).filter(x=>/^[a-f0-9]{64}$/i.test(x));
 if (timestamps.length!==1 || !/^\d{1,12}$/.test(timestamps[0]) || !Number.isFinite(now) || Math.abs(now/1000-Number(timestamps[0]))>300 || !signatures.length) throw Error('Invalid signature timestamp');
 const enc=new TextEncoder(), prefix=enc.encode(timestamps[0]+'.'), data=new Uint8Array(prefix.length+raw.length);
 data.set(prefix);data.set(raw,prefix.length);
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 let valid=false;
 for(const sig of signatures) { const bytes=Uint8Array.from(sig.match(/../g),x=>parseInt(x,16)); if(await crypto.subtle.verify('HMAC',key,bytes,data)) valid=true; }
 if(!valid) throw Error('Invalid signature');
 const event=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));
 if(event.livemode!==false || !/^evt_[A-Za-z0-9]+$/.test(event.id||'') || typeof event.type!=='string') throw Error('Not a test event');
 return event;
}
