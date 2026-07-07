import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useLocation } from 'react-router-dom';

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        
        // Filter out future publish dates and match tags
        const now = new Date().toISOString();
        let filtered = data.filter(a => !a.publishDate || a.publishDate <= now);
        
        if (tagFilter) {
          filtered = filtered.filter(a => a.tags && a.tags.map(t=>t.toLowerCase()).includes(tagFilter.toLowerCase()));
        }
        
        setArticles(filtered);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [tagFilter]);

  if (loading) return <div style={{textAlign: 'center', padding: '3rem'}}>Loading...</div>;

  return (
    <div>
      {tagFilter && <h2 className="serif-title" style={{marginBottom: '2rem'}}>Showing news for: <span style={{color: 'var(--pur)'}}>{tagFilter}</span></h2>}
      
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <div className="article-grid">
          {articles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id} style={{textDecoration: 'none'}}>
              <div className="news-card">
                {((article.imageUrls && article.imageUrls.length > 0) ? article.imageUrls[0] : article.imageUrl) && (
                  <div className="news-visual">
                    <img src={(article.imageUrls && article.imageUrls.length > 0) ? article.imageUrls[0] : article.imageUrl} alt={article.title} className="news-visual-img" />
                  </div>
                )}
                <div className="article-meta">
                  <span>{new Date(article.date || article.publishDate).toLocaleDateString()}</span>
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
    </div>
  );
}

export default Home;
