import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StoreProvider, useStore } from './store/StoreContext';
import { Footer, Header } from './components/UI';
import DemoSettings, { Contact } from './components/DemoSettings';
import Access from './pages/Access';
import Store from './pages/Store';
import Bag from './pages/Bag';
import Admin from './pages/Admin';
import { ReferralBanner, ReferralPage, SolutionPage, SolutionPreview } from './components/Growth';

// Preserve readable contrast even when the representative chooses a light brand color.
function brandTheme(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color || '')) return undefined;
  let rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
  const luminance = values => values.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  while (luminance(rgb) > .165) rgb = rgb.map(v => Math.floor(v * .93));
  return { '--primary': `rgb(${rgb.join(' ')})`, '--primary-foreground': 'oklch(0.985 0.005 85)' };
}

function Experience() {
  const { pathname } = useLocation();
  const { settings } = useStore();
  const isAdmin = pathname === '/painel' || pathname.startsWith('/painel/');
  const [overlay, setOverlay] = useState(null);
  const close = useCallback(() => setOverlay(null), []);
  const configure = useCallback(() => setOverlay('settings'), []);
  const contact = useCallback(() => setOverlay('contact'), []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setOverlay(null);
  }, [pathname]);
  useEffect(() => {
    document.title = isAdmin ? 'Painel demonstrativo · Minha Loja Inteligente' : pathname === '/' ? 'Minha Loja Inteligente — Sua experiência começa aqui' : `${pathname === '/sacola' ? 'Minha sacola' : settings.name} · Minha Loja Inteligente`;
  }, [pathname, settings.name, isAdmin]);
  return <div className={isAdmin ? 'admin-experience' : 'public-experience'} style={!isAdmin && pathname !== '/' ? brandTheme(settings.color) : undefined}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    {!isAdmin && <Header store={pathname !== '/'} onConfigure={configure} onContact={contact} />}
    <Routes>
      <Route path="/" element={<><Access onContact={contact} /><SolutionPreview /></>} />
      <Route path="/loja" element={<><Store onContact={contact} /><ReferralBanner /></>} />
      <Route path="/indique" element={<ReferralPage />} />
      <Route path="/solucao" element={<SolutionPage onContact={contact} />} />
      <Route path="/sacola" element={<Bag onConfigure={configure} />} />
      <Route path="/painel/*" element={<Admin />} />
      <Route path="*" element={<main id="conteudo" className="container empty-state not-found"><span className="eyebrow">ESTE CAMINHO AINDA NÃO EXISTE</span><h1>Vamos voltar<br />a um bom começo?</h1><p>A página procurada não foi encontrada.</p><Link to="/" className="button"><ArrowLeft size={17} /> Ir à central de acesso</Link></main>} />
    </Routes>
    {!isAdmin && <Footer onConfigure={configure} onContact={contact} />}
    {overlay === 'settings' && <DemoSettings onClose={close} />}
    {overlay === 'contact' && <Contact onClose={close} onConfigure={configure} />}
  </div>;
}
export default function App() {
  return <BrowserRouter><StoreProvider><Experience /></StoreProvider></BrowserRouter>;
}
