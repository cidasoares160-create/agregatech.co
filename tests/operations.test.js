import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, migrateState, activePromotions, discountedProduct, phoneKey } from '../src/data/demo.js';
import { operate } from '../src/store/operations.js';

function fixture() {
  const state = initialState();
  const p = state.products[0];
  state.orders.unshift({ id: 'teste-pedido', storeId: state.storeId, status: 'novo', customerId: state.customers[0].id,
    customer: { name: 'Cliente teste', phone: '11900000001' }, createdAt: new Date().toISOString(),
    lines: [{ productId: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice, quantity: 2 }],
    total: p.price * 2, subtotal: p.originalPrice * 2, discount: (p.originalPrice - p.price) * 2, history: [],
  });
  return state;
}
const changeStatus = (state, status) => operate(state, 'status', { id: 'teste-pedido', status });

test('confirmar reserva estoque uma vez; cancelar devolve uma vez', () => {
  const original = fixture(); const stock = original.products[0].stock;
  const confirmed = changeStatus(original, 'confirmado');
  assert.equal(confirmed.products[0].stock, stock - 2);
  assert.equal(original.products[0].stock, stock);
  assert.throws(() => changeStatus(confirmed, 'confirmado'));
  const cancelled = changeStatus(confirmed, 'cancelado');
  assert.equal(cancelled.products[0].stock, stock);
  assert.throws(() => changeStatus(cancelled, 'cancelado'));
});

test('concluir preserva a reserva e registra data e histórico', () => {
  const confirmed = changeStatus(fixture(), 'confirmado');
  const completed = changeStatus(confirmed, 'concluido');
  assert.equal(completed.products[0].stock, confirmed.products[0].stock);
  assert.ok(completed.orders[0].completedAt);
  assert.equal(completed.orders[0].history.length, 2);
  assert.throws(() => changeStatus(completed, 'cancelado'));
});

test('estoque insuficiente e produto inativo bloqueiam confirmação sem alterações parciais', () => {
  const state = fixture(); state.products[0] = { ...state.products[0], stock: 1 };
  assert.throws(() => changeStatus(state, 'confirmado'), /Estoque/);
  assert.equal(state.products[0].stock, 1);
  state.products[0] = { ...state.products[0], stock: 10, active: false };
  assert.throws(() => changeStatus(state, 'confirmado'), /Estoque/);
  assert.equal(state.orders[0].status, 'novo');
});

test('edição de catálogo não altera preços históricos; registros relacionados são preservados', () => {
  const state = fixture(); const oldTotal = state.orders[0].total;
  const edited = operate(state, 'product', { ...state.products[0], price: 1000 });
  assert.equal(edited.orders[0].total, oldTotal);
  assert.throws(() => operate(edited, 'deleteProduct', state.products[0].id), /histórico/);
  assert.throws(() => operate(edited, 'deleteCustomer', state.customers[0].id), /pedidos/);
  assert.throws(() => operate(state, 'product', { ...state.products[0], stock: -1 }));
  assert.throws(() => operate(state, 'product', { ...state.products[0], price: 999999 }));
});

test('telefones com e sem código de país não duplicam clientes', () => {
  assert.equal(phoneKey('(11) 90000-0001'), phoneKey('5511900000001'));
  assert.throws(() => operate(initialState(), 'customer', { name: 'Duplicada', phone: '5511900000001', notes: '' }), /Já existe/);
});

test('campanhas respeitam período, aplicam o menor preço e não acumulam descontos', () => {
  const p = { id: 'p', price: 8000, originalPrice: 10000 };
  const promos = [
    { id: 'a', active: true, startsAt: '2026-01-01', endsAt: '2026-02-01', productIds: ['p'], type: 'percent', value: 10 },
    { id: 'b', active: true, startsAt: '2026-01-01', endsAt: '2026-02-01', productIds: ['p'], type: 'fixed', value: 3000 },
  ];
  const active = activePromotions(promos, Date.parse('2026-01-15'));
  assert.equal(discountedProduct(p, active).price, 7000);
  assert.equal(discountedProduct(p, active.slice(0, 1)).price, 8000);
  assert.equal(activePromotions(promos, Date.parse('2026-03-01')).length, 0);
});

test('combo exige todos os produtos e a quantidade mínima', () => {
  const p = { id: 'p', price: 10000, originalPrice: 10000 };
  const promos = [{ name: 'Combo', type: 'combo', value: 20, productIds: ['p', 'q'], minQuantity: 3 }];
  assert.equal(discountedProduct(p, promos).price, 10000);
  assert.equal(discountedProduct(p, promos, [{ productId: 'p', quantity: 3 }]).price, 10000);
  assert.equal(discountedProduct(p, promos, [{ productId: 'p', quantity: 1 }, { productId: 'q', quantity: 1 }]).price, 10000);
  assert.equal(discountedProduct(p, promos, [{ productId: 'p', quantity: 2 }, { productId: 'q', quantity: 1 }]).price, 8000);
});

test('migração preserva personalização, catálogo, sacola e rascunhos sem repetir exemplos', () => {
  const old = fixture(); old.version = 1; old.settings.name = 'Minha marca';
  old.cart = [{ productId: old.products[0].id, quantity: 1 }];
  old.orders = [{ ...old.orders[0], status: 'rascunho' }];
  delete old.customers; delete old.promotions;
  const migrated = migrateState(old);
  assert.equal(migrated.settings.name, 'Minha marca');
  assert.deepEqual(migrated.cart, old.cart);
  assert.equal(migrated.orders[0].id, 'teste-pedido');
  assert.ok(migrated.orders[0].customerId);
  assert.equal(migrateState(migrated).orders.length, migrated.orders.length);
});
