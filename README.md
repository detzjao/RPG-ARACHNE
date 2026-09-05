# Projeto Arachne

**Arachne** é uma ferramenta de apoio para mesas de **Marvel Multiverse RPG**, criada para concentrar fichas, rolagens, iniciativa e cenário em uma interface simples e rápida.

A proposta não é substituir a mesa nem automatizar o RPG inteiro. O sistema serve como uma central de apoio: cada jogador controla seu personagem, o Mestre administra a sessão e o grupo continua tomando as decisões e resolvendo a narrativa normalmente.

## Principais recursos

### Central do Jogador

O jogador encontra em uma única tela tudo o que precisa durante a sessão:

- personagem vinculado à sessão;
- retrato e acesso rápido à ficha;
- controle de **Health** e **Focus**;
- rolagens **D616**;
- ajuste de **TN**, **Edge** e **Trouble**;
- ações de **Combate**, **Testes**, **Poderes** e **Movimento**;
- dano informativo calculado pela ficha, sem selecionar ou afetar um alvo;
- cenário integrado à Central;
- movimentação da própria peça no grid.

### Central do Mestre

O Mestre utiliza a mesma lógica de interface dos jogadores, com controles adicionais de sessão:

- selecionar e controlar heróis, vilões e capangas;
- rolar ações usando a ficha do personagem selecionado;
- alterar Health e Focus dos personagens;
- definir TN, Edge e Trouble;
- rolar e organizar a iniciativa inicial;
- consultar o histórico completo de rolagens da sessão;
- visualizar e movimentar qualquer peça no cenário;
- abrir fichas diretamente pela Central.

### D616

As rolagens utilizam o sistema D616 do projeto e são resolvidas pelo backend.

- três dados são gerados pelo servidor;
- o dado central é o **Marvel Die**;
- o valor `1` do Marvel Die é apresentado como `M` e vale `6` no cálculo;
- Edge e Trouble utilizam a mecânica própria de rerrolagem do sistema;
- a animação dos dados apenas apresenta os resultados recebidos do backend;
- rolagens de combate podem exibir o dano da ficha como referência, sem aplicação automática em outro personagem.

## Cenário tático

O Arachne possui um cenário integrado à Central.

O Mestre pode montar mapas, posicionar peças e editar elementos do grid. O jogador visualiza o mesmo cenário em tempo real e movimenta apenas a própria peça.

Ao selecionar uma peça, o sistema destaca as casas que podem ser alcançadas de acordo com as informações da ficha e com o estado atual do mapa.

O cálculo considera, quando aplicável:

- alcance de movimento;
- movimento já utilizado;
- Run, Climb, Swim e outros modos disponíveis na ficha;
- terreno;
- água;
- elevação;
- obstáculos;
- ocupação por outras peças.

### Montador de cenário

A área do Mestre permite:

- definir tamanho do grid;
- escolher ambientes e modelos de mapa;
- pintar tipos de terreno;
- adicionar obstáculos e elementos de cenário;
- adicionar heróis, vilões e capangas;
- criar múltiplas instâncias de ameaças genéricas;
- reposicionar ou remover peças.

O cenário usado pelo montador, pela Central do Mestre e pela Central dos jogadores é o mesmo estado sincronizado pelo backend.

## Personagens e fichas

O projeto possui uma biblioteca de heróis, vilões e ameaças com informações utilizadas diretamente nas Centrais.

As fichas podem conter:

- Rank;
- Health e Focus;
- Karma;
- iniciativa;
- Melee, Agility, Resilience, Vigilance, Ego e Logic;
- movimentos;
- Powers;
- Traits;
- Tags;
- retrato;
- PDF da ficha, quando disponível.

O Mestre possui controle administrativo das fichas. Jogadores podem alterar apenas os recursos e ações permitidos para o personagem vinculado à própria sessão.

## Campanhas

O Arachne suporta campanhas separadas, cada uma com seu próprio estado de sessão, personagens, cenário, iniciativa e histórico.

O projeto também inclui a campanha solo:

**Motoqueiro Fantasma — Estrada dos Condenados**

Ela possui uma Central Solo própria para controlar Johnny Blaze e os personagens da campanha sem exigir alternância entre Mestre e Jogador.

## Stack

### Frontend

- React
- Tailwind CSS
- Vite para desenvolvimento
- JavaScript

### Backend

- Node.js
- API HTTP
- Server-Sent Events (SSE) para sincronização em tempo real

### Persistência

O backend suporta:

- SQLite para execução local;
- Supabase/PostgreSQL para ambiente online;
- Supabase Storage ou armazenamento local para uploads.

## Arquitetura

```text
Jogador / Mestre
       │
       ▼
Frontend React + Tailwind
       │
       ▼
Backend Node.js / API
       │
       ├── D616 e regras autoritativas
       ├── SSE em tempo real
       ├── sessões e permissões
       └── uploads
       │
       ▼
SQLite ou Supabase
```

Regras importantes e operações administrativas são validadas no backend. Credenciais privadas do Supabase não devem ser enviadas ao navegador.

## Estrutura do projeto

```text
RPG-ARACHNE/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── database/
│   ├── data/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── styles/
│   ├── assets/
│   ├── vendor/
│   ├── scripts/
│   ├── index.html
│   └── package.json
│
├── render.yaml
├── netlify.toml
└── README.md
```

## Rodando localmente

### Requisitos

- **Node.js 22.5 ou superior**
- npm

### 1. Configurar o backend

Entre na pasta:

```bash
cd backend
```

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows, você também pode simplesmente duplicar `.env.example` e renomear a cópia para `.env`.

Para executar localmente com SQLite, a configuração básica é:

```env
PORT=3000
SERVE_FRONTEND=true
DB_PROVIDER=sqlite
SQLITE_FILE=./data/arachne.sqlite
MASTER_PASSWORD=troque-esta-senha
SESSION_SECRET=troque-por-uma-chave-longa-e-aleatoria
```

Instale as dependências e inicie:

```bash
npm install
npm start
```

Com `SERVE_FRONTEND=true`, o próprio backend serve a aplicação web.

Abra:

```text
http://localhost:3000
```

### Desenvolvimento do frontend

Para trabalhar na interface com Vite:

```bash
cd frontend
npm install
npm run build:css
npm run dev
```

O backend deve continuar ativo para atender às chamadas da API.

## Testes

### Backend

```bash
cd backend
npm test
```

### Verificação do frontend

```bash
cd frontend
npm run check
```

## Banco de dados

### SQLite

É a opção padrão para desenvolvimento local e não exige serviço externo.

```env
DB_PROVIDER=sqlite
SQLITE_FILE=./data/arachne.sqlite
```

### Supabase

Para produção, configure:

```env
DB_PROVIDER=supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_STORAGE_BUCKET=arachne-assets
```

A `SUPABASE_SERVICE_ROLE_KEY` deve existir somente no backend.

## Deploy

O repositório já contém configurações para os ambientes usados pelo projeto.

### Render

`render.yaml` configura o backend Node.js, health check e variáveis principais.

### Netlify

`netlify.toml` publica o frontend e encaminha `/api/*` para o backend configurado.

Antes de publicar, revise as URLs e variáveis de ambiente para que apontem para a sua própria infraestrutura.

## Segurança

O projeto mantém no backend operações que não devem ser confiadas ao navegador, incluindo autenticação de sessão, permissões administrativas, regras de movimentação e geração das rolagens D616.

Nunca publique em código cliente:

- `SUPABASE_SERVICE_ROLE_KEY`;
- `SESSION_SECRET`;
- senha do Mestre;
- outras credenciais privadas.

## Documentação de desenvolvimento

O histórico técnico e as mudanças entre versões ficam nos arquivos de **CHANGELOG** e auditoria do projeto. O README principal é mantido apenas como documentação do estado atual do Arachne.
