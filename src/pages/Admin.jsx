import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const emptyForm = {
  title: '',
  source: '',
  sourceLink: '',
  date: new Date().toISOString().split('T')[0],
  publishDate: new Date().toISOString().slice(0,16),
  imageUrls: [''],
  tags: '',
  levels: {
    1: { text: '', questions: [], vocabulary: [] },
    2: { text: '', questions: [], vocabulary: [] },
    3: { text: '', questions: [], vocabulary: [] }
  }
};

function Admin() {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [articles, setArticles] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [articleToDelete, setArticleToDelete] = useState(null);

  // Fetch articles for the list view
  const fetchArticles = async () => {
    setLoadingList(true);
    try {
      const q = query(collection(db, 'articles'), orderBy('publishDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchArticles();
    }
  }, [view]);

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      await deleteDoc(doc(db, 'articles', articleToDelete.id));
      setArticleToDelete(null);
      fetchArticles(); // Refresh list
    } catch (error) {
      console.error("Error deleting article", error);
      alert('Error deleting article: ' + error.message);
    }
  };

  const handleEditClick = (article) => {
    // Populate form data
    const populatedForm = {
      title: article.title || '',
      source: article.source || '',
      sourceLink: article.sourceLink || '',
      date: article.date || new Date().toISOString().split('T')[0],
      publishDate: article.publishDate ? (article.publishDate.length > 16 ? new Date(article.publishDate).toISOString().slice(0,16) : article.publishDate.slice(0,16)) : new Date().toISOString().slice(0,16),
      imageUrls: (article.imageUrls && article.imageUrls.length > 0) ? article.imageUrls : (article.imageUrl ? [article.imageUrl] : ['']),
      tags: (article.tags && article.tags.length > 0) ? article.tags[0] : '',
      levels: {
        1: { text: '', questions: [], vocabulary: [], ...article.levels?.[1] },
        2: { text: '', questions: [], vocabulary: [], ...article.levels?.[2] },
        3: { text: '', questions: [], vocabulary: [], ...article.levels?.[3] }
      }
    };
    setFormData(populatedForm);
    setEditingId(article.id);
    setView('form');
    setMessage('');
  };

  const handleAddNewClick = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setView('form');
    setMessage('');
  };

  const handleLevelTextChange = (level, text) => {
    setFormData(prev => ({
      ...prev,
      levels: { ...prev.levels, [level]: { ...prev.levels[level], text } }
    }));
  };

  const addQuestion = (level) => {
    setFormData(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: { ...prev.levels[level], questions: [...prev.levels[level].questions, { question: '', options: ['', '', ''], correctIndex: 0 }] }
      }
    }));
  };

  const updateQuestion = (level, qIndex, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.levels[level].questions];
      if (field === 'question') {
        newQuestions[qIndex].question = value;
      } else if (field === 'correctIndex') {
        newQuestions[qIndex].correctIndex = Number(value);
      } else if (field.startsWith('option_')) {
        const optIndex = Number(field.split('_')[1]);
        newQuestions[qIndex].options[optIndex] = value;
      }
      return { ...prev, levels: { ...prev.levels, [level]: { ...prev.levels[level], questions: newQuestions } } };
    });
  };

  const addVocabulary = (level) => {
    setFormData(prev => ({
      ...prev,
      levels: { ...prev.levels, [level]: { ...prev.levels[level], vocabulary: [...(prev.levels[level].vocabulary || []), { term: '', meaning: '' }] } }
    }));
  };

  const updateVocabulary = (level, vIndex, field, value) => {
    setFormData(prev => {
      const newVocab = [...(prev.levels[level].vocabulary || [])];
      newVocab[vIndex][field] = value;
      return { ...prev, levels: { ...prev.levels, [level]: { ...prev.levels[level], vocabulary: newVocab } } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t=>t),
        publishDate: new Date(formData.publishDate).toISOString(),
        imageUrls: formData.imageUrls.filter(url => url.trim() !== '')
      };

      if (editingId) {
        await updateDoc(doc(db, 'articles', editingId), payload);
        setMessage('Article successfully updated!');
      } else {
        await addDoc(collection(db, 'articles'), payload);
        setMessage('Article successfully added!');
        setFormData(emptyForm);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error saving article: ' + error.message);
    } finally {
      setSaving(false);
      window.scrollTo(0,0);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="article-title">Admin Dashboard</h2>
        {view === 'form' ? (
          <button className="btn btn-outline" onClick={() => setView('list')}>View Posted Articles</button>
        ) : (
          <button className="btn" onClick={handleAddNewClick}>+ Add New Article</button>
        )}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div>
          {loadingList ? <p>Loading articles...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {articles.map(article => (
                <div key={article.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--pur-dark)', fontSize: '1.25rem' }}>{article.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Published: {new Date(article.publishDate || article.date).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={() => handleEditClick(article)}>Edit</button>
                    <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setArticleToDelete(article)}>Delete</button>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p>No articles posted yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* Form View */}
      {view === 'form' && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
            {editingId ? 'Editing Article' : 'Drafting New Article'}
          </h3>
          {message && (
            <div style={{ padding: '1rem', background: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#991b1b' : '#166534', marginBottom: '1rem', borderRadius: '4px' }}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Source Name</label>
                <input className="form-control" placeholder="e.g. The New York Times" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Source Link (URL)</label>
                <input type="url" className="form-control" placeholder="https://..." value={formData.sourceLink} onChange={e => setFormData({...formData, sourceLink: e.target.value})} />
              </div>
            </div>
            
            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Article Date</label>
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Publish Date & Time (Schedule)</label>
                <input type="datetime-local" className="form-control" value={formData.publishDate} onChange={e => setFormData({...formData, publishDate: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image URLs</label>
              {formData.imageUrls.map((url, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    className="form-control" 
                    placeholder="Image URL" 
                    value={url} 
                    onChange={e => {
                      const newUrls = [...formData.imageUrls];
                      newUrls[idx] = e.target.value;
                      setFormData({...formData, imageUrls: newUrls});
                    }} 
                  />
                  {idx === formData.imageUrls.length - 1 && (
                    <button type="button" className="btn btn-outline" onClick={() => setFormData({...formData, imageUrls: [...formData.imageUrls, '']})}>+</button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}>
                <option value="">-- Select a Category --</option>
                <option value="Politics">Politics</option>
                <option value="Economy">Economy</option>
                <option value="Technology">Technology</option>
                <option value="Pop & Art">Pop & Art</option>
              </select>
            </div>

            {[1, 2, 3].map(level => (
              <div key={level} style={{ background: '#f5f5f5', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
                <h3>Level {level} Content</h3>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Text</label>
                  <textarea className="form-control" rows="5" value={formData.levels[level].text} onChange={e => handleLevelTextChange(level, e.target.value)} required />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4>Vocabulary</h4>
                  {(formData.levels[level].vocabulary || []).map((v, vIdx) => (
                    <div key={vIdx} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input className="form-control" placeholder="Term" value={v.term} onChange={e => updateVocabulary(level, vIdx, 'term', e.target.value)} />
                      <input className="form-control" placeholder="Meaning" value={v.meaning} onChange={e => updateVocabulary(level, vIdx, 'meaning', e.target.value)} />
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline" style={{ marginTop: '10px' }} onClick={() => addVocabulary(level)}>+ Add Vocabulary</button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4>Questions</h4>
                  {formData.levels[level].questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '10px', background: '#fff', borderRadius: '4px' }}>
                      <input className="form-control" placeholder="Question?" value={q.question} onChange={e => updateQuestion(level, qIdx, 'question', e.target.value)} style={{ marginBottom: '10px' }} />
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <input type="radio" name={`correct_${level}_${qIdx}`} checked={q.correctIndex === optIdx} onChange={() => updateQuestion(level, qIdx, 'correctIndex', optIdx)} />
                          <input className="form-control" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={e => updateQuestion(level, qIdx, `option_${optIdx}`, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline" style={{ marginTop: '10px' }} onClick={() => addQuestion(level)}>+ Add Question</button>
                </div>
              </div>
            ))}

            <button type="submit" className="btn" disabled={saving} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
              {saving ? 'Saving...' : (editingId ? 'Update Article' : 'Publish Article')}
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#ef4444', fontFamily: '"DM Serif Display", serif', fontWeight: '400' }}>Confirm Deletion</h3>
            <p style={{ margin: '1rem 0' }}>Are you sure you want to delete <strong>{articleToDelete.title}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" onClick={() => setArticleToDelete(null)}>Cancel</button>
              <button className="btn" style={{ background: '#ef4444', color: '#fff', border: 'none', boxShadow: '0 4px 10px rgba(239,68,68,0.2)' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
