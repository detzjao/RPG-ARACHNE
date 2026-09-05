import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compile} from 'tailwindcss';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const tailwindRoot=path.dirname(new URL(import.meta.resolve('tailwindcss')).pathname);
const tailwindCss=path.resolve(tailwindRoot,'../index.css');
const sourceFiles=[path.join(root,'src/app.js'),path.join(root,'index.html')];
const text=sourceFiles.map(file=>fs.readFileSync(file,'utf8')).join('\n');
const quoted=[...text.matchAll(/(['"`])([^'"`\\]*(?:\\.[^'"`\\]*)*)\1/g)].map(m=>m[2]);
const candidates=new Set();
for(const value of quoted){
  for(const token of value.split(/\s+/)){
    if(token && token.length<220 && /^[!@A-Za-z0-9_:\-./%#\[\](),&]+$/.test(token)) candidates.add(token);
  }
}
const input='@import "tailwindcss";';
const compiler=await compile(input,{base:root,loadStylesheet:async()=>({content:fs.readFileSync(tailwindCss,'utf8'),base:path.dirname(tailwindCss)})});
const css=compiler.build([...candidates]);
fs.mkdirSync(path.join(root,'styles'),{recursive:true});
fs.writeFileSync(path.join(root,'styles/tailwind.css'),css);
console.log(`Tailwind: ${candidates.size} candidatos -> ${(Buffer.byteLength(css)/1024).toFixed(1)} KB`);
