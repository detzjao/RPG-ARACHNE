import test from 'node:test';
import assert from 'node:assert/strict';
import { dieScore, isFantastic, isUltimate, rollMath, evaluateRoll, publicRoll } from '../src/gameplay.js';

function makeRoll(values,{abilityMod=0,extra=0,tn=14}={}){
  return {id:'test',values,snapshot:{actorId:'spider',actorName:'Spider-Man',ability:'Agility',abilityMod,extra,tn,action:'Teste'},edgeRemaining:0,logs:[],finalized:true};
}

test('Marvel Die M conta como 6 no total',()=>{
  assert.equal(dieScore(1,1),6);
  assert.equal(rollMath(makeRoll([3,1,4],{abilityMod:2})).total,15);
});

test('Fantastic é detectado pelo M e mantém sucesso/falha pelo TN',()=>{
  const success=makeRoll([3,1,4],{abilityMod:2,tn:15});
  const failure=makeRoll([2,1,2],{abilityMod:0,tn:20});
  assert.equal(isFantastic(success.values),true);
  assert.deepEqual(evaluateRoll(success),{key:'fantastic-success',label:'FANTASTIC SUCCESS',success:true,fantastic:true});
  assert.deepEqual(evaluateRoll(failure),{key:'fantastic-failure',label:'FANTASTIC FAILURE',success:false,fantastic:true});
});

test('6-M-6 é reconhecido como Ultimate',()=>{
  assert.equal(isUltimate([6,1,6]),true);
  assert.equal(isUltimate([6,2,6]),false);
});

test('publicRoll não expõe estado interno mutável',()=>{
  const roll=makeRoll([4,5,6],{abilityMod:3,extra:-1,tn:16});
  const view=publicRoll(roll);
  assert.equal(view.math.total,17);
  assert.equal(view.outcome.success,true);
  view.values[0]=1;
  assert.equal(roll.values[0],4);
});
