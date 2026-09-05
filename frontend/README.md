# Arachne Frontend — UI v45

A interface principal usa **React + Tailwind CSS** e mantém o backend, as APIs e as regras do jogo existentes.

## Produção

O backend continua servindo diretamente a pasta `frontend/`. O `index.html` carrega:

- `vendor/react.production.min.js`
- `vendor/react-dom.production.min.js`
- `styles/tailwind.css` (Tailwind já compilado)
- `styles/custom.css` (D616 e grid do cenário)
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
- `Board`: cenário único e sincronizado usado por jogador e Mestre; calcula e destaca destinos válidos antes do clique.
- `ScenarioBuilder`: montador do Mestre com tamanho, ambiente, modelos, geração rápida, terreno, obstáculos, decoração e peças.
- `ResourceControl`: Health e Focus.
- `RollHistory`: histórico completo do Mestre.
- `SheetModal`: consulta rápida da ficha.

## UI v45 — cenário e movimento

- O retrato principal do personagem voltou a ter destaque: **112 px** em telas menores e **144 px** a partir do breakpoint `sm`.
- O Mestre recebe o mesmo tratamento visual para o personagem/vilão selecionado.
- Ao selecionar uma peça, o tabuleiro mostra em verde somente as casas alcançáveis pelo modo de movimento escolhido.
- Cada destino destacado mostra seu custo de movimento.
- O cálculo visual espelha as regras autoritativas do backend: orçamento restante, terreno, obstáculos, ocupação, água, elevação e modo de movimento.
- O jogador move somente o próprio herói; o Mestre pode selecionar e mover qualquer peça.
- O Mestre pode montar e editar o cenário sem criar um segundo grid ou estado paralelo: tudo permanece em `scenario` e no realtime existente.

Os arquivos `script.js`, `style.css` e `api-client.js` permanecem apenas como referência/fixture de regressão das versões anteriores e **não são carregados pelo `index.html`**.
