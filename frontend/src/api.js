(() => {
  'use strict';
  const localDev = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
  const normalize = value => {
    let url = String(value || '').trim().replace(/\/$/, '');
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    if (!/\/api$/i.test(url)) url += '/api';
    return url;
  };
  const sameOrigin = `${location.origin.replace(/\/$/,'')}/api`;
  let API_BASE = normalize(window.ARACHNE_API_URL || (localDev && location.port !== '3000' ? 'http://localhost:3000/api' : sameOrigin));
  const CLIENT_ID = (() => {
    try {
      let id = sessionStorage.getItem('arachne_client_id');
      if (!id) { id = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`; sessionStorage.setItem('arachne_client_id', id); }
      return id;
    } catch { return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  })();
  let token = '';
  let profile = null;
  let eventSource = null;
  try {
    token = sessionStorage.getItem('arachne_api_token') || '';
    profile = JSON.parse(sessionStorage.getItem('arachne_api_profile') || 'null');
  } catch {}

  function setApiBase(value, persist = true) {
    API_BASE = normalize(value);
    window.ARACHNE_API_URL = API_BASE;
    if (persist && API_BASE) { try { localStorage.setItem(window.ARACHNE_API_STORAGE_KEY || 'arachne_api_url', API_BASE); } catch {} }
    return API_BASE;
  }
  function setSession(nextToken, nextProfile) {
    token = String(nextToken || '');
    profile = nextProfile || null;
    try {
      if (token) sessionStorage.setItem('arachne_api_token', token); else sessionStorage.removeItem('arachne_api_token');
      if (profile) sessionStorage.setItem('arachne_api_profile', JSON.stringify(profile)); else sessionStorage.removeItem('arachne_api_profile');
    } catch {}
  }
  function clearSession() { disconnectRealtime(); setSession('', null); }
  async function request(path, options = {}, auth = true) {
    const headers = {'Content-Type':'application/json', 'X-Arachne-Client':CLIENT_ID, ...(options.headers || {})};
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, {...options, headers});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(body.error || `HTTP ${response.status}`); error.status = response.status; error.data = body; throw error; }
    return body;
  }
  async function health() { try { return await request('/health', {}, false); } catch (error) { return {ok:false,error:error.message,apiBase:API_BASE}; } }
  async function lookupCampaigns(codes) {
    const list = (Array.isArray(codes) ? codes : [codes]).map(v => String(v || '').trim()).filter(Boolean);
    if (!list.length) return [];
    return (await request(`/campaigns/lookup?codes=${encodeURIComponent(list.join(','))}`, {}, false)).data || [];
  }
  async function lookupCampaign(code) { return (await lookupCampaigns([code]))[0] || null; }
  async function getTemplates() { return (await request('/templates', {}, false)).data || []; }
  async function getCharacters() { return (await request('/characters', {}, false)).data || {heroes:[],villains:[]}; }
  async function createCampaign(payload) { return (await request('/campaigns', {method:'POST', body:JSON.stringify(payload)}, false)).data; }
  async function join(role, payload) {
    const result = await request('/session/join', {method:'POST', body:JSON.stringify({role, ...payload})}, false);
    setSession(result.token, result.profile);
    return result.profile;
  }
  async function profileSession() { return (await request('/session/profile')).profile; }
  async function loadAll() { return (await request('/state')).data || {}; }
  async function saveMany(values) { return await request('/state', {method:'PUT', body:JSON.stringify({values})}); }
  async function saveState(key, value) { return await request(`/state/${encodeURIComponent(key)}`, {method:'PUT', body:JSON.stringify({value})}); }
  async function setChallengeTN(tn) { return (await request('/challenge/tn', {method:'PATCH', body:JSON.stringify({tn})})).data; }
  async function adjustResources(kind,id,values) { return (await request(`/characters/${kind}/${encodeURIComponent(id)}/resources`, {method:'PATCH', body:JSON.stringify(values || {})})).data; }
  async function saveHero(hero) { return (await request(`/heroes/${encodeURIComponent(hero.id)}`, {method:'PUT', body:JSON.stringify({hero})})).data; }
  async function saveVillain(villain) { return (await request(`/villains/${encodeURIComponent(villain.id)}`, {method:'PUT', body:JSON.stringify({villain})})).data; }
  async function startActionRoll(values) { return (await request('/actions/d616/start', {method:'POST', body:JSON.stringify(values || {})})).data; }
  async function useActionEdge(id,index) { return (await request(`/actions/d616/${encodeURIComponent(id)}/edge`, {method:'POST', body:JSON.stringify({index})})).data; }
  async function finalizeActionRoll(id) { return (await request(`/actions/d616/${encodeURIComponent(id)}/finalize`, {method:'POST', body:'{}'})).data; }
  async function addInitiativeParticipant(baseId) { return (await request('/initiative/participants', {method:'POST', body:JSON.stringify({baseId})})).data; }
  async function removeInitiativeParticipant(id) { return (await request(`/initiative/participants/${encodeURIComponent(id)}`, {method:'DELETE'})).data; }
  async function clearInitiativeParticipants() { return (await request('/initiative/participants', {method:'DELETE'})).data; }
  async function rollInitiativeParticipant(id) { return (await request('/initiative/roll', {method:'POST', body:JSON.stringify({participantId:id})})).data; }
  async function moveScenarioPiece(values) { return (await request('/scenario/move', {method:'PATCH', body:JSON.stringify(values || {})})).data; }
  async function resetScenarioMovement(values) { return (await request('/scenario/movement/reset', {method:'PATCH', body:JSON.stringify(values || {})})).data; }
  async function savePlayerNote(heroId,note) { return (await request(`/player-notes/${encodeURIComponent(heroId)}`, {method:'PUT', body:JSON.stringify({note})})).data; }

  function connectRealtime(handlers = {}) {
    disconnectRealtime();
    if (!token || typeof EventSource === 'undefined') return null;
    const url = `${API_BASE}/events?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(CLIENT_ID)}`;
    eventSource = new EventSource(url);
    handlers.onStatus && handlers.onStatus('connecting');
    eventSource.addEventListener('ready', event => { handlers.onStatus && handlers.onStatus('online'); try { handlers.onReady && handlers.onReady(JSON.parse(event.data)); } catch {} });
    eventSource.addEventListener('state', event => { try { handlers.onState && handlers.onState(JSON.parse(event.data)); } catch {} });
    eventSource.addEventListener('presence', event => { try { handlers.onPresence && handlers.onPresence(JSON.parse(event.data)); } catch {} });
    eventSource.addEventListener('live-roll', event => { try { handlers.onLiveRoll && handlers.onLiveRoll(JSON.parse(event.data)); } catch {} });
    eventSource.onopen = () => handlers.onStatus && handlers.onStatus('online');
    eventSource.onerror = () => handlers.onStatus && handlers.onStatus('reconnecting');
    return eventSource;
  }
  function disconnectRealtime() { if (eventSource) eventSource.close(); eventSource = null; }

  window.ArachneAPI2 = {
    CLIENT_ID, health, lookupCampaigns, lookupCampaign, getTemplates, getCharacters, createCampaign, join, profileSession, loadAll,
    saveMany, saveState, setChallengeTN, adjustResources, saveHero, saveVillain,
    startActionRoll, useActionEdge, finalizeActionRoll,
    addInitiativeParticipant, removeInitiativeParticipant, clearInitiativeParticipants, rollInitiativeParticipant,
    moveScenarioPiece, resetScenarioMovement, savePlayerNote,
    connectRealtime, disconnectRealtime, clearSession, setSession, setApiBase,
    get token(){return token;}, get profile(){return profile;}, get apiBase(){return API_BASE;}
  };
})();
