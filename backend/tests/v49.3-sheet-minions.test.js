import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCharacterLibrary,LIBRARY_REVISION} from '../src/templates.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/styles/custom.css'),'utf8');
const ids=['kingpin-henchman','mercenary','vulture-henchman','green-goblin-henchman','doctor-octopus-henchman','mysterio-henchman','sinister-follower','apocalypse-follower','ultron-drone','sentinel','doombot','deathlok','skrull','kree','chitauri','brood','badoon','shiar','symbiote','morlock','reaver','latveria-soldier','kyln-guard','vampire','werewolf','wendigo','demon','dormammu-cultist'];

test('v49.3 mantém os 28 capangas no catálogo com retratos próprios',()=>{
  assert.equal(LIBRARY_REVISION,9);
  const lib=getCharacterLibrary('all');
  const map=new Map([...lib.heroes,...lib.villains].map(x=>[x.id,x]));
  assert.equal(ids.length,28);
  for(const [i,id] of ids.entries()){
    const item=map.get(id); assert.ok(item,id);
    assert.equal(item.tier,'CAPANGA',id); assert.equal(item.generic,true,id); assert.equal(item.type,'minion',id);
    assert.equal(item.catalogPack,'arachne-28-minions',id);
    const num=String(i+1).padStart(2,'0');
    assert.match(item.image,new RegExp(`minion-${num}-`),id);
    assert.ok(fs.existsSync(path.join(root,'frontend',item.image)),`${id} image`);
  }
});

test('v49.3 ficha mostra Rank, esconde DR vazio e explica redução real',()=>{
  assert.match(app,/statCard\('RANK'/);
  assert.match(app,/damageReductionLabel/);
  assert.match(app,/Redução de dano:/);
  assert.match(css,/\.sheet-visual-img\{[^}]*object-fit:contain!important/);
  assert.match(css,/\.sheet-visual-bg\{/);
});

test('v49.3 catálogo informa explicitamente o pacote de 28 capangas',()=>{
  assert.match(app,/CAPANGA_PACK_28_IDS/);
  assert.match(app,/do pacote de 28 capangas/);
  assert.match(app,/catalog-grid-scroll/);
});
