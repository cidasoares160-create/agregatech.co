import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowUpRight, Sparkles } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { money } from '../../data/demo';
import { availableReward, shopUrl } from '../../store/growth';
import { Empty, Field, PageHeading } from '../../components/AdminUI';
import { ShareText, SmartPlaque } from '../../components/Growth';

export function buildAlerts({ orders, rawProducts, customers, referrals, promotions, clock }) {
  const alerts = [];
  orders.filter(o => o.status === 'novo').forEach(o => alerts.push({ id: `order:${o.id}`, title: 'Novo pedido recebido', text: `${o.customer.name} · ${money(o.total)}. Recebimento marcado manualmente no painel.`, to: `/painel/pedidos?pedido=${o.id}`, at: o.updatedAt || o.createdAt }));
  rawProducts.filter(p => p.active && p.stock <= 3).forEach(p => alerts.push({ id: `stock:${p.id}:${p.stock}:${p.updatedAt || ''}`, title: p.stock ? 'Produto com estoque baixo' : 'Produto sem estoque', text: `${p.name} · ${p.stock} unidade(s). Revise a disponibilidade.`, to: '/painel/produtos', at: p.updatedAt }));
  rawProducts.filter(p => p.active && (!p.updatedAt || clock - new Date(p.updatedAt).getTime() >= 30 * 86400000)).forEach(p => alerts.push({ id: `stale:${p.id}:${p.updatedAt || 'initial'}`, title: 'Revisar cadastro e estoque', text: `${p.name} · ${p.updatedAt ? 'Sem edição há 30 dias ou mais.' : 'Sem revisão manual registrada.'} Verifique o estoque físico; a última edição não comprova contagem.`, to: '/painel/produtos', at: p.updatedAt }));
  customers.filter(c => clock - new Date(c.createdAt).getTime() <= 30 * 86400000).forEach(c => alerts.push({ id: `customer:${c.id}`, title: 'Cliente cadastrada', text: `${c.name} entrou na base demonstrativa. Que tal uma mensagem de boas-vindas?`, to: '/painel/clientes', at: c.createdAt }));
  referrals.filter(r => r.status === 'convertida').forEach(r => alerts.push({ id: `referral:${r.id}`, title: 'Indicação convertida', text: 'Primeira compra elegível concluída. Consulte o lote e o benefício no programa.', to: '/painel/indicacoes', at: r.convertedAt }));
  promotions.filter(p => p.active && new Date(p.startsAt).getTime() <= clock && new Date(p.endsAt).getTime() > clock && new Date(p.endsAt).getTime() - clock <= 3 * 86400000).forEach(p => alerts.push({ id: `promo:${p.id}:${p.endsAt}`, title: 'Promoção próxima do encerramento', text: `${p.name} termina em ${new Date(p.endsAt).toLocaleString('pt-BR')}.`, to: '/painel/promocoes', at: p.endsAt }));
  return alerts.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
}
export function Notifications() {
  const store = useStore();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const alerts = buildAlerts(store);
  const unread = alerts.filter(a => !store.readAlerts.includes(a.id));
  const visible = unreadOnly ? unread : alerts;
  return <div className="growth-admin-stack"><PageHeading eyebrow="PRÓXIMOS PASSOS, NO MOMENTO CERTO" title="Sua central de atenção." description="Alertas calculados com os registros locais. Sem envio automático de mensagens ou notificações push."><button className="button button-outline" disabled={!unread.length} onClick={() => store.runAction('readAlerts', unread.map(a => a.id))}>Marcar {unread.length} como lidos</button></PageHeading><div className="admin-status-tabs"><button className={!unreadOnly ? 'active' : ''} onClick={() => setUnreadOnly(false)}>Todos · {alerts.length}</button><button className={unreadOnly ? 'active' : ''} onClick={() => setUnreadOnly(true)}>Não lidos · {unread.length}</button><Link className="text-link" to="/painel/divulgacao">Preparar uma mensagem comercial <ArrowUpRight size={15} /></Link></div><div className="growth-ledger">{visible.map(a => <section key={a.id} className={`growth-alert ${store.readAlerts.includes(a.id) ? 'is-read' : ''}`}><Bell size={20} /><div><h2>{a.title}</h2><p>{a.text}</p><Link to={a.to} className="text-link">Resolver no painel <ArrowUpRight size={15} /></Link></div><button className="button button-small button-outline" disabled={store.readAlerts.includes(a.id)} onClick={() => store.runAction('readAlerts', [a.id])}>{store.readAlerts.includes(a.id) ? 'Lido' : 'Marcar lido'}</button></section>)}</div>{!visible.length && <Empty>Tudo em dia neste filtro. Novos movimentos aparecem automaticamente nesta central.</Empty>}<p className="fine-print">Um alerta lido não altera o pedido nem resolve o estoque. Alertas de condições resolvidas deixam de aparecer; novas condições geram novos avisos.</p></div>;
}
const channels = ['Instagram', 'Stories', 'Facebook', 'WhatsApp', 'Status', 'Lista de transmissão'];
const themes = ['Seleção especial', 'Lançamento', 'Oferta real', 'Boas-vindas', 'Volte a brilhar', 'Cliente frequente', 'Indique e ganhe', 'Benefício disponível'];
export function Marketing() {
  const store = useStore();
  const { products, customers, orders, referrals, rewards, settings, clock, runAction, marketingDrafts = {} } = store;
  const [channel, setChannel] = useState(channels[0]);
  const [theme, setTheme] = useState(themes[0]);
  const [productId, setProductId] = useState(products.find(p => p.active)?.id || '');
  const [customerId, setCustomerId] = useState('');
  const [segment, setSegment] = useState('all');
  const product = products.find(p => p.id === productId && p.active);
  const customer = customers.find(c => c.id === customerId);
  const profiles = customers.filter(c => {
    const sales = orders.filter(o => o.customerId === c.id && o.status === 'concluido');
    const last = Math.max(0, ...sales.map(o => new Date(o.completedAt || o.createdAt).getTime()));
    return segment === 'all' || (segment === 'new' && clock - new Date(c.createdAt).getTime() <= 30 * 86400000) || (segment === 'inactive' && clock - last >= 30 * 86400000) || (segment === 'frequent' && sales.length >= 2) || (segment === 'referrers' && referrals.some(r => r.referrerId === c.id)) || (segment === 'benefits' && rewards.some(r => r.customerId === c.id && availableReward(r, clock)));
  });
  const credit = rewards.filter(r => r.customerId === customerId && availableReward(r, clock)).reduce((s, r) => s + r.amount, 0);
  const url = shopUrl(settings);
  const greeting = customer ? `Olá, ${customer.name}!` : 'Olá!';
  const piece = product ? `${product.name} por ${money(product.price)}.` : 'Conheça nossa curadoria de joias e acessórios.';
  const offer = product && product.price < product.originalPrice ? `De ${money(product.originalPrice)} por ${money(product.price)}: ${product.name}. Consulte disponibilidade e condições vigentes na loja.` : 'Descubra a seleção e consulte os preços atualizados na loja. Sem desconto ativo para a peça selecionada.';
  const texts = {
    'Seleção especial': `Pequenos detalhes revelam grandes histórias. ${piece} Uma escolha para acompanhar seus momentos, com o cuidado da ${settings.name}.`,
    'Lançamento': product?.isNew ? `Uma novidade para a sua coleção: ${piece} Conheça de perto o design e escolha seu próximo favorito.` : `Um novo olhar para sua coleção. ${piece} Descubra detalhes que combinam com você.`,
    'Oferta real': offer,
    'Boas-vindas': `${greeting} Que bom ter você por aqui! Na ${settings.name}, escolher também pode ser uma conversa. Me conte seu estilo e eu ajudo a encontrar suas peças favoritas.`,
    'Volte a brilhar': `${greeting} Faz tempo que não conversamos! Preparei uma seleção especial na ${settings.name}. Quer que eu ajude a encontrar algo que combine com seu momento?`,
    'Cliente frequente': `${greeting} Obrigada por escolher a ${settings.name} mais uma vez! Seu carinho faz parte da nossa história. ${piece} Posso te mostrar os detalhes?`,
    'Indique e ganhe': `Boas descobertas merecem ser compartilhadas! Convide suas amigas para a ${settings.name}. ${customer ? `Seu código é ${customer.referralCode}.` : 'Solicite seu código à representante.'} Benefícios somente após primeira compra elegível concluída, conforme as regras em ${new URL('/indique', url).toString()}.`,
    'Benefício disponível': credit ? `${greeting} Você tem ${money(credit)} em créditos disponíveis no programa de indicações da ${settings.name}! Consulte a validade e combine a aplicação em seu próximo pedido elegível. Um benefício por pedido.` : `${greeting} Quer saber como conquistar benefícios na ${settings.name}? Conheça as regras do nosso programa de indicações.`,
  };
  const compact = ['Stories', 'Status'].includes(channel);
  const template = `${compact ? `${settings.name}\n${theme === 'Oferta real' ? offer : piece}\nEscolha seu favorito e fale comigo!` : texts[theme]}\n\n${url}${['Instagram', 'Facebook'].includes(channel) ? '\n\n#JoiasEAcessorios #SeuEstilo #DetalhesQueEncantam' : ''}\n\nConteúdo demonstrativo · disponibilidade e entrega a confirmar.`;
  const key = `${channel}:${theme}:${productId}:${customerId}`;
  const text = marketingDrafts[key] ?? template;
  return <div className="growth-admin-stack"><PageHeading eyebrow="SUA MARCA, COM VOZ PRÓPRIA" title="Estúdio de divulgação." description="Conteúdos prontos para inspirar, editar e compartilhar. Modelos editoriais, sem serviço de inteligência artificial." /><div className="growth-two"><section className="growth-card"><Sparkles size={26} /><h2>Escolha a próxima conversa.</h2><Field label="Onde divulgar"><select value={channel} onChange={e => setChannel(e.target.value)}>{channels.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Objetivo da mensagem"><select value={theme} onChange={e => setTheme(e.target.value)}>{themes.map(t => <option key={t}>{t}</option>)}</select></Field><Field label="Produto em destaque"><select value={productId} onChange={e => setProductId(e.target.value)}><option value="">Toda a coleção</option>{products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}{!p.stock ? ' · sem estoque' : ''}</option>)}</select></Field><Field label="Sugestões de relacionamento"><select value={segment} onChange={e => { setSegment(e.target.value); setCustomerId(''); }}>{[['all', 'Todas'], ['new', 'Novas · até 30 dias'], ['inactive', 'Sem compra há 30 dias ou nunca'], ['frequent', 'Frequentes · 2+ compras'], ['referrers', 'Fizeram indicações'], ['benefits', 'Têm benefícios disponíveis']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field><Field label={`Personalizar para uma cliente (${profiles.length} sugestões)`}><select value={customerId} onChange={e => setCustomerId(e.target.value)}><option value="">Mensagem sem nome</option>{profiles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><p className="fine-print">Stories e Status usam um texto curto para acompanhar sua imagem. Copie o conteúdo para Instagram/Facebook; o compartilhamento abaixo abre o WhatsApp para escolher um destinatário. Listas de transmissão são organizadas no próprio aplicativo, respeitando consentimento. Nada é enviado automaticamente.</p></section><section className="growth-card"><span className="eyebrow">{channel} · {theme}</span><h2>Uma mensagem com o seu toque.</h2><Field label="Texto editável · salvo neste navegador"><textarea className="growth-draft" maxLength={6000} value={text} onChange={e => runAction('marketing', { key, text: e.target.value })} /></Field><div className="growth-actions"><button className="text-link" onClick={() => runAction('marketing', { key, text: template })}>Restaurar modelo com preços atuais</button></div><ShareText text={text} /><p className="fine-print">Revise preços, estoque, consentimento e o endereço antes de enviar. Rascunhos personalizados mantêm seu texto mesmo se o catálogo mudar. Não utilize contatos reais nesta demonstração.</p></section></div></div>;
}
export function CommercialSettings() {
  const { settings, configure } = useStore();
  const [price, setPrice] = useState((settings.commercialPrice / 100).toFixed(2));
  const [url, setUrl] = useState(settings.publicUrl);
  const [error, setError] = useState('');
  function save(e) { e.preventDefault(); try { configure({ commercialPrice: Math.round(Number(price) * 100), publicUrl: url.trim() }); setError(''); } catch (err) { setError(err.message); } }
  return <div className="growth-admin-stack"><PageHeading title="Uma presença que vai além da tela." description="Sua placa de acesso e a apresentação comercial, com a identidade da loja."><Link className="button button-outline" to="/solucao">Ver apresentação <ArrowUpRight size={16} /></Link></PageHeading><form className="growth-card" onSubmit={save}><h2>Placa & proposta comercial</h2><div className="growth-rule-grid"><Field label="Investimento demonstrativo (R$)" type="number" step=".01" min="0" required value={price} onChange={e => setPrice(e.target.value)} /><Field label="URL pública completa da loja" type="url" placeholder="https://seu-dominio.com/loja" value={url} onChange={e => setUrl(e.target.value)} hint="HTTPS, terminada em /loja. Vazio: usa o endereço atual do navegador." /></div><p className="fine-print">O preço aparece na central de acesso e na apresentação da solução. A URL será usada no QR Code, nos convites e nos modelos de divulgação. Configurá-la não publica nem sincroniza dados: teste em outro aparelho antes de distribuir a placa. Não há garantia de disponibilidade do domínio informado.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button" type="submit">Salvar placa e proposta</button></form><SmartPlaque /></div>;
}
