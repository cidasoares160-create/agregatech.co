import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowUpRight, Check, Copy, Download, Gift, Gem, MessageCircle, Smartphone, Sparkles } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { money } from '../data/demo';
import { availableReward, referralUrl, shopUrl } from '../store/growth';
import './growth.css';

export function ShareText({ text }) {
  const { notify } = useStore();
  const [fallback, setFallback] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); notify('Texto copiado. Revise antes de compartilhar.'); }
    catch { setFallback(true); notify('Selecione e copie o texto abaixo.'); }
  }
  return <><div className="growth-actions"><button type="button" className="button button-outline button-small" onClick={copy}><Copy size={16} /> Copiar</button><a className="button button-small" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}><MessageCircle size={16} /> Compartilhar</a></div>{fallback && <textarea className="message-preview" aria-label="Texto para copiar manualmente" readOnly value={text} onFocus={e => e.target.select()} rows={5} />}</>;
}
export function ReferralBanner() {
  const { settings, referralCode } = useStore();
  return <section className="container growth-banner"><span className="growth-icon"><Gift size={30} /></span><div><span className="eyebrow">BOAS DESCOBERTAS MERECEM SER COMPARTILHADAS</span><h2>Indique e ganhe!</h2><p>{referralCode ? `Código recebido: ${referralCode}. Confira ou remova na sacola antes de preparar o pedido.` : 'Compartilhe seus favoritos, convide suas amigas e conquiste benefícios especiais.'}</p>{!settings.referralRules.enabled && <small>Programa pausado para novas indicações.</small>}</div><Link className="button button-outline" to="/indique">Conhecer o programa <ArrowUpRight size={17} /></Link></section>;
}
export function ReferralPage() {
  const { customers, referrals, rewards, settings, clock } = useStore();
  const [id, setId] = useState(customers[0]?.id || '');
  const customer = customers.find(c => c.id === id);
  const rules = settings.referralRules;
  const list = referrals.filter(r => r.referrerId === id);
  const benefits = rewards.filter(r => r.customerId === id && availableReward(r, clock));
  return <main id="conteudo" className="container growth-page"><div className="growth-title"><span className="eyebrow">CONEXÕES QUE FLORESCEM</span><h1>Indique e <em>ganhe!</em></h1><p>Compartilhe seus produtos favoritos, convide suas amigas para conhecer nossa loja e ganhe benefícios especiais pelas suas indicações!</p></div><div className="growth-two"><section className="growth-card"><Gift size={30} /><h2>Uma boa indicação vale muito.</h2><ol className="growth-steps"><li>Compartilhe seu código ou link exclusivo.</li><li>Sua amiga informa o código na primeira compra.</li><li>A representante conclui a compra válida e o benefício é registrado.</li></ol><p>Recompensa: <strong>{rules.type === 'fixed' ? money(rules.value) : `${rules.value}% do total da compra válida`}</strong> por indicação, liberada em lotes de {rules.minimum}. Compra mínima: <strong>{money(rules.minimumPurchase)}</strong>. Validade: {rules.validityDays} dias após a conversão que completa o lote.</p><p className="fine-print">{rules.enabled ? 'Programa ativo.' : 'Novas indicações pausadas.'} Somente a primeira compra concluída de uma nova cliente é elegível. Visitas, rascunhos e pedidos cancelados não geram crédito. Não é permitido indicar a si mesma. Regras são preservadas no registro da indicação. Crédito aplicado pela representante a um pedido novo/em atendimento de valor igual ou superior, um benefício por pedido, sem troco ou saque.</p></section><section className="growth-card form-stack"><span className="eyebrow">EXPERIMENTE COM DADOS FICTÍCIOS</span><h2>Seu convite, sua próxima conexão.</h2><p className="fine-print">Este seletor é apenas uma demonstração pública, não uma área autenticada. Códigos, pedidos e benefícios funcionam somente com os dados deste navegador; não são sincronizados com o celular de outra pessoa.</p><label>Perfil demonstrativo<select value={id} onChange={e => setId(e.target.value)}>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>{customer ? <><strong className="growth-code">{customer.referralCode}</strong><textarea className="message-preview" rows={2} aria-label="Link exclusivo de indicação" readOnly value={referralUrl(settings, customer.referralCode)} /><ShareText text={`Conheça a ${settings.name}! Use meu código ${customer.referralCode} na sua primeira compra. Confira as regras em ${new URL('/indique', shopUrl(settings)).toString()}. ${referralUrl(settings, customer.referralCode)}`} /><div className="growth-stats"><span><b>{list.length}</b> indicações</span><span><b>{list.filter(r => r.status === 'convertida').length}</b> convertidas</span><span><b>{money(benefits.reduce((sum, r) => sum + r.amount, 0))}</b> disponível</span></div><Link className="text-link" to="/painel/indicacoes">Consultar histórico demonstrativo <ArrowUpRight size={15} /></Link></> : <p>Cadastre uma cliente fictícia no painel para experimentar.</p>}</section></div><Link to="/loja" className="text-link">Voltar à coleção <ArrowUpRight size={16} /></Link></main>;
}
export function SmartPlaque() {
  const { settings, notify } = useStore();
  const qr = useRef(null);
  const url = shopUrl(settings);
  function download() {
    const svg = qr.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const source = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = source; a.download = 'qr-code-minha-loja.svg'; a.click(); setTimeout(() => URL.revokeObjectURL(source), 1000);
    notify('QR Code baixado. Teste com a câmera do celular antes de imprimir.');
  }
  return <div className="growth-two plaque-layout"><section className="smart-plaque"><span className="eyebrow">UMA CONEXÃO COM O EXTRAORDINÁRIO</span>{settings.logo ? <img className="plaque-logo" src={settings.logo} alt="" /> : <Gem size={34} />}<h2>{settings.name}</h2><p>Sua próxima descoberta está aqui.</p><div className="real-qr" ref={qr}><QRCodeSVG value={url} size={208} level="M" marginSize={4} title={`Acessar ${settings.name}`} /></div><strong>Aponte a câmera. Explore a coleção.</strong><span className="nfc-line"><Smartphone size={22} /> QR Code · NFC após gravação da etiqueta</span></section><section className="growth-card"><span className="eyebrow">DO FÍSICO AO DIGITAL</span><h2>Sua loja na palma da mão!</h2><p>Um convite elegante para transformar encontros em novas oportunidades. O QR Code ao lado é real e codifica o endereço abaixo.</p><a href={url} className="growth-url" target="_blank" rel="noopener noreferrer">{url} <ArrowUpRight size={15} /></a><p className="fine-print">{settings.publicUrl ? 'Endereço configurado pela representante. Verifique se a publicação está acessível em outro dispositivo.' : 'Usando o endereço atual, que pode ser uma prévia restrita do editor. Antes de imprimir, configure a URL pública em Painel → Placa & proposta e teste fora do editor.'}</p><div className="growth-actions"><button className="button button-outline" onClick={download}><Download size={16} /> Baixar QR Code SVG</button></div><h3>E a aproximação por NFC?</h3><p>Adquira uma etiqueta NFC compatível e use um aplicativo de gravação no celular para salvar esse mesmo endereço como registro de URL (NDEF). Fixe a etiqueta na placa e teste em um aparelho compatível e desbloqueado.</p><p className="fine-print">A tela não grava etiquetas nem substitui o chip físico. Fabricação, etiqueta NFC, impressão e serviços externos não estão incluídos automaticamente no investimento demonstrativo.</p></section></div>;
}
const features = ['Sua própria loja digital', 'Catálogo sempre disponível', 'Pedidos organizados pelo WhatsApp', 'Controle de preços e estoque', 'Divulgação profissional', 'Relacionamento com clientes', 'Programa de indicações', 'Placa inteligente com QR Code e NFC'];
export function SolutionPreview() {
  const { settings } = useStore();
  return <section className="container solution-preview"><div><span className="eyebrow">TECNOLOGIA A FAVOR DO SEU NEGÓCIO</span><h2>Sua loja. Seu negócio.<br />Suas oportunidades.</h2><p>Uma experiência que vai além da vitrine. Conheça todas as possibilidades.</p></div><div><strong>{money(settings.commercialPrice)}</strong><small>PAGAMENTO ÚNICO · SEM MENSALIDADE*</small><Link className="button" to="/solucao">Conhecer a solução <ArrowUpRight size={18} /></Link><p className="fine-print">*Proposta demonstrativa. Consulte escopo e custos externos.</p></div></section>;
}
export function SolutionPage({ onContact }) {
  const { settings } = useStore();
  return <main id="conteudo" className="container growth-page"><div className="growth-title"><span className="eyebrow">MINHA LOJA INTELIGENTE</span><h1>Sua loja. Seu negócio.<br /><em>Suas oportunidades.</em></h1><p>Chegou a hora de profissionalizar suas vendas e ampliar suas oportunidades!</p></div><div className="growth-two"><section className="growth-card"><Sparkles size={30} /><h2>Mais autonomia. Mais presença.</h2><ul className="growth-features">{features.map(f => <li key={f}><Check size={18} />{f}</li>)}</ul><Link to="/painel" className="text-link">Experimentar a operação <ArrowUpRight size={16} /></Link></section><section className="growth-offer"><span className="eyebrow">INVESTIMENTO DEMONSTRATIVO</span><strong>{money(settings.commercialPrice)}</strong><h2>PAGAMENTO ÚNICO</h2><span>SEM MENSALIDADE.*</span><button className="button button-outline" onClick={onContact}>Quero conhecer melhor <MessageCircle size={18} /></button><p>*Proposta comercial ilustrativa, editável no painel. Não há contratação nem cobrança nesta página. Hospedagem, domínio, banco de dados, autenticação, armazenamento, materiais físicos e serviços externos dependem de escopo e podem ter custos próprios; não são prometidos como gratuitos.</p></section></div><SmartPlaque /><div className="growth-card"><h2>Transparência faz parte da experiência.</h2><p>Esta versão é uma demonstração funcional com dados fictícios salvos apenas neste navegador. Acesso administrativo não tem autenticação real. Para uso com clientes reais e diferentes representantes, é necessária integração e validação de banco protegido, autenticação, permissões e isolamento por loja. WhatsApp abre uma mensagem; não comprova envio, venda ou pagamento.</p></div></main>;
}
