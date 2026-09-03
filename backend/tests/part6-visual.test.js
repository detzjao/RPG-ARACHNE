import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot=path.resolve(import.meta.dirname,'../..');
const css=fs.readFileSync(path.join(projectRoot,'frontend/style.css'),'utf8');
const html=fs.readFileSync(path.join(projectRoot,'frontend/index.html'),'utf8');
const script=fs.readFileSync(path.join(projectRoot,'frontend/script.js'),'utf8');
const apiClient=fs.readFileSync(path.join(projectRoot,'frontend/api-client.js'),'utf8');

function occurrences(text,pattern){return (text.match(pattern)||[]).length;}

test('v32 aplica polimento visual sem criar uma segunda lógica de dados ou realtime',()=>{
  assert.match(css,/v32\.0 · Polimento visual e feedback de interação/);
  assert.match(html,/style\.css\?v=[^"']+/);
  assert.equal(occurrences(script,/window\.ArachneDiceAnimation\s*=/g),1);
  assert.equal(occurrences(css,/@keyframes\s+cubeTumble\b/g),1);
  assert.equal(occurrences(apiClient,/new\s+EventSource\s*\(/g),1);
});

test('v32 cobre hover, clique, foco, desabilitado e movimento reduzido',()=>{
  assert.match(css,/button:not\(:disabled\):active/);
  assert.match(css,/button:focus-visible/);
  assert.match(css,/button:disabled/);
  assert.match(css,/#roll-d616:not\(:disabled\):hover/);
  assert.match(css,/\[data-central-combat="next"\]:not\(:disabled\):hover/);
  assert.match(css,/\.central-ability-grid button:not\(:disabled\):hover/);
  assert.match(css,/\.scenario-cell\.reachable:not\(\.has-piece\):hover/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('v32 possui feedback visual para turno, movimento e resultado sem loops JavaScript novos',()=>{
  assert.match(css,/@keyframes\s+v32TurnFocus/);
  assert.match(css,/@keyframes\s+v32TokenSettle/);
  assert.match(css,/@keyframes\s+v32ResultIn/);
  assert.match(css,/\.central-combat-row\.active\{animation:v32TurnFocus/);
  assert.match(css,/\.scenario-cell\.selected \.board-piece\{animation:v32TokenSettle/);
});

test('v32 inclui breakpoints para desktop reduzido e telas menores',()=>{
  assert.match(css,/@media\(max-width:980px\)/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/@media\(max-width:420px\)/);
  assert.match(css,/\.central-inline-actions button\{min-height:38px;flex:1 1 150px\}/);
  assert.match(css,/\.central-ability-grid\{grid-template-columns:1fr\}/);
});

test('folha de estilos mantém estrutura balanceada após o bloco v32',()=>{
  assert.equal(occurrences(css,/\{/g),occurrences(css,/\}/g));
});
