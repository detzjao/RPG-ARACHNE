import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyRoster, blankSeed, getCharacter, getCharacterLibrary, LIBRARY_REVISION } from '../src/templates.js';
import { damageMultiplierFor } from '../src/gameplay.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('v48.4 importa as fichas oficiais de Juggernaut, Elektra e Kingpin',()=>{
  const jug=getCharacter('villain','juggernaut');
  assert.equal(jug.rank,4); assert.equal(jug.maxHealth,210); assert.equal(jug.maxFocus,120); assert.equal(jug.healthDR,'-4'); assert.equal(jug.initiative,'+3');
  assert.deepEqual(jug.abilities,{Melee:7,Agility:2,Resilience:7,Vigilance:3,Ego:1,Logic:1});
  assert.deepEqual(jug.damageMultipliers,{Melee:8,Agility:4,Ego:4,Logic:4});
  assert.deepEqual(jug.defenses,{Melee:16,Agility:11,Resilience:17,Vigilance:13,Ego:11,Logic:11});

  const elektra=getCharacter('villain','elektra');
  assert.equal(elektra.rank,2); assert.equal(elektra.maxHealth,60); assert.equal(elektra.maxFocus,30); assert.equal(elektra.initiative,'+1');
  assert.deepEqual(elektra.abilities,{Melee:3,Agility:2,Resilience:2,Vigilance:1,Ego:1,Logic:2});
  assert.deepEqual(elektra.damageMultipliers,{Melee:2,Agility:2,Ego:2,Logic:2});

  const fisk=getCharacter('villain','kingpin');
  assert.equal(fisk.rank,3); assert.equal(fisk.maxHealth,90); assert.equal(fisk.maxFocus,60); assert.equal(fisk.initiative,'+2');
  assert.deepEqual(fisk.abilities,{Melee:4,Agility:1,Resilience:3,Vigilance:2,Ego:2,Logic:3});
  assert.deepEqual(fisk.damageMultipliers,{Melee:3,Agility:3,Ego:3,Logic:3});
  assert.deepEqual(fisk.defenses,{Melee:14,Agility:14,Resilience:13,Vigilance:12,Ego:12,Logic:13});
});

test('v48.4 adiciona Venom, Ninja da Mão e Agente da SHIELD com dano correto',()=>{
  const venom=getCharacter('hero','venom');
  assert.equal(venom.rank,4); assert.equal(venom.maxHealth,90); assert.equal(venom.maxFocus,60); assert.equal(venom.alignment,'antihero');
  assert.deepEqual(venom.damageMultipliers,{Melee:6,Agility:4,Ego:4,Logic:4});
  assert.equal(damageMultiplierFor(venom,'Melee'),6);

  const ninja=getCharacter('villain','hand-ninja');
  assert.equal(ninja.rank,1); assert.equal(ninja.tier,'LACAIO'); assert.equal(ninja.maxHealth,30); assert.equal(ninja.maxFocus,30);
  assert.deepEqual(ninja.damageMultipliers,{Melee:1,Agility:1,Ego:1,Logic:1});

  const agent=getCharacter('hero','shield-agent');
  assert.equal(agent.rank,1); assert.equal(agent.tier,'LACAIO'); assert.equal(agent.maxHealth,30); assert.equal(agent.karma,1);
  assert.deepEqual(agent.damageMultipliers,{Melee:1,Agility:2,Ego:1,Logic:1});
});

test('v48.4 permite qualquer personagem nos dois lados do roster',()=>{
  const elektraHero=getCharacter('hero','elektra');
  assert.equal(elektraHero.id,'elektra'); assert.equal(elektraHero.rosterKind,'hero'); assert.equal(elektraHero.libraryKind,'hero'); assert.equal(elektraHero.tier,'ANTI-HERÓI');
  const deadpoolVillain=getCharacter('villain','deadpool');
  assert.equal(deadpoolVillain.id,'deadpool'); assert.equal(deadpoolVillain.rosterKind,'villain'); assert.equal(deadpoolVillain.libraryKind,'hero'); assert.equal(deadpoolVillain.tier,'ANTI-HERÓI');
  const jugHero=getCharacter('hero','juggernaut');
  assert.equal(jugHero.tier,'WILDCARD');

  const seed=applyRoster(blankSeed('Cross roster'),{heroIds:['elektra','juggernaut'],villainIds:['deadpool','venom','spider']});
  assert.deepEqual(seed.heroes.map(x=>x.id),['elektra','juggernaut']);
  assert.deepEqual(seed.villains.map(x=>x.id),['deadpool','venom','spider']);
  assert.equal(seed.villains.find(x=>x.id==='venom').tier,'ANTI-HERÓI');
});

test('v48.4 impede o mesmo id nos dois lados ao criar a campanha',()=>{
  const seed=applyRoster(blankSeed('Sem duplicados'),{heroIds:['venom'],villainIds:['venom','elektra']});
  assert.deepEqual(seed.heroes.map(x=>x.id),['venom']);
  assert.deepEqual(seed.villains.map(x=>x.id),['elektra']);
});

test('v48.4 biblioteca, interface e assets refletem cross-roster e PDFs oficiais',()=>{
  assert.ok(LIBRARY_REVISION>=5);
  const library=getCharacterLibrary('all');
  assert.ok(library.heroes.some(x=>x.id==='venom'));
  assert.ok(library.heroes.some(x=>x.id==='shield-agent'));
  assert.ok(library.villains.some(x=>x.id==='hand-ninja'));
  assert.match(app,/qualquer personagem pode entrar como herói ou vilão/);
  assert.match(app,/libraryKind/);
  assert.match(app,/Defesas oficiais da ficha/);
  assert.match(index,/src\/app\.js\?v=49\.[0-9]+/);
  for(const file of ['hero-venom.pdf','hero-shield-agent.pdf','villain-hand-ninja.pdf','villain-juggernaut.pdf','villain-elektra.pdf','villain-kingpin.pdf']){
    assert.ok(fs.statSync(path.join(root,'frontend/assets/pdfs',file)).size>250_000,file);
  }
});
