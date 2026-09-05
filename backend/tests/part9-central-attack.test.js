import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');

test('Central do jogador funciona como apoio: combate rola D616 e calcula dano sem alvo',()=>{
  assert.match(script,/function playerCombatActionMarkup\(hero\)[\s\S]*data-central-roll-ability/);
  assert.match(script,/const isCombat=centralActionCategory==='combat'/);
  assert.match(script,/startActionRoll\(\{ability,action,tn:clamp\(state\.challenge\?\.tn\?\?14,1,99\),attack:isCombat\}\)/);
  assert.doesNotMatch(script,/function playerCombatActionMarkup\(hero\)[\s\S]{0,1800}data-player-attack-target/);
  assert.match(script,/O que você quer rolar\?/);
});

test('Central do Mestre usa a mesma lógica de rolagem com iniciativa e histórico',()=>{
  assert.match(script,/Iniciativa, rolagens e controle rápido dos personagens/);
  assert.match(script,/Ordem inicial/);
  assert.match(script,/QUEM ESTÁ AGINDO\?/);
  assert.match(script,/function masterCombatActionMarkup\(actor\)[\s\S]*data-master-roll-ability/);
  assert.match(script,/rollType:isCombat\?'attack':'test'/);
  assert.match(script,/centralMasterRollHistoryMarkup\(\)/);
  assert.match(script,/data-central-tn-input/);
  assert.doesNotMatch(script,/function centralMasterAttackMarkup\(\)[\s\S]{0,3500}CLIQUE NO ALVO/);
});

test('rolagens de apoio não são bloqueadas pela ordem de turnos do combate',()=>{
  const start=server.indexOf("if(url.pathname==='/api/actions/d616/start'");
  const end=server.indexOf("const edgeMatch=",start);
  const block=server.slice(start,end);
  assert.doesNotMatch(block,/AGUARDANDO\. Agora é a vez/);
  assert.doesNotMatch(block,/combatant\.baseId!==session\.heroId/);
});

test('resultado mostra total, TN e dano informativo sem alvo nem alteração automática de recurso',()=>{
  const start=script.indexOf('function centralDamageResultMarkup');
  const end=script.indexOf('function settleReusableD616',start);
  const block=script.slice(start,end);
  assert.match(block,/· TN /);
  assert.match(block,/support-damage-result/);
  assert.match(block,/DANO/);
  assert.doesNotMatch(block,/· DEF /);
  assert.doesNotMatch(block,/damageApplied/);
});

test('animação D616 continua sendo a implementação única existente',()=>{
  assert.match(script,/ArachneDiceAnimation\?\.animateD616/);
  assert.equal((css.match(/@keyframes\s+cubeTumble\b/g)||[]).length,1);
  assert.equal((script.match(/window\.ArachneDiceAnimation\s*=\s*Object\.freeze/g)||[]).length,1);
});
