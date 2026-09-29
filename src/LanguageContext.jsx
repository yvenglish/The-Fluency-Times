import { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('fluency_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('fluency_language', language);
    const favicon = document.querySelector("link[rel~='icon']");
    if (language === 'es') {
      document.body.classList.add('theme-es');
      if (favicon) favicon.href = "/logobranca.png";
    } else {
      document.body.classList.remove('theme-es');
      if (favicon) favicon.href = "/logocircular_transparente.png";
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'es' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
