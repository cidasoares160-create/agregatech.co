import { useId, useState } from 'react';
import { ArrowUpRight, Check, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../data/demo';
import { useStore } from '../store/StoreContext';
import { Modal, Quantity } from './UI';

export function ProductImage({ product, eager = false }) {
  const gradient = useId().replace(/:/g, '');
  if (product.image) return <div className="product-photo"><img src={product.image} alt={product.name} loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ left: product.quadrant % 2 ? '-100%' : 0, top: product.quadrant > 1 ? '-100%' : 0 }} /></div>;
  return <div className="product-photo product-illustration"><svg viewBox="0 0 240 240" role="img" aria-label={`Illustration de ${product.name}`}>
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a67c35" /><stop offset=".4" stopColor="#eed7a0" /><stop offset=".65" stopColor="#bc944e" /><stop offset="1" stopColor="#e2c78d" /></linearGradient></defs>
    <g fill="none" stroke={`url(#${gradient})`} strokeWidth="5" strokeLinecap="round">
      {product.artwork === 'earrings' && <><path d="M78 92v24m84-24v24" /><circle cx="78" cy="135" r="21" fill="#f8f3e7" /><circle cx="162" cy="135" r="21" fill="#f8f3e7" /><circle cx="78" cy="89" r="5" /><circle cx="162" cy="89" r="5" /></>}
      {product.artwork === 'necklace' && <><path d="M88 51C15 146 77 170 120 182c43-12 105-36 32-131" strokeWidth="2" /><path d="M120 172c-24-26-36 12 0 28 36-16 24-54 0-28Z" fill={`url(#${gradient})`} strokeWidth="1" /></>}
      {product.artwork === 'bracelet' && <><ellipse cx="120" cy="115" rx="66" ry="49" strokeDasharray="3 4" /><circle cx="76" cy="157" r="10" fill={`url(#${gradient})`} /><circle cx="120" cy="174" r="10" fill={`url(#${gradient})`} /><circle cx="164" cy="157" r="10" fill={`url(#${gradient})`} /></>}
      {product.artwork === 'barrette' && <><rect x="49" y="94" width="142" height="52" rx="26" transform="rotate(-27 120 120)" fill={`url(#${gradient})`} /><path d="m66 142 106-49" stroke="#f7e9c4" strokeWidth="2" /></>}
    </g></svg><span className="illustration-label">Ilustração do produto</span></div>;
}
export function ProductCard({ product, onDetails }) {
  const { add, lines } = useStore();
  const inBag = lines.find(p => p.id === product.id)?.quantity || 0;
  const full = inBag >= product.stock;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return <article className="product-card">
    <button className="product-image-button" onClick={() => onDetails(product)} aria-label={`Ver detalhes de ${product.name}`}><ProductImage product={product} /><span className="product-badges">{product.stock === 0 ? <span className="badge badge-muted">Esgotado</span> : discount > 0 ? <span className="badge">−{discount}%</span> : product.isNew ? <span className="badge badge-light">Novidade</span> : null}</span><span className="product-open"><ArrowUpRight size={18} /></span></button>
    <div className="product-info"><span className="eyebrow">{product.category}</span><button className="product-name" onClick={() => onDetails(product)}>{product.name}</button><p className="product-short">{product.detail}</p><div className="product-price">{product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}<strong>{money(product.price)}</strong></div><div className="product-card-bottom"><span className={product.stock > 0 ? 'stock-label' : 'muted'}>{product.stock > 0 ? `${product.stock} disponíveis` : 'Indisponível'}</span><button className="add-button" disabled={full} onClick={() => add(product.id)} aria-label={`Adicionar ${product.name} à sacola`}>{full && product.stock > 0 ? <Check size={17} /> : <ShoppingBag size={17} />}<span>{full ? (product.stock ? 'Na sacola' : 'Esgotado') : 'Adicionar'}</span></button></div></div>
  </article>;
}
export function ProductDetails({ product, onClose }) {
  const [amount, setAmount] = useState(1);
  const { add, lines } = useStore();
  const remaining = product.stock - (lines.find(p => p.id === product.id)?.quantity || 0);
  return <Modal title="Um detalhe que faz a diferença" onClose={onClose} wide><div className="product-detail"><ProductImage product={product} eager /><div><span className="eyebrow">{product.category} · Coleção Aura</span><h3>{product.name}</h3><p>{product.description}</p><p className="detail-spec">{product.detail}</p><div className="product-price large">{product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}<strong>{money(product.price)}</strong></div><p className="stock-label">{product.stock ? `${product.stock} unidades no estoque demonstrativo` : 'Produto indisponível'}</p><div className="detail-purchase">{remaining > 0 && <Quantity value={Math.min(amount, remaining)} max={remaining} onChange={setAmount} />}<button className="button" disabled={remaining <= 0} onClick={() => { add(product.id, Math.min(amount, remaining)); }}>{remaining > 0 ? 'Adicionar à sacola' : product.stock ? 'Limite do estoque na sacola' : 'Esgotado'}<ShoppingBag size={17} /></button></div><Link to="/sacola" className="text-link" onClick={onClose}>Ir para minha sacola <ArrowUpRight size={16} /></Link><p className="fine-print">Produto de demonstração. A inclusão na sacola não reserva estoque nem confirma uma compra.</p></div></div></Modal>;
}
