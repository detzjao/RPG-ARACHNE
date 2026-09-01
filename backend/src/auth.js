import crypto from 'node:crypto';
import { config } from './config.js';

function validHeroId(value){return /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(String(value||''));}
function b64url(value) { return Buffer.from(value).toString('base64url'); }
function sign(payloadB64) { return crypto.createHmac('sha256', config.sessionSecret).update(payloadB64).digest('base64url'); }

export function createSessionToken({ role, heroId = null, campaignId, campaignCode }) {
  if (role !== 'master' && role !== 'player') throw new Error('Perfil inválido.');
  if (role === 'player' && !validHeroId(heroId)) throw new Error('Herói inválido.');
  if (!campaignId || !campaignCode) throw new Error('Campanha inválida.');
  const now=Date.now();
  const payload={v:3,sid:crypto.randomUUID(),role,heroId:role==='player'?String(heroId):null,campaignId:String(campaignId),campaignCode:String(campaignCode).toUpperCase(),iat:now,exp:now+Math.max(1,config.sessionTtlHours)*60*60*1000};
  const encoded=b64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token) {
  const raw=String(token||'');const[encoded,signature]=raw.split('.');if(!encoded||!signature)return null;
  const expected=sign(encoded),a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
  try{const payload=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8'));if(!payload||![2,3].includes(payload.v)||payload.exp<Date.now())return null;if(payload.role==='player'&&!validHeroId(payload.heroId))return null;if(payload.role!=='player'&&payload.role!=='master')return null;if(!payload.campaignId||!payload.campaignCode)return null;return payload;}catch{return null;}
}

export function isHeroId(value){return validHeroId(value);}
