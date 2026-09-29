import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ArticleView from './pages/ArticleView';
import { LanguageProvider, useLanguage } from './LanguageContext';

function TopBanner() {
  const { language } = useLanguage();
  const wpMessage = encodeURIComponent("Olá! Vim do The Fluency e ganhei 15% de desconto nas primeiras duas mensalidades.");
  const wpLink = `https://wa.me/5521965126480?text=${wpMessage}`;
  
  const text = language === 'es' ? "¡Desbloquea tu fluidez! Obtén 15% de descuento en tus dos primeros meses de Clases Premium." : "Unlock your fluency! Get 15% off your first two months of Premium Classes.";
  const linkText = language === 'es' ? "Aprovechar Oferta" : "Claim Offer";

  return (
    <div style={{ background: 'var(--pur-dark)', color: 'white', padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
      {text} <a href={wpLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 'bold', marginLeft: '10px' }}>{linkText}</a>
    </div>
  );
}

function FloatingCTA() {
  const { language } = useLanguage();
  const text = language === 'es' ? "Empieza a Aprender 🚀" : "Start Learning 🚀";
  
  return (
    <a href="https://www.yvenglish.com" target="_blank" rel="noopener noreferrer" className="floating-cta">
      {text}
    </a>
  );
}

function Header() {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const handleToggle = () => {
    toggleLanguage();
    navigate('/');
  };

  const dateLocale = language === 'es' ? 'es-ES' : 'en-US';
  const subtitle = language === 'es' ? "Mejora tu español, una historia a la vez." : "Elevate your English, one story at a time.";
  const edition = language === 'es' ? "Edición Diaria" : "Daily Edition";
  const title = language === 'es' ? "El Tiempo de Fluencia" : "The Fluency News";

  const nav = language === 'es' ? {
    latest: "Últimas Noticias",
    politics: "Política",
    economy: "Economía",
    tech: "Tecnología",
    pop: "Pop & Arte"
  } : {
    latest: "Latest News",
    politics: "Politics",
    economy: "Economy",
    tech: "Technology",
    pop: "Pop & Art"
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <span>{new Date().toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>YV English · Fluency</span>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>{edition}</span>
            <button 
              onClick={handleToggle} 
              style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
            >
              {language === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="brand-title">{title}</h1>
        </Link>
        <div className="brand-subtitle">{subtitle}</div>
        
        <nav className="nav-links">
          <Link to="/">{nav.latest}</Link>
          <Link to="/?tag=politics">{nav.politics}</Link>
          <Link to="/?tag=economy">{nav.economy}</Link>
          <Link to="/?tag=technology">{nav.tech}</Link>
          <Link to={`/?tag=${encodeURIComponent('Pop & Art')}`}>{nav.pop}</Link>
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  const { language } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
    }, 3200);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const splashLogoSrc = language === 'es' ? "/logobranca.png" : "/logocircular_transparente.png";
  const footerLogoSrc = language === 'es' ? "/logobranca.png" : "/logocircular_transparente.png";

  return (
    <Router>
      {showSplash && (
        <div className={`splash-screen ${fadeSplash ? 'fade-out' : ''} ${language === 'es' ? 'splash-es' : ''}`}>
          <img src={splashLogoSrc} alt="YV English" className="splash-logo" />
        </div>
      )}
      <TopBanner />
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleView />} />
          <Route path="/admin3147" element={<Admin />} />
        </Routes>
      </main>
      <footer className="header" style={{ marginTop: '4rem', paddingBottom: '2rem', borderBottom: 'none', borderTop: '2px solid var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <img 
          src={footerLogoSrc} 
          alt="YV Logo Stamp" 
          style={{ width: '120px', height: '120px', objectFit: 'contain', opacity: 1 }} 
        />
        <p className="brand-subtitle" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} YV English. Todos os direitos reservados.</p>
      </footer>
      <FloatingCTA />
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
