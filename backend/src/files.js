import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';

const allowedMime=new Set(['application/pdf','image/png','image/jpeg','image/webp']);
const extByMime={'application/pdf':'.pdf','image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'};
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

export async function saveAsset({campaignId,fileName,mimeType,dataBase64}){
  const mime=String(mimeType||'').toLowerCase();if(!allowedMime.has(mime))throw new Error('Tipo de arquivo não permitido.');
  const data=Buffer.from(cleanBase64(dataBase64),'base64');if(!data.length)throw new Error('Arquivo vazio.');if(data.length>30*1024*1024)throw new Error('Arquivo maior que 30 MB.');
  const ext=extByMime[mime]||path.extname(fileName||'').toLowerCase();const objectName=`${safeId(campaignId)}/${Date.now()}-${crypto.randomUUID()}${ext}`;
  if(config.dbProvider==='supabase'&&config.supabaseUrl&&config.supabaseServiceRoleKey){
    await ensureSupabaseBucket();
    const url=`${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.supabaseStorageBucket)}/${objectName.split('/').map(encodeURIComponent).join('/')}`;
    const response=await fetch(url,{method:'POST',headers:{apikey:config.supabaseServiceRoleKey,Authorization:`Bearer ${config.supabaseServiceRoleKey}`,'Content-Type':mime,'x-upsert':'false'},body:data});
    if(!response.ok)throw new Error((await response.text())||'Falha ao enviar arquivo ao Supabase Storage.');
    return {url:`${config.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(config.supabaseStorageBucket)}/${objectName.split('/').map(encodeURIComponent).join('/')}`,mime,size:data.length,name:path.basename(fileName||objectName),provider:'supabase'};
  }
  const target=path.join(config.uploadsDir,objectName);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);
  return {url:`/uploads/${objectName.replace(/\\/g,'/')}`,mime,size:data.length,name:path.basename(fileName||objectName),provider:'local'};
}

export function resolveLocalUpload(urlPath){
  if(!urlPath.startsWith('/uploads/'))return null;const rel=decodeURIComponent(urlPath.slice('/uploads/'.length));const target=path.resolve(config.uploadsDir,rel);return target.startsWith(path.resolve(config.uploadsDir)+path.sep)?target:null;
}
