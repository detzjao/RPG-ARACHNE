# v44 — Edge + Trouble na Central

## Interface

- Adicionados controles compactos de **Edge** e **Trouble** ao lado do TN na Central de Ações.
- Os controles aparecem para Jogador, Mestre e modo Solo em qualquer categoria que faça uma rolagem D616.
- Movimento continua sem os controles, pois não gera rolagem pela Central.
- Edge e Trouble aceitam valores de 0 a 6.
- O resultado mostra quais valores de Edge/Trouble foram aplicados àquela rolagem.
- Quando há Edge líquido, o usuário continua clicando diretamente no dado que deseja rerrolar e pode encerrar antes com **USAR RESULTADO**.
- Trouble continua sendo resolvido no servidor e mantém o pior resultado conforme o motor existente.
- Edge e Trouble continuam se anulando um a um no motor de regras já existente.

## Backend

- Jogadores agora podem enviar Edge/Trouble especificamente para a própria rolagem.
- A alteração não cria alvo, não aplica dano automaticamente e não muda o modelo de apoio de mesa.
- Mestre e modo Solo continuam usando o mesmo endpoint e o mesmo motor D616.
