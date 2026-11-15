import { useEffect, useRef } from 'react';

// Set VITE_TURNSTILE_SITE_KEY only when TURNSTILE_SECRET and SUPABASE_SECRET_KEY
// are configured in Cloudflare Pages Functions and the DB insert revocation is ready.
export default function TurnstileWidget({ siteKey, onToken }) {
  const node = useRef(null);
  const widget = useRef(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  useEffect(() => {
    if (!siteKey || !node.current) return undefined;
    let active = true;
    function render() {
      if (!active || !node.current || widget.current != null || !window.turnstile) return;
      widget.current = window.turnstile.render(node.current, {
        sitekey: siteKey,
        action: 'early_access',
        callback: token => callback.current(token),
        'expired-callback': () => callback.current(''),
        'error-callback': () => callback.current(''),
      });
    }
    const scriptId='orbital-turnstile-script';
    let script=document.getElementById(scriptId);
    if (!script) {
      script=document.createElement('script');
      script.id=scriptId;
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async=true;
      script.defer=true;
      document.head.appendChild(script);
    }
    script.addEventListener('load',render);
    if(window.turnstile)render();
    return () => {
      active=false;
      script?.removeEventListener('load',render);
      if(widget.current != null && window.turnstile) {
        try { window.turnstile.remove(widget.current); } catch {}
        widget.current=null;
      }
    };
  },[siteKey]);
  return <div ref={node} aria-label="Human verification" />;
}
