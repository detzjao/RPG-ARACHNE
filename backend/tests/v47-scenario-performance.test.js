import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const app=fs.readFileSync(path.join(frontend,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'styles/custom.css'),'utf8');

test('v47 remove os números de custo das casas alcançáveis',()=>{
  assert.doesNotMatch(app,/className:'move-cost'/);
  assert.doesNotMatch(app,/O número indica o custo/);
  assert.match(app,/As casas verdes são os destinos disponíveis/);
});

test('v47 usa índices O(1) para peças do grid e fila sem Array.shift',()=>{
  assert.match(app,/const pieceByCell=React\.useMemo/);
  assert.match(app,/pieceByCell\.get\(key\)/);
  assert.match(app,/let head=0/);
  assert.match(app,/queue\[head\+\+\]/);
  assert.doesNotMatch(app,/q\.shift\(\)/);
});

test('v47 aplica movimento otimista e trava cliques concorrentes',()=>{
  assert.match(app,/scenarioMoveBusy/);
  assert.match(app,/Movimento otimista/);
  assert.match(app,/scenarioMoveBusy:true/);
  assert.match(app,/scenarioMoveBusy:false/);
});

test('v47 edita cenário com persistência agrupada e carrega o mapa de forma diferida',()=>{
  assert.match(app,/function DeferredBoard/);
  assert.match(app,/requestAnimationFrame/);
  assert.match(app,/queueScenarioSave/);
  assert.match(app,/setTimeout\(async\(\)=>\{/);
  assert.match(css,/content-visibility:auto/);
});
