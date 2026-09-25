import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../../frontend/src/app.js', import.meta.url),'utf8');
const legacy=fs.readFileSync(new URL('../../frontend/script.js', import.meta.url),'utf8');

test('v49.7: ficha React não renderiza hook narrativo do personagem',()=>{
  assert.ok(!app.includes('entity.hook||entity.role'));
  assert.ok(!app.includes('entity.hook || entity.role'));
  assert.match(app,/Dados mecânicos, poderes e perfil do personagem/);
});

test('v49.7: frontend legado não exibe gancho ou campo Gancho',()=>{
  assert.ok(!legacy.includes('escapeHTML(hero.hook'));
  assert.ok(!legacy.includes('escapeHTML(villain.hook'));
  assert.ok(!legacy.includes('id=\"h-e-hook\"'));
  assert.ok(!legacy.includes('id=\"v-e-hook\"'));
});
