import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');
const react=fs.readFileSync(path.join(root,'frontend/vendor/react.production.min.js'),'utf8');

test('frontend permanece compatível com o React empacotado e não abre tela preta',()=>{
  assert.match(react,/React v16\.0\.0/);
  assert.doesNotMatch(app,/React\.(?:useState|useEffect|useMemo|useCallback|useRef|memo)\b/);
  assert.match(index,/src\/app\.js\?v=(?:49\.[0-9]+|50\.[0-9]+)/);
});
