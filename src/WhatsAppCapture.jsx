import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import confetti from 'canvas-confetti';

const countries = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+34', flag: '🇪🇸', name: 'Espanha' },
  { code: '+33', flag: '🇫🇷', name: 'França' },
  { code: '+49', flag: '🇩🇪', name: 'Alemanha' },
  { code: '+39', flag: '🇮🇹', name: 'Itália' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
];

export default function WhatsAppCapture() {
  const [countryCode, setCountryCode] = useState('+55');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return;
    try {
      await addDoc(collection(db, 'leads'), {
        phone: `${countryCode} ${phone}`,
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
          <div style={{ display: 'flex', flex: 1, minWidth: '250px', textAlign: 'left', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <select 
              value={countryCode} 
              onChange={e => setCountryCode(e.target.value)}
              style={{ padding: '0 10px', border: 'none', background: '#f9fafb', borderRight: '1px solid var(--border)', fontSize: '1.1rem', outline: 'none', cursor: 'pointer' }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input 
              type="tel" 
              placeholder="Seu número" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
              style={{ flex: 1, padding: '0 15px', border: 'none', height: '44px', fontSize: '1rem', outline: 'none', width: '100%' }}
            />
          </div>
          <button type="submit" className="btn" style={{ height: '44px' }}>Inscrever-se</button>
        </form>
      )}
    </div>
  );
}
