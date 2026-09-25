import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCharacterLibrary, getTemplates } from '../src/templates.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'frontend/src/character-intelligence.js'),'utf8');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'character-intelligence.js'});
const INTEL=sandbox.window.ArachneCharacterIntel;

function library(){
  const raw=getCharacterLibrary('all');
  return [
    ...raw.heroes.map(item=>({...item,libraryKind:'hero'})),
    ...raw.villains.map(item=>({...item,libraryKind:'villain'}))
  ];
}
function byId(items,id){return items.find(item=>item.id===id);}

test('v49: separa herois anti-herois viloes e capangas',()=>{
  const items=library();
  assert.equal(INTEL.category(byId(items,'spider')),'hero');
  assert.equal(INTEL.category(byId(items,'deadpool')),'antihero');
  assert.equal(INTEL.category(byId(items,'ghost-rider')),'antihero');
  assert.equal(INTEL.category(byId(items,'doom')),'villain');
  assert.equal(INTEL.category(byId(items,'kingpin-henchman')),'minion');
  assert.equal(INTEL.category(byId(items,'shield-agent')),'minion');
});

test('v49: traduz e filtra grupos principais',()=>{
  const items=library();
  assert.equal(INTEL.labelGroup('Avengers'),'Vingadores');
  assert.equal(INTEL.labelGroup('Fantastic Four'),'Quarteto Fantástico');
  assert.equal(INTEL.labelGroup('Sinister Six'),'Sexteto Sinistro');
  const avengers=INTEL.collectGroups(items,{categoryKey:'hero'}).find(g=>g.id==='Avengers');
  assert.ok(avengers&&avengers.count>=5);
});

test('v49: Homem-Aranha prioriza aliados viloes e capangas relacionados',()=>{
  const items=library(),templates=getTemplates();
  const ranked=INTEL.rankItems(items,{focusId:'spider',selectedIds:['spider'],templates});
  const topIds=ranked.filter(row=>row.item.id!=='spider').slice(0,18).map(row=>row.item.id);
  assert.ok(topIds.includes('daredevil'));
  assert.ok(topIds.includes('octopus'));
  assert.ok(topIds.includes('goblin'));
  assert.ok(topIds.includes('kingpin'));
  assert.ok(topIds.includes('doctor-octopus-henchman')||topIds.includes('green-goblin-henchman'));
});

test('v49: todos os personagens da biblioteca possuem ao menos uma conexao inteligente',()=>{
  const items=library(),templates=getTemplates();
  const disconnected=[];
  for(const item of items){
    const ranked=INTEL.rankItems(items,{focusId:item.id,selectedIds:[item.id],templates});
    const related=ranked.some(row=>row.item.id!==item.id&&row.score>0);
    if(!related)disconnected.push(item.id);
  }
  assert.deepEqual(disconnected,[]);
});

test('v49: frontend carrega o motor de inteligencia antes do app',()=>{
  const html=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');
  assert.match(html,/character-intelligence\.js\?v=49\.2/);
  assert.ok(html.indexOf('character-intelligence.js')<html.indexOf('src/app.js'));
  const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
  assert.match(app,/PERSONAGENS POR CATEGORIA/);
  assert.match(app,/CATÁLOGO INTELIGENTE/);
  assert.match(app,/Anti-heróis/);
  assert.match(app,/Capangas/);
});
