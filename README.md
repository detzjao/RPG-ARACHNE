# Projeto Arachne — Site v5

Painel local para a campanha **Projeto Arachne / Marvel Multiverse Role-Playing Game**.

A v5 separa definitivamente o fluxo de **Heróis** e **Vilões**, mantendo o D616 em 3D e adicionando fichas completas e editáveis para o Mestre.

## Principais novidades da v5

### Painel de Vilões completo

Os cinco antagonistas principais da campanha já vêm cadastrados com os valores das fichas usadas no projeto:

- Doutor Octopus;
- Dentes-de-Sabre;
- Ossos Cruzados;
- Duende Verde;
- Senhor Sinistro.

Cada ficha inclui:

- Rank;
- Health máximo e atual;
- Focus máximo e atual;
- Damage Reduction;
- iniciativa;
- velocidade;
- habilidades MARVEL;
- defesa derivada da habilidade;
- ocupação;
- origem;
- equipes;
- base;
- poderes;
- Traits;
- Tags;
- função e gancho dentro da campanha.

Tudo pode ser editado pelo Mestre e fica salvo no navegador.

### Rastreador de combate dos vilões

Ao abrir uma ficha de vilão, o Mestre pode ajustar rapidamente:

- Health atual em `-10`, `-5`, `+5` ou `+10`;
- Focus atual em `-10`, `-5`, `+5` ou `+10`.

Os cards exibem barras visuais de Health e Focus para acompanhar o combate sem abrir a ficha inteira.

### Dados dos Heróis e Dados dos Vilões separados

Agora existem dois fluxos distintos:

- **Dados dos Heróis** — usado pelos jogadores;
- **Dados dos Vilões** — exclusivo do Mestre.

Os dois usam o mesmo sistema D616 em 3D, mas possuem:

- personagens diferentes;
- configuração própria de ação/TN;
- Edge/Trouble próprios;
- histórico separado;
- persistência separada.

Isso evita misturar rolagens do Mestre com as rolagens dos jogadores.

## Rolador D616

- três cubos 3D em CSS;
- Marvel Die no centro;
- TN configurável;
- Edge;
- Trouble;
- modificador da habilidade puxado automaticamente da ficha;
- modificador extra;
- Fantastic Success;
- Fantastic Failure;
- Ultimate Fantastic Success (`6 · M · 6`);
- histórico persistente.

## Anotações e exportação

- autosave local;
- anotações separadas para Jogador e Mestre;
- copiar tudo;
- exportar `.md`;
- exportar `.txt`;
- backup completo `.json`.

O backup da v5 inclui:

- heróis;
- vilões;
- campanha;
- desafio dos heróis;
- desafio dos vilões;
- histórico dos heróis;
- histórico dos vilões;
- anotações do perfil ativo.

## Persistência e migração

A v5 usa chaves separadas no `localStorage` para:

- heróis;
- vilões;
- campanha;
- desafio dos heróis;
- desafio dos vilões;
- histórico dos heróis;
- histórico dos vilões;
- notas do Jogador;
- notas do Mestre.

Dados da v4 são migrados automaticamente quando possível. Fichas de vilões novas são adicionadas sem sobrescrever os dados antigos dos heróis.

## Executar

O projeto continua 100% estático. Basta abrir `index.html`.

Para desenvolvimento local:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000
```

## Acesso do Mestre

A senha padrão continua em `script.js`:

```js
const MASTER_PASSWORD = 'ARACHNE';
```

> Como o projeto é estático, a senha é apenas um bloqueio de interface. Para uso público/multiusuário, implemente autenticação em backend.

## Estrutura

```text
arachne_v5/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Caminho para escalar depois

A próxima evolução natural é mover o estado hoje salvo em `localStorage` para uma API/banco de dados:

- autenticação real;
- Mestre e jogadores conectados simultaneamente;
- ficha de cada jogador vinculada à conta;
- fichas de vilões exclusivas do Mestre;
- TN publicado em tempo real;
- rolagens sincronizadas via WebSocket/SSE;
- Health/Focus dos vilões sincronizados entre dispositivos;
- histórico por sessão;
- backup/restauração da campanha pelo servidor.
