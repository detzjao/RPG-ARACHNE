import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { damageMultiplierFor, damageFromRoll } from '../src/gameplay.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/styles/custom.css'),'utf8');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('v48.5 usa o multiplicador salvo na ficha',()=>{
  assert.equal(damageMultiplierFor({id:'daredevil',rank:2,damageMultipliers:{Melee:3}},'Melee'),3);
  assert.equal(damageMultiplierFor({id:'custom-antihero',rank:4,damageMultipliers:{Melee:6}},'Melee'),6);
});

test('v48.5 personagem customizado sem perfil usa Rank como fallback',()=>{
  assert.equal(damageMultiplierFor({id:'custom',rank:5},'Melee'),5);
});

test('v48.5 ataque fora da tabela fixa gera dano numérico',()=>{
  const actor={id:'custom-antihero',rank:4,n:'Anti-herói',abilities:{Melee:5},damageMultipliers:{Melee:6}};
  const multiplier=damageMultiplierFor(actor,'Melee');
  const damage=damageFromRoll({values:[6,2,6],snapshot:{rollType:'attack',tn:10,abilityMod:5,extra:0,damageMultiplier:multiplier,damageReduction:0}});
  assert.equal(damage.multiplier,6);
  assert.equal(damage.applied,true);
  assert.equal(damage.total,17);
});

test('v48.5 modal de ficha usa layout próprio e imagem contida',()=>{
  assert.match(app,/sheet-modal/);
  assert.match(app,/sheet-hero/);
  assert.match(app,/sheet-visual-img/);
  assert.match(css,/\.sheet-hero\{[^}]*grid-template-columns:280px minmax\(0,1fr\)!important/);
  assert.match(css,/\.sheet-visual-img\{[^}]*object-fit:contain!important;[^}]*transform:none!important/);
  assert.match(css,/\.sheet-modal\{[^}]*max-height:94vh!important/);
});

test('v48.5 invalida cache antigo de JS e CSS',()=>{
  assert.match(index,/styles\/custom\.css\?v=(?:49\.[0-9]+|50\.[0-9]+)/);
  assert.match(index,/src\/app\.js\?v=(?:49\.[0-9]+|50\.[0-9]+)/);
});
