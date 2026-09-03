import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const port=33123;
const backend=path.resolve(import.meta.dirname,'..');
const project=path.resolve(backend,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'arachne-part10-'));
const sqlite=path.join(tmp,'test.sqlite');
const frontendScript=fs.readFileSync(path.join(project,'frontend/script.js'),'utf8');
let server;

async function waitForServer(){
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){try{const r=await fetch(`http://127.0.0.1:${port}/api/health`);if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,60));}
  throw new Error('Servidor da Parte 10 não iniciou.');
}
async function api(route,{method='GET',token,body,clientId='part10-api'}={}){
  const headers={'Content-Type':'application/json','X-Arachne-Client':clientId};if(token)headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`http://127.0.0.1:${port}/api${route}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await response.json();}catch{data=null;}return{status:response.status,data};
}
async function join(role,heroId=''){
  const body=role==='master'?{role,campaignCode:'ARACHNE',password:'TESTMASTER'}:{role,campaignCode:'ARACHNE',heroId};
  const r=await api('/session/join',{method:'POST',body});assert.equal(r.status,200,JSON.stringify(r.data));return r.data.token;
}
async function openSse(token,clientId){
  const controller=new AbortController(),response=await fetch(`http://127.0.0.1:${port}/api/events?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}`,{signal:controller.signal});assert.equal(response.status,200);
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',closed=false;const events=[],waiters=[];
  function deliver(item){events.push(item);for(const waiter of [...waiters])if(waiter.predicate(item)){waiters.splice(waiters.indexOf(waiter),1);clearTimeout(waiter.timer);waiter.resolve(item);}}
  (async()=>{try{while(!closed){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let i;while((i=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,i);buffer=buffer.slice(i+2);let event='message',raw='';for(const line of block.split('\n')){if(line.startsWith('event:'))event=line.slice(6).trim();if(line.startsWith('data:'))raw+=line.slice(5).trim();}if(!raw)continue;let data;try{data=JSON.parse(raw);}catch{data=raw;}deliver({event,data});}}}catch(error){if(!closed&&error?.name!=='AbortError')throw error;}})();
  return{waitFor(predicate,timeout=3000){const found=events.find(predicate);if(found)return Promise.resolve(found);return new Promise((resolve,reject)=>{const waiter={predicate,resolve,timer:setTimeout(()=>{const idx=waiters.indexOf(waiter);if(idx>=0)waiters.splice(idx,1);reject(new Error('Timeout SSE Parte 10'));},timeout)};waiters.push(waiter);});},close(){closed=true;controller.abort();reader.cancel().catch(()=>{});}};
}

function piecesFor(scenario,id){return (scenario?.pieces||[]).filter(piece=>String(piece?.characterId||piece?.baseId||'')===id);}

test.before(async()=>{
  server=spawn(process.execPath,['src/server.js'],{cwd:backend,env:{...process.env,PORT:String(port),DB_PROVIDER:'sqlite',SQLITE_FILE:sqlite,MASTER_PASSWORD:'TESTMASTER',SESSION_SECRET:'test-secret-test-secret-test-secret',SERVE_FRONTEND:'false'},stdio:['ignore','pipe','pipe']});
  let err='';server.stderr.on('data',d=>{err+=String(d);});server.on('exit',code=>{if(code&&code!==0)console.error(err);});await waitForServer();
});
test.after(async()=>{if(server&&!server.killed){server.kill('SIGTERM');await new Promise(r=>setTimeout(r,100));}fs.rmSync(tmp,{recursive:true,force:true});});

test('adicionar vilão à iniciativa cria exatamente um token e sincroniza com jogador por SSE',async()=>{
  const master=await join('master'),player=await join('player','spider'),stream=await openSse(player,'part10-player');await stream.waitFor(e=>e.event==='ready');
  try{
    const before=await api('/state',{token:master});const villain=before.data.data.villains.find(v=>v.id==='octopus');assert.ok(villain);
    assert.equal(piecesFor(before.data.data.scenario,'octopus').length,0);
    const added=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'octopus'}});assert.equal(added.status,201,JSON.stringify(added.data));
    assert.equal(piecesFor(added.data.data.scenario,'octopus').length,1);const piece=piecesFor(added.data.data.scenario,'octopus')[0];assert.equal(piece.characterId,'octopus');assert.equal(piece.baseId,'octopus');assert.equal(piece.image,villain.image);assert.equal(piece.spawnedByInitiative,true);assert.ok(Number.isInteger(piece.x)&&Number.isInteger(piece.y));
    const pushed=await stream.waitFor(e=>e.event==='state'&&e.data?.key==='scenario'&&piecesFor(e.data.value,'octopus').length===1);assert.equal(piecesFor(pushed.data.value,'octopus').length,1);
    const duplicate=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'octopus'}});assert.equal(duplicate.status,409);assert.match(duplicate.data.error,/Já está na iniciativa/);
    const afterDuplicate=await api('/state',{token:master});assert.equal(piecesFor(afterDuplicate.data.data.scenario,'octopus').length,1);assert.equal(afterDuplicate.data.data.initiative.filter(p=>p.baseId==='octopus').length,1);
  }finally{stream.close();}
});

test('herói que já possui token é reutilizado e não duplicado',async()=>{
  const master=await join('master');const before=await api('/state',{token:master});const original=piecesFor(before.data.data.scenario,'spider');assert.equal(original.length,1);
  const added=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'spider'}});assert.equal(added.status,201,JSON.stringify(added.data));const pieces=piecesFor(added.data.data.scenario,'spider');assert.equal(pieces.length,1);assert.equal(pieces[0].id,original[0].id);assert.equal(pieces[0].characterId,'spider');assert.notEqual(pieces[0].spawnedByInitiative,true);
});

test('remover token criado pela iniciativa permite adicionar novamente sem duplicar',async()=>{
  const master=await join('master');let state=await api('/state',{token:master});let participant=state.data.data.initiative.find(p=>p.baseId==='octopus');assert.ok(participant);
  const removed=await api(`/initiative/participants/${encodeURIComponent(participant.id)}`,{method:'DELETE',token:master});assert.equal(removed.status,200,JSON.stringify(removed.data));assert.equal(removed.data.data.scenarioChanged,true);assert.equal(piecesFor(removed.data.data.scenario,'octopus').length,0);
  const addedAgain=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'octopus'}});assert.equal(addedAgain.status,201,JSON.stringify(addedAgain.data));assert.equal(piecesFor(addedAgain.data.data.scenario,'octopus').length,1);assert.equal(addedAgain.data.data.initiative.filter(p=>p.baseId==='octopus').length,1);
});


test('NPC adicionado à iniciativa também recebe um único token com movimento já existente',async()=>{
  const master=await join('master');
  const added=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'minion-melee'}});assert.equal(added.status,201,JSON.stringify(added.data));
  const pieces=piecesFor(added.data.data.scenario,'minion-melee');assert.equal(pieces.length,1);assert.equal(pieces[0].kind,'enemy');assert.equal(pieces[0].tier,'minion');assert.equal(pieces[0].movement.run,5);assert.equal(pieces[0].characterId,'minion-melee');
  const duplicate=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'minion-melee'}});assert.equal(duplicate.status,201,JSON.stringify(duplicate.data));assert.equal(piecesFor(duplicate.data.data.scenario,'minion-melee').length,2);assert.equal(duplicate.data.data.initiative.filter(p=>p.baseId==='minion-melee').length,2);
});

test('jogador não pode adicionar vilão à iniciativa',async()=>{
  const player=await join('player','spider');const denied=await api('/initiative/participants',{method:'POST',token:player,body:{baseId:'octopus'}});assert.equal(denied.status,403);
});

test('frontend reutiliza scenario.pieces e imagem existente, sem criar outro grid',()=>{
  assert.match(frontendScript,/data\?\.scenario/);
  assert.match(frontendScript,/piece\.image\|\|entity\?\.image\|\|characterArt/);
  assert.equal((frontendScript.match(/function renderScenario\(\)/g)||[]).length,1);
  assert.equal((frontendScript.match(/function scenarioPieceAt\(/g)||[]).length,1);
});

test('limpar iniciativa remove apenas tokens criados automaticamente e preserva tokens preexistentes',async()=>{
  const master=await join('master');
  // spider já existe no cenário base; octopus foi criado automaticamente pelo teste anterior.
  let state=await api('/state',{token:master});
  if(!state.data.data.initiative.some(p=>p.baseId==='spider'))await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'spider'}});
  if(!state.data.data.initiative.some(p=>p.baseId==='octopus'))await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'octopus'}});
  const cleared=await api('/initiative/participants',{method:'DELETE',token:master});assert.equal(cleared.status,200,JSON.stringify(cleared.data));
  assert.deepEqual(cleared.data.data.initiative,[]);
  assert.equal(piecesFor(cleared.data.data.scenario,'octopus').length,0);
  assert.equal(piecesFor(cleared.data.data.scenario,'spider').length,1);
});
