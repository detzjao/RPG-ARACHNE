import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { moveScenarioPiece, reachableScenarioCells } from '../src/scenario-movement.js';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const api=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');

function scenario(){return{width:10,height:8,baseTerrain:'floor',obstacles:{},terrain:{},turnMovement:{},pieces:[{id:'hero-a',kind:'hero',baseId:'a',name:'A',x:1,y:1,movement:{run:5,swim:3,jump:3}},{id:'enemy-b',kind:'enemy',baseId:'b',name:'B',x:3,y:1,movement:{run:5}}]};}

test('backend reutiliza as regras existentes de alcance, ocupação e orçamento',()=>{
  const s=scenario(),piece=s.pieces[0],reachable=reachableScenarioCells(s,piece,'run',5);
  assert.equal(reachable.has('2,1'),true);assert.equal(reachable.has('3,1'),false);
  const moved=moveScenarioPiece({scenario:s,pieceId:'hero-a',toX:2,toY:1,mode:'run',expectedX:1,expectedY:1});
  assert.equal(moved.cost,1);assert.equal(moved.remaining,4);assert.equal(moved.scenario.turnMovement['hero-a'].spent,1);
});

test('frontend libera apenas o próprio token sem exigir turno e usa a API dedicada',()=>{
  assert.match(script,/function playerCanMoveScenario\(\)/);
  assert.doesNotMatch(script,/Aguarde seu turno para movimentar seu personagem\./);
  assert.match(script,/piece\.id!==own\.id/);
  assert.match(script,/ArachneAPI\.moveScenarioPiece/);
  assert.match(api,/request\('\/scenario\/move',\{method:'PATCH'/);
});

test('Parte 5 mantém o realtime único e não cria outro grid',()=>{
  assert.equal((`${api}\n${script}`.match(/new EventSource/g)||[]).length,1);
  assert.equal((script.match(/function renderScenario\(\)/g)||[]).length,1);
  assert.equal((script.match(/function reachableCells\(/g)||[]).length,1);
});
