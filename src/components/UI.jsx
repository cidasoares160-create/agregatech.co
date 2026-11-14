import { useEffect, useId, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, X, Sparkles, Settings2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/StoreContext';

export function Brand({ store = false }) {
  const { settings } = useStore();
  return <Link to={store ? '/loja' : '/'} className={`brand ${store ? 'brand-store' : ''}`} aria-label={store ? settings.name : 'Minha Loja Inteligente — início'}>
    <span className="brand-mark">{store && settings.logo ? <img src={settings.logo} alt="" className="store-logo" /> : <Sparkles size={24} strokeWidth={1.5} />}</span>
    {store ? <span className="store-wordmark">{settings.name}<small>JOIAS & ACESSÓRIOS</small></span> : <span>MINHA LOJA<small>INTELIGENTE</small></span>}
  </Link>;
}
export function Header({ store = false, onConfigure, onContact }) {
  const { count } = useStore();
  return <>
    {store && <div className="demo-strip"><span className="live-dot" /> Loja demonstrativa <span className="hide-small">· Produtos e preços de exemplo. Sem pagamento online.</span><button onClick={onConfigure}><Settings2 size={13} /> Configurar demonstração</button></div>}
    <header className="site-header"><div className="container header-inner">
      <Brand store={store} />
      <nav className="desktop-nav" aria-label="Navegação principal">
        <NavLink to="/" end>{store ? 'Central de acesso' : 'Início'}</NavLink>
        <NavLink to="/loja">{store ? 'Coleção completa' : 'Loja demonstrativa'}</NavLink>
        <button onClick={onContact}>Fale conosco</button>
        <NavLink to="/painel">Painel demonstrativo</NavLink>
      </nav>
      <div className="header-actions">{store ? <Link to="/sacola" className="bag-button" aria-label={`Abrir sacola, ${count} itens`}><ShoppingBag size={21} /><span className="hide-small">Minha sacola</span><span className="bag-count">{count}</span></Link> : <Link to="/loja" className="button button-small">Conhecer a loja <ArrowUpRight size={16} /></Link>}</div>
    </div></header>
    <Link to="/painel" className="admin-mobile-entry"><Settings2 size={15} /> Explorar painel demonstrativo <ArrowUpRight size={14} /></Link>
    {store && <nav className="mobile-store-nav" aria-label="Navegação no celular"><Link to="/"><ArrowLeft size={13} /> Central de acesso</Link><button onClick={onContact}>Fale conosco <ArrowUpRight size={13} /></button></nav>}
  </>;
}
export function Footer({ onConfigure, onContact }) {
  return <footer className="site-footer"><div className="container footer-inner"><Brand /><p>Tecnologia para conectar. Liberdade para crescer.</p><div><Link to="/indique" className="text-link">Indique e ganhe</Link><Link to="/solucao" className="text-link">Conheça a solução</Link><Link to="/painel" className="text-link">Painel demonstrativo</Link><button onClick={onContact}>Atendimento</button><button onClick={onConfigure}>Configurar demo</button></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Minha Loja Inteligente</span><span><ShieldCheck size={14} /> Ambiente demonstrativo · Dados salvos neste navegador</span></div></footer>;
}
export function Modal({ title, children, onClose, wide = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const element = dialog.current;
    const focusable = () => [...element.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => !el.disabled);
    focusable()[0]?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const elements = focusable(); const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    element.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = oldOverflow; element.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialog} className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}><div className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar janela"><X size={21} /></button></div>{children}</section></div>;
}
export function GoogleIcon() {
  return <svg viewBox="0 0 24 24" width="27" height="27" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.7 4.7 0 0 1-2 3v2.5h3.3c1.9-1.7 2.9-4.2 2.9-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.3 13.9a6 6 0 0 1 0-3.8V7.5H2.9a10 10 0 0 0 0 9l3.4-2.6Z" /><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9.1 5.5l3.4 2.6A6 6 0 0 1 12 5.9Z" /></svg>;
}
export function Quantity({ value, max, onChange, label = 'Quantidade' }) {
  return <div className="quantity" role="group" aria-label={label}><button type="button" aria-label={`Diminuir ${label.toLowerCase()}`} onClick={() => onChange(value - 1)} disabled={value <= 1}>−</button><span aria-live="polite">{value}</span><button type="button" aria-label={`Aumentar ${label.toLowerCase()}`} onClick={() => onChange(value + 1)} disabled={value >= max}>+</button></div>;
}
