import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialState, migrateState, STORAGE_KEY, STORE_ID, phoneKey, activePromotions, discountedProduct } from '../data/demo';
import { operate } from './operations';

const StoreContext = createContext(null);
function load() {
  try { return migrateState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return initialState(); }
}
export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const current = useRef(state);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [clock, setClock] = useState(Date.now());
  function commit(update) {
    const next = update(current.current);
    current.current = next;
    setState(next);
    return next;
  }
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  const campaigns = useMemo(() => activePromotions(state.promotions, clock), [state.promotions, clock]);
  const products = useMemo(() => state.products.map(p => discountedProduct(p, campaigns)), [state.products, campaigns]);
  const lines = useMemo(() => {
    const available = state.cart.flatMap(item => {
      const product = state.products.find(p => p.id === item.productId && p.active && p.stock > 0);
      return product ? [{ ...product, quantity: Math.max(1, Math.min(item.quantity, product.stock)) }] : [];
    });
    const cart = available.map(p => ({ productId: p.id, quantity: p.quantity }));
    return available.map(p => discountedProduct(p, campaigns, cart));
  }, [state.cart, state.products, campaigns]);
  const subtotal = lines.reduce((sum, p) => sum + Math.max(p.price, p.originalPrice) * p.quantity, 0);
  const total = lines.reduce((sum, p) => sum + p.price * p.quantity, 0);
  function add(productId, amount = 1) {
    commit(s => {
      const product = s.products.find(p => p.id === productId && p.active && p.stock > 0);
      if (!product) return s;
      const existing = s.cart.find(p => p.productId === productId);
      const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + Math.max(1, Math.floor(amount)));
      return { ...s, cart: existing ? s.cart.map(p => p.productId === productId ? { ...p, quantity: nextQuantity } : p) : [...s.cart, { productId, quantity: nextQuantity }] };
    });
    setNotice('Sacola atualizada. Quantidades limitadas ao estoque demonstrativo.');
  }
  function quantity(productId, value) {
    commit(s => ({ ...s, cart: s.cart.flatMap(item => {
      if (item.productId !== productId) return [item];
      const product = s.products.find(p => p.id === productId && p.active && p.stock > 0);
      return value > 0 && product ? [{ ...item, quantity: Math.min(Math.floor(value), product.stock) }] : [];
    }) }));
  }
  function runAction(action, data) {
    commit(s => operate(s, action, data));
    setNotice('Alteração salva neste navegador. Dados demonstrativos.');
  }
  function configure(settings) {
    commit(s => operate(s, 'settings', { ...s.settings, ...settings }));
    setNotice('Configuração salva neste navegador.');
  }
  function saveDraft(customer) {
    const fingerprint = JSON.stringify({ lines: lines.map(p => [p.id, p.quantity, p.price]), customer });
    const existing = current.current.orders.find(o => o.fingerprint === fingerprint && o.status === 'rascunho');
    if (existing) return existing;
    let order;
    commit(s => {
      const at = new Date().toISOString();
      let profile = s.customers.find(c => phoneKey(c.phone) === phoneKey(customer.phone));
      const customers = [...s.customers];
      if (!profile) {
        profile = { id: crypto.randomUUID(), storeId: STORE_ID, demo: true, name: customer.name, phone: customer.phone, notes: '', createdAt: at };
        customers.push(profile);
      }
      order = { id: crypto.randomUUID(), storeId: STORE_ID, createdAt: at, status: 'rascunho', customerId: profile.id,
        demo: true, customer, lines: lines.map(p => ({ productId: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice, quantity: p.quantity })),
        subtotal, discount: subtotal - total, total, fingerprint, stockReserved: false,
        history: [{ status: 'rascunho', at, note: 'Mensagem preparada na sacola. Envio e compra não confirmados.' }],
      };
      return { ...s, customers, orders: [order, ...s.orders] };
    });
    return order;
  }
  return <StoreContext.Provider value={{ ...state, products, rawProducts: state.products, campaigns, clock, lines, subtotal, total, discount: subtotal - total, count: lines.reduce((sum, p) => sum + p.quantity, 0), add, quantity, configure, saveDraft, runAction, notify: setNotice }}>
    {storageError && <div className="storage-warning" role="alert">O navegador bloqueou o salvamento ou ficou sem espaço. As últimas alterações não estão salvas. Reduza as imagens; não feche esta página.</div>}
    {children}
    <div className={`toast ${notice ? 'visible' : ''}`} role="status">{notice}</div>
  </StoreContext.Provider>;
}
export function useStore() { return useContext(StoreContext); }
