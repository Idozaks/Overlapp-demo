import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../translations/en.json';
import he from '../translations/he.json';
import ar from '../translations/ar.json';
import ru from '../translations/ru.json';
import fr from '../translations/fr.json';
import es from '../translations/es.json';

// Define RTL languages for easier reference throughout the app
export const RTL_LANGUAGES = ['he', 'ar'];

// Helper function to check if a language is RTL
export const isRTL = (language: string) => RTL_LANGUAGES.includes(language);

const resources = {
  en: { translation: en },
  he: { translation: he },
  ar: { translation: ar },
  ru: { translation: ru },
  fr: { translation: fr },
  es: { translation: es },
};

// Get language from local storage or use system default
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) return savedLanguage;
  
  // Check if browser language includes Hebrew
  const browserLang = navigator.language;
  if (browserLang.includes('he')) return 'he';
  
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // prevents issues with SSR and suspense
    },
    load: 'languageOnly', // ignore region-specific variants
    supportedLngs: ['en', 'he', 'ar', 'ru', 'fr', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Set the initial HTML dir attribute based on the current language
const setDirectionAndLang = (language: string) => {
  document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  // Add or remove a CSS class to the document for additional RTL-specific styling
  if (isRTL(language)) {
    document.documentElement.classList.add('rtl-layout');
  } else {
    document.documentElement.classList.remove('rtl-layout');
  }
};

// Set initial direction
setDirectionAndLang(i18n.language);

// Update direction when language changes
i18n.on('languageChanged', (lng) => {
  setDirectionAndLang(lng);
});

export default i18n;