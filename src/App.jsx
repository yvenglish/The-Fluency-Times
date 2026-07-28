import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ArticleView from './pages/ArticleView';

function TopBanner() {
  const wpMessage = encodeURIComponent("Olá! Vim do The Fluency e ganhei 15% de desconto nas primeiras duas mensalidades.");
  const wpLink = `https://wa.me/5521965126480?text=${wpMessage}`;
  return (
    <div style={{ background: 'var(--pur-dark)', color: 'white', padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
      Unlock your fluency! Get 15% off your first two months of Premium Classes. <a href={wpLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 'bold', marginLeft: '10px' }}>Claim Offer</a>
    </div>
  );
}

function FloatingCTA() {
  return (
    <a href="https://www.yvenglish.com" target="_blank" rel="noopener noreferrer" className="floating-cta">
      Start Learning 🚀
    </a>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>YV English · Fluency</span>
          <span>Daily Edition</span>
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="brand-title">The Fluency Times</h1>
        </Link>
        <div className="brand-subtitle">Elevate your English, one story at a time.</div>
        
        <nav className="nav-links">
          <Link to="/">Latest News</Link>
          <Link to="/?tag=politics">Politics</Link>
          <Link to="/?tag=economy">Economy</Link>
          <Link to="/?tag=technology">Technology</Link>
          <Link to={`/?tag=${encodeURIComponent('Pop & Art')}`}>Pop & Art</Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
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

  return (
    <Router>
      {showSplash && (
        <div className={`splash-screen ${fadeSplash ? 'fade-out' : ''}`}>
          <img src="/logocircular_transparente.png" alt="YV English" className="splash-logo" />
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
          src="/logocircular_transparente.png" 
          alt="YV Logo Stamp" 
          style={{ width: '120px', height: '120px', objectFit: 'contain', opacity: 1 }} 
        />
        <p className="brand-subtitle" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} YV English. All rights reserved.</p>
      </footer>
      <FloatingCTA />
    </Router>
  );
}

export default App;
