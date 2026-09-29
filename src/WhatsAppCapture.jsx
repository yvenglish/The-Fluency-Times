import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import confetti from 'canvas-confetti';
import { useLanguage } from './LanguageContext';

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
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !name) return;
    try {
      await addDoc(collection(db, 'leads'), {
        name: name,
        lastName: lastName,
        phone: `${countryCode} ${phone}`,
        date: new Date().toISOString(),
        language: language
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

  const titleText = language === 'es' 
    ? "¿Quieres recibir notificaciones por WhatsApp cuando lleguen noticias y así perfeccionar de verdad tu español?" 
    : "Quer receber notificação pelo WhatsApp quando chegar notícia e assim aperfeiçoar de verdade seu inglês?";
    
  const successText = language === 'es' 
    ? "¡Inscripción realizada con éxito! ¡Felicidades! 🎉" 
    : "Inscrição realizada com sucesso! Congratulations 🎉";

  const placeholderText = language === 'es' ? "Tu número" : "Seu número";
  const namePlaceholder = language === 'es' ? "Nombre" : "Nome";
  const lastNamePlaceholder = language === 'es' ? "Apellido" : "Sobrenome";
  const btnText = language === 'es' ? "Inscribirse" : "Inscrever-se";

  const inputStyle = { flex: 1, padding: '0 15px', border: '1px solid var(--border)', borderRadius: '8px', height: '44px', fontSize: '1rem', outline: 'none', width: '100%', color: '#333' };

  return (
    <div className="whatsapp-capture" style={{ background: language === 'es' ? '#2B1823' : 'var(--bg)' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: language === 'es' ? 'var(--gold)' : 'var(--pur-dark)' }}>
        {titleText}
      </h3>
      {submitted ? (
        <div style={{ padding: '1rem', background: language === 'es' ? '#166534' : '#dcfce7', color: language === 'es' ? '#dcfce7' : '#166534', borderRadius: '8px', fontWeight: 'bold' }}>
          {successText}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder={namePlaceholder} 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={inputStyle}
            />
            <input 
              type="text" 
              placeholder={lastNamePlaceholder} 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', textAlign: 'left', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
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
              placeholder={placeholderText} 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
              style={{ flex: 1, padding: '0 15px', border: 'none', height: '44px', fontSize: '1rem', outline: 'none', width: '100%', color: '#333' }}
            />
          </div>
          <button type="submit" className="btn" style={{ height: '48px', fontSize: '1.1rem', marginTop: '0.5rem' }}>{btnText}</button>
        </form>
      )}
    </div>
  );
}
