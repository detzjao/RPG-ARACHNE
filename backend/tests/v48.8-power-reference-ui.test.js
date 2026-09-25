import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getCharacterLibrary } from '../src/templates.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'../..');
const appPath=path.join(root,'frontend/src/app.js');
const rulesPath=path.join(root,'frontend/src/power-rules.js');
const indexPath=path.join(root,'frontend/index.html');

test('v48.8 powers tab is reference-only and combat cards are cleaner',()=>{
  const app=fs.readFileSync(appPath,'utf8');
  assert.match(app,/Consulte os poderes/);
  assert.match(app,/DESCRIÇÃO DO PODER/);
  assert.match(app,/Clique em um poder para abrir a descrição/);
  assert.doesNotMatch(app,/DANO ×\$\{damageProfile\(entity\)\[ability\]\} · ROLAR D616/);
  assert.match(app,/const isRollCategory=category==='combat'\|\|category==='test'/);
  assert.doesNotMatch(app,/power\?h\('div',\{key:'a',className:'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'/);
});

test('v48.8 index loads the power rule catalog before app.js',()=>{
  const html=fs.readFileSync(indexPath,'utf8');
  assert.match(html,/power-rules\.js\?v=48\.8/);
  assert.match(html,/app\.js\?v=48\.8/);
  assert.ok(html.indexOf('power-rules.js?v=48.8') < html.indexOf('app.js?v=48.8'));
});

test('all powers used by registered heroes resolve to a Portuguese description',()=>{
  const source=fs.readFileSync(rulesPath,'utf8');
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(source,sandbox,{filename:'power-rules.js'});
  assert.equal(typeof sandbox.window.ArachnePowerInfo,'function');
  const heroes=getCharacterLibrary('hero');
  assert.ok(heroes.length>=20);
  for(const hero of heroes){
    for(const power of hero.powers||[]){
      const info=sandbox.window.ArachnePowerInfo(power);
      assert.ok(info && typeof info.description==='string' && info.description.trim().length>=20,`${hero.n}: ${power}`);
      assert.ok(typeof info.ruleName==='string' && info.ruleName.trim(),`${hero.n}: ${power} missing ruleName`);
    }
  }
});
