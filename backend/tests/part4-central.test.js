import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const html=fs.readFileSync(path.join(frontend,'index.html'),'utf8');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const api=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'style.css'),'utf8');

test('Central do Mestre mantém somente iniciativa e rolagens na tela inicial',()=>{
  assert.match(script,/CENTRAL DO MESTRE/);
  assert.match(script,/support-central-head/);
  assert.match(script,/support-master-grid/);
  assert.match(script,/support-initiative-card/);
  assert.match(script,/central-master-attack/);
  const renderStart=script.indexOf('function renderSessionCentral()');
  const renderEnd=script.indexOf('function renderCombatConsole()',renderStart);
  const renderBlock=script.slice(renderStart,renderEnd);
  assert.doesNotMatch(renderBlock,/PASSAR TURNO/);
  assert.doesNotMatch(renderBlock,/INICIAR COMBATE/);
  assert.doesNotMatch(renderBlock,/player-scenario-card/);
});

test('Central do Mestre preserva somente os controles necessários para iniciativa',()=>{
  assert.match(script,/data-central-participant-add/);
  assert.match(script,/data-central-init-roll/);
  assert.match(script,/data-central-roll-all/);
  assert.match(script,/data-central-init-remove-id/);
  assert.match(api,/addInitiativeParticipant/);
  assert.match(api,/rollInitiativeParticipant/);
});

test('Parte 4 preserva realtime/animação únicos após a integração posterior do grid',()=>{
  assert.equal((`${api}\n${script}`.match(/new EventSource/g)||[]).length,1);
  assert.equal((css.match(/@keyframes cubeTumble/g)||[]).length,1);
  assert.match(script,/window\.ArachneDiceAnimation\s*=\s*Object\.freeze/);
});
