import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import WhatsAppCapture from '../WhatsAppCapture';
import { useLanguage } from '../LanguageContext';

function ArticleView() {
  const { id } = useParams();
  const location = useLocation();
  const initialArticle = location.state?.article;
  const { language } = useLanguage();
  
  const [article, setArticle] = useState(initialArticle || null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(!initialArticle);
  
  // Quiz states
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Speech states
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Collect images
  const images = [];
  if (article) {
    if (article.imageUrls && article.imageUrls.length > 0) {
      article.imageUrls.forEach(url => {
        if (!images.includes(url)) images.push(url);
      });
    } else if (article.imageUrl) {
      images.push(article.imageUrl);
    }
  }

  const nextImg = () => setCurrentImgIndex(prev => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIndex(prev => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    async function fetchArticle() {
      if (!initialArticle) {
        setLoading(true);
      }
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else if (!initialArticle) {
          setArticle(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
    
    return () => {
      if (synth) synth.cancel();
    };
  }, [id]);

  // Reset quiz and audio when level changes
  useEffect(() => {
    setAnswers({});
    setShowResults(false);
    if (synth) synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [currentLevel]);

  // Translations
  const t = {
    loading: language === 'es' ? "Cargando..." : "Loading...",
    notFound: language === 'es' ? "Artículo no encontrado." : "Article not found.",
    back: language === 'es' ? "← Volver a Noticias" : "← Back to News",
    source: language === 'es' ? "Fuente" : "Source",
    level: language === 'es' ? "Nivel" : "Level",
    playAudio: language === 'es' ? "Reproducir Audio" : "Play Audio",
    restartAudio: language === 'es' ? "Reiniciar Audio" : "Restart Audio",
    pause: language === 'es' ? "Pausar" : "Pause",
    resume: language === 'es' ? "Reanudar" : "Resume",
    vocabTitle: language === 'es' ? "Vocabulario Clave" : "Key Vocabulary",
    checkUnderstanding: language === 'es' ? "Comprueba tu comprensión" : "Check your understanding",
    submitAnswers: language === 'es' ? "Enviar Respuestas" : "Submit Answers",
    congrats: language === 'es' ? "🎉 ¡Felicidades!" : "🎉 Congratulations!",
    goodEffort: language === 'es' ? "¡Buen esfuerzo!" : "Good effort!",
    scoreText: (score, total) => language === 'es' 
      ? `Acertaste ${score} de ${total} preguntas.` 
      : `You got ${score} out of ${total} questions correct.`,
    promoText: language === 'es'
      ? "¡Excelente trabajo! ¿Quieres aprender más rápido? Reserva una sesión 1 a 1 con nuestros profesores."
      : "Great job! Quer aprender mais rápido? Marque uma sessão 1 a 1 com os nossos professores.",
    bookSession: language === 'es' ? "Reservar Sesión" : "Book Session",
    tryAgain: language === 'es' ? "Intentar de nuevo" : "Try Again",
    dateLocale: language === 'es' ? 'es-ES' : 'en-US'
  };

  if (loading) return <div style={{textAlign: 'center', padding: '3rem'}}>{t.loading}</div>;
  if (!article) return <div style={{textAlign: 'center', padding: '3rem'}}>{t.notFound}</div>;

  const levelData = article.levels[currentLevel];

  // Audio Functions
  const handleStartAudio = () => {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(levelData.text);
    utterance.lang = language === 'es' ? "es-ES" : "en-US";
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    } else if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    handleStartAudio();
  };

  // Quiz Functions
  const handleOptionSelect = (qIndex, optIndex) => {
    if (showResults) return; // Prevent changing after submit
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  let score = 0;
  if (showResults && levelData.questions) {
    levelData.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });
  }

  // Quiz styling for dark mode
  const correctBg = language === 'es' ? '#166534' : '#dcfce7';
  const correctBorder = language === 'es' ? '#22c55e' : 'transparent';
  const correctText = language === 'es' ? '#dcfce7' : '#166534';
  
  const neutralBg = language === 'es' ? '#351526' : '#f3f4f6';
  const neutralText = language === 'es' ? '#FFF9F2' : 'inherit';

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <Helmet>
        <title>{article.title} | {language === 'es' ? "El Tiempo de Fluencia" : "The Fluency News"}</title>
        <meta name="description" content={levelData?.text?.substring(0, 160) + '...'} />
        {images.length > 0 && <meta property="og:image" content={images[0]} />}
      </Helmet>

      <Link to="/" style={{ color: 'var(--pur)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '1.5rem' }}>{t.back}</Link>
      
      <div className="article-meta">
        <span>{new Date(article.date || article.publishDate).toLocaleDateString(t.dateLocale)}</span>
        {article.source && (
          <span>
            • {t.source}: {article.sourceLink ? <a href={article.sourceLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pur)', textDecoration: 'none' }}>{article.source}</a> : article.source}
          </span>
        )}
        {article.tags && article.tags.map(tag => (
          <span key={tag} className="tag-badge">{tag}</span>
        ))}
      </div>
      
      <h1 className="article-title">{article.title}</h1>

      {images.length > 0 && (
        <div className="news-visual">
          {images.length > 1 && (
            <button className="carousel-btn left" onClick={prevImg}>&#10094;</button>
          )}
          <img src={images[currentImgIndex]} alt={article.title} className="news-visual-img" />
          {images.length > 1 && (
            <button className="carousel-btn right" onClick={nextImg}>&#10095;</button>
          )}
        </div>
      )}

      <div className="level-controls">
        {[1, 2, 3].map(level => (
          <button 
            key={level} 
            className={`btn ${currentLevel === level ? 'btn-active' : 'btn-outline'}`}
            onClick={() => setCurrentLevel(level)}
          >
            {t.level} {level}
          </button>
        ))}
      </div>

      <div className="audio-controls">
        <button className="btn" onClick={handleStartAudio}>{isPlaying ? t.restartAudio : t.playAudio}</button>
        <button className="btn btn-outline" onClick={handlePauseResume} disabled={!isPlaying}>
          {isPaused ? t.resume : t.pause}
        </button>
      </div>

      <div className="article-text serif-text" style={{ whiteSpace: 'pre-wrap', paddingBottom: '1rem' }}>
        {levelData?.text}
      </div>

      {levelData?.vocabulary && levelData.vocabulary.length > 0 && (
        <div className="vocab-section">
          <h3 className="vocab-title">{t.vocabTitle}</h3>
          <ul className="vocab-list">
            {levelData.vocabulary.map((v, i) => (
              <li key={i} className="vocab-item">
                <span className="vocab-term">{v.term}</span>: <span className="serif-text">{v.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {levelData?.questions && levelData.questions.length > 0 && (
        <div className="quiz-section">
          <h3 className="serif-title" style={{fontSize: '1.8rem', marginBottom: '1.5rem'}}>{t.checkUnderstanding}</h3>
          
          {levelData.questions.map((q, qIndex) => (
            <div key={qIndex} className="quiz-question">
              <p>{qIndex + 1}. {q.question}</p>
              <div className="quiz-options">
                {q.options.map((opt, optIndex) => {
                  let className = 'quiz-option';
                  if (answers[qIndex] === optIndex) className += ' selected';
                  
                  if (showResults) {
                    if (optIndex === q.correctIndex) {
                      className += ' correct';
                    } else if (answers[qIndex] === optIndex) {
                      className += ' incorrect';
                    }
                  }
                  
                  return (
                    <div 
                      key={optIndex} 
                      className={className}
                      onClick={() => handleOptionSelect(qIndex, optIndex)}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!showResults ? (
            <button 
              className="btn" 
              style={{marginTop: '1rem', width: '100%'}}
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length < levelData.questions.length}
            >
              {t.submitAnswers}
            </button>
          ) : (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: score === levelData.questions.length ? correctBg : neutralBg,
              color: score === levelData.questions.length ? correctText : neutralText,
              border: score === levelData.questions.length ? `1px solid ${correctBorder}` : 'none',
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {score === levelData.questions.length ? t.congrats : t.goodEffort}
              </h4>
              <p>{t.scoreText(score, levelData.questions.length)}</p>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--pur-light)' }}>{t.promoText}</h4>
                <a href="https://www.yvenglish.com" target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>{t.bookSession}</a>
              </div>
              
              <button className="btn btn-outline" style={{marginTop: '1.5rem', display: 'block', width: '100%'}} onClick={() => {setShowResults(false); setAnswers({});}}>{t.tryAgain}</button>
            </div>
          )}
        </div>
      )}

      <WhatsAppCapture />
    </div>
  );
}

export default ArticleView;
