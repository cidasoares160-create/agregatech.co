import { useCallback, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { categories, money } from '../../data/demo';
import { ProductImage } from '../../components/Product';
import { Modal } from '../../components/UI';
import { cents, Confirm, Empty, Field, ImageField, PageHeading, SearchBox } from '../../components/AdminUI';

export default function AdminProducts() {
  const { rawProducts, runAction, notify } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const close = useCallback(() => setEditing(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);
  const filtered = rawProducts.filter(p => `${p.name} ${p.category}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (filter === 'all' || (filter === 'active' && p.active) || (filter === 'inactive' && !p.active) || (filter === 'low' && p.stock <= 3)));
  function toggle(product) { try { runAction('product', { ...product, active: !product.active }); } catch (e) { notify(e.message); } }
  return <><PageHeading title="Uma coleção de possibilidades." description="Cadastre, organize e cuide de cada detalhe do seu catálogo."><button className="button" onClick={() => setEditing({ name: '', category: 'Brincos', description: '', detail: '', price: 0, originalPrice: 0, stock: 0, image: '', imageMode: 'single', artwork: 'earrings', active: true, featured: false, isNew: false, bestSeller: false })}><Plus size={18} /> Novo produto</button></PageHeading>
    <section className="admin-panel"><div className="admin-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Buscar nome ou categoria" /><label className="admin-filter"><span className="sr-only">Filtrar produtos</span><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todos os produtos ({rawProducts.length})</option><option value="active">Ativos na loja</option><option value="inactive">Desativados</option><option value="low">Estoque baixo (até 3)</option></select></label></div>
    <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Produto</th><th>Preço original / atual</th><th>Estoque disponível</th><th>Visibilidade</th><th>Ações</th></tr></thead><tbody>{filtered.map(p => <tr key={p.id}><td><div className="admin-product-cell"><ProductImage product={p} /><div><strong>{p.name}</strong><small>{p.category}{p.featured ? ' · Destaque' : ''}{p.isNew ? ' · Lançamento' : ''}</small></div></div></td><td><small>{money(p.originalPrice)}</small><strong>{money(p.price)}</strong></td><td><span className={p.stock <= 3 ? 'danger' : ''}>{p.stock} un.</span></td><td><button className={`status ${p.active ? 'status-concluido' : 'status-cancelado'}`} onClick={() => toggle(p)} aria-label={`${p.active ? 'Desativar' : 'Ativar'} ${p.name}`}>{p.active ? 'Ativo' : 'Inativo'}</button></td><td><div className="admin-actions"><button className="icon-button" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}><Pencil size={16} /></button><button className="icon-button" onClick={() => setDeleting(p)} aria-label={`Excluir ${p.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{!filtered.length && <Empty />}</div><p className="fine-print">Preços acima são os preços cadastrados. Campanhas vigentes podem reduzir o valor exibido na loja. O estoque disponível já desconta pedidos confirmados.</p></section>
    {editing && <ProductForm product={editing} onClose={close} />}
    {deleting && <Confirm title="Excluir produto?" onClose={cancelDelete} onConfirm={() => runAction('deleteProduct', deleting.id)}>Excluir “{deleting.name}” é definitivo. Produtos com pedidos no histórico devem ser desativados, não excluídos.</Confirm>}
  </>;
}
function ProductForm({ product, onClose }) {
  const { runAction, rawProducts } = useStore();
  const [draft, setDraft] = useState({ ...product, regular: (product.originalPrice / 100).toFixed(2), sale: (product.price / 100).toFixed(2) });
  const [error, setError] = useState('');
  const update = (key, value) => setDraft(s => ({ ...s, [key]: value }));
  function save(e) {
    e.preventDefault();
    try {
      const { regular, sale, ...rest } = draft;
      runAction('product', { ...rest, originalPrice: cents(regular), price: sale === '' ? cents(regular) : cents(sale), stock: Number(draft.stock) });
      onClose();
    } catch (err) { setError(err.message); }
  }
  const categoryOptions = [...new Set([...categories.filter(c => c !== 'Todos'), ...rawProducts.map(p => p.category)])];
  return <Modal title={product.id ? 'Editar produto' : 'Um novo favorito na coleção'} onClose={onClose} wide><form className="admin-form" onSubmit={save}><div className="admin-form-grid"><div className="admin-form-column">
    <ImageField label="Fotografia do produto" value={draft.image} onChange={value => setDraft(s => ({ ...s, image: value, imageMode: 'single', quadrant: 0 }))} />
    {!draft.image && <Field label="Ilustração alternativa"><select value={draft.artwork || 'earrings'} onChange={e => update('artwork', e.target.value)}><option value="earrings">Brincos</option><option value="necklace">Colar</option><option value="bracelet">Pulseira</option><option value="barrette">Presilha</option></select></Field>}
    <p className="fine-print">Use apenas imagens que você tem autorização para publicar. O envio é local, não utiliza armazenamento em nuvem.</p>
    <div className="admin-checks">{[['active', 'Ativo na loja'], ['featured', 'Destacar na coleção'], ['isNew', 'Marcar como lançamento'], ['bestSeller', 'Seleção demonstrativa de mais vendidos']].map(([key, label]) => <label className="admin-check" key={key}><input type="checkbox" checked={Boolean(draft[key])} onChange={e => update(key, e.target.checked)} />{label}</label>)}</div>
  </div><div className="admin-form-column"><Field label="Nome" required minLength={2} maxLength={100} value={draft.name} onChange={e => update('name', e.target.value)} /><Field label="Categoria" hint="Escolha uma existente ou digite uma nova." required list="product-categories" maxLength={45} value={draft.category} onChange={e => update('category', e.target.value)} /><datalist id="product-categories">{categoryOptions.map(c => <option key={c} value={c} />)}</datalist>
    <Field label="Descrição"><textarea rows={4} required maxLength={1800} value={draft.description} onChange={e => update('description', e.target.value)} /></Field><Field label="Detalhe curto / medidas" maxLength={160} value={draft.detail || ''} onChange={e => update('detail', e.target.value)} />
    <div className="admin-two-fields"><Field label="Preço original (R$)" type="number" min="0.01" step="0.01" required value={draft.regular} onChange={e => update('regular', e.target.value)} /><Field label="Preço atual (R$)" hint="Vazio = preço original." type="number" min="0.01" step="0.01" value={draft.sale} onChange={e => update('sale', e.target.value)} /></div><Field label="Estoque disponível" hint="Quantidade disponível para novos pedidos, sem unidades já reservadas." type="number" min="0" step="1" required value={draft.stock} onChange={e => update('stock', e.target.value)} />
  </div></div>{error && <p role="alert" className="form-error">{error}</p>}<div className="admin-form-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancelar</button><button type="submit" className="button">Salvar produto</button></div></form></Modal>;
}
