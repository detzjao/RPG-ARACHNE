import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const script=fs.readFileSync(path.join(root,'frontend/script.js'),'utf8');
const api=fs.readFileSync(path.join(root,'frontend/api-client.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const gameplay=fs.readFileSync(path.join(root,'backend/src/gameplay.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');

test('Central do Mestre possui resolução de ataque com alvo, defesa e uma única D616',()=>{
  assert.match(script,/RESOLUÇÃO DE ATAQUE/);
  assert.match(script,/data-master-attack-roll/);
  assert.match(script,/central-attack-target/);
  assert.match(script,/central-attack-defense/);
  assert.match(script,/rollType:'attack'/);
  assert.match(script,/targetId:target\.entity\.id/);
  assert.doesNotMatch(script,/ROLAR DANO/i);
  assert.doesNotMatch(script,/Dado de dano/i);
});

test('ataque na Central reutiliza a animação D616 existente e não cria outra',()=>{
  assert.match(script,/animateReusableD616Result\(centralMasterAttackRoll,'central-master-attack-dice-stage'/);
  assert.match(script,/ArachneDiceAnimation\?\.animateD616/);
  assert.equal((css.match(/@keyframes\s+cubeTumble\b/g)||[]).length,1);
  assert.equal((script.match(/window\.ArachneDiceAnimation\s*=\s*Object\.freeze/g)||[]).length,1);
});

test('aplicar dano envia somente rollId e backend recalcula pela mesma damageFromRoll',()=>{
  assert.match(api,/applyAttackDamage\(rollId\)/);
  assert.match(api,/apply-damage/);
  assert.match(server,/persistedAttackDamage\(entry\)/);
  assert.match(server,/damageFromRoll\(\{values:/);
  assert.match(server,/entry\.damageApplied/);
  assert.match(gameplay,/damageFromRoll\(roll\)/);
});

test('histórico mantém alvo, Marvel Die, dano calculado e estado de aplicação na mesma rollId',()=>{
  assert.match(gameplay,/targetId:roll\.snapshot\.targetId/);
  assert.match(gameplay,/damageApplied:false/);
  assert.match(server,/damageApplied:true/);
  assert.match(server,/item\?\.rollId===rollId/);
});
