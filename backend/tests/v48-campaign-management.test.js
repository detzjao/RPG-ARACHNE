import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'../..');
const app=fs.readFileSync(path.join(root,'frontend/src/app.js'),'utf8');
const api=fs.readFileSync(path.join(root,'frontend/src/api.js'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');

test('v48 restaura criação de campanha com seleção de heróis e vilões',()=>{
  assert.match(app,/Campanha vazia/);
  assert.match(app,/createHeroIds/);
  assert.match(app,/createVillainIds/);
  assert.match(app,/toggleCreationCharacter/);
  assert.match(app,/3 · PERSONAGENS/);
  assert.match(app,/heroIds:\[\.\.\.new Set\(this\.state\.createHeroIds\)\]/);
  assert.match(app,/villainIds:\[\.\.\.new Set\(this\.state\.createVillainIds\)\]/);
});

test('v48 restaura edição completa da campanha e gerenciamento de roster',()=>{
  assert.match(app,/function CampaignEditor/);
  assert.match(app,/EDITAR CAMPANHA/);
  assert.match(app,/\+ ADICIONAR/);
  assert.match(app,/CharacterPickerModal/);
  assert.match(app,/CharacterEditorModal/);
  assert.match(app,/CRIAR DO ZERO/);
  assert.match(api,/async function deleteHero/);
  assert.match(api,/async function deleteVillain/);
  assert.match(api,/async function uploadAsset/);
});

test('v48 edição e remoção de personagens mantém cenário coerente',()=>{
  assert.match(server,/broadcastState\(campaignId,'scenario',result\.scenario/);
  assert.match(server,/String\(piece\?\.characterId\|\|piece\?\.baseId\|\|''\)===heroId/);
  assert.match(server,/String\(piece\?\.characterId\|\|piece\?\.baseId\|\|''\)===villainId/);
  assert.match(server,/removedPieceIds/);
  assert.match(server,/initiative=.*filter/);
});

test('v48 cenário usa board memoizado, carga no próximo frame e edição agrupada',()=>{
  assert.match(app,/const MemoBoard=React\.memo/);
  assert.match(app,/requestAnimationFrame/);
  assert.match(app,/queueScenarioSave\(next\)/);
  assert.match(app,/const occupied=new Set/);
  assert.doesNotMatch(app,/className:'move-cost'/);
});
