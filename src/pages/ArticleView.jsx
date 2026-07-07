import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';

function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Quiz states
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Speech states
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
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

  if (loading) return <div style={{textAlign: 'center', padding: '3rem'}}>Loading...</div>;
  if (!article) return <div style={{textAlign: 'center', padding: '3rem'}}>Article not found.</div>;

  const levelData = article.levels[currentLevel];

  // Audio Functions
  const handleStartAudio = () => {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(levelData.text);
    utterance.lang = "en-US";
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

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <Link to="/" style={{ color: 'var(--pur)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '1.5rem' }}>← Back to News</Link>
      
      <div className="article-meta">
        <span>{new Date(article.date || article.publishDate).toLocaleDateString()}</span>
        {article.tags && article.tags.map(tag => (
          <span key={tag} className="tag-badge">{tag}</span>
        ))}
      </div>
      
      <h1 className="article-title">{article.title}</h1>

      {article.imageUrl && (
        <div className="news-visual">
          <img src={article.imageUrl} alt={article.title} className="news-visual-img" />
        </div>
      )}

      <div className="level-controls">
        {[1, 2, 3].map(level => (
          <button 
            key={level} 
            className={`btn ${currentLevel === level ? 'btn-active' : 'btn-outline'}`}
            onClick={() => setCurrentLevel(level)}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div className="audio-controls">
        <button className="btn" onClick={handleStartAudio}>{isPlaying ? 'Restart Audio' : 'Play Audio'}</button>
        <button className="btn btn-outline" onClick={handlePauseResume} disabled={!isPlaying}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="article-text serif-text">
        {levelData?.text?.split('\n').map((paragraph, i) => (
          <p key={i} style={{marginBottom: '1rem'}}>{paragraph}</p>
        ))}
      </div>

      {levelData?.vocabulary && levelData.vocabulary.length > 0 && (
        <div className="vocab-section">
          <h3 className="vocab-title">Key Vocabulary</h3>
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
          <h3 className="serif-title" style={{fontSize: '1.8rem', marginBottom: '1.5rem'}}>Check your understanding</h3>
          
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
              Submit Answers
            </button>
          ) : (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: score === levelData.questions.length ? '#dcfce7' : '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: score === levelData.questions.length ? '#166534' : 'inherit' }}>
                {score === levelData.questions.length ? '🎉 Congratulations!' : 'Good effort!'}
              </h4>
              <p>You got {score} out of {levelData.questions.length} questions correct.</p>
              <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={() => {setShowResults(false); setAnswers({});}}>Try Again</button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default ArticleView;
