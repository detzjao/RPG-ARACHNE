import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getCharacter, LIBRARY_REVISION } from '../src/templates.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'../..');
const expected={
  'hero:deadpool':['assets/pdfs/hero-deadpool.pdf?v=48.6','f00c555320574ed88d34f301a0c7c2147a5423036d1f13636576d71afb4bb69d'],
  'hero:daredevil':['assets/pdfs/hero-daredevil.pdf?v=48.6','289836cf350119a401ae2f2b11fe47ee3b64128a03ba8d1a177bdb25285bb0bc'],
  'hero:venom':['assets/pdfs/hero-venom.pdf?v=48.6','b02d32fe676885661c724eee2cfc98f0d24ee7830e28e202e74cac02bdde0ce9'],
  'hero:shield-agent':['assets/pdfs/hero-shield-agent.pdf?v=48.6','38dd98dac746d0d8c5fabdc435628044a7887b69798c6f00fa9b510dc57c6402'],
  'villain:juggernaut':['assets/pdfs/villain-juggernaut.pdf?v=48.6','c0ef0203e63764c4a1140a8799fee0a5ea2b4f145bd24a6851b38d9c8f436853'],
  'villain:hand-ninja':['assets/pdfs/villain-hand-ninja.pdf?v=48.6','930b9ba28ec636f64bf744068ff1847334a56ae7d246c131a40fd838869037d2'],
  'villain:elektra':['assets/pdfs/villain-elektra.pdf?v=48.6','16e90428177167fedcea8c39ac62b98e0c65239f778d46c13afa294bad97b5be'],
  'villain:kingpin':['assets/pdfs/villain-kingpin.pdf?v=48.6','4f259868d8b8c4f2b776b0240b76aa36e279bf6258c659093fb3ca237c9f6b46'],
};

test('v48.6 bumps the library revision so existing campaigns receive official sheets',()=>{
  assert.ok(LIBRARY_REVISION>=4);
});

test('v48.6 character library links to the exact uploaded official PDFs',()=>{
  for(const [key,[url,sha]] of Object.entries(expected)){
    const [kind,id]=key.split(':');
    const character=getCharacter(kind,id);
    assert.ok(character,`missing ${key}`);
    assert.equal(character.pdf,url,`${key} should use its official PDF`);
    const relative=url.split('?')[0];
    const file=path.join(root,'frontend',relative.replace(/^assets\//,'assets/'));
    const data=fs.readFileSync(file);
    assert.equal(data.subarray(0,4).toString(),'%PDF',`${relative} must be a PDF`);
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'),sha,`${relative} is not the exact uploaded file`);
  }
});

test('cross-roster keeps the same official PDF for antiheroes/wildcards',()=>{
  assert.equal(getCharacter('villain','deadpool').pdf,'assets/pdfs/hero-deadpool.pdf?v=48.6');
  assert.equal(getCharacter('villain','venom').pdf,'assets/pdfs/hero-venom.pdf?v=48.6');
  assert.equal(getCharacter('hero','elektra').pdf,'assets/pdfs/villain-elektra.pdf?v=48.6');
  assert.equal(getCharacter('hero','juggernaut').pdf,'assets/pdfs/villain-juggernaut.pdf?v=48.6');
});
