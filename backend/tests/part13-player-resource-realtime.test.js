import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const api=fs.readFileSync(path.join(root,'frontend/api-client.js'),'utf8');
const html=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

function functionBody(name,nextName){
  const start=script.indexOf(`function ${name}`);
  assert.ok(start>=0,`${name} não encontrado`);
  const end=nextName?script.indexOf(`function ${nextName}`,start+1):-1;
  return script.slice(start,end>start?end:start+12000);
}

test('eventos remotos de heroes atualizam Central e Combate imediatamente',()=>{
  const body=functionBody('applyRemoteState','updateRealtimeStatus');
  const heroesStart=body.indexOf("key === 'heroes'");
  const villainsStart=body.indexOf("key === 'villains'",heroesStart);
  const heroesBranch=body.slice(heroesStart,villainsStart);
  assert.match(heroesBranch,/state\.heroes = normalizeHeroList\(value\)/);
  assert.match(heroesBranch,/renderSessionCentral\(\)/);
  assert.match(heroesBranch,/renderCombatConsole\(\)/);
});

test('evento remoto de combat atualiza Central e tela de Combate sem polling',()=>{
  const body=functionBody('applyRemoteState','updateRealtimeStatus');
  const combatStart=body.indexOf("key === 'combat'");
  const actionHistoryStart=body.indexOf("key === 'actionHistory'",combatStart);
  const combatBranch=body.slice(combatStart,actionHistoryStart);
  assert.match(combatBranch,/localStorage\.setItem\(STORAGE\.combat/);
  assert.match(combatBranch,/renderSessionCentral\(\)/);
  assert.match(combatBranch,/renderCombatConsole\(\)/);
  assert.equal((`${api}\n${script}`.match(/new EventSource/g)||[]).length,1);
  assert.doesNotMatch(`${api}\n${script}`,/setInterval\([^\n]*(health|focus|resources)/i);
});

test('troca de tela reutiliza o estado sincronizado em memória',()=>{
  const body=functionBody('goToPage','openNav');
  assert.match(body,/if\(id==='home'\)renderSessionCentral\(\)/);
  assert.match(body,/if\(id==='combat'\)renderCombatConsole\(\)/);
  assert.match(html,/script\.js\?v=33\.4\.4-repeatable-generics/);
});
