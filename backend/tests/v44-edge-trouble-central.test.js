import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const app=fs.readFileSync(path.join(frontend,'src/app.js'),'utf8');
const server=fs.readFileSync(path.resolve(import.meta.dirname,'../src/server.js'),'utf8');

test('Central React exibe controles compactos de Edge e Trouble junto ao TN',()=>{
  assert.match(app,/function RollModifierControl/);
  assert.match(app,/label:'EDGE'/);
  assert.match(app,/label:'TROUBLE'/);
  assert.match(app,/category!==['"]movement['"]/);
});

test('toda rolagem da Central envia Edge e Trouble selecionados',()=>{
  assert.match(app,/const payload=\{ability,action,tn:this\.state\.tn,edge:this\.state\.edge,trouble:this\.state\.trouble\}/);
  assert.match(app,/edge:0,trouble:0/);
});

test('backend aceita Edge e Trouble enviados pelo jogador sem alterar alvo ou dano',()=>{
  const playerBranch=server.match(/:\{\.\.\.stored,action:String\(body\?\.action[\s\S]*?damageResource\};/)?.[0]||'';
  assert.match(playerBranch,/edge:Number\.isFinite\(Number\(body\?\.edge\)\)/);
  assert.match(playerBranch,/trouble:Number\.isFinite\(Number\(body\?\.trouble\)\)/);
});
