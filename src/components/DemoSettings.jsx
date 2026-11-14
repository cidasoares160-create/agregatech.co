import { useState } from 'react';
import { Info, MessageCircle, Save } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { validStorePhone, whatsappUrl } from '../data/demo';
import { Modal } from './UI';

export default function DemoSettings({ onClose }) {
  const { settings, configure } = useStore();
  const [draft, setDraft] = useState({ ...settings });
  const [error, setError] = useState('');
  function save(event) {
    event.preventDefault();
    if (draft.name.trim().length < 2) { setError('Informe um nome comercial com pelo menos 2 caracteres.'); return; }
    const phone = draft.whatsapp.replace(/\D/g, '');
    if (phone && !validStorePhone(phone)) { setError('Use o código do país, DDD e número. Exemplo de formato: 55 + 11 + 999999999.'); return; }
    configure({ ...draft, name: draft.name.trim(), whatsapp: phone });
    onClose();
  }
  return <Modal title="Personalize sua demonstração" onClose={onClose}><div className="settings-notice"><Info size={20} /><p>Configuração local de apresentação, sem acesso a dados reais. As alterações ficam apenas neste navegador. Isto não é um painel administrativo autenticado.</p></div><form className="form-stack" onSubmit={save}>
    <label>Nome da loja<input required minLength={2} maxLength={40} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
    <label>WhatsApp da representante<input type="tel" maxLength={22} placeholder="55 + DDD + número" value={draft.whatsapp} onChange={e => setDraft({ ...draft, whatsapp: e.target.value })} /><span className="field-help">Inclua o código do país. Deixe vazio para não direcionar mensagens a nenhum número.</span></label>
    <label>Informações de entrega<textarea rows={2} required maxLength={300} value={draft.delivery} onChange={e => setDraft({ ...draft, delivery: e.target.value })} /></label>
    <label>Informações de pagamento<textarea rows={2} required maxLength={300} value={draft.payment} onChange={e => setDraft({ ...draft, payment: e.target.value })} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button full-width" type="submit"><Save size={17} /> Salvar configuração local</button>
  </form></Modal>;
}
export function Contact({ onClose, onConfigure }) {
  const { settings } = useStore();
  const configured = validStorePhone(settings.whatsapp);
  return <Modal title="Uma boa conversa começa aqui." onClose={onClose}><div className="contact-intro"><span className="round-icon"><MessageCircle size={28} strokeWidth={1.5} /></span><h3>Vamos encontrar novas possibilidades?</h3><p>{configured ? 'Converse diretamente com a representante pelo WhatsApp. Será aberta uma nova aba com uma mensagem pronta para você enviar.' : 'Esta é uma apresentação demonstrativa. Nenhum número de atendimento foi inventado: configure o WhatsApp da representante para experimentar o contato e o envio de pedidos.'}</p></div>{configured ? <a className="button full-width" href={whatsappUrl(settings.whatsapp, `Olá! Conheci a ${settings.name} pela Minha Loja Inteligente e gostaria de saber mais.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Fale conosco no WhatsApp</a> : <button className="button full-width" onClick={onConfigure}>Configurar contato da demonstração</button>}<p className="fine-print">{configured ? `Contato configurado neste navegador: +${settings.whatsapp}` : 'Você poderá utilizar seu próprio número para testar, sem realizar qualquer cobrança.'}</p></Modal>;
}
