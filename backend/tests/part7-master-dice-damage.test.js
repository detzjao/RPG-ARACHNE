import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { damageFromRoll, damageMultiplierFor, historyFromRoll, publicRoll } from '../src/gameplay.js';

const projectRoot=path.resolve(import.meta.dirname,'../..');
const html=fs.readFileSync(path.join(projectRoot,'frontend/index.html'),'utf8');
const script=fs.readFileSync(path.join(projectRoot,'frontend/script.js'),'utf8');
const css=fs.readFileSync(path.join(projectRoot,'frontend/style.css'),'utf8');

function attackRoll(values,{ability='Melee',abilityMod=5,tn=14,multiplier=5,reduction=0}={}){
  return{id:'attack-test',values:[...values],initialValues:[...values],snapshot:{actorId:'spider',actorName:'Homem-Aranha',ability,abilityMod,extra:0,tn,action:'Ataque corpo a corpo',source:'hero',rollType:'attack',damageMultiplier:multiplier,damageReduction:reduction},edgeRemaining:0,logs:[],finalized:true};
}

test('aba Dados do Mestre não possui mais uma segunda rolagem de dano',()=>{
  assert.doesNotMatch(html,/data-master-dice-tab="damage"/);
  assert.doesNotMatch(html,/id="master-dice-damage"/);
  assert.doesNotMatch(html,/id="damage-cube"/);
  assert.doesNotMatch(html,/id="roll-damage"/);
  assert.doesNotMatch(html,/ROLAR DANO/);
  assert.doesNotMatch(script,/function\s+rollDamage\s*\(/);
  assert.doesNotMatch(script,/type:'DMG'/);
  assert.doesNotMatch(css,/#roll-damage/);
});

test('ataque usa o Marvel Die da própria D616 para calcular dano',()=>{
  const roll=attackRoll([3,4,5]);
  const view=publicRoll(roll);
  assert.equal(view.math.total,17);
  assert.equal(view.outcome.success,true);
  assert.equal(view.damage.rawMarvelDie,4);
  assert.equal(view.damage.marvelDie,4);
  assert.equal(view.damage.multiplier,5);
  assert.equal(view.damage.abilityMod,5);
  assert.equal(view.damage.total,25);
});

test('Marvel M vale 6 também no dano e Fantastic preserva o x2 já existente',()=>{
  const roll=attackRoll([3,1,5],{tn:14});
  const damage=damageFromRoll(roll);
  assert.equal(damage.rawMarvelDie,1);
  assert.equal(damage.marvelDie,6);
  assert.equal(damage.fantasticMultiplier,2);
  assert.equal(damage.total,(6*5+5)*2);
});

test('ataque que falha não gera dano separado',()=>{
  const roll=attackRoll([2,2,2],{tn:99});
  const damage=damageFromRoll(roll);
  assert.equal(damage.success,false);
  assert.equal(damage.applied,false);
  assert.equal(damage.total,null);
  const entry=historyFromRoll(roll);
  assert.equal(entry.type,'D616');
  assert.equal(entry.damage.total,null);
  assert.equal(entry.marvelDie,2);
});

test('histórico vincula dano, Marvel Die e resultado à mesma rollId',()=>{
  const roll=attackRoll([3,4,5]);
  const entry=historyFromRoll(roll);
  assert.equal(entry.rollId,'attack-test');
  assert.equal(entry.type,'D616');
  assert.deepEqual(entry.dice.values,[3,4,5]);
  assert.equal(entry.marvelDie,4);
  assert.equal(entry.damage.total,25);
  assert.match(entry.detail,/Dano 25/);
});

test('perfil existente do Homem-Aranha continua fornecendo multiplicador sem segunda implementação no frontend',()=>{
  assert.equal(damageMultiplierFor({id:'spider'},'Melee'),5);
  assert.equal(damageMultiplierFor({id:'spider'},'Agility'),4);
  assert.doesNotMatch(script,/const\s+DAMAGE_PROFILES/);
});

test('D616 e iniciativa permanecem presentes na Central React com uma única animação',()=>{
  const app=fs.readFileSync(path.join(projectRoot,'frontend/src/app.js'),'utf8');
  const custom=fs.readFileSync(path.join(projectRoot,'frontend/styles/custom.css'),'utf8');
  assert.match(app,/function DiceStage/);
  assert.match(app,/function InitiativePanel/);
  assert.match(app,/central-dice-stage/);
  assert.match(app,/initiative-dice-stage/);
  assert.match(app,/animateDiceStage/);
  assert.equal((custom.match(/@keyframes\s+cubeTumble\b/g)||[]).length,1);
});
