# Contexto do projeto — Minha Loja Inteligente

## Stack e publicação
- Vite + React 19 + Tailwind CSS 4, com React Router 7 e lucide-react.
- Build: `vite build` → `dist`. Sem novos plugins no Vite.
- `vercel.json` encaminha rotas da SPA ao index.html, preservando imagens e assets.
- `src/index.css`: tokens semânticos em OKLCH, @theme inline, estilos próprios e breakpoints mobile. Tema claro marfim, verde profundo e dourado discreto. Fontes locais do sistema, sem serviços externos.

## Escopo entregue — parte 1 de 3
- `/`: central premium de acesso, avaliação Google no endereço solicitado, contato configurável e acesso à loja.
- `/loja`: Atelier Aura demonstrativa com 12 produtos, categorias, busca, filtros por coleção e ordenação, detalhes e inclusão na sacola limitada ao estoque.
- `/sacola`: quantidades, remoção, subtotal original, descontos, total dos produtos, dados da cliente, observações, prévia e cópia da mensagem e abertura do WhatsApp quando configurado.
- Configuração local pelo rodapé ou faixa da loja: nome comercial, WhatsApp com código do país, entrega e pagamento.
- Dados de catálogo, estoque, preços e seleção de mais vendidos são explicitamente demonstrativos. Não existe pagamento online nem confirmação automática de venda/envio de mensagem.

## Mapa dos arquivos
- `src/App.jsx`: rotas, cabeçalho/rodapé, overlays de contato e configuração, títulos e página não encontrada.
- `src/pages/Access.jsx`, `Store.jsx`, `Bag.jsx`: central, loja e sacola.
- `src/components/UI.jsx`: marca, navegação, rodapé, modal com foco contido e quantidade.
- `src/components/Product.jsx`: imagem/fallback ilustrado, cartão e detalhes do produto.
- `src/components/DemoSettings.jsx`: configuração local e contato.
- `src/data/demo.js`: STORE_ID, chave de armazenamento, 12 produtos, configurações iniciais e utilitários. Valores monetários são centavos inteiros.
- `src/store/StoreContext.jsx`: estado persistente em localStorage, sacola, totais, rascunhos e feedback. Erros de armazenamento aparecem para a pessoa usuária.
- `public/images/jewelry-editorial.jpg`: campanha gerada para a demonstração.
- `public/images/products-essentials.jpg` e `products-signature.jpg`: duas fotografias em grade 2×2, recortadas por CSS para oito produtos. Os quatro produtos restantes usam SVG claramente identificado como ilustração; a geração da última imagem ficou indisponível.

## Persistência e limites importantes
- Chave local: `minha-loja:v1:atelier-aura-demo`. Estado com `version`, `storeId`, `settings`, `products`, `cart`, `orders`.
- Produtos e rascunhos incluem storeId; futura multiloja requer autenticação e isolamento real no servidor, não apenas chaves locais.
- Rascunhos incluem id, createdAt, status `rascunho`, demo, customer, lines, subtotal, discount, total e fingerprint. Mesmo conteúdo reutiliza o rascunho existente. Rascunho NÃO é pedido recebido, venda, pagamento ou conversão de indicação.
- WhatsApp começa vazio propositalmente. Configurar número de teste para abrir contato/pedido. Nenhum telefone real foi inventado.
- Dados são locais ao navegador/dispositivo, não compartilhados com outras pessoas e sujeitos à limpeza do armazenamento. Usar dados fictícios na apresentação.
- Sem integração de banco ou autenticação nesta etapa. A configuração local não é apresentada como área administrativa protegida. Nenhuma alteração SQL foi executada.

## Parte 2 entregue — painel e operação demonstrativa
- `/painel/*`: entrada explícita de demonstração sem senha e sem autenticação real. Aceite em sessionStorage não é barreira de segurança. Acesso pelo cabeçalho, faixa mobile e rodapé.
- `/painel`: indicadores calculados dos registros locais, filtros de 7/30/90 dias ou histórico completo e gráfico em sete intervalos. Faturamento, ticket médio e descontos consideram apenas pedidos concluídos por data de conclusão. Estoque e total de clientes são indicadores atuais, identificados como tal.
- `/painel/produtos`: cadastro/edição/exclusão, categoria livre, preço original/atual, estoque disponível, ativação, destaques e lançamentos. Produtos com histórico não podem ser excluídos; podem ser desativados.
- `/painel/promocoes`: campanhas agendadas por período, desconto percentual, valor fixo por unidade e combos. Combos exigem todos os produtos selecionados e quantidade mínima total. Vale o menor preço, sem acumular descontos; pedidos históricos preservam seus valores.
- `/painel/pedidos`: busca, período, status, detalhes e linha do tempo. Fluxo rascunho → novo → atendimento/confirmado → concluído; cancelamento antes da conclusão. Confirmar valida e desconta estoque uma vez; cancelar devolve reserva uma vez. Concluídos/cancelados são definitivos nesta versão. Abrir WhatsApp não muda status automaticamente.
- `/painel/clientes`: cadastro/edição, telefone único normalizado, busca, segmentos de novas/frequentes/inativas, histórico, total concluído e última compra. Cadastro com pedidos não pode ser excluído. A sacola associa rascunhos ao cadastro pelo telefone.
- `/painel/configuracoes`: identidade, logo, capa, cor com ajuste de contraste, textos do banner, WhatsApp, Instagram, endereço, horários, entrega, pagamento e regras. Atualiza a loja neste navegador, não outros dispositivos.
- Upload local de JPG/PNG/WebP, otimizado em canvas. Fotos novas usam enquadramento individual; fotos demonstrativas antigas mantêm recorte de grade. Aviso persistente se armazenamento falhar.
- Estado versionado para 2, mantendo a chave local antiga e migrando configurações, catálogo, sacola e rascunhos. Inclui quatro clientes e seis pedidos fictícios e uma campanha; exemplos não são reinseridos ao recarregar.
- `src/pages/Admin.jsx`: shell, entrada demonstrativa e rotas internas. `src/pages/admin/*`: Dashboard, Products, Promotions, Operations (pedidos/clientes), Settings e admin.css.
- `src/components/AdminUI.jsx`: formulários, upload, confirmação, tabela de itens e componentes compartilhados.
- `src/store/operations.js`: validações e transições de estado puras. `src/data/demo.js`: migração, exemplos e cálculo de campanhas. `src/store/StoreContext.jsx`: estado local compartilhado, associação de clientes e sacola com descontos.
- Nenhuma integração Supabase ou alteração SQL nesta etapa. Produção exige autenticação, autorização por loja, RLS, armazenamento de imagens e política de dados pessoais; requisitos explicitados na entrada e nas configurações.

## Próxima parte aprovada — ainda não implementada
3. Indicações com compra válida e benefícios sem duplicação, estúdio de divulgação, notificações, QR Code funcional/NFC e apresentação comercial com preço editável (inicialmente R$ 249,90, pagamento único, sem mensalidade).

## Validação
- Revisão estática dos fluxos durante a implementação; não há execução de build ou navegador disponível nesta sessão.
- Adicionados testes em `tests/operations.test.js` e comando `npm test` (Node 20+): reserva e devolução de estoque sem duplicação, bloqueio de estoque insuficiente, integridade histórica, telefone único, campanhas por período, combos e migração. Testes foram escritos, mas não executados nesta sessão.
- Conferir a parte 2 após sincronização: entrar pelo link Painel demonstrativo; criar produto com foto e categoria; recarregar; editar estoque/preços; agendar campanha e montar combo na sacola; abrir o rascunho em Pedidos e avançar status; verificar estoque e métricas; editar cliente e consultar histórico; salvar logo/capa/contato e voltar à loja. Conferir também em celular.
- Conferir após sincronização no Lovable: central e link Google; filtros e detalhes; limites de estoque e quantidades; totais/descontos; persistência ao recarregar; configuração do número; prévia/cópia/abertura do WhatsApp; navegação direta nas rotas e layout em celular.
- Não alegar confirmação de envio pelo WhatsApp: o envio depende da ação da pessoa no aplicativo.
