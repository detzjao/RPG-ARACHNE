import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const frontend = resolve(here, '../../frontend');
const script = readFileSync(resolve(frontend, 'script.js'), 'utf8');
const css = readFileSync(resolve(frontend, 'style.css'), 'utf8');
const html = readFileSync(resolve(frontend, 'index.html'), 'utf8');

test('cards usam thumbnails WebP e preservam retratos completos fora de superfícies pequenas', () => {
  assert.match(script, /replace\(\/\\\.\(\?:png\|jpe\?g\|webp\)\$\/i,'\.webp'\)/);
  assert.match(script, /portraitDisplaySrc\(characterArt\(id, custom\), \{small:true\}\)/);
  assert.match(script, /portraitDisplaySrc\(src,\{small:true\}\)/);
});

test('renderização principal e realtime atualizam somente a página visível', () => {
  assert.match(script, /if\(state\.page==='home'\)\{/);
  assert.match(script, /if\(state\.page==='heroes'\) safeRender\('Heróis', renderHeroes\)/);
  assert.match(script, /if\(state\.page==='combat'\) renderCombatConsole\(\)/);
  assert.match(script, /if\(state\.page==='scenario'\) renderScenario\(\)/);
});

test('Central do Mestre usa seleção visual de ator e ações sem alvo no modo de apoio', () => {
  assert.match(script, /support-master-grid/);
  assert.match(script, /data-master-attack-actor-card/);
  assert.match(script, /data-master-roll-ability/);
  const start=script.indexOf('function centralMasterAttackMarkup()');
  const end=script.indexOf('function finalizeMasterCentralAttack',start);
  const block=script.slice(start,end);
  assert.doesNotMatch(block, /data-master-attack-target-card/);
  assert.doesNotMatch(block, /CLIQUE NO ALVO/);
  assert.doesNotMatch(script, /id="central-attack-defense"/);
  assert.doesNotMatch(script, /id="central-attack-resource"/);
});

test('camada v35 cobre desktop, tablet, celular e viewport seguro', () => {
  assert.match(css, /v35 · Performance \+ UX responsiva/);
  assert.match(css, /content-visibility:auto/);
  assert.match(css, /@media\(max-width:1180px\)/);
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /@media\(max-width:380px\)/);
  assert.match(html, /viewport-fit=cover/);
});
