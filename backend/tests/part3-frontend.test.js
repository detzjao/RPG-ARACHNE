import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontend=path.resolve(import.meta.dirname,'../../frontend');
const html=fs.readFileSync(path.join(frontend,'index.html'),'utf8');
const script=fs.readFileSync(path.join(frontend,'script.js'),'utf8');
const api=fs.readFileSync(path.join(frontend,'api-client.js'),'utf8');
const css=fs.readFileSync(path.join(frontend,'style.css'),'utf8');

test('Central do Mestre possui histórico estável no frontend React',()=>{
  const app=fs.readFileSync(path.join(frontend,'src/app.js'),'utf8');
  assert.match(app,/function RollHistory/);
  assert.match(app,/HISTÓRICO DA SESSÃO/);
  assert.match(app,/rows\.slice\(\)\.reverse\(\)/);
  assert.match(app,/isMaster\?h\(RollHistory/);
});

test('rolagem do jogador e do Mestre reutilizam ArachneDiceAnimation',()=>{
  assert.match(script,/window\.ArachneDiceAnimation\s*=\s*Object\.freeze/);
  assert.match(script,/animateMasterLiveRoll[\s\S]*ArachneDiceAnimation\?\.animateD616/);
  assert.match(script,/animateReusableD616Result[\s\S]*ArachneDiceAnimation\?\.animateD616/);
  assert.equal((css.match(/@keyframes cubeTumble/g)||[]).length,1);
});

test('realtime continua usando uma única implementação EventSource',()=>{
  const allJs=`${api}\n${script}`;
  assert.equal((allJs.match(/new EventSource/g)||[]).length,1);
  assert.match(script,/onLiveRoll:handleRealtimeLiveRoll/);
  assert.doesNotMatch(script,/setInterval\([^\n]*live-roll/i);
});
