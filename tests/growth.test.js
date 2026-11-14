import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/data/demo.js';
import { operate } from '../src/store/operations.js';
import { withGrowth, attachReferral, reconcileGrowth, redeemReward, availableReward, validateGrowth, shopUrl } from '../src/store/growth.js';

function fixture() {
  const state = withGrowth(initialState());
  const customer = { id: 'nova-cliente', name: 'Nova · Exemplo', phone: '11900000009', createdAt: new Date().toISOString() };
  const p = state.products[0];
  const order = { id: 'compra-indicada', customerId: customer.id, customer, status: 'rascunho', createdAt: new Date().toISOString(), total: p.price, subtotal: p.originalPrice, discount: p.originalPrice - p.price, lines: [{ productId: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice, quantity: 1 }], history: [] };
  state.customers.push(customer);
  const attached = attachReferral(state, order, state.customers[0].referralCode);
  return { ...attached, orders: [order, ...attached.orders] };
}
function complete(state) {
  return ['novo', 'confirmado', 'concluido'].reduce((s, status) => operate(s, 'status', { id: 'compra-indicada', status }), state);
}
test('códigos persistentes, únicos e migração não cria indicações por visita', () => {
  const state = withGrowth(initialState());
  assert.equal(new Set(state.customers.map(c => c.referralCode)).size, state.customers.length);
  assert.deepEqual(withGrowth(state).customers, state.customers);
  assert.equal(state.referrals.length, 0);
  assert.equal(operate(state, 'referralCode', 'aura0001').referrals.length, 0);
});
test('rascunho e confirmação não geram benefício; conclusão elegível gera apenas um', () => {
  let state = fixture();
  assert.equal(reconcileGrowth(state).rewards.length, 0);
  state = operate(state, 'status', { id: 'compra-indicada', status: 'novo' });
  state = operate(state, 'status', { id: 'compra-indicada', status: 'confirmado' });
  assert.equal(state.rewards.length, 0);
  state = operate(state, 'status', { id: 'compra-indicada', status: 'concluido' });
  assert.equal(state.referrals[0].status, 'convertida');
  assert.equal(state.rewards.length, 1);
  assert.equal(state.rewards[0].amount, 1500);
  assert.deepEqual(reconcileGrowth(reconcileGrowth(state)).rewards, state.rewards);
  assert.throws(() => operate(state, 'status', { id: 'compra-indicada', status: 'concluido' }));
});
test('bloqueia autoindicação, código desconhecido e indicação ativa duplicada', () => {
  const state = fixture(); const order = state.orders[0];
  assert.throws(() => attachReferral(state, order, 'INEXISTENTE'), /não encontrado/);
  assert.throws(() => attachReferral(state, order, state.customers[0].referralCode), /primeira compra/);
  const c = state.customers[0];
  assert.throws(() => attachReferral(state, { ...order, customerId: c.id, customer: c }, c.referralCode), /si mesma/);
});
test('cancelamento e compra abaixo do mínimo não geram recompensa', () => {
  const state = fixture();
  const cancelled = operate(state, 'status', { id: 'compra-indicada', status: 'cancelado' });
  assert.equal(cancelled.referrals[0].status, 'cancelada');
  assert.equal(cancelled.rewards.length, 0);
  state.orders[0].total = 100;
  const completed = complete(state);
  assert.equal(completed.referrals[0].status, 'inelegivel');
  assert.equal(completed.rewards.length, 0);
});
test('regras registradas não mudam retroativamente; lote mínimo impede liberação precoce', () => {
  const state = fixture(); state.settings.referralRules = { ...state.settings.referralRules, value: 9000 };
  assert.equal(complete(state).rewards[0].amount, 1500);
  state.referrals[0].rules.minimum = 2;
  assert.equal(complete(state).rewards.length, 0);
});
test('percentual usa o total líquido e benefício expira no prazo', () => {
  const state = fixture(); state.referrals[0].rules = { ...state.referrals[0].rules, type: 'percent', value: 10 };
  const completed = complete(state); const reward = completed.rewards[0];
  assert.equal(reward.amount, Math.round(state.orders[0].total * .1));
  assert.equal(availableReward(reward, new Date(reward.expiresAt).getTime()), false);
});
test('crédito é reservado uma vez, altera o total e é liberado no cancelamento', () => {
  let state = complete(fixture()); const reward = state.rewards[0]; const c = state.customers[0];
  const order = { ...state.orders[0], id: 'resgate', customerId: c.id, customer: c, status: 'novo', stockReserved: false, completedAt: null, history: [] };
  state.orders.unshift(order);
  const redeemed = redeemReward(state, { rewardId: reward.id, orderId: order.id });
  assert.equal(redeemed.orders[0].total, order.total - reward.amount);
  assert.equal(redeemed.rewards[0].status, 'reservado');
  assert.throws(() => redeemReward(redeemed, { rewardId: reward.id, orderId: order.id }));
  const cancelled = operate(redeemed, 'status', { id: order.id, status: 'cancelado' });
  assert.equal(cancelled.rewards[0].status, 'disponivel');
  assert.equal(cancelled.rewards[0].expiresAt, reward.expiresAt);
});
test('resgate concluído utiliza o benefício e preserva o histórico de indicação', () => {
  let state = complete(fixture()); const reward = state.rewards[0]; const c = state.customers[0];
  state.orders.unshift({ ...state.orders[0], id: 'resgate', customerId: c.id, customer: c, status: 'novo', stockReserved: false, history: [] });
  state = operate(state, 'reward', { rewardId: reward.id, orderId: 'resgate' });
  state = operate(state, 'status', { id: 'resgate', status: 'confirmado' });
  state = operate(state, 'status', { id: 'resgate', status: 'concluido' });
  assert.equal(state.rewards[0].status, 'utilizado');
  assert.equal(state.rewards.length, 1);
  assert.throws(() => operate(state, 'deleteCustomer', c.id));
});
test('configuração rejeita preços, regras e endereços inválidos', () => {
  const settings = withGrowth(initialState()).settings;
  assert.doesNotThrow(() => validateGrowth(settings));
  assert.throws(() => validateGrowth({ ...settings, commercialPrice: -1 }));
  assert.throws(() => validateGrowth({ ...settings, publicUrl: 'javascript:alert(1)' }));
  assert.throws(() => validateGrowth({ ...settings, referralRules: { ...settings.referralRules, minimum: 0 } }));
  assert.equal(shopUrl(settings, 'https://exemplo.com'), 'https://exemplo.com/loja');
});
