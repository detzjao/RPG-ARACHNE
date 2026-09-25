import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

test('v49.5 ficha não usa React.Fragment incompatível com React 16.0.0',()=>{
  assert.doesNotMatch(app,/React\.Fragment/);
  assert.match(app,/key:'img'.*sheet-visual-img/);
});

test('v49.5 força novo app.js para evitar cache da ficha quebrada',()=>{
  assert.match(index,/src\/app\.js\?v=(?:49\.[0-9]+|50\.[0-9]+)/);
});
