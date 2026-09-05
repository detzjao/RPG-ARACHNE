import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const port=33117;
const root=path.resolve(import.meta.dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'arachne-test-'));
const sqlite=path.join(tmp,'test.sqlite');
let server;

async function waitForServer(){
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    try{const r=await fetch(`http://127.0.0.1:${port}/api/health`);if(r.ok)return;}catch{}
    await new Promise(r=>setTimeout(r,75));
  }
  throw new Error('Servidor de teste não iniciou.');
}
async function api(route,{method='GET',token,body}={}){
  const headers={'Content-Type':'application/json','X-Arachne-Client':'node-test'};
  if(token)headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`http://127.0.0.1:${port}/api${route}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await response.json();}catch{data=null;}
  return {status:response.status,data,headers:response.headers};
}
async function joinMaster(code='ARACHNE',password='TESTMASTER'){
  const r=await api('/session/join',{method:'POST',body:{role:'master',campaignCode:code,password}});
  assert.equal(r.status,200,JSON.stringify(r.data));return r.data.token;
}
async function joinPlayer(heroId='spider',code='ARACHNE'){
  const r=await api('/session/join',{method:'POST',body:{role:'player',campaignCode:code,heroId}});
  assert.equal(r.status,200,JSON.stringify(r.data));return r.data.token;
}

async function openSse(token,clientId='node-sse-test'){
  const controller=new AbortController();
  const response=await fetch(`http://127.0.0.1:${port}/api/events?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}`,{signal:controller.signal});
  assert.equal(response.status,200);
  const reader=response.body.getReader(),decoder=new TextDecoder();
  let buffer='',closed=false;const events=[],waiters=[];
  function deliver(event){events.push(event);for(const waiter of [...waiters]){if(waiter.predicate(event)){waiters.splice(waiters.indexOf(waiter),1);clearTimeout(waiter.timer);waiter.resolve(event);}}}
  (async()=>{try{while(!closed){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let index;while((index=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,index);buffer=buffer.slice(index+2);let eventName='message',data='';for(const line of block.split('\n')){if(line.startsWith('event:'))eventName=line.slice(6).trim();else if(line.startsWith('data:'))data+=line.slice(5).trim();}if(!data)continue;let parsed;try{parsed=JSON.parse(data);}catch{parsed=data;}deliver({event:eventName,data:parsed});}}}catch(error){if(!closed&&error?.name!=='AbortError')console.error(error);}})();
  return{
    waitFor(predicate,timeout=3000){const found=events.find(predicate);if(found)return Promise.resolve(found);return new Promise((resolve,reject)=>{const waiter={predicate,resolve,reject,timer:setTimeout(()=>{const i=waiters.indexOf(waiter);if(i>=0)waiters.splice(i,1);reject(new Error('Timeout aguardando evento SSE.'));},timeout)};waiters.push(waiter);});},
    close(){closed=true;controller.abort();reader.cancel().catch(()=>{});}
  };
}

test.before(async()=>{
  server=spawn(process.execPath,['src/server.js'],{cwd:root,env:{...process.env,PORT:String(port),DB_PROVIDER:'sqlite',SQLITE_FILE:sqlite,MASTER_PASSWORD:'TESTMASTER',SESSION_SECRET:'test-secret-test-secret-test-secret',SERVE_FRONTEND:'false'},stdio:['ignore','pipe','pipe']});
  let err='';server.stderr.on('data',d=>{err+=String(d);});
  server.on('exit',code=>{if(code&&code!==0)console.error(err);});
  await waitForServer();
});

test.after(async()=>{
  if(server&&!server.killed){server.kill('SIGTERM');await new Promise(r=>setTimeout(r,100));}
  fs.rmSync(tmp,{recursive:true,force:true});
});

test('health informa versão, realtime e busca de imagens',async()=>{
  const r=await api('/health');
  assert.equal(r.status,200);
  assert.equal(r.data.version,'33.5.0');
  assert.equal(r.data.realtime,'sse');
  assert.equal(r.data.imageSearch,true);
});

test('estado de jogador é sanitizado e não inclui vilões',async()=>{
  const token=await joinPlayer();
  const r=await api('/state',{token});
  assert.equal(r.status,200);
  assert.ok(Array.isArray(r.data.data.heroes));
  assert.equal('villains' in r.data.data,false);
  assert.equal('notesMaster' in r.data.data,false);
  assert.ok(r.data.data.combat);
});

test('jogador altera somente Current Health/Focus do próprio herói e respeita limites',async()=>{
  const token=await joinPlayer();
  const state=await api('/state',{token});
  const hero=state.data.data.heroes.find(h=>h.id==='spider');
  const originalHealth=hero.currentHealth;
  const originalFocus=hero.currentFocus;

  const limited=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:-999,currentFocus:999999}});
  assert.equal(limited.status,200,JSON.stringify(limited.data));
  assert.equal(limited.data.data.currentHealth,0);
  assert.equal(limited.data.data.currentFocus,limited.data.data.maxFocus);

  const delta=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{healthDelta:5,focusDelta:-5}});
  assert.equal(delta.status,200,JSON.stringify(delta.data));
  assert.equal(delta.data.data.currentHealth,Math.min(5,delta.data.data.maxHealth));
  assert.equal(delta.data.data.currentFocus,Math.max(0,delta.data.data.maxFocus-5));

  const restored=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:originalHealth,currentFocus:originalFocus}});
  assert.equal(restored.status,200,JSON.stringify(restored.data));
  assert.equal(restored.data.data.currentHealth,originalHealth);
  assert.equal(restored.data.data.currentFocus,originalFocus);
});

test('jogador não consegue editar ficha, outro herói, vilão, máximos ou outros atributos',async()=>{
  const token=await joinPlayer();
  const playerState=await api('/state',{token});
  const hero=playerState.data.data.heroes.find(h=>h.id==='spider');
  const otherHero=playerState.data.data.heroes.find(h=>h.id!=='spider');
  assert.ok(otherHero);

  const full=await api('/heroes/spider',{method:'PUT',token,body:{hero:{...hero,currentHealth:1}}});
  assert.equal(full.status,403);

  const other=await api(`/characters/hero/${encodeURIComponent(otherHero.id)}/resources`,{method:'PATCH',token,body:{healthDelta:-5}});
  assert.equal(other.status,403);

  const villain=await api('/characters/villain/octopus/resources',{method:'PATCH',token,body:{healthDelta:-5}});
  assert.equal(villain.status,403);

  const maxHealth=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{maxHealth:1,currentHealth:1}});
  assert.equal(maxHealth.status,403);

  const maxFocus=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{maxFocus:1,currentFocus:1}});
  assert.equal(maxFocus.status,403);

  const attribute=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{abilities:{Melee:99},currentHealth:1}});
  assert.equal(attribute.status,403);

  const invalid=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:'abc'}});
  assert.equal(invalid.status,400);

  const after=await api('/state',{token});
  const sameHero=after.data.data.heroes.find(h=>h.id==='spider');
  assert.equal(sameHero.maxHealth,hero.maxHealth);
  assert.equal(sameHero.maxFocus,hero.maxFocus);
  assert.deepEqual(sameHero.abilities,hero.abilities);
});

test('Mestre altera recurso por endpoint dedicado e o backend limita ao máximo',async()=>{
  const token=await joinMaster();
  const before=await api('/state',{token});
  const hero=before.data.data.heroes.find(h=>h.id==='spider');
  const r=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:999999}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  assert.equal(r.data.data.currentHealth,r.data.data.maxHealth);
  await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:hero.currentHealth}});
});

test('Mestre continua podendo alterar recursos de vilões',async()=>{
  const token=await joinMaster();
  const before=await api('/state',{token});
  const villain=before.data.data.villains.find(v=>v.id==='octopus');
  assert.ok(villain);
  const changed=await api('/characters/villain/octopus/resources',{method:'PATCH',token,body:{healthDelta:-1,focusDelta:-1}});
  assert.equal(changed.status,200,JSON.stringify(changed.data));
  assert.equal(changed.data.data.currentHealth,Math.max(0,villain.currentHealth-1));
  assert.equal(changed.data.data.currentFocus,Math.max(0,villain.currentFocus-1));
  const restored=await api('/characters/villain/octopus/resources',{method:'PATCH',token,body:{currentHealth:villain.currentHealth,currentFocus:villain.currentFocus}});
  assert.equal(restored.status,200,JSON.stringify(restored.data));
});

test('jogador pode alterar o TN da campanha e a rolagem usa o novo valor',async()=>{
  const player=await joinPlayer();
  const updated=await api('/challenge/tn',{method:'PATCH',token:player,body:{tn:18}});
  assert.equal(updated.status,200,JSON.stringify(updated.data));
  assert.equal(updated.data.data.tn,18);
  const r=await api('/actions/d616/start',{method:'POST',token:player,body:{actorId:'qualquer-outro',ability:'Agility',action:'Teste do jogador',tn:18}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  assert.equal(r.data.data.snapshot.actorId,'spider');
  assert.equal(r.data.data.snapshot.tn,18);
});

test('modo de apoio permite rolagem do jogador independentemente do turno de combate',async()=>{
  const master=await joinMaster();
  const state=await api('/state',{token:master});
  const heroes=state.data.data.heroes;
  assert.ok(heroes.length>=2);
  const initiative=[
    {baseId:heroes[1].id,name:heroes[1].n,result:20,kind:'hero'},
    {baseId:'spider',name:'Spider-Man',result:10,kind:'hero'}
  ];
  await api('/state/initiative',{method:'PUT',token:master,body:{value:initiative}});
  const start=await api('/combat/start',{method:'POST',token:master,body:{}});
  assert.equal(start.status,200,JSON.stringify(start.data));
  const player=await joinPlayer();
  const rolled=await api('/actions/d616/start',{method:'POST',token:player,body:{ability:'Agility'}});
  assert.equal(rolled.status,200,JSON.stringify(rolled.data));
  assert.equal(rolled.data.data.snapshot.actorId,'spider');
  await api('/combat/end',{method:'POST',token:master,body:{}});
});

test('campanhas criadas ficam isoladas do estado ARACHNE',async()=>{
  const create=await api('/campaigns',{method:'POST',body:{mode:'blank',name:'Mesa Isolada',masterPassword:'outra-senha'}});
  assert.equal(create.status,201,JSON.stringify(create.data));
  const code=create.data.data.code;
  const other=await joinMaster(code,'outra-senha');
  await api('/state/notesMaster',{method:'PUT',token:other,body:{value:'SEGREDO-ISOLADO'}});
  const main=await joinMaster();
  const mainState=await api('/state',{token:main});
  assert.notEqual(mainState.data.data.notesMaster,'SEGREDO-ISOLADO');
});

test('busca e troca de imagem são administrativas',async()=>{
  const player=await joinPlayer();
  const search=await api('/images/search?name=Spider-Man',{token:player});
  const set=await api('/characters/hero/spider/image',{method:'PUT',token:player,body:{assetUrl:'/uploads/x.webp'}});
  assert.equal(search.status,403);
  assert.equal(set.status,403);
});

test('Mestre recebe D616 do servidor e histórico só é gravado após finalizar a animação',async()=>{
  const master=await joinMaster();
  const before=await api('/state',{token:master});
  const historyBefore=Array.isArray(before.data.data.dice)?before.data.data.dice.length:0;
  const hero=before.data.data.heroes.find(h=>h.id==='spider');
  const start=await api('/actions/d616/start',{method:'POST',token:master,body:{
    actorId:'spider',kind:'hero',ability:'Agility',action:'Teste Parte 2',tn:17,edge:0,trouble:0,extra:2,source:'hero',deferFinalize:true,
    actor:{id:hero.id,n:hero.n,abilities:hero.abilities}
  }});
  assert.equal(start.status,200,JSON.stringify(start.data));
  assert.equal(start.data.data.finalized,false);
  assert.equal(start.data.data.snapshot.actorId,'spider');
  assert.equal(start.data.data.snapshot.tn,17);
  assert.equal(start.data.data.snapshot.extra,2);
  assert.equal(start.data.data.initialValues.length,3);
  assert.deepEqual(start.data.data.values,start.data.data.initialValues);
  for(const value of start.data.data.values)assert.ok(value>=1&&value<=6);

  const during=await api('/state',{token:master});
  assert.equal((during.data.data.dice||[]).length,historyBefore);

  const finish=await api(`/actions/d616/${encodeURIComponent(start.data.data.id)}/finalize`,{method:'POST',token:master,body:{}});
  assert.equal(finish.status,200,JSON.stringify(finish.data));
  assert.equal(finish.data.data.finalized,true);
  assert.ok(finish.data.data.historyEntry);
  assert.deepEqual(finish.data.data.historyEntry.dice.values,start.data.data.values);

  const after=await api('/state',{token:master});
  assert.equal((after.data.data.dice||[]).length,Math.min(historyBefore+1,50));
  assert.deepEqual(after.data.data.dice[0].dice.values,start.data.data.values);
});

test('Edge do Mestre é calculado no servidor e permanece pendente até o frontend finalizar',async()=>{
  const master=await joinMaster();
  const state=await api('/state',{token:master});
  const hero=state.data.data.heroes.find(h=>h.id==='spider');
  const start=await api('/actions/d616/start',{method:'POST',token:master,body:{
    actorId:'spider',kind:'hero',ability:'Agility',action:'Edge Parte 2',tn:14,edge:1,trouble:0,extra:0,source:'hero',deferFinalize:true,
    actor:{id:hero.id,n:hero.n,abilities:hero.abilities}
  }});
  assert.equal(start.status,200,JSON.stringify(start.data));
  assert.equal(start.data.data.finalized,false);
  assert.equal(start.data.data.edgeRemaining,1);
  const edge=await api(`/actions/d616/${encodeURIComponent(start.data.data.id)}/edge`,{method:'POST',token:master,body:{index:0}});
  assert.equal(edge.status,200,JSON.stringify(edge.data));
  assert.equal(edge.data.data.edgeRemaining,0);
  assert.equal(edge.data.data.finalized,false);
  const last=edge.data.data.logs.at(-1);
  assert.equal(last.kind,'edge');
  assert.equal(last.index,0);
  assert.ok(last.rerolled>=1&&last.rerolled<=6);
  const finish=await api(`/actions/d616/${encodeURIComponent(start.data.data.id)}/finalize`,{method:'POST',token:master,body:{}});
  assert.equal(finish.status,200,JSON.stringify(finish.data));
  assert.equal(finish.data.data.finalized,true);
});


test('jogador define Edge e Trouble por rolagem na Central',async()=>{
  const player=await joinPlayer();
  const rolled=await api('/actions/d616/start',{method:'POST',token:player,body:{
    ability:'Agility',action:'Teste com Edge e Trouble',tn:14,edge:1,trouble:1
  }});
  assert.equal(rolled.status,200,JSON.stringify(rolled.data));
  assert.equal(rolled.data.data.snapshot.edge,1);
  assert.equal(rolled.data.data.snapshot.trouble,1);
  assert.equal(rolled.data.data.edgeRemaining,0);
  assert.equal(rolled.data.data.finalized,true);
});

test('rolagem do jogador chega ao Mestre por SSE com o mesmo resultado e atualiza o histórico',async()=>{
  const master=await joinMaster();
  await api('/state/challenge',{method:'PUT',token:master,body:{value:{action:'Parte 3 realtime',tn:16,edge:0,trouble:0,extra:0}}});
  const stream=await openSse(master,'master-part3');
  await stream.waitFor(event=>event.event==='ready');
  const player=await joinPlayer();
  try{
    const rolled=await api('/actions/d616/start',{method:'POST',token:player,body:{ability:'Agility',action:'Teste Parte 3'}});
    assert.equal(rolled.status,200,JSON.stringify(rolled.data));
    assert.equal(rolled.data.data.finalized,true);
    const rollId=rolled.data.data.id;
    const start=await stream.waitFor(event=>event.event==='live-roll'&&event.data?.phase==='start'&&event.data?.rollId===rollId);
    assert.equal(start.data.actorId,'spider');
    assert.equal(start.data.actorName,rolled.data.data.snapshot.actorName);
    assert.equal(start.data.ability,'Agility');
    assert.equal(start.data.tn,16);
    assert.deepEqual(start.data.dice.values,rolled.data.data.values);
    const final=await stream.waitFor(event=>event.event==='live-roll'&&event.data?.phase==='final'&&event.data?.rollId===rollId);
    assert.equal(final.data.total,rolled.data.data.math.total);
    assert.equal(final.data.outcome,rolled.data.data.outcome.label);
    assert.deepEqual(final.data.dice.values,rolled.data.data.values);
    const history=await stream.waitFor(event=>event.event==='state'&&event.data?.key==='actionHistory'&&event.data?.value?.some?.(item=>item?.rollId===rollId));
    const entry=history.data.value.find(item=>item.rollId===rollId);
    assert.equal(entry.originRole,'player');
    assert.equal(entry.actorName,rolled.data.data.snapshot.actorName);
    assert.equal(entry.ability,'Agility');
    assert.equal(entry.abilityMod,rolled.data.data.snapshot.abilityMod);
    assert.equal(entry.tn,16);
    assert.equal(entry.total,rolled.data.data.math.total);
    assert.deepEqual(entry.dice.values,rolled.data.data.values);
  }finally{stream.close();}
});

test('Central do Mestre pode editar a ordem de combate ativa sem criar outro estado ou realtime',async()=>{
  const master=await joinMaster();
  const snapshot=await api('/state',{token:master});
  const heroes=snapshot.data.data.heroes||[],villains=snapshot.data.data.villains||[];
  assert.ok(heroes.length>=2);
  await api('/state/initiative',{method:'PUT',token:master,body:{value:[
    {id:'part4-a',baseId:heroes[0].id,name:heroes[0].n,result:18,modifier:1},
    {id:'part4-b',baseId:heroes[1].id,name:heroes[1].n,result:14,modifier:0}
  ]}});
  const started=await api('/combat/start',{method:'POST',token:master,body:{}});
  assert.equal(started.status,200,JSON.stringify(started.data));
  const firstId=started.data.data.order.find(item=>item.baseId===heroes[0].id)?.id;
  assert.ok(firstId);

  const updated=await api('/combat/order',{method:'PATCH',token:master,body:{action:'update',id:firstId,result:27}});
  assert.equal(updated.status,200,JSON.stringify(updated.data));
  assert.equal(updated.data.data.order.find(item=>item.id===firstId).result,27);

  const villain=villains[0];
  if(villain){
    const added=await api('/combat/order',{method:'PATCH',token:master,body:{action:'add',participant:{baseId:villain.id,name:villain.n,kind:'villain',result:21,modifier:2}}});
    assert.equal(added.status,200,JSON.stringify(added.data));
    const addedEntry=added.data.data.order.find(item=>item.baseId===villain.id);
    assert.ok(addedEntry);
    const removed=await api('/combat/order',{method:'PATCH',token:master,body:{action:'remove',id:addedEntry.id}});
    assert.equal(removed.status,200,JSON.stringify(removed.data));
    assert.equal(removed.data.data.order.some(item=>item.id===addedEntry.id),false);
  }

  const player=await joinPlayer(heroes[0].id);
  const forbidden=await api('/combat/order',{method:'PATCH',token:player,body:{action:'update',id:firstId,result:99}});
  assert.equal(forbidden.status,403);
  await api('/combat/end',{method:'POST',token:master,body:{}});
});


test('movimentação no grid valida dono e sincroniza Mestre + 2 jogadores sem bloquear por turno',async()=>{
  const master=await joinMaster(),snapshot=await api('/state',{token:master}),heroes=snapshot.data.data.heroes||[];
  assert.ok(heroes.some(h=>h.id==='spider'));
  assert.ok(heroes.some(h=>h.id==='wolverine'));
  const originalScenario=snapshot.data.data.scenario;
  const basePieces=(originalScenario.pieces||[]).filter(p=>['spider','wolverine','cap'].includes(p.baseId)).map(p=>({...p}));
  const spiderPiece=basePieces.find(p=>p.baseId==='spider'),wolverinePiece=basePieces.find(p=>p.baseId==='wolverine');
  assert.ok(spiderPiece);assert.ok(wolverinePiece);
  spiderPiece.x=2;spiderPiece.y=2;wolverinePiece.x=6;wolverinePiece.y=2;
  const capPiece=basePieces.find(p=>p.baseId==='cap');if(capPiece){capPiece.x=10;capPiece.y=2;}
  basePieces.push({id:'enemy-part5',kind:'enemy',baseId:'minion-melee',name:'Capanga de teste',x:12,y:2,movement:{run:5}});
  const scenario={...originalScenario,width:20,height:14,baseTerrain:'floor',obstacles:{},terrain:{},decor:{},turnMovement:{},movementSpent:{},pieces:basePieces};
  await api('/state/scenario',{method:'PUT',token:master,body:{value:scenario}});
  await api('/state/initiative',{method:'PUT',token:master,body:{value:[
    {id:'move-spider',baseId:'spider',name:'Homem-Aranha',result:20,modifier:0},
    {id:'move-wolverine',baseId:'wolverine',name:'Wolverine',result:10,modifier:0}
  ]}});
  const started=await api('/combat/start',{method:'POST',token:master,body:{}});assert.equal(started.status,200,JSON.stringify(started.data));
  const player1=await joinPlayer('spider'),player2=await joinPlayer('wolverine');
  const masterStream=await openSse(master,'master-part5'),player2Stream=await openSse(player2,'player2-part5');
  await masterStream.waitFor(event=>event.event==='ready');await player2Stream.waitFor(event=>event.event==='ready');
  try{
    const moved=await api('/scenario/move',{method:'PATCH',token:player1,body:{pieceId:spiderPiece.id,x:3,y:2,mode:'run',from:{x:2,y:2}}});
    assert.equal(moved.status,200,JSON.stringify(moved.data));
    assert.equal(moved.data.data.piece.baseId,'spider');assert.equal(moved.data.data.piece.x,3);assert.equal(moved.data.data.piece.y,2);assert.equal(moved.data.data.cost,1);
    assert.equal(moved.data.data.scenario.pieces.find(p=>p.baseId==='spider').x,3);
    const masterEvent=await masterStream.waitFor(event=>event.event==='state'&&event.data?.key==='scenario'&&event.data?.value?.pieces?.some?.(p=>p.baseId==='spider'&&p.x===3&&p.y===2));
    const player2Event=await player2Stream.waitFor(event=>event.event==='state'&&event.data?.key==='scenario'&&event.data?.value?.pieces?.some?.(p=>p.baseId==='spider'&&p.x===3&&p.y===2));
    assert.equal(masterEvent.data.campaignId,player2Event.data.campaignId);

    const steal=await api('/scenario/move',{method:'PATCH',token:player2,body:{pieceId:spiderPiece.id,x:4,y:2,mode:'run',from:{x:3,y:2}}});
    assert.equal(steal.status,403);assert.match(steal.data.error,/próprio personagem/i);
    const npcSteal=await api('/scenario/move',{method:'PATCH',token:player1,body:{pieceId:'enemy-part5',x:13,y:2,mode:'run',from:{x:12,y:2}}});
    assert.equal(npcSteal.status,403);assert.match(npcSteal.data.error,/próprio personagem/i);
    const outOfTurn=await api('/scenario/move',{method:'PATCH',token:player2,body:{pieceId:wolverinePiece.id,x:7,y:2,mode:'run',from:{x:6,y:2}}});
    assert.equal(outOfTurn.status,200,JSON.stringify(outOfTurn.data));assert.equal(outOfTurn.data.data.piece.baseId,'wolverine');

    const occupied=await api('/scenario/move',{method:'PATCH',token:player1,body:{pieceId:spiderPiece.id,x:7,y:2,mode:'run',from:{x:3,y:2}}});
    assert.equal(occupied.status,409);assert.match(occupied.data.error,/Casa indisponível/i);

    const masterNpcMove=await api('/scenario/move',{method:'PATCH',token:master,body:{pieceId:'enemy-part5',x:13,y:2,mode:'run',from:{x:12,y:2}}});
    assert.equal(masterNpcMove.status,200,JSON.stringify(masterNpcMove.data));assert.equal(masterNpcMove.data.data.piece.kind,'enemy');
    const masterMove=await api('/scenario/move',{method:'PATCH',token:master,body:{pieceId:wolverinePiece.id,x:8,y:2,mode:'run',from:{x:7,y:2}}});
    assert.equal(masterMove.status,200,JSON.stringify(masterMove.data));assert.equal(masterMove.data.data.piece.baseId,'wolverine');

    const next=await api('/combat/next',{method:'POST',token:master,body:{}});assert.equal(next.status,200);assert.equal(next.data.data.order[next.data.data.turnIndex].baseId,'wolverine');
    const player1Blocked=await api('/scenario/move',{method:'PATCH',token:player1,body:{pieceId:spiderPiece.id,x:4,y:2,mode:'run',from:{x:3,y:2}}});
    assert.equal(player1Blocked.status,200,JSON.stringify(player1Blocked.data));assert.equal(player1Blocked.data.data.piece.baseId,'spider');
    const player2Move=await api('/scenario/move',{method:'PATCH',token:player2,body:{pieceId:wolverinePiece.id,x:9,y:2,mode:'run',from:{x:8,y:2}}});
    assert.equal(player2Move.status,200,JSON.stringify(player2Move.data));assert.equal(player2Move.data.data.piece.baseId,'wolverine');
  }finally{
    masterStream.close();player2Stream.close();await api('/combat/end',{method:'POST',token:master,body:{}});await api('/state/scenario',{method:'PUT',token:master,body:{value:originalScenario}});
  }
});

test('ataque do Mestre calcula dano no backend usando o mesmo Marvel Die da D616',async()=>{
  const master=await joinMaster();
  const state=await api('/state',{token:master});
  const hero=state.data.data.heroes.find(h=>h.id==='spider');
  const started=await api('/actions/d616/start',{method:'POST',token:master,body:{
    actorId:'spider',kind:'hero',ability:'Melee',action:'Ataque corpo a corpo',tn:1,edge:0,trouble:0,extra:0,source:'hero',rollType:'attack',damageMultiplier:5,damageReduction:0,deferFinalize:true,
    actor:{id:hero.id,n:hero.n,abilities:hero.abilities}
  }});
  assert.equal(started.status,200,JSON.stringify(started.data));
  const roll=started.data.data;
  assert.equal(roll.snapshot.rollType,'attack');
  assert.equal(roll.damage.rawMarvelDie,roll.values[1]);
  const marvel=roll.values[1]===1?6:roll.values[1];
  const fantastic=roll.outcome.fantastic?2:1;
  assert.equal(roll.damage.marvelDie,marvel);
  assert.equal(roll.damage.total,(marvel*5+roll.snapshot.abilityMod)*fantastic);
  const finish=await api(`/actions/d616/${encodeURIComponent(roll.id)}/finalize`,{method:'POST',token:master,body:{}});
  assert.equal(finish.status,200,JSON.stringify(finish.data));
  assert.equal(finish.data.data.historyEntry.type,'D616');
  assert.equal(finish.data.data.historyEntry.rollId,roll.id);
  assert.equal(finish.data.data.historyEntry.marvelDie,roll.values[1]);
  assert.equal(finish.data.data.historyEntry.damage.total,roll.damage.total);
});

test('ataque de jogador ignora multiplicador fabricado no frontend e usa perfil autoritativo',async()=>{
  const master=await joinMaster();
  await api('/combat/end',{method:'POST',token:master,body:{}});
  await api('/state/challenge',{method:'PUT',token:master,body:{value:{action:'Ataque seguro',tn:1,edge:0,trouble:0,extra:0}}});
  const player=await joinPlayer('spider');
  const rolled=await api('/actions/d616/start',{method:'POST',token:player,body:{ability:'Melee',action:'Ataque do jogador',attack:true,damageMultiplier:30,damageReduction:20}});
  assert.equal(rolled.status,200,JSON.stringify(rolled.data));
  assert.equal(rolled.data.data.snapshot.rollType,'attack');
  assert.equal(rolled.data.data.damage.multiplier,5);
  assert.equal(rolled.data.data.damage.reduction,0);
  assert.equal(rolled.data.data.damage.rawMarvelDie,rolled.data.data.values[1]);
  assert.equal(rolled.data.data.historyEntry.type,'D616');
  assert.equal(rolled.data.data.historyEntry.damage.total,rolled.data.data.damage.total);
});


test('iniciativa na preparação usa D616 do servidor, histórico e bloqueia duplicados',async()=>{
  const master=await joinMaster();
  await api('/combat/end',{method:'POST',token:master,body:{}});
  await api('/state/initiative',{method:'PUT',token:master,body:{value:[]}});

  const state=await api('/state',{token:master});
  const spider=state.data.data.heroes.find(hero=>hero.id==='spider');
  assert.ok(spider);
  const expectedMod=Number(String(spider.initiative||'+0').match(/[+-]?\d+/)?.[0]||0);

  const added=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'spider',modifier:99,result:199}});
  assert.equal(added.status,201,JSON.stringify(added.data));
  assert.equal(added.data.data.participant.baseId,'spider');
  assert.equal(added.data.data.participant.modifier,expectedMod);
  assert.equal(added.data.data.participant.result,null);

  const duplicate=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'spider'}});
  assert.equal(duplicate.status,409);
  assert.equal(duplicate.data.error,'Já está na iniciativa.');

  const participantId=added.data.data.participant.id;
  const rolled=await api('/initiative/roll',{method:'POST',token:master,body:{participantId}});
  assert.equal(rolled.status,200,JSON.stringify(rolled.data));
  const values=rolled.data.data.roll.values;
  assert.equal(values.length,3);
  values.forEach(value=>assert.ok(value>=1&&value<=6));
  const diceTotal=values[0]+(values[1]===1?6:values[1])+values[2];
  assert.equal(rolled.data.data.participant.result,diceTotal+expectedMod);
  assert.equal(rolled.data.data.historyEntry.rollId,rolled.data.data.roll.id);
  assert.deepEqual(rolled.data.data.historyEntry.dice.values,values);
  assert.equal(rolled.data.data.historyEntry.type,'INIT');
  assert.equal(rolled.data.data.historyEntry.abilityMod,expectedMod);

  const persisted=await api('/state',{token:master});
  assert.equal(persisted.data.data.dice[0].rollId,rolled.data.data.roll.id);
  assert.deepEqual(persisted.data.data.dice[0].dice.values,values);

  const villains=persisted.data.data.villains||[];
  assert.ok(villains.length);
  const villain=villains[0];
  const addVillain=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:villain.id}});
  assert.equal(addVillain.status,201,JSON.stringify(addVillain.data));
  const rollVillain=await api('/initiative/roll',{method:'POST',token:master,body:{participantId:addVillain.data.data.participant.id}});
  assert.equal(rollVillain.status,200,JSON.stringify(rollVillain.data));
  const list=rollVillain.data.data.initiative;
  for(let i=1;i<list.length;i++){
    const a=list[i-1],b=list[i];
    const ordered=Number(a.result)>Number(b.result)||
      (Number(a.result)===Number(b.result)&&Number(a.modifier)>Number(b.modifier))||
      (Number(a.result)===Number(b.result)&&Number(a.modifier)===Number(b.modifier)&&String(a.name).localeCompare(String(b.name))<=0);
    assert.equal(ordered,true,'ordem de iniciativa não respeitou resultado/modificador/nome');
  }

  const duplicateVillain=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:villain.id}});
  assert.equal(duplicateVillain.status,409);

  const removed=await api(`/initiative/participants/${encodeURIComponent(addVillain.data.data.participant.id)}`,{method:'DELETE',token:master});
  assert.equal(removed.status,200,JSON.stringify(removed.data));
  assert.equal(removed.data.data.initiative.some(item=>item.baseId===villain.id),false);
  const readded=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:villain.id}});
  assert.equal(readded.status,201,JSON.stringify(readded.data));
  assert.equal(readded.data.data.participant.result,null);

  const player=await joinPlayer();
  const forbidden=await api('/initiative/participants',{method:'POST',token:player,body:{baseId:'spider'}});
  assert.equal(forbidden.status,403);
});

test('backend bloqueia duplicação também por gravação direta do estado e na ordem ativa',async()=>{
  const master=await joinMaster();
  const duplicated=[{id:'a',baseId:'spider',name:'Spider-Man',modifier:3,result:20},{id:'b',baseId:'spider',name:'Spider-Man',modifier:3,result:10}];
  const direct=await api('/state/initiative',{method:'PUT',token:master,body:{value:duplicated}});
  assert.equal(direct.status,409);
  assert.equal(direct.data.error,'Já está na iniciativa.');

  await api('/state/initiative',{method:'PUT',token:master,body:{value:[{id:'solo',baseId:'spider',name:'Spider-Man',modifier:3,result:20}]}});
  const started=await api('/combat/start',{method:'POST',token:master,body:{}});
  assert.equal(started.status,200,JSON.stringify(started.data));
  const duplicateActive=await api('/combat/order',{method:'PATCH',token:master,body:{action:'add',participant:{baseId:'spider',name:'Spider-Man',result:18,modifier:3,kind:'hero'}}});
  assert.equal(duplicateActive.status,400);
  assert.equal(duplicateActive.data.error,'Já está na iniciativa.');
  await api('/combat/end',{method:'POST',token:master,body:{}});
});

test('NPC usa modificador autoritativo, aceita múltiplas instâncias e pode rolar novamente após remover e adicionar',async()=>{
  const master=await joinMaster();
  await api('/combat/end',{method:'POST',token:master,body:{}});
  await api('/state/initiative',{method:'PUT',token:master,body:{value:[]}});

  const added=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'minion-melee',modifier:30}});
  assert.equal(added.status,201,JSON.stringify(added.data));
  assert.equal(added.data.data.participant.modifier,1);
  assert.equal(added.data.data.participant.name,'Capanga · Curta distância 1');
  assert.equal(added.data.data.participant.repeatable,true);

  const duplicate=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'minion-melee'}});
  assert.equal(duplicate.status,201,JSON.stringify(duplicate.data));
  assert.equal(duplicate.data.data.participant.name,'Capanga · Curta distância 2');
  assert.notEqual(duplicate.data.data.participant.id,added.data.data.participant.id);

  const first=await api('/initiative/roll',{method:'POST',token:master,body:{participantId:added.data.data.participant.id}});
  assert.equal(first.status,200,JSON.stringify(first.data));
  assert.equal(first.data.data.roll.values.length,3);
  assert.equal(first.data.data.historyEntry.type,'INIT');

  const removed=await api(`/initiative/participants/${encodeURIComponent(added.data.data.participant.id)}`,{method:'DELETE',token:master});
  assert.equal(removed.status,200,JSON.stringify(removed.data));
  assert.equal(removed.data.data.initiative.filter(p=>p.baseId==='minion-melee').length,1);

  const readded=await api('/initiative/participants',{method:'POST',token:master,body:{baseId:'minion-melee'}});
  assert.equal(readded.status,201,JSON.stringify(readded.data));
  assert.equal(readded.data.data.participant.result,null);
  assert.notEqual(readded.data.data.participant.id,added.data.data.participant.id);

  const second=await api('/initiative/roll',{method:'POST',token:master,body:{participantId:readded.data.data.participant.id}});
  assert.equal(second.status,200,JSON.stringify(second.data));
  assert.notEqual(second.data.data.roll.id,first.data.data.roll.id);
});


test('Central do Mestre resolve ataque e aplica o dano da mesma rollId no backend',async()=>{
  const master=await joinMaster();
  await api('/combat/end',{method:'POST',token:master,body:{}});
  const before=await api('/state',{token:master});
  const target=before.data.data.heroes.find(hero=>hero.id==='wolverine');
  assert.ok(target);
  const originalHealth=Number(target.currentHealth);

  let roll=null,finalized=null;
  for(let attempt=0;attempt<40;attempt++){
    const started=await api('/actions/d616/start',{method:'POST',token:master,body:{
      actorId:'spider',kind:'hero',source:'hero',ability:'Melee',action:'Ataque corpo a corpo',tn:1,
      edge:0,trouble:0,extra:0,rollType:'attack',targetId:'wolverine',targetKind:'hero',damageResource:'focus',deferFinalize:true,
      damageMultiplier:999,damageReduction:20
    }});
    assert.equal(started.status,200,JSON.stringify(started.data));
    roll=started.data.data;
    finalized=await api(`/actions/d616/${encodeURIComponent(roll.id)}/finalize`,{method:'POST',token:master,body:{}});
    assert.equal(finalized.status,200,JSON.stringify(finalized.data));
    if(finalized.data.data.outcome.success)break;
  }
  assert.equal(finalized?.data?.data?.outcome?.success,true,'esperava obter ao menos um ataque bem-sucedido');
  assert.equal(roll.snapshot.targetId,'wolverine');
  assert.equal(roll.snapshot.targetName,target.n);
  assert.equal(roll.snapshot.tn,10+Number(target.abilities.Melee||0));
  assert.equal(roll.snapshot.damageResource,'health');
  assert.equal(roll.values.length,3);
  assert.equal(roll.damage.rawMarvelDie,roll.values[1]);
  assert.equal(roll.damage.multiplier,5);

  const entry=finalized.data.data.historyEntry;
  assert.equal(entry.rollId,roll.id);
  assert.equal(entry.targetId,'wolverine');
  assert.equal(entry.damageApplied,false);
  assert.deepEqual(entry.dice.values,roll.values);

  const player=await joinPlayer('spider');
  const stream=await openSse(player,'attack-damage-player');
  try{
    const stateEvent=stream.waitFor(event=>event.event==='state'&&event.data?.key==='heroes',3000);
    const applied=await api(`/actions/d616/${encodeURIComponent(roll.id)}/apply-damage`,{method:'POST',token:master,body:{damage:9999,targetId:'spider'}});
    assert.equal(applied.status,200,JSON.stringify(applied.data));
    const expected=Math.max(0,originalHealth-Number(applied.data.data.damage.total));
    assert.equal(applied.data.data.target.currentHealth,expected);
    assert.equal(applied.data.data.historyEntry.damageApplied,true);
    assert.equal(applied.data.data.historyEntry.damageAppliedAmount,applied.data.data.damage.total);
    assert.equal(applied.data.data.historyEntry.rollId,roll.id);
    const live=await stateEvent;
    const liveTarget=live.data.value.find(hero=>hero.id==='wolverine');
    assert.equal(liveTarget.currentHealth,expected);

    const duplicate=await api(`/actions/d616/${encodeURIComponent(roll.id)}/apply-damage`,{method:'POST',token:master,body:{}});
    assert.equal(duplicate.status,409);
    assert.match(duplicate.data.error,/já foi aplicado/i);
  }finally{stream.close();}
  await api('/characters/hero/wolverine/resources',{method:'PATCH',token:master,body:{currentHealth:originalHealth}});
});

test('ataque que falha não permite aplicar dano',async()=>{
  const master=await joinMaster();
  let failed=null;
  for(let attempt=0;attempt<50;attempt++){
    const started=await api('/actions/d616/start',{method:'POST',token:master,body:{actorId:'spider',kind:'hero',source:'hero',ability:'Melee',action:'Ataque',tn:99,edge:0,trouble:0,extra:0,rollType:'attack',targetId:'wolverine',targetKind:'hero',damageResource:'focus',deferFinalize:true}});
    assert.equal(started.status,200,JSON.stringify(started.data));
    const finalized=await api(`/actions/d616/${encodeURIComponent(started.data.data.id)}/finalize`,{method:'POST',token:master,body:{}});
    assert.equal(finalized.status,200,JSON.stringify(finalized.data));
    if(!finalized.data.data.outcome.success){failed=finalized.data.data;break;}
  }
  assert.ok(failed,'esperava obter ao menos uma falha para validar bloqueio de dano');
  const applied=await api(`/actions/d616/${encodeURIComponent(failed.id)}/apply-damage`,{method:'POST',token:master,body:{}});
  assert.equal(applied.status,409);
  assert.match(applied.data.error,/não acertou/i);
});

test('EGO e LOGIC usam a defesa correspondente da ficha e afetam Focus',async()=>{
  const master=await joinMaster();
  const snapshot=await api('/state',{token:master});
  const target=snapshot.data.data.villains.find(villain=>villain.id==='aim-agent');
  assert.ok(target);
  for(const ability of ['Ego','Logic']){
    const started=await api('/actions/d616/start',{method:'POST',token:master,body:{actorId:'spider',kind:'hero',source:'hero',ability,action:`Ataque de ${ability}`,tn:1,rollType:'attack',targetId:target.id,targetKind:'villain',damageResource:'health',deferFinalize:true}});
    assert.equal(started.status,200,JSON.stringify(started.data));
    assert.equal(started.data.data.snapshot.tn,10+Number(target.abilities[ability]||0));
    assert.equal(started.data.data.snapshot.damageResource,'focus');
    await api(`/actions/d616/${encodeURIComponent(started.data.data.id)}/finalize`,{method:'POST',token:master,body:{}});
  }
});

test('novo turno renova o movimento do próprio personagem e mantém autorização server-side',async()=>{
  const master=await joinMaster(),snapshot=await api('/state',{token:master}),originalScenario=snapshot.data.data.scenario;
  const heroes=snapshot.data.data.heroes||[],spider=heroes.find(h=>h.id==='spider'),wolverine=heroes.find(h=>h.id==='wolverine');
  assert.ok(spider);assert.ok(wolverine);
  const spiderPiece={id:'turn-reset-spider',kind:'hero',baseId:'spider',characterId:'spider',name:spider.n,x:2,y:3,movement:{run:5}};
  const wolverinePiece={id:'turn-reset-wolverine',kind:'hero',baseId:'wolverine',characterId:'wolverine',name:wolverine.n,x:8,y:3,movement:{run:5}};
  const scenario={...originalScenario,width:20,height:14,baseTerrain:'floor',obstacles:{},terrain:{},decor:{},pieces:[spiderPiece,wolverinePiece],turnMovement:{[spiderPiece.id]:{mode:'run',spent:5},[wolverinePiece.id]:{mode:'run',spent:5}},movementSpent:{[spiderPiece.id]:{run:5},[wolverinePiece.id]:{run:5}}};
  await api('/state/scenario',{method:'PUT',token:master,body:{value:scenario}});
  await api('/state/initiative',{method:'PUT',token:master,body:{value:[
    {id:'turn-reset-init-spider',baseId:'spider',characterId:'spider',name:spider.n,result:20,modifier:0},
    {id:'turn-reset-init-wolverine',baseId:'wolverine',characterId:'wolverine',name:wolverine.n,result:10,modifier:0}
  ]}});
  const started=await api('/combat/start',{method:'POST',token:master,body:{}});assert.equal(started.status,200,JSON.stringify(started.data));
  const player1=await joinPlayer('spider'),player2=await joinPlayer('wolverine');
  try{
    const stateAfterStart=await api('/state',{token:master}),scenarioAfterStart=stateAfterStart.data.data.scenario;
    assert.equal(scenarioAfterStart.turnMovement?.[spiderPiece.id],undefined,'o movimento do participante que inicia deve ser renovado');
    assert.ok(scenarioAfterStart.turnMovement?.[wolverinePiece.id],'o participante que ainda não recebeu o turno deve manter o estado anterior até seu turno');
    const move1=await api('/scenario/move',{method:'PATCH',token:player1,body:{pieceId:spiderPiece.id,x:3,y:3,mode:'run',from:{x:2,y:3}}});
    assert.equal(move1.status,200,JSON.stringify(move1.data));
    const next=await api('/combat/next',{method:'POST',token:master,body:{}});assert.equal(next.status,200,JSON.stringify(next.data));
    const stateAfterNext=await api('/state',{token:master}),scenarioAfterNext=stateAfterNext.data.data.scenario;
    assert.equal(scenarioAfterNext.turnMovement?.[wolverinePiece.id],undefined,'o movimento deve ser renovado quando o novo turno começa');
    const move2=await api('/scenario/move',{method:'PATCH',token:player2,body:{pieceId:wolverinePiece.id,x:9,y:3,mode:'run',from:{x:8,y:3}}});
    assert.equal(move2.status,200,JSON.stringify(move2.data));
  }finally{
    await api('/combat/end',{method:'POST',token:master,body:{}});
    await api('/state/scenario',{method:'PUT',token:master,body:{value:originalScenario}});
  }
});

test('quatro controles da Central do Jogador correspondem a Health−, Health+, Focus− e Focus+',async()=>{
  const token=await joinPlayer();
  const before=await api('/state',{token});
  const hero=before.data.data.heroes.find(h=>h.id==='spider');
  const safeHealth=Math.min(Math.max(1,Number(hero.currentHealth||0)),Math.max(1,Number(hero.maxHealth||1)-1));
  const safeFocus=Math.min(Math.max(1,Number(hero.currentFocus||0)),Math.max(1,Number(hero.maxFocus||1)-1));
  await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:safeHealth,currentFocus:safeFocus}});

  const healthMinus=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{healthDelta:-1}});
  assert.equal(healthMinus.status,200,JSON.stringify(healthMinus.data));
  assert.equal(healthMinus.data.data.currentHealth,Math.max(0,safeHealth-1));
  const healthPlus=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{healthDelta:1}});
  assert.equal(healthPlus.status,200,JSON.stringify(healthPlus.data));
  assert.equal(healthPlus.data.data.currentHealth,safeHealth);

  const focusMinus=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{focusDelta:-1}});
  assert.equal(focusMinus.status,200,JSON.stringify(focusMinus.data));
  assert.equal(focusMinus.data.data.currentFocus,Math.max(0,safeFocus-1));
  const focusPlus=await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{focusDelta:1}});
  assert.equal(focusPlus.status,200,JSON.stringify(focusPlus.data));
  assert.equal(focusPlus.data.data.currentFocus,safeFocus);

  await api('/characters/hero/spider/resources',{method:'PATCH',token,body:{currentHealth:hero.currentHealth,currentFocus:hero.currentFocus}});
});

test('Health e Focus alterados pelo jogador persistem e chegam em realtime ao Mestre e outro jogador',async()=>{
  const master=await joinMaster();
  const player=await joinPlayer('spider');
  const otherPlayer=await joinPlayer('wolverine');
  const masterSse=await openSse(master,'resource-master-sse');
  const otherSse=await openSse(otherPlayer,'resource-other-player-sse');
  try{
    await Promise.all([
      masterSse.waitFor(event=>event.event==='ready'),
      otherSse.waitFor(event=>event.event==='ready')
    ]);

    const before=await api('/state',{token:player});
    const original=before.data.data.heroes.find(hero=>hero.id==='spider');
    assert.ok(original);
    const nextHealth=original.currentHealth>0?original.currentHealth-1:Math.min(original.maxHealth,1);
    const nextFocus=original.currentFocus>0?original.currentFocus-1:Math.min(original.maxFocus,1);

    const healthMasterEvent=masterSse.waitFor(event=>event.event==='state'&&event.data?.key==='heroes'&&event.data.value?.some?.(hero=>hero.id==='spider'&&hero.currentHealth===nextHealth));
    const healthOtherEvent=otherSse.waitFor(event=>event.event==='state'&&event.data?.key==='heroes'&&event.data.value?.some?.(hero=>hero.id==='spider'&&hero.currentHealth===nextHealth));
    const health=await api('/characters/hero/spider/resources',{method:'PATCH',token:player,body:{currentHealth:nextHealth}});
    assert.equal(health.status,200,JSON.stringify(health.data));
    assert.equal(health.data.data.currentHealth,nextHealth);
    const [masterHealth,otherHealth]=await Promise.all([healthMasterEvent,healthOtherEvent]);
    assert.equal(masterHealth.data.campaignId,otherHealth.data.campaignId);

    const focusMasterEvent=masterSse.waitFor(event=>event.event==='state'&&event.data?.key==='heroes'&&event.data.value?.some?.(hero=>hero.id==='spider'&&hero.currentFocus===nextFocus));
    const focusOtherEvent=otherSse.waitFor(event=>event.event==='state'&&event.data?.key==='heroes'&&event.data.value?.some?.(hero=>hero.id==='spider'&&hero.currentFocus===nextFocus));
    const focus=await api('/characters/hero/spider/resources',{method:'PATCH',token:player,body:{currentFocus:nextFocus}});
    assert.equal(focus.status,200,JSON.stringify(focus.data));
    assert.equal(focus.data.data.currentFocus,nextFocus);
    await Promise.all([focusMasterEvent,focusOtherEvent]);

    // Recarregar a página equivale a hidratar novamente o estado persistido.
    const refreshed=await api('/state',{token:player});
    const refreshedHero=refreshed.data.data.heroes.find(hero=>hero.id==='spider');
    assert.equal(refreshedHero.currentHealth,nextHealth);
    assert.equal(refreshedHero.currentFocus,nextFocus);

    // Entrar novamente precisa ler os mesmos valores persistidos da campanha.
    const rejoinedToken=await joinPlayer('spider');
    const rejoined=await api('/state',{token:rejoinedToken});
    const rejoinedHero=rejoined.data.data.heroes.find(hero=>hero.id==='spider');
    assert.equal(rejoinedHero.currentHealth,nextHealth);
    assert.equal(rejoinedHero.currentFocus,nextFocus);

    const restore=await api('/characters/hero/spider/resources',{method:'PATCH',token:player,body:{currentHealth:original.currentHealth,currentFocus:original.currentFocus}});
    assert.equal(restore.status,200,JSON.stringify(restore.data));
  } finally {
    masterSse.close();
    otherSse.close();
  }
});

test('Health e Focus usam actionHistory existente com valor anterior, novo, autor e horário',async()=>{
  const master=await joinMaster();
  const player=await joinPlayer('spider');
  const beforeState=await api('/state',{token:master});
  const hero=beforeState.data.data.heroes.find(item=>item.id==='spider');
  assert.ok(hero);
  const healthBefore=Number(hero.currentHealth);
  const focusBefore=Number(hero.currentFocus);
  const nextHealth=healthBefore>0?healthBefore-1:Math.min(Number(hero.maxHealth),healthBefore+1);
  const nextFocus=focusBefore>0?focusBefore-1:Math.min(Number(hero.maxFocus),focusBefore+1);

  const sse=await openSse(master,'history-master');
  try{
    const healthEventPromise=sse.waitFor(event=>event.event==='state'&&event.data?.key==='actionHistory'&&event.data?.value?.some?.(entry=>entry?.type==='RESOURCE'&&entry?.actorId==='spider'&&entry?.resource==='health'&&entry?.afterValue===nextHealth));
    const changedHealth=await api('/characters/hero/spider/resources',{method:'PATCH',token:player,body:{currentHealth:nextHealth}});
    assert.equal(changedHealth.status,200,JSON.stringify(changedHealth.data));
    const healthEvent=await healthEventPromise;
    const healthEntry=healthEvent.data.value.find(entry=>entry?.type==='RESOURCE'&&entry?.actorId==='spider'&&entry?.resource==='health'&&entry?.afterValue===nextHealth);
    assert.equal(healthEntry.beforeValue,healthBefore);
    assert.equal(healthEntry.afterValue,nextHealth);
    assert.equal(healthEntry.changedBy,'Jogador');
    assert.equal(healthEntry.changedByRole,'player');
    assert.equal(healthEntry.changedByHeroId,'spider');
    assert.ok(Number.isFinite(Number(healthEntry.at)));
    assert.match(healthEntry.action,/Health:/);

    const focusEventPromise=sse.waitFor(event=>event.event==='state'&&event.data?.key==='actionHistory'&&event.data?.value?.some?.(entry=>entry?.type==='RESOURCE'&&entry?.actorId==='spider'&&entry?.resource==='focus'&&entry?.afterValue===nextFocus));
    const changedFocus=await api('/characters/hero/spider/resources',{method:'PATCH',token:player,body:{currentFocus:nextFocus}});
    assert.equal(changedFocus.status,200,JSON.stringify(changedFocus.data));
    const focusEvent=await focusEventPromise;
    const focusEntry=focusEvent.data.value.find(entry=>entry?.type==='RESOURCE'&&entry?.actorId==='spider'&&entry?.resource==='focus'&&entry?.afterValue===nextFocus);
    assert.equal(focusEntry.beforeValue,focusBefore);
    assert.equal(focusEntry.afterValue,nextFocus);
    assert.equal(focusEntry.changedBy,'Jogador');
    assert.equal(focusEntry.changedByRole,'player');

    const persisted=await api('/state',{token:master});
    const persistedHealth=persisted.data.data.actionHistory.find(entry=>entry?.type==='RESOURCE'&&entry?.actorId==='spider'&&entry?.resource==='health'&&entry?.afterValue===nextHealth);
    const persistedFocus=persisted.data.data.actionHistory.find(entry=>entry?.type==='RESOURCE'&&entry?.actorId==='spider'&&entry?.resource==='focus'&&entry?.afterValue===nextFocus);
    assert.ok(persistedHealth);
    assert.ok(persistedFocus);
  } finally {
    sse.close();
    await api('/characters/hero/spider/resources',{method:'PATCH',token:master,body:{currentHealth:healthBefore,currentFocus:focusBefore}});
  }
});

test('alteração sem mudança real não cria entrada RESOURCE e vilão permanece oculto aos jogadores',async()=>{
  const master=await joinMaster();
  const player=await joinPlayer('spider');
  const before=await api('/state',{token:master});
  const hero=before.data.data.heroes.find(item=>item.id==='spider');
  const countBefore=(before.data.data.actionHistory||[]).filter(entry=>entry?.type==='RESOURCE').length;

  const noop=await api('/characters/hero/spider/resources',{method:'PATCH',token:player,body:{currentHealth:hero.currentHealth}});
  assert.equal(noop.status,200,JSON.stringify(noop.data));
  const afterNoop=await api('/state',{token:master});
  assert.equal((afterNoop.data.data.actionHistory||[]).filter(entry=>entry?.type==='RESOURCE').length,countBefore);

  const villain=afterNoop.data.data.villains.find(item=>item.id==='octopus')||afterNoop.data.data.villains[0];
  assert.ok(villain);
  const original=Number(villain.currentHealth);
  const changed=original>0?original-1:Math.min(Number(villain.maxHealth),original+1);
  const update=await api(`/characters/villain/${encodeURIComponent(villain.id)}/resources`,{method:'PATCH',token:master,body:{currentHealth:changed}});
  assert.equal(update.status,200,JSON.stringify(update.data));

  const masterState=await api('/state',{token:master});
  const secretEntry=masterState.data.data.actionHistory.find(entry=>entry?.type==='RESOURCE'&&entry?.actorId===villain.id&&entry?.resource==='health'&&entry?.afterValue===changed);
  assert.ok(secretEntry);
  assert.equal(secretEntry.changedBy,'Mestre');
  assert.equal(secretEntry.visibility,'master');

  const playerState=await api('/state',{token:player});
  assert.equal((playerState.data.data.actionHistory||[]).some(entry=>entry?.type==='RESOURCE'&&entry?.actorId===villain.id),false);
  await api(`/characters/villain/${encodeURIComponent(villain.id)}/resources`,{method:'PATCH',token:master,body:{currentHealth:original}});
});
