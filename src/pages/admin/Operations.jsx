import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { money, orderStatuses, transitions } from '../../data/demo';
import { Modal } from '../../components/UI';
import { Confirm, dateLabel, Empty, Field, OrderLines, PageHeading, SearchBox, Status, timeLabel } from '../../components/AdminUI';

export function AdminOrders() {
  const { orders } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const selected = orders.find(o => o.id === params.get('pedido'));
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const invalidPeriod = from && to && from > to;
  const filtered = orders.filter(o => (!query || `${o.id} ${o.customer.name} ${o.customer.phone}`.toLowerCase().includes(query.toLowerCase())) && (status === 'all' || o.status === status) && (!from || new Date(o.createdAt) >= new Date(`${from}T00:00:00`)) && (!to || new Date(o.createdAt) <= new Date(`${to}T23:59:59.999`))).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return <><PageHeading title="Cada pedido, uma boa conversa." description="Da intenção de compra à entrega, mantenha tudo organizado."><Link to="/loja" className="button"><Plus size={17} /> Montar pedido na loja</Link></PageHeading>
    <div className="admin-callout"><ShoppingNote /><p>Preparar ou abrir uma mensagem no WhatsApp cria apenas um rascunho local. Marque como novo pedido somente após receber a solicitação. Confirmar desconta o estoque; cancelar uma confirmação devolve as unidades. Concluir é uma ação manual, não uma verificação de pagamento.</p></div>
    <div className="admin-status-tabs"><button className={status === 'all' ? 'active' : ''} onClick={() => setStatus('all')}>Todos <span>{orders.length}</span></button>{Object.entries(orderStatuses).map(([value, label]) => <button key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)}>{label}<span>{orders.filter(o => o.status === value).length}</span></button>)}</div>
    <section className="admin-panel"><div className="admin-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Buscar cliente, telefone ou referência" /><div className="admin-date-filters"><Field label="De" type="date" value={from} onChange={e => setFrom(e.target.value)} /><Field label="Até" type="date" value={to} onChange={e => setTo(e.target.value)} /></div></div>{invalidPeriod && <p className="form-error" role="alert">A data final precisa ser igual ou posterior à inicial.</p>}
    <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Pedido / cliente</th><th>Registro</th><th>Itens</th><th>Total</th><th>Status</th><th>Detalhes</th></tr></thead><tbody>{!invalidPeriod && filtered.map(o => <tr key={o.id}><td><strong>{o.customer.name}</strong><small>#{o.id.slice(0, 8).toUpperCase()} · Demonstração</small></td><td>{dateLabel(o.createdAt)}</td><td>{o.lines.reduce((s, l) => s + l.quantity, 0)}</td><td><strong>{money(o.total)}</strong></td><td><Status value={o.status} /></td><td><button className="icon-button" onClick={() => setParams({ pedido: o.id })} aria-label={`Ver pedido de ${o.customer.name}`}><Eye size={18} /></button></td></tr>)}</tbody></table>{(!filtered.length || invalidPeriod) && <Empty />}</div></section>
    {selected && <OrderDetail key={selected.id} order={selected} onClose={close} />}
  </>;
}
function ShoppingNote() { return <span className="admin-count" aria-hidden="true">i</span>; }
function OrderDetail({ order, onClose }) {
  const { runAction } = useStore();
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const options = transitions[order.status] || [];
  function update(e) {
    e.preventDefault();
    try { runAction('status', { id: order.id, status: next }); setNext(''); setError(''); }
    catch (err) { setError(err.message); }
  }
  const explanations = { novo: 'Confirme somente se a solicitação foi recebida no atendimento. Nenhum estoque será reservado ainda.', atendimento: 'Pedido em atendimento. O estoque ainda não é reservado.', confirmado: 'As unidades serão descontadas do estoque disponível agora, uma única vez. Esta ação não confirma pagamento.', concluido: 'Conclua somente após finalizar a operação combinada com a cliente. O pedido entrará nas métricas. A conclusão é definitiva nesta demonstração.', cancelado: 'O cancelamento é definitivo. Unidades de pedidos confirmados serão devolvidas ao estoque uma única vez.' };
  return <Modal title={`Pedido #${order.id.slice(0, 8).toUpperCase()}`} onClose={onClose} wide><div className="admin-detail-header"><div><h3>{order.customer.name}</h3><p>{order.customer.phone} · {timeLabel(order.createdAt)}</p></div><Status value={order.status} /></div><OrderLines order={order} /><div className="admin-order-notes"><strong>Observações da cliente</strong><p>{order.customer.notes || 'Nenhuma observação.'}</p></div>
    {options.length ? <form className="admin-status-form" onSubmit={update}><Field label="Avançar atendimento"><select required value={next} onChange={e => setNext(e.target.value)}><option value="">Selecione o próximo status</option>{options.map(value => <option key={value} value={value}>{orderStatuses[value]}</option>)}</select></Field>{next && <p className="admin-callout">{explanations[next]}</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button" disabled={!next} type="submit">Confirmar alteração de status</button></form> : <p className="admin-callout">Este pedido está encerrado. Seus valores e histórico são preservados.</p>}
    <h3 className="admin-history-title">Histórico do atendimento</h3><ol className="admin-timeline">{[...(order.history || [])].reverse().map((h, i) => <li key={`${h.at}-${i}`}><strong>{orderStatuses[h.status]}</strong><time>{timeLabel(h.at)}</time><p>{h.note}</p></li>)}</ol>
  </Modal>;
}

function CustomerGrowth({ customer }) {
  const { referrals, rewards, clock } = useStore();
  const credit = rewards.filter(r => r.customerId === customer.id && r.status === 'disponivel' && new Date(r.expiresAt).getTime() > clock).reduce((sum, r) => sum + r.amount, 0);
  return <div className="admin-callout"><div><strong>Código de indicação: {customer.referralCode}</strong><p>{referrals.filter(r => r.referrerId === customer.id).length} indicação(ões) · {money(credit)} em benefícios disponíveis.</p><Link to="/painel/indicacoes" className="text-link">Consultar convites, regras e histórico de benefícios <ArrowUpRight size={15} /></Link><Link to="/painel/divulgacao" className="text-link">Preparar mensagem de relacionamento <ArrowUpRight size={15} /></Link></div></div>;
}

export function AdminCustomers() {
  const { customers, orders, clock, runAction } = useStore();
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const closeEdit = useCallback(() => setEditing(null), []);
  const closeView = useCallback(() => setViewing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);
  const profiles = customers.map(c => {
    const history = orders.filter(o => o.customerId === c.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const purchases = history.filter(o => o.status === 'concluido').sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
    return { ...c, history, purchases, total: purchases.reduce((s, o) => s + o.total, 0), last: purchases[0]?.completedAt || purchases[0]?.createdAt };
  });
  const filtered = profiles.filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase()) && (segment === 'all' || (segment === 'new' && clock - new Date(c.createdAt).getTime() <= 30 * 86400000) || (segment === 'frequent' && c.purchases.length >= 2) || (segment === 'inactive' && (!c.last || clock - new Date(c.last).getTime() >= 30 * 86400000))));
  const selected = profiles.find(c => c.id === viewing);
  return <><PageHeading title="Relacionamentos que florescem." description="Conheça suas clientes, acompanhe compras e valorize cada encontro."><button className="button" onClick={() => setEditing({ name: '', phone: '', notes: '' })}><Plus size={18} /> Nova cliente</button></PageHeading><div className="admin-callout"><Users size={22} /><p>Use somente dados fictícios. O cadastro é associado pelo telefone ao preparar um pedido na sacola. Totais de compra consideram apenas pedidos concluídos; rascunhos não são vendas.</p></div><div className="admin-status-tabs">{[['all', 'Todas as clientes'], ['new', 'Novas · 30 dias'], ['frequent', 'Frequentes · 2+ compras'], ['inactive', 'Sem compra há 30 dias ou nunca']].map(([value, label]) => <button key={value} className={segment === value ? 'active' : ''} onClick={() => setSegment(value)}>{label}</button>)}</div>
    <section className="admin-panel"><div className="admin-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Pesquisar nome ou telefone" /><span className="muted">{filtered.length} clientes encontradas</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Cliente</th><th>Cadastro</th><th>Compras concluídas</th><th>Total comprado</th><th>Última compra</th><th>Ações</th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><strong>{c.name}</strong><small>{c.phone}</small></td><td>{dateLabel(c.createdAt)}</td><td>{c.purchases.length}</td><td><strong>{money(c.total)}</strong></td><td>{dateLabel(c.last)}</td><td><div className="admin-actions"><button className="icon-button" onClick={() => setViewing(c.id)} aria-label={`Histórico de ${c.name}`}><Eye size={17} /></button><button className="icon-button" onClick={() => setEditing(customers.find(item => item.id === c.id))} aria-label={`Editar ${c.name}`}><Pencil size={16} /></button><button className="icon-button" onClick={() => setDeleting(c)} aria-label={`Excluir ${c.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{!filtered.length && <Empty />}</div></section>
    {editing && <CustomerForm customer={editing} onClose={closeEdit} />}{deleting && <Confirm title="Excluir cadastro?" onClose={closeDelete} onConfirm={() => runAction('deleteCustomer', deleting.id)}>Excluir “{deleting.name}” é definitivo. Clientes com pedidos são preservadas para manter o histórico.</Confirm>}
    {selected && <Modal title="Histórico da cliente" onClose={closeView} wide><div className="admin-detail-header"><div><h3>{selected.name}</h3><p>{selected.phone} · Cadastro em {dateLabel(selected.createdAt)}</p></div><strong>{money(selected.total)}<small className="muted"> em compras concluídas</small></strong></div><CustomerGrowth customer={selected} /><p className="admin-order-notes">{selected.notes || 'Nenhuma anotação de relacionamento.'}</p><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Últimos pedidos</th><th>Status</th><th>Total</th><th>Consultar</th></tr></thead><tbody>{selected.history.map(o => <tr key={o.id}><td>{timeLabel(o.createdAt)}</td><td><Status value={o.status} /></td><td>{money(o.total)}</td><td><Link to={`/painel/pedidos?pedido=${o.id}`} className="text-link">Detalhes <ArrowUpRight size={15} /></Link></td></tr>)}</tbody></table>{!selected.history.length && <Empty>Esta cliente ainda não possui pedidos.</Empty>}</div><p className="fine-print">Os pedidos guardam o nome e telefone informados no momento da compra. Editar o cadastro não altera esses registros históricos.</p></Modal>}
  </>;
}
function CustomerForm({ customer, onClose }) {
  const { runAction } = useStore();
  const [draft, setDraft] = useState({ ...customer });
  const [error, setError] = useState('');
  function save(e) { e.preventDefault(); try { runAction('customer', draft); onClose(); } catch (err) { setError(err.message); } }
  return <Modal title={customer.id ? 'Editar cliente demonstrativa' : 'Cadastrar cliente demonstrativa'} onClose={onClose}><form className="admin-form" onSubmit={save}><Field label="Nome" required minLength={2} maxLength={100} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /><Field label="Telefone com DDD" type="tel" required maxLength={22} value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} /><Field label="Anotações de relacionamento"><textarea rows={4} maxLength={1200} value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} /></Field><p className="fine-print">Use somente dados fictícios. Telefones duplicados não são permitidos.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="admin-form-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancelar</button><button type="submit" className="button">Salvar cliente</button></div></form></Modal>;
}
