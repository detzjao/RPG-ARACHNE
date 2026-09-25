import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_RULEBOOK_CHARACTERS } from '../src/core-rulebook-library.js';
import { getCharacterLibrary, getCharacter, LIBRARY_REVISION } from '../src/templates.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const frontend=path.join(root,'frontend');

test('v49 imports all 128 source profiles with unique page provenance',()=>{
  assert.equal(CORE_RULEBOOK_CHARACTERS.length,128);
  assert.equal(new Set(CORE_RULEBOOK_CHARACTERS.map(x=>x.id)).size,128);
  assert.deepEqual(CORE_RULEBOOK_CHARACTERS.map(x=>x.pdf_page_start),Array.from({length:128},(_,i)=>i+3));
  for(const c of CORE_RULEBOOK_CHARACTERS){
    assert.equal(c.pdf_page_start,c.pdf_page_end);
    assert.equal(c.book_page_start,c.pdf_page_start+131);
    assert.equal(c.book_page_end,c.book_page_start);
    assert.ok(c.name!=='' || c.n);
    assert.ok(c.image_url && c.sheet_pdf_url);
  }
});

test('v49 creates an isolated PDF and source-derived portrait for every source profile',()=>{
  for(const c of CORE_RULEBOOK_CHARACTERS){
    const pdf=path.join(frontend,c.sheet_pdf_url);
    const image=path.join(frontend,c.image_url);
    assert.ok(fs.existsSync(pdf),`missing ${c.id} PDF`);
    assert.ok(fs.existsSync(image),`missing ${c.id} image`);
    assert.ok(fs.statSync(pdf).size>1000,`empty ${c.id} PDF`);
    assert.ok(fs.statSync(image).size>1000,`empty ${c.id} image`);
    assert.equal(fs.readFileSync(pdf).subarray(0,4).toString(),'%PDF');
  }
});

test('v49 preserves exact source-page metadata for known profiles',()=>{
  const daredevil=CORE_RULEBOOK_CHARACTERS.find(x=>x.id==='daredevil');
  const deadpool=CORE_RULEBOOK_CHARACTERS.find(x=>x.id==='deadpool');
  const wong=CORE_RULEBOOK_CHARACTERS.find(x=>x.id==='wong');
  assert.equal(daredevil.pdf_page_start,26);
  assert.equal(daredevil.book_page_start,157);
  assert.equal(daredevil.damageMultipliers.Melee,3);
  assert.equal(deadpool.pdf_page_start,27);
  assert.equal(deadpool.book_page_start,158);
  assert.equal(wong.pdf_page_start,130);
  assert.equal(wong.book_page_start,261);
});

test('v49 source library is merged into the existing cross-roster library',()=>{
  assert.equal(LIBRARY_REVISION,8);
  const all=getCharacterLibrary('all');
  const sourceIds=new Set([...all.heroes,...all.villains].filter(x=>x.sourcePdf==='Marvel_Multiverse_RPG_Todos_Personagens.pdf').map(x=>x.id));
  assert.equal(sourceIds.size,128);
  assert.equal(getCharacter('hero','octopus')?.id,'octopus');
  assert.equal(getCharacter('villain','daredevil')?.id,'daredevil');
  assert.equal(getCharacter('hero','hand-ninja')?.id,'hand-ninja');
});

test('v49 UI opens only the isolated character sheet PDF',()=>{
  const app=fs.readFileSync(path.join(frontend,'src/app.js'),'utf8');
  assert.match(app,/VER FICHA COMPLETA EM PDF/);
  assert.match(app,/entity\.sheet_pdf_url\|\|entity\.pdf/);
  const index=fs.readFileSync(path.join(frontend,'index.html'),'utf8');
  assert.match(index,/v=49\.2/);
});
