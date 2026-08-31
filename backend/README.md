# Backend — Projeto Arachne v11

API REST em Node.js + Express.

## Rodar localmente

1. Instale Node.js 22.5 ou superior.
2. Copie `.env.example` para `.env`.
3. Rode:

```bash
npm install
npm run dev
```

A API abre em `http://localhost:3000`.

O banco local padrão é SQLite em `data/arachne.sqlite`, usando o módulo nativo `node:sqlite` do Node 22.

## Rotas

- `GET /api/health`
- `GET /api/state`
- `GET /api/state/:key`
- `PUT /api/state/:key`
- `PUT /api/state` para salvar vários estados de uma vez
- `DELETE /api/state/:key`

## Trocar para Supabase

1. Crie o projeto no Supabase.
2. Execute `database/supabase.sql` no SQL Editor.
3. No `.env`, mude:

```env
DB_PROVIDER=supabase
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

4. Reinicie a API.

O frontend não precisa ser alterado para a troca SQLite → Supabase.

> A `SERVICE_ROLE_KEY` deve ficar somente no backend. Nunca coloque essa chave no frontend.
