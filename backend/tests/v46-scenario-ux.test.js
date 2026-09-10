import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const app=fs.readFileSync(path.join(frontend,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'styles/custom.css'),'utf8');

test('v46 organiza o montador em fluxo simples e categorias visuais',()=>{
  assert.match(app,/Escolha a base/);
  assert.match(app,/Desenhe o necessário/);
  assert.match(app,/Coloque os personagens/);
  assert.match(app,/TERRENO/);
  assert.match(app,/ESTRUTURAS/);
  assert.match(app,/OBJETOS/);
  assert.match(app,/DETALHES/);
  assert.match(css,/\.scenario-tool-tile/);
});

test('v46 usa ícones legíveis e legenda no próprio mapa',()=>{
  assert.match(app,/wall:\{label:'Parede',icon:'🧱'/);
  assert.match(app,/door:\{label:'Porta',icon:'🚪'/);
  assert.match(app,/crate:\{label:'Caixa',icon:'📦'/);
  assert.match(app,/car:\{label:'Veículo',icon:'🚙'/);
  assert.match(app,/function ScenarioLegend/);
  assert.match(app,/LEGENDA DO MAPA/);
  assert.match(css,/\.cell-tooltip/);
});

test('v46/v47 mantém alcance de movimento destacado e explicativo',()=>{
  assert.match(app,/As casas verdes são os destinos disponíveis/);
  assert.doesNotMatch(app,/O número indica o custo/);
  assert.match(css,/\.board-cell\.reachable-cell/);
  assert.match(css,/\.movement-mode-btn\.active/);
});
