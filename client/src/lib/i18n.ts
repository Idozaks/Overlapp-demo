import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../translations/en.json';
import he from '../translations/he.json';
import ar from '../translations/ar.json';
import ru from '../translations/ru.json';
import fr from '../translations/fr.json';
import es from '../translations/es.json';

const resources = {
  en: { translation: en },
  he: { translation: he },
  ar: { translation: ar },
  ru: { translation: ru },
  fr: { translation: fr },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
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
const setInitialDirection = () => {
  const rtlLanguages = ['he', 'ar'];
  document.documentElement.dir = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
  document.documentElement.lang = i18n.language;
};

setInitialDirection();

i18n.on('languageChanged', (lng) => {
  const rtlLanguages = ['he', 'ar'];
  document.documentElement.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;