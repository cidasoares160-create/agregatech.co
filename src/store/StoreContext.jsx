import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialState, STORAGE_KEY, STORE_ID, validStorePhone } from '../data/demo';

const StoreContext = createContext(null);
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === 1 && saved.storeId === STORE_ID && Array.isArray(saved.products) && Array.isArray(saved.cart) && Array.isArray(saved.orders) && saved.settings) return saved;
  } catch { /* A demonstração também funciona sem armazenamento local. */ }
  return initialState();
}
export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);
  const lines = useMemo(() => state.cart.flatMap(item => {
    const product = state.products.find(p => p.id === item.productId && p.active && p.stock > 0);
    return product ? [{ ...product, quantity: Math.max(1, Math.min(item.quantity, product.stock)) }] : [];
  }), [state.cart, state.products]);
  const subtotal = lines.reduce((sum, p) => sum + Math.max(p.price, p.originalPrice) * p.quantity, 0);
  const total = lines.reduce((sum, p) => sum + p.price * p.quantity, 0);
  function add(productId, quantity = 1) {
    const product = state.products.find(p => p.id === productId && p.active);
    if (!product || product.stock <= 0) return;
    setState(current => {
      const existing = current.cart.find(p => p.productId === productId);
      const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + quantity);
      return { ...current, cart: existing ? current.cart.map(p => p.productId === productId ? { ...p, quantity: nextQuantity } : p) : [...current.cart, { productId, quantity: nextQuantity }] };
    });
    setNotice('Sacola atualizada. Quantidades limitadas ao estoque demonstrativo.');
  }
  function quantity(productId, value) {
    setState(current => ({ ...current, cart: current.cart.flatMap(item => {
      if (item.productId !== productId) return [item];
      const product = current.products.find(p => p.id === productId);
      return value > 0 && product ? [{ ...item, quantity: Math.min(value, product.stock) }] : [];
    }) }));
  }
  function configure(settings) {
    if (settings.whatsapp && !validStorePhone(settings.whatsapp)) throw new Error('Informe o WhatsApp com código do país e DDD.');
    setState(current => ({ ...current, settings: { ...current.settings, ...settings } }));
    setNotice('Configuração salva neste navegador.');
  }
  function saveDraft(customer) {
    const fingerprint = JSON.stringify({ lines: lines.map(p => [p.id, p.quantity, p.price]), customer });
    const existing = state.orders.find(o => o.fingerprint === fingerprint && o.status === 'rascunho');
    if (existing) return existing;
    const order = {
      id: crypto.randomUUID(), storeId: STORE_ID, createdAt: new Date().toISOString(), status: 'rascunho',
      demo: true, customer, lines: lines.map(p => ({ productId: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice, quantity: p.quantity })),
      subtotal, discount: subtotal - total, total, fingerprint,
    };
    setState(current => ({ ...current, orders: [order, ...current.orders] }));
    return order;
  }
  return <StoreContext.Provider value={{ ...state, lines, subtotal, total, discount: subtotal - total, count: lines.reduce((sum, p) => sum + p.quantity, 0), add, quantity, configure, saveDraft, notify: setNotice }}>
    {storageError && <div className="storage-warning" role="alert">O navegador bloqueou o salvamento. Suas alterações serão perdidas ao fechar esta página.</div>}
    {children}
    <div className={`toast ${notice ? 'visible' : ''}`} role="status">{notice}</div>
  </StoreContext.Provider>;
}
export function useStore() { return useContext(StoreContext); }
