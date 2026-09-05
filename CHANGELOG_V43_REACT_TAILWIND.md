# UI v43 — Migração React + Tailwind

## Objetivo

Migrar a camada de interface do Arachne para uma arquitetura de componentes, mantendo o backend, banco, APIs, regras, D616, dano informativo, iniciativa, realtime SSE, cenário e campanhas existentes.

## Alterações

- Frontend principal refeito em React.
- Tailwind CSS compilado localmente; sem Tailwind CDN/runtime.
- Vite configurado para desenvolvimento local.
- Central de Jogador, Mestre e Solo compartilham os mesmos componentes.
- Health/Focus, TN, ficha, ações e cenário preservados.
- Mestre continua com iniciativa e histórico geral.
- Jogador continua movendo somente o próprio token; Mestre move todos.
- D616 preserva a animação 3D e o cálculo server-side.
- Combate continua exibindo dano informativo da ficha sem selecionar alvo.
- Campanha solo do Motoqueiro Fantasma e suas fichas permanecem integradas.
- Realtime continua com uma única conexão EventSource.

## Performance da camada carregada

A interface antiga carregava aproximadamente 524 KB de JS/CSS próprios (`script.js`, `api-client.js`, `style.css`), antes de assets.

A UI v43 carrega aproximadamente 210 KB somando React/ReactDOM local, aplicação, API e CSS compilado. Os assets grandes (retratos/PDFs) não foram duplicados; cards continuam usando thumbnails quando disponíveis.

## Compatibilidade

O backend não foi reescrito. Os endpoints existentes continuam sendo a fonte autoritativa para sessão, recursos, rolagens, iniciativa e movimento.
