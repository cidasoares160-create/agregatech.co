import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, Info, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { money, validPhone, validStorePhone, whatsappUrl } from '../data/demo';
import { useStore } from '../store/StoreContext';
import { ProductImage } from '../components/Product';
import { Modal, Quantity } from '../components/UI';

export default function Bag({ onConfigure }) {
  const { lines, quantity, subtotal, total, discount, settings, saveDraft, notify, referralCode, runAction } = useStore();
  const [customer, setCustomer] = useState({ name: '', phone: '', notes: '' });
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState(null);
  const closePreview = useCallback(() => setPrepared(null), []);
  function prepare(event) {
    event.preventDefault();
    if (customer.name.trim().length < 2) { setError('Informe seu nome com pelo menos 2 caracteres.'); return; }
    if (!validPhone(customer.phone)) { setError('Informe um telefone válido, incluindo o DDD.'); return; }
    if (!lines.length) { setError('Adicione um produto disponível à sacola.'); return; }
    const cleaned = { name: customer.name.trim(), phone: customer.phone.trim(), notes: customer.notes.trim() };
    let order;
    try { order = saveDraft(cleaned); }
    catch (err) { setError(err.message); return; }
    const text = [
      `Olá! Gostaria de fazer um pedido pela loja digital ${settings.name}.`,
      'DEMONSTRAÇÃO — pedido sujeito à confirmação. Nenhum pagamento realizado.',
      `Referência: ${order.id.slice(0, 8).toUpperCase()}`,
      `Cliente: ${cleaned.name}\nTelefone: ${cleaned.phone}${order.referralCode ? `\nCódigo de indicação: ${order.referralCode} (sujeito às regras do programa)` : ''}`, 
      ...lines.map(p => `Produto: ${p.name}\nQuantidade: ${p.quantity}\nValor unitário: ${money(p.price)}${p.originalPrice > p.price ? ` (de ${money(p.originalPrice)})` : ''}\nSubtotal: ${money(p.price * p.quantity)}`),
      `Subtotal original: ${money(subtotal)}\nDescontos: ${money(discount)}\nTotal dos produtos: ${money(total)}\nEntrega: valor a combinar, não incluído no total.`,
      `Observações: ${cleaned.notes || 'Nenhuma.'}`,
      'Gostaria de confirmar a disponibilidade, as formas de pagamento e combinar a entrega.',
    ].join('\n\n');
    setError(''); setPrepared({ order, text });
  }
  async function copy() {
    try { await navigator.clipboard.writeText(prepared.text); notify('Mensagem copiada. Cole na conversa com a representante.'); }
    catch { notify('Não foi possível copiar automaticamente. Selecione o texto da mensagem e copie.'); }
  }
  if (!lines.length) return <main id="conteudo" className="container bag-page"><Link to="/loja" className="text-link"><ArrowLeft size={16} /> Voltar à loja</Link><div className="empty-state empty-bag"><span className="empty-bag-icon"><ShoppingBag size={36} strokeWidth={1} /></span><span className="eyebrow">ESPAÇO PARA NOVOS FAVORITOS</span><h1>Sua sacola espera<br />por algo especial.</h1><p>Explore nossa coleção e encontre os detalhes que combinam com você.</p><Link to="/loja" className="button">Descobrir a coleção <ArrowRight size={17} /></Link></div></main>;
  return <main id="conteudo" className="container bag-page"><Link to="/loja" className="text-link"><ArrowLeft size={16} /> Continuar escolhendo</Link><div className="section-heading"><div><span className="eyebrow">SUAS ESCOLHAS, COM CARINHO</span><h1>Minha sacola.</h1></div><span className="catalog-total">{lines.reduce((s, p) => s + p.quantity, 0)} itens selecionados</span></div>
    <div className="bag-layout"><section aria-label="Produtos na sacola"><div className="bag-items">{lines.map(p => <article className="bag-item" key={p.id}><ProductImage product={p} /><div className="bag-item-info"><span className="eyebrow">{p.category}</span><h2>{p.name}</h2><div className="product-price">{p.originalPrice > p.price && <del>{money(p.originalPrice)}</del>}<strong>{money(p.price)}</strong><small>/ unidade</small></div><Quantity value={p.quantity} max={p.stock} onChange={value => quantity(p.id, value)} label={`Quantidade de ${p.name}`} /></div><div className="bag-item-end"><button className="icon-button" onClick={() => quantity(p.id, 0)} aria-label={`Remover ${p.name}`}><Trash2 size={17} /></button><strong>{money(p.price * p.quantity)}</strong></div></article>)}</div><div className="bag-note"><Info size={19} /><p>Você está em uma loja demonstrativa. Os produtos não são reservados ao adicioná-los à sacola. Disponibilidade, entrega e pagamento serão combinados no atendimento.</p></div></section>
      <aside className="order-summary"><span className="eyebrow">QUASE SEUS</span><h2>Resumo do pedido</h2><dl><div><dt>Subtotal dos produtos</dt><dd>{money(subtotal)}</dd></div><div className="discount-line"><dt>Você economiza</dt><dd>− {money(discount)}</dd></div><div><dt>Entrega</dt><dd>A combinar</dd></div><div className="total-line"><dt>Total dos produtos</dt><dd>{money(total)}</dd></div></dl>
        <div className="form-stack"><label>Código de quem indicou (opcional)<input maxLength={32} value={referralCode} onChange={e => runAction('referralCode', e.target.value)} placeholder="Ex.: AURA0001" /></label><p className="fine-print">O código recebido pelo link fica salvo aqui. Uma visita não gera recompensa. A primeira compra precisa ser concluída e cumprir as regras; use somente dados fictícios.</p>{referralCode && <button type="button" className="text-link" onClick={() => runAction('referralCode', '')}>Remover indicação</button>}</div>
        <form onSubmit={prepare} className="form-stack"><h3>Como podemos chamar você?</h3><label>Seu nome<input autoComplete="name" required minLength={2} maxLength={100} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Nome e sobrenome" /></label><label>Seu telefone com DDD<input type="tel" autoComplete="tel" required maxLength={22} value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="(11) 99999-9999" /></label><label>Alguma observação? <span className="muted">(opcional)</span><textarea rows={3} maxLength={1000} value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} placeholder="Preferências, dúvidas ou detalhes para a entrega…" /></label>{error && <p role="alert" className="form-error">{error}</p>}<button type="submit" className="button full-width"><MessageCircle size={18} /> Preparar pedido para WhatsApp</button><p className="fine-print"><Check size={13} /> Sem cobrança online. Você confere a mensagem antes de enviar.</p><p className="privacy-note">Use dados fictícios nesta apresentação. O rascunho é salvo apenas neste navegador e, ao enviar, os dados informados serão compartilhados com o número configurado.</p></form>
      </aside></div>
    {prepared && <Modal title="Seu pedido está pronto para conversar" onClose={closePreview}><p className="modal-intro">Rascunho demonstrativo <strong>#{prepared.order.id.slice(0, 8).toUpperCase()}</strong>. Confira a mensagem e envie na conversa do WhatsApp. Abrir o aplicativo não confirma o envio nem a compra.</p><textarea className="message-preview" aria-label="Mensagem do pedido" readOnly value={prepared.text} rows={12} /><div className="preview-actions"><button className="button button-outline" onClick={copy}><Copy size={16} /> Copiar mensagem</button>{validStorePhone(settings.whatsapp) ? <a className="button" href={whatsappUrl(settings.whatsapp, prepared.text)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Abrir WhatsApp</a> : <button className="button" onClick={() => { setPrepared(null); onConfigure(); }}>Configurar WhatsApp <ArrowRight size={16} /></button>}</div><p className="fine-print">{validStorePhone(settings.whatsapp) ? `Destino configurado: +${settings.whatsapp}. O rascunho permanece na sacola até você remover os itens.` : 'Nenhum contato está configurado. Defina um número de teste e prepare o pedido novamente, ou copie a mensagem.'}</p></Modal>}
  </main>;
}
