"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const translations: Record<string, { heading: string; description: string }> = {
  en: {
    heading: 'Choose Your Language',
    description: 'Select a language to preview how the interface could look. This is a preview and does not translate the entire app yet.',
  },
  hi: {
    heading: 'अपनी भाषा चुनें',
    description: 'यहाँ भाषा चुनें और इंटरफेस कैसे दिखेगा इसका पूर्वावलोकन करें। यह केवल पूर्वावलोकन है, पूरा ऐप अभी अनुवादित नहीं है।',
  },
  es: {
    heading: 'Elige tu idioma',
    description: 'Selecciona un idioma para obtener una vista previa de cómo podría verse la interfaz. Esta es una vista previa y aún no traduce toda la aplicación.',
  },
};

export default function LanguagesPage() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('preferredLang');
    if (stored) setLang(stored);
  }, []);

  const handleSetLang = (code: string) => {
    setLang(code);
    localStorage.setItem('preferredLang', code);
  };

  const t = translations[lang as keyof typeof translations] ?? translations.en;

  return (
    <div className="mx-auto max-w-3xl py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">{t.heading}</h1>
      <p className="text-gray-300 max-w-prose">{t.description}</p>
      <div className="flex gap-4 mt-4">
          <Button variant={lang === 'en' ? 'primary' : 'secondary'} onClick={() => handleSetLang('en')}>
            English
          </Button>
          <Button variant={lang === 'hi' ? 'primary' : 'secondary'} onClick={() => handleSetLang('hi')}>
            हिंदी
          </Button>
          <Button variant={lang === 'es' ? 'primary' : 'secondary'} onClick={() => handleSetLang('es')}>
            Español
          </Button>
      </div>
      <div className="mt-8 p-4 border border-surface-300 rounded-lg bg-surface-200">
        <p className="text-gray-300">
          {lang === 'en' && 'Hello! This is a demonstration of how localized content might appear.'}
          {lang === 'hi' && 'नमस्ते! यह localized सामग्री कैसे दिख सकती है इसका प्रदर्शन है।'}
          {lang === 'es' && '¡Hola! Esta es una demostración de cómo podría aparecer contenido localizado.'}
        </p>
      </div>
    </div>
  );
}