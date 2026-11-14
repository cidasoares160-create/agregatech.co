export const STORE_ID = 'atelier-aura-demo';
export const STORAGE_KEY = `minha-loja:v1:${STORE_ID}`;
export const money = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJG2MISRcvyJMRPUi6_SsKkLU';
export const categories = ['Todos', 'Brincos', 'Colares', 'Pulseiras', 'Anéis', 'Acessórios'];
export const initialSettings = {
  name: 'Atelier Aura', tagline: 'Pequenos detalhes. Grandes histórias.', whatsapp: '',
  delivery: 'Entrega e retirada a combinar diretamente com a representante.',
  payment: 'Consulte as formas de pagamento com a representante. Nenhum pagamento é realizado neste site.',
};
const essentials = '/images/products-essentials.jpg';
const signature = '/images/products-signature.jpg';
const makeProduct = (id, name, category, price, originalPrice, stock, image, quadrant, extra = {}) => ({
  id, storeId: STORE_ID, name, category, price, originalPrice, stock, image, quadrant,
  active: true, featured: false, isNew: false,
  description: 'Um toque de elegância para acompanhar seus momentos. Peça demonstrativa com acabamento dourado e design delicado. As imagens são ilustrativas; materiais, medidas e disponibilidade devem ser confirmados com a representante.',
  ...extra,
});
export const initialProducts = [
  makeProduct('argola-elo', 'Argola Elo Dourada', 'Brincos', 5990, 7990, 12, essentials, 0, { featured: true, bestSeller: true, detail: 'Par de argolas • diâmetro demonstrativo de 2 cm' }),
  makeProduct('colar-perola', 'Colar Pérola Serena', 'Colares', 8990, 11990, 8, essentials, 1, { featured: true, detail: 'Corrente delicada • comprimento demonstrativo de 45 cm' }),
  makeProduct('bracelete-luna', 'Bracelete Luna', 'Pulseiras', 7490, 7490, 6, essentials, 2, { isNew: true, detail: 'Modelo aberto • ajuste delicado' }),
  makeProduct('anel-luz', 'Anel Ponto de Luz', 'Anéis', 4990, 6990, 15, essentials, 3, { bestSeller: true, detail: 'Aro demonstrativo 18 • confirme seu tamanho antes de pedir' }),
  makeProduct('brinco-esmeralda', 'Brinco Jardim', 'Brincos', 9990, 12990, 5, signature, 0, { featured: true, isNew: true, detail: 'Par de brincos • pedra verde ilustrativa' }),
  makeProduct('colar-estrela', 'Colar Céu de Estrelas', 'Colares', 7990, 7990, 9, signature, 1, { isNew: true, detail: 'Duas camadas • pingente em formato de estrela' }),
  makeProduct('pulseira-cristal', 'Pulseira Lumière', 'Pulseiras', 11990, 14990, 3, signature, 2, { featured: true, bestSeller: true, detail: 'Pedras transparentes • comprimento demonstrativo de 18 cm' }),
  makeProduct('anel-organico', 'Anel Orgânico Aura', 'Anéis', 6990, 8990, 7, signature, 3, { isNew: true, detail: 'Design escultural • aro demonstrativo 18' }),
  makeProduct('brinco-perola', 'Brinco Pérola Essencial', 'Brincos', 3990, 4990, 20, null, 0, { artwork: 'earrings', bestSeller: true, detail: 'Par de brincos • pérolas ilustrativas' }),
  makeProduct('colar-afeto', 'Colar Afeto', 'Colares', 6490, 8490, 11, null, 0, { artwork: 'necklace', detail: 'Pingente de coração • corrente demonstrativa de 45 cm' }),
  makeProduct('pulseira-encanto', 'Pulseira Encanto', 'Pulseiras', 5490, 5490, 4, null, 0, { artwork: 'bracelet', isNew: true, detail: 'Corrente com três pingentes • comprimento demonstrativo de 18 cm' }),
  makeProduct('presilha-dourada', 'Presilha Aurora', 'Acessórios', 3490, 4490, 0, null, 0, { artwork: 'barrette', detail: 'Acessório de cabelo • formato oval' }),
];
export const adminDefaults = {
  logo: '', cover: '/images/jewelry-editorial.jpg', color: '#28594d', instagram: '', address: '', hours: '', rules: '',
  campaignTitle: 'Para brilhar. Do seu jeito.', campaignText: 'Peças que contam histórias. Detalhes que revelam você.',
};
export const orderStatuses = { rascunho: 'Rascunho', novo: 'Novo pedido', atendimento: 'Em atendimento', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' };
export const transitions = {
  rascunho: ['novo', 'cancelado'], novo: ['atendimento', 'confirmado', 'cancelado'],
  atendimento: ['confirmado', 'cancelado'], confirmado: ['concluido', 'cancelado'], concluido: [], cancelado: [],
};
export const phoneKey = value => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
};
export function demoOperations() {
  const ago = days => new Date(Date.now() - days * 86400000).toISOString();
  const customers = [
    { id: 'cliente-demo-1', name: 'Marina · Exemplo', phone: '11900000001', createdAt: ago(65), notes: 'Perfil fictício: prefere peças delicadas.' },
    { id: 'cliente-demo-2', name: 'Helena · Exemplo', phone: '21900000002', createdAt: ago(20), notes: 'Perfil fictício: gosta de novidades.' },
    { id: 'cliente-demo-3', name: 'Beatriz · Exemplo', phone: '31900000003', createdAt: ago(4), notes: 'Perfil fictício para apresentação.' },
    { id: 'cliente-demo-4', name: 'Sofia · Exemplo', phone: '41900000004', createdAt: ago(2), notes: '' },
  ].map(c => ({ ...c, storeId: STORE_ID, demo: true }));
  const specs = [[0, 0, 2, 48, 'concluido'], [0, 1, 1, 8, 'concluido'], [1, 4, 1, 12, 'concluido'], [2, 2, 2, 3, 'confirmado'], [3, 6, 1, 1, 'novo'], [1, 3, 1, 2, 'atendimento']];
  const orders = specs.map(([ci, pi, quantity, days, status], i) => {
    const p = initialProducts[pi]; const c = customers[ci]; const createdAt = ago(days);
    return { id: `demo000${i + 1}-pedido`, storeId: STORE_ID, demo: true, customerId: c.id,
      customer: { name: c.name, phone: c.phone, notes: 'Pedido fictício para apresentação.' }, createdAt, status,
      completedAt: status === 'concluido' ? createdAt : null, stockReserved: ['concluido', 'confirmado'].includes(status),
      lines: [{ productId: p.id, name: p.name, quantity, price: p.price, originalPrice: p.originalPrice }],
      subtotal: p.originalPrice * quantity, total: p.price * quantity, discount: (p.originalPrice - p.price) * quantity,
      history: [{ status, at: createdAt, note: 'Registro de exemplo; estoque inicial já considera esta operação.' }],
    };
  });
  const promotions = [{ id: 'campanha-essencia', storeId: STORE_ID, name: 'Essência · seleção da semana',
    description: '12% de desconto nos favoritos selecionados. Vale o menor preço, sem acumular descontos.',
    type: 'percent', value: 12, productIds: ['bracelete-luna', 'colar-estrela'], minQuantity: 2,
    startsAt: ago(3), endsAt: ago(-12), active: true }];
  return { customers, orders, promotions };
}
export function initialState() {
  return { version: 2, storeId: STORE_ID, settings: { ...initialSettings, ...adminDefaults }, products: initialProducts.map(p => ({ ...p })), cart: [], ...demoOperations() };
}
export function migrateState(saved) {
  if (!saved || saved.storeId !== STORE_ID || !Array.isArray(saved.products) || !Array.isArray(saved.orders) || !Array.isArray(saved.cart) || !saved.settings) return initialState();
  if (saved.version === 2) return { ...saved, settings: { ...adminDefaults, ...saved.settings } };
  const seed = demoOperations();
  const customers = [...seed.customers];
  const orders = saved.orders.map(o => {
    let customer = customers.find(c => phoneKey(c.phone) === phoneKey(o.customer.phone));
    if (!customer) { customer = { id: crypto.randomUUID(), storeId: STORE_ID, demo: true, name: o.customer.name, phone: o.customer.phone, notes: '', createdAt: o.createdAt }; customers.push(customer); }
    return { ...o, customerId: customer.id, history: [{ status: o.status, at: o.createdAt, note: 'Rascunho migrado da loja.' }] };
  });
  return { ...saved, version: 2, settings: { ...adminDefaults, ...saved.settings }, customers, orders: [...orders, ...seed.orders], promotions: seed.promotions };
}
export function activePromotions(promotions, now = Date.now()) {
  return promotions.filter(p => p.active && new Date(p.startsAt).getTime() <= now && new Date(p.endsAt).getTime() >= now);
}
export function discountedProduct(product, promotions, cart = null) {
  let price = product.price; let campaign = '';
  for (const promo of promotions) {
    if (!promo.productIds.includes(product.id)) continue;
    if (promo.type === 'combo' && (!cart || !promo.productIds.every(id => cart.some(l => l.productId === id && l.quantity > 0)) || cart.filter(l => promo.productIds.includes(l.productId)).reduce((s, l) => s + l.quantity, 0) < promo.minQuantity)) continue;
    const candidate = promo.type === 'fixed' ? Math.max(1, product.originalPrice - promo.value) : Math.max(1, Math.round(product.originalPrice * (1 - promo.value / 100)));
    if (candidate < price) { price = candidate; campaign = promo.name; }
  }
  return { ...product, price, campaign };
}
export function whatsappUrl(phone, text) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
export function validPhone(phone) {
  return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
}
export function validStorePhone(phone) {
  return /^[1-9]\d{10,14}$/.test(phone.replace(/\D/g, ''));
}
