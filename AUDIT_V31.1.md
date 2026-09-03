# Auditoria e entrega — RPG Arachne v31.1

Data: 2026-09-03

Este relatório registra somente alterações e medições verificadas no pacote entregue.

## 1. Problemas de performance encontrados

- hidratação inicial duplicada: após o login o estado já era carregado, e o `ready` do SSE podia provocar outra carga completa;
- renderizações globais redundantes durante a entrada;
- consultas sequenciais para montar informações de várias campanhas;
- fila de mutações compartilhada globalmente, fazendo campanhas independentes esperarem umas pelas outras;
- tabuleiro tático pesado sendo um candidato a custo de DOM desnecessário fora da página de cenário;
- acervo de retratos excessivamente pesado para cards e listas.

## 2. Causa de cada problema

- `ready` do SSE estava sendo tratado como gatilho de sincronização completa em vez de confirmação da conexão;
- funções de entrada chamavam renderizações abrangentes mesmo após funções que já renderizavam os blocos necessários;
- roster e conteúdo de campanha eram obtidos por operações repetidas por campanha;
- serialização de gravação não separava as filas por `campaign_id`;
- cenário possui grade grande e não precisa ser reconstruído em qualquer atualização de sessão;
- imagens originais tinham resolução/peso maior do que o necessário para os componentes da interface.

## 3. Correções realizadas

- `ready` do SSE não reidrata a aplicação;
- fluxo de entrada reduzido para uma hidratação efetiva;
- renderizações SSE passam por chave de estado;
- consultas de campanha/roster em lote nos dois repositórios;
- mutações serializadas por campanha;
- cenário pesado renderizado quando sua página exige o tabuleiro;
- retratos convertidos para WebP e redimensionados;
- GETs apropriados recebem deduplicação/cache curto no cliente.

## 4. Melhorias no carregamento

Retratos:

```text
Antes:  23.961.243 bytes
Depois:  2.928.394 bytes
Redução: ~87,8%
Arquivos > 500 KB depois: 0
```

Também foi verificado que as 53 referências de retrato dos templates apontam para 53 arquivos existentes.

## 5. Melhorias no realtime

- SSE mantido como única tecnologia realtime;
- assinantes agrupados por campanha;
- conexão anterior do mesmo cliente/sessão é removida quando uma nova é aberta;
- conexões encerradas são limpas;
- heartbeat controlado;
- atualizações por chave sem nova hidratação completa;
- isolamento por campanha preservado.

## 6. Melhorias nas consultas/API

- `getCampaignsByCodes` consulta vários códigos por operação;
- `getManyCampaignStates` consulta múltiplos `campaign_id`/keys por operação;
- `Promise.all` continua sendo usado onde leituras independentes podem ocorrer em paralelo;
- novo endpoint específico de recursos evita regravar a ficha inteira para mudar Health/Focus;
- atualização de recurso sincroniza personagem e snapshot de combate.

## 7. Melhorias nas imagens

- 53 retratos locais em WebP;
- lazy loading/decoding assíncrono onde aplicável;
- busca web somente sob ação do Mestre;
- cópia persistente da imagem selecionada;
- nenhuma pesquisa automática ao abrir ficha, mudar turno, rolar ou receber SSE;
- imagem persistida reutilizada em cards, ficha, combate e Central.

## 8. Como a busca de imagens funciona

`GET /api/images/search` recebe nome/identidade/query e, somente para sessão de Mestre, consulta em paralelo Wikimedia Commons, Wikipedia e Openverse. Resultados são deduplicados e ordenados por sinais de fonte, dimensões e qualidade disponíveis.

O Mestre visualiza os candidatos e escolhe manualmente. A escolha é enviada ao endpoint de imagem do personagem, que importa a URL e salva a nova referência.

## 9. Como o estilo das imagens existentes foi analisado

Wolverine, Homem-Aranha e Capitão América permanecem como referências do acervo existente. O fluxo de busca orienta o Mestre a observar:

- arte de personagem/quadrinhos/promocional;
- enquadramento médio/fechado;
- contraste forte;
- boa resolução;
- ausência de marca d'água excessiva;
- compatibilidade visual com cards verticais.

A seleção permanece humana para evitar substituir uma imagem boa por um resultado tecnicamente correto porém visualmente incompatível.

## 10. Como o cache funciona

O frontend deduplica requisições GET em andamento e usa cache curto apenas em leituras apropriadas. Dados realtime continuam chegando por SSE e substituem o estado local correspondente, evitando cache longo em combate, turno ou recursos.

Assets estáticos em `/assets/*` recebem `Cache-Control` via `netlify.toml`.

## 11. Como o Mestre escolhe/troca imagens

Em edição de herói/vilão:

```text
🔎 BUSCAR IMAGEM
-> pesquisar
-> revisar candidato/fonte
-> escolher
-> backend importa e persiste
```

O Mestre também pode importar URL direta, remover a imagem ou continuar usando upload manual. Jogador não recebe o endpoint administrativo.

## 12. Alterações no banco

Nenhuma tabela nova e nenhuma migração estrutural necessária.

A URL da imagem permanece dentro do objeto de personagem já persistido em `app_state`. O binário usa o Storage/uploads existente.

## 13. Alterações na API

Principais rotas adicionadas/reforçadas:

```text
GET   /api/images/search
PUT   /api/characters/:kind/:id/image
PATCH /api/characters/:kind/:id/resources
```

`/api/health` reporta versão 31.1 e os recursos do backend.

## 14. Alterações no frontend

- Central do Mestre/Jogador;
- cenário na visão do jogador;
- combate/turno em destaque;
- cards de personagem e recursos;
- gestão visual de imagem;
- feedback `SEU TURNO`/`AGUARDANDO`;
- atualizações pontuais por evento SSE;
- responsividade revisada.

## 15. Alterações no backend

- busca web de imagens;
- importação remota protegida;
- endpoint dedicado de Health/Focus;
- filas de mutação por campanha;
- lookup em lote;
- SSE indexado por campanha;
- bloqueio administrativo de ficha/imagem/recursos;
- gameplay autoritativo mantido.

## 16. Arquivos alterados principais

```text
backend/src/server.js
backend/src/gameplay.js
backend/src/image-search.js
backend/src/files.js
backend/src/db/sqlite.js
backend/src/db/supabase.js
backend/tests/api.test.js
backend/tests/gameplay.test.js
frontend/index.html
frontend/script.js
frontend/api-client.js
frontend/style.css
frontend/assets/portraits/*.webp
README.md
CHANGELOG.md
backend/README.md
frontend/README.md
netlify.toml
```

## 17. Testes realizados

Execução final:

```text
npm test
12 testes
12 aprovados
0 falhas
```

Também executado `node --check` em:

- `backend/src/server.js`;
- `backend/src/gameplay.js`;
- `backend/src/image-search.js`;
- `backend/src/files.js`;
- `frontend/api-client.js`;
- `frontend/script.js`.

Todos passaram sem erro de sintaxe.

Cobertura automatizada inclui:

- health/versionamento;
- sanitização do estado de jogador;
- bloqueio de ficha/Health/Focus do jogador;
- recursos do Mestre;
- TN/habilidade autoritativos;
- bloqueio fora do turno;
- isolamento de campanha;
- busca/troca de imagem exclusivas do Mestre;
- Marvel Die;
- Fantastic;
- Ultimate 6-M-6;
- cópia segura da visão pública da rolagem.

## 18. Problemas que permaneceram

- cold start/latência de Render e Supabase dependem da infraestrutura de deploy;
- disponibilidade de candidatos de imagem depende das fontes externas e do DNS do ambiente;
- não foi adicionada API Marvel autenticada; o projeto abre a busca oficial como apoio;
- defesa automática, custos/efeitos de Powers e reações não são inventados onde os dados não estão estruturados;
- a auditoria não conseguiu executar uma bateria automatizada completa em navegador real no ambiente disponível, portanto o pacote não afirma métricas de FPS/LCP/CLS que não foram medidas.

## 19. README atualizado

Sim. O README raiz foi reescrito para refletir a versão 31.1, arquitetura, UX, imagens, performance, segurança, banco, deploy, testes e limitações reais.

## 20. CHANGELOG atualizado

Sim. A versão 31.1.0 registra interface, imagens, performance, realtime, API/backend, segurança, banco, documentação e testes.

## 21. Página de Regras

Mantida e integrada. As mudanças desta versão não adicionaram fórmula nova do Marvel Multiverse RPG; por isso a página continua documentando somente as mecânicas já implementadas, com Central/turno alinhados ao comportamento real.
