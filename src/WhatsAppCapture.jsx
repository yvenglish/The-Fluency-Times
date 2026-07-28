import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import confetti from 'canvas-confetti';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
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
          Número cadastrado com sucesso! Congratulations 🎉
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', textAlign: 'left' }}>
            <PhoneInput
              country={'br'}
              value={phone}
              onChange={phone => setPhone(phone)}
              inputStyle={{ width: '100%', height: '44px', fontSize: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              buttonStyle={{ borderRadius: '8px 0 0 8px', border: '1px solid var(--border)', background: '#fff' }}
              placeholder="Seu número de WhatsApp"
            />
          </div>
          <button type="submit" className="btn" style={{ height: '44px' }}>Inscrever-se</button>
        </form>
      )}
    </div>
  );
}
