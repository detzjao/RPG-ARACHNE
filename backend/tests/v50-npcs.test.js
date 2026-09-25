import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {blankSeed,applyRoster,LIBRARY_REVISION} from '../src/templates.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const api=fs.readFileSync(path.join(root,'frontend/src/api.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('v50 seed e migration possuem roster NPC separado',()=>{
  assert.equal(LIBRARY_REVISION,11);
  const blank=blankSeed('NPC test');
  assert.deepEqual(blank.npcs,[]);
  const seeded=applyRoster(blank,{heroIds:['spider'],npcIds:['nick-fury-jr'],villainIds:['octopus']});
  assert.equal(seeded.heroes.some(x=>x.id==='nick-fury-jr'),false);
  assert.equal(seeded.villains.some(x=>x.id==='nick-fury-jr'),false);
  const nick=seeded.npcs.find(x=>x.id==='nick-fury-jr');
  assert.ok(nick);
  assert.equal(nick.campaignRole,'npc');
  assert.equal(nick.sourceCharacterId,'nick-fury-jr');
  assert.match(server,/allowedKeys=new Set\(\['heroes','npcs','villains'/);
  assert.match(server,/if\(!Array\.isArray\(all\.npcs\)\)updates\.npcs=\[\]/);
});

test('v50 UI operacional troca Anti-heróis por NPCs',()=>{
  assert.match(app,/roster\('npc'\)/);
  assert.match(app,/rosterBlock\('npc'\)/);
  assert.match(app,/\['npc','NPCs'/);
  assert.match(app,/>?'NPCS'/);
  assert.match(app,/'VILÕES'/);
  assert.doesNotMatch(app,/roster\('antihero'\)/);
  assert.doesNotMatch(app,/\['antihero','Anti-heróis'/);
});

test('v50 Central alterna Vilões e NPCs e cenário aceita NPC',()=>{
  assert.match(app,/masterActorView:'villain'/);
  assert.match(app,/masterActorView:'npc'/);
  assert.match(app,/kind==='npc'\?'NPC'/);
  assert.match(app,/label:`NPC · \$\{e\.n\}`/);
  assert.match(app,/kind==='npc'\?'npc':'enemy'/);
});

test('v50 frontend possui API dedicada de NPC e cache atualizado',()=>{
  assert.match(api,/async function saveNpc\(/);
  assert.match(api,/async function deleteNpc\(/);
  assert.match(index,/src\/api\.js\?v=50\.0/);
  assert.match(index,/src\/app\.js\?v=50\.[0-9]+/);
});
