import { STORE_ID, phoneKey } from '../data/demo.js';

export const growthDefaults = { commercialPrice: 24990, publicUrl: '', referralRules: { enabled: true, type: 'fixed', value: 1500, minimum: 1, minimumPurchase: 5000, validityDays: 30 } };
const day = 86400000;
const fail = message => { throw new Error(message); };
export const availableReward = (r, now = Date.now()) => r.status === 'disponivel' && new Date(r.expiresAt).getTime() > now;
export const rewardLabel = (r, now = Date.now()) => r.status === 'disponivel' && !availableReward(r, now) ? 'expirado' : r.status;
export function withGrowth(state) {
  const used = new Set(state.customers.map(c => c.referralCode).filter(Boolean));
  const customers = state.customers.map((c, i) => {
    if (c.referralCode) return c;
    let code = `AURA${String(i + 1).padStart(4, '0')}`;
    while (used.has(code)) code = `AURA${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    used.add(code); return { ...c, referralCode: code };
  });
  return { ...state, customers, settings: { ...growthDefaults, ...state.settings, referralRules: { ...growthDefaults.referralRules, ...state.settings.referralRules } }, referrals: state.referrals || [], rewards: state.rewards || [], readAlerts: state.readAlerts || [], referralCode: state.referralCode || '' };
}
export function validateGrowth(settings) {
  const r = settings.referralRules;
  if (!Number.isSafeInteger(settings.commercialPrice) || settings.commercialPrice < 0) fail('Informe um investimento válido.');
  if (settings.publicUrl) {
    let url; try { url = new URL(settings.publicUrl); } catch { fail('Informe uma URL pública HTTPS válida.'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname.replace(/\/$/, '') !== '/loja') fail('Use a URL HTTPS completa da loja, terminada em /loja e sem parâmetros.');
  }
  if (!['fixed', 'percent'].includes(r.type) || !Number.isSafeInteger(r.value) || r.value <= 0 || (r.type === 'percent' && r.value > 50) || !Number.isSafeInteger(r.minimum) || r.minimum < 1 || r.minimum > 20 || !Number.isSafeInteger(r.validityDays) || r.validityDays < 1 || r.validityDays > 365 || !Number.isSafeInteger(r.minimumPurchase) || r.minimumPurchase < 1) fail('Revise as regras: recompensa positiva (até 50%), 1–20 indicações, validade de 1–365 dias e compra mínima positiva.');
}
export function attachReferral(state, order, code) {
  code = String(code || '').trim().toUpperCase();
  if (!code) return state;
  if (!state.settings.referralRules.enabled) fail('O programa de indicações está pausado. Remova o código para continuar.');
  const referrer = state.customers.find(c => c.referralCode === code);
  if (!referrer) fail('Código de indicação não encontrado neste navegador demonstrativo.');
  if (referrer.id === order.customerId || phoneKey(referrer.phone) === phoneKey(order.customer.phone)) fail('Uma cliente não pode indicar a si mesma.');
  const phone = phoneKey(order.customer.phone);
  if (state.referrals.some(r => r.status !== 'cancelada' && (r.customerId === order.customerId || r.phone === phone)) || state.orders.some(o => o.customerId === order.customerId && !['rascunho', 'cancelado'].includes(o.status))) fail('Indicações são válidas apenas para a primeira compra de uma nova cliente, sem outra indicação ativa.');
  const referral = { id: crypto.randomUUID(), storeId: STORE_ID, demo: true, referrerId: referrer.id, customerId: order.customerId, phone, orderId: order.id, createdAt: order.createdAt, status: 'pendente', rules: { ...state.settings.referralRules } };
  return { ...state, referrals: [...state.referrals, referral] };
}
export function reconcileGrowth(state, now = Date.now()) {
  state = withGrowth(state);
  const referrals = state.referrals.map(r => {
    if (r.status !== 'pendente') return r;
    const order = state.orders.find(o => o.id === r.orderId);
    if (!order || order.status === 'cancelado') return { ...r, status: 'cancelada' };
    if (order.status !== 'concluido') return r;
    const older = state.orders.some(o => o.id !== order.id && o.customerId === r.customerId && o.status === 'concluido' && new Date(o.completedAt || o.createdAt) < new Date(order.completedAt || order.createdAt));
    if (older || order.total < r.rules.minimumPurchase) return { ...r, status: 'inelegivel', reason: older ? 'Cliente já tinha compra concluída.' : 'Compra abaixo do mínimo contratado.' };
    return { ...r, status: 'convertida', convertedAt: order.completedAt, amount: r.rules.type === 'fixed' ? r.rules.value : Math.round(order.total * r.rules.value / 100) };
  });
  const rewards = state.rewards.map(r => {
    if (r.status !== 'reservado') return r;
    const order = state.orders.find(o => o.id === r.orderId);
    if (order?.status === 'concluido') return { ...r, status: 'utilizado', usedAt: order.completedAt };
    if (!order || order.status === 'cancelado') return { ...r, status: 'disponivel', orderId: null };
    return r;
  });
  const assigned = new Set(rewards.flatMap(r => r.referralIds));
  // Cada lote usa a mesma versão das regras; mudar a configuração não reescreve recompensas.
  const groups = new Map();
  referrals.filter(r => r.status === 'convertida' && !assigned.has(r.id)).sort((a, b) => new Date(a.convertedAt) - new Date(b.convertedAt)).forEach(r => {
    const key = `${r.referrerId}:${JSON.stringify(r.rules)}`;
    groups.set(key, [...(groups.get(key) || []), r]);
  });
  for (const group of groups.values()) {
    const minimum = group[0].rules.minimum;
    while (group.length >= minimum) {
      const batch = group.splice(0, minimum); const at = batch.at(-1).convertedAt || new Date(now).toISOString();
      rewards.push({ id: `beneficio-${batch.map(r => r.id).sort().join('-')}`, storeId: STORE_ID, demo: true, customerId: batch[0].referrerId, referralIds: batch.map(r => r.id), amount: batch.reduce((s, r) => s + r.amount, 0), createdAt: at, expiresAt: new Date(new Date(at).getTime() + batch[0].rules.validityDays * day).toISOString(), status: 'disponivel' });
    }
  }
  return { ...state, referrals, rewards };
}
export function redeemReward(state, { rewardId, orderId }, now = Date.now()) {
  const reward = state.rewards.find(r => r.id === rewardId); const order = state.orders.find(o => o.id === orderId);
  if (!reward || !availableReward(reward, now) || !order || !['novo', 'atendimento'].includes(order.status) || order.customerId !== reward.customerId || order.rewardId || order.total < reward.amount) fail('Escolha um pedido novo/em atendimento da beneficiária, sem outro benefício e com total igual ou superior ao crédito.');
  return { ...state, rewards: state.rewards.map(r => r.id === rewardId ? { ...r, status: 'reservado', orderId } : r), orders: state.orders.map(o => o.id === orderId ? { ...o, rewardId, rewardDiscount: reward.amount, total: o.total - reward.amount, discount: o.discount + reward.amount, history: [...o.history, { status: o.status, at: new Date(now).toISOString(), note: 'Crédito de indicação aplicado manualmente. Informe o novo total à cliente.' }] } : o) };
}
export function shopUrl(settings, origin = typeof window !== 'undefined' ? window.location.origin : '') { return settings.publicUrl || `${origin}/loja`; }
export function referralUrl(settings, code) { const url = new URL(shopUrl(settings)); url.searchParams.set('ref', code); return url.toString(); }
