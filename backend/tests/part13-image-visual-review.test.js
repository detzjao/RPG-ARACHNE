import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const css=fs.readFileSync(path.join(root,'frontend/style.css'),'utf8');
const html=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');

const portraits=[
  'villain-abomination.webp','villain-ajax.webp','villain-annihilus.webp','villain-zemo.webp','hero-black-panther.webp',
  'villain-blastaar.webp','hero-captain-marvel.webp','hero-thing.webp','hero-deadpool.webp','hero-daredevil.webp',
  'hero-doctor-strange.webp','villain-elektra.webp','hero-scarlet-witch.webp','hero-gambit.webp','hero-hawkeye.webp',
  'villain-molecule-man.webp','hero-hulk.webp','villain-juggernaut.webp','villain-loki.webp','hero-luke-cage.webp',
  'villain-madcap.webp','villain-magneto.webp','hero-war-machine.webp','villain-bullseye.webp','villain-mystique.webp',
  'hero-she-hulk.webp','hero-invisible-woman.webp','hero-shang-chi.webp','hero-mr-fantastic.webp','villain-super-skrull.webp',
  'hero-human-torch.webp','villain-tombstone.webp','villain-t-ray.webp','hero-vision.webp','villain-kingpin.webp'
];

test('retratos usam cover e enquadramento compartilhado sem deformação',()=>{
  assert.match(css,/object-fit:cover;/);
  assert.match(css,/object-position:var\(--portrait-position,center center\)!important/);
  assert.match(css,/\.player-character-art img/);
  assert.match(css,/\.central-avatar img/);
  assert.match(css,/\.central-character-portrait img/);
  assert.match(css,/\.scenario-mini-piece img/);
  assert.match(css,/\.board-piece>img/);
});

test('35 imagens confirmadas possuem regra de enquadramento por asset',()=>{
  for(const file of portraits){
    assert.ok(fs.existsSync(path.join(root,'frontend/assets/portraits',file)),`${file} ausente`);
    const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    assert.match(css,new RegExp(`img\\[src\\$="${escaped}"\\]\\{--portrait-position:`),`${file} sem enquadramento`);
  }
});

test('casos de corte mais sensíveis possuem focos específicos e CSS é cache-busted',()=>{
  assert.match(css,/img\[src\$="hero-thing\.webp"\]\{--portrait-position:center 80%/);
  assert.match(css,/img\[src\$="villain-elektra\.webp"\]\{--portrait-position:center 12%/);
  assert.match(css,/img\[src\$="villain-kingpin\.webp"\]\{--portrait-position:center 8%/);
  assert.match(css,/img\[src\$="hero-daredevil\.webp"\]\{--portrait-position:center 44%;--portrait-scale:1\.40/);
  assert.match(css,/img\[src\$="hero-vision\.webp"\]\{--portrait-position:center 18%;--portrait-scale:1\.25/);
  assert.match(html,/style\.css\?v=33\.4\.4-repeatable-generics/);
});
