import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'../..');
const html=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const api=fs.readFileSync(path.join(root,'frontend/api-client.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const gameplay=fs.readFileSync(path.join(root,'backend/src/gameplay.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');

test('Central de combate oferece iniciativa D616 sem pedir modificador manual',()=>{
  assert.match(script,/data-central-init-roll=/);
  assert.match(script,/data-central-roll-all/);
  assert.match(script,/central-initiative-dice-stage/);
  assert.doesNotMatch(script,/O servidor gera a D616 e usa o modificador da ficha/);
  assert.doesNotMatch(script,/data-central-init-result=/);
  assert.match(script,/initiative-add-only/);
});

test('iniciativa reutiliza exatamente ArachneDiceAnimation e o mesmo gerador D616 do backend',()=>{
  assert.match(script,/ArachneDiceAnimation\?\.animateD616\(initial,stage\)/);
  assert.match(server,/startD616\(\{actor,ability:'Initiative'/);
  assert.equal((css.match(/@keyframes\s+cubeTumble\b/g)||[]).length,1);
  assert.equal((script.match(/window\.ArachneDiceAnimation\s*=\s*Object\.freeze/g)||[]).length,1);
  assert.match(gameplay,/function startD616/);
});

test('frontend usa APIs dedicadas para adicionar, remover e rolar iniciativa',()=>{
  assert.match(api,/\/initiative\/participants/);
  assert.match(api,/\/initiative\/roll/);
  assert.match(script,/initiativeHasParticipant\(entity\.id\)/);
  assert.match(script,/Já está na iniciativa\./);
});

test('rolar iniciativas em lote filtra apenas participantes ainda sem resultado',()=>{
  assert.match(script,/const pending=\(state\.initiativeParticipants\|\|\[\]\)\.filter\(item=>item\?\.result===null\|\|item\?\.result===''/);
  assert.match(script,/for\(const id of pending\)/);
  assert.doesNotMatch(script,/const face=rand\(6\).*initiative/s);
});

test('Central React do Mestre mantém iniciativa e histórico usando D616',()=>{
  const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
  assert.match(app,/function InitiativePanel/);
  assert.match(app,/D616 DE INICIATIVA/);
  assert.match(app,/ROLAR PENDENTES/);
  assert.match(app,/function RollHistory/);
  assert.match(app,/isMaster\?h\(RollHistory/);
});
