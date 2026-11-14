import { useCallback, useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { money } from '../../data/demo';
import { Modal } from '../../components/UI';
import { cents, Confirm, Empty, Field, PageHeading, timeLabel } from '../../components/AdminUI';

function localDate(value) {
  const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export default function AdminPromotions() {
  const { promotions, rawProducts, clock, runAction, notify } = useStore();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const close = useCallback(() => setEditing(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);
  function toggle(p) { try { runAction('promotion', { ...p, active: !p.active }); } catch (e) { notify(e.message); } }
  return <><PageHeading title="Boas ofertas. Novas histórias." description="Campanhas com prazo, descontos e combos que chegam à sua loja automaticamente."><button className="button" onClick={() => setEditing({ name: '', description: '', type: 'percent', value: 10, minQuantity: 2, productIds: [], active: true, startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 86400000).toISOString() })}><Plus size={18} /> Nova campanha</button></PageHeading>
    <div className="admin-callout"><Tag size={21} /><p>Vale sempre o menor preço entre o valor cadastrado e a campanha. Descontos não se acumulam. Combos são aplicados na sacola quando todos os produtos selecionados e a quantidade mínima estão presentes. Pedidos já registrados mantêm seus valores.</p></div>
    <div className="admin-campaign-grid">{promotions.map(p => {
      const status = !p.active ? 'Pausada' : clock < new Date(p.startsAt).getTime() ? 'Agendada' : clock > new Date(p.endsAt).getTime() ? 'Encerrada' : 'Em vigor';
      return <article className="admin-panel admin-campaign" key={p.id}><div className="admin-panel-heading"><span className={`status ${status === 'Em vigor' ? 'status-concluido' : 'status-rascunho'}`}>{status}</span><div className="admin-actions"><button className="icon-button" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}><Pencil size={16} /></button><button className="icon-button" onClick={() => setDeleting(p)} aria-label={`Excluir ${p.name}`}><Trash2 size={16} /></button></div></div><span className="admin-campaign-value">{p.type === 'fixed' ? money(p.value) : `${p.value}%`} <small>OFF {p.type === 'combo' ? 'NO COMBO' : ''}</small></span><h2>{p.name}</h2><p>{p.description}</p><small>{timeLabel(p.startsAt)} → {timeLabel(p.endsAt)}</small><div className="admin-tags">{p.productIds.map(id => <span key={id}>{rawProducts.find(item => item.id === id)?.name || 'Produto removido'}</span>)}</div>{p.type === 'combo' && <p className="fine-print">Todos os produtos selecionados · mínimo de {p.minQuantity} unidades no total.</p>}<button className="button button-outline button-small" onClick={() => toggle(p)}>{p.active ? 'Pausar campanha' : 'Ativar campanha'}</button></article>;
    })}</div>{!promotions.length && <Empty>Crie sua primeira campanha para destacar a coleção.</Empty>}
    {editing && <PromotionForm promotion={editing} onClose={close} />}{deleting && <Confirm title="Excluir campanha?" onClose={cancelDelete} onConfirm={() => runAction('deletePromotion', deleting.id)}>A campanha “{deleting.name}” deixará de aplicar descontos. Pedidos anteriores serão preservados.</Confirm>}
  </>;
}
function PromotionForm({ promotion, onClose }) {
  const { rawProducts, runAction } = useStore();
  const [draft, setDraft] = useState({ ...promotion, value: promotion.type === 'fixed' ? (promotion.value / 100).toFixed(2) : promotion.value, startsAt: localDate(promotion.startsAt), endsAt: localDate(promotion.endsAt) });
  const [error, setError] = useState('');
  const change = (key, value) => setDraft(s => ({ ...s, [key]: value }));
  function save(e) {
    e.preventDefault();
    try { runAction('promotion', { ...draft, value: draft.type === 'fixed' ? cents(draft.value) : Number(draft.value), minQuantity: Number(draft.minQuantity), startsAt: new Date(draft.startsAt).toISOString(), endsAt: new Date(draft.endsAt).toISOString() }); onClose(); }
    catch (err) { setError(err.message); }
  }
  return <Modal title={promotion.id ? 'Editar campanha' : 'Criar campanha'} onClose={onClose} wide><form className="admin-form" onSubmit={save}><div className="admin-form-grid"><div className="admin-form-column"><Field label="Nome da campanha" required minLength={2} maxLength={100} value={draft.name} onChange={e => change('name', e.target.value)} /><Field label="Texto da oferta"><textarea rows={3} maxLength={300} value={draft.description} onChange={e => change('description', e.target.value)} /></Field><Field label="Tipo de desconto"><select value={draft.type} onChange={e => setDraft(s => ({ ...s, type: e.target.value, value: 10 }))}><option value="percent">Percentual por produto</option><option value="fixed">Valor fixo por unidade</option><option value="combo">Combo: percentual nos produtos juntos</option></select></Field><Field label={draft.type === 'fixed' ? 'Desconto por unidade (R$)' : 'Desconto (%)'} hint="Calculado sobre o preço original, sem acumular." type="number" min="0.01" max={draft.type === 'fixed' ? undefined : '99.99'} step="0.01" required value={draft.value} onChange={e => change('value', e.target.value)} />{draft.type === 'combo' && <Field label="Quantidade mínima total" type="number" min="2" step="1" required value={draft.minQuantity} onChange={e => change('minQuantity', e.target.value)} />}<div className="admin-two-fields"><Field label="Início (horário local)" type="datetime-local" required value={draft.startsAt} onChange={e => change('startsAt', e.target.value)} /><Field label="Término (horário local)" type="datetime-local" required value={draft.endsAt} onChange={e => change('endsAt', e.target.value)} /></div><label className="admin-check"><input type="checkbox" checked={draft.active} onChange={e => change('active', e.target.checked)} />Campanha ativa (respeita o período)</label></div>
    <div className="admin-form-column"><h3>Selecione os produtos</h3><p className="fine-print">Destaques e lançamentos podem ser configurados em Produtos & estoque.</p><div className="admin-product-picker">{rawProducts.map(p => <label className="admin-check" key={p.id}><input type="checkbox" checked={draft.productIds.includes(p.id)} onChange={e => change('productIds', e.target.checked ? [...draft.productIds, p.id] : draft.productIds.filter(id => id !== p.id))} /><span>{p.name}<small>{money(p.originalPrice)} · {p.active ? 'Ativo' : 'Inativo'}</small></span></label>)}</div></div></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="admin-form-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancelar</button><button className="button" type="submit">Salvar campanha</button></div></form></Modal>;
}
