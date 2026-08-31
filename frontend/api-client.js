(() => {
  'use strict';

  const localDev = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
  const DEFAULT_API = localDev && location.port !== '3000' ? 'http://localhost:3000/api' : `${location.origin}/api`;
  const API_BASE = window.ARACHNE_API_URL || DEFAULT_API;
  const suffixMap = {
    heroes:'heroes', villains:'villains', campaign:'campaign', dice:'dice', challenge:'challenge',
    scenario:'scenario', initiative:'initiative', player_notes:'playerNotes', notes_player:'notesPlayer', notes_master:'notesMaster'
  };

  function stateKeyFromStorage(storageKey) {
    const text = String(storageKey || '');
    for (const [suffix, apiKey] of Object.entries(suffixMap)) {
      if (text.endsWith(`_${suffix}`)) return apiKey;
    }
    return null;
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
    return body;
  }

  async function loadAll() {
    try {
      const result = await request('/state');
      return result.data || {};
    } catch (error) {
      console.warn('[Arachne API] backend indisponível; usando cache local.', error.message);
      return null;
    }
  }

  async function saveStorageKey(storageKey, value) {
    const key = stateKeyFromStorage(storageKey);
    if (!key) return false;
    try {
      await request(`/state/${encodeURIComponent(key)}`, { method:'PUT', body:JSON.stringify({ value }) });
      return true;
    } catch (error) {
      console.warn(`[Arachne API] falha ao salvar ${key}.`, error.message);
      return false;
    }
  }

  async function saveMany(values) {
    try {
      await request('/state', { method:'PUT', body:JSON.stringify({ values }) });
      return true;
    } catch (error) {
      console.warn('[Arachne API] falha ao salvar estado inicial.', error.message);
      return false;
    }
  }

  async function saveHero(hero) {
    if (!hero?.id) return false;
    try {
      await request(`/heroes/${encodeURIComponent(hero.id)}`, { method:'PUT', body:JSON.stringify({ hero }) });
      return true;
    } catch (error) {
      console.warn(`[Arachne API] falha ao salvar herói ${hero.id}.`, error.message);
      return false;
    }
  }

  async function health() {
    try { return await request('/health'); }
    catch { return null; }
  }

  window.ArachneAPI = { API_BASE, loadAll, saveStorageKey, saveMany, saveHero, health, stateKeyFromStorage };
})();
