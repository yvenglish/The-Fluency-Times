import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Admin() {
  const [formData, setFormData] = useState({
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
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleLevelTextChange = (level, text) => {
    setFormData(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: { ...prev.levels[level], text }
      }
    }));
  };

  const addQuestion = (level) => {
    setFormData(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: {
          ...prev.levels[level],
          questions: [...prev.levels[level].questions, { question: '', options: ['', '', ''], correctIndex: 0 }]
        }
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
      return {
        ...prev,
        levels: {
          ...prev.levels,
          [level]: { ...prev.levels[level], questions: newQuestions }
        }
      };
    });
  };

  const addVocabulary = (level) => {
    setFormData(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: {
          ...prev.levels[level],
          vocabulary: [...(prev.levels[level].vocabulary || []), { term: '', meaning: '' }]
        }
      }
    }));
  };

  const updateVocabulary = (level, vIndex, field, value) => {
    setFormData(prev => {
      const newVocab = [...(prev.levels[level].vocabulary || [])];
      newVocab[vIndex][field] = value;
      return {
        ...prev,
        levels: {
          ...prev.levels,
          [level]: { ...prev.levels[level], vocabulary: newVocab }
        }
      };
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
      await addDoc(collection(db, 'articles'), payload);
      setMessage('Article successfully added!');
      // Reset mostly
      setFormData(prev => ({ ...prev, title: '', source: '', sourceLink: '', imageUrls: [''], tags: '', levels: { 1: { text: '', questions: [], vocabulary: [] }, 2: { text: '', questions: [], vocabulary: [] }, 3: { text: '', questions: [], vocabulary: [] } } }));
    } catch (error) {
      console.error(error);
      setMessage('Error adding article: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h2 className="article-title">Add New Article</h2>
      {message && <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1rem' }}>{message}</div>}
      
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
          <label className="form-label">Tags (comma separated)</label>
          <input className="form-control" placeholder="e.g. politics, economy" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
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
                <div key={qIdx} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '10px', background: '#fff' }}>
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

        <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Publish Article'}</button>
      </form>
    </div>
  );
}

export default Admin;
