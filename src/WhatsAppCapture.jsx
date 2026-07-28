import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function WhatsAppCapture() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return;
    try {
      await addDoc(collection(db, 'leads'), {
        phone,
        date: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="whatsapp-capture">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--pur-dark)' }}>
        Quer receber notificação pelo WhatsApp quando chegar notícia e assim aperfeiçoar de verdade seu inglês?
      </h3>
      {submitted ? (
        <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: 'bold' }}>
          Número cadastrado com sucesso! 🎉
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input 
            type="tel" 
            placeholder="Seu número (com DDD)" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
            className="form-control"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button type="submit" className="btn">Inscrever-se</button>
        </form>
      )}
    </div>
  );
}
