# Arachne Frontend — UI v44

A interface principal foi migrada para **React + Tailwind CSS** sem alterar o backend ou as regras do jogo.

## Produção

O backend continua servindo diretamente a pasta `frontend/`. O `index.html` carrega:

- `vendor/react.production.min.js`
- `vendor/react-dom.production.min.js`
- `styles/tailwind.css` (Tailwind já compilado)
- `styles/custom.css` (somente D616 e grid do cenário)
- `src/api.js`
- `src/app.js`

Não existe Tailwind CDN nem compilador CSS no navegador.

## Desenvolvimento com Vite

```bash
npm install
npm run build:css
npm run dev
```

Quando o Vite roda em outra porta, o cliente usa `http://localhost:3000/api` em desenvolvimento. Em produção, usa `/api` na mesma origem ou a URL configurada em `config.js`.

## Componentes principais

- `ActionCenter`: Combate, Testes, Poderes e Movimento, com TN, Edge e Trouble por rolagem.
- `DiceStage` / `RollResult`: D616 e dano informativo sem alvo.
- `InitiativePanel`: ferramenta extra do Mestre.
- `Board`: mesmo cenário sincronizado usado por jogador e Mestre.
- `ResourceControl`: Health e Focus.
- `RollHistory`: histórico completo do Mestre.
- `SheetModal`: consulta rápida da ficha.

Os arquivos `script.js`, `style.css` e `api-client.js` permanecem apenas como referência/fixture de regressão das versões anteriores e **não são carregados pelo `index.html`**.
