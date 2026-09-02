🕷️ RPG Arachne

Mesa virtual online para campanhas de Marvel Multiverse RPG.

O RPG Arachne é uma plataforma para criação e gerenciamento de mesas virtuais de Marvel Multiverse RPG, permitindo que Mestres criem campanhas, gerenciem personagens, sessões, fichas, PDFs, cenários e acompanhem o progresso da aventura em um único sistema.

O projeto foi desenvolvido para permitir tanto campanhas prontas quanto campanhas totalmente personalizadas, mantendo cada mesa independente das demais.

⸻

🎲 Principais funcionalidades

📚 Criação de campanhas

Ao criar uma nova mesa, o Mestre pode escolher entre três opções:

* Campanha pronta — cria uma cópia editável de um template existente.
* Em branco — inicia uma campanha sem heróis, vilões ou sessões.
* Importar PDF — cria uma campanha vazia e permite enviar o PDF utilizado pelo narrador.

Cada campanha criada possui seus próprios dados. Alterações realizadas em uma mesa não modificam os templates ou outras campanhas.

⸻

🦸 Elenco de personagens

O Mestre possui controle completo sobre o elenco da campanha.

É possível:

* Adicionar heróis;
* Remover heróis;
* Adicionar vilões;
* Remover vilões;
* Utilizar personagens da biblioteca do sistema;
* Criar personagens personalizados;
* Editar fichas completas;
* Adicionar imagens aos personagens;
* Enviar fichas em PDF.

A tela de entrada dos jogadores apresenta apenas os personagens que realmente pertencem à campanha.

O jogador pode selecionar seu personagem e editar somente as informações permitidas pelo sistema.

⸻

📖 Biblioteca de personagens

O projeto possui uma biblioteca de personagens do universo Marvel que pode ser utilizada na criação das campanhas.

Entre os personagens disponíveis estão:

* Homem-Aranha
* Wolverine
* Capitão América
* Pantera Negra
* Capitã Marvel
* Doutor Estranho
* Hulk
* Gavião Arqueiro
* Feiticeira Escarlate
* Shang-Chi
* Mulher-Hulk
* Visão
* Máquina de Combate
* Luke Cage
* Barão Zemo
* Encantadora
* Gambit
* Iceman
* Deadpool
* Entre outros.

Os personagens possuem informações de jogo como:

* Atributos;
* Health;
* Focus;
* Rank;
* Tier;
* Initiative;
* Speed;
* Powers;
* Traits;
* Tags;
* Role;
* Hook;
* Movement;
* Identidade;
* Ocupação;
* Origem;
* Equipes;
* Base;
* PDFs de ficha;
* Imagens/portraits.

A biblioteca também pode ser utilizada independentemente dos templates de campanha.

⸻

⚔️ Gerenciamento da campanha

O Mestre pode administrar diferentes aspectos da aventura diretamente pela plataforma.

Conteúdo

É possível:

* Alterar título;
* Alterar subtítulo;
* Editar o resumo;
* Escrever o conteúdo da campanha;
* Enviar ou substituir o PDF da campanha.

Sessões

O Mestre pode:

* Criar sessões;
* Editar sessões;
* Remover sessões;
* Acompanhar o progresso;
* Organizar o andamento da campanha.

⸻

🎭 Cenário e mesa virtual

O sistema permite acompanhar a situação da mesa durante a sessão, incluindo elementos como:

* Cenário;
* Peças/personagens;
* Iniciativa;
* Health;
* Focus;
* Rolagens;
* Histórico de ações;
* Estado da campanha.

Cada campanha possui seu próprio estado, permitindo que diferentes mesas sejam executadas de forma independente.

⸻

🎲 Rolagens e histórico

O sistema possui suporte para rolagens utilizadas durante o RPG.

As ações realizadas durante a sessão podem ser acompanhadas através do histórico da campanha.

Isso permite que Mestre e jogadores acompanhem os acontecimentos da mesa em tempo real.

⸻

📝 Anotações

A plataforma possui espaços de anotação para diferentes necessidades:

Jogadores

Cada jogador pode manter suas próprias anotações durante a campanha.

Mestre

O Mestre possui um espaço separado para suas anotações e informações de controle da aventura.

⸻

🔄 Sincronização em tempo real

As campanhas possuem sincronização em tempo real através de SSE (Server-Sent Events).

Isso permite que alterações realizadas durante a sessão sejam atualizadas para os participantes da campanha sem a necessidade de recarregar constantemente a página.

São sincronizados, entre outros:

* Heróis;
* Vilões;
* Health;
* Focus;
* Campanha;
* Progresso;
* Cenário;
* Peças;
* Iniciativa;
* Rolagens;
* Histórico;
* Anotações dos jogadores;
* Anotações do Mestre.

⸻

🗂️ Templates de campanhas

O projeto possui campanhas prontas que funcionam como modelos para novas mesas.

Atualmente estão disponíveis:

🕷️ Projeto Arachne

Campanha principal utilizada como base do projeto.

🛡️ Os Vingadores — Protocolo Destino

Campanha focada nos Vingadores clássicos e ameaças de grande escala.

❌ X-Men — Era do Apocalipse

Campanha focada no universo mutante e em uma realidade dominada pelo Apocalipse.

4️⃣ Quarteto Fantástico — A Zona Negativa

Campanha focada no Quarteto Fantástico e nas ameaças da Zona Negativa.

🌃 Sombras de Hell’s Kitchen

Campanha focada nos heróis urbanos da Marvel.

Os templates armazenam informações como:

* Estrutura da campanha;
* Elenco recomendado;
* Antagonistas;
* Sessões;
* Conteúdo inicial.

Ao criar uma campanha a partir de um template, o sistema cria uma cópia independente.

⸻

📎 Uploads

O sistema permite o envio de arquivos relacionados às campanhas e personagens.

Formatos aceitos

* PDF
* PNG
* JPEG
* WebP

Limite

30 MB por arquivo.

Os arquivos podem ser armazenados localmente ou no Supabase Storage, dependendo da configuração utilizada.

⸻

💾 Armazenamento

SQLite / Local

Quando utilizado localmente, os arquivos são armazenados em:

backend/uploads/

O banco de dados local fica dentro de:

backend/database/

⸻

☁️ Supabase

Quando o projeto utiliza Supabase, os arquivos são armazenados no Supabase Storage.

Configuração padrão:

DB_PROVIDER=supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta
SUPABASE_STORAGE_BUCKET=arachne-assets
SESSION_SECRET=uma-chave-grande-e-aleatoria
SERVE_FRONTEND=true
CORS_ORIGIN=*

A SUPABASE_SERVICE_ROLE_KEY é uma informação secreta e nunca deve ser exposta no frontend ou enviada para o GitHub.

Antes do primeiro deploy utilizando Supabase, execute:

backend/database/supabase.sql

no SQL Editor do Supabase.

⸻

🌐 Netlify + Render

O projeto pode utilizar uma arquitetura separada:

┌──────────────┐
│   Netlify    │
│   Frontend   │
└──────┬───────┘
       │
       │ API
       ▼
┌──────────────┐
│    Render    │
│   Backend    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Supabase   │
│ Database +   │
│   Storage    │
└──────────────┘

O frontend hospedado no Netlify não acessa diretamente o banco de dados.

A comunicação acontece através da API do backend Node.js hospedado no Render.

Caso a conexão automática não funcione, a tela inicial possui a opção CONEXÃO ONLINE, onde o Mestre pode informar manualmente a URL pública do backend.

Exemplo:

https://rpg-arachne.onrender.com/api

A URL configurada fica salva no navegador.

Para verificar se o backend está funcionando, acesse:

https://seu-backend.onrender.com/api/health

O resultado esperado é semelhante a:

{
  "ok": true
}

⸻

🔐 Autenticação e segurança

O backend possui sistema de autenticação e gerenciamento de sessão.

O projeto utiliza uma variável SESSION_SECRET para proteger as sessões.

Exemplo:

SESSION_SECRET=uma-chave-grande-e-aleatoria

Nunca publique chaves secretas no frontend, GitHub ou arquivos públicos.

⸻

🚀 Como executar localmente

1. Entre na pasta do backend

cd backend

2. Instale as dependências

npm install

3. Inicie o servidor

npm start

4. Acesse no navegador

http://localhost:3000

Para testar login, uploads, sincronização, banco de dados e múltiplas campanhas, utilize o servidor através do npm start em vez de abrir diretamente o arquivo frontend/index.html.

⸻

📁 Estrutura do projeto

projeto-arachne/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── api-client.js
│   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── templates.js
│   │   ├── files.js
│   │   ├── auth.js
│   │   └── db/
│   │
│   ├── database/
│   ├── uploads/
│   └── package.json
│
├── render.yaml
├── netlify.toml
└── README.md

⸻

🆕 Últimas atualizações

Biblioteca de personagens

* Expansão da biblioteca de personagens Marvel.
* Inclusão de novos heróis e vilões.
* Fichas completas com atributos, poderes, traits, tags e informações adicionais.
* Inclusão de portraits para os personagens.
* PDFs individuais das fichas.
* A biblioteca completa agora pode ser utilizada na criação de novas campanhas.

Sistema de campanhas

* Campanhas agora são independentes umas das outras.
* Templates são utilizados como modelos para novas mesas.
* Alterações feitas em uma campanha não modificam seu template original.
* Criação de campanhas em branco.
* Importação de PDF para novas campanhas.
* Elenco completamente editável pelo Mestre.

Gerenciamento de personagens

* Adição e remoção de heróis e vilões.
* Criação de personagens personalizados.
* Edição completa das fichas.
* Upload de imagens.
* Upload de PDFs.
* Seleção de personagens baseada no elenco real da campanha.

Mesa virtual

* Sistema de iniciativa.
* Controle de Health e Focus.
* Rolagens.
* Histórico de ações.
* Cenário e peças.
* Anotações para Mestre e jogadores.
* Sincronização em tempo real.

Infraestrutura

* Backend Node.js.
* Banco de dados SQLite para utilização local.
* Suporte ao Supabase.
* Supabase Storage para arquivos.
* Deploy do frontend no Netlify.
* Deploy do backend no Render.
* Comunicação entre frontend e backend através de API.
* Configuração manual da URL do backend pela tela inicial.
* Endpoint de verificação /api/health.

⸻

🛠️ Tecnologias

O projeto utiliza principalmente:

* HTML
* CSS
* JavaScript
* Node.js
* SQLite
* Supabase
* Server-Sent Events (SSE)
* Netlify
* Render

⸻

🎯 Objetivo do projeto

O RPG Arachne tem como objetivo oferecer uma experiência simples e centralizada para jogar Marvel Multiverse RPG online, permitindo que o Mestre tenha controle da campanha enquanto os jogadores acompanham seus personagens e o andamento da aventura.

A plataforma busca unir:

📚 Campanhas + 🦸 Personagens + 🎲 Rolagens + ⚔️ Combate + 📝 Anotações + 🔄 Sincronização

em uma única mesa virtual.