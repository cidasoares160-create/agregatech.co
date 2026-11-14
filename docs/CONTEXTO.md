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

## Próximas partes aprovadas
2. Painel administrativo demonstrativo, indicadores calculados, produtos/estoque/promoções, pedidos, clientes/histórico e personalização. Deixar explícita a configuração necessária para produção e não apresentar autenticação local como segurança real.
3. Indicações com compra válida e benefícios sem duplicação, estúdio de divulgação, notificações, QR Code funcional/NFC e apresentação comercial com preço editável (inicialmente R$ 249,90, pagamento único, sem mensalidade).

## Validação
- Revisão estática dos fluxos durante a implementação; não há execução de build ou navegador disponível nesta sessão.
- Conferir após sincronização no Lovable: central e link Google; filtros e detalhes; limites de estoque e quantidades; totais/descontos; persistência ao recarregar; configuração do número; prévia/cópia/abertura do WhatsApp; navegação direta nas rotas e layout em celular.
- Não alegar confirmação de envio pelo WhatsApp: o envio depende da ação da pessoa no aplicativo.
