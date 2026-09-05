# v45.1 — Correção de atualização do frontend

- Corrige cache de JavaScript e CSS que podia fazer a v45 abrir visualmente como a v44.
- `index.html` passa a usar identificação de build nos assets principais.
- JS/CSS/HTML passam a usar `no-store/no-cache` quando servidos pelo backend local.
- Imagens e retratos continuam com cache otimizado para não prejudicar performance.

# Changelog

## [UI 45] - 2026-09-05

### Cenário e movimentação
- Retrato principal do personagem ampliado na Central do Jogador e na seleção ativa do Mestre.
- Grid destaca em verde apenas as casas alcançáveis pelo personagem selecionado e mostra o custo de cada destino.
- Prévia de alcance considera modo de movimento, orçamento restante, terreno, água, elevação, obstáculos e ocupação, espelhando a validação autoritativa do backend.
- Jogador continua movendo somente o próprio herói; Mestre pode controlar todas as peças.
- Página Cenário do Mestre ganhou montador com tamanho, ambiente, modelos, geração rápida, terreno, obstáculos, decoração e inclusão/remoção de peças.
- Redimensionamento e aplicação de modelos reposicionam peças em células seguras.

### Preservado
- Mesmo objeto `scenario`, mesmas APIs e mesmo realtime; nenhum segundo grid foi criado.
- D616, Edge/Trouble, Health/Focus, dano informativo, fichas, iniciativa e campanha solo permanecem inalterados.

## [UI 44] - 2026-09-05

### Adicionado
- Controles compactos de Edge e Trouble ao lado do TN na Central de Ações.
- Suporte para jogador, Mestre e campanha Solo escolherem Edge/Trouble em cada rolagem D616.
- Exibição de Edge/Trouble aplicados no resumo do resultado.
- Testes de regressão para o fluxo React e para o endpoint de rolagem de jogador.

### Preservado
- Trouble continua automático no servidor e mantém o pior resultado.
- Edge continua permitindo escolher diretamente qual dado rerrolar.
- Edge e Trouble continuam se anulando um a um.
- Nenhum alvo ou dano automático foi reintroduzido.

# v42 — Motoqueiro Fantasma: Estrada dos Condenados

- Adicionada a campanha solo **Motoqueiro Fantasma — Estrada dos Condenados** (5 atos) ao seletor de campanhas.
- Adicionada a ficha homebrew de Johnny Blaze / Motoqueiro Fantasma (Rank 5) com retrato fornecido pelo usuário.
- Adicionadas fichas homebrew para Cultista da Cinza, Acólito Infernal, Hellhound, Guardião da Estrada, Cavaleiro Condenado e Homem Sem Rosto / Zarathos Fragmentado.
- Anexado pacote PDF completo da campanha + fichas e PDFs individuais por personagem.
- Campanhas `mode: solo` usam uma única entrada **ENTRAR NA CAMPANHA SOLO**; a Central Solo permite controlar Johnny e os inimigos sem troca de papel.
- A iniciativa, Health/Focus, rolagens D616, dano informativo e cenário continuam usando os sistemas já existentes.
- Perfil de dano do Motoqueiro Fantasma usa os multiplicadores explicitamente fornecidos para Corrente Infernal / Hellfire; habilidades sem fórmula fornecida não recebem multiplicador inventado.

> Observação: o PDF da campanha informa nome, Rank e função dos inimigos, mas não fornece blocos completos de atributos. Os números e poderes detalhados das seis fichas de inimigos desta versão são adaptações homebrew para uso no Arachne.

## [v41 UI / 33.4.6] - 2026-09-05

### Dano informativo na Central
- Rolagens da categoria **Combate** agora são registradas como ataques apenas para calcular o dano da própria ficha.
- O dano aparece logo abaixo do resultado da D616 na Central do jogador e na Central do Mestre.
- Nenhum alvo é selecionado, nenhum Health/Focus é alterado e não existe aplicação automática de dano.
- Em falha, a Central mostra dano 0; quando o perfil não possui multiplicador configurado, mostra `—`.
- Fantastic Success preserva o multiplicador de dano já existente no backend.
- Testes, Poderes e Movimento continuam sem cálculo de dano.
- Cache-busting do frontend atualizado para a v41.

## [v40 UI / 33.4.5] - 2026-09-05

### Cenário dentro da Central de apoio
- O cenário tático passa a aparecer diretamente abaixo da Central de Ações do jogador e do Mestre, reutilizando o mesmo `scenario.pieces` e o mesmo realtime existentes.
- Jogador movimenta somente o token do próprio herói pela Central, sem depender da vez do combate; ocupação, alcance e orçamento de movimento continuam validados pelo backend.
- Mestre pode selecionar e movimentar qualquer peça do cenário pela própria Central.
- Controles compactos de modo de movimento, orçamento restante, zoom, ajuste à tela e reinício de movimento foram adicionados ao cenário integrado.
- Realtime de cenário atualiza somente o tabuleiro integrado quando a Central está aberta, evitando reconstrução desnecessária da tela inteira.

### Capangas
- Capangas genéricos agora possuem Health/Focus de apoio: curta distância 40/30, longo alcance 30/30 e suporte 30/40.
- Agentes Hydra e I.M.A. ficam com 30 de Health nas fichas-base de capanga.
- Mestre pode ajustar Health/Focus dos capangas genéricos pela Central.

### Compatibilidade
- Rolagens continuam sem alvo e sem dano automático.
- D616, animação de dados, regras de movimentação, SSE e estado do cenário foram reutilizados em vez de duplicados.
- Cache-busting do frontend atualizado para a v40.
- Suíte completa validada com 112/112 testes aprovados.

## [v39 UI] - 2026-09-05

### Central de apoio com controles essenciais
- TN virou um controle compacto e editável tanto para jogadores quanto para o Mestre; a alteração é sincronizada pela campanha.
- Jogador pode alterar o Health e o Focus do próprio herói diretamente na Central, além de abrir a ficha completa sem sair da tela principal.
- Mestre pode alterar Health e Focus do vilão selecionado diretamente na Central e abrir sua ficha.
- Os três capangas genéricos de apoio aparecem sempre na seleção de personagens do Mestre, sem depender da iniciativa.
- Capangas possuem ficha rápida para consultar habilidades e movimento.
- A Central do Mestre agora exibe o histórico completo de rolagens da sessão, incluindo jogadores, Mestre e iniciativa, em ordem cronológica inversa.
- Mantida a proposta de apoio de mesa: nenhuma seleção de alvo ou aplicação automática de dano foi reintroduzida.
- Animação D616 e lógica de cálculo das rolagens permanecem preservadas.

## [v38 UI] - 2026-09-05

### Modo de apoio de mesa
- A Central deixou de tentar executar o combate dentro do VTT e passou a funcionar como apoio de rolagens.
- Jogadores não selecionam alvo, não aplicam dano e não alteram Health/Focus pela Central.
- Ações de Combate, Testes e Poderes apenas rolam a D616 com o modificador da ficha e o TN atual como referência.
- A ordem de turnos não bloqueia mais as rolagens dos jogadores.
- A Central do Mestre usa o mesmo fluxo de rolagens, com uma seleção simples de quem está agindo.
- O único recurso extra do Mestre na Central é a rolagem de iniciativa inicial.
- O Mestre pode rolar pelos vilões cadastrados e por NPCs/capangas adicionados à iniciativa.
- Removidos da navegação principal os painéis duplicados "Dados do Mestre" e "Combate"; o código legado permanece preservado para compatibilidade.
- Mantida sem alterações a animação D616 existente e as regras de cálculo dos dados.
- Central reduzida para uma coluna, com breakpoints específicos para tablet e celular.

## [v37 UI] - 2026-09-05

- Central do Mestre agora espelha a Central de Ações dos jogadores: Combate, Testes, Poderes e Movimento.
- O Mestre escolhe visualmente qual vilão participante do combate controla; não há dropdown ou formulário de atacante.
- Somente vilões/NPCs presentes na ordem ativa do combate aparecem na Central do Mestre.
- Somente heróis presentes na ordem ativa aparecem como alvos do Mestre.
- Na Central do jogador, somente vilões presentes na ordem ativa aparecem como alvos de ataque; a lista geral de vilões não é mais usada como fallback.
- Ao remover um participante da ordem, ele deixa de aparecer imediatamente nas respectivas Centrais de Ações.
- Ataques continuam usando Melee/Agility para Health e Ego/Logic para Focus, puxando defesa e recursos das fichas.
- Testes, Poderes e Movimento dos vilões usam os mesmos dados de ficha e a mesma D616/animação já existentes.
- Nenhuma nova implementação de dados, realtime ou regra de dano foi criada.
- Suíte validada com 105/105 testes aprovados.

## [v36 UI] - 2026-09-05

- Central do Mestre reduzida às duas funções principais do VTT: iniciativa e ações.
- Removidos os formulários de atacante, alvo, defesa e recurso da Central.
- Mestre escolhe o personagem por cartão, escolhe Melee/Agility/Ego/Logic e clica diretamente no alvo para rolar.
- Central do jogador também passou a usar seleção visual de ataque + clique no alvo.
- Melee e Agility afetam Health; Ego e Logic afetam Focus.
- Defesa e redução são resolvidas a partir da ficha do alvo.
- Dano de ataques bem-sucedidos é aplicado automaticamente; não existe mais botão separado de aplicar dano na Central.
- Rolagem D616 e animação 3D existentes foram preservadas, com tamanho corrigido na iniciativa e nas ações.
- Textos técnicos de implementação foram removidos da interface.
- Suíte validada com 104/104 testes aprovados.

## [v35 UI] - 2026-09-05

### Performance / responsividade
- A renderização do frontend passa a ser sob demanda por página: eventos realtime e `renderAll()` deixam de reconstruir telas invisíveis.
- Cards, listas, Central, iniciativa, combate e grid passam a priorizar os thumbnails WebP já existentes; extensões PNG/JPG também são normalizadas para o thumbnail `.webp` correspondente.
- Adicionada contenção de renderização para cards pesados e ajustes para toque, tablets e celulares em 1180 px, 820 px, 560 px e 380 px.
- Viewport recebeu `viewport-fit=cover` para dispositivos móveis com áreas seguras.

### UX / UI do Mestre
- Central do Mestre reorganizada como cockpit: preparação/ordem de combate e ataque ficam em primeiro plano; recursos e cenário ficam como apoio.
- Formulários de iniciativa, participante e recursos foram compactados em ações rápidas.
- Ataque mantém atacante, ação e alvo no fluxo principal; Defesa/TN e destino do dano ficam em opções avançadas.
- Edição manual de iniciativa e remoção da ordem ficam em menu contextual por participante, reduzindo ruído visual.
- Fichas rápidas da mesa ficam recolhidas e acessíveis sob demanda.

### Compatibilidade / validação
- Nenhuma regra de jogo, cálculo server-side, endpoint, estado realtime ou animação D616 foi alterado.
- Suíte completa validada com 100/100 testes aprovados, incluindo regressões de combate, iniciativa, ataque/dano, movimento, Health/Focus e animação de dados.

## [33.4.4] - 2026-09-03

### Combate / ameaças genéricas
- Capangas genéricos e vilões com `tier: LACAIO` agora podem ser adicionados várias vezes à preparação de iniciativa pela Central do Mestre.
- Agente da Hydra e Agente da I.M.A. passam a funcionar como instâncias repetíveis, enquanto personagens únicos continuam bloqueando duplicação.
- Cada instância repetível recebe `participant.id`, `instanceNumber` e token de grid próprios, mantendo `baseId/characterId` apontando para a ficha-base.
- Nomes são numerados automaticamente (`Agente da Hydra 1`, `Agente da Hydra 2`, etc.) para facilitar identificação na iniciativa e no grid.
- Ao remover uma instância, somente o token correspondente é removido; limpar a iniciativa remove tokens automáticos e apenas desvincula peças preexistentes.
- A integração continua usando `scenario.pieces` e o SSE existentes; nenhum segundo grid ou realtime foi criado.

### Testes
- Cobertura adicionada para múltiplos Capangas, múltiplos Agentes Hydra/IMA, bloqueio de duplicação de personagens únicos, remoção por instância, início do combate com várias instâncias e sincronização SSE.


## [33.4.3] - 2026-09-03

### Imagens / performance
- Auditado o armazenamento: banco mantém somente referências de imagem, sem BLOB/base64.
- Adicionadas 53 thumbnails WebP (até 320 px) para Central, listas, iniciativa, combate e grid.
- Reduzido o payload potencial de pequenos avatares em aproximadamente 80%.
- Reotimizados somente os dois retratos em que houve ganho material sem perda visual relevante.
- Retratos locais agora usam URL versionada e cache de 1 ano `immutable`.
- Uploads de imagem passam a ser deduplicados por SHA-256 dentro da campanha.
- Limite server-side de imagem ajustado para 12 MB; PDFs permanecem com 30 MB.
- Uploads grandes podem ser redimensionados/convertidos para WebP no navegador antes do envio quando houver ganho real.
- Mantido o mesmo Supabase Storage/fallback local; nenhum storage paralelo foi criado.

### Testes
- Adicionados testes de banco sem BLOB, thumbnails, cache, deduplicação, upload e preservação do SSE único.
# Changelog

Todas as alterações relevantes do RPG Arachne devem ser registradas neste arquivo.

## [33.4.1] - 2026-09-03

### Retratos oficiais dos personagens
- Integrados 35 retratos fornecidos e confirmados pelo usuário: 18 heróis e 17 vilões.
- As imagens foram associadas pelos IDs internos dos personagens e copiadas para os mesmos caminhos canônicos já usados por `CHARACTER_ASSETS`/`CHARACTER_LIBRARY`; nenhuma associação nova baseada apenas em nome foi criada.
- Os arquivos enviados foram preservados byte a byte, sem geração, pesquisa web ou recompressão.
- Fichas, Central do Mestre, Central do Jogador, listas, combate/iniciativa e tokens continuam reutilizando o campo `image` já existente.
- Nenhum atributo, Health, Focus, poder, trait, tag, iniciativa, regra, combate, API, banco ou realtime foi alterado.

### Validação
- 35/35 IDs resolvem para o asset esperado e 35/35 assets são WebP válidos.
- 35/35 arquivos no projeto possuem SHA-256 idêntico aos uploads fornecidos.
- Teste Mestre/Jogador confirmou persistência do caminho da imagem após recarregar o estado e entrar novamente na campanha.
- Suíte existente: 79/79 testes aprovados.

## [33.4.0] - 2026-09-03

### Health / Focus do Jogador
- O jogador pode ajustar somente `currentHealth` e `currentFocus` do próprio herói diretamente pela Central do Jogador.
- O endpoint existente `PATCH /api/characters/:kind/:id/resources` valida `session.heroId`; outro herói, vilão, `maxHealth`, `maxFocus` e demais atributos continuam bloqueados para jogador.
- O backend mantém `0 <= currentHealth <= maxHealth` e `0 <= currentFocus <= maxFocus`, sincroniza a cópia de recursos em `combat.order` quando aplicável e persiste o estado em `heroes`.
- Mestre continua podendo ajustar recursos de qualquer herói ou vilão permitido pela rota administrativa.

### Realtime / Histórico de Recursos
- Alterações de Health/Focus feitas pelo jogador são propagadas pelo mesmo SSE por campanha para Mestre e demais clientes, sem polling ou nova conexão realtime.
- Os valores persistem após recarregar a página, entrar novamente na campanha e trocar de tela.
- Alterações efetivas reutilizam o `actionHistory`, registrando personagem, recurso, valor anterior, novo valor, autor e data/hora; alterações de vilões permanecem visíveis somente ao Mestre.

### Validação Final de Health / Focus
- Revisão final sem novas funcionalidades: suíte completa com 79/79 testes aprovados.
- Confirmados os quatro controles de recurso, limites mínimo/máximo, isolamento por personagem, proteção de máximos/atributos, permissões do Mestre, SSE, persistência e ausência de regressões em combate, iniciativa, D616, grid e movimentação.

### Movimentação do Jogador
- O jogador visualiza novamente o painel de movimento do cenário durante a sessão; fora do próprio turno a interface mostra `Aguarde seu turno para movimentar seu personagem.`
- Durante o próprio turno, somente o token de herói vinculado ao `heroId` da sessão pode ser movimentado pelo jogador.
- O backend resolve a propriedade pelo `characterId/baseId` do token e ignora tentativas de controlar outro herói, NPC ou vilão.
- O orçamento de movimento do participante é renovado quando o turno dele começa, inclusive no primeiro turno de um combate.
- O Mestre continua podendo movimentar qualquer peça pelo endpoint já existente.

### Realtime / Segurança
- A posição continua persistida em `scenario.pieces` e propagada pelo SSE existente; não foi criado outro grid, polling ou conexão realtime.
- Posição esperada, destino, ocupação, terreno, obstáculos, modo e orçamento continuam validados no backend antes da gravação.

### Testes
- Suíte completa: 66/66 testes aprovados.
- Cobertos Mestre + dois jogadores, movimento no próprio turno, bloqueio fora do turno, tentativa de mover outro personagem/NPC, realtime e renovação de movimento ao iniciar novo turno.

## [33.3.0] - 2026-09-03

### Iniciativa → Grid
- Adicionar herói, vilão ou NPC à iniciativa agora garante automaticamente um único token correspondente em `scenario.pieces`.
- Tokens já existentes com o mesmo `characterId/baseId` são reutilizados, evitando duplicação no grid.
- Tokens criados pela iniciativa carregam imagem e movimento já cadastrados no personagem quando disponíveis.
- Remover um participante elimina somente o token criado automaticamente por esse vínculo; tokens preexistentes são preservados.
- O comando existente de limpar iniciativa também remove somente tokens auto-criados.

### Realtime / Segurança
- `initiative` e `scenario` são persistidos na mesma fila de mutação por campanha e propagados pelo SSE existente.
- Somente o Mestre pode adicionar/remover participantes; jogadores continuam recebendo o cenário em modo permitido pelo estado da sessão.
- Não foi criado outro grid, token store, polling ou conexão realtime.

### Testes
- Suíte completa: 61/61 testes aprovados.
- Cobertos vilão, herói com token preexistente, NPC, duplicação, remoção/reentrada, limpeza e sincronização Mestre/Jogador via SSE.

## [33.2.0] - 2026-09-03

### Central / Ataques
- Adicionada resolução de ataque diretamente na Central do Mestre com seleção de atacante, ação, alvo e TN/Defesa.
- A Central reutiliza a mesma `ArachneDiceAnimation` e a mesma D616 autoritativa já existentes; nenhuma segunda rolagem de dano foi criada.
- O resultado apresenta os três dados, total, TN/Defesa, sucesso/falha, Marvel Die, multiplicador e dano calculado.
- Adicionado `APLICAR DANO` somente após ataque finalizado e bem-sucedido.

### Backend / Segurança
- Adicionado `POST /api/actions/d616/:rollId/apply-damage`, exclusivo do Mestre.
- O endpoint recebe a identificação da rolagem, reabre o histórico persistido e recalcula o dano com a mesma `damageFromRoll`; não confia em valor de dano ou alvo enviados pelo frontend.
- O alvo fica vinculado à própria `rollId` no início do ataque.
- Aplicação de dano é idempotente: a mesma rolagem não pode causar dano duas vezes.
- Para ataques com alvo pela Central, o multiplicador de dano vem do perfil autoritativo existente no backend.

### Histórico / Realtime
- A mesma entrada D616 registra atacante, ação, alvo, TN/Defesa, Marvel Die, multiplicador, dano calculado e, após aplicação, recurso afetado e valores antes/depois.
- Health/Focus alterados são propagados pelo mesmo SSE `state` já existente; nenhum polling ou canal realtime adicional foi criado.

### Preservado
- Iniciativa da v33.1, grid, movimentação, cenário e layout geral não receberam novas funcionalidades nesta etapa.
- Mantidos um único `EventSource`, um único `cubeTumble` e uma única `ArachneDiceAnimation`.

### Testes
- Suíte completa: 54/54 testes aprovados.
- Cobertos ataque bem-sucedido, falha, mesma `rollId`, dano recalculado no backend, tentativa de adulteração pelo cliente, aplicação única, atualização de Health/Focus, histórico e SSE.

## [33.1.0] - 2026-09-03

### Iniciativa / Combate
- A preparação de combate agora rola iniciativa diretamente na Central, sem exigir abertura da aba Dados do Mestre.
- Heróis, vilões e NPCs entram sem resultado manual; o backend resolve o modificador de iniciativa armazenado na ficha/perfil.
- Cada iniciativa usa a mesma D616 autoritativa e a mesma `ArachneDiceAnimation` já existentes.
- Adicionado `ROLAR INICIATIVA` por participante e `ROLAR INICIATIVAS` para rolar somente participantes ainda pendentes.
- Resultados são ordenados automaticamente por total, depois modificador e nome, preservando os critérios existentes.

### Histórico
- A rolagem de iniciativa é gravada na aba Dados do Mestre com a mesma `rollId` e os mesmos três valores D616 retornados pelo servidor.

### Segurança / Integridade
- Duplicação de `baseId` na iniciativa é bloqueada no frontend e no backend, inclusive por gravação direta de `state/initiative` e tentativa de inserir o mesmo personagem na ordem ativa.
- Remover um participante permite adicioná-lo novamente; a nova entrada começa sem resultado e exige nova rolagem.

### Testes
- Suíte completa: 48/48 testes aprovados.
- Cobertos herói, vilão, NPC, D616 server-side, histórico, ordenação, duplicação, remoção/reentrada e permissões administrativas.

## [33.0.0] - 2026-09-03

### Dados do Mestre
- Removidos a aba separada de Dano, o cubo `damage-cube`, o botão `ROLAR DANO` e o fluxo frontend que sorteava um novo d6 para dano.
- Mantidos D616, iniciativa, dados genéricos, histórico e a animação 3D existente.
- Ataques agora são apresentados como uma única rolagem D616 do início ao fim.

### Ataques / Dano
- O backend passa a derivar o dano da mesma D616 do ataque, sem uma segunda rolagem.
- O Marvel Die é o segundo valor da mesma `rollId`; `M` continua armazenado como valor bruto `1` e avaliado como `6`.
- O dano usa o valor efetivo do Marvel Die, multiplicador de dano do perfil e modificador da habilidade.
- Fantastic Success preserva o multiplicador adicional já existente no antigo calculador; falhas não produzem dano calculado.
- Perfis de multiplicador foram centralizados no backend; jogadores não podem adulterar multiplicador/redução pela requisição.

### Histórico
- O dano de ataque passa a ser armazenado dentro da própria entrada `D616`, com a mesma `rollId`, Marvel Die, TN, total, resultado e dados da fórmula.
- Entradas legadas `DMG` deixam de ser exibidas na aba Dados do Mestre; nenhuma nova entrada desse tipo é criada.

### Preservado
- Edge, Trouble, Fantastic/Ultimate Fantastic e a animação D616 existente.
- Iniciativa, Central, combate, turnos, SSE/realtime, grid e movimentação não receberam novas funcionalidades nesta etapa.

### Testes
- Suíte completa: 40/40 testes aprovados.
- Cobertos rolagem normal, ataque, resultado autoritativo, Marvel Die, sucesso, falha, dano derivado, histórico unificado, Edge, Fantastic, iniciativa e bloqueio de parâmetros de dano adulterados por jogador.

## [32.0.0] - 2026-09-03

### Interface / UX
- Padronizados estados de hover, clique, seleção, foco e desabilitado com transições curtas e consistentes.
- Botões principais de rolagem, Action Checks, início de combate e passagem de turno receberam hierarquia visual coerente com a área de dados D616.
- Categorias da Central de Ações, poderes e abas de dados ganharam estados selecionados mais claros.
- Resultado de Action Check recebeu feedback visual curto preservando a animação D616 existente.
- Participante do turno atual recebe transição de foco curta quando a ordem de combate é atualizada.
- Token selecionado no grid recebe feedback visual curto após atualização de posição, sem alterar cálculo ou persistência do movimento.
- Removida a pulsação contínua antiga de botões administrativos para reduzir ruído visual.

### Responsividade / Acessibilidade
- Adicionados ajustes para 980 px, 640 px e 420 px, evitando botões e ações espremidos em notebook e telas menores.
- Reforçados estados `:focus-visible` para teclado.
- `prefers-reduced-motion: reduce` passa a neutralizar animações/transições decorativas, incluindo animações antigas.

### Preservado
- Nenhuma alteração em regras, resultados de dados, combate, turnos, permissões, API, banco ou cálculo de movimentação.
- Mantidos um único `EventSource`/SSE, um único grid e uma única implementação `ArachneDiceAnimation`/`cubeTumble`.
- Backend/API permanece reportando versão 31.6 porque a v32 é exclusivamente visual.

### Testes
- Suíte completa: 31/31 testes aprovados.
- Adicionados 5 testes estruturais específicos da v32 para estados visuais, feedback, responsividade, movimento reduzido e preservação de realtime/animação únicos.
- Chromium headless do ambiente bloqueou navegação local com `ERR_BLOCKED_BY_ADMINISTRATOR`; a validação gráfica automatizada por navegador não foi marcada como concluída.

## [31.6.0] - 2026-09-03

### Grid / Movimentação
- Jogadores passam a selecionar e movimentar somente o próprio token no grid durante o próprio turno.
- Fora do turno, a interface e o backend retornam: `Aguarde seu turno para movimentar seu personagem.`
- O Mestre continua podendo movimentar qualquer peça do cenário.
- O painel de movimento reutiliza velocidades, modos, orçamento e casas alcançáveis já existentes no grid.

### API / Segurança
- Adicionado `PATCH /api/scenario/move` para movimentação pontual e autoritativa.
- O backend valida campanha da sessão, personagem do jogador, propriedade da peça, turno ativo, posição atual, destino, ocupação, obstáculos, terreno, modo de movimento e orçamento restante.
- Jogadores não podem mover heróis de outros jogadores, NPCs ou vilões por chamada manual.
- Adicionado `backend/src/scenario-movement.js` com a validação server-side equivalente às regras de alcance já usadas pelo grid.

### Realtime
- A posição persistida continua usando o estado `scenario` e o SSE já existente.
- O cliente que originou a ação atualiza pela resposta da API; Mestre e demais jogadores recebem `state: scenario` pelo SSE, sem polling ou conexão adicional.

### Testes
- Adicionado teste integrado com Mestre + dois jogadores cobrindo propriedade, turno, movimento do Mestre e propagação SSE.
- Suíte completa: 26/26 testes aprovados.

## [31.5.0] - 2026-09-03

### Central do Mestre
- Reorganizada a Central como mesa virtual principal da sessão, com faixa de campanha, cenário, rodada, turno e iniciativa.
- Combate ativo pode ser controlado pela Central: passar turno, encerrar, adicionar/remover participantes e alterar iniciativa.
- Preparação de combate permite adicionar heróis, vilões e NPCs/capangas à iniciativa e informar valores sem sair da Central.
- Adicionado gerenciamento rápido de Health e Focus para heróis e vilões.
- Adicionados cartões rápidos de personagens com acesso às fichas existentes.
- Cenário passa a exibir visual tático/imagem existente, localização, grade, elementos e briefing da sessão atual.
- Área de dados da Parte 3 foi integrada visualmente à Central e agora separa histórico de jogadores e do Mestre.

### API / Segurança
- Adicionado `PATCH /api/combat/order`, exclusivo do Mestre, para alterações pontuais da ordem ativa.
- A rota reutiliza o estado `combat` e o SSE existentes; nenhum novo sistema realtime ou polling foi criado.
- Jogadores continuam impedidos de editar ordem, iniciativa, Health ou Focus administrativamente.

### Preservado
- Nenhuma alteração na lógica de movimentação ou permissões do grid.
- A animação D616 e o realtime das Partes 2 e 3 permanecem únicos e reutilizados.


## [31.2.0] - 2026-09-03

### Correções
- Corrigidas Central e página de Combate vazias após deploy quando o navegador reutilizava `script.js`/`style.css` da versão anterior.
- Adicionado cache-busting (`?v=31.2.0`) aos assets principais do frontend.
- Adicionados fallbacks visíveis em Central e Combate enquanto a sessão sincroniza.
- `renderAll()` agora isola falhas de renderização por painel; um erro secundário não impede Central e Combate de aparecerem.
- Estado local migra automaticamente da v31 para a v32 interna de storage sem perder dados da campanha.

### Deploy
- Netlify passa a revalidar HTML, JavaScript e CSS principais em vez de manter versões antigas por cache.

## [31.1.0] - 2026-09-03

### Interface / UX
- Reformulada a página inicial como Central do Mestre e Central do Jogador.
- Adicionados atalhos de sessão para heróis, vilões, dados, cenário e combate.
- Jogador passa a visualizar personagem, recursos, turno, cenário, combate e Central de Ações na visão inicial.
- Adicionada página dedicada de Combate e Turnos mantendo os controles administrativos restritos ao Mestre.
- Mantida e integrada a Página de Regras.
- Padronizada a nova camada visual com a identidade escura/vermelha da interface de rolagem.
- Adicionados breakpoints e reorganização responsiva dos cards/painéis.
- Adicionados controles rápidos de Focus no painel de combate do Mestre.

### Imagens
- Adicionado endpoint administrativo de busca de imagens para personagens.
- Adicionada busca em Wikimedia Commons, Wikipedia e Openverse.
- Adicionado atalho para pesquisa oficial Marvel.
- Adicionada importação de imagem por URL HTTPS confiável.
- Adicionado fluxo `🔎 BUSCAR IMAGEM` com seleção manual pelo Mestre.
- A imagem selecionada passa a ser copiada para o Storage/uploads existente e persistida no objeto do personagem.
- Adicionada remoção/troca de imagem pelo Mestre.
- Mantido upload manual já existente.
- Convertidos os 53 retratos locais para WebP otimizado.
- Peso total dos retratos reduzido de 23.961.243 bytes para 2.928.394 bytes (aprox. 87,8%).
- Nenhum retrato local permanece acima de 500 KB.
- Verificadas 53 referências de retrato para 53 arquivos, sem referência ausente.
- Adicionado carregamento preguiçoso/decodificação assíncrona onde aplicável.

### Performance
- Removida hidratação completa redundante disparada pelo evento `ready` do SSE após o login.
- Reduzidas renderizações globais redundantes no fluxo de entrada.
- Adicionada deduplicação/cache curto de GETs apropriados no cliente da API.
- O tabuleiro de cenário pesado passa a ser renderizado somente quando necessário.
- Consultas de campanhas e seus estados resumidos passaram a ser agrupadas em lote nos repositórios SQLite e Supabase.
- Mutações do backend passaram a ser serializadas por campanha, evitando bloqueio global entre mesas diferentes.
- Atualizações realtime continuam aplicadas por chave/área em vez de forçar nova hidratação completa.

### Realtime
- Mantido SSE como sistema realtime único.
- Assinantes passam a ser indexados por campanha.
- Nova conexão do mesmo cliente/sessão substitui a conexão anterior.
- Adicionada limpeza de assinantes encerrados e heartbeat controlado.
- Eventos mantêm isolamento por campanha e podem ignorar o próprio `sourceClientId` quando apropriado.

### API / Backend
- Adicionado `GET /api/images/search` exclusivo do Mestre.
- Adicionado `PUT /api/characters/:kind/:id/image` exclusivo do Mestre.
- Adicionado `PATCH /api/characters/:kind/:id/resources` para Health/Focus administrados pelo Mestre.
- Atualização de recursos sincroniza também o snapshot correspondente no combate.
- `GET /api/health` atualizado para informar versão 31.1 e recursos ativos.
- Adicionado `backend/src/image-search.js`.
- Reforçado `backend/src/files.js` para importação remota segura.

### Segurança
- Atualização completa de ficha de herói permanece/foi reforçada como ação exclusiva do Mestre.
- Jogadores não podem alterar Health, Focus, iniciativa ou imagens através de requisição manual.
- Importação remota bloqueia HTTP não seguro, localhost, IPs privados e redirecionamentos para hosts privados.
- Download remoto possui timeout, limite de tamanho e MIME permitido.
- Ator do jogador e TN continuam autoritativos no backend.
- Campanhas continuam isoladas pelo `campaign_id` da sessão assinada.

### Banco
- Nenhuma nova tabela ou migração de schema necessária para a v31.1.
- Sistema de imagens reutiliza URL no personagem e Storage/uploads já existente.
- Adicionado acesso em lote a estados de várias campanhas nos repositórios.

### Documentação
- README raiz reescrito para refletir a v31.1 real.
- READMEs de frontend/backend atualizados.
- Criado `AUDIT_V31.1.md` com problemas, causas, correções, testes e limitações.
- Corrigidas referências antigas de versão nos arquivos de configuração/documentação de deploy.

### Testes
- Corrigida documentação do nome real dos testes (`api.test.js` e `gameplay.test.js`).
- Confirmado script `npm test` no `backend/package.json`.
- Executados 12 testes automatizados: 12 aprovados, 0 falhas.
- Executado `node --check` em backend e scripts principais do frontend, sem erro de sintaxe.

## [30.0.0] - 2026-09-02

### Adicionado
- Central de Ações integrada à página inicial com Combate, Testes, Poderes e Movimento.
- Rolagens D616 autoritativas no backend para jogadores e Mestre.
- Fluxo backend para rerrolagens de Edge e processamento automático de Trouble.
- Estado persistido de combate por campanha com rodada, turno e participantes.
- Controles do Mestre para iniciar/encerrar combate, passar turno e forçar passagem.
- Inclusão, remoção e edição de iniciativa de participantes do combate.
- Sistema persistido de modificadores numéricos, Edge e Trouble sem alterar o valor base da ficha.
- Durações de modificador por rolagem, turno, rodada, combate ou permanente.
- Histórico sincronizado de ações da campanha (`actionHistory`).
- Endpoints exclusivos do Mestre para alterar Health/Focus.
- Registro de uso de Powers existentes na ficha sem inventar custos ou efeitos ausentes.
- Registro de movimento usando limites existentes no objeto `movement` da ficha.
- Página integrada de Regras com as mecânicas realmente implementadas.
- Módulo `backend/src/gameplay.js` para regras de D616, combate e modificadores.
- Script `npm test` no backend.

### Alterado
- Central lê habilidades diretamente da ficha em vez de pedir o valor ao jogador.
- Ataques da Central utilizam Melee para corpo a corpo e Agility para distância, preservando TN do Mestre porque o projeto não possui defesa automática estruturada.
- Ordem do combate é recalculada ao alterar iniciativa.
- Interface de fichas não oferece edição completa ou ajuste de Health/Focus ao jogador.
- Estado `challenge` enviado ao jogador expõe somente informações necessárias à Central.

### Segurança
- Rolagens definitivas são geradas no servidor.
- Ator de ação de jogador é resolvido pela sessão.
- TN de jogador é lido do estado da campanha.
- Campanhas permanecem isoladas por `campaign_id`.
