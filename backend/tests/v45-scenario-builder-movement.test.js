import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const app=fs.readFileSync(path.join(frontend,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'styles/custom.css'),'utf8');
const movement=fs.readFileSync(path.resolve(import.meta.dirname,'../src/scenario-movement.js'),'utf8');

test('v45 aumenta o retrato principal sem abandonar thumbnails',()=>{
  assert.match(app,/size==='xl'\?'h-28 w-28 sm:h-36 sm:w-36'/);
  assert.match(app,/h\(Portrait,\{key:'p',entity,size:'xl'\}\)/);
  assert.match(app,/const thumb = src/);
});

test('v45 destaca no grid somente as casas alcançáveis e mostra o custo',()=>{
  assert.match(app,/function reachableScenarioCellsUI/);
  assert.match(app,/reachableScenarioCellsUI\(current,selectedPiece,movement\.mode,movement\.remaining\)/);
  assert.match(app,/reachable-cell/);
  assert.match(app,/move-cost/);
  assert.match(css,/\.board-cell\.reachable-cell/);
  assert.match(movement,/export function reachableScenarioCells/);
});

test('v45 restaura o montador completo de cenário no frontend React',()=>{
  assert.match(app,/function ScenarioBuilder/);
  assert.match(app,/MONTADOR TÁTICO/);
  assert.match(app,/APLICAR MODELO/);
  assert.match(app,/GERAR MAPA/);
  assert.match(app,/ADICIONAR PEÇAS/);
  assert.match(app,/TERRAIN_TOOLS/);
  assert.match(app,/OBSTACLE_META/);
  assert.match(app,/async editScenarioCell/);
  assert.match(app,/async addScenarioPieces/);
});

test('v45 movimenta usando o modo escolhido e mantém autorização do backend',()=>{
  assert.match(app,/API\.moveScenarioPiece\(\{pieceId:id,x,y,mode,from:/);
  assert.match(app,/moveMode:'run'/);
  assert.match(app,/onMoveMode/);
  assert.equal((app.match(/function Board\(/g)||[]).length,1);
  assert.equal((app.match(/new EventSource/g)||[]).length,0);
});
