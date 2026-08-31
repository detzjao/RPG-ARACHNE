# RPG Arachne

O **Arachne** é uma mesa virtual desenvolvida para auxiliar na organização e execução de uma campanha de RPG inspirada no universo Marvel.

A aplicação reúne fichas de personagens, informações da campanha, anotações individuais, ferramentas do Mestre e o cenário tático utilizado durante as sessões.

O projeto começou como uma aplicação totalmente em frontend e evoluiu para uma arquitetura separada em **frontend + backend + persistência de dados**, permitindo compartilhar o estado da mesa entre diferentes dispositivos e preparando a aplicação para utilizar Supabase/PostgreSQL no ambiente online.

## O que já existe no projeto

### Campanha

A aplicação possui uma área dedicada à campanha, onde ficam concentradas as informações utilizadas pelo Mestre durante a mesa.

O Mestre consegue acompanhar o progresso das sessões e consultar o PDF completo da campanha.

### Fichas de heróis

Os três personagens jogadores disponíveis atualmente são:

- Homem-Aranha — Peter Parker;
- Wolverine — James Howlett / Logan;
- Capitão América — Steve Rogers.

As fichas possuem informações como:

- Nome;
- Identidade;
- Rank;
- Health;
- Focus;
- Karma;
- velocidade;
- habilidades MARVEL;
- Powers;
- Traits;
- Tags;
- PDF completo da ficha.

#### Habilidades MARVEL

- Melee;
- Agility;
- Resilience;
- Vigilance;
- Ego;
- Logic.

### Jogadores separados por personagem

Ao entrar como **Jogador**, a aplicação pergunta qual personagem será utilizado naquela sessão:

- Homem-Aranha;
- Wolverine;
- Capitão América.

A escolha define o personagem controlado pelo jogador durante aquela sessão.

Exemplo: se o jogador entrar como **Wolverine**:

- pode visualizar a ficha do Homem-Aranha;
- pode visualizar a ficha do Capitão América;
- pode visualizar a ficha completa em PDF dos três heróis;
- pode editar somente a ficha do Wolverine;
- não recebe o botão de edição dos outros dois personagens.

O Mestre continua podendo editar qualquer ficha.

A seleção do personagem é mantida durante a sessão atual do navegador.

> Atualmente essa separação funciona como controle de permissão da aplicação. Autenticação real de usuários pode ser adicionada futuramente com Supabase Auth.

### Anotações individuais

Cada personagem possui agora seu próprio bloco de anotações.

As anotações ficam na própria página **Heróis**, abaixo das fichas.

Assim:

- Homem-Aranha possui suas próprias anotações;
- Wolverine possui suas próprias anotações;
- Capitão América possui suas próprias anotações.

O jogador só vê e edita o bloco correspondente ao personagem escolhido no login.

As anotações podem ser:

- salvas no banco;
- copiadas integralmente;
- exportadas em `.md`;
- exportadas em `.txt`;
- apagadas quando necessário.

O Mestre continua possuindo um bloco privado separado para suas próprias anotações.

### Fichas de vilões

Os vilões possuem fichas próprias e podem ser administrados pelo Mestre.

Entre os dados disponíveis estão:

- Nome;
- Identidade;
- Rank;
- Tier;
- Health máximo;
- Health atual;
- Focus máximo;
- Focus atual;
- redução de dano de Health;
- redução de dano de Focus;
- iniciativa;
- velocidade;
- ocupação;
- origem;
- equipes;
- base;
- função na campanha;
- gancho narrativo;
- habilidades MARVEL;
- Powers;
- Traits;
- Tags;
- ficha completa em PDF.

O Mestre pode alterar os valores durante a sessão conforme os acontecimentos da aventura.

### Ferramentas de dados do Mestre

O projeto possui ferramentas próprias para auxiliar durante os combates:

- D616;
- cálculo de dano;
- iniciativa;
- outros dados poliédricos.

Essas ferramentas ficam disponíveis somente para o Mestre na interface.

### Cenário

O Arachne possui um cenário tático próprio para combates e outras situações da campanha.

O Mestre possui controle sobre:

- peças dos heróis;
- peças dos inimigos;
- obstáculos;
- terreno;
- elevações;
- água;
- áreas escaláveis;
- áreas puláveis;
- movimentação baseada em Speed;
- geração de mapas;
- modelos de ambientes.

O sistema já possui diferentes tipos de ambiente, como:

- laboratório;
- garagem;
- ambiente fechado;
- sala pequena;
- sala grande;
- telhado;
- floresta;
- madeireira;
- taverna;
- ruínas;
- rua da cidade.

## Mestre e jogadores

### Mestre

O Mestre possui acesso às ferramentas administrativas da mesa, incluindo:

- edição de todos os heróis;
- edição dos vilões;
- controle da campanha;
- ferramentas de dados;
- controle do cenário;
- gerenciamento dos inimigos;
- movimentação das peças;
- controle de rodada;
- anotações privadas do Mestre.

### Jogadores

Os jogadores possuem acesso às informações necessárias para acompanhar a mesa.

Cada jogador:

- escolhe seu personagem ao entrar;
- visualiza todos os heróis;
- visualiza os PDFs das fichas;
- edita somente o personagem escolhido;
- possui anotações próprias vinculadas ao personagem.

## Tecnologias utilizadas

### Frontend

- HTML;
- CSS;
- JavaScript.

O frontend é responsável pela interface da aplicação, fichas, ferramentas visuais e interação com a API.

### Backend

- Node.js;
- JavaScript;
- API REST.

O backend recebe as requisições do frontend e realiza a persistência do estado da campanha.

### Banco de dados

O projeto possui suporte a:

- **SQLite** para desenvolvimento local;
- **Supabase/PostgreSQL** para ambiente online.

O SQL necessário para criar as tabelas no Supabase está disponível em:

```text
backend/database/supabase.sql
```

## Estrutura do projeto

```text
RPG-ARACHNE/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── api-client.js
│   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── db/
│   ├── database/
│   │   ├── schema.sqlite.sql
│   │   └── supabase.sql
│   ├── data/
│   ├── package.json
│   └── .env.example
│
├── start.bat
├── start.sh
├── .gitignore
└── README.md
```

## Como executar localmente

Entre na pasta do backend:

```bash
cd backend
```

Inicie o servidor:

```bash
npm start
```

Por padrão, a API fica disponível em:

```text
http://localhost:3000/api
```

Quando `SERVE_FRONTEND=true`, o backend também disponibiliza o frontend em:

```text
http://localhost:3000
```

## Persistência local

Durante o desenvolvimento, o projeto pode utilizar SQLite.

O banco é criado automaticamente em:

```text
backend/data/arachne.sqlite
```

O frontend também mantém cache local no navegador para reduzir o risco de perda de dados quando a API estiver temporariamente indisponível.

## Configuração do Supabase

Para utilizar Supabase, crie um projeto e execute:

```text
backend/database/supabase.sql
```

Depois copie:

```text
backend/.env.example
```

para:

```text
backend/.env
```

Configure:

```env
DB_PROVIDER=supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta
CAMPAIGN_ID=main
SERVE_FRONTEND=false
CORS_ORIGIN=*
```

A `SUPABASE_SERVICE_ROLE_KEY` é privada e nunca deve ser colocada no frontend ou enviada para o GitHub.

## Dados salvos atualmente

O backend já persiste estados como:

```text
heroes
villains
campaign
dice
challenge
scenario
initiative
playerNotes
notesMaster
```

`playerNotes` armazena as anotações separadas por personagem.

## Deploy

A arquitetura permite hospedar frontend, backend e banco separadamente.

### Frontend

Pode ser publicado em serviços como:

- Netlify;
- Vercel;
- Cloudflare Pages.

### Backend

Pode ser publicado em serviços como:

- Render;
- Railway;
- Fly.io;
- VPS próprio.

### Banco

O ambiente online pode utilizar Supabase/PostgreSQL.

```text
Jogador / Mestre
       │
       ▼
    Frontend
       │
       ▼
    Backend
       │
       ▼
   Supabase
       │
       ▼
     Banco
```

A chave `service_role` permanece apenas no backend.

## Estado atual do projeto

Atualmente o Arachne já possui:

- campanha;
- fichas completas de heróis;
- fichas de vilões;
- PDFs das fichas;
- edição de personagens;
- seleção de personagem ao entrar como jogador;
- permissão para o jogador editar somente seu personagem;
- visualização das fichas dos outros heróis;
- anotações separadas por personagem;
- exportação das anotações;
- Health;
- Focus;
- Karma;
- habilidades MARVEL;
- Powers;
- Traits;
- Tags;
- ferramentas de dados;
- cenário tático;
- mapas gerados aleatoriamente;
- movimentação baseada em Speed;
- frontend separado do backend;
- API REST;
- persistência com SQLite;
- adaptador para Supabase;
- SQL pronto para Supabase/PostgreSQL.

## Próximos passos

Algumas evoluções possíveis são:

- Supabase Auth;
- contas reais para Mestre e jogadores;
- impedir que dois jogadores escolham o mesmo personagem simultaneamente;
- salas de campanha por código;
- múltiplas campanhas;
- presença online;
- sincronização em tempo real;
- histórico de alterações;
- permissões validadas também pelo backend;
- chat da mesa;
- upload de mapas;
- upload de fichas;
- controle de iniciativa compartilhado;
- sistema de combate mais completo;
- histórico de rolagens por sessão.

## Objetivo

O objetivo do Arachne é reunir em uma única aplicação tudo o que a mesa precisa durante uma campanha: personagens, fichas, anotações, ferramentas do Mestre, campanha e cenário.

A ideia é que o Mestre consiga conduzir a sessão com controle sobre os elementos administrativos enquanto cada jogador possui sua própria identidade dentro da mesa, sua ficha editável e seu espaço individual de anotações.

O projeto continua em desenvolvimento e pode evoluir futuramente para uma plataforma de campanha completa com autenticação, salas e sincronização em tempo real.
