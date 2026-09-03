import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');
const html=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('Central do Jogador expõe somente os quatro controles simples de Current Health/Focus',()=>{
  assert.match(script,/data-player-resource="health" data-delta="-1"/);
  assert.match(script,/data-player-resource="health" data-delta="1"/);
  assert.match(script,/data-player-resource="focus" data-delta="-1"/);
  assert.match(script,/data-player-resource="focus" data-delta="1"/);
  assert.match(script,/heroCurrentHealth\(hero\)\} \/ \$\{heroMaxHealth\(hero\)/);
  assert.match(script,/heroCurrentFocus\(hero\)\} \/ \$\{heroMaxFocus\(hero\)/);
  assert.doesNotMatch(script,/data-player-resource="maxHealth"/);
  assert.doesNotMatch(script,/data-player-resource="maxFocus"/);
});

test('controles do jogador usam selectedHero e o endpoint existente de recursos',()=>{
  const start=script.indexOf('async function adjustPlayerResource');
  assert.ok(start>=0);
  const body=script.slice(start,start+2400);
  assert.match(body,/state\.role !== 'player'/);
  assert.match(body,/const hero = selectedHero\(\)/);
  assert.match(body,/ArachneAPI\.adjustResources\('hero', hero\.id, values\)/);
  assert.match(body,/healthDelta: step/);
  assert.match(body,/focusDelta: step/);
  assert.doesNotMatch(body,/saveHero\(/);
});

test('limites são refletidos também no estado dos botões da UI',()=>{
  assert.match(script,/heroCurrentHealth\(hero\)<=0\?'disabled'/);
  assert.match(script,/heroCurrentHealth\(hero\)>=heroMaxHealth\(hero\)\?'disabled'/);
  assert.match(script,/heroCurrentFocus\(hero\)<=0\?'disabled'/);
  assert.match(script,/heroCurrentFocus\(hero\)>=heroMaxFocus\(hero\)\?'disabled'/);
});

test('visual dos steppers permanece escopado à Central do Jogador',()=>{
  assert.match(css,/\.player-resource-stepper\{/);
  assert.match(css,/\.player-resource-stepper button:disabled/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html,/style\.css\?v=33\.4\.[0-9]+-[^\"']+/);
  assert.match(html,/script\.js\?v=33\.4\.[0-9]+-[^"']+/);
});
