# Projeto Arachne — Site v7

Painel local para a campanha **Projeto Arachne** de Marvel Multiverse RPG.

## Principais mudanças da v7

### Dados exclusivos do Mestre
A área de dados não aparece no perfil Jogador. No perfil Mestre ela foi dividida em quatro módulos:

1. **D616** — Action Checks com TN, habilidade, modificador extra, Edge e Trouble.
2. **Outros dados** — d4, d6, d8, d10, d12, d20 e d100 com animação visual e modificador.
3. **Dano** — um único Marvel Die, multiplicador e bônus editáveis, redução do alvo e opção de Fantastic Success.
4. **Iniciativa** — um Marvel Die por participante, modificadores individuais e ordenação automática do maior para o menor.

### Seleção privada de ameaças
Os módulos de Mestre usam seleção hierárquica:

- **Capanga**
  - Curta distância
  - Longo alcance
  - Suporte
- **Capanga especial**
  - Agente da Hydra
  - Agente da I.M.A.
- **Vilão principal**
  - Doutor Octopus
  - Dentes-de-Sabre
  - Ossos Cruzados
  - Duende Verde
  - Senhor Sinistro

Isso evita exibir listas de inimigos no perfil Jogador.

### Calculadora de dano
A fórmula é baseada em:

`Marvel Die × multiplicador efetivo + bônus`

O Marvel Die mostra `M` na face 1 e essa face vale 6 no cálculo. O Mestre pode editar:

- origem do dano;
- perfil Melee / Agility / Ego / Logic;
- multiplicador;
- bônus fixo;
- redução do alvo;
- dano normal ou Fantastic Success.

Perfis padrão foram incluídos para heróis e ameaças, mas qualquer valor pode ser alterado manualmente.

### Iniciativa
É possível adicionar:

- Homem-Aranha;
- Wolverine;
- Capitão América;
- qualquer ameaça da biblioteca do Mestre;
- várias cópias de um mesmo capanga.

Cada participante possui um modificador editável (`+1`, `+2`, `-1` etc.). O sistema rola um Marvel Die para cada participante e monta automaticamente a ordem.

### Montador de cenário
Novo painel tático em grade, visto de cima, para referência rápida de posicionamento.

Heróis padrão:

- Homem-Aranha — vermelho;
- Wolverine — amarelo;
- Capitão América — azul.

O Mestre pode:

- escolher quantidade de inimigos;
- escolher a ameaça;
- definir a cor das peças inimigas;
- mover peças clicando na peça e depois na casa;
- adicionar paredes, caixas, terminais, barris e portas;
- apagar inimigos/obstáculos;
- usar modelos pré-montados.

Modelos disponíveis:

- Sala vazia
- Laboratório Arachne
- Depósito Hydra
- Telhado de Nova York
- Laboratório de Madripoor

O cenário é salvo no navegador.

## PDFs
Os PDFs de personagens e da campanha continuam em `assets/pdfs/` e podem ser visualizados dentro do site.

## Persistência
A v7 utiliza `localStorage` e tenta migrar automaticamente os dados da v6/v5/v4/v3 sempre que possível.

## Segurança
O projeto continua sendo um site estático. A interface esconde ferramentas e ameaças do perfil Jogador, mas um site 100% estático não oferece sigilo forte contra alguém que abra o código-fonte ou as ferramentas de desenvolvimento do navegador. Para segurança real, a próxima evolução seria mover autenticação e dados secretos para um backend.

## Uso
Abra `index.html` em um navegador moderno.

Senha padrão do Mestre: `ARACHNE`
