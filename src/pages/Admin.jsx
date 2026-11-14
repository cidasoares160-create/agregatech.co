import { createElement, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Boxes, CircleHelp, Gem, LayoutDashboard, LogOut, Settings2, ShoppingBag, Tag, Users, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import Dashboard from './admin/Dashboard';
import AdminProducts from './admin/Products';
import AdminPromotions from './admin/Promotions';
import { AdminOrders, AdminCustomers } from './admin/Operations';
import AdminSettings from './admin/Settings';
import Referrals from './admin/Referrals';
import { CommercialSettings, Marketing, Notifications } from './admin/GrowthTools';
import { Bell, Gift, Megaphone, QrCode } from 'lucide-react';
import './admin/admin.css';

const sessionKey = 'minha-loja:demo-session';
const nav = [['', 'Visão geral', LayoutDashboard], ['produtos', 'Produtos & estoque', Boxes], ['promocoes', 'Promoções', Tag], ['pedidos', 'Pedidos', ShoppingBag], ['clientes', 'Clientes', Users], ['indicacoes', 'Indique e ganhe', Gift], ['divulgacao', 'Estúdio de divulgação', Megaphone], ['notificacoes', 'Notificações', Bell], ['placa', 'Placa & proposta', QrCode], ['configuracoes', 'Minha loja', Settings2]];
function inSession() { try { return sessionStorage.getItem(sessionKey) === 'demo'; } catch { return false; } }
export default function Admin() {
  const { settings } = useStore();
  const { pathname } = useLocation();
  const [entered, setEntered] = useState(inSession);
  const [accepted, setAccepted] = useState(false);
  function enter() { try { sessionStorage.setItem(sessionKey, 'demo'); } catch { /* Acesso apenas em memória. */ } setEntered(true); }
  function leave() { try { sessionStorage.removeItem(sessionKey); } catch { /* Sem sessão persistente. */ } setEntered(false); setAccepted(false); }
  if (!entered) return <main id="conteudo" className="admin-gate"><Link to="/" className="text-link">← Central de acesso</Link><div className="admin-gate-card"><span className="admin-gate-icon"><Gem size={32} strokeWidth={1.3} /></span><span className="eyebrow">MINHA LOJA INTELIGENTE · WORKSPACE</span><h1>O próximo capítulo<br />do seu negócio.</h1><p>Explore a operação de {settings.name}. Produtos, pedidos e relacionamento, em um único lugar.</p><div className="admin-callout"><ShieldCheck size={22} /><div><strong>Acesso de demonstração, sem senha</strong><p>Este painel é público e não possui autenticação real. Use somente dados fictícios. As alterações são salvas neste navegador, sem sincronização entre dispositivos.</p></div></div><label className="admin-check"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />Entendo que este é um ambiente demonstrativo e não vou inserir dados reais de clientes.</label><button className="button full-width" disabled={!accepted} onClick={enter}>Explorar painel demonstrativo <ArrowUpRight size={18} /></button><p className="fine-print">Para produção: autenticação, permissões por loja, banco de dados protegido e armazenamento de imagens precisam ser integrados e testados. Nenhuma conexão em nuvem é afirmada nesta versão.</p></div></main>;
  const current = nav.find(([slug]) => pathname === `/painel${slug ? `/${slug}` : ''}`)?.[1] || 'Visão geral';
  return <div className="admin-shell"><aside className="admin-sidebar">
    <Link to="/painel" className="admin-brand"><span><Gem size={26} /></span><div>MINHA LOJA<small>INTELIGENTE / WORKSPACE</small></div></Link>
    <div className="admin-shop"><span>{settings.name.slice(0, 1)}</span><div><strong>{settings.name}</strong><small>Loja demonstrativa</small></div><span className="live-dot" /></div><span className="admin-nav-label">SEU NEGÓCIO</span>
    <nav aria-label="Painel administrativo">{nav.map(([slug, label, icon]) => <NavLink key={slug} end to={`/painel${slug ? `/${slug}` : ''}`}>{createElement(icon, { size: 19 })}{label}</NavLink>)}</nav>
    <div className="admin-sidebar-bottom"><CircleHelp size={21} /><strong>Um espaço para experimentar.</strong><p>Todos os registros são demonstrativos. Nada aqui representa pagamento real.</p><Link to="/loja">Visitar a loja <ArrowUpRight size={15} /></Link><button onClick={leave}><LogOut size={16} /> Sair da demonstração</button></div>
  </aside><div className="admin-main"><header className="admin-topbar"><div><span>Workspace</span><span>/</span><strong>{current}</strong></div><Link to="/loja" className="button button-outline button-small">Ver minha loja <ArrowUpRight size={15} /></Link></header>
    <div className="admin-demo"><span className="live-dot" /><strong>MODO DEMONSTRAÇÃO</strong><span>Dados fictícios · Salvos somente neste navegador · Sem pagamento online</span><button onClick={leave} aria-label="Sair da demonstração"><LogOut size={16} /></button></div>
    <main id="conteudo" className="admin-content"><Routes><Route index element={<Dashboard />} /><Route path="produtos" element={<AdminProducts />} /><Route path="promocoes" element={<AdminPromotions />} /><Route path="pedidos" element={<AdminOrders />} /><Route path="clientes" element={<AdminCustomers />} /><Route path="indicacoes" element={<Referrals />} /><Route path="divulgacao" element={<Marketing />} /><Route path="notificacoes" element={<Notifications />} /><Route path="placa" element={<CommercialSettings />} /><Route path="configuracoes" element={<AdminSettings />} /><Route path="*" element={<Navigate to="/painel" replace />} /></Routes></main><footer className="admin-footer">Minha Loja Inteligente <span>Operação local de apresentação · {new Date().getFullYear()}</span></footer>
  </div></div>;
}
