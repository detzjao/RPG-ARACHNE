# RPG Arachne — v33.4.7

Mesa virtual online para campanhas de **Marvel Multiverse RPG**, preservando a arquitetura existente do projeto: frontend estático, backend Node.js, persistência SQLite/Supabase, Supabase Storage para uploads e realtime por Server-Sent Events (SSE).

A **v33.4.7 / UI v42** mantém o Arachne como ferramenta de apoio de mesa e adiciona a campanha solo **Motoqueiro Fantasma — Estrada dos Condenados**: cada jogador rola pela própria ficha, ajusta Health/Focus e movimenta somente o próprio token no cenário integrado à Central; o Mestre recebe a iniciativa, o histórico geral, controla os vilões e pode movimentar qualquer peça do tabuleiro. O movimento do jogador não depende mais do turno ativo, mas propriedade do token, alcance, orçamento, terreno, obstáculos e ocupação continuam validados pelo backend.

O núcleo funcional continua preservando as frentes anteriores: Central do Mestre/Jogador, busca e persistência de imagens, performance/realtime/segurança e movimentação autoritativa. O projeto não foi recriado e não recebeu um segundo backend, banco, grid, animação D616 ou sistema realtime.


> **Iniciativa → Grid v33.3:** adicionar um participante pela preparação de iniciativa também garante seu token no cenário. O vínculo usa o mesmo identificador de personagem e o mesmo estado `scenario`; não existe um segundo grid ou sistema de tokens.

> **Ataques v33.0:** o backend gera a única D616 do ataque. O dado central é o Marvel Die; quando o ataque acerta, o dano é derivado da mesma `rollId` usando o valor efetivo do Marvel Die, o multiplicador de dano do perfil e o modificador da habilidade. Não existe mais `ROLAR DANO`, cubo de dano ou evento de histórico `DMG`.

> **Central v33.4.7 / UI v42:** o cenário aparece diretamente na Central. Cada jogador pode selecionar e mover somente o próprio token, sem bloqueio pela ordem de turnos. O backend valida sessão, campanha, propriedade, posição, modo, orçamento, terreno, obstáculos e ocupação antes de persistir. O Mestre pode selecionar e mover qualquer peça e reiniciar o orçamento de movimento pela Central.

> **Health/Focus do jogador:** na Central do Jogador, os controles `−/+` alteram somente os recursos atuais do herói vinculado à sessão. O backend rejeita alterações em outro personagem, `maxHealth`, `maxFocus` ou outros atributos, mantém os valores entre zero e o máximo da ficha e sincroniza as mudanças por SSE. Alterações efetivas são registradas no `actionHistory` com personagem, valor anterior, novo valor, autor e horário.

> **Correção v31.2:** os arquivos principais do frontend usam versionamento de URL e revalidação de cache. Isso evita o cenário em que o `index.html` novo era carregado junto com um `script.js` antigo, deixando **Central** e **Combate** sem conteúdo. A renderização desses dois painéis também foi isolada das demais áreas da interface.


## Arquitetura

```text
Jogador / Mestre
       |
       v
Frontend estático (Netlify / Vercel)
       |
       v
Backend/API Node.js (Render)
       |
       +---- SSE realtime por campanha
       |
       +---- Supabase Storage / uploads locais
       |
       v
Supabase/PostgreSQL ou SQLite
```

O navegador não recebe `SUPABASE_SERVICE_ROLE_KEY`. Permissões administrativas e validações de gameplay são feitas no backend.

## Interface de sessão

### Central do Mestre

A primeira página do Mestre funciona como uma central de controle da sessão, com acesso rápido a:

- heróis e vilões;
- rolagens;
- cenário;
- combate, iniciativa, rodada e turno;
- Health e Focus dos participantes;
- Central de Ações;
- informações da campanha;
- anotações e regras.

Os controles administrativos continuam separados dos controles de jogador.

### Central do Jogador

A primeira página do jogador apresenta:

- personagem controlado pela sessão;
- retrato, Health, Focus e iniciativa;
- estado `SEU TURNO` ou `AGUARDANDO`;
- cenário atual;
- combate e ordem atual;
- Central de Ações;
- histórico público aplicável.

O jogador visualiza o cenário e o estado da mesa sem receber os controles administrativos do Mestre.

## Polimento visual v32

A v32 usa o comportamento visual dos dados D616 como referência de interação: resposta curta, contraste claro e feedback imediato sem efeitos decorativos longos.

- botões principais possuem estados coerentes de `hover`, clique, foco e desabilitado;
- `ROLAR`, controles de Action Check e `PASSAR TURNO` recebem prioridade visual sem alterar suas funções;
- categorias de ação e poderes selecionados possuem estado ativo inequívoco;
- o participante do turno atual recebe uma transição curta quando a ordem é atualizada;
- o token selecionado recebe feedback visual curto após a atualização da posição;
- resultados de rolagem usam entrada curta e diferenciação de sucesso/falha já existente;
- breakpoints adicionais evitam ações espremidas em notebook e telas menores;
- `prefers-reduced-motion: reduce` desativa animações/transições decorativas;
- a pulsação contínua antiga de botões administrativos foi removida.

A implementação desta etapa está concentrada em CSS; não há polling, timers ou loops JavaScript novos para os efeitos da v32.

## Dados do Mestre e ataques v33.0

A aba **Dados do Mestre** é o registro central das rolagens. Ela mantém D616, histórico, iniciativa e dados genéricos, mas não possui mais uma aba ou cubo separado de dano.

Para ataques:

1. o frontend solicita uma D616 ao backend;
2. o backend gera os três dados e conserva o Marvel Die como o segundo valor da mesma rolagem;
3. a animação D616 existente apenas apresenta os valores retornados pelo servidor;
4. o total do teste é comparado ao TN/Defesa informado;
5. em caso de sucesso, o backend deriva o dano da mesma rolagem;
6. o histórico registra teste, Marvel Die e dano sob a mesma `rollId` e o mesmo evento `D616`.

A fórmula implementada preserva os perfis já existentes no projeto: `Marvel Die efetivo × multiplicador de dano + modificador da habilidade`. Quando o Marvel Die mostra `M` (valor bruto `1`), seu valor efetivo continua sendo `6`. O multiplicador adicional de Fantastic Success já existente foi preservado. Em falha, não é produzido dano calculado.

### Ataque e aplicação de dano pela Central v33.2

A Central do Mestre passa a resolver o ataque ponta a ponta sem sair da mesa principal:

1. o Mestre escolhe atacante, ação e alvo;
2. informa o TN/Defesa usando o mesmo campo de dificuldade já existente no sistema;
3. o backend valida os participantes e gera uma única D616;
4. a mesma `ArachneDiceAnimation` apresenta os três resultados reais;
5. a resposta mostra total, TN/Defesa, sucesso/falha, Marvel Die, multiplicador e dano calculado;
6. em um ataque bem-sucedido, `APLICAR DANO` envia apenas a `rollId`;
7. o backend reabre a entrada persistida, recalcula o dano com a mesma `damageFromRoll`, valida o alvo e aplica o valor uma única vez em Health ou Focus;
8. a alteração de recurso é distribuída pelo SSE já existente.

O frontend não envia o valor final do dano ao endpoint de aplicação. A própria entrada D616 do histórico recebe alvo, dano calculado e, após a aplicação, recurso afetado, valor aplicado e recursos antes/depois. Não é criado um evento de dados adicional.

## Personagens

A biblioteca embarcada contém **53 personagens** (26 heróis e 27 vilões/ameaças). Os 53 retratos locais estão referenciados e disponíveis em `frontend/assets/portraits/`.

**Retratos oficiais confirmados pelo usuário (patch 33.4.1):** 35 personagens receberam os arquivos fornecidos diretamente no projeto, associados pelos IDs internos (`character_id`/`id`) aos mesmos caminhos canônicos de `CHARACTER_ASSETS`. Foram atualizados 18 heróis e 17 vilões. Como os caminhos existentes foram preservados, fichas, Central, listas, combate/iniciativa e tokens que já apontavam para esses assets passam a usar as novas imagens sem criar outro sistema de armazenamento ou alterar regras/fichas.

As fichas armazenam, conforme o personagem:

- nome e identidade;
- Rank/Tier;
- Health e Focus;
- Karma;
- iniciativa;
- Melee, Agility, Resilience, Vigilance, Ego e Logic;
- movimento;
- redução de dano quando cadastrada;
- origem, ocupação, equipes e base;
- Powers, Traits e Tags;
- imagem;
- ficha em PDF quando disponível.

A atualização completa da ficha continua exclusiva do Mestre. O jogador pode ajustar somente `currentHealth` e `currentFocus` do próprio herói pelo endpoint dedicado de recursos; não pode alterar `maxHealth`, `maxFocus`, atributos, iniciativa, imagem, outro herói ou vilão.

## Sistema de imagens

### Retratos locais

O acervo local utiliza WebP e é servido diretamente por `frontend/assets/portraits/`. A auditoria v31.1 havia reduzido o pacote anterior para 2.928.394 bytes. No patch 33.4.1, **35 desses retratos foram substituídos exatamente pelos arquivos confirmados pelo usuário**, sem gerar, pesquisar ou recomprimir as imagens enviadas.

Estado atual do acervo:

- retratos locais: **53**;
- retratos substituídos pelo lote confirmado: **35**;
- tamanho atual dos 53 retratos: **4.098.026 bytes**;
- retratos acima de 500 KB: **0**;
- referências de retrato em templates: **53**;
- referências ausentes: **0**.

A interface usa carregamento preguiçoso/decodificação assíncrona onde aplicável e reutiliza a imagem persistida em vez de pesquisar novamente a cada tela ou evento realtime.

### Busca web de imagens

Somente o Mestre pode abrir `🔎 BUSCAR IMAGEM`.

Fluxo:

```text
Personagem
  -> pesquisar candidatos na web
  -> visualizar fonte / dimensão / licença disponível
  -> Mestre escolhe
  -> backend importa a imagem
  -> Storage/uploads existente recebe uma cópia
  -> URL persistente é salva no personagem
  -> cards, ficha, combate e Central reutilizam essa URL
```

A pesquisa automática consulta fontes públicas indexáveis:

- Wikimedia Commons;
- Wikipedia;
- Openverse.

A interface também fornece atalho para a busca oficial da Marvel e permite importar uma URL HTTPS confiável. Nenhuma imagem é gerada por IA e a seleção final nunca é automática.

### Proteção na importação remota

A importação de URL implementa proteções para não transformar o backend em um proxy arbitrário:

- apenas HTTPS;
- bloqueio de localhost e endereços privados;
- resolução DNS antes do download;
- limite de redirecionamentos;
- timeout;
- limite de 12 MB para imagem remota;
- MIME restrito a JPEG, PNG e WebP.

Uploads normais continuam aceitando PDF, PNG, JPEG e WebP no limite configurado pelo backend.

## Central de Ações e D616

A Central usa a ficha armazenada em vez de exigir que o jogador digite valores que o sistema já conhece.

Categorias:

- **Combate**;
- **Testes**;
- **Poderes**;
- **Movimento**.

A rolagem D616 definitiva acontece no backend com `crypto.randomInt`.

- o dado central é o Marvel Die;
- `1` no Marvel Die é exibido como `M` e vale 6 no total;
- `6 · M · 6` é reconhecido como Ultimate Fantastic Success;
- TN e habilidade autoritativos são obtidos do estado/ficha no backend para jogadores;
- o frontend não escolhe os valores finais dos dados.

Edge/Trouble continuam seguindo a implementação já existente no projeto, sem convertê-los em simples +1/-1.

## Combate, iniciativa e turnos

O estado de combate é persistido por campanha e inclui:

- ativo/inativo;
- rodada;
- índice do turno;
- participantes;
- iniciativa;
- imagem e recursos usados na apresentação da ordem.

O Mestre pode iniciar/encerrar combate, passar turno, ajustar iniciativa, administrar participantes, Health e Focus. Na preparação, Capangas e ameaças com `tier: LACAIO` podem ser adicionados em múltiplas instâncias; personagens únicos continuam limitados a uma entrada.

Na preparação de combate, a iniciativa é rolada diretamente na Central com a mesma animação D616 do sistema. O backend gera os três dados, aplica o modificador armazenado na ficha, persiste o resultado e reordena os participantes por total, modificador e nome. O botão **ROLAR INICIATIVAS** atua somente sobre participantes ainda sem resultado. Personagens únicos não podem ser adicionados duas vezes; Capangas, Agente da Hydra, Agente da I.M.A. e demais ameaças classificadas como `LACAIO` são instâncias repetíveis, cada uma com participante e token próprios no grid.

Durante combate, ações normais de jogador são bloqueadas no backend quando não é o turno do personagem vinculado à sessão. A interface apresenta `AGUARDANDO` e identifica o participante atual.

Powers em formato apenas textual não recebem custos ou efeitos inventados. Reações automáticas exigem metadados estruturados existentes.

## Realtime / SSE

O projeto continua usando **uma arquitetura SSE**, sem WebSocket adicional.

A v31.1:

- indexa conexões por campanha;
- substitui a conexão anterior do mesmo cliente/sessão;
- limpa assinantes encerrados;
- envia heartbeat controlado;
- não hidrata novamente toda a aplicação ao receber o evento `ready`;
- aplica eventos de estado por chave, atualizando somente as áreas relacionadas;
- não retransmite para o próprio `sourceClientId` quando a alteração já foi aplicada localmente.

Health, Focus, combate, iniciativa, cenário, histórico, notas e demais estados permitidos continuam sincronizados sem remover realtime.

## Performance

Problemas confirmados e tratados na auditoria:

### Carregamento inicial

O fluxo de entrada realizava hidratação/renderização e podia disparar uma nova hidratação ao abrir o SSE. O evento `ready` agora apenas marca o realtime como online.

### Consultas de campanhas

A consulta de múltiplas campanhas/rosters foi agrupada:

- `getCampaignsByCodes` busca códigos em lote;
- `getManyCampaignStates` busca `heroes`/`campaignContent` para várias campanhas numa única operação por repositório.

Isso evita a sequência `campanha -> heroes -> conteúdo` repetida para cada item do hub.

### Concorrência de gravações

As mutações são serializadas **por `campaignId`**, e não por uma fila global. Alterações numa campanha não precisam esperar mutações de outra mesa.

### Frontend

O cliente possui deduplicação de requisições GET em andamento/cache curto para dados apropriados. Atualizações SSE chamam renderizações específicas por chave, e o cenário pesado só é montado quando a página correspondente precisa do tabuleiro.

### Imagens

A maior redução mensurável desta versão foi no peso dos retratos locais: aproximadamente **87,8%**.

Não foram inventados tempos de rede ou latência do Render/Supabase. Cold start e latência externa continuam dependentes do ambiente de deploy.

## Segurança

A autoridade de ações sensíveis permanece no backend.

O backend impede que um jogador:

- edite uma ficha completa;
- altere Health ou Focus de outro personagem, ou ultrapasse os limites da própria ficha;
- altere imagem;
- altere iniciativa ou participantes;
- controle outro personagem usando `actorId` adulterado;
- forneça os dados definitivos de uma rolagem;
- forneça TN autoritativo para a própria ação;
- execute ação normal fora do próprio turno;
- acesse estado de outra campanha com o token atual.

Sessões são tokens HMAC assinados contendo role, `heroId` quando aplicável, `campaignId`, código, expiração e session id.

## Isolamento entre campanhas

Estado persistente usa chave por `campaign_id`. SSE, personagens, imagens, cenário, combate e notas permanecem vinculados à campanha da sessão.

Nenhuma nova tabela foi necessária para a v31.1.

## Banco de dados

Tabelas existentes:

```text
campaigns
app_state
```

`app_state` usa chave composta por `campaign_id` + `state_key`.

Estados usados incluem, entre outros:

```text
heroes
villains
campaign
campaignContent
dice
challenge
scenario
initiative
combat
actionHistory
playerNotes
notesPlayer
notesMaster
```

O schema de banco não precisou mudar para o sistema de imagens: a URL persistente permanece no objeto do personagem e o binário usa o sistema de uploads/Storage já existente.

## Estrutura do projeto

```text
RPG-ARACHNE/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── api-client.js
│   ├── config.js
│   └── assets/
│       ├── portraits/
│       └── pdfs/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── gameplay.js
│   │   ├── image-search.js
│   │   ├── files.js
│   │   ├── templates.js
│   │   ├── auth.js
│   │   └── db/
│   ├── tests/
│   │   ├── api.test.js
│   │   └── gameplay.test.js
│   ├── database/
│   │   ├── supabase.sql
│   │   └── schema.sqlite.sql
│   └── package.json
├── AUDIT_V31.1.md
├── CHANGELOG.md
├── CHARACTER_COVERAGE.md
├── README.md
├── netlify.toml
├── render.yaml
└── start.*
```

## Executar localmente

Requer Node.js **22.5+**.

```bash
cd backend
npm start
```

Com `SERVE_FRONTEND=true`, abra:

```text
http://localhost:3000
```

### Testes

```bash
cd backend
npm test
```

Validação automatizada da v33.4 no pacote entregue:

```text
79 testes
79 aprovados
0 falhas
```

A suíte cobre health/versionamento, sanitização de jogador, proteção de ficha/recursos, ajustes de `currentHealth`/`currentFocus` pelo próprio jogador, limites 0..máximo, recursos do Mestre, persistência, `actionHistory`, sincronização SSE com Mestre e outros jogadores, TN e habilidade autoritativos, movimentação do próprio token sem bloqueio por turno no modo de apoio, isolamento entre campanhas, permissões de imagens, D616, Central do Mestre, movimentação do grid com Mestre + dois jogadores e os contratos visuais da v32. A v33.0 acrescentou o ataque com uma única D616 e dano derivado; a v33.1 acrescentou iniciativa D616 server-side; a v33.2 cobre aplicação autoritativa de dano; a v33.3 valida iniciativa → grid; a v33.4 mantém essas frentes enquanto adiciona movimentação autoritativa e ajuste seguro de Health/Focus do próprio herói; a v33.4.4 permite múltiplas instâncias de ameaças genéricas/LACAIOS na preparação sem duplicar personagens únicos; a v33.4.5 integra o cenário à Central de apoio, mantendo a posse de tokens e liberando o Mestre para controlar todas as peças; e a v33.4.6 faz rolagens de COMBATE calcularem e exibirem o dano da ficha sem selecionar ou afetar um alvo. A v33.4.7 adiciona a campanha solo do Motoqueiro Fantasma, suas fichas/PDFs e uma Central Solo única para Johnny e inimigos.

## Variáveis de ambiente

Base: `backend/.env.example`.

```env
PORT=3000
SERVE_FRONTEND=true
CORS_ORIGIN=*
DB_PROVIDER=supabase

MASTER_PASSWORD=troque-esta-senha
SESSION_SECRET=uma-chave-longa-e-aleatoria
SESSION_TTL_HOURS=24

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_STORAGE_BUCKET=arachne-assets
```

SQLite local:

```env
DB_PROVIDER=sqlite
SQLITE_FILE=./data/arachne.sqlite
```

## Deploy

### Backend — Render

`render.yaml` configura:

```text
Root Directory: backend
Start Command: npm start
Health Check: /api/health
```

O health endpoint da versão atual informa `version: 33.0`, `realtime: sse`, suporte multi-campanha, uploads e image search.

### Frontend — Netlify/Vercel

`netlify.toml` publica `frontend/`, mantém proxy `/api/*` para o backend Render padrão e habilita cache de assets estáticos.

`frontend/config.js` mantém a resolução de API já existente no projeto.

## Página de Regras

A página de Regras permanece no frontend. Ela documenta as mecânicas efetivamente implementadas, incluindo que ataques usam uma única D616 e que o dano deriva do Marvel Die dessa mesma rolagem. Não cria fórmulas inexistentes para defesa, Powers ou reações.

## Limitações conhecidas

- a qualidade/quantidade de candidatos da busca web depende da disponibilidade das fontes externas;
- a busca oficial Marvel é aberta como link, pois não existe neste projeto uma API oficial Marvel autenticada para busca de imagens;
- cold start do Render e latência externa de Supabase/DNS não podem ser eliminados somente por código do frontend;
- não há fórmula estruturada de defesa automática por alvo;
- Powers armazenados apenas como texto não aplicam custo/efeito automaticamente;
- o movimento do jogador depende de combate ativo e do próprio turno; fora dele o backend bloqueia a ação;
- o ambiente usado na auditoria não permitiu uma bateria automatizada de navegador real, portanto a validação entregue combina testes HTTP/backend, checagem sintática e inspeção estrutural do frontend.

Para o relatório técnico detalhado da auditoria, consulte `AUDIT_V31.1.md`.


## Otimização de imagens v33.4.3

O banco não armazena arquivos/BLOBs de imagem: personagens mantêm apenas o caminho/URL em `image`. Retratos oficiais ficam em `frontend/assets/portraits`, enquanto uploads continuam usando o Supabase Storage existente (ou `backend/uploads` no modo local). A v33.4.3 adiciona thumbnails de até 320 px para avatares/tokens, cache versionado/imutável e deduplicação SHA-256 para novos uploads de imagem. Consulte `IMAGE_AUDIT_V33.4.3.md` para as medições.
