import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');

test('v39 mostra os capangas genéricos sempre na Central do Mestre',()=>{
  const start=script.indexOf('function masterAttackActors()');
  const end=script.indexOf('function masterAttackFromKey',start);
  const block=script.slice(start,end);
  assert.match(block,/Object\.values\(MINION_TEMPLATES\)/);
  assert.match(block,/key:`minion\|\$\{npc\.id\}`/);
});

test('v39 central do Mestre contém histórico completo das rolagens',()=>{
  assert.match(script,/function centralMasterRollHistoryMarkup\(\)/);
  assert.match(script,/Array\.isArray\(state\.diceHistory\)/);
  assert.match(script,/Todas as rolagens/);
  assert.doesNotMatch(script,/state\.diceHistory\.slice\(0,8\)/);
});

test('TN pode ser alterado por Mestre ou jogador em endpoint dedicado',()=>{
  const start=server.indexOf("if(url.pathname==='/api/challenge/tn'");
  assert.ok(start>=0);
  const end=server.indexOf("if(url.pathname==='/api/roll/live'",start);
  const block=server.slice(start,end);
  assert.doesNotMatch(block,/requireMaster/);
  assert.match(block,/broadcastState\(campaignId,'challenge'/);
});
