import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');
const html=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('Central do Jogador oferece Health/Focus e acesso direto à ficha no modo de apoio',()=>{
  const start=script.indexOf('function renderSessionCentral()');
  const end=script.indexOf('function renderCombatConsole()',start);
  const block=script.slice(start,end);
  assert.match(block,/supportResourceControlMarkup\(\{kind:'hero',entity:hero,player:true\}\)/);
  assert.match(block,/VER FICHA/);
  assert.match(block,/data-action="view-hero"/);
  assert.match(block,/support-actions-card/);
});

test('endpoint dedicado de recursos continua preservado fora da Central',()=>{
  const start=script.indexOf('async function adjustPlayerResource');
  assert.ok(start>=0);
  const body=script.slice(start,start+2400);
  assert.match(body,/state\.role !== 'player'/);
  assert.match(body,/const hero = selectedHero\(\)/);
  assert.match(body,/ArachneAPI\.adjustResources\('hero', hero\.id, values\)/);
  assert.match(body,/healthDelta: step/);
  assert.match(body,/focusDelta: step/);
});

test('modo de apoio React continua responsivo e usa Tailwind compilado',()=>{
  const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
  const custom=fs.readFileSync(path.join(root,'frontend/styles/custom.css'),'utf8');
  assert.match(html,/styles\/tailwind\.css/);
  assert.match(html,/vendor\/react\.production\.min\.js/);
  assert.match(html,/src\/app\.js/);
  assert.match(app,/sm:grid-cols-2/);
  assert.match(app,/lg:grid-cols-4/);
  assert.match(custom,/@media\(max-width:640px\)/);
});


test('v39 possui TN editável e inputs exatos de recursos',()=>{
  assert.match(script,/data-central-tn-input/);
  assert.match(script,/data-player-resource-input/);
  assert.match(script,/data-master-resource-input/);
  assert.match(script,/setChallengeTN/);
});
