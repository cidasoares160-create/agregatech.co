import { useState } from 'react';
import { Upload, ImagePlus, Search } from 'lucide-react';
import { Modal } from './UI';
import { money, orderStatuses } from '../data/demo';

export const dateLabel = value => value ? new Date(value).toLocaleDateString('pt-BR') : '—';
export const timeLabel = value => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
export const cents = value => Math.round(Number(value) * 100);
export function PageHeading({ eyebrow, title, description, children }) {
  return <div className="admin-heading"><div><span className="eyebrow">{eyebrow || 'SEU NEGÓCIO, MAIS ORGANIZADO'}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}
export function Field({ label, children, hint, ...props }) {
  return <label className="admin-field"><span>{label}</span>{children || <input {...props} />}{hint && <small>{hint}</small>}</label>;
}
export function SearchBox({ value, onChange, placeholder = 'Pesquisar…' }) {
  return <label className="admin-search"><Search size={18} /><span className="sr-only">{placeholder}</span><input type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
export function Status({ value }) { return <span className={`status status-${value}`}>{orderStatuses[value] || value}</span>; }
export function Empty({ children }) { return <div className="admin-empty">{children || 'Nenhum registro encontrado com estes filtros.'}</div>; }
export function Confirm({ title, children, onClose, onConfirm }) {
  const [error, setError] = useState('');
  return <Modal title={title} onClose={onClose}><p className="modal-intro">{children}</p>{error && <p role="alert" className="form-error">{error}</p>}<div className="admin-form-actions"><button className="button button-outline" onClick={onClose}>Voltar</button><button className="button" onClick={() => { try { onConfirm(); onClose(); } catch (e) { setError(e.message); } }}>Confirmar</button></div></Modal>;
}
export function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Envie JPG, PNG ou WebP de até 8 MB.'); return; }
    setBusy(true); setError('');
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
      const ratio = Math.min(1, 900 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(img.width * ratio)); canvas.height = Math.max(1, Math.round(img.height * ratio));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      let quality = .8; let data = canvas.toDataURL('image/webp', quality);
      while (data.length > 220000 && quality > .3) { quality -= .1; data = canvas.toDataURL('image/webp', quality); }
      if (data.length > 400000) throw new Error('Imagem muito detalhada. Tente um arquivo menor.');
      onChange(data);
    } catch (e) { setError(e.message || 'Não foi possível ler a imagem. Tente outro arquivo.'); }
    finally { URL.revokeObjectURL(url); setBusy(false); }
  }
  return <div className="image-field"><span className="admin-field-label">{label}</span><div className="image-upload">{value ? <img src={value} alt={`Prévia: ${label}`} /> : <ImagePlus size={30} />}<div><label className="button button-outline button-small"><Upload size={15} />{busy ? 'Otimizando…' : 'Enviar fotografia'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload} className="sr-only" /></label>{value && <button type="button" className="text-link" onClick={() => onChange('')}>Remover imagem</button>}<small>JPG, PNG ou WebP · até 8 MB. Otimizada para salvar no navegador.</small></div></div><Field label="Ou use uma URL HTTPS" type="url" placeholder="https://…" value={value?.startsWith('https://') ? value : ''} onChange={e => onChange(e.target.value)} />{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
export function OrderLines({ order }) {
  return <>{order.referralCode && <p className="admin-callout">Indicação registrada com o código {order.referralCode}. Conversão depende de primeira compra concluída e das regras preservadas no programa.</p>}{order.rewardDiscount > 0 && <p className="admin-callout">Crédito de indicação aplicado: {money(order.rewardDiscount)}. Incluído nos descontos abaixo; os preços unitários dos produtos permanecem preservados. Informe o total atualizado à cliente.</p>}<div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead><tbody>{order.lines.map((l, i) => <tr key={`${l.productId}-${i}`}><td>{l.name}</td><td>{l.quantity}</td><td>{money(l.price)}</td><td>{money(l.price * l.quantity)}</td></tr>)}</tbody></table></div><dl className="admin-totals"><div><dt>Subtotal original</dt><dd>{money(order.subtotal)}</dd></div><div><dt>Descontos</dt><dd>− {money(order.discount)}</dd></div><div><dt>Total dos produtos</dt><dd>{money(order.total)}</dd></div></dl><p className="fine-print">Entrega não incluída. Não há pagamento online nem confirmação financeira automática.</p></>;
}
