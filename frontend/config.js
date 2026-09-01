(() => {
  'use strict';
  const STORAGE_KEY = 'arachne_api_url';
  const normalize = value => {
    let url = String(value || '').trim().replace(/\/$/, '');
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    if (!/\/api$/i.test(url)) url = `${url}/api`;
    return url;
  };

  const params = new URLSearchParams(location.search);
  const queryApi = normalize(params.get('api'));
  if (queryApi) {
    try { localStorage.setItem(STORAGE_KEY, queryApi); } catch {}
  }
  let stored = '';
  try { stored = normalize(localStorage.getItem(STORAGE_KEY)); } catch {}

  const explicitlyConfigured = normalize(window.ARACHNE_API_URL || '');
  const sameOrigin = `${location.origin.replace(/\/$/, '')}/api`;
  const netlifyGuess = /\.netlify\.app$/i.test(location.hostname)
    ? `https://${location.hostname.replace(/\.netlify\.app$/i, '')}.onrender.com/api`
    : '';

  window.ARACHNE_API_URL = queryApi || explicitlyConfigured || stored || netlifyGuess || sameOrigin;
  window.ARACHNE_API_CANDIDATES = [...new Set([
    queryApi,
    explicitlyConfigured,
    stored,
    netlifyGuess,
    sameOrigin,
    'https://rpg-arachne.onrender.com/api',
    'https://rpg-arachne-api.onrender.com/api'
  ].map(normalize).filter(Boolean))];
  window.ARACHNE_API_STORAGE_KEY = STORAGE_KEY;
})();
