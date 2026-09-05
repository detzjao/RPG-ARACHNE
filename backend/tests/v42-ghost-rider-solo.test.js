import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTemplate, templateSeed, getCharacter } from '../src/templates.js';
import { damageMultiplierFor } from '../src/gameplay.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');

test('v42 inclui Estrada dos Condenados como campanha solo com Johnny e seis inimigos',()=>{
  const template=getTemplate('ghost-rider-damned-road');
  assert.ok(template);
  assert.equal(template.mode,'solo');
  assert.equal(template.players,1);
  assert.equal(template.heroes.length,1);
  assert.equal(template.heroes[0].id,'ghost-rider');
  assert.equal(template.villains.length,6);
  assert.equal(template.sessions.length,5);
  assert.equal(template.finalVillain,'Homem Sem Rosto');
});

test('ficha do Motoqueiro Fantasma preserva os números fornecidos',()=>{
  const hero=getCharacter('hero','ghost-rider');
  assert.equal(hero.maxHealth,270);
  assert.equal(hero.maxFocus,180);
  assert.equal(hero.karma,5);
  assert.equal(hero.initiative,'+2');
  assert.deepEqual(hero.abilities,{Melee:7,Agility:7,Resilience:9,Vigilance:6,Ego:6,Logic:3});
  assert.equal(hero.movement.run,12);
  assert.equal(hero.movement.climb,6);
  assert.equal(hero.movement.swim,6);
  assert.equal(damageMultiplierFor(hero,'Melee'),5);
  assert.equal(damageMultiplierFor(hero,'Ego'),5);
  assert.equal(damageMultiplierFor(hero,'Agility'),null);
});

test('seed solo carrega modo, PDF completo e retrato no mesmo cenário existente',()=>{
  const seed=templateSeed('ghost-rider-damned-road');
  assert.equal(seed.campaignContent.mode,'solo');
  assert.match(seed.campaignContent.campaignPdf,/motoqueiro-fantasma-estrada-condenados-completa\.pdf$/);
  assert.equal(seed.scenario.pieces.length,1);
  assert.equal(seed.scenario.pieces[0].baseId,'ghost-rider');
  assert.match(seed.scenario.pieces[0].image,/hero-ghost-rider\.webp$/);
  for(const rel of [
    'frontend/assets/portraits/hero-ghost-rider.webp',
    'frontend/assets/portraits/thumbs/hero-ghost-rider.webp',
    'frontend/assets/pdfs/hero-motoqueiro-fantasma.pdf',
    'frontend/assets/pdfs/campanha-motoqueiro-fantasma-estrada-condenados-completa.pdf'
  ]) assert.ok(fs.existsSync(path.join(root,rel)),rel);
});

test('frontend trata a campanha solo como uma única entrada e inclui o herói na Central Solo',()=>{
  const script=fs.readFileSync(path.join(root,'frontend','script.js'),'utf8');
  assert.match(script,/ENTRAR NA CAMPANHA SOLO/);
  assert.match(script,/state\.campaignContent\?\.mode==='solo'/);
  assert.match(script,/key:`hero\|\$\{entity\.id\}`/);
  assert.match(script,/kind:actor\.kind==='hero'\?'hero':'villain'/);
});
