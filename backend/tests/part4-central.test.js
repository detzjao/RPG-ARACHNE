import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const html=fs.readFileSync(path.join(frontend,'index.html'),'utf8');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const api=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'style.css'),'utf8');

test('Central do Mestre reúne sessão, combate, personagens, cenário e dados',()=>{
  assert.match(script,/CENTRAL DO MESTRE/);
  assert.match(script,/central-session-strip/);
  assert.match(script,/central-command-card/);
  assert.match(script,/central-characters-card/);
  assert.match(script,/central-session-scenario/);
  assert.match(html,/DADOS DA SESSÃO/);
  assert.match(html,/id="master-live-dice-stage"/);
  assert.match(html,/id="master-recent-roll-list"/);
  assert.match(html,/id="master-master-roll-list"/);
});

test('controles administrativos da Central usam APIs existentes e uma extensão pontual de combat',()=>{
  assert.match(api,/updateCombatOrder/);
  assert.match(script,/data-central-combat="next"/);
  assert.match(script,/data-central-combat="end"/);
  assert.match(script,/data-central-participant-add/);
  assert.match(script,/data-central-order-initiative/);
  assert.match(script,/data-central-order-remove/);
  assert.match(script,/data-combat-resource="health"/);
  assert.match(script,/data-combat-resource="focus"/);
});

test('Parte 4 preserva realtime/animação únicos após a integração posterior do grid',()=>{
  assert.equal((`${api}\n${script}`.match(/new EventSource/g)||[]).length,1);
  assert.equal((css.match(/@keyframes cubeTumble/g)||[]).length,1);
  assert.match(script,/window\.ArachneDiceAnimation\s*=\s*Object\.freeze/);
});
