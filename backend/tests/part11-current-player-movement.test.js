import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'style.css'),'utf8');
const api=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');
const server=fs.readFileSync(path.resolve(import.meta.dirname,'../src/server.js'),'utf8');

test('jogador vê o painel de movimento sem bloqueio por turno',()=>{
  assert.doesNotMatch(css,/body\[data-role="player"\] #scenario \.scenario-movement-panel,\s*body\[data-role="player"\] #scenario \.scenario-selection\{display:none\}/);
  assert.doesNotMatch(script,/Aguarde seu turno para movimentar seu personagem\./);
  assert.match(script,/function playerCanMoveScenario\(\)/);
  assert.match(script,/return state\.role==='player'&&!!hero&&!!playerScenarioPiece\(\)/);
});

test('backend resolve o token pelo personagem da sessão e não pelo pieceId enviado',()=>{
  assert.match(server,/String\(item\?\.characterId\|\|item\?\.baseId\|\|''\)===String\(session\.heroId\)/);
  assert.match(server,/Você só pode movimentar o próprio personagem\./);
  assert.doesNotMatch(server,/current\.baseId!==session\.heroId/);
});

test('movimentação continua usando um único grid e um único realtime',()=>{
  assert.equal((script.match(/function renderScenario\(\)/g)||[]).length,1);
  assert.equal((`${script}\n${api}`.match(/new EventSource/g)||[]).length,1);
  assert.match(api,/request\('\/scenario\/move',\{method:'PATCH'/);
});

test('mudança de turno renova somente o orçamento do participante que começa a agir',()=>{
  assert.match(server,/function resetScenarioMovementForCombatant\(/);
  assert.match(server,/resetScenarioMovementForCombatant\(all\.scenario,order\[0\]\)/);
  assert.match(server,/resetScenarioMovementForCombatant\(all\.scenario,combat\.order\[turnIndex\]\)/);
});
