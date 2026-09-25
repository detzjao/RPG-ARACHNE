import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCharacterLibrary, getCharacter, LIBRARY_REVISION } from '../src/templates.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const frontend=path.resolve(here,'../../frontend');

const exists = rel => fs.existsSync(path.join(frontend,String(rel||'').replace(/^\/+/,'')));

test('v49.1 keeps curated legacy portraits for characters that already existed',()=>{
  assert.equal(LIBRARY_REVISION,11);
  const expected={
    spider:'assets/portraits/hero-spider.webp',
    wolverine:'assets/portraits/hero-wolverine.webp',
    cap:'assets/portraits/hero-cap.webp',
    daredevil:'assets/portraits/hero-daredevil-v2.webp',
    deadpool:'assets/portraits/hero-deadpool.webp',
    venom:'assets/portraits/hero-venom.webp',
    octopus:'assets/portraits/villain-octopus.webp',
    goblin:'assets/portraits/villain-goblin.webp',
    kingpin:'assets/portraits/villain-kingpin.webp',
    elektra:'assets/portraits/villain-elektra.webp',
    juggernaut:'assets/portraits/villain-juggernaut.webp'
  };
  for(const [id,image] of Object.entries(expected)){
    const c=getCharacter('hero',id)||getCharacter('villain',id);
    assert.ok(c,`missing ${id}`);
    assert.equal(c.image,image,`${id} did not preserve its curated portrait`);
    assert.equal(c.image_url,image,`${id} image_url should match displayed portrait`);
    assert.match(c.source_image_url,/^assets\/characters\//,`${id} should retain source-book crop provenance`);
    assert.ok(exists(c.image),`missing curated portrait for ${id}`);
    assert.ok(exists(c.source_image_url),`missing source crop for ${id}`);
  }
});

test('v49.1 uses source-book portrait for newly imported characters',()=>{
  for(const id of ['america-chavez','agatha-harkness','beast','ghost-spider','wong']){
    const c=getCharacter('hero',id)||getCharacter('villain',id);
    assert.ok(c,`missing ${id}`);
    assert.match(c.image,/^assets\/characters\//,`${id} should use source-book crop`);
    assert.equal(c.image,c.image_url);
    assert.equal(c.image,c.source_image_url);
    assert.ok(exists(c.image),`missing source portrait for ${id}`);
  }
});

test('v49.1 source PDF links stay isolated even when a legacy portrait is kept',()=>{
  for(const id of ['daredevil','deadpool','octopus','goblin']){
    const c=getCharacter('hero',id)||getCharacter('villain',id);
    assert.match(c.sheet_pdf_url,/^assets\/characters\/.+\/character-sheet\.pdf$/);
    assert.equal(c.pdf,c.sheet_pdf_url);
    assert.ok(exists(c.sheet_pdf_url),`missing isolated sheet for ${id}`);
  }
});

test('v49.1 every imported profile resolves to an existing display image',()=>{
  const all=getCharacterLibrary('all');
  const source=[...all.heroes,...all.villains].filter(c=>c.sourcePdf==='Marvel_Multiverse_RPG_Todos_Personagens.pdf');
  assert.equal(source.length,128);
  const curated=source.filter(c=>String(c.image).startsWith('assets/portraits/'));
  const extracted=source.filter(c=>String(c.image).startsWith('assets/characters/'));
  assert.equal(curated.length,47);
  assert.equal(extracted.length,81);
  for(const c of source)assert.ok(exists(c.image),`missing display image ${c.id}: ${c.image}`);
});
