import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';
import { createRepository } from './db/index.js';
import { createSessionToken, verifySessionToken, isHeroId } from './auth.js';
import { getTemplates, publicTemplate, getTemplate, templateSeed, blankSeed, applyRoster, getCharacterLibrary } from './templates.js';
import { saveAsset, resolveLocalUpload } from './files.js';

const repo=createRepository();
const allowedKeys=new Set(['heroes','villains','campaign','campaignContent','dice','challenge','scenario','initiative','playerNotes','notesPlayer','notesMaster']);
const playerReadableKeys=new Set(['heroes','dice','scenario']);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
const subscribers=new Map();
let mutationQueue=Promise.resolve();

const HERO_IDS=['spider','wolverine','cap'];
const CODE_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function serializeMutation(fn){const task=mutationQueue.then(fn,fn);mutationQueue=task.catch(()=>{});return task;}
function send(res,status,body,headers={}){const isObject=body!==null&&typeof body==='object'&&!Buffer.isBuffer(body);const payload=isObject?Buffer.from(JSON.stringify(body)):Buffer.isBuffer(body)?body:Buffer.from(String(body??''));res.writeHead(status,{'Content-Type':isObject?'application/json; charset=utf-8':'text/plain; charset=utf-8','Content-Length':payload.length,...headers});res.end(payload);}
function corsHeaders(){return{'Access-Control-Allow-Origin':config.corsOrigin,'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Arachne-Client','Access-Control-Max-Age':'86400'};}
async function readJson(req,maxBytes=20*1024*1024){return await new Promise((resolve,reject)=>{let size=0;const chunks=[];req.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){reject(new Error('Payload muito grande.'));req.destroy();return;}chunks.push(chunk);});req.on('end',()=>{try{resolve(chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):{});}catch{reject(new Error('JSON inválido.'));}});req.on('error',reject);});}
function safeStaticPath(urlPath){const pathname=decodeURIComponent(urlPath.split('?')[0]),rel=pathname==='/'?'index.html':pathname.replace(/^\/+/,''),target=path.resolve(config.frontendDir,rel);return target.startsWith(config.frontendDir+path.sep)||target===path.join(config.frontendDir,'index.html')?target:null;}
function authFromRequest(req,url){const header=String(req.headers.authorization||''),bearer=header.startsWith('Bearer ')?header.slice(7).trim():'',query=url.searchParams.get('token')||'';return verifySessionToken(bearer||query);}
function clientIdFromRequest(req,url){return String(req.headers['x-arachne-client']||url.searchParams.get('clientId')||'').slice(0,120);}
function timingSafeTextEqual(a,b){const aa=Buffer.from(String(a||'')),bb=Buffer.from(String(b||''));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function normalizeCode(value){return String(value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);}
function generateCode(length=6){let out='';for(let i=0;i<length;i++)out+=CODE_ALPHABET[crypto.randomInt(0,CODE_ALPHABET.length)];return out;}
function publicCampaign(row){return row?{id:row.id,code:row.code,name:row.name,template:row.template||'blank',createdAt:row.created_at,updatedAt:row.updated_at}:null;}
async function publicCampaignWithRoster(row){if(!row)return null;const base=publicCampaign(row),heroes=await repo.get(row.id,'heroes'),content=await repo.get(row.id,'campaignContent');return {...base,heroes:Array.isArray(heroes)?heroes.map(h=>({id:h.id,n:h.n,r:h.r,rank:h.rank,image:h.image||''})):[],campaignContent:content?{title:content.title||row.name,subtitle:content.subtitle||'',rank:content.rank||4,players:content.players||0,finalVillain:content.finalVillain||'',accent:content.accent||'#ef3340'}:null};}
function hashPassword(password){const salt=crypto.randomBytes(16).toString('hex');const hash=crypto.scryptSync(String(password||''),salt,32).toString('hex');return `scrypt$${salt}$${hash}`;}
function verifyPassword(password,stored){if(!stored)return false;const [kind,salt,expected]=String(stored).split('$');if(kind!=='scrypt'||!salt||!expected)return false;const actual=crypto.scryptSync(String(password||''),salt,32).toString('hex');return timingSafeTextEqual(actual,expected);}
function requireAuth(req,res,url){const session=authFromRequest(req,url);if(!session){send(res,401,{ok:false,error:'Sessão inválida ou expirada.'},corsHeaders());return null;}return session;}
function requireMaster(session,res){if(session?.role!=='master'){send(res,403,{ok:false,error:'Ação exclusiva do Mestre.'},corsHeaders());return false;}return true;}

async function ensureDefaultCampaign(){
  const row=await repo.ensureCampaign({id:'main',code:'ARACHNE',name:'Projeto Arachne',passwordHash:hashPassword(config.masterPassword),template:'arachne'});
  const existing=await repo.get('main','campaignContent');
  if(!existing){const seed=templateSeed('arachne');if(seed)await repo.setMany('main',seed);}
  return row;
}
await ensureDefaultCampaign();

function sanitizeDiceHistoryForPlayer(history){if(!Array.isArray(history))return[];return history.map(entry=>{const source=entry&&typeof entry==='object'?entry:{};if(source.visibility==='public')return source;return{type:source.type||'ROLL',label:source.type==='DMG'?'Dano do Mestre':source.type==='INIT'?'Iniciativa do Mestre':source.type==='D616'?'D616 do Mestre':'Rolagem do Mestre',action:'',detail:'',total:source.total??'—',outcome:source.outcome||'',outcomeKey:source.outcomeKey||'',dice:source.dice&&typeof source.dice==='object'?source.dice:null,at:source.at||Date.now(),visibility:'masked'};});}
function filterStateForSession(all,session){if(session.role==='master')return all;const filtered={};for(const key of playerReadableKeys){if(!Object.prototype.hasOwnProperty.call(all,key))continue;filtered[key]=key==='dice'?sanitizeDiceHistoryForPlayer(all[key]):all[key];}const notes=all.playerNotes&&typeof all.playerNotes==='object'?all.playerNotes:{};filtered.playerNotes={[session.heroId]:String(notes[session.heroId]||'')};return filtered;}
function writeSse(res,event,data){if(res.writableEnded||res.destroyed)return;res.write(`event: ${event}\n`);res.write(`data: ${JSON.stringify(data)}\n\n`);}
function canSubscriberReceive(sub,key,meta={}){if(sub.session.role==='master')return true;if(key==='playerNotes')return meta.heroId===sub.session.heroId;return playerReadableKeys.has(key);}
function campaignSubscribers(campaignId){return [...subscribers.values()].filter(sub=>sub.session.campaignId===campaignId);}
function broadcastState(campaignId,key,value,meta={}){for(const sub of campaignSubscribers(campaignId)){if(meta.sourceClientId&&sub.clientId&&sub.clientId===meta.sourceClientId)continue;if(!canSubscriberReceive(sub,key,meta))continue;const visibleValue=key==='dice'&&sub.session.role==='player'?sanitizeDiceHistoryForPlayer(value):value;writeSse(sub.res,'state',{type:'state',key,value:visibleValue,heroId:meta.heroId||null,campaignId,updatedAt:new Date().toISOString(),sourceClientId:meta.sourceClientId||null});}}
function broadcastPresence(campaignId){const players={};let masters=0;const subs=campaignSubscribers(campaignId);for(const sub of subs){if(sub.session.role==='master')masters++;else players[sub.session.heroId]=(players[sub.session.heroId]||0)+1;}const payload={type:'presence',campaignId,masters,players,total:subs.length,updatedAt:new Date().toISOString()};for(const sub of subs)writeSse(sub.res,'presence',payload);}
function broadcastLiveRoll(campaignId,payload){const safe={type:String(payload?.type||'ROLL').slice(0,20),dice:{kind:String(payload?.dice?.kind||'marvel').slice(0,20),sides:Number(payload?.dice?.sides||6),count:Math.max(1,Math.min(12,Number(payload?.dice?.count||1)))},at:Date.now(),campaignId};for(const sub of campaignSubscribers(campaignId)){if(sub.session.role!=='player')continue;writeSse(sub.res,'live-roll',safe);}}
function openEvents(req,res,url,session){const headers={...corsHeaders(),'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'};res.writeHead(200,headers);res.write(': connected\n\n');const id=crypto.randomUUID(),clientId=clientIdFromRequest(req,url);subscribers.set(id,{id,res,session,clientId,connectedAt:Date.now()});writeSse(res,'ready',{type:'ready',provider:repo.provider,campaignId:session.campaignId,campaignCode:session.campaignCode,role:session.role,heroId:session.heroId||null});broadcastPresence(session.campaignId);req.on('close',()=>{subscribers.delete(id);broadcastPresence(session.campaignId);});}
setInterval(()=>{for(const[id,sub]of subscribers.entries()){if(sub.res.writableEnded||sub.res.destroyed){subscribers.delete(id);continue;}sub.res.write(': ping\n\n');}},20000).unref?.();

async function createUniqueCampaignCode(){for(let i=0;i<20;i++){const code=generateCode();if(!(await repo.getCampaignByCode(code)))return code;}throw new Error('Não foi possível gerar um código de campanha.');}

async function handleApi(req,res,url){
  const headers=corsHeaders();
  if(req.method==='OPTIONS')return send(res,204,'',headers);
  if(url.pathname==='/api/health'&&req.method==='GET')return send(res,200,{ok:true,app:'RPG Arachne API',provider:repo.provider,realtime:'sse',multiCampaign:true,templates:true,uploads:true},headers);
  if(url.pathname==='/api/templates'&&req.method==='GET')return send(res,200,{ok:true,data:getTemplates().map(publicTemplate)},headers);
  if(url.pathname==='/api/characters'&&req.method==='GET')return send(res,200,{ok:true,data:getCharacterLibrary('all')},headers);

  if(url.pathname==='/api/campaigns/lookup'&&req.method==='GET'){
    const codes=String(url.searchParams.get('codes')||url.searchParams.get('code')||'').split(',').map(normalizeCode).filter(Boolean);
    if(!codes.length)return send(res,400,{ok:false,error:'Informe um código de campanha.'},headers);
    const rows=await repo.getCampaignsByCodes(codes);
    const data=[];for(const row of rows)data.push(await publicCampaignWithRoster(row));
    return send(res,200,{ok:true,data},headers);
  }

  if(url.pathname==='/api/campaigns'&&req.method==='POST'){
    const body=await readJson(req);
    const mode=['template','blank','pdf'].includes(body?.mode)?body.mode:'blank';
    const templateId=String(body?.templateId||'').trim();
    const selectedTemplate=mode==='template'?getTemplate(templateId):null;
    const name=String(body?.name||selectedTemplate?.name||'').trim().slice(0,80);
    const password=String(body?.masterPassword||'');
    const heroIds=Array.isArray(body?.heroIds)?body.heroIds.map(v=>String(v||'').trim()).filter(Boolean):null;
    const villainIds=Array.isArray(body?.villainIds)?body.villainIds.map(v=>String(v||'').trim()).filter(Boolean):null;
    if(name.length<3)return send(res,400,{ok:false,error:'Informe um nome para a campanha.'},headers);
    if(password.length<4)return send(res,400,{ok:false,error:'A senha do Mestre precisa ter pelo menos 4 caracteres.'},headers);
    if(mode==='template'&&!selectedTemplate)return send(res,400,{ok:false,error:'Campanha pronta inválida.'},headers);
    const code=await createUniqueCampaignCode(),id=crypto.randomUUID(),template=mode==='template'?templateId:mode;
    const row=await repo.createCampaign({id,code,name,passwordHash:hashPassword(password),template});
    let seed=mode==='template'?templateSeed(templateId):blankSeed(name);
    if(mode==='pdf'){
      seed.campaignContent.documentMode='pdf';
      seed.campaignContent.subtitle='Campanha importada por PDF';
    }
    if(heroIds||villainIds) seed=applyRoster(seed,{heroIds:heroIds??seed.heroes.map(hero=>hero.id),villainIds:villainIds??seed.villains.map(villain=>villain.id)});
    await repo.setMany(id,seed);
    return send(res,201,{ok:true,data:await publicCampaignWithRoster(row)},headers);
  }

  if(url.pathname==='/api/session/join'&&req.method==='POST'){
    const body=await readJson(req),role=body?.role==='master'?'master':body?.role==='player'?'player':null,code=normalizeCode(body?.campaignCode||'ARACHNE');
    if(!role)return send(res,400,{ok:false,error:'Perfil inválido.'},headers);
    const campaign=await repo.getCampaignByCode(code);
    if(!campaign)return send(res,404,{ok:false,error:'Campanha não encontrada.'},headers);
    if(role==='master'&&!verifyPassword(body?.password,campaign.password_hash))return send(res,401,{ok:false,error:'Senha do Mestre incorreta.'},headers);
    if(role==='player'){const heroId=String(body?.heroId||'');if(!isHeroId(heroId))return send(res,400,{ok:false,error:'Escolha um herói válido.'},headers);const heroes=await repo.get(campaign.id,'heroes');if(!Array.isArray(heroes)||!heroes.some(h=>h?.id===heroId))return send(res,400,{ok:false,error:'Esse herói não pertence a esta campanha.'},headers);}
    const token=createSessionToken({role,heroId:body?.heroId||null,campaignId:campaign.id,campaignCode:campaign.code});
    return send(res,200,{ok:true,token,profile:{role,heroId:role==='player'?body.heroId:null,campaign:await publicCampaignWithRoster(campaign)},expiresInHours:config.sessionTtlHours},headers);
  }

  const session=requireAuth(req,res,url);if(!session)return;
  const sourceClientId=clientIdFromRequest(req,url),campaignId=session.campaignId;
  if(url.pathname==='/api/events'&&req.method==='GET')return openEvents(req,res,url,session);
  if(url.pathname==='/api/session/profile'&&req.method==='GET'){const campaign=await repo.getCampaignById(campaignId);return send(res,200,{ok:true,profile:{role:session.role,heroId:session.heroId||null,campaign:await publicCampaignWithRoster(campaign)}},headers);}
  if(url.pathname==='/api/roll/live'&&req.method==='POST'){if(!requireMaster(session,res))return;const body=await readJson(req);broadcastLiveRoll(campaignId,body);return send(res,200,{ok:true},headers);}
  if(url.pathname==='/api/state'&&req.method==='GET'){const all=await repo.getAll(campaignId);return send(res,200,{ok:true,data:filterStateForSession(all,session)},headers);}
  if(url.pathname==='/api/state'&&req.method==='PUT'){
    if(!requireMaster(session,res))return;const body=await readJson(req),values=body?.values;if(!values||typeof values!=='object'||Array.isArray(values))return send(res,400,{ok:false,error:'Envie { values: {...} }.'},headers);
    const sanitized=Object.fromEntries(Object.entries(values).filter(([key])=>allowedKeys.has(key)));await repo.setMany(campaignId,sanitized);
    for(const[key,value]of Object.entries(sanitized)){if(key==='playerNotes'){for(const[heroId,note]of Object.entries(value||{}))broadcastState(campaignId,'playerNotes',{heroId,note:String(note||'')},{heroId,sourceClientId});}else broadcastState(campaignId,key,value,{sourceClientId});}
    return send(res,200,{ok:true,saved:Object.keys(sanitized)},headers);
  }

  const heroMatch=url.pathname.match(/^\/api\/heroes\/([^/]+)$/);
  if(heroMatch&&req.method==='PUT'){
    const heroId=decodeURIComponent(heroMatch[1]);if(!isHeroId(heroId))return send(res,400,{ok:false,error:'Herói inválido.'},headers);if(session.role!=='master'&&session.heroId!==heroId)return send(res,403,{ok:false,error:'Você só pode editar seu próprio herói.'},headers);
    const body=await readJson(req),hero=body?.hero;if(!hero||typeof hero!=='object'||Array.isArray(hero)||hero.id!==heroId)return send(res,400,{ok:false,error:'Herói inválido.'},headers);
    const heroes=await serializeMutation(async()=>{const current=await repo.get(campaignId,'heroes'),next=Array.isArray(current)?[...current]:[],index=next.findIndex(item=>item?.id===heroId);if(index>=0)next[index]=hero;else next.push(hero);await repo.set(campaignId,'heroes',next);return next;});broadcastState(campaignId,'heroes',heroes,{sourceClientId});return send(res,200,{ok:true,data:hero},headers);
  }

  const heroDeleteMatch=url.pathname.match(/^\/api\/heroes\/([^/]+)$/);
  if(heroDeleteMatch&&req.method==='DELETE'){
    if(!requireMaster(session,res))return;const heroId=decodeURIComponent(heroDeleteMatch[1]);
    const heroes=Array.isArray(await repo.get(campaignId,'heroes'))?[...(await repo.get(campaignId,'heroes'))]:[];const next=heroes.filter(h=>h?.id!==heroId);await repo.set(campaignId,'heroes',next);
    const notes=(await repo.get(campaignId,'playerNotes'))||{};delete notes[heroId];await repo.set(campaignId,'playerNotes',notes);
    const scenario=(await repo.get(campaignId,'scenario'))||{};if(Array.isArray(scenario.pieces)){scenario.pieces=scenario.pieces.filter(p=>p?.baseId!==heroId);await repo.set(campaignId,'scenario',scenario);broadcastState(campaignId,'scenario',scenario,{sourceClientId});}
    broadcastState(campaignId,'heroes',next,{sourceClientId});return send(res,200,{ok:true},headers);
  }
  const villainMatch=url.pathname.match(/^\/api\/villains\/([^/]+)$/);
  if(villainMatch&&['PUT','DELETE'].includes(req.method)){
    if(!requireMaster(session,res))return;const villainId=decodeURIComponent(villainMatch[1]);if(!isHeroId(villainId))return send(res,400,{ok:false,error:'Identificador inválido.'},headers);
    const current=Array.isArray(await repo.get(campaignId,'villains'))?[...(await repo.get(campaignId,'villains'))]:[];
    if(req.method==='DELETE'){const next=current.filter(v=>v?.id!==villainId);await repo.set(campaignId,'villains',next);broadcastState(campaignId,'villains',next,{sourceClientId});return send(res,200,{ok:true},headers);}
    const body=await readJson(req),villain=body?.villain;if(!villain||typeof villain!=='object'||villain.id!==villainId)return send(res,400,{ok:false,error:'Vilão inválido.'},headers);const idx=current.findIndex(v=>v?.id===villainId);if(idx>=0)current[idx]=villain;else current.push(villain);await repo.set(campaignId,'villains',current);broadcastState(campaignId,'villains',current,{sourceClientId});return send(res,200,{ok:true,data:villain},headers);
  }
  if(url.pathname==='/api/assets/upload'&&req.method==='POST'){
    if(!requireMaster(session,res))return;const body=await readJson(req,45*1024*1024);const asset=await saveAsset({campaignId,fileName:body?.fileName,mimeType:body?.mimeType,dataBase64:body?.dataBase64});return send(res,201,{ok:true,data:asset},headers);
  }

  const noteMatch=url.pathname.match(/^\/api\/player-notes\/([^/]+)$/);
  if(noteMatch){
    const heroId=decodeURIComponent(noteMatch[1]);if(!isHeroId(heroId))return send(res,400,{ok:false,error:'Herói inválido.'},headers);if(session.role!=='master'&&session.heroId!==heroId)return send(res,403,{ok:false,error:'Anotações pertencem a outro jogador.'},headers);
    const notes=(await repo.get(campaignId,'playerNotes'))||{};
    if(req.method==='GET')return send(res,200,{ok:true,data:String(notes?.[heroId]||'')},headers);
    if(req.method==='PUT'){const body=await readJson(req),note=String(body?.note??'').slice(0,250000);await serializeMutation(async()=>{const current=(await repo.get(campaignId,'playerNotes'))||{},next={...(current&&typeof current==='object'?current:{}),[heroId]:note};await repo.set(campaignId,'playerNotes',next);});broadcastState(campaignId,'playerNotes',{heroId,note},{heroId,sourceClientId});return send(res,200,{ok:true,data:note},headers);}
  }

  const match=url.pathname.match(/^\/api\/state\/([^/]+)$/);
  if(match){
    const key=decodeURIComponent(match[1]);if(!allowedKeys.has(key))return send(res,400,{ok:false,error:'Chave inválida.'},headers);
    if(req.method==='GET'){if(session.role!=='master'&&!playerReadableKeys.has(key))return send(res,403,{ok:false,error:'Conteúdo exclusivo do Mestre.'},headers);const value=await repo.get(campaignId,key);return value===undefined?send(res,404,{ok:false,error:'Não encontrado.'},headers):send(res,200,{ok:true,data:value},headers);}
    if(req.method==='PUT'){if(!requireMaster(session,res))return;const body=await readJson(req);if(!Object.prototype.hasOwnProperty.call(body,'value'))return send(res,400,{ok:false,error:'Envie { value: ... }.'},headers);await repo.set(campaignId,key,body.value);if(key==='playerNotes'){for(const[heroId,note]of Object.entries(body.value||{}))broadcastState(campaignId,'playerNotes',{heroId,note:String(note||'')},{heroId,sourceClientId});}else broadcastState(campaignId,key,body.value,{sourceClientId});return send(res,200,{ok:true},headers);}
    if(req.method==='DELETE'){if(!requireMaster(session,res))return;await repo.remove(campaignId,key);broadcastState(campaignId,key,null,{sourceClientId});return send(res,200,{ok:true},headers);}
  }
  return send(res,404,{ok:false,error:'Rota não encontrada.'},headers);
}

const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(url.pathname.startsWith('/api/'))return await handleApi(req,res,url);if(url.pathname.startsWith('/uploads/')){const local=resolveLocalUpload(url.pathname);if(!local||!fs.existsSync(local))return send(res,404,'Arquivo não encontrado.');const data=fs.readFileSync(local),type=MIME[path.extname(local).toLowerCase()]||'application/octet-stream';res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':'public, max-age=86400'});return res.end(data);}if(!config.serveFrontend)return send(res,404,'Frontend desativado.');const file=safeStaticPath(url.pathname);if(!file||!fs.existsSync(file)||fs.statSync(file).isDirectory())return send(res,404,'Arquivo não encontrado.');const data=fs.readFileSync(file),type=MIME[path.extname(file).toLowerCase()]||'application/octet-stream';res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600'});res.end(data);}catch(error){console.error(error);if(!res.headersSent)send(res,500,{ok:false,error:error?.message||'Erro interno.'},corsHeaders());else res.end();}});
server.listen(config.port,()=>{console.log(`[Arachne] http://localhost:${config.port}`);console.log(`[Arachne] banco: ${repo.provider}`);console.log('[Arachne] campanhas: múltiplas salas por código');console.log('[Arachne] realtime: SSE por campanha');});
