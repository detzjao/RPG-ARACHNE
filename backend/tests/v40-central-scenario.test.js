import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'style.css'),'utf8');
const api=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');
const server=fs.readFileSync(path.resolve(import.meta.dirname,'../src/server.js'),'utf8');
const templates=fs.readFileSync(path.resolve(import.meta.dirname,'../src/templates.js'),'utf8');

test('v40 integra o mesmo cenário na Central do jogador e do Mestre',()=>{
  assert.match(script,/function centralScenarioMarkup\(\)/);
  assert.match(script,/\$\{centralScenarioMarkup\(\)\}/);
  assert.match(script,/id="central-scenario-board"/);
  assert.match(script,/function renderCentralScenario\(\)/);
  assert.match(css,/\.support-scenario-board-scroll/);
});

test('jogador move apenas a própria peça e Mestre pode selecionar qualquer peça',()=>{
  assert.match(script,/if\(piece\.id!==own\.id\)\{toast\('Você só pode movimentar o próprio personagem\.'/);
  assert.match(script,/const tool=central\?'select'/);
  assert.match(server,/if\(session\.role==='player'\)/);
  assert.match(server,/Você só pode movimentar o próprio personagem\./);
  assert.match(server,/else\{\s*if\(!pieceId\)throw Object\.assign\(new Error\('Selecione uma peça para movimentar\.'/);
  assert.doesNotMatch(server,/Aguarde seu turno para movimentar seu personagem/);
});

test('capangas simples possuem Health real de 30 ou 40 e controles de recurso',()=>{
  assert.match(script,/'minion-melee': \{[^\n]*maxHealth:40,currentHealth:40/);
  assert.match(script,/'minion-ranged': \{[^\n]*maxHealth:30,currentHealth:30/);
  assert.match(script,/'minion-support': \{[^\n]*maxHealth:30,currentHealth:30/);
  assert.match(script,/data-minion-resource=/);
  assert.match(templates,/'hydra-agent':[^\n]*maxHealth:30/);
  assert.match(templates,/'aim-agent':[^\n]*maxHealth:30/);
});

test('movimento da Central reutiliza endpoint e realtime existentes',()=>{
  assert.match(api,/resetScenarioMovement/);
  assert.match(api,/request\('\/scenario\/move',\{method:'PATCH'/);
  assert.match(api,/request\('\/scenario\/movement\/reset',\{method:'PATCH'/);
  assert.equal((`${script}\n${api}`.match(/new EventSource/g)||[]).length,1);
  assert.equal((script.match(/function reachableCells\(/g)||[]).length,1);
});
