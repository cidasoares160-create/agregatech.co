import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Diamond, MessageCircle, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { GOOGLE_REVIEW_URL } from '../data/demo';
import { GoogleIcon } from '../components/UI';

export default function Access({ onContact }) {
  return <main id="conteudo">
    <section className="access-hero container">
      <div className="hero-copy enter"><span className="section-kicker"><span className="live-dot" /> CONEXÕES QUE GERAM POSSIBILIDADES</span>
        <h1>Sua experiência<br />digital começa <em>aqui.</em></h1>
        <p>Conheça nossa solução, descubra novas possibilidades<br className="hide-small" /> e tenha tudo ao seu alcance.</p>
        <div className="hero-buttons"><Link to="/loja" className="button">Explore a loja digital <ArrowUpRight size={18} /></Link><a href="#seu-proximo-passo" className="quiet-link">Descubra mais <ArrowDown size={16} /></a></div>
        <div className="hero-signature"><span className="signature-icon"><Diamond size={21} strokeWidth={1.4} /></span><div><strong>Seu negócio merece ir além.</strong><span>Mais presença. Mais conexão. Novas oportunidades.</span></div></div>
      </div>
      <div className="hero-visual enter delay-one"><div className="visual-orbit" /><div className="editorial-frame"><img src="/images/jewelry-editorial.jpg" alt="Joias douradas sobre pedra clara e seda, em uma composição elegante" fetchPriority="high" /><div className="image-caption"><span>UMA NOVA FORMA DE ENCANTAR</span><strong>O próximo capítulo<br />da sua marca.</strong></div></div>
        <div className="floating-note note-top"><span className="round-icon"><ShoppingBag size={19} /></span><div><strong>Sua vitrine, sempre aberta</strong><span>Conecte-se a novas possibilidades</span></div><span className="tiny-check"><Check size={12} /></span></div>
        <div className="floating-note note-bottom"><span className="mini-spark"><Sparkles size={21} strokeWidth={1.5} /></span><div><span>FEITO PARA O SEU NEGÓCIO</span><strong>Digital. Simples. Seu.</strong></div></div><span className="vertical-caption">TECNOLOGIA COM PROPÓSITO</span>
      </div>
    </section>
    <section id="seu-proximo-passo" className="access-options container"><div className="section-heading"><div><span className="eyebrow">ESCOLHA SEU PRÓXIMO PASSO</span><h2>Boas conexões começam aqui.</h2></div><p>Um lugar. Novas possibilidades.</p></div>
      <div className="access-grid">
        <article className="access-card enter"><div className="card-top"><span className="access-icon google-icon"><GoogleIcon /></span><span className="card-number">01</span></div><span className="eyebrow">SUA OPINIÃO IMPORTA</span><h3>Avalie nosso<br />atendimento.</h3><p>Sua opinião é muito importante para nós! Avalie nossa experiência e ajude outras pessoas a conhecerem nosso trabalho.</p><a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="card-action">AVALIAR NO GOOGLE <ArrowUpRight size={18} /></a><span className="card-footnote"><Star size={12} /> Sua avaliação faz a diferença</span></article>
        <article className="access-card enter delay-one"><div className="card-top"><span className="access-icon"><MessageCircle size={27} strokeWidth={1.5} /></span><span className="card-number">02</span></div><span className="eyebrow">ESTAMOS POR PERTO</span><h3>Vamos<br />conversar?</h3><p>Precisa de ajuda ou deseja conhecer melhor nossa solução? Estamos disponíveis para conversar com você.</p><button className="card-action" onClick={onContact}>FALE CONOSCO <ArrowUpRight size={18} /></button><span className="card-footnote"><MessageCircle size={12} /> Atendimento com cuidado, de verdade</span></article>
        <article className="access-card access-card-featured enter delay-two"><div className="card-top"><span className="access-icon"><ShoppingBag size={27} strokeWidth={1.5} /></span><span className="featured-chip">VIVA ESSA EXPERIÊNCIA</span></div><span className="eyebrow">SUA NOVA FORMA DE COMPRAR</span><h3>Conheça nossa<br />loja digital.</h3><p>Descubra uma nova forma de comprar, escolher produtos, acompanhar promoções e fazer seus pedidos.</p><Link to="/loja" className="card-action">ACESSAR LOJA DIGITAL <ArrowUpRight size={18} /></Link><span className="card-footnote"><Sparkles size={12} /> Uma loja demonstrativa feita para inspirar</span></article>
      </div>
    </section>
    <section className="possibilities container"><div className="possibilities-symbol"><Sparkles size={30} strokeWidth={1.2} /></div><div><span className="eyebrow">MENOS BARREIRAS. MAIS POSSIBILIDADES.</span><h2>O cuidado de sempre.<br />Uma experiência inteiramente nova.</h2></div><Link to="/loja" className="text-link">Encontre seu próximo favorito <ArrowRight size={18} /></Link></section>
  </main>;
}
