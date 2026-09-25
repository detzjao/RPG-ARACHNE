import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCharacter, LIBRARY_REVISION } from '../src/templates.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'../..');
const frontend=path.join(root,'frontend');

const ids=[
  ['hero','deadpool'],['hero','daredevil'],['hero','venom'],['hero','shield-agent'],
  ['villain','juggernaut'],['villain','hand-ninja'],['villain','elektra'],['villain','kingpin']
];

test('v49.2 keeps library migration ahead of the earlier official-sheet revisions',()=>{
  assert.ok(LIBRARY_REVISION>=8);
});

test('v49.2 links known characters to isolated source-book sheet PDFs',()=>{
  for(const [kind,id] of ids){
    const character=getCharacter(kind,id);
    assert.ok(character,`missing ${kind}:${id}`);
    assert.equal(character.pdf,character.sheet_pdf_url,`${id} should use isolated source sheet`);
    assert.match(character.sheet_pdf_url,/^assets\/characters\/.+\/character-sheet\.pdf$/);
    assert.ok(Number(character.pdf_page_start)>=3);
    assert.equal(character.pdf_page_start,character.pdf_page_end);
    const file=path.join(frontend,character.sheet_pdf_url);
    const data=fs.readFileSync(file);
    assert.equal(data.subarray(0,4).toString(),'%PDF',`${id} isolated sheet must be a PDF`);
    assert.ok(data.length>1000,`${id} isolated sheet is empty`);
  }
});

test('cross-roster keeps the same isolated PDF for antiheroes and wildcards',()=>{
  for(const id of ['deadpool','venom','elektra','juggernaut']){
    const hero=getCharacter('hero',id), villain=getCharacter('villain',id);
    assert.ok(hero&&villain,id);
    assert.equal(hero.sheet_pdf_url,villain.sheet_pdf_url,id);
    assert.equal(hero.pdf,villain.pdf,id);
  }
});
