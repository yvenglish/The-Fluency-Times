import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import WhatsAppCapture from '../WhatsAppCapture';
import { useLanguage } from '../LanguageContext';

function Home() {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagFilter = searchParams.get('tag');

  useEffect(() => {
    async function fetchArticles() {
      try {
        const q = query(collection(db, 'articles'), orderBy('publishDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAllArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []); // Only fetch once on mount

  // Filter synchronously by language and date
  const now = new Date().toISOString();
  let displayedArticles = allArticles.filter(a => !a.publishDate || a.publishDate <= now);
  
  // Filter by language (if language is undefined/missing in article, assume it's English 'en' for backward compatibility)
  displayedArticles = displayedArticles.filter(a => {
    const articleLang = a.language || 'en';
    return articleLang === language;
  });

  if (tagFilter) {
    displayedArticles = displayedArticles.filter(a => a.tags && a.tags.map(t=>t.toLowerCase()).includes(tagFilter.toLowerCase()));
  }

  const tLoading = language === 'es' ? "Cargando..." : "Loading...";
  const tShowing = language === 'es' ? "Mostrando noticias de:" : "Showing news for:";
  const tNoArticles = language === 'es' ? "No se encontraron artículos." : "No articles found.";
  const titleText = language === 'es' ? "El Tiempo de Fluencia" : "The Fluency News";
  const dateLocale = language === 'es' ? 'es-ES' : 'en-US';

  const displayTag = () => {
    if (!tagFilter) return '';
    if (language !== 'es') return tagFilter;
    const map = {
      'politics': 'Política',
      'economy': 'Economía',
      'technology': 'Tecnología',
      'pop & art': 'Pop & Arte'
    };
    return map[tagFilter.toLowerCase()] || tagFilter;
  };

  if (loading) return <div style={{textAlign: 'center', padding: '3rem'}}>{tLoading}</div>;

  return (
    <div>
      <Helmet>
        <title>{titleText}</title>
      </Helmet>
      {tagFilter && <h2 className="serif-title" style={{marginBottom: '2rem'}}>{tShowing} <span style={{color: 'var(--pur)'}}>{displayTag()}</span></h2>}
      
      {displayedArticles.length === 0 ? (
        <p>{tNoArticles}</p>
      ) : (
        <div className="article-grid">
          {displayedArticles.map(article => (
            <Link to={`/article/${article.id}`} state={{ article }} key={article.id} style={{textDecoration: 'none'}}>
              <div className="news-card">
                {((article.imageUrls && article.imageUrls.length > 0) ? article.imageUrls[0] : article.imageUrl) && (
                  <div className="news-visual">
                    <img src={(article.imageUrls && article.imageUrls.length > 0) ? article.imageUrls[0] : article.imageUrl} alt={article.title} className="news-visual-img" />
                  </div>
                )}
                <div className="article-meta">
                  <span>{new Date(article.date || article.publishDate).toLocaleDateString(dateLocale)}</span>
                  {article.tags && article.tags.map(tag => (
                    <span key={tag} className="tag-badge">{tag}</span>
                  ))}
                </div>
                <h3 className="news-card-title">{article.title}</h3>
                <p style={{color: 'var(--text-muted)'}}>
                  {article.levels?.[1]?.text?.substring(0, 100)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <WhatsAppCapture />
    </div>
  );
}

export default Home;
