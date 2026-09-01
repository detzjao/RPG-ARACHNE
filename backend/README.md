# Backend v20

Node.js API com SQLite ou Supabase/PostgreSQL, SSE em tempo real, múltiplas campanhas, templates e upload de PDFs/imagens.

## Novas rotas

```text
GET  /api/templates
POST /api/campaigns
POST /api/assets/upload
PUT/DELETE /api/heroes/:id
PUT/DELETE /api/villains/:id
```

`POST /api/campaigns` aceita:

```json
{
  "name": "Minha campanha",
  "masterPassword": "senha",
  "mode": "template | blank | pdf",
  "templateId": "avengers-doom"
}
```
