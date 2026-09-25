import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCharacter } from '../src/templates.js';
import { damageMultiplierFor } from '../src/gameplay.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const api=fs.readFileSync(path.join(root,'frontend/src/api.js'),'utf8');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('v48.3 corrige a ficha do Deadpool conforme o PDF de referência',()=>{
  const hero=getCharacter('hero','deadpool');
  assert.equal(hero.rank,4);
  assert.equal(hero.maxHealth,120);
  assert.equal(hero.maxFocus,90);
  assert.equal(hero.karma,'—');
  assert.equal(hero.focusDR,'-2');
  assert.equal(hero.initiative,'+3');
  assert.deepEqual(hero.abilities,{Melee:5,Agility:4,Resilience:4,Vigilance:3,Ego:3,Logic:1});
  assert.deepEqual(hero.damageMultipliers,{Melee:5,Agility:5,Ego:4,Logic:4});
});

test('v48.3 corrige a ficha do Demolidor conforme o PDF de referência',()=>{
  const hero=getCharacter('hero','daredevil');
  assert.equal(hero.rank,2);
  assert.equal(hero.maxHealth,60);
  assert.equal(hero.maxFocus,30);
  assert.equal(hero.karma,2);
  assert.equal(hero.initiative,'+1');
  assert.equal(hero.movement.swingline,15);
  assert.deepEqual(hero.abilities,{Melee:2,Agility:3,Resilience:2,Vigilance:1,Ego:1,Logic:2});
  assert.deepEqual(hero.damageMultipliers,{Melee:3,Agility:3,Ego:2,Logic:2});
});

test('v48.3 todo personagem com Rank tem multiplicador base e não perde o cálculo de dano',()=>{
  assert.equal(damageMultiplierFor({id:'custom-one',rank:4,abilities:{Melee:3}},'Melee'),4);
  assert.equal(damageMultiplierFor(getCharacter('villain','juggernaut'),'Melee'),8);
  assert.equal(damageMultiplierFor({id:'custom-two',rank:2,damageMultipliers:{Agility:3}},'Agility'),3);
});

test('v48.3 ficha visual mostra dano e editor permite configurar multiplicadores',()=>{
  assert.match(app,/DANO POR HABILIDADE/);
  assert.match(app,/MULTIPLICADORES DE DANO/);
  assert.match(app,/damageMultipliers/);
  assert.match(app,/DANO ×/);
  assert.match(api,/applyAttackDamage/);
  assert.match(index,/src\/app\.js\?v=48\.5/);
});

test('PDFs oficiais enviados substituem as fichas antigas de Deadpool e Demolidor',()=>{
  for(const file of ['hero-deadpool.pdf','hero-daredevil.pdf']){
    const stat=fs.statSync(path.join(root,'frontend/assets/pdfs',file));
    assert.ok(stat.size>250_000,`${file} deve ser o PDF original de uma página`);
  }
});
