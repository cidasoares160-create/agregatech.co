# Etapa 3 — Crescimento comercial demonstrativo

## Telas e caminhos
- Loja → cartão “Indique e ganhe”, também disponível no rodapé e em `/indique`.
- Central de acesso → apresentação do investimento → `/solucao`.
- Painel → Indique e ganhe: regras, convites, conversões e resgate de créditos.
- Painel → Estúdio de divulgação: seis canais, modelos comerciais, segmentos de relacionamento e rascunhos editáveis persistentes.
- Painel → Notificações: condições calculadas dos registros locais e marcação de leitura.
- Painel → Placa & proposta: investimento editável, endereço público, QR Code SVG real e instruções de NFC.
- Clientes → Histórico: código, indicações e benefícios disponíveis.

## Persistência e limites
Continua sendo uma demonstração local, sem autenticação real nem sincronização. Não inserir informações reais. `withGrowth` complementa o estado existente sem substituir catálogo, pedidos, configurações ou cadastros. Os códigos são únicos dentro da base local, não globalmente entre dispositivos. Nenhuma alteração no Supabase foi executada nesta etapa.

A URL pública é configurável, mas não publica o site e não transfere os dados locais. Antes de imprimir, testar o QR Code em outro aparelho fora do editor. NFC depende de etiqueta física e gravação externa da mesma URL; a aplicação não grava chips. Custos físicos e serviços externos não são prometidos como incluídos ou gratuitos.

## Regras de indicação
- Link com `?ref=CODIGO` guarda o código; visita não gera indicação nem venda.
- Preparar um pedido cria a indicação pendente, com cópia das regras daquele momento.
- Autoindicação, código desconhecido e outra indicação ativa para a mesma cliente/telefone são bloqueados.
- Compra anterior recebida bloqueia novos vínculos; uma compra concluída anterior torna a conversão inelegível.
- Apenas primeira compra concluída manualmente e acima do mínimo converte. Cancelados não convertem.
- Créditos são agrupados por beneficiária e versão das regras; um lote só é liberado quando alcança o mínimo. Cada indicação só pode participar de um benefício.
- Valor fixo por indicação ou percentual sobre o total líquido da compra válida. Validade começa na conversão que completa o lote.
- Um benefício por pedido novo/em atendimento da beneficiária, com total suficiente para consumir integralmente o crédito. Acumula com os preços dos produtos, sem saque ou saldo parcial.
- Aplicação reserva o crédito. Conclusão o utiliza. Cancelamento o libera, mantendo a validade original. Mensagens já copiadas não mudam: comunicar o novo total manualmente.

## Roteiro de revisão no preview
1. Entrar no painel, aceitar o ambiente demonstrativo e abrir Indique e ganhe.
2. Copiar um link de cliente de exemplo e abri-lo no mesmo navegador.
3. Adicionar uma peça de valor superior ao mínimo; usar nome e telefone fictícios novos na sacola. Conferir código e mensagem.
4. Preparar novamente a mesma mensagem: deve reutilizar o rascunho, sem duplicar indicação.
5. No painel, avançar o pedido para novo, confirmado e concluído. Antes da conclusão não deve haver benefício. Depois, conferir a conversão e o crédito.
6. Atualizar a página: o benefício e a indicação devem permanecer únicos.
7. Montar pedido com o telefone da beneficiária, removendo o código da sacola; marcar novo. Aplicar seu benefício no painel e conferir o desconto no detalhe do pedido.
8. Cancelar esse pedido: crédito volta a ficar disponível até a validade original. Repetir com outro pedido e concluir: crédito fica utilizado.
9. Experimentar autoindicação, compra abaixo do mínimo e código inexistente. Conferir mensagens e ausência de crédito indevido.
10. Editar um texto no Estúdio, atualizar a página e verificar persistência. Testar copiar, compartilhamento e restauração do modelo atualizado.
11. Marcar alertas como lidos; atualizar e verificar a marcação. Ajustar estoque ou status e verificar as condições atualizadas.
12. Alterar investimento e conferir na central e na apresentação. Configurar URL pública, baixar QR SVG e testar com câmera em outro aparelho. Confirmar a URL de destino, não apenas a imagem do QR.
13. Revisar sacola, rodapé, menu horizontal do painel, formulários e placa em celular e desktop.

## Testes automatizados adicionados
`tests/growth.test.js` cobre códigos, migração complementar, ausência de conversão por visita/rascunho, duplicidade, autoindicação, cancelamento, mínimo, regras preservadas, percentual, expiração, reserva, uso e devolução de crédito, além da configuração comercial. Executar `npm test` e `npm run build` no ambiente do projeto. Os testes e o build não foram executados pelo ambiente de edição desta etapa; o roteiro de navegador acima ainda precisa ser validado no preview publicado.
