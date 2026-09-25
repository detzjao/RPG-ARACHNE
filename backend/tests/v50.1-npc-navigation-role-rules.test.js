import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyRoster,blankSeed} from '../src/templates.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');

test('v50.1 sidebar e página própria de NPCs',()=>{
  assert.match(app,/\['npcs','◎','NPCs'\]/);
  assert.match(app,/case'npcs':return this\.renderRoster\('npc'\)/);
  assert.match(app,/CONTROLADOS PELO MESTRE/);
});

test('v50.1 central usa seletor visual amplo para Vilões e NPCs',()=>{
  assert.match(app,/sm:min-w-\[280px\]/);
  assert.match(app,/Escolha o grupo controlado pelo Mestre/);
  assert.match(app,/bg-sky-600/);
});

test('v50.1 personagem normal não entra como NPC se já for herói',()=>{
  const seed=blankSeed('Teste');
  const result=applyRoster(seed,{heroIds:['spider'],npcIds:['spider'],villainIds:[]});
  assert.equal(result.heroes.some(x=>x.id==='spider'),true);
  assert.equal(result.npcs.some(x=>(x.sourceCharacterId||x.id)==='spider'),false);
  assert.match(server,/já está na campanha como Herói ou Vilão/);
});

test('v50.1 capanga pode coexistir como NPC e vilão',()=>{
  const seed=blankSeed('Teste');
  const result=applyRoster(seed,{heroIds:[],npcIds:['hydra-agent'],villainIds:['hydra-agent']});
  assert.equal(result.npcs.some(x=>(x.sourceCharacterId||x.id)==='hydra-agent'),true);
  assert.equal(result.villains.some(x=>x.id==='hydra-agent'),true);
});
