# RPG Arachne Backend — v33.5

API Node.js sem framework, compatível com SQLite ou Supabase/PostgreSQL. É responsável por autenticação, campanhas, estado, gameplay D616, combate, SSE, uploads e busca/importação de imagens.

## Execução

```bash
npm start
```

Testes:

```bash
npm test
```

A suíte atual inclui regressões do backend, iniciativa → grid, ameaças genéricas repetíveis, movimentação autoritativa, Mestre + dois jogadores, renovação de orçamento por turno, sincronização SSE e as etapas anteriores. A API/health reporta versão 33.5.0.

## Funções principais

- campanhas isoladas por `campaign_id`;
- sessões assinadas para Mestre/jogador;
- estado persistente em `app_state`;
- D616 autoritativo no servidor;
- ataques resolvidos pela mesma D616, com dano derivado do Marvel Die e perfil de dano no backend;
- combate/turno/recursos com validação do Mestre;
- iniciativa D616 autoritativa, com modificador resolvido da ficha, ordenação, bloqueio de duplicados para personagens únicos e múltiplas instâncias para Capangas/ameaças `LACAIO`, sincronizadas com `scenario.pieces`;
- SSE por campanha;
- upload local ou Supabase Storage;
- pesquisa de imagens em fontes públicas e importação segura de URL.

## Endpoints relevantes

```text
GET   /api/health
GET   /api/events
POST  /api/actions/d616/start
POST  /api/actions/d616/:id/edge
POST  /api/actions/d616/:id/finalize
POST  /api/actions/d616/:id/apply-damage
POST  /api/initiative/participants
DELETE /api/initiative/participants
DELETE /api/initiative/participants/:id
POST  /api/initiative/roll
GET   /api/images/search
PUT   /api/characters/hero/:id/image
PUT   /api/characters/villain/:id/image
PATCH /api/characters/hero/:id/resources
PATCH /api/characters/villain/:id/resources
POST  /api/assets/upload
```

A lista completa de rotas e regras de autorização está em `src/server.js`.

Nenhuma Service Role do Supabase deve ser enviada ao frontend.

## Aplicação autoritativa de dano v33.2

`POST /api/actions/d616/:id/apply-damage` é exclusivo do Mestre e não aceita o valor final de dano como autoridade. A rota localiza a mesma entrada D616 finalizada, reconstrói o ataque persistido, recalcula o dano com `damageFromRoll`, valida o alvo gravado na `rollId`, impede aplicação duplicada e só então altera Health ou Focus. A atualização é persistida no histórico original e distribuída pelos eventos `state` do SSE existente.

## Movimentação v33.4

`PATCH /api/scenario/move` continua sendo o único endpoint de movimento. Para jogador, o backend resolve o token pelo `heroId` da sessão e pelo `characterId/baseId` da peça, valida turno, posição esperada, destino, ocupação, terreno, obstáculos, modo e orçamento. O início do turno limpa somente o orçamento daquele participante. O Mestre continua autorizado a movimentar qualquer peça.
