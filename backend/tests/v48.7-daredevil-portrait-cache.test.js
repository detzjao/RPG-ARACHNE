import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCharacter, LIBRARY_REVISION } from '../src/templates.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');

test('v48.7 Demolidor usa novo arquivo de retrato para furar cache immutable',()=>{
  const daredevil=getCharacter('hero','daredevil');
  assert.equal(LIBRARY_REVISION,11);
  assert.equal(daredevil.image,'assets/portraits/hero-daredevil-v2.webp');
  assert.ok(fs.statSync(path.join(root,'frontend/assets/portraits/hero-daredevil-v2.webp')).size>100_000);
  assert.ok(fs.statSync(path.join(root,'frontend/assets/portraits/thumbs/hero-daredevil-v2.webp')).size>20_000);
});
