import { STORE_ID, phoneKey, validPhone, validStorePhone, transitions } from '../data/demo.js';
import { withGrowth, reconcileGrowth, redeemReward, validateGrowth } from './growth.js';

const stamp = () => new Date().toISOString();
const fail = message => { throw new Error(message); };
const finite = value => Number.isFinite(value);
export function imageAllowed(value) {
  return !value || /^data:image\/(png|jpeg|webp);base64,/.test(value) || /^\/images\/[\w.-]+$/.test(value) || /^https:\/\//.test(value);
}
export function operate(original, action, data) {
  const state = withGrowth(original);
  if (action === 'reward') return reconcileGrowth(redeemReward(state, data));
  if (action === 'referralCode') return { ...state, referralCode: String(data || '').trim().toUpperCase().slice(0, 32) };
  if (action === 'readAlerts') return { ...state, readAlerts: [...new Set([...state.readAlerts, ...data])].slice(-1000) };
  if (action === 'marketing') return { ...state, marketingDrafts: { ...state.marketingDrafts, [data.key]: String(data.text).slice(0, 6000) } };
  if (action === 'settings') {
    data = { ...state.settings, ...data, referralRules: { ...state.settings.referralRules, ...data.referralRules } };
    validateGrowth(data);
  }
  if (action === 'customer' && data.id) data = { ...data, referralCode: state.customers.find(c => c.id === data.id)?.referralCode };
  if (action === 'deleteCustomer' && (state.referrals.some(r => r.customerId === data || r.referrerId === data) || state.rewards.some(r => r.customerId === data))) fail('Esta cliente tem histórico de indicações ou benefícios e não pode ser excluída.');
  return reconcileGrowth(baseOperate(state, action, data));
}
function baseOperate(state, action, data) {
  if (action === 'product') {
    const product = { ...data, name: data.name.trim(), category: data.category.trim(), updatedAt: stamp(), storeId: STORE_ID };
    if (product.name.length < 2 || !product.category || !product.description.trim()) fail('Preencha nome, categoria e descrição.');
    if (![product.price, product.originalPrice].every(v => Number.isSafeInteger(v) && v > 0) || product.price > product.originalPrice) fail('Informe preços positivos; o promocional não pode superar o original.');
    if (!Number.isSafeInteger(product.stock) || product.stock < 0) fail('O estoque deve ser um número inteiro positivo ou zero.');
    if (!imageAllowed(product.image)) fail('Use uma imagem enviada ou um endereço HTTPS.');
    product.id ||= crypto.randomUUID();
    return { ...state, products: state.products.some(p => p.id === product.id) ? state.products.map(p => p.id === product.id ? product : p) : [...state.products, product] };
  }
  if (action === 'deleteProduct') {
    if (state.orders.some(o => o.lines.some(l => l.productId === data))) fail('Este produto tem histórico de pedidos. Desative-o para preservar o histórico.');
    return { ...state, products: state.products.filter(p => p.id !== data), cart: state.cart.filter(l => l.productId !== data), promotions: state.promotions.map(p => ({ ...p, productIds: p.productIds.filter(id => id !== data) })) };
  }
  if (action === 'customer') {
    const customer = { ...data, name: data.name.trim(), phone: data.phone.trim(), storeId: STORE_ID, demo: true };
    if (customer.name.length < 2 || !validPhone(customer.phone)) fail('Informe nome e telefone válido com DDD.');
    if (state.customers.some(c => c.id !== customer.id && phoneKey(c.phone) === phoneKey(customer.phone))) fail('Já existe uma cliente com este telefone.');
    customer.id ||= crypto.randomUUID(); customer.createdAt ||= stamp();
    return { ...state, customers: state.customers.some(c => c.id === customer.id) ? state.customers.map(c => c.id === customer.id ? customer : c) : [...state.customers, customer] };
  }
  if (action === 'deleteCustomer') {
    if (state.orders.some(o => o.customerId === data)) fail('Clientes com pedidos não podem ser excluídas. Você pode editar o cadastro.');
    return { ...state, customers: state.customers.filter(c => c.id !== data) };
  }
  if (action === 'promotion') {
    const promo = { ...data, name: data.name.trim(), storeId: STORE_ID };
    if (promo.name.length < 2 || !promo.productIds.length || promo.productIds.some(id => !state.products.some(p => p.id === id))) fail('Informe o nome e selecione produtos existentes.');
    if (!finite(new Date(promo.startsAt).getTime()) || !finite(new Date(promo.endsAt).getTime()) || new Date(promo.startsAt) >= new Date(promo.endsAt)) fail('O término precisa ser posterior ao início da campanha.');
    if (!['percent', 'fixed', 'combo'].includes(promo.type) || !finite(promo.value) || promo.value <= 0 || (promo.type !== 'fixed' && promo.value >= 100)) fail('Informe desconto positivo, menor que 100% para percentuais.');
    if (promo.type === 'fixed' && (!Number.isSafeInteger(promo.value) || promo.productIds.some(id => state.products.find(p => p.id === id).originalPrice <= promo.value))) fail('O desconto fixo deve ser menor que o preço original de cada produto.');
    if (promo.type === 'combo' && (promo.productIds.length < 2 || !Number.isSafeInteger(promo.minQuantity) || promo.minQuantity < promo.productIds.length)) fail('O combo precisa de pelo menos dois produtos e quantidade mínima igual ou maior que o número de produtos selecionados.');
    promo.id ||= crypto.randomUUID();
    return { ...state, promotions: state.promotions.some(p => p.id === promo.id) ? state.promotions.map(p => p.id === promo.id ? promo : p) : [...state.promotions, promo] };
  }
  if (action === 'deletePromotion') return { ...state, promotions: state.promotions.filter(p => p.id !== data) };
  if (action === 'status') {
    const order = state.orders.find(o => o.id === data.id);
    if (!order || !transitions[order.status]?.includes(data.status)) fail('Esta mudança de status não está disponível.');
    let products = state.products;
    let reserved = Boolean(order.stockReserved);
    if (data.status === 'confirmado') {
      for (const line of order.lines) {
        const product = products.find(p => p.id === line.productId);
        if (!product || !product.active || product.stock < line.quantity) fail(`Estoque indisponível para ${line.name}. Ajuste o produto antes de confirmar.`);
      }
      products = products.map(p => ({ ...p, stock: p.stock - order.lines.filter(l => l.productId === p.id).reduce((s, l) => s + l.quantity, 0) }));
      reserved = true;
    }
    if (data.status === 'cancelado' && reserved) {
      products = products.map(p => ({ ...p, stock: p.stock + order.lines.filter(l => l.productId === p.id).reduce((s, l) => s + l.quantity, 0) }));
      reserved = false;
    }
    const at = stamp();
    const updated = { ...order, status: data.status, stockReserved: reserved, updatedAt: at, completedAt: data.status === 'concluido' ? at : order.completedAt, history: [...(order.history || []), { status: data.status, at, note: 'Alteração manual no painel demonstrativo.' }] };
    return { ...state, products, orders: state.orders.map(o => o.id === updated.id ? updated : o) };
  }
  if (action === 'settings') {
    if (data.name.trim().length < 2) fail('Informe o nome comercial.');
    if (data.whatsapp && !validStorePhone(data.whatsapp)) fail('Informe WhatsApp com código do país e DDD.');
    if (!imageAllowed(data.logo) || !imageAllowed(data.cover)) fail('Use uma imagem enviada ou endereço HTTPS.');
    if (!/^#[0-9a-f]{6}$/i.test(data.color)) fail('Selecione uma cor válida.');
    if (data.instagram && !/^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/.test(data.instagram)) fail('Use o endereço completo do perfil no Instagram, sem parâmetros.');
    return { ...state, settings: { ...state.settings, ...data, name: data.name.trim(), whatsapp: data.whatsapp.replace(/\D/g, '') } };
  }
  return state;
}
