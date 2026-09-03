import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import net from 'node:net';
import { config } from './config.js';

const allowedMime=new Set(['application/pdf','image/png','image/jpeg','image/webp']);
const allowedImageMime=new Set(['image/png','image/jpeg','image/webp']);
const extByMime={'application/pdf':'.pdf','image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'};
const MAX_IMAGE_BYTES=12*1024*1024;
const MAX_PDF_BYTES=30*1024*1024;
function cleanBase64(value){return String(value||'').replace(/^data:[^;]+;base64,/, '').replace(/\s+/g,'');}
function safeId(value){return String(value||'').replace(/[^a-z0-9_-]/gi,'_').slice(0,100)||'campaign';}

async function ensureSupabaseBucket(){
  const endpoint=`${config.supabaseUrl}/storage/v1/bucket`;
  const headers={apikey:config.supabaseServiceRoleKey,Authorization:`Bearer ${config.supabaseServiceRoleKey}`,'Content-Type':'application/json'};
  const check=await fetch(`${endpoint}/${encodeURIComponent(config.supabaseStorageBucket)}`,{headers});
  if(check.ok)return;
  const create=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({id:config.supabaseStorageBucket,name:config.supabaseStorageBucket,public:true,file_size_limit:30*1024*1024,allowed_mime_types:[...allowedMime]})});
  if(!create.ok&&!String(await create.text()).includes('already'))throw new Error('Não foi possível preparar o Storage do Supabase.');
}

export async function saveAssetBuffer({campaignId,fileName,mimeType,data}){
  const mime=String(mimeType||'').toLowerCase();if(!allowedMime.has(mime))throw new Error('Tipo de arquivo não permitido.');
  const buffer=Buffer.isBuffer(data)?data:Buffer.from(data||[]);if(!buffer.length)throw new Error('Arquivo vazio.');
  const limit=allowedImageMime.has(mime)?MAX_IMAGE_BYTES:MAX_PDF_BYTES;if(buffer.length>limit)throw new Error(allowedImageMime.has(mime)?'Imagem maior que 12 MB.':'Arquivo maior que 30 MB.');
  const ext=extByMime[mime]||path.extname(fileName||'').toLowerCase();
  const digest=crypto.createHash('sha256').update(buffer).digest('hex');
  const objectName=allowedImageMime.has(mime)?`${safeId(campaignId)}/images/${digest}${ext}`:`${safeId(campaignId)}/${Date.now()}-${crypto.randomUUID()}${ext}`;
  if(config.dbProvider==='supabase'&&config.supabaseUrl&&config.supabaseServiceRoleKey){
    await ensureSupabaseBucket();
    const url=`${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.supabaseStorageBucket)}/${objectName.split('/').map(encodeURIComponent).join('/')}`;
    const response=await fetch(url,{method:'POST',headers:{apikey:config.supabaseServiceRoleKey,Authorization:`Bearer ${config.supabaseServiceRoleKey}`,'Content-Type':mime,'x-upsert':allowedImageMime.has(mime)?'true':'false','Cache-Control':allowedImageMime.has(mime)?'public, max-age=31536000, immutable':'public, max-age=86400'},body:buffer});
    if(!response.ok)throw new Error((await response.text())||'Falha ao enviar arquivo ao Supabase Storage.');
    return {url:`${config.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(config.supabaseStorageBucket)}/${objectName.split('/').map(encodeURIComponent).join('/')}`,mime,size:buffer.length,name:path.basename(fileName||objectName),provider:'supabase'};
  }
  const target=path.join(config.uploadsDir,objectName);fs.mkdirSync(path.dirname(target),{recursive:true});if(!fs.existsSync(target))fs.writeFileSync(target,buffer);
  return {url:`/uploads/${objectName.replace(/\\/g,'/')}`,mime,size:buffer.length,name:path.basename(fileName||objectName),provider:'local'};
}

export async function saveAsset({campaignId,fileName,mimeType,dataBase64}){
  const mime=String(mimeType||'').toLowerCase();if(!allowedMime.has(mime))throw new Error('Tipo de arquivo não permitido.');
  const data=Buffer.from(cleanBase64(dataBase64),'base64');
  return saveAssetBuffer({campaignId,fileName,mimeType:mime,data});
}

function isPrivateAddress(address){
  const family=net.isIP(address);if(!family)return true;
  if(family===4){const parts=address.split('.').map(Number);return parts[0]===10||parts[0]===127||parts[0]===0||(parts[0]===169&&parts[1]===254)||(parts[0]===172&&parts[1]>=16&&parts[1]<=31)||(parts[0]===192&&parts[1]===168)||(parts[0]>=224);}
  const a=address.toLowerCase();return a==='::1'||a==='::'||a.startsWith('fc')||a.startsWith('fd')||a.startsWith('fe80:');
}
async function assertPublicUrl(raw){
  let url;try{url=new URL(String(raw||''));}catch{throw new Error('URL de imagem inválida.');}
  if(url.protocol!=='https:')throw new Error('A imagem precisa usar HTTPS.');
  if(['localhost','localhost.localdomain'].includes(url.hostname.toLowerCase()))throw new Error('Host de imagem não permitido.');
  const addresses=await dns.lookup(url.hostname,{all:true,verbatim:true});if(!addresses.length||addresses.some(item=>isPrivateAddress(item.address)))throw new Error('Host de imagem não permitido.');
  return url;
}

export async function importRemoteImage({campaignId,remoteUrl,fileName='imagem-web'}){
  let current=await assertPublicUrl(remoteUrl);
  for(let redirects=0;redirects<4;redirects++){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
    let response;
    try{response=await fetch(current,{redirect:'manual',signal:controller.signal,headers:{'User-Agent':'RPG-Arachne/31 image-import'}});}finally{clearTimeout(timer);}
    if(response.status>=300&&response.status<400&&response.headers.get('location')){current=await assertPublicUrl(new URL(response.headers.get('location'),current).toString());continue;}
    if(!response.ok)throw new Error(`A fonte da imagem respondeu HTTP ${response.status}.`);
    const mime=String(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();if(!allowedImageMime.has(mime))throw new Error('A URL selecionada não retornou uma imagem JPG, PNG ou WebP.');
    const declared=Number(response.headers.get('content-length')||0);if(declared>12*1024*1024)throw new Error('Imagem remota maior que 12 MB.');
    const reader=response.body?.getReader?.();if(!reader)throw new Error('Não foi possível ler a imagem remota.');
    const chunks=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>12*1024*1024){try{await reader.cancel();}catch{}throw new Error('Imagem remota maior que 12 MB.');}chunks.push(Buffer.from(value));}
    const ext=extByMime[mime]||'.img';return saveAssetBuffer({campaignId,fileName:`${fileName}${ext}`,mimeType:mime,data:Buffer.concat(chunks)});
  }
  throw new Error('Redirecionamentos demais ao importar imagem.');
}

export function resolveLocalUpload(urlPath){
  if(!urlPath.startsWith('/uploads/'))return null;const rel=decodeURIComponent(urlPath.slice('/uploads/'.length));const target=path.resolve(config.uploadsDir,rel);return target.startsWith(path.resolve(config.uploadsDir)+path.sep)?target:null;
}
