# Projeto Arachne v11 — Frontend + Backend

A versão 11 separa o projeto em duas partes principais:

```text
projeto-arachne-v11/
├── frontend/
└── backend/
```

## 1. Frontend

Contém toda a interface já existente: heróis, vilões, PDFs, campanha, dados, iniciativa, dano e montador de cenário.

O frontend mantém `localStorage` como **cache local**, mas agora sincroniza automaticamente o estado com a API do backend.

## 2. Backend

Backend em JavaScript puro para Node.js 22.5+.

- API REST em `http://localhost:3000/api`
- SQLite local por padrão
- banco criado automaticamente em `backend/data/arachne.sqlite`
- adaptador pronto para Supabase
- sem dependências obrigatórias para rodar localmente

## Rodar

No terminal:

```bash
cd backend
npm start
```

Depois abra:

```text
http://localhost:3000
```

O próprio backend serve a pasta `frontend/` por padrão.

## Banco atual

O estado da campanha é salvo por chave no banco:

- heroes
- villains
- campaign
- dice
- challenge
- scenario
- initiative
- notesPlayer
- notesMaster

Isso permite migrar o sistema atual sem perder as funcionalidades da v10 e deixa o frontend desacoplado do provedor de banco.

## Migrar para Supabase depois

1. Crie um projeto Supabase.
2. Execute `backend/database/supabase.sql` no SQL Editor.
3. Copie `backend/.env.example` para `backend/.env`.
4. Configure:

```env
DB_PROVIDER=supabase
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

5. Reinicie o backend.

Nenhuma alteração no frontend é necessária.

## Próxima evolução recomendada

A arquitetura já deixa espaço para:

- Supabase Auth;
- contas separadas para Mestre e jogadores;
- campanhas múltiplas;
- sincronização em tempo real;
- permissões para impedir o jogador de receber dados de vilões;
- salas de jogo com códigos de convite;
- presença online e rolagens em tempo real.

> A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para o frontend. Ela fica somente no backend.
