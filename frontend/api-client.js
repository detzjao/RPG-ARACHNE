(() => {
  'use strict';

  const localDev = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
  const DEFAULT_API = localDev && location.port !== '3000' ? 'http://localhost:3000/api' : `${location.origin}/api`;
  let API_BASE = window.ARACHNE_API_URL || DEFAULT_API;
  const normalizeApiBase = value => { let url=String(value||'').trim().replace(/\/$/,''); if(!url)return ''; if(!/^https?:\/\//i.test(url))url=`https://${url}`; if(!/\/api$/i.test(url))url=`${url}/api`; return url; };
  function setApiBase(value,{persist=true}={}){ API_BASE=normalizeApiBase(value); window.ARACHNE_API_URL=API_BASE; if(persist&&API_BASE){try{localStorage.setItem(window.ARACHNE_API_STORAGE_KEY||'arachne_api_url',API_BASE);}catch{}} return API_BASE; }
  function getApiBase(){ return API_BASE; }
  const CLIENT_ID = (() => {
    try {
      let id=sessionStorage.getItem('arachne_client_id');
      if(!id){id=crypto.randomUUID?.()||`client-${Date.now()}-${Math.random().toString(36).slice(2)}`;sessionStorage.setItem('arachne_client_id',id);}
      return id;
    } catch { return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  })();

  const suffixMap={heroes:'heroes',villains:'villains',campaign:'campaign',campaign_content:'campaignContent',dice:'dice',challenge:'challenge',scenario:'scenario',initiative:'initiative',player_notes:'playerNotes',notes_player:'notesPlayer',notes_master:'notesMaster'};
  let token='',profile=null,eventSource=null;

  function stateKeyFromStorage(storageKey){const text=String(storageKey||'');for(const[suffix,apiKey]of Object.entries(suffixMap)){if(text.endsWith(`_${suffix}`))return apiKey;}return null;}
  function setSession(nextToken,nextProfile){token=String(nextToken||'');profile=nextProfile||null;try{if(token)sessionStorage.setItem('arachne_api_token',token);else sessionStorage.removeItem('arachne_api_token');if(profile)sessionStorage.setItem('arachne_api_profile',JSON.stringify(profile));else sessionStorage.removeItem('arachne_api_profile');}catch{}}
  function clearSession(){disconnectRealtime();setSession('',null);}
  async function request(path,options={},auth=true){const headers={'Content-Type':'application/json','X-Arachne-Client':CLIENT_ID,...(options.headers||{})};if(auth&&token)headers.Authorization=`Bearer ${token}`;const response=await fetch(`${API_BASE}${path}`,{...options,headers});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||`HTTP ${response.status}`);return body;}

  async function lookupCampaigns(codes){const list=(Array.isArray(codes)?codes:[codes]).map(v=>String(v||'').trim()).filter(Boolean);if(!list.length)return[];const result=await request(`/campaigns/lookup?codes=${encodeURIComponent(list.join(','))}`,{},false);return result.data||[];}
  async function lookupCampaign(code){return (await lookupCampaigns([code]))[0]||null;}
  async function getTemplates(){const result=await request('/templates',{},false);return result.data||[];}
  async function getCharacters(){const result=await request('/characters',{},false);return result.data||{heroes:[],villains:[]};}
  async function createCampaign({name,masterPassword,mode='blank',templateId='',heroIds=[],villainIds=[]}){const result=await request('/campaigns',{method:'POST',body:JSON.stringify({name,masterPassword,mode,templateId,heroIds,villainIds})},false);return result.data;}
  async function join(role,{campaignCode,heroId=null,password=''}={}){const result=await request('/session/join',{method:'POST',body:JSON.stringify({role,campaignCode,heroId,password})},false);setSession(result.token,result.profile);return result.profile;}
  async function loadAll(){try{const result=await request('/state');return result.data||{};}catch(error){console.warn('[Arachne API] sessão indisponível.',error.message);return null;}}
  async function saveStorageKey(storageKey,value){const key=stateKeyFromStorage(storageKey);if(!key)return false;try{await request(`/state/${encodeURIComponent(key)}`,{method:'PUT',body:JSON.stringify({value})});return true;}catch(error){console.warn(`[Arachne API] falha ao salvar ${key}.`,error.message);return false;}}
  async function saveMany(values){try{await request('/state',{method:'PUT',body:JSON.stringify({values})});return true;}catch(error){console.warn('[Arachne API] falha ao salvar estado.',error.message);return false;}}
  async function saveHero(hero){if(!hero?.id)return false;try{await request(`/heroes/${encodeURIComponent(hero.id)}`,{method:'PUT',body:JSON.stringify({hero})});return true;}catch(error){console.warn(`[Arachne API] falha ao salvar herói ${hero.id}.`,error.message);return false;}}
  async function deleteHero(heroId){try{await request(`/heroes/${encodeURIComponent(heroId)}`,{method:'DELETE'});return true;}catch(error){console.warn('[Arachne API] falha ao remover herói.',error.message);return false;}}
  async function saveVillain(villain){if(!villain?.id)return false;try{await request(`/villains/${encodeURIComponent(villain.id)}`,{method:'PUT',body:JSON.stringify({villain})});return true;}catch(error){console.warn('[Arachne API] falha ao salvar vilão.',error.message);return false;}}
  async function deleteVillain(villainId){try{await request(`/villains/${encodeURIComponent(villainId)}`,{method:'DELETE'});return true;}catch(error){console.warn('[Arachne API] falha ao remover vilão.',error.message);return false;}}
  async function uploadAsset(file){if(!file)return null;const dataBase64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');reader.onerror=()=>reject(reader.error||new Error('Falha ao ler arquivo.'));reader.readAsDataURL(file);});const result=await request('/assets/upload',{method:'POST',body:JSON.stringify({fileName:file.name,mimeType:file.type,dataBase64})});return result.data||null;}
  async function savePlayerNote(heroId,note){if(!heroId)return false;try{await request(`/player-notes/${encodeURIComponent(heroId)}`,{method:'PUT',body:JSON.stringify({note})});return true;}catch(error){console.warn(`[Arachne API] falha ao salvar anotações de ${heroId}.`,error.message);return false;}}
  async function publishLiveRoll(payload){try{await request('/roll/live',{method:'POST',body:JSON.stringify(payload||{})});return true;}catch(error){console.warn('[Arachne API] falha ao publicar rolagem.',error.message);return false;}}
  async function health(){try{return await request('/health',{},false);}catch(error){return {ok:false,error:error?.message||'Falha de conexão',apiBase:API_BASE};}}
  async function probe(value){const previous=API_BASE;setApiBase(value,{persist:false});const result=await health();if(result?.ok)return result;API_BASE=previous;window.ARACHNE_API_URL=previous;return result;}

  function connectRealtime({onState,onPresence,onStatus,onReady,onLiveRoll}={}){
    disconnectRealtime();if(!token||typeof EventSource==='undefined')return null;
    const url=`${API_BASE}/events?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(CLIENT_ID)}`;
    eventSource=new EventSource(url);onStatus?.('connecting');
    eventSource.addEventListener('ready',event=>{onStatus?.('online');try{onReady?.(JSON.parse(event.data));}catch{}});
    eventSource.addEventListener('state',event=>{try{onState?.(JSON.parse(event.data));}catch(error){console.warn('[Arachne realtime] evento inválido.',error);}});
    eventSource.addEventListener('presence',event=>{try{onPresence?.(JSON.parse(event.data));}catch{}});
    eventSource.addEventListener('live-roll',event=>{try{onLiveRoll?.(JSON.parse(event.data));}catch(error){console.warn('[Arachne realtime] rolagem inválida.',error);}});
    eventSource.onopen=()=>onStatus?.('online');eventSource.onerror=()=>onStatus?.('reconnecting');return eventSource;
  }
  function disconnectRealtime(){if(eventSource)eventSource.close();eventSource=null;}

  window.ArachneAPI={CLIENT_ID,lookupCampaigns,lookupCampaign,getTemplates,getCharacters,createCampaign,join,setSession,clearSession,loadAll,saveStorageKey,saveMany,saveHero,deleteHero,saveVillain,deleteVillain,uploadAsset,savePlayerNote,publishLiveRoll,health,probe,setApiBase,getApiBase,connectRealtime,disconnectRealtime,stateKeyFromStorage,get API_BASE(){return API_BASE;},get profile(){return profile;},get token(){return token;}};
})();
