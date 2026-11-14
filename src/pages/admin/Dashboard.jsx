import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart3, Tag } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { money } from '../../data/demo';
import { dateLabel, Empty, PageHeading, Status } from '../../components/AdminUI';

export default function Dashboard() {
  const { settings, orders, customers, rawProducts, clock } = useStore();
  const [period, setPeriod] = useState('30');
  const start = period === 'all' ? 0 : clock - Number(period) * 86400000;
  const completed = orders.filter(o => o.status === 'concluido' && new Date(o.completedAt || o.createdAt).getTime() >= start);
  const received = orders.filter(o => !['rascunho', 'cancelado'].includes(o.status) && new Date(o.createdAt).getTime() >= start);
  const revenue = completed.reduce((s, o) => s + o.total, 0);
  const discounts = completed.reduce((s, o) => s + o.discount, 0);
  const low = rawProducts.filter(p => p.active && p.stock <= 3);
  const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const days = period === 'all' ? Math.max(30, Math.ceil((clock - Math.min(clock, ...orders.map(o => new Date(o.createdAt).getTime()))) / 86400000) + 1) : Number(period);
  const chartStart = clock - days * 86400000;
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const from = chartStart + days * 86400000 * i / 7; const to = chartStart + days * 86400000 * (i + 1) / 7;
    return { label: new Date(from).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: completed.filter(o => { const d = new Date(o.completedAt || o.createdAt).getTime(); return d >= from && (i === 6 ? d <= to : d < to); }).reduce((s, o) => s + o.total, 0) };
  });
  const max = Math.max(1, ...buckets.map(b => b.value));
  const metrics = [
    ['Vendas concluídas', completed.length, 'No período · confirmação manual'],
    ['Pedidos recebidos', received.length, 'Sem rascunhos e cancelamentos'],
    ['Produtos cadastrados', rawProducts.length, `${rawProducts.filter(p => p.active).length} ativos agora`],
    ['Estoque baixo', low.length, 'Ativos com até 3 unidades · agora'],
    ['Clientes cadastradas', customers.length, 'Base total neste navegador'],
    ['Novas clientes', customers.filter(c => new Date(c.createdAt).getTime() >= start).length, 'Cadastros no período selecionado'],
  ];
  return <>
    <PageHeading eyebrow="UM OLHAR SOBRE SUAS POSSIBILIDADES" title="Seu negócio, em perspectiva." description={`${settings.name} · Acompanhe o que importa e escolha seu próximo passo.`}><label className="admin-period"><span>Período</span><select value={period} onChange={e => setPeriod(e.target.value)}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Todo o histórico</option></select></label></PageHeading>
    <div className="admin-revenue-row"><section className="admin-revenue"><span className="eyebrow">FATURAMENTO DEMONSTRATIVO</span><strong>{money(revenue)}</strong><p>Soma dos pedidos concluídos no período.<br />Não representa recebimento financeiro verificado.</p><div><span>{completed.length} vendas concluídas</span><span>Ticket médio <b>{money(completed.length ? Math.round(revenue / completed.length) : 0)}</b></span></div></section><section className="admin-panel admin-discount"><span className="round-icon"><Tag size={24} /></span><span className="eyebrow">DESCONTOS CONCEDIDOS</span><strong>{money(discounts)}</strong><p>Economia nos pedidos concluídos no período. Promoções aplicadas sem acumular descontos.</p><Link className="text-link" to="/painel/promocoes">Gerenciar campanhas <ArrowUpRight size={15} /></Link></section></div>
    <div className="admin-metrics">{metrics.map(([label, value, help]) => <article className="admin-metric" key={label}><span>{label}</span><strong>{value}</strong><small>{help}</small></article>)}</div>
    <div className="admin-dashboard-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Ritmo das vendas</h2><p>Faturamento por data de conclusão · 7 intervalos iguais</p></div><BarChart3 size={21} /></div><div className="admin-chart" role="img" aria-label={`Faturamento por intervalo: ${buckets.map(b => `${b.label}: ${money(b.value)}`).join('; ')}`}>{buckets.map((b, i) => <div className="admin-bar-group" key={i}><span>{money(b.value)}</span><div className="admin-bar-track"><div style={{ height: `${b.value / max * 100}%` }} /></div><small>{b.label}</small></div>)}</div>{!revenue && <p className="fine-print">Nenhuma venda concluída neste período.</p>}</section><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Atenção ao estoque</h2><p>Disponibilidade atual, independente do período</p></div><span className="admin-count">{low.length}</span></div>{low.length ? low.slice(0, 5).map(p => <Link key={p.id} to="/painel/produtos" className="admin-stock-row"><span>{p.name}<small>{p.category}</small></span><b className={p.stock === 0 ? 'danger' : ''}>{p.stock} un.</b></Link>) : <Empty>Estoque em dia: nenhum produto ativo abaixo do limite.</Empty>}<Link className="text-link" to="/painel/produtos">Cuidar do catálogo <ArrowUpRight size={15} /></Link></section></div>
    <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Últimos movimentos</h2><p>Pedidos e rascunhos mais recentes · todos os períodos</p></div><Link to="/painel/pedidos" className="text-link">Todos os pedidos <ArrowUpRight size={15} /></Link></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Cliente</th><th>Data</th><th>Status</th><th>Total</th><th>Ação</th></tr></thead><tbody>{recent.map(o => <tr key={o.id}><td><strong>{o.customer.name}</strong><small>#{o.id.slice(0, 8).toUpperCase()}</small></td><td>{dateLabel(o.createdAt)}</td><td><Status value={o.status} /></td><td>{money(o.total)}</td><td><Link className="text-link" to={`/painel/pedidos?pedido=${o.id}`}>Ver pedido <ArrowUpRight size={14} /></Link></td></tr>)}</tbody></table>{!recent.length && <Empty />}</div></section>
    <p className="admin-method">Indicadores calculados com os registros deste navegador, incluindo os exemplos identificados. Rascunhos não são vendas; somente pedidos concluídos entram no faturamento e nos descontos concedidos.</p>
  </>;
}
