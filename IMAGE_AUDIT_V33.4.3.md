# Auditoria de imagens — RPG Arachne v33.4.3

## Resumo

A auditoria confirma que o Arachne **não armazena bytes/base64/BLOB de imagens nas tabelas do banco**. O estado de personagens guarda somente a referência (`image`) como caminho local de asset ou URL pública. O schema SQLite usa `state_value TEXT` e o Supabase usa `state_value jsonb`; arquivos enviados pelo Mestre continuam no mecanismo de assets existente (`Supabase Storage` quando configurado ou `backend/uploads` no fallback local).

## Armazenamento

- Retratos oficiais embarcados: `frontend/assets/portraits/*.webp`.
- Miniaturas derivadas: `frontend/assets/portraits/thumbs/*.webp`.
- Uploads/importações do Mestre: Supabase Storage existente ou `backend/uploads`.
- Banco: somente URL/caminho/identificador dentro do objeto do personagem.
- Nenhuma ocorrência de `data:image`, BLOB ou `bytea` para retratos foi encontrada no projeto.

## Tamanho medido

Antes da auditoria:
- 53 retratos WebP: **4.098.026 bytes (~3,91 MB)**.

Depois:
- 53 retratos de qualidade principal: **3.925.234 bytes (~3,74 MB)**.
- 53 miniaturas até 320 px: **808.236 bytes (~0,77 MB)**.
- Média por miniatura: **~14,9 KB**.
- Payload potencial de avatar/token: redução de **~80,3%** comparado a carregar os retratos principais.

Somente `villain-molecule-man.webp` e `villain-kingpin.webp` apresentaram redução material com reencode WebP de alta qualidade; os demais foram preservados porque recomprimir não traria ganho real. PSNR aproximado dos dois reencodes ficou acima de 36 dB.

## Contextos

Versão principal:
- cards grandes;
- ficha/resumo;
- administração/preview de imagem.

Miniatura:
- seleção de jogador;
- roster da campanha;
- biblioteca de personagens;
- Central do Mestre;
- Central do Jogador;
- combate/iniciativa;
- token do grid;
- minimapa do cenário.

Para imagens customizadas do Storage que não possuem thumbnail derivada local, o sistema usa a URL original, preservando compatibilidade.

## Cache

Retratos locais recebem query de versão (`v=33.4.3`) no momento da renderização e podem usar cache longo com segurança. Netlify e o servidor local passam a responder `/assets/portraits/*` com:

`Cache-Control: public, max-age=31536000, immutable`

Uploads locais já usavam URL única e cache imutável. Atualizações de Health, Focus, iniciativa ou SSE podem reconstruir o DOM, mas a URL da imagem continua idêntica; o navegador/CDN reutiliza o asset em cache em vez de transferi-lo novamente.

## Uploads e deduplicação

Uploads de imagens continuam usando o endpoint e o Storage existentes. Para novas imagens:
- limite server-side: 12 MB;
- SHA-256 do conteúdo define o caminho do objeto dentro da campanha;
- reenviar exatamente a mesma imagem reutiliza o mesmo objeto em vez de criar outro UUID;
- no navegador, imagens realmente grandes podem ser reduzidas para até 1600 px e WebP 84% antes do envio, somente quando o resultado for pelo menos 5% menor;
- PDFs mantêm o fluxo anterior e limite de 30 MB.

O isolamento continua por `campaignId` no caminho do Storage.

## Realtime

Não foi criado realtime adicional. Continua existindo uma única `EventSource`. A troca de imagem atualiza a referência do personagem via estado/SSE. Alterações de Health/Focus/combate não mudam a URL da imagem e, com cache imutável, não causam nova transferência do retrato.

## Banco

Nenhuma migração foi necessária. Não existe coluna binária para imagem. O banco armazena somente referências no JSON de `heroes`/`villains`.
