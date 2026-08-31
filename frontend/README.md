# Frontend — Projeto Arachne v11

Interface web do Projeto Arachne.

Arquivos principais:

- `index.html`
- `style.css`
- `script.js`
- `api-client.js`
- `assets/pdfs/`

O frontend continua usando `localStorage` como cache para não perder dados quando a API estiver temporariamente indisponível.

Quando o backend está ativo, `api-client.js` sincroniza automaticamente alterações com `/api/state`.

Para desenvolvimento separado, se o frontend estiver em `localhost` em outra porta, ele tenta usar `http://localhost:3000/api`.

Em produção, você também pode definir antes dos scripts:

```js
window.ARACHNE_API_URL = 'https://seu-backend.com/api';
```
