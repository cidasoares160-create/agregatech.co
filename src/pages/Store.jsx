import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gem, MessageCircle, PackageCheck, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { categories } from '../data/demo';
import { useStore } from '../store/StoreContext';
import { ProductCard, ProductDetails } from '../components/Product';

const collections = [['todos', 'Toda a coleção'], ['destaques', 'Nossos favoritos'], ['lancamentos', 'Novidades'], ['mais-vendidos', 'Mais vendidos'], ['ofertas', 'Ofertas especiais']];
export default function Store({ onContact }) {
  const { products, settings, campaigns } = useStore();
  const storeCategories = ['Todos', ...new Set([...categories.filter(c => c !== 'Todos'), ...products.filter(p => p.active).map(p => p.category)])];
  const largestDiscount = Math.max(0, ...products.filter(p => p.active && p.stock > 0).map(p => Math.round((1 - p.price / p.originalPrice) * 100)));
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const closeDetails = useCallback(() => setSelected(null), []);
  const category = params.get('categoria') || 'Todos';
  const collection = params.get('colecao') || 'todos';
  const query = params.get('busca') || '';
  const sort = params.get('ordem') || 'curadoria';
  function filter(key, value) {
    setParams(current => { const next = new URLSearchParams(current); value ? next.set(key, value) : next.delete(key); return next; }, { replace: true });
  }
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = products.filter(p => p.active && (category === 'Todos' || p.category === category)
    && normalize(`${p.name} ${p.category} ${p.description}`).includes(normalize(query))
    && (collection === 'todos' || (collection === 'destaques' && p.featured) || (collection === 'lancamentos' && p.isNew) || (collection === 'mais-vendidos' && p.bestSeller) || (collection === 'ofertas' && p.price < p.originalPrice)))
    .sort((a, b) => sort === 'menor' ? a.price - b.price : sort === 'maior' ? b.price - a.price : sort === 'nome' ? a.name.localeCompare(b.name, 'pt-BR') : Number(b.featured) - Number(a.featured));
  return <main id="conteudo">
    <section className="store-hero container"><div className="store-hero-copy enter"><span className="section-kicker"><Sparkles size={14} /> COLEÇÃO ESSÊNCIA · EDIÇÃO DEMONSTRATIVA</span><h1>{settings.campaignTitle === 'Para brilhar. Do seu jeito.' ? <>Para brilhar.<br /><em>Do seu jeito.</em></> : settings.campaignTitle}</h1><p>{settings.campaignText}</p><a href="#catalogo" className="button">Encontre seu favorito <ArrowRight size={17} /></a><span className="hero-offer">{largestDiscount > 0 ? `Uma seleção especial, com até ${largestDiscount}% de desconto.*` : 'Uma seleção especial de joias e acessórios.'}</span></div><div className="store-hero-image"><img src={settings.cover || '/images/jewelry-editorial.jpg'} alt={`Seleção de joias e acessórios da ${settings.name}`} fetchPriority="high" /><span className="store-image-label">{settings.name}<small>{settings.tagline}</small></span></div><span className="hero-season">THE EVERYDAY COLLECTION</span></section>
    {campaigns.length > 0 && <section className="container store-campaigns" aria-label="Campanhas em vigor">{campaigns.map(c => <article key={c.id}><span className="eyebrow">{c.type === 'combo' ? 'COMBO ESPECIAL' : 'OFERTA POR TEMPO LIMITADO'}</span><h2>{c.name}</h2><p>{c.description}</p><p>{c.type === 'fixed' ? `R$ ${(c.value / 100).toFixed(2).replace('.', ',')} de desconto por unidade` : `${c.value}% de desconto sobre o preço original`}{c.type === 'combo' ? ` · Combine todos os produtos abaixo, com no mínimo ${c.minQuantity} unidades no total.` : ' · Vale o menor preço, sem acumular descontos.'}</p><div className="store-campaign-products">{c.productIds.map(id => products.find(p => p.id === id && p.active)).filter(Boolean).map(p => <button key={p.id} className="category-chip" onClick={() => setSelected(p)}>{p.name} <ArrowUpRight size={13} /></button>)}</div><small>Válida até {new Date(c.endsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}. {c.type === 'combo' ? 'Desconto calculado na sacola quando as condições forem atendidas.' : 'Preços atualizados nos produtos.'}</small></article>)}</section>}
    <div className="container store-trust"><span><Gem size={19} /> Uma curadoria feita com carinho</span><span><MessageCircle size={19} /> Atendimento pelo WhatsApp</span><span><PackageCheck size={19} /> Entrega combinada com você</span></div>
    <section id="catalogo" className="container catalog"><div className="section-heading"><div><span className="eyebrow">ENCONTRE ALGO ESPECIAL</span><h2>Pequenos detalhes, grandes encantos.</h2></div><span className="catalog-total">{products.filter(p => p.active).length} peças na coleção</span></div>
      <nav className="collection-tabs" aria-label="Coleções">{collections.map(([value, label]) => <button key={value} className={collection === value ? 'active' : ''} onClick={() => filter('colecao', value)} aria-pressed={collection === value}>{label}{value === 'lancamentos' && <span className="tab-dot" />}</button>)}</nav>
      <div className="catalog-toolbar"><label className="search-field"><Search size={19} /><span className="sr-only">Pesquisar produtos</span><input type="search" placeholder="Qual será seu próximo favorito?" value={query} onChange={e => filter('busca', e.target.value)} /></label><label className="sort-field"><SlidersHorizontal size={16} /><span className="sr-only">Ordenar produtos</span><select value={sort} onChange={e => filter('ordem', e.target.value)}><option value="curadoria">Nossa curadoria</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="nome">Nome: A a Z</option></select></label></div>
      <div className="category-row">{storeCategories.map(item => <button key={item} className={`category-chip ${item === category ? 'active' : ''}`} onClick={() => filter('categoria', item)} aria-pressed={item === category}>{item}</button>)}</div>
      <div className="results-line"><span>{filtered.length} {filtered.length === 1 ? 'peça encontrada' : 'peças encontradas'}{query && ` para “${query}”`}</span>{(query || category !== 'Todos' || collection !== 'todos') && <button className="text-link" onClick={() => setParams({})}>Limpar filtros <X size={13} /></button>}</div>
      {collection === 'mais-vendidos' && <p className="demo-inline">Seleção ilustrativa de mais vendidos. Não representa vendas reais.</p>}
      {filtered.length ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} onDetails={setSelected} />)}</div> : <div className="empty-state"><Search size={36} strokeWidth={1} /><h3>Nenhuma peça por aqui.</h3><p>Experimente outro nome ou descubra a coleção completa.</p><button className="button" onClick={() => setParams({})}>Ver toda a coleção <ArrowRight size={16} /></button></div>}
      <p className="catalog-disclaimer">*Preços, estoque e ofertas demonstrativos. Fotografias e ilustrações de referência. Confirme materiais, medidas e condições com a representante.</p>
    </section>
    <section className="container personal-service"><span className="round-icon"><MessageCircle size={25} strokeWidth={1.5} /></span><div><span className="eyebrow">ESCOLHER TAMBÉM PODE SER UMA CONVERSA</span><h2>Um atendimento tão especial quanto você.</h2><p>Precisa de ajuda para escolher? Vamos encontrar sua peça ideal.</p></div><button className="button button-outline" onClick={onContact}>Fale com a representante <ArrowUpRight size={17} /></button></section>
    <div className="container store-policies"><div><h3>Entrega do seu jeito</h3><p>{settings.delivery}</p></div><div><h3>Compra com transparência</h3><p>{settings.payment}</p></div>{(settings.address || settings.hours || settings.instagram) && <div><h3>Encontre a representante</h3>{settings.address && <p>{settings.address}</p>}{settings.hours && <p>{settings.hours}</p>}{settings.instagram && <a className="text-link" href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={14} /></a>}</div>}{settings.rules && <div><h3>Condições da loja</h3><p>{settings.rules}</p></div>}<Link to="/" className="text-link">Voltar à central de acesso <ArrowUpRight size={16} /></Link></div>
    {selected && <ProductDetails product={selected} onClose={closeDetails} />}
  </main>;
}
