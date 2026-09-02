# RPG Arachne v20

Mesa virtual online para campanhas de **Marvel Multiverse RPG**.

A versão atual muda a arquitetura de criação de campanhas: novas mesas não clonam mais automaticamente o Projeto Arachne. O Mestre escolhe como a campanha será criada e depois pode editar elenco, fichas, PDF e sessões sem modificar os modelos originais.

## Criação de campanha

Ao criar uma mesa existem três modos:

- **Campanha pronta** — cria uma cópia editável de um template.
- **Em branco** — começa sem heróis, vilões ou sessões.
- **Importar PDF** — cria uma campanha vazia e envia o PDF do narrador para a mesa.

## Campanhas prontas incluídas

- Projeto Arachne
- Os Vingadores — Protocolo Destino
- X-Men — Era do Apocalipse
- Quarteto Fantástico — A Zona Negativa
- Sombras de Hell's Kitchen

Os templates guardam estrutura, elenco recomendado, antagonistas e sessões. Ao iniciar uma campanha, o backend cria uma cópia independente. Alterar a cópia não altera o template.

## Elenco editável

Na página **Campanha > Configurar campanha**, o Mestre pode:

- adicionar/remover heróis;
- adicionar/remover vilões;
- usar personagens presentes nas campanhas prontas;
- criar um personagem do zero;
- editar atributos completos;
- enviar imagem do personagem;
- enviar ficha em PDF.

A lista de personagens disponíveis na tela de entrada do jogador agora é gerada pelo elenco real daquela campanha. O jogador continua podendo editar somente o personagem escolhido.

## Conteúdo da campanha

O Mestre pode:

- editar título, subtítulo e resumo;
- escrever o conteúdo da campanha dentro do sistema;
- enviar ou trocar o PDF da campanha;
- criar, editar e remover sessões;
- acompanhar o progresso das sessões.

## Uploads

Tipos aceitos:

- PDF
- PNG
- JPEG
- WebP

Limite atual por arquivo: **30 MB**.

### SQLite/local

Os arquivos são guardados em:

```text
backend/uploads/
```

### Supabase

Quando `DB_PROVIDER=supabase`, os arquivos são enviados para o Supabase Storage. O backend usa a Service Role e prepara automaticamente o bucket público configurado em:

```env
SUPABASE_STORAGE_BUCKET=arachne-assets
```

A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para o frontend.

## Estrutura

```text
projeto-arachne-v20/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── api-client.js
│   └── assets/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── templates.js
│   │   ├── files.js
│   │   ├── auth.js
│   │   └── db/
│   ├── database/
│   └── package.json
├── render.yaml
├── netlify.toml
└── README.md
```

## Rodar localmente

```bash
cd backend
npm start
```

Abra:

```text
http://localhost:3000
```

Evite abrir `frontend/index.html` diretamente quando quiser testar login, uploads, sincronização e múltiplas campanhas.

## Supabase

Variáveis principais:

```env
DB_PROVIDER=supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta
SUPABASE_STORAGE_BUCKET=arachne-assets
SESSION_SECRET=uma-chave-grande-e-aleatoria
SERVE_FRONTEND=true
CORS_ORIGIN=*
```

Execute `backend/database/supabase.sql` no SQL Editor antes do primeiro deploy.

## O que continua sincronizado

Cada campanha mantém estado independente para:

- heróis;
- vilões;
- Health e Focus;
- campanha e progresso;
- cenário e peças;
- iniciativa;
- rolagens e histórico;
- anotações dos jogadores;
- anotações do Mestre.

O realtime continua usando SSE por campanha.


## Atualizações v26
- Continuei a biblioteca visual e substituí artes de Luke Cage, Barão Zemo e Encantadora por recortes melhores.
- Enriqueci as fichas dos personagens adicionais com mais dados: role, hook, movement, powers, traits, tags e estatísticas completas.
- Regenerei os PDFs das fichas atualizadas para esses heróis e vilões extras.


## Atualizações v28
- Auditoria da biblioteca contra os perfis destacados do Core Rulebook.
- Primeiro lote de expansão oficial: Pantera Negra, Capitã Marvel, Doutor Estranho, Hulk, Gavião Arqueiro, Feiticeira Escarlate, Shang-Chi, Mulher-Hulk, Visão e Máquina de Combate.
- Cada novo personagem recebeu ficha de dados completa, powers, traits, tags, portrait card e PDF próprio.
- APP_VERSION atualizado para 27.


## Correção v28 — Biblioteca completa
- A tela **+ Adicionar** agora usa `/api/characters` e mostra todos os personagens cadastrados na biblioteca, mesmo quando eles não pertencem a nenhum template de campanha.
- Os novos heróis da v27 (Pantera Negra, Capitã Marvel, Doutor Estranho, Hulk, Gavião Arqueiro, Feiticeira Escarlate, Shang-Chi, Mulher-Hulk, Visão e Máquina de Combate) passam a aparecer normalmente no seletor.
- A criação de campanhas também usa a biblioteca completa.


## Netlify + Render — conexão da API (v29)

O frontend hospedado no Netlify não pode acessar o banco Supabase diretamente. Ele sempre deve falar com o backend Node hospedado no Render.

A v29 tenta automaticamente o backend correspondente ao nome do site e também permite configurar manualmente a URL do Render na própria tela inicial. Exemplo: `https://rpg-arachne.onrender.com/api`. A URL escolhida fica salva no navegador.

Se campanhas, templates, heróis e vilões aparecerem vazios, abra a caixa **CONEXÃO ONLINE** da tela inicial e cole a URL pública do serviço Render. O endpoint `<URL>/api/health` deve responder com `ok: true`.
