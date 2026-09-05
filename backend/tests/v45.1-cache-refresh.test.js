import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');

test('v45.1 força atualização do frontend sem reutilizar JS/CSS da versão anterior',()=>{
  assert.match(index,/styles\/tailwind\.css\?v=45\.1/);
  assert.match(index,/styles\/custom\.css\?v=45\.1/);
  assert.match(index,/src\/api\.js\?v=45\.1/);
  assert.match(index,/src\/app\.js\?v=45\.1/);
  assert.match(server,/no-store, no-cache, must-revalidate/);
});
