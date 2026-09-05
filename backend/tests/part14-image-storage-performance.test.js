import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const frontend=path.join(root,'frontend');
const portraits=path.join(frontend,'assets','portraits');
const thumbs=path.join(portraits,'thumbs');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const apiClient=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');
const filesJs=fs.readFileSync(path.join(root,'backend','src','files.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend','src','server.js'),'utf8');
const netlify=fs.readFileSync(path.join(root,'netlify.toml'),'utf8');
const sqliteSchema=fs.readFileSync(path.join(root,'backend','database','schema.sqlite.sql'),'utf8');
const supabaseSchema=fs.readFileSync(path.join(root,'backend','database','supabase.sql'),'utf8');

function webps(dir){return fs.readdirSync(dir).filter(x=>x.endsWith('.webp'));}

test('banco armazena estado/referências, não blobs ou colunas binárias de imagem',()=>{
  assert.doesNotMatch(sqliteSchema,/\bBLOB\b|base64|image_blob/i);
  assert.doesNotMatch(supabaseSchema,/\bbytea\b|base64|image_blob/i);
  assert.match(supabaseSchema,/state_value\s+jsonb/i);
});

test('cada retrato local possui thumbnail web otimizada',()=>{
  const full=webps(portraits),small=webps(thumbs);
  assert.equal(full.length,54);
  assert.equal(small.length,full.length);
  for(const name of full){
    const a=fs.statSync(path.join(portraits,name)).size;
    const b=fs.statSync(path.join(thumbs,name)).size;
    assert.ok(b<a,`${name}: thumbnail deve ser menor que original`);
  }
  const fullBytes=full.reduce((sum,n)=>sum+fs.statSync(path.join(portraits,n)).size,0);
  const thumbBytes=small.reduce((sum,n)=>sum+fs.statSync(path.join(thumbs,n)).size,0);
  assert.ok(thumbBytes<fullBytes*.3,`payload de thumbnails deve ficar abaixo de 30% (${thumbBytes}/${fullBytes})`);
});

test('frontend usa thumbnails para avatar/token e URLs versionadas para cache',()=>{
  assert.match(script,/IMAGE_ASSET_VERSION\s*=\s*'33\.4\.3'/);
  assert.match(script,/function portraitDisplaySrc\(/);
  assert.match(script,/thumbs\//);
  assert.match(script,/pieceHTML[\s\S]*portraitDisplaySrc\(src,\{small:true\}\)/);
  assert.match(script,/central-avatar[\s\S]*portraitDisplaySrc\(src,\{small:true\}\)/);
  assert.match(script,/central-character-portrait[\s\S]*portraitDisplaySrc\(src,\{small:true\}\)/);
});

test('cache de retratos é longo e imutável, sem mudar SSE',()=>{
  assert.match(netlify,/for = "\/assets\/portraits\/\*"[\s\S]*max-age=31536000, immutable/);
  assert.match(server,/startsWith\('\/assets\/portraits\/'\)[\s\S]*max-age=31536000, immutable/);
  const eventSources=(apiClient.match(/new EventSource\(/g)||[]).length;
  assert.equal(eventSources,1);
});

test('uploads de imagem usam hash para deduplicar e não aceitam arquivos gigantes',()=>{
  assert.match(filesJs,/createHash\('sha256'\)/);
  assert.match(filesJs,/\/images\/\$\{digest\}/);
  assert.match(filesJs,/MAX_IMAGE_BYTES=12\*1024\*1024/);
  assert.match(filesJs,/'x-upsert':allowedImageMime\.has\(mime\)\?'true':'false'/);
});

test('cliente reduz imagens grandes antes do upload quando houver ganho',()=>{
  assert.match(apiClient,/async function optimizeImageUpload\(/);
  assert.match(apiClient,/1600\/maxSide/);
  assert.match(apiClient,/canvas\.toBlob\(resolve,'image\/webp',0\.84\)/);
  assert.match(apiClient,/blob\.size>=file\.size\*\.95/);
});
