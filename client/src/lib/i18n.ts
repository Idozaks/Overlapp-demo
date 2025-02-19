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
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
