"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  SUPPORTED_LANGUAGES,
  normalizeLanguageCode,
  type SupportedLanguageCode,
} from '@/lib/languages';

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
  fr: {
    heading: 'Choisissez votre langue',
    description: 'Sélectionnez une langue pour prévisualiser l’interface. Ceci est un aperçu et ne traduit pas encore toute l’application.',
  },
  de: {
    heading: 'Wähle deine Sprache',
    description: 'Wähle eine Sprache, um eine Vorschau der Oberfläche zu sehen. Dies ist eine Vorschau und übersetzt noch nicht die gesamte App.',
  },
};

export default function LanguagesPage() {
  const [lang, setLang] = useState<SupportedLanguageCode>('en');

  useEffect(() => {
    const stored = localStorage.getItem('preferredLang');
    if (stored) setLang(normalizeLanguageCode(stored));
  }, []);

  const handleSetLang = (code: string) => {
    const nextLanguage = normalizeLanguageCode(code);
    setLang(nextLanguage);
    localStorage.setItem('preferredLang', nextLanguage);
  };

  const t = translations[lang as keyof typeof translations] ?? translations.en;

  return (
    <div className="mx-auto max-w-3xl py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">{t.heading}</h1>
      <p className="text-gray-300 max-w-prose">{t.description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {SUPPORTED_LANGUAGES.map((language) => (
          <Button
            key={language.code}
            variant={lang === language.code ? 'primary' : 'secondary'}
            onClick={() => handleSetLang(language.code)}
          >
            {language.nativeLabel}
          </Button>
        ))}
      </div>
      <div className="mt-8 p-4 border border-surface-300 rounded-lg bg-surface-200">
        <p className="text-gray-300">
          {lang === 'en' && 'Hello! This is a demonstration of how localized content might appear.'}
          {lang === 'hi' && 'नमस्ते! यह localized सामग्री कैसे दिख सकती है इसका प्रदर्शन है।'}
          {lang === 'es' && '¡Hola! Esta es una demostración de cómo podría aparecer contenido localizado.'}
          {lang === 'fr' && 'Bonjour ! Ceci montre comment le contenu localisé pourrait apparaître.'}
          {lang === 'de' && 'Hallo! Dies zeigt, wie lokalisierte Inhalte aussehen könnten.'}
        </p>
      </div>
    </div>
  );
}
