# RPG Arachne Frontend — v33.4

Frontend estático em HTML/CSS/JavaScript para a mesa virtual do Arachne.

## Interface atual

- Central do Mestre;
- Central do Jogador;
- heróis e vilões;
- Central de Ações;
- rolagens;
- cenário tático;
- combate, iniciativa e turnos;
- regras e anotações;
- gestão de imagens pelo Mestre;
- sincronização realtime por SSE através do backend.

O jogador não ganha permissões administrativas apenas porque um botão está oculto: o backend continua validando todas as ações sensíveis.

Os retratos embarcados estão em `assets/portraits/` e utilizam WebP. No patch 33.4.1, 35 retratos confirmados pelo usuário foram integrados nos caminhos canônicos associados aos IDs internos dos personagens; nenhum sistema paralelo de imagens foi criado. Imagens escolhidas pela busca/upload continuam persistidas via backend e reutilizadas na interface.

Para testes completos, execute o backend com `SERVE_FRONTEND=true` e abra `http://localhost:3000`.


## Polimento visual v32

A v32 adiciona somente apresentação: estados consistentes de hover/clique/foco/desabilitado, feedback curto de turno, resultado e token selecionado, breakpoints adicionais e suporte explícito a `prefers-reduced-motion`. A lógica de jogo, API, SSE, dados e movimentação permanecem os mesmos da v31.6.

## Dados do Mestre v33.0

A aba Dados do Mestre não possui mais uma rolagem separada de dano. Ataques usam a mesma D616 autoritativa já animada pela implementação `ArachneDiceAnimation`; após a resposta do servidor, a interface mostra o Marvel Die, total, TN/Defesa, resultado e, em sucesso, o dano derivado da própria rolagem. O histórico mantém tudo sob a mesma `rollId`/entrada `D616`. Iniciativa e dados genéricos permanecem disponíveis.

## Iniciativa na Central v33.1

A preparação de combate permite adicionar participantes e rolar a iniciativa diretamente na Central. O frontend não pede o modificador: ele exibe o valor da ficha recebido do estado, chama a API dedicada e reutiliza `ArachneDiceAnimation` para animar os três dados D616 devolvidos pelo servidor. `ROLAR INICIATIVAS` percorre somente participantes ainda sem resultado. Capangas e ameaças `LACAIO` podem ser adicionados várias vezes; cada instância recebe numeração própria, enquanto personagens únicos continuam bloqueados após a primeira entrada.

## Ataque + dano na Central v33.2

A Central do Mestre possui um painel de resolução de ataque que seleciona atacante, habilidade, alvo e TN/Defesa e reutiliza a mesma `ArachneDiceAnimation` para os três valores D616 retornados pelo servidor. O resultado exibe total, defesa, outcome, Marvel Die, multiplicador e dano derivado da mesma rolagem. O botão `APLICAR DANO` envia somente a `rollId`; o valor aplicado e o alvo autoritativo são resolvidos novamente pelo backend. A mesma entrada D616 é atualizada no histórico, sem criar uma rolagem de dano paralela.


## Iniciativa → Grid v33.3

Ao adicionar herói, vilão ou NPC à iniciativa, a resposta da API já inclui o `scenario` atualizado. O frontend reaproveita `scenario.pieces` e `renderScenario()`. Personagens únicos reutilizam um token existente com o mesmo `characterId/baseId`; ameaças repetíveis recebem um token por `initiativeParticipantId`, mantendo o mesmo `characterId/baseId` da ficha-base. Tokens novos usam a imagem do personagem quando disponível. O SSE existente atualiza os demais clientes.

## Movimentação do jogador v33.4

Durante combate ativo, o jogador vê o painel de movimento do cenário. No próprio turno ele pode selecionar apenas seu token e clicar em uma casa alcançável; fora do turno a interface informa `Aguarde seu turno para movimentar seu personagem.`. A resposta da API atualiza imediatamente o cliente de origem e o SSE existente atualiza os demais clientes.
