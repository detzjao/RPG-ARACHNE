import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');

test('v38 reduz a Central do jogador a identidade + Central de Ações',()=>{
  const start=script.indexOf('function renderSessionCentral()');
  const end=script.indexOf('function renderCombatConsole()',start);
  const block=script.slice(start,end);
  assert.match(block,/support-hero-identity/);
  assert.match(block,/support-actions-card/);
  assert.doesNotMatch(block,/player-scenario-card/);
  assert.doesNotMatch(block,/player-combat-card/);
  assert.doesNotMatch(block,/player-history/);
  assert.doesNotMatch(block,/action-waiting/);
});

test('v38 central do mestre tem somente iniciativa e rolagens de personagens',()=>{
  const start=script.indexOf('function renderSessionCentral()');
  const end=script.indexOf('function renderCombatConsole()',start);
  const block=script.slice(start,end);
  assert.match(block,/support-initiative-card/);
  assert.match(block,/centralMasterAttackMarkup\(\)/);
  assert.doesNotMatch(block,/PASSAR TURNO/);
  assert.doesNotMatch(block,/ENCERRAR/);
  assert.doesNotMatch(block,/INICIAR COMBATE/);
});

test('layout de apoio possui pontos de quebra para desktop, tablet e celular',()=>{
  assert.match(css,/\.support-master-grid/);
  assert.match(css,/@media \(max-width:900px\)/);
  assert.match(css,/@media \(max-width:620px\)/);
  assert.match(css,/@media \(max-width:390px\)/);
});
