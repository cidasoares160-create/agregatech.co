import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StoreProvider, useStore } from './store/StoreContext';
import { Footer, Header } from './components/UI';
import DemoSettings, { Contact } from './components/DemoSettings';
import Access from './pages/Access';
import Store from './pages/Store';
import Bag from './pages/Bag';

function Experience() {
  const { pathname } = useLocation();
  const { settings } = useStore();
  const [overlay, setOverlay] = useState(null);
  const close = useCallback(() => setOverlay(null), []);
  const configure = useCallback(() => setOverlay('settings'), []);
  const contact = useCallback(() => setOverlay('contact'), []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setOverlay(null);
  }, [pathname]);
  useEffect(() => {
    document.title = pathname === '/' ? 'Minha Loja Inteligente — Sua experiência começa aqui' : `${pathname === '/sacola' ? 'Minha sacola' : settings.name} · Minha Loja Inteligente`;
  }, [pathname, settings.name]);
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <Header store={pathname !== '/'} onConfigure={configure} onContact={contact} />
    <Routes>
      <Route path="/" element={<Access onContact={contact} />} />
      <Route path="/loja" element={<Store onContact={contact} />} />
      <Route path="/sacola" element={<Bag onConfigure={configure} />} />
      <Route path="*" element={<main id="conteudo" className="container empty-state not-found"><span className="eyebrow">ESTE CAMINHO AINDA NÃO EXISTE</span><h1>Vamos voltar<br />a um bom começo?</h1><p>A página procurada não foi encontrada.</p><Link to="/" className="button"><ArrowLeft size={17} /> Ir à central de acesso</Link></main>} />
    </Routes>
    <Footer onConfigure={configure} onContact={contact} />
    {overlay === 'settings' && <DemoSettings onClose={close} />}
    {overlay === 'contact' && <Contact onClose={close} onConfigure={configure} />}
  </>;
}
export default function App() {
  return <BrowserRouter><StoreProvider><Experience /></StoreProvider></BrowserRouter>;
}
