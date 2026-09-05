/* Provenance limitée à la session : aucun nom ou téléphone conservé ici. */
(function (root) {
  'use strict';
  const social = {
    facebook: 'Facebook', fb: 'Facebook', instagram: 'Instagram', ig: 'Instagram',
    whatsapp: 'WhatsApp', wa: 'WhatsApp', tiktok: 'TikTok', linkedin: 'LinkedIn',
    youtube: 'YouTube', x: 'X', twitter: 'X', telegram: 'Telegram'
  };
  const domains = {
    'facebook.com': 'Facebook', 'fb.com': 'Facebook', 'instagram.com': 'Instagram',
    'whatsapp.com': 'WhatsApp', 'wa.me': 'WhatsApp', 'tiktok.com': 'TikTok',
    'linkedin.com': 'LinkedIn', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
    'x.com': 'X', 'twitter.com': 'X', 't.co': 'X', 'telegram.org': 'Telegram', 't.me': 'Telegram'
  };
  const clean = value => String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 160);
  const hostMatches = (host, domain) => host === domain || host.endsWith('.' + domain);
  function classify(source, medium = '', hostname = false) {
    const detail = clean(source);
    const key = detail.toLowerCase();
    const network = social[key] || (hostname && Object.entries(domains).find(([domain]) => hostMatches(key, domain))?.[1]);
    if (network) return { type: 'social', network, detail: '' };
    if (['social', 'social-media', 'social_media'].includes(medium.toLowerCase())) {
      return { type: 'social', network: 'Autre', detail };
    }
    if (['google', 'bing', 'duckduckgo', 'yahoo'].includes(key) ||
        (hostname && /^(?:[\w-]+\.)*(?:google\.(?:com|fr|cd|co\.uk)|bing\.com|duckduckgo\.com|yahoo\.com)$/.test(key))) {
      return { type: 'search', network: '', detail };
    }
    return { type: hostname ? 'website' : 'other', network: '', detail };
  }
  function detect(url, referrer) {
    const current = new URL(url);
    const source = clean(current.searchParams.get('utm_source'));
    if (source) return { ...classify(source, clean(current.searchParams.get('utm_medium'))), mode: 'Lien de campagne' };
    if (referrer) {
      try {
        const previous = new URL(referrer);
        if (['http:', 'https:'].includes(previous.protocol) && previous.origin !== current.origin) {
          return { ...classify(previous.hostname, '', true), mode: 'Site référent' };
        }
      } catch (_) { /* Un référent absent ou invalide ne permet aucune conclusion. */ }
    }
    return null;
  }
  function resolve(url, referrer, storage, now = Date.now()) {
    const key = 'tbtc-visit-source-v1';
    const detected = detect(url, referrer);
    if (detected) {
      try { storage?.setItem(key, JSON.stringify({ ...detected, expires: now + 30 * 60 * 1000 })); } catch (_) {}
      return detected;
    }
    try {
      const saved = JSON.parse(storage?.getItem(key) || 'null');
      if (saved && saved.expires > now && ['social', 'search', 'website', 'other'].includes(saved.type)) {
        return { type: saved.type, network: clean(saved.network), detail: clean(saved.detail), mode: clean(saved.mode) };
      }
      storage?.removeItem(key);
    } catch (_) {}
    return null;
  }
  const api = { detect, resolve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TBTC_ATTRIBUTION = api;
})(typeof window !== 'undefined' ? window : globalThis);
